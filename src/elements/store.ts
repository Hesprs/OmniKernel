export default class Store implements GeneralElement {
	value: unknown = null;
	constructor(toStore: unknown, options?: { immutable?: boolean; silent?: boolean }) {
		this.value = toStore;
		if (options) this.meta = { ...this.meta, ...options };
	}
	set(toSet: unknown) {
		if (this.meta.immutable) {
			if (!this.meta.silent) console.warn('[OmniKernel] Store value cannot be changed.');
			return;
		}
		this.value = toSet;
	}
	meta = {
		signature: 'default:store',
		facade: (toStore?: unknown) => {
			if (toStore) this.set(toStore);
			else return this.value;
		},
		normalizeCallback: () => this.value,
		immutable: false,
		silent: false,
	};
	preserved = true;
}
