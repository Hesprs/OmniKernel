import { expect, test } from 'vitest';
import { OmniKernel } from '@';

test('instantiate OmniKernel', () => {
	expect(OmniKernel).toBeDefined();
	expect(OmniKernel).toBeInstanceOf(Object);

	const Kernel = new OmniKernel();
	expect(Kernel).toBeInstanceOf(OmniKernel);

	expect(Kernel).toHaveProperty('facade');
	expect(Kernel).toHaveProperty('register');
	expect(Kernel).toHaveProperty('registerAt');
	expect(Kernel).toHaveProperty('normalize');

	expect(Kernel.facade).toBeInstanceOf(Function);
});
