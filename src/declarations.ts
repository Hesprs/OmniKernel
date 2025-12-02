import type OmniKernel from './omniKernel';

// biome-ignore lint/suspicious/noExplicitAny: flexibility required by design
export type GeneralFunction = (...args: Array<any>) => any;
export type GeneralClass = new (...args: Array<unknown>) => unknown;
export type GeneralObject = Record<Indexable, unknown>;
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

		// communication with OmniKernel
		onConnected?: GeneralFunction;
		onDisconnected?: GeneralFunction;
		onNormalize?: unknown;
		facadeOverride?: GeneralFunction;

		[key: Indexable]: unknown;
	};
}
