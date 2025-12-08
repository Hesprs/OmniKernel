import type { GeneralArguments } from '@/declarations';
import { FacadeElement } from '@/utilities/baseClasses';

export default class Hook extends FacadeElement {
	constructor(options?: { async: boolean }) {
		super();
		if (options) Object.assign(this.meta, options);
	}
	run = (...args: GeneralArguments) => {
		const children = this.facades[0];
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
	meta = { async: false };

	facadeOverride = this.run;
	onNormalize = () => this.run;
}
