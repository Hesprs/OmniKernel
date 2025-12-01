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
			const { crumb, name } = resolvePath(token.path);
			const parentFacade = this.walker(crumb);
			const element = allocator(token.label, token.value);
			this.registerAt(parentFacade, element, name, additionalMeta);
		});
	}

	// register an element at a given path
	private registerAt(parentFacade: Facade, element: GeneralElement, name: string, additionalMeta?: Meta) {

		if (additionalMeta) element.meta = { ...element.meta, ...additionalMeta };

		// replace old element
		if (name in parentFacade) this.facadeMap.set(parentFacade[name].name, element); 
		else {
			// create new facade and element
			const id = generateId();
			this.facadeMap.set(id, element);
			parentFacade[name] = facadeFunc(id, this.facadeMap);
		}
		injector(element, { thisFacade: parentFacade[name], parentFacade });

		if (element.meta.connectedCallback) element.meta.connectedCallback();
	}

	// walk the tree to return the parent facade
	private walker(crumb: Array<string>) {
		let currentBranch = this as unknown as Facade;
		crumb.forEach(crumb => {
			if (!(crumb in currentBranch)) currentBranch[crumb] = facadeFunc(generateId(), this.facadeMap);
			currentBranch = currentBranch[crumb];
		});
		return currentBranch;
	}

	// convert facade to plain object
	normalize(toNormalize: Facade) {
		let self: unknown;
		const children: GeneralObject = {};

		// self
		if (toNormalize.name !== 'placeholder') {
			const node = this.facadeMap.get(toNormalize.name);
			if (node) {
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

// copy give context to an element when added into facade
function injector(element: GeneralElement, context: {
	thisFacade: Facade,
	parentFacade: Facade,
}) {
	if ('thisFacade' in element.meta) element.meta.thisFacade = context.thisFacade;
	if ('parentFacade' in element.meta) {
		if (context.thisFacade.name !== 'facade') element.meta.parentFacade = context.parentFacade;
		else if (!element.meta.silent) console.warn(`[OmniKernel] Root facade cannot have a parent facade.`);
	}
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

// separate path into crumb and name
function resolvePath(path: string) {
	const crumb = path.split('.');
	const name = crumb.pop() as string;
	return {
		crumb,
		name,
	};
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
			if (node.meta.facade) return node.meta.facade(...args);
			else return node;
		},
	};
	return middleware[funcName] as Facade;
}
