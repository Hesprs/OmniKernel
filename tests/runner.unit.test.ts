import { expect, test, vi } from 'vitest';
import { Runner } from '@';

// Create sample functions for testing
const sampleFunc = () => 'original';
const newFunc = () => 'updated';

test('Runner executes the stored function', () => {
	const runner = new Runner(sampleFunc);
	expect(runner.run()).toBe('original');
	expect(runner.facadeOverride()).toBe('original');
});

test('Runner can update its function with set()', () => {
	const runner = new Runner(sampleFunc);
	runner.set(newFunc);
	expect(runner.run()).toBe('updated');
	expect(runner.facadeOverride()).toBe('updated');
});

test('Runner respects immutable flag and prevents updates', () => {
	const monitoredFunc = vi.fn(sampleFunc);
	const runner = new Runner(monitoredFunc, { immutable: true, immediate: true });
	// immediate flag should trigger the function to run immediately
	expect(monitoredFunc).toBeCalled();
	// Capture console.warn calls
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	runner.set(vi.fn(newFunc));
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
	expect(runner.onNormalize()).toBe(sampleFunc);
	runner.set(newFunc);
	expect(runner.onNormalize()).toBe(newFunc);
});
