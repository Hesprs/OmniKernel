import { expect, test, vi } from 'vitest';
import { manifest, OmniKernel, OmniUnit, Reactive } from '@';

// Sample values for testing
const initialValue = 'initial';
const newValue = 'updated';

test('Reactive respects silent flag when immutable', () => {
	@manifest({ name: 'ReactiveSilentTest' })
	class ReactiveSilentTest extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			const reactive = new Reactive(initialValue, { immutable: true });
			this.Kernel.register({ reactive }, this.facade);

			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			// without silent flag
			this.facade.reactive(newValue);
			expect(warnSpy).toBeCalled();
			warnSpy.mockRestore();

			// with silent flag
			reactive.meta.silent = true;
			this.facade.reactive(newValue);
			expect(warnSpy).not.toBeCalled();
			warnSpy.mockRestore();

			expect(reactive.value).toBe(initialValue);
			expect(reactive.onNormalize()).toBe(initialValue);
		}
	}
	new OmniKernel([ReactiveSilentTest]).bringUp();
});

test('Reactive set() executes synchronous functions from Facade', () => {
	@manifest({ name: 'ReactiveSetTest' })
	class ReactiveSetTest extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			const reactive = new Reactive(initialValue);
			this.Kernel.register({ reactive }, this.facade);
			expect(reactive.value).toBe(initialValue);

			const func1 = vi.fn();
			const func2 = vi.fn();
			const func3 = vi.fn();

			this.Kernel.register(
				{
					reactive: {
						1: func1,
						2: func2,
					},
				},
				this.facade,
			);

			this.facade.reactive(newValue);

			expect(func1).toBeCalledWith(newValue, initialValue);
			expect(func2).toBeCalledWith(newValue, initialValue);
			expect(func1).toHaveBeenCalledBefore(func2);

			this.Kernel.register(
				{
					3: func3,
				},
				this.facade,
			);

			this.facade.reactive(newValue);
			expect(func3).not.toBeCalled();
		}
	}
	new OmniKernel([ReactiveSetTest]).bringUp();
});

test('Reactive executes asynchronous functions when async meta is true', async () => {
	@manifest({ name: 'ReactiveAsyncTest' })
	class ReactiveAsyncTest extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			const reactive = new Reactive(initialValue, { async: true });
			expect(reactive.meta.async).toBe(true);

			this.Kernel.register({ reactive }, this.facade);

			const asyncFunc1 = vi.fn().mockResolvedValue(undefined);
			const asyncFunc2 = vi.fn().mockResolvedValue(undefined);

			this.Kernel.register(
				{
					reactive: {
						asyncFunc1,
						asyncFunc2,
					},
				},
				this.facade,
			);

			this.facade.reactive(newValue);

			expect(asyncFunc1).toBeCalled();
			expect(asyncFunc2).toBeCalled();
		}
	}
	new OmniKernel([ReactiveAsyncTest]).bringUp();
});
