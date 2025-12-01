import { dummyFacade } from '@';

export default class Reactive implements GeneralElement {
	value: unknown = null;

	constructor(initialValue: unknown, options?: { async?: boolean; immutable?: boolean; silent?: boolean }) {
		this.value = initialValue;
		if (options) this.meta = { ...this.meta, ...options };
	}

	set(newValue: unknown) {
		if (this.meta.immutable) {
			if (!this.meta.silent) console.warn('[OmniKernel] Reactive value cannot be changed.');
			return;
		}
		const oldValue = this.value;
		this.value = newValue;

		// Trigger the reactive updates
		const children = this.meta.thisFacade;
		if (this.meta.async) {
			Object.values(children).forEach(async func => {
				await func(newValue, oldValue);
			});
		} else {
			Object.values(children).forEach(func => {
				func(newValue, oldValue);
			});
		}
	}

	meta = {
		signature: 'default:reactive',
		facade: (newValue?: unknown) => {
			if (newValue !== undefined) this.set(newValue);
			else return this.value;
		},
		normalizeCallback: () => this.value,
		thisFacade: dummyFacade,
		async: false,
		immutable: false,
		silent: false,
	};

	preserved = true;
}
