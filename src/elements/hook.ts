import { dummyFacade } from '@';

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
		signature: 'default:hook',
		facade: this.run,
		normalize: this.run,
		thisFacade: dummyFacade,
		async: false,
	};
	preserved = true;
}
