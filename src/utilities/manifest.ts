import type { GeneralConstructor, Manifest } from '@/declarations';
import type { OmniUnit } from '@/utilities/baseClasses';

export function manifest(metadata: Manifest) {
	return (_value: GeneralConstructor<OmniUnit>, context: ClassDecoratorContext) => {
		Object.assign(context.metadata, metadata);
	};
}

export const getManifest = (target: GeneralConstructor<OmniUnit>) => target[Symbol.metadata];
