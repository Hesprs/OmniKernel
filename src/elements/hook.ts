import { elementMeta } from '@';

export default class Hook implements GeneralElement {
	constructor(options?: { async: boolean }) {
		if (options) this.meta = { ...this.meta, ...options };
	}
	run = () => {
		const children = this.meta.thisFacade;
		if (this.meta.async) {
			Object.values(children).forEach(async func => {
				await func();
			});
		} else {
			Object.values(children).forEach(func => {
				func();
			});
		}
	};
	meta = {
		...elementMeta,
		facadeOverride: this.run,
		onNormalize: () => this.run,
		async: false,
	};
}
