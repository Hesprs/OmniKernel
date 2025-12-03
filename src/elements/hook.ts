import { elementMeta } from '@';
import type { GeneralArguments } from '@/declarations';

export default class Hook implements GeneralElement {
	constructor(options?: { async: boolean }) {
		if (options) this.meta = { ...this.meta, ...options };
	}
	run = (...args: GeneralArguments) => {
		const children = this.meta.thisFacade;
		if (this.meta.async) {
			Object.values(children).forEach(async func => {
				await func(...args);
			});
		} else {
			Object.values(children).forEach(func => {
				func(...args);
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
