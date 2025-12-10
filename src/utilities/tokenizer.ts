import type { GeneralObject, labelerResult } from '@/declarations';
import { OmniFacadeElement } from '@/utilities/baseClasses';

function isObject(toCheck: unknown) {
	return typeof toCheck === 'object' && toCheck !== null && !Array.isArray(toCheck);
}

type Token = { label: labelerResult; path: Array<string>; value: unknown };

export function tokenizer(toTokenize: unknown, currentPath: Array<string> = []) {
	const result: Array<Token> = [];
	function push(path: Array<string>, value: unknown, label: ReturnType<typeof labeler>) {
		if (label !== 'placeholder') result.push({ path, value, label });
	}

	if (isObject(toTokenize)) {
		const toAddLabel = labeler(toTokenize, true);
		push(currentPath, toTokenize, toAddLabel);
		if (toAddLabel === 'placeholder') {
			Object.keys(toTokenize as GeneralObject).forEach(key => {
				result.push(...tokenizer((toTokenize as GeneralObject)[key], [...currentPath, key]));
			});
		}
	} else push(currentPath, toTokenize, labeler(toTokenize, false));

	return result;
}

function labeler(toLabel: unknown, isObj: boolean = isObject(toLabel)) {
	if (isObj) {
		if (toLabel instanceof OmniFacadeElement) return 'preserved';
		if (typeof Element !== 'undefined' && toLabel instanceof Element) return 'store';
		return 'placeholder';
	} else {
		if (typeof toLabel === 'function') return 'runner';
		return 'store';
	}
}
