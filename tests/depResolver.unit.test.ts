/** biome-ignore-all lint/complexity/useLiteralKeys: required for testing */
import { expect, test } from 'vitest';
import { manifest, OmniKernel, OmniUnit } from '@';
import depResolver from '@/utilities/depResolver';

// Create manifest-decorated classes for testing
@manifest({ name: 'B' })
class B extends OmniUnit<UnitArgs> {}

@manifest({ name: 'A', dependsOn: ['B'] })
class A extends OmniUnit<UnitArgs> {}

@manifest({ name: 'C' })
class C extends OmniUnit<UnitArgs> {}

@manifest({ name: 'D', dependsOn: ['C'] })
class D extends OmniUnit<UnitArgs> {}

@manifest({ name: 'E', dependsOn: ['D'] })
class E extends OmniUnit<UnitArgs> {}

@manifest({ name: 'F', requires: ['G'] })
class F extends OmniUnit<UnitArgs> {}

@manifest({ name: 'G' })
class G extends OmniUnit<UnitArgs> {}

@manifest({ name: 'X', requires: ['Y'] })
class X extends OmniUnit<UnitArgs> {}

@manifest({ name: 'Y', requires: ['X'] })
class Y extends OmniUnit<UnitArgs> {}

@manifest({ name: 'H', dependsOn: ['H'] })
class H extends OmniUnit<UnitArgs> {}

@manifest({ name: 'I', dependsOn: ['J'] })
class I extends OmniUnit<UnitArgs> {}

@manifest({ name: 'J', dependsOn: ['K'] })
class J extends OmniUnit<UnitArgs> {}

@manifest({ name: 'K', dependsOn: ['I'] })
class K extends OmniUnit<UnitArgs> {}

@manifest({ name: 'L' })
class L extends OmniUnit<UnitArgs> {}

@manifest({ name: 'M', dependsOn: ['N'] })
class M extends OmniUnit<UnitArgs> {}

@manifest({ name: 'N', dependsOn: ['O'] })
class N extends OmniUnit<UnitArgs> {}

@manifest({ name: 'P' })
class P extends OmniUnit<UnitArgs> {}

test('resolves simple dependency', () => {
	const Kernel = new OmniKernel([A, B]); // Register units with dependencies
	expect(depResolver(Kernel['units'], ['A'])).toEqual(['B', 'A']);
});

test('resolves multiple dependencies with lex order', () => {
	// Test case 1: A -> B, C
	const Kernel1 = new OmniKernel([A, B, C]);
	expect(depResolver(Kernel1['units'], ['A'])).toEqual(['B', 'A']);

	// Test case 2: A -> B -> C
	const Kernel2 = new OmniKernel([E, D, C]);
	expect(depResolver(Kernel2['units'], ['E'])).toEqual(['C', 'D', 'E']);
});

test('detects cycles', () => {
	// Self-cycle: H -> H
	const Kernel1 = new OmniKernel([H]);
	expect(() => depResolver(Kernel1['units'], ['H'])).toThrow(
		'[OmniKernel] Hard dependency cycle detected involving modules: H.',
	);

	// Circular cycle: I -> J -> K -> I
	const Kernel2 = new OmniKernel([I, J, K]);
	expect(() => depResolver(Kernel2['units'], ['I'])).toThrow(
		'[OmniKernel] Hard dependency cycle detected involving modules: I, J, K.',
	);
});

test('throws error for missing module in shouldBringUp', () => {
	const Kernel = new OmniKernel([P]);
	expect(() => depResolver(Kernel['units'], ['Q'])).toThrow(
		'[OmniKernel] Module "Q" not found in dependency list.',
	);
});

test('throws error for missing transitive dependency', () => {
	const Kernel = new OmniKernel([M, N]); // Missing O
	expect(() => depResolver(Kernel['units'], ['M'])).toThrow(
		'[OmniKernel] Dependency "O" of module "N" not found in dependency list.',
	);
});

test('handles no dependencies', () => {
	const Kernel = new OmniKernel([L]);
	expect(depResolver(Kernel['units'], ['L'])).toEqual(['L']);
});

test('resolves soft dependencies (requires) without affecting hard dependency order', () => {
	const Kernel = new OmniKernel([F, G]);
	expect(depResolver(Kernel['units'], ['F'])).toEqual(['F', 'G']);
});

test('handles mutual requires without creating hard dependency cycles', () => {
	const Kernel = new OmniKernel([X, Y]);
	expect(depResolver(Kernel['units'], ['X'])).toEqual(['X', 'Y']); // Lexicographical order since no hard dependencies
});

test('includes required modules in dependency closure without ordering constraints', () => {
	// Create a scenario where A dependsOn B, and C requires B
	@manifest({ name: 'A', dependsOn: ['B'] })
	class A extends OmniUnit<UnitArgs> {}

	@manifest({ name: 'B' })
	class B extends OmniUnit<UnitArgs> {}

	@manifest({ name: 'C', requires: ['B'] })
	class C extends OmniUnit<UnitArgs> {}

	const Kernel = new OmniKernel([A, B, C]);
	const result = depResolver(Kernel['units'], ['A', 'C']);
	expect(result).toContain('B');
	expect(result.indexOf('B')).toBeLessThan(result.indexOf('A')); // B must come before A (hard dependency)
	expect(result.indexOf('B')).toBeLessThan(result.indexOf('C')); // B must come before C (soft dependency inclusion)
});
