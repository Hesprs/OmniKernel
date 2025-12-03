import type { GeneralObject, labelerResult } from '@/declarations';

function isObject(toCheck: unknown) {
	return (
		typeof toCheck === 'object' &&
		toCheck !== null &&
		!Array.isArray(toCheck) &&
		(typeof Element === 'undefined' || !(toCheck instanceof Element))
	);
}

type Token = { label: labelerResult; path: Array<string>; value: unknown };

export default function tokenizer(toTokenize: unknown, currentPath: Array<string> = []) {
	let result: Array<Token> = [];
	function push(path: Array<string>, value: unknown, label: ReturnType<typeof labeler>) {
		if (label !== 'placeholder') result.push({ path, value, label });
	}

	if (isObject(toTokenize)) {
		const toAddLabel = labeler(toTokenize, true);
		push(currentPath, toTokenize, toAddLabel);
		if (toAddLabel !== 'preserved') {
			Object.keys(toTokenize as GeneralObject).forEach(key => {
				result = [...result, ...tokenizer((toTokenize as GeneralObject)[key], [...currentPath, key])];
			});
		}
	} else push(currentPath, toTokenize, labeler(toTokenize, false));

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
