import { expect, test, vi } from 'vitest';
import type { GeneralObject } from '@/declarations';
import { Hook, OmniKernel } from '@/index';

test('Hook run() executes synchronous functions from facadePosition', () => {
	const Kernel = new OmniKernel();
	const hook = new Hook();
	const func1 = vi.fn();
	const func2 = vi.fn();

	// Mock the facadePosition to contain our test functions
	Kernel.register(hook);
	Kernel.register({
		1: func1,
		2: func2,
	});

	Kernel.facade();

	expect(func1).toHaveBeenCalled();
	expect(func2).toHaveBeenCalled();

	expect(func1).toHaveBeenCalledBefore(func2);
	expect((Kernel.normalize(Kernel.facade) as GeneralObject)._self).toBeInstanceOf(Function);
});

test('Hook run() executes asynchronous functions when async meta is true', async () => {
	const Kernel = new OmniKernel();

	const hook = new Hook({ async: true });
	expect(hook.meta.async).toBe(true);

	const asyncFunc1 = vi.fn().mockResolvedValue(undefined);
	const asyncFunc2 = vi.fn().mockResolvedValue(undefined);

	Kernel.register(hook);
	Kernel.register({
		asyncFunc1,
		asyncFunc2,
	});

	Kernel.facade();

	expect(asyncFunc1).toHaveBeenCalled();
	expect(asyncFunc2).toHaveBeenCalled();
});
