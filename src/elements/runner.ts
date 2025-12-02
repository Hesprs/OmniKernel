import { elementMeta } from '@';
import type { GeneralFunction } from '@/declarations';

export default class Runner implements GeneralElement {
	run: GeneralFunction;
	constructor(func: GeneralFunction, options?: { immutable?: boolean; silent?: boolean }) {
		this.run = func;
		if (options) this.meta = { ...this.meta, ...options };
	}
	set(newFunc: GeneralFunction) {
		if (this.meta.immutable) {
			if (!this.meta.silent) console.warn('[OmniKernel] Runner function cannot be changed.');
			return;
		}
		this.run = newFunc;
	}
	meta = {
		...elementMeta,
		facadeOverride: (...args: Array<unknown>) => this.run(...args),
		onNormalize: () => this.run,
		immutable: false,
		silent: false,
	};
}
