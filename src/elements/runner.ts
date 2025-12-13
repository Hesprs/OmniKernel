import { OmniFacadeElement } from '@/utilities/baseClasses';

export default class Runner<T extends GeneralFunction> extends OmniFacadeElement {
	run: T;
	constructor(
		func: T,
		options?: { immutable?: boolean; silent?: boolean; immediate?: boolean; async?: boolean },
	) {
		super();
		this.run = func;
		if (options) {
			Object.assign(this.meta, options);
			if (options.immediate) {
				if (options.async) (async () => await func())();
				else func();
			}
		}
	}
	set(newFunc: T) {
		if (this.meta.immutable) {
			if (!this.meta.silent) console.warn('[OmniKernel] Runner function cannot be changed.');
			return;
		}
		this.run = newFunc;
	}

	facadeOverride: T = ((...args: Parameters<T>) => this.run(...args) as ReturnType<T>) as T;
	onNormalize = () => this.run;

	meta = {
		immutable: false,
		silent: false,
		async: false,
		immediate: false,
	};
}
