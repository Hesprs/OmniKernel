import type { GeneralConstructor, GeneralUnitArgs, Manifest } from '@/declarations';
import type { OmniUnit } from '@/utilities/baseClasses';

export function manifest(metadata: Manifest) {
	return (_value: GeneralConstructor<OmniUnit<GeneralUnitArgs>>, context: ClassDecoratorContext) => {
		Object.assign(context.metadata, metadata);
	};
}

export const getManifest = (target: GeneralConstructor<OmniUnit<GeneralUnitArgs>>) => target[Symbol.metadata];
