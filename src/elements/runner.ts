import type { GeneralFunction } from '@/declarations';
import { FacadeElement } from '@/utilities/baseClasses';

export default class Runner extends FacadeElement {
	run: GeneralFunction;
	constructor(func: GeneralFunction, options?: { immutable?: boolean; silent?: boolean }) {
		super();
		this.run = func;
		if (options) Object.assign(this.meta, options);
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
	};
}
