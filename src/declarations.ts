import type OmniKernel from '@/omniKernel';
import type { OmniFacadeElement, OmniUnit } from '@/utilities/baseClasses';

// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralArguments = Array<any>;
// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralFunction = (...args: GeneralArguments) => any;
export type GeneralConstructor<T> = new (...args: GeneralArguments) => T;
// biome-ignore lint/suspicious/noExplicitAny: General Type
export type GeneralObject = Record<Indexable, any>;
export type Indexable = string | number | symbol;
export type labelerResult = 'preserved' | 'store' | 'runner';
export type FacadeMap = Record<string, OmniFacadeElement | OmniUnit>;
export type Unit = {
	dependsOn?: Array<string>;
	requires?: Array<string>;
	facade: Facade;
	initiated: boolean;
	element: GeneralConstructor<OmniUnit>;
};
export type Meta = {
	moduleName?: string;
	dependencies?: Array<string>;
	silent?: boolean;
	irreplaceable?: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: user defined
	[key: Indexable]: any;
};
export type Manifest = {
	name: string;
	dependsOn?: Array<string>;
	requires?: Array<string>;
};

declare global {
	type Facade = {
		(...args: Array<unknown>): unknown;
		[key: Indexable]: Facade;
	};
	type UnitConstructor = { new (...args: UnitArgs): OmniUnit };
	type UnitArgs = [Facade, Record<string, Facade>, OmniKernel, Meta | undefined, FacadeMap];
}
