import { expect, test, vi } from 'vitest';
import { dummyFacade, OmniKernel, Store } from '@';
import type { GeneralObject } from '@/declarations';

test('register a Store element', () => {
	const Kernel = new OmniKernel();
	Kernel.register('hello');
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
	facade.user(); // call a placeholder
	expect(consoleWarn).toBeCalled();
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

test('transplant a branch facade', () => {
	const Kernel = new OmniKernel();
	Kernel.register({
		user: {
			firstName: 'John',
			theme: 'dark',
		},
	});

	Kernel.register({ user: 'user' });
	expect(Kernel.normalize(Kernel.facade)).toEqual({
		user: {
			_self: 'user',
			firstName: 'John',
			theme: 'dark',
		},
	});
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
	expect(consoleWarn).toBeCalled();

	consoleWarn.mockRestore();
});

test('handle connectedCallback and facade injection when registering', () => {
	const Kernel = new OmniKernel();
	Kernel.register('context');

	class TestElement implements GeneralElement {
		preserved = true;
		CCB = vi.fn();
		meta = {
			signature: 'test:element',
			connectedCallback: this.CCB,
			thisFacade: dummyFacade,
			parentFacade: dummyFacade,
		};
	}

	const element = new TestElement();

	Kernel.register({
		test: element,
	});
	Kernel.register('parent');
	Kernel.register({
		test: {
			test2: 1,
		},
	});
	expect(element.CCB).toBeCalledWith();
	expect(Kernel.facade.test()).toEqual((Kernel.normalize(Kernel.facade.test) as GeneralObject)._self);
	expect(element.meta.thisFacade.test2()).toEqual(1);
	expect(element.meta.parentFacade()).toBe('parent');

	// parentFacade update after transplant
	Kernel.register('parent2');
	expect(element.meta.parentFacade()).toBe('parent2');

	// root facade cannot have parent
	const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	Kernel.register(new TestElement());
	expect(consoleWarn).toBeCalled();

	consoleWarn.mockRestore();
});
