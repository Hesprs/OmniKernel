import { expect, test, vi } from 'vitest';
import Reactive from '@/elements/reactive';
import { OmniKernel } from '@/index';

// Sample values for testing
const initialValue = 'initial';
const newValue = 'updated';

test('Reactive respects silent flag when immutable', () => {
	const reactive = new Reactive(initialValue, { immutable: true });
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

	// without silent flag
	reactive.meta.facadeOverride(newValue);
	expect(warnSpy).toBeCalled();
	warnSpy.mockRestore();

	// with silent flag
	reactive.meta.silent = true;
	reactive.meta.facadeOverride(newValue);
	expect(warnSpy).not.toBeCalled();
	warnSpy.mockRestore();

	expect(reactive.value).toBe(initialValue);
	expect(reactive.meta.onNormalize()).toBe(initialValue);
});

test('Reactive set() executes synchronous functions from thisFacade', () => {
	const Kernel = new OmniKernel();
	const reactive = new Reactive(initialValue);
	Kernel.register(reactive);
	expect(Kernel.facade()).toBe(initialValue);
	const func1 = vi.fn();
	const func2 = vi.fn();
	const func3 = vi.fn();

	// Register the reactive element
	Kernel.register(reactive);
	Kernel.register({
		1: func1,
		2: func2,
	});

	// Update the reactive value
	Kernel.facade(newValue);

	expect(func1).toBeCalledWith(newValue, initialValue);
	expect(func2).toBeCalledWith(newValue, initialValue);
	expect(func1).toHaveBeenCalledBefore(func2);

	// skip repeated updates
	Kernel.register({
		3: func3,
	});
	Kernel.facade(newValue);
	expect(func3).not.toBeCalled();
});

test('Reactive executes asynchronous functions when async meta is true', async () => {
	const Kernel = new OmniKernel();

	const reactive = new Reactive(initialValue, { async: true });
	expect(reactive.meta.async).toBe(true);

	const asyncFunc1 = vi.fn().mockResolvedValue(undefined);
	const asyncFunc2 = vi.fn().mockResolvedValue(undefined);

	Kernel.register(reactive);
	Kernel.register({
		asyncFunc1,
		asyncFunc2,
	});

	Kernel.facade(newValue);

	expect(asyncFunc1).toBeCalled();
	expect(asyncFunc2).toBeCalled();
});
