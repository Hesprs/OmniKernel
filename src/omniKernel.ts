import Runner from '@/elements/runner';
import Store from '@/elements/store';
import tokenizer from '@/utilities/tokenizer';
import type { GeneralFunction, GeneralObject, labelerResult } from './declarations';

export default class OmniKernel {
	private facadeMap: Map<string, GeneralElement> = new Map();
	facade = facadeFunc('facade', this.facadeMap);

	// register elements recursively
	register(toRegister: unknown, additionalMeta?: Meta) {
		const tokens = tokenizer(toRegister);
		tokens.forEach(token => {
			const facadeList = this.walker(token.path);
			const element = allocator(token.label, token.value);
			this.registerAt(
				facadeList,
				element,
				token.path[token.path.length - 1] || 'facade',
				additionalMeta,
			);
		});
	}

	// register an element at a given path
	private registerAt(
		facadeList: Array<Facade>,
		element: GeneralElement,
		keyName: string,
		additionalMeta?: Meta,
	) {
		if (additionalMeta) element.meta = { ...element.meta, ...additionalMeta };

		const id = facadeList[0].name;
		const toReplace = this.facadeMap.get(id);
		if (toReplace?.meta.onDisconnected) toReplace.meta.onDisconnected();
		this.facadeMap.set(id, element);
		injector(element, { facadeList, Kernel: this, keyName });
	}

	// walk the tree to return the parent facade
	private walker(path: Array<string>) {
		let currentBranch = this.facade;
		const pathList: Array<Facade> = [];
		path.forEach(crumb => {
			if (!(crumb in currentBranch)) currentBranch[crumb] = facadeFunc(generateId(), this.facadeMap);
			pathList.push(currentBranch);
			currentBranch = currentBranch[crumb];
		});
		pathList.push(currentBranch);
		return pathList.reverse();
	}

	// convert facade to plain object
	normalize(toNormalize: Facade) {
		let self: unknown;
		const children: GeneralObject = {};

		// self
		const node = this.facadeMap.get(toNormalize.name);
		if (node) {
			const func = node.meta.onNormalize;
			if (func) {
				if (typeof func === 'function') self = func();
				else self = func;
			} else if ('normalize' in node.meta) self = node.meta.normalize;
			else self = node;
		}

		// children
		Object.keys(toNormalize).forEach(key => {
			children[key] = this.normalize(toNormalize[key]);
		});

		if (Object.keys(children).length === 0) return self;
		else if (!self) return children;
		else return { _self: self, ...children };
	}

	delete(toDelete: Facade) {
		if (toDelete.name === 'facade') {
			console.warn(`[OmniKernel] Cannot delete the root facade.`);
			return;
		}
		Object.values(toDelete).forEach(element => {
			this.delete(element);
		});
		const realToDelete = this.facadeMap.get(toDelete.name);
		if (realToDelete) {
			if (realToDelete.meta.onDisconnected) realToDelete.meta.onDisconnected();
			if (realToDelete.meta.parentFacade) realToDelete;
		}
		this.facadeMap.delete(toDelete.name);
		delete realToDelete?.meta.parentFacade?.[realToDelete?.meta.name];
	}
}

// copy give context to an element when added into facade
function injector(
	element: GeneralElement,
	context: {
		facadeList: Array<Facade>;
		Kernel: OmniKernel;
		keyName: string;
	},
) {
	element.meta.thisFacade = context.facadeList[0];
	if (context.facadeList[0].name !== 'facade') element.meta.parentFacade = context.facadeList[1];
	element.meta.Kernel = context.Kernel;
	element.meta.name = context.keyName;
	if (element.meta.onConnected) element.meta.onConnected();
}

// instantiate elements to be merged
function allocator(label: labelerResult, value: unknown) {
	switch (label) {
		case 'preserved':
			return value as GeneralElement;
		case 'default:store':
			return new Store(value);
		case 'default:runner':
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
function facadeFunc(funcName: string, facadeMap: Map<string, GeneralElement>) {
	const middleware = {
		[funcName](...args: Array<unknown>) {
			const node = facadeMap.get(funcName);
			if (!node) {
				console.warn(`[OmniKernel] ${funcName} is a placeholder facade.`);
				return;
			}
			if (node.meta.facadeOverride) return node.meta.facadeOverride(...args);
			else return node;
		},
	};
	return middleware[funcName] as Facade;
}
