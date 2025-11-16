import { createAmoeba } from '../utilities.ts';

export default function api(func: GeneralFunction, _options?: { async?: boolean }) {
	const options = { async: false, ..._options };

	let amoeba: objectAmoeba = { _sig: 'api' };
	if (options.async) {
		amoeba = {
			...amoeba,
			async _run(...args: Array<any>) {
				return await func(...args);
			},
		};
	} else {
		amoeba = {
			...amoeba,
			_run(...args: Array<any>) {
				return func(...args);
			},
		};
	}
	return createAmoeba(amoeba);
}
