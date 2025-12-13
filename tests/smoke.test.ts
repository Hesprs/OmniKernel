import { expect, test } from 'vitest';
import { OmniKernel, OmniUnit } from '@';

class Test extends OmniUnit<UnitArgs> {}

test('instantiate OmniKernel', () => {
	expect(OmniKernel).toBeDefined();
	expect(OmniKernel).toBeInstanceOf(Object);

	expect(() => {
		new OmniKernel([Test]);
	}).toThrow('"Test" is not a facade unit, consider using @manifest decorator to give it a name.');
	const Kernel = new OmniKernel();
	expect(Kernel).toBeInstanceOf(OmniKernel);

	expect(Kernel).toHaveProperty('register');
	expect(Kernel).toHaveProperty('record');
	expect(Kernel).toHaveProperty('normalize');
	expect(Kernel).toHaveProperty('delete');
	expect(Kernel).toHaveProperty('bringUp');
	expect(Kernel).toHaveProperty('shutDown');
	expect(Kernel).toHaveProperty('registerCall');
	expect(Kernel).toHaveProperty('getRunningUnits');
});
