import type { GeneralFunction } from '@/declarations';
import { OmniFacadeElement } from '@/utilities/baseClasses';

export default class Runner extends OmniFacadeElement {
	run: GeneralFunction;
	constructor(
		func: GeneralFunction,
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
	set(newFunc: GeneralFunction) {
		if (this.meta.immutable) {
			if (!this.meta.silent) console.warn('[OmniKernel] Runner function cannot be changed.');
			return;
		}
		this.run = newFunc;
	}

	facadeOverride = (...args: Array<unknown>) => this.run(...args);
	onNormalize = () => this.run;

	meta = {
		immutable: false,
		silent: false,
		async: false,
		immediate: false,
	};
}
