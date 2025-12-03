import type OmniKernel from './omniKernel';

// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralArguments = Array<any>;
// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralFunction = (...args: GeneralArguments) => any;
// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralClass = new (...args: GeneralArguments) => any;
// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralObject = Record<Indexable, any>;
export type Indexable = string | number | symbol;
export type labelerResult = 'preserved' | 'default:store' | 'default:runner';

declare global {
	interface Facade {
		(...args: Array<unknown>): unknown;
		[key: Indexable]: Facade;
	}

	interface GeneralElement {
		meta: Meta & {
			// must have context
			Kernel: OmniKernel;
			thisFacade: Facade;
			parentFacade: Facade | undefined;
			name: string;
		};
	}

	type Meta = {
		// options
		silent?: boolean;
		irreplaceable?: boolean;
		caller?: boolean; // if the element is to be replaced, the normalized output will be used to call the successor

		// communication with OmniKernel
		onConnected?: GeneralFunction;
		onDisconnected?: GeneralFunction;
		onNormalize?: unknown;
		facadeOverride?: GeneralFunction;

		[key: Indexable]: unknown;
	};
}
