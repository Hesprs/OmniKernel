import { createAmoeba } from '../utilities.ts';

export default function hook(_options?: { corporate?: boolean; async?: boolean }) {
	const options = { corporate: false, async: false, ..._options };

	type hookAdd = GeneralFunction | Record<number, GeneralFunction> | Array<GeneralFunction>;
	interface hookObjectAmoeba extends objectAmoeba {
		_sig: 'hook';
		_set(toAdd: hookAdd): void;
		_value: Record<number, GeneralFunction>;
	}

	let amoeba: hookObjectAmoeba = {
		_sig: 'hook',
		_value: {} as Record<number, GeneralFunction>,
		_set(toAdd: hookAdd) {
			const lastOrder = () => {
				const keys = Object.keys(this._value).map(Number);
				const maxKey = keys.length > 0 ? Math.max(...keys) : 0;
				return maxKey + 1;
			};
			const addOne = (hook: GeneralFunction, order = lastOrder()) => (this._value[order] = hook);
			if (Array.isArray(toAdd)) toAdd.forEach(hook => addOne(hook));
			else if (typeof toAdd === 'object') {
				Object.entries(toAdd as hookAdd).forEach(([order, hook]) => addOne(hook, parseInt(order)));
			} else addOne(toAdd);
		},
	};
	if (options.async) {
		amoeba = {
			...amoeba,
			_run(...args: Array<any>) {
				Object.values(this._value).forEach(async hook => await hook(...args));
			},
		};
	} else {
		amoeba = {
			...amoeba,
			_run(...args: Array<any>) {
				Object.values(this._value).forEach(hook => hook(...args));
			},
		};
	}
	if (options.corporate) {
		amoeba = {
			...amoeba,
			_beforeMerge(replace: Amoeba) {
				if (!replace._value || typeof replace._value !== 'function') {
					if (!this._args?.silent) console.warn('Corporate hook failed: the value of the amoeba to be replaced must be a function.');
					return;
				}
				this._set(replace._value);
			},
		};
	}
	return createAmoeba(amoeba);
}
