import { isAmoeba, isObject } from './omniKernel.ts';

export function createAmoeba(toConvert: any, recursive = true) {
	const result: Amoeba = function (...args: Array<any>) {
		// router
		const amoebaArgs = result._args || {};
		const silent = amoebaArgs.silent || false;
		const defaultOperations = {
			_run: (...args: Array<any>) => {
				if (args.length === 0) return defaultOperations._get();
				else return defaultOperations._set(...args);
			},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			_get: (...args: Array<any>) => {
				if (amoebaArgs.unreadable) {
					if (!silent) console.warn('Get value failed: amoeba is unreadable.');
					return;
				}
				const value = result._value;
				if ('value'! in result && !silent) console.warn('Get value failed: amoeba has neither _value field or a custom getter.');
				return value;
			},
			_set: (...args: Array<any>) => {
				if (amoebaArgs.immutable) {
					if (!silent) console.warn('Set value failed: amoeba is immutable.');
					return;
				}
				if ('_value' in result) result._value = args[0];
				else if (!silent) console.warn('Set value failed: amoeba has neither _value field nor a custom setter.');
				return;
			},
		};

		if (amoebaArgs.disabled) {
			if (!silent) console.warn('Amoeba is disabled, skip running.');
			return;
		}

		const _operation = args[args.length - 1];
		let operation: string;
		if (_operation && typeof _operation === 'string' && (`_${_operation}` in result || `${_operation}` in defaultOperations)) {
			operation = _operation;
			args.pop();
		} else operation = 'run';

		const key = `_${operation}` as keyof typeof defaultOperations;
		if (result[key]) return result[key](...args);
		if (key in defaultOperations) return defaultOperations[key](...args);
		if (!silent) console.warn(`Operation "${operation}" failed: method undefined.`);
	};

	const identity = isAmoeba(toConvert) ? 'amo' : isObject(toConvert) ? 'obj' : 'pri';

	switch (identity) {
		case 'pri': {
			result._value = toConvert;
			result._sig = 'default';
			break;
		}
		case 'obj': {
			if (!toConvert._value && !toConvert._get) result._value = undefined;
			if (!toConvert._sig) result._sig = 'default';
			// falls through
		}
		case 'amo': {
			for (const key of Object.keys(toConvert)) {
				if (key.startsWith('_') || !recursive) result[key] = toConvert[key];
				else result[key] = createAmoeba(toConvert[key]);
			}
		}
	}

	return result;
}

export function normalize(toNormalize: Amoeba) {
	let hasChild = false;
	let result: any;
	Object.keys(toNormalize).forEach(key => {
		if (!key.startsWith('_')) {
			if (!hasChild) {
				result = {};
				hasChild = true;
			}
			result[key] = normalize(toNormalize[key]);
		}
	});
	let value: any;
	if (toNormalize._value) value = toNormalize._value;
	else if (toNormalize._get) value = toNormalize._get();
	else value = undefined;
	if (hasChild) result._index = value;
	else result = value;
	return result;
}

export function makeConfig(config: any) {
	function recursion(config: any) {
		let result: Record<string, any> = {};
		if (isObject(config) || isAmoeba(config)) {
			Object.keys(config as Record<string, any>).forEach(key => {
				result[key] = key.startsWith('_') ? config[key] : recursion(config[key]);
			});
		} else {
			result = {
				_value: config,
				_args: {
					silent: true,
					immutable: true,
				},
			};
		}
		return result;
	}
	const toRegister = recursion(config);
	return (Kernel: Amoeba) => Kernel._register(toRegister);
}