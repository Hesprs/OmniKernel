import { expect, test, vi } from 'vitest';
import { Store } from '@';

// Sample values for testing
const initialValue = 'initial';
const newValue = 'updated';

test('Store meta.facade acts as a getter', () => {
	const store = new Store(initialValue);
	expect(store.meta.facade()).toBe(initialValue);
});

test('Store meta.facade acts as a setter', () => {
	const store = new Store(initialValue);
	store.meta.facade(newValue);
	expect(store.value).toBe(newValue);
});

test('Store respects immutable flag and prevents updates', () => {
	const store = new Store(initialValue, { immutable: true });
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	store.meta.facade(newValue);
	expect(store.value).toBe(initialValue);
	expect(warnSpy).toBeCalled();
	warnSpy.mockRestore();
});

test('Store respects silent flag when immutable', () => {
	const store = new Store(initialValue, { immutable: true, silent: true });
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	store.meta.facade(newValue);
	expect(store.value).toBe(initialValue);
	expect(warnSpy).not.toBeCalled();
	warnSpy.mockRestore();
});

test('Store meta.normalizeCallback returns current value', () => {
	const store = new Store(initialValue);
	expect(store.meta.normalizeCallback()).toBe(initialValue);
	store.set(newValue);
	expect(store.meta.normalizeCallback()).toBe(newValue);
});
