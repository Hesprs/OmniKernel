import { expect, test, vi } from 'vitest';
import { Hook, OmniKernel } from '@';
import type { GeneralObject } from '@/declarations';

test('Hook run() executes synchronous functions from thisFacade', () => {
	const Kernel = new OmniKernel();
	const hook = new Hook();
	const func1 = vi.fn();
	const func2 = vi.fn();

	// Mock the thisFacade to contain our test functions
	Kernel.register(hook);
	Kernel.register({
		1: func1,
		2: func2,
	});

	Kernel.facade();

	expect(func1).toBeCalled();
	expect(func2).toBeCalled();

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

	expect(asyncFunc1).toBeCalled();
	expect(asyncFunc2).toBeCalled();
});
