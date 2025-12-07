import { FacadeElement } from '@/utilities/baseClasses';

export default class Reactive extends FacadeElement {
	value: unknown = undefined;

	constructor(initialValue: unknown, options?: { async?: boolean; immutable?: boolean; silent?: boolean }) {
		super();
		this.value = initialValue;
		if (options) Object.assign(this.meta, options);
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
		const children = this.facades[0];
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
		async: false,
		immutable: false,
		silent: false,
	};

	facadeOverride = (newValue?: unknown) => {
		if (newValue !== undefined) this.set(newValue);
		else return this.value;
	};
	onNormalize = () => this.value;
}
