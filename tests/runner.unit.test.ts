import { expect, test, vi } from 'vitest';
import { Runner } from '@';

// Create sample functions for testing
const sampleFunc = () => 'original';
const newFunc = () => 'updated';

test('Runner executes the stored function', () => {
	const runner = new Runner(sampleFunc);
	expect(runner.run()).toBe('original');
	expect(runner.meta.facade()).toBe('original');
});

test('Runner can update its function with set()', () => {
	const runner = new Runner(sampleFunc);
	runner.set(newFunc);
	expect(runner.run()).toBe('updated');
	expect(runner.meta.facade()).toBe('updated');
});

test('Runner respects immutable flag and prevents updates', () => {
	const runner = new Runner(sampleFunc, { immutable: true });
	// Capture console.warn calls
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	runner.set(newFunc);
	expect(runner.run()).toBe('original'); // Function should not have changed
	expect(warnSpy).toBeCalled();
	warnSpy.mockRestore(); // Clean up the spy
});

test('Runner respects silent flag when immutable and suppresses warnings', () => {
	const runner = new Runner(sampleFunc, { immutable: true, silent: true });
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	runner.set(newFunc);
	expect(runner.run()).toBe('original'); // Function should not have changed
	expect(warnSpy).not.toBeCalled();
	warnSpy.mockRestore();
});

test('Runner meta.normalizeCallback returns the current function', () => {
	const runner = new Runner(sampleFunc);
	expect(runner.meta.normalizeCallback()).toBe(sampleFunc);
	runner.set(newFunc);
	expect(runner.meta.normalizeCallback()).toBe(newFunc);
});
