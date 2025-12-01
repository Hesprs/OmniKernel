export type GeneralFunction = (...args: Array<unknown>) => unknown;
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
		preserved: boolean;
		meta: Meta & { signature: string };
	}

	type Meta = {
		signature?: string;
		facade?: GeneralFunction;
		normalize?: unknown;
		normalizeCallback?: GeneralFunction;
		silent?: boolean;
		thisFacade?: Facade;
		parentFacade?: Facade;
		connectedCallback?: GeneralFunction;
		[key: Indexable]: unknown;
	};
}
