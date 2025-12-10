import type {
	FacadeMap,
	GeneralArguments,
	GeneralConstructor,
	GeneralFunction,
	GeneralObject,
	labelerResult,
	Manifest,
	Meta,
	Unit,
} from '@/declarations';
import Runner from '@/elements/runner';
import Store from '@/elements/store';
import type { OmniFacadeElement, OmniUnit } from '@/utilities/baseClasses';
import depResolver from '@/utilities/depResolver';
import { getManifest } from '@/utilities/manifest';
import { tokenizer } from '@/utilities/tokenizer';

export default class OmniKernel {
	// Objects are more optimized for string lookup (although insignificant)
	private facadeMap: FacadeMap = Object.create(null);

	constructor(toRecord?: Array<GeneralConstructor<OmniUnit>>) {
		if (toRecord)
			toRecord.forEach(unit => {
				this.record(unit);
			});
	}

	// #region units
	private units: Record<string, Unit> = {};
	record(element: GeneralConstructor<OmniUnit>) {
		const manifest = getManifest(element) as Manifest;
		if (!manifest)
			throw new Error(
				`"${element.name}" is not a facade unit, consider using @manifest decorator to give it a name.`,
			);
		const name = manifest.name;
		this.units[name] = {
			element,
			facade: facadeFunc(this.facadeMap),
			initiated: false,
		};
		if (manifest.dependsOn) this.units[name].dependsOn = manifest.dependsOn;
		if (manifest.requires) this.units[name].requires = manifest.requires;
	}

	bringUp(shouldBringUp: Array<string> = Object.keys(this.units), additionalMeta?: Meta) {
		const order = depResolver(this.units, shouldBringUp);
		order.forEach(name => {
			const target = this.units[name];
			if (target.initiated) return;
			target.initiated = true;
			new target.element(
				target.facade,
				this.collectDepAndRequire(name),
				this,
				additionalMeta,
				this.facadeMap,
			);
		});
	}

	shutDown(shouldShutDown: Array<string> = Object.keys(this.units)) {
		const order = depResolver(this.units, shouldShutDown).reverse();
		order.forEach(name => {
			const target = this.units[name];
			if (!target.initiated) return;
			target.initiated = false;
			this.delete(target.facade);
		});
	}
	// #endregion ===============================================================

	// #region Register
	register(toRegister: unknown, baseFacade: Facade, additionalMeta?: Meta) {
		const tokens = tokenizer(toRegister);
		tokens.forEach(token => {
			this.registerAt(
				this.walker(token.path, baseFacade),
				allocator(token.label, token.value),
				token.path[token.path.length - 1] || 'facade',
				additionalMeta,
			);
		});
	}

	// register an element at a given path
	private registerAt(
		facades: Array<Facade>,
		element: OmniFacadeElement,
		keyName: string,
		additionalMeta?: Meta,
	) {
		if (additionalMeta) Object.assign(element.meta, additionalMeta);

		const id = facades[0].name;
		const toReplace = this.facadeMap[id] as OmniFacadeElement;
		if (toReplace?.meta.irreplaceable) {
			if (!toReplace.meta.silent) console.warn(`[OmniKernel] Element "${keyName}" is irreplaceable.`);
			return;
		}

		let callerArgsList: GeneralArguments | undefined;
		if (toReplace?.meta.caller) {
			const args = facades[0]();
			callerArgsList = Array.isArray(args) ? args : [args];
		}

		if (toReplace?.onDisconnected) toReplace.onDisconnected();
		this.facadeMap[id] = element;
		injector(element, { facades, Kernel: this, keyName });

		if (callerArgsList) facades[0](...callerArgsList);
	}
	// #endregion ===============================================================

	// #region Register Call
	// call the facades at given paths
	registerCall(toRegister: unknown, baseFacade: Facade) {
		const tokens = tokenizer(toRegister);
		tokens.forEach(token => {
			const facades = this.walker(token.path, baseFacade);
			this.registerCallAt(facades, token.value, token.path[token.path.length - 1] || 'facade');
		});
	}

