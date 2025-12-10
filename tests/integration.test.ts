import { expect, test, vi } from 'vitest';
import { manifest, OmniFacadeElement, OmniKernel, OmniUnit, Store } from '@';
import type { GeneralObject } from '@/declarations';

test('register a Store element', () => {
	@manifest({ name: 'Test' })
	class Test extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			this.Kernel.register(
				{
					test: 'hello',
				},
				this.facade,
			);

			expect(this.facade.test()).toBe('hello');

			// Update the store
			this.facade.test('world');
			expect(this.facade.test()).toBe('world');
		}
	}
	new OmniKernel([Test]).bringUp();
});

test('register a nested object structure', () => {
	@manifest({ name: 'Test' })
	class Test extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			this.Kernel.register(
				{
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
						loans: {},
					},
				},
				this.facade,
			);
			expect(this.facade.user.firstName()).toBe('John');
			expect(this.facade.user.payments).toBeUndefined(); // empty object auto-trimmed

			expect((this.facade.user.data() as GeneralObject).balance).toBe(100); // user-defined object as primitive

			const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			this.facade.user(); // call a placeholder
			expect(consoleWarn).toBeCalled();
			consoleWarn.mockRestore();

			// normalize should be as-is
			const normalized = this.Kernel.normalize(this.facade.user);
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
		}
	}
	new OmniKernel([Test]).bringUp();
});

test('register a Store with options', () => {
	@manifest({ name: 'Test' })
	class Test extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			this.Kernel.register({ data: 'initial' }, this.facade, { immutable: true, silent: false });

			const normalized = this.Kernel.normalize(this.facade.data);
			expect(normalized).toBe('initial');

			// Test immutability
			const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			this.facade.data('new value');

			expect(this.facade.data()).toBe('initial'); // Should not change
			expect(consoleWarn).toBeCalled();
			consoleWarn.mockRestore();
		}
	}
	new OmniKernel([Test]).bringUp();
});

test('replace irreplaceable element', () => {
	@manifest({ name: 'Test' })
	class Test extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			this.Kernel.register(
				{
					test: 'test',
				},
				this.facade,
				{ irreplaceable: true },
			);

			const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			this.Kernel.register({ test: 'trash' }, this.facade);
			expect(consoleWarn).toHaveBeenCalledWith('[OmniKernel] Element "test" is irreplaceable.');
			consoleWarn.mockRestore();
		}
	}
	new OmniKernel([Test]).bringUp();
});

test('handle onConnected and facade injection when registering', () => {
	class TestElement extends OmniFacadeElement {
		CCB = vi.fn();
		onConnected = this.CCB;
	}

	@manifest({ name: 'Test' })
	class Test extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			const element = new TestElement();
			this.Kernel.register(
				{
					test: element,
				},
				this.facade,
			);

			this.Kernel.register(
				{
					test: {
						test2: 1,
					},
				},
				this.facade,
			);
			expect(element.CCB).toBeCalledWith();
			expect(this.facade.test()).toEqual(
				(this.Kernel.normalize(this.facade.test) as GeneralObject).value,
			);
			expect(element.facades[0].test2()).toEqual(1);
			expect(element.facades[1]()).toBeInstanceOf(Test);
		}
	}
	new OmniKernel([Test]).bringUp();
});

test('delete a facade', () => {
	@manifest({ name: 'Test' })
	class Test extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			this.Kernel.register({ test: 'test' }, this.facade);
			this.Kernel.register(
				{
					test: {
						child: 'child',
					},
				},
				this.facade,
			);
			expect(this.facade.test).toBeDefined();
			this.Kernel.delete(this.facade.test); // delete a branch
			expect(this.facade.test).toBeUndefined();

			this.Kernel.delete(this.facade); // try to delete root facade
			expect(this.facade.test).toBeUndefined(); // clear all children
			expect(this.facade).toBeDefined(); // preserve itself
			const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			expect(this.facade()).toBeUndefined(); // clear itself
			expect(consoleWarn).toHaveBeenCalled();
			consoleWarn.mockRestore();
			expect(this.dispose).toBeCalled();
		}

		dispose = vi.fn();
	}
	new OmniKernel([Test]).bringUp();
});

test('registerCall', () => {
	@manifest({ name: 'Test' })
	class Test extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			this.Kernel.register(
				{
					test: 'test',
				},
				this.facade,
			);
			this.Kernel.registerCall(
				{
					test: 'trash',
					test2: 'test2',
				},
				this.facade,
			);
			expect(this.facade.test2()).toBe('test2');
			this.Kernel.register(
				{
					test2: 'trash',
				},
				this.facade,
			);

			expect(this.facade.test()).toBe('trash');
			expect(this.facade.test2()).toBe('test2');
		}
	}
	new OmniKernel([Test]).bringUp();
});

test('dependency resolution', () => {
	const test1OnConnected = vi.fn();
	const test2OnConnected = vi.fn();
	const test1OnDisconnected = vi.fn();
	const test2OnDisconnected = vi.fn();
	const test3OnConnected = vi.fn();
	const test3OnDisconnected = vi.fn();
	@manifest({ name: 'test1' })
	class Test1 extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			test1OnConnected();
		}
		dispose = test1OnDisconnected;
	}
	@manifest({
		name: 'test2',
		dependsOn: ['test1'],
	})
	class Test2 extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			test2OnConnected();
		}
		dispose = test2OnDisconnected;
	}
	@manifest({
		name: 'test3',
		dependsOn: ['test1', 'test2'],
	})
	class Test3 extends OmniUnit {
		constructor(...args: UnitArgs) {
			super(...args);
			test3OnConnected();
			expect(this.deps.test1).toBeDefined();
			expect(this.deps.test2()).toBeInstanceOf(Test2);
		}
		dispose = test3OnDisconnected;
	}

	expect(Test2[Symbol.metadata]).toEqual({
		name: 'test2',
		dependsOn: ['test1'],
	});

	const Kernel = new OmniKernel([Test1, Test2, Test3]);

	Kernel.bringUp(['test3']); // correct order:  test1, test2, test3
	expect(test1OnConnected).toHaveBeenCalled();
	expect(test2OnConnected).toHaveBeenCalled();
	expect(test3OnConnected).toHaveBeenCalled();
	expect(test2OnConnected).toHaveBeenCalledAfter(test1OnConnected);
	expect(test3OnConnected).toHaveBeenCalledAfter(test2OnConnected);
	expect('test1' in Kernel.getRunningUnits()).toBe(true);

	Kernel.shutDown(); // correct order:  test3, test2, test1
	expect(test3OnDisconnected).toHaveBeenCalled();
	expect(test2OnDisconnected).toHaveBeenCalled();
	expect(test1OnDisconnected).toHaveBeenCalled();
	expect(test2OnDisconnected).toHaveBeenCalledBefore(test1OnDisconnected);
	expect(test3OnDisconnected).toHaveBeenCalledBefore(test2OnDisconnected);
	expect(Object.keys(Kernel.getRunningUnits()).length).toBe(0);
});
