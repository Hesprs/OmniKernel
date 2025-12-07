import type { GeneralConstructor, Manifest } from '@/declarations';
import type { FacadeUnit } from '@/utilities/baseClasses';

export function manifest(metadata: Manifest) {
	return (_value: GeneralConstructor<FacadeUnit>, context: ClassDecoratorContext) => {
		Object.assign(context.metadata, metadata);
	};
}

export const getManifest = (target: GeneralConstructor<FacadeUnit>) => target[Symbol.metadata];
