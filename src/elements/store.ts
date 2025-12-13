import { OmniFacadeElement } from '@/utilities/baseClasses';

export default class Store<T> extends OmniFacadeElement {
	value: T;
	constructor(toStore: T, options?: { immutable?: boolean; silent?: boolean }) {
		super();
		this.value = toStore;
		if (options) Object.assign(this.meta, options);
	}
	set(toSet: T) {
		if (this.meta.immutable) {
			if (!this.meta.silent) console.warn('[OmniKernel] Store is immutable.');
			return;
		}
		this.value = toSet;
	}

	facadeOverride = (toStore?: T) => {
		if (toStore !== undefined) this.set(toStore);
		return this.value;
	};
	onNormalize = () => this.value;

	meta = {
		immutable: false,
		silent: false,
		storedCall: false,
	};
}
