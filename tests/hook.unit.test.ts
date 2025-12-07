import { expect, test, vi } from 'vitest';
import { FacadeUnit, Hook, manifest, OmniKernel } from '@';
import type { GeneralObject } from '@/declarations';

test('Hook unit Integration', () => {
	@manifest({ name: 'Test' })
	class Test extends FacadeUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			this.Kernel.register(
				{
					syncTest: new Hook(),
					asyncTest: new Hook({ async: true }),
				},
				this.facade,
			);
			const funcSync = vi.fn();
			const funcAsync = vi.fn().mockResolvedValue(undefined);
			this.Kernel.register(
				{
					syncTest: {
						run: funcSync,
					},
					asyncTest: {
						run: funcAsync,
					},
				},
				this.facade,
			);

			this.facade.syncTest();
			this.facade.asyncTest();

			expect(funcSync).toBeCalled();
			expect(funcAsync).toBeCalled();
			expect((this.Kernel.normalize(this.facade) as GeneralObject).value).toBeInstanceOf(Test);
		}
	}
	new OmniKernel([Test]).bringUp();
});
