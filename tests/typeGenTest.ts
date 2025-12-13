import { manifest, OmniUnit, Store } from '@';

@manifest({ name: 'Test1' })
// biome-ignore lint/correctness/noUnusedVariables: testing dummy
class Test1 extends OmniUnit<UnitArgs> {
	constructor(...args: UnitArgs) {
		super(...args);
		this.Kernel.register(
			{
				aaa: 'sss',
			},
			this.facade,
		);
		const facade = this.facade;
		const register = this.Kernel.register;
		register(
			{
				bbb: new Store(1),
			},
			facade,
		);
	}

	dummy() {
		return @manifest({ name: 'nestedDummy' })
		class Nested extends OmniUnit<UnitArgs> {
			constructor(...args: UnitArgs) {
				super(...args);
			}
		};
	}
}

@manifest({ name: 'Test2', dependsOn: ['Test1', 'nestedDummy'] })
// biome-ignore lint/correctness/noUnusedVariables: testing dummy
class Test2 extends OmniUnit<UnitArgs> {
	constructor(...args: UnitArgs) {
		super(...args);
		this.Kernel.register(
			{
				aaa: new Store(''),
			},
			this.deps.Test1,
		);
	}
}
