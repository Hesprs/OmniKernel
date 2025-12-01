import { expect, test, vi } from 'vitest';
import Reactive from '@/elements/reactive';
import { OmniKernel } from '@/index';

// Sample values for testing
const initialValue = 'initial';
const newValue = 'updated';

test('Reactive meta.facade acts as a getter', () => {
	const reactive = new Reactive(initialValue);
	expect(reactive.meta.facade()).toBe(initialValue);
});

test('Reactive meta.facade acts as a setter', () => {
	const reactive = new Reactive(initialValue);
	reactive.meta.facade(newValue);
	expect(reactive.value).toBe(newValue);
});

test('Reactive respects silent flag when immutable', () => {
	const reactive = new Reactive(initialValue, { immutable: true, silent: true });
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	reactive.meta.facade(newValue);
	expect(reactive.value).toBe(initialValue);
	expect(warnSpy).not.toBeCalled();
	warnSpy.mockRestore();
});

test('Reactive meta.normalizeCallback returns current value', () => {
	const reactive = new Reactive(initialValue);
	expect(reactive.meta.normalizeCallback()).toBe(initialValue);
	reactive.set(newValue);
	expect(reactive.meta.normalizeCallback()).toBe(newValue);
});

test('Reactive set() executes synchronous functions from thisFacade', () => {
	const Kernel = new OmniKernel();
	const reactive = new Reactive(initialValue);
	const func1 = vi.fn();
	const func2 = vi.fn();

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
