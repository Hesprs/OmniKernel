import { createAmoeba } from './utilities.ts';
import hook from './amoebas/hook.ts';

export class OmniKernel {
	private root = createAmoeba({
		_run() {
			console.log('Hello from OmniKernel!');
		},
		_register: (toMerge: object | Amoeba) => deepMerge(this.root, toMerge),
		_loadModule: (module: Module) => {
			if (isClass(module)) new (module as GeneralClass)(this.root);
			else (module as GeneralFunction)(this.root);
		},
		allModuleLoaded: hook(),
		allModuleLoadedAsync: hook({ async: true }),
	});
	constructor(modules: Array<Module> = []) {
		modules.forEach(module => this.root._loadModule(module));
		this.root.allModuleLoaded();
		this.root.allModuleLoadedAsync();
		// @ts-ignore
		return this.root;
	}
}

export function isAmoeba(toCheck: any) {
	return typeof toCheck === 'function' && toCheck._sig;
}
export function isObject(toCheck: any) {
	return typeof toCheck === 'object' && !Array.isArray(toCheck) && toCheck !== null && toCheck.constructor === Object;
}
export function isClass(toCheck: any) {
	return typeof toCheck === 'function' && toCheck.toString().startsWith('class ');
}

function deepMerge(main: Amoeba, toMerge: any, priority: Array<string> = ['hook', 'api', 'default:runner', 'default:getter', 'default:value', 'value', 'default:undefined']) {
	const mainLabel = labeler(main);
	const toMergeLabel = labeler(toMerge);
	let todo: 'replace' | 'set' | 'omit' = 'omit';

	if (toMergeLabel !== 'default:undefined') for (const label in priority) {
		if (priority[label] === toMergeLabel) {
			todo = 'replace';
			break;
		}
		if (priority[label] === mainLabel) {
			todo = 'set';
			break;
		}
	}

	if (todo === 'replace') {
		// direct replace
		const amoebaToMerge = createAmoeba(toMerge, false);
		if (amoebaToMerge._beforeMerge) amoebaToMerge._beforeMerge(main);
		if (main._beforeDispose) main._beforeDispose();
		// clean up main
		for (const key in main) if (key.startsWith('_')) delete main[key];
		// replace with toMerge
		for (const key in toMerge) if (key.startsWith('_')) main[key] = toMerge[key];
	} else if (todo === 'set') main(toMerge, 'set'); // set main value

	// recursion for children
	if (toMergeLabel === 'value') return;
	for (const key of Object.keys(toMerge)) {
		if (key.startsWith('_')) continue;
		const toMergeValue = toMerge[key];
		// Overlap - recursion
		if (key in main) deepMerge(main[key], toMergeValue, priority);
		// New property - add directly
		else main[key] = createAmoeba(toMergeValue);
	}
}

function labeler(toLabel: any) {
	let result: string;
	if (isAmoeba(toLabel)) {
		const amoeba = toLabel as Amoeba;
		if (amoeba._sig === 'default') {
			if ('_run' in amoeba) result = 'default:runner';
			else if ('_get' in amoeba) result = 'default:getter';
			else if ('_value' in amoeba) result = 'default:value';
			else result = 'default:undefined';
		} else result = amoeba._sig;
	} else if (isObject(toLabel)) {
		const object = toLabel as object;
		if ('_sig' in object) result = object._sig as string;
		else if ('_run' in object) result = 'default:runner';
		else if ('_get' in object) result = 'default:getter';
		else if ('_value' in object) result = 'default:value';
		else result = 'default:undefined';
	} else result = 'value';
	return result;
}
