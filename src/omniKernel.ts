import Runner from '@/elements/runner';
import Store from '@/elements/store';
import tokenizer from '@/utilities/tokenizer';

export default class OmniKernel {
	private facadeMap: Map<string, GeneralElement> = new Map();
	facade = (() => {}) as Facade;
	register(toRegister: unknown, additionalMeta?: Meta) {
		const tokens = tokenizer(toRegister);
		tokens.forEach(token => {
			const { crumb, name, isRoot } = resolvePath(token.path);
			const parentFacade = this.walker(crumb);
			const element = allocator(token.label, token.value);
			this.registerAt(parentFacade, element, name, additionalMeta, isRoot);
		});
	}

	registerAt(
		parentFacade: Facade,
		element: GeneralElement,
		name?: string,
		additionalMeta?: Meta,
		isRoot: boolean = false,
	) {
		const id = isRoot ? 'facade' : generateId();
		const facadeFunction = facadeFunc(id, this.facadeMap);

		if ('facadePosition' in element.meta) element.meta.facadePosition = facadeFunction;
		if ('entireFacade' in element.meta) element.meta.entireFacade = this.facade;
		if (additionalMeta) element.meta = { ...element.meta, ...additionalMeta };
		this.facadeMap.set(id, element);

		if (name && name in parentFacade) transplant(facadeFunction, parentFacade[name]);
		else if (!name) transplant(facadeFunction, parentFacade);

		if (isRoot) this.facade = facadeFunction;
		else if (!name) parentFacade = facadeFunction;
		else parentFacade[name] = facadeFunction;

		if (element.meta.connectedCallback) element.meta.connectedCallback();
	}

	private walker(crumb: Array<string>) {
		let currentBranch = this.facade;
		crumb.forEach(crumb => {
			if (!(crumb in currentBranch))
				currentBranch[crumb] = facadeFunc('placeholder', this.facadeMap);
			currentBranch = currentBranch[crumb];
		});
		return currentBranch;
	}

	normalize(toNormalize: Facade) {
		let self: unknown;
		const children: GeneralObject = {};

		// self
		if (toNormalize.name !== 'placeholder') {
			const node = this.facadeMap.get(toNormalize.name);
			if (!node) {
				if (toNormalize.name !== 'facade') throw new Error(`Node ${toNormalize.name} not found.`);
			} else {
			if (node.meta.normalizeCallback) self = node.meta.normalizeCallback();
			else if ('normalize' in node.meta) self = node.meta.normalize;
			else self = node;
			}
		}

		// children
		Object.keys(toNormalize).forEach(key => {
			children[key] = this.normalize(toNormalize[key]);
		});

		if (Object.keys(children).length === 0) return self;
		else if (!self) return children;
		else return { _self: self, ...children };
	}
}

function transplant(newOne: Facade, oldOne: Facade) {
	Object.keys(oldOne).forEach(key => {
		newOne[key] = oldOne[key];
	});
}

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

function generateId(length = 10) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const array = new Uint8Array(length);
	crypto.getRandomValues(array); // Cryptographically strong values
	return Array.from(array, byte => chars[byte % chars.length]).join('');
}

function resolvePath(path: string) {
	const crumb = path.split('.');
	if (crumb[0] === 'root') crumb.shift();
	const name = crumb.pop();
	return {
		crumb,
		name,
		isRoot: !crumb[0] && !name,
	};
}

function facadeFunc(funcName: string, facadeMap: Map<string, GeneralElement>) {
	const middleware = {
		[funcName](...args: Array<unknown>) {
			if (funcName === 'placeholder') {
				console.warn(`OmniKernel: ${funcName} is a placeholder function.`);
				return;
			}
			const node = facadeMap.get(funcName);
			if (!node) throw new Error(`Middleware ${funcName} not found.`);
			if (node.meta.facade) return node.meta.facade(...args);
			else return node;
		},
	};
	return middleware[funcName] as Facade;
}
