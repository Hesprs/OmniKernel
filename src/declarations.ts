declare global {
	interface GeneralFunction {
		(...args: any[]): any;
	}
	interface GeneralClass {
		new (...args: any[]): any | GeneralFunction;
	}

	type Module = GeneralClass | GeneralFunction;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	interface Amoeba extends Function {
		(...args: Array<any>): any; // default runner

		// Behavioral underscore fields
		_value?: any; // stored value
		_get?(): any; // custom getter
		_set?(...args: Array<any>): any; // called after assignment, when setting a new value
		_beforeMerge?(replaced?: Amoeba): any; // called when assigned to registry
		_beforeDispose?(): any; // called when deleted from registry
		_run?(...args: Array<any>): any; // override default runner
		_args?: {
			silent?: boolean;
			disabled?: boolean;
			immutable?: boolean;
			unreadable?: boolean;
			[key: string]: any;
		}; // metadata flags

		// Amoeba signature
		_sig: string;

		// Children (other amoebas) or custom underscore fields
		[key: string]: Amoeba | any;
	}

	interface objectAmoeba {
		// Behavioral underscore fields
		_value?: any; // stored value
		_get?(): any; // custom getter
		_set?(value: any): any; // called after assignment, when setting a new value
		_beforeMerge?(replaced?: Amoeba): any; // called when assigned to registry
		_beforeDispose?(): any; // called when deleted from registry
		_override?(...args: Array<any>): any; // override default runner
		_args?: {
			silent?: boolean;
			disabled?: boolean;
			immutable?: boolean;
			unreadable?: boolean;
			[key: string]: any;
		}; // metadata flags

		// Amoeba signature
		_sig?: string;

		// Children (other amoebas) or custom underscore fields
		[key: string]: Amoeba | any;
	}
}

export {};
