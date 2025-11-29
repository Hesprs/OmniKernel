declare global {
	type GeneralFunction = (...args: Array<unknown>) => unknown;

	interface Facade {
		(...args: Array<unknown>): unknown;
		[key: Indexable]: Facade;
	}

	type GeneralClass = new (...args: Array<unknown>) => unknown;

	interface GeneralElement {
		preserved: boolean;
		meta: Meta & { signature: string };
	}

	type GeneralObject = Record<Indexable, unknown>;

	type Indexable = string | number | symbol;

	type Meta = {
		signature?: string;
		facade?: GeneralFunction;
		normalize?: unknown;
		normalizeCallback?: GeneralFunction;
		silent?: boolean;
		facadePosition?: Facade;
		entireFacade?: Facade;
		connectedCallback?: GeneralFunction;
		[key: Indexable]: unknown;
	};

	type labelerResult = 'preserved' | 'default:store' | 'default:runner';
}

export {};
