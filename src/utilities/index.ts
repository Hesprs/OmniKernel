import type { OmniKernel } from '@';

export const elementMeta: {
	thisFacade: Facade;
	parentFacade: Facade | undefined;
	Kernel: OmniKernel;
	name: string;
} = {
	thisFacade: undefined as unknown as Facade,
	parentFacade: undefined,
	Kernel: undefined as unknown as OmniKernel,
	name: '',
};
