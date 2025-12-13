import type Runner from '@/elements/runner';
import type Store from '@/elements/store';
import type OmniKernel from '@/omniKernel';
import type { OmniFacadeElement, OmniUnit } from '@/utilities/baseClasses';

// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralArguments = Array<any>;
export type GeneralConstructor<T> = new (...args: GeneralArguments) => T;
// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralObject = Record<Indexable, any>;
export type Indexable = string | number | symbol;
export type labelerResult = 'preserved' | 'store' | 'runner';
export type FacadeMap = Record<string, OmniFacadeElement | OmniUnit<GeneralUnitArgs>>;
export type Unit = {
	dependsOn?: Array<string>;
	requires?: Array<string>;
	facade: Facade;
	initiated: boolean;
	element: GeneralConstructor<OmniUnit<GeneralUnitArgs>>;
};
export type Meta = {
	moduleName?: string;
	dependencies?: Array<string>;
	silent?: boolean;
	irreplaceable?: boolean;
	[key: Indexable]: unknown;
};
export type Manifest = {
	name: string;
	dependsOn?: Array<string>;
	requires?: Array<string>;
};
export type GeneralUnitArgs = [
	GeneralFunction,
	Record<string, GeneralFunction>,
	OmniKernel,
	Meta | undefined,
	FacadeMap,
];

declare global {
	// biome-ignore lint/suspicious/noExplicitAny: General Type
	type GeneralFunction = (...args: GeneralArguments) => any;
	type Facade = {
		(...args: Array<unknown>): unknown;
		[key: Indexable]: Facade;
	};
	type FacadeFunc<T> = T extends OmniUnit<GeneralUnitArgs> | OmniFacadeElement
		? 'facadeOverride' extends keyof T
			? T['facadeOverride']
			: T
		: T extends GeneralFunction
			? Runner<T>['facadeOverride']
			: T extends undefined
				? () => void
				: Store<T>['facadeOverride'];
	type UnitConstructor = {
		// biome-ignore lint/suspicious/noExplicitAny: must use any since TypeScript even does't allow inclusion here
		new (...args: [any, any, OmniKernel, Meta | undefined, FacadeMap]): OmniUnit<GeneralUnitArgs>;
	};
	type UnitArgs = [Facade, Record<string, Facade>, OmniKernel, Meta | undefined, FacadeMap];
}
