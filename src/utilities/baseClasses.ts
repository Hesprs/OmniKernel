import type { GeneralUnitArgs, Meta } from '@/declarations';
import type OmniKernel from '@/omniKernel';

const notInTreeError = (name: string) =>
	new Error(`[OmniKernel] Cannot get ${name} since the element is not yet in the facade tree.`);

export class OmniFacadeElement {
	// facade tree injections
	readonly facadeInjections: {
		facades: Array<Facade> | undefined;
		Kernel: undefined | OmniKernel;
		facadeName: undefined | string;
	} = {
		facades: undefined,
		Kernel: undefined,
		facadeName: undefined,
	};

	// metadata
	readonly meta: Meta = {};

	// methods
	onConnected?: GeneralFunction;
	onDisconnected?: GeneralFunction;
	onNormalize?: unknown;
	facadeOverride?: GeneralFunction;
	dispose?: GeneralFunction;

	// getters
	get facades() {
		if (this.facadeInjections.facades === undefined) throw notInTreeError('rootFacade');
		return this.facadeInjections.facades;
	}
	get facadeName() {
		if (this.facadeInjections.facadeName === undefined) throw notInTreeError('facadeName');
		return this.facadeInjections.facadeName;
	}
	get Kernel() {
		if (this.facadeInjections.Kernel === undefined) throw notInTreeError('Kernel');
		return this.facadeInjections.Kernel;
	}
}

export class OmniUnit<T extends GeneralUnitArgs> {
	facade: T[0];
	Kernel: OmniKernel;
	deps: T[1];
	constructor(...args: T) {
		// 0: facade  1: dependencies 2: Kernel 3: additionalMeta 4. facadeMap
		this.facade = args[0];
		this.deps = args[1];
		this.Kernel = args[2];
		Object.assign(this.meta, args[3]);
		args[4][this.facade.name] = this;
	}

	// metadata
	readonly meta: Meta = {};

	// methods
	dispose?: GeneralFunction;
	onNormalize?: unknown;
	facadeOverride?: GeneralFunction;
}
