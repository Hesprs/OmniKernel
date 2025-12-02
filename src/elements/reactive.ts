import { elementMeta } from '@';

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
		if (oldValue === newValue) return; // Prevent update if the same value received
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
		...elementMeta,
		facadeOverride: (newValue?: unknown) => {
			if (newValue) this.set(newValue);
			else return this.value;
		},
		onNormalize: () => this.value,
		async: false,
		immutable: false,
		silent: false,
	};
}
