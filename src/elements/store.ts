import { OmniFacadeElement } from '@/utilities/baseClasses';

export default class Store extends OmniFacadeElement {
	value: unknown = null;
	constructor(toStore: unknown, options?: { immutable?: boolean; silent?: boolean }) {
		super();
		this.value = toStore;
		if (options) Object.assign(this.meta, options);
	}
	set(toSet: unknown) {
		if (this.meta.immutable) {
			if (!this.meta.silent) console.warn('[OmniKernel] Store is immutable.');
			return;
		}
		this.value = toSet;
	}

	facadeOverride = (toStore?: unknown) => {
		if (toStore !== undefined) this.set(toStore);
		else return this.value;
	};
	onNormalize = () => this.value;

	meta = {
		immutable: false,
		silent: false,
		caller: false,
	};
}
