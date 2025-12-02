import type { GeneralObject, labelerResult } from '../declarations';

function isObject(toCheck: unknown) {
	return typeof toCheck === 'object' && toCheck !== null && !Array.isArray(toCheck);
}

export default function tokenizer(toTokenize: unknown, currentPath: Array<string> = []) {
	let result: Array<{ label: labelerResult; path: Array<string>; value: unknown }> = [];
	function push(label: ReturnType<typeof labeler>, path: Array<string>, value: unknown) {
		if (label !== 'placeholder') result.push({ label, path, value });
	}

	if (isObject(toTokenize)) {
		const toAddLabel = labeler(toTokenize, true);
		push(toAddLabel, currentPath, toTokenize);
		if (toAddLabel !== 'preserved') {
			Object.keys(toTokenize as GeneralObject).forEach(key => {
				result = [...result, ...tokenizer((toTokenize as GeneralObject)[key], [...currentPath, key])];
			});
		}
	} else push(labeler(toTokenize, false), currentPath, toTokenize);

	return result;
}

function labeler(toLabel: unknown, isObj: boolean = isObject(toLabel)) {
	if (isObj) {
		if ((toLabel as GeneralObject).meta) return 'preserved';
		else return 'placeholder';
	} else {
		if (typeof toLabel === 'function') return 'default:runner';
		return 'default:store';
	}
}