	// call or register an element at a given path
	private registerCallAt(facades: Array<Facade>, args: unknown, keyName: string) {
		const targetFacade = facades[0];
		const toCall = this.facadeMap[targetFacade.name];
		// if the element exists, call it, else create a caller store
		if (toCall) {
			const argsList = Array.isArray(args) ? args : [args];
			targetFacade(...argsList);
		} else this.registerAt(facades, new Store(args), keyName, { caller: true });
	}
	// #endregion ===============================================================

	// #region Public Helpers
	// convert facade to plain object
	normalize(toNormalize: Facade) {
		let self: unknown;
		const children: GeneralObject = {};

		// self
		const node = this.facadeMap[toNormalize.name];
		if (node) {
			const func = node.onNormalize;
			if (func) {
				if (typeof func === 'function') self = func();
				else self = func;
			} else if ('normalize' in node) self = node.normalize;
			else self = node;
		}

		// children
		Object.keys(toNormalize).forEach(key => {
			children[key] = this.normalize(toNormalize[key]);
		});

		if (Object.keys(children).length === 0) return self;
		if (self) Object.assign(children, { value: self });
		return children;
	}

	delete(toDelete: Facade) {
		const realToDelete = this.facadeMap[toDelete.name] as OmniFacadeElement & OmniUnit;
		if (!realToDelete) return;
		if (realToDelete.onDisconnected) realToDelete.onDisconnected();
		if (realToDelete.dispose) realToDelete.dispose();
		Object.values(toDelete).forEach(element => {
			this.delete(element);
		});
		delete this.facadeMap[toDelete.name];
		const parent = realToDelete.facades?.[1];
		if (parent) delete parent[realToDelete.facadeName];
	}

	getRunningUnits() {
		const result: Record<string, Facade> = {};
		Object.keys(this.units).forEach(unitName => {
			const unit = this.units[unitName];
			if (unit.initiated) result[unitName] = unit.facade;
		});
		return result;
	}

	getElementInstance(facade: Facade): OmniFacadeElement | OmniUnit | undefined {
		return this.facadeMap[facade.name];
	}
	// #endregion ===============================================================

	// #region Private Helpers
	private collectDepAndRequire(target: string) {
		const result: Record<string, Facade> = {};
		const inUnits = this.units[target];
		[...(inUnits.dependsOn || []), ...(inUnits.requires || [])].forEach(dep => {
			result[dep] = this.units[dep].facade;
		});
		return result;
	}

	// walk the tree to return the facades hierarchy
	private walker(path: Array<string>, baseFacade: Facade) {
		let currentBranch = baseFacade;
		const pathList: Array<Facade> = [];
		path.forEach(crumb => {
			if (!(crumb in currentBranch)) currentBranch[crumb] = facadeFunc(this.facadeMap);
			pathList.push(currentBranch);
			currentBranch = currentBranch[crumb];
		});
		pathList.push(currentBranch);
		return pathList.reverse();
	}
	// #endregion ===============================================================
}

// copy give context to an element when added into facade
function injector(
	element: OmniFacadeElement,
	context: {
		facades: Array<Facade>;
		Kernel: OmniKernel;
		keyName: string;
	},
) {
	element.facadeInjections.facades = context.facades;
	element.facadeInjections.Kernel = context.Kernel;
	element.facadeInjections.facadeName = context.keyName;
	if (element.onConnected) element.onConnected();
}

// instantiate elements to be merged
function allocator(label: labelerResult, value: unknown) {
	switch (label) {
		case 'preserved':
			return value as OmniFacadeElement;
		case 'store':
			return new Store(value);
		case 'runner':
			return new Runner(value as GeneralFunction);
	}
}

// generate random id used in facadeMap
function generateId(length = 10) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const array = new Uint8Array(length);
	crypto.getRandomValues(array); // Cryptographically strong values
	return Array.from(array, byte => chars[byte % chars.length]).join('');
}

// create facade function
function facadeFunc(facadeMap: FacadeMap, funcName: string = generateId()) {
	const middleware = {
		[funcName](...args: Array<unknown>) {
			const node = facadeMap[funcName];
			if (!node) {
				console.warn(`[OmniKernel] "${funcName}" is a placeholder facade.`);
				return;
			}
			if (node.facadeOverride) return node.facadeOverride(...args);
			else return node;
		},
	};
	return middleware[funcName] as Facade;
}
