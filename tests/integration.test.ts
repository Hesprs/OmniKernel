import { expect, test, vi } from 'vitest';
import { OmniKernel, Store } from '@';

test('register a Store element', () => {
	const Kernel = new OmniKernel();
	Kernel.register('hello');

	// The root facade should now have a index rather than 'placeholder'
	expect(Kernel.facade.name).not.toBe('placeholder');
	expect(Kernel.facade()).toBe('hello');

	// Update the store
	Kernel.facade('world');
	expect(Kernel.facade()).toBe('world');
});

test('register a nested object structure', () => {
	const Kernel = new OmniKernel();
	const toRegister = {
		user: {
			firstName: 'John',
			age: 30,
			preferences: {
				theme: 'dark',
			},
			data: new Store({
				balance: 100,
				transactions: [],
			}),
			payments: {},
		},
	};
	Kernel.register(toRegister);
	const facade = Kernel.facade;

	expect(facade.user.firstName()).toBe('John');
	expect(facade.user.payments).toBeUndefined(); // empty object auto-trimmed

	expect((facade.user.data() as GeneralObject).balance).toBe(100); // user-defined object as primitive

	const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	expect(facade.user.name).toBe('placeholder');
	facade.user(); // call a placeholder
	expect(consoleWarn).toHaveBeenCalled();
	consoleWarn.mockRestore();

	// normalize should be as-is
	const normalized = Kernel.normalize(facade.user);
	expect(normalized).toEqual({
		firstName: 'John',
		age: 30,
		data: {
			balance: 100,
			transactions: [],
		},
		preferences: {
			theme: 'dark',
		},
	});
});

test('transplant the a branch facade', () => {
	const Kernel = new OmniKernel();
	Kernel.register({
		user: {
			firstName: 'John',
			theme: 'dark',
		},
	});
	expect(Kernel.facade.user.name).toBe('placeholder');

	Kernel.register({ user: 'user' });	
	expect(Kernel.normalize(Kernel.facade)).toEqual({
		user: {
			_self: 'user',
			firstName: 'John',
			theme: 'dark',
		},
	});
});

test('register a Runner function', () => {
	const Kernel = new OmniKernel();
	const mockFunction = vi.fn(() => 'ran');
	Kernel.register(mockFunction);

	expect(Kernel.facade()).toBe('ran');
	expect(mockFunction).toBeCalled();

	const normalized = Kernel.normalize(Kernel.facade) as GeneralObject;
	expect(normalized).toBeInstanceOf(Function);
});

test('register a Store with options', () => {
	const Kernel = new OmniKernel();
	const storeValue = { data: 'initial' };
	Kernel.register(storeValue, { immutable: true, silent: false });
	const facade = Kernel.facade;

	const normalized = Kernel.normalize(facade.data);
	expect(normalized).toBe('initial');

	// Test immutability
	const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	facade.data('new value');

	expect(facade.data()).toBe('initial'); // Should not change
	expect(consoleWarn).toHaveBeenCalled();

	consoleWarn.mockRestore();
});

test('handle connectedCallback when registering', () => {
	const Kernel = new OmniKernel();

	const callback = vi.fn();
	const elementWithCallback: GeneralElement = {
		preserved: true,
		meta: {
			signature: 'test:element',
			connectedCallback: callback,
		},
	};

	Kernel.register(elementWithCallback);
	expect(callback).toBeCalled();
});
