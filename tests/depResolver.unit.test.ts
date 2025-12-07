import { expect, test } from 'vitest';
import { FacadeUnit } from '@';
import type { GeneralObject, Unit } from '@/declarations';
import depResolver from '@/utilities/depResolver';

// Mock minimal Unit objects that satisfy the interface
const createUnit = (dependsOn: string[] = []): Unit => ({
	dependsOn,
	facade: undefined as unknown as Facade,
	initiated: false,
	element: class extends FacadeUnit {},
});

test('resolves simple dependency', () => {
	const depList = {
		B: createUnit(),
		A: createUnit(['B']),
	};
	expect(depResolver(depList, ['A'])).toEqual(['B', 'A']);
});

test('resolves multiple dependencies with lex order', () => {
	let depList = {
		B: createUnit(),
		C: createUnit(),
		A: createUnit(['B', 'C']),
	};
	expect(depResolver(depList, ['A'])).toEqual(['B', 'C', 'A']);

	depList = {
		C: createUnit(),
		B: createUnit(['C']),
		A: createUnit(['B']),
	};
	expect(depResolver(depList, ['A'])).toEqual(['C', 'B', 'A']);
});

test('detects cycles', () => {
	let depList: GeneralObject = {
		A: createUnit(['A']),
	};
	expect(() => depResolver(depList, ['A'])).toThrow('Cycle detected in dependencies involving modules: A');

	depList = {
		A: createUnit(['B']),
		B: createUnit(['C']),
		C: createUnit(['A']),
	};
	expect(() => depResolver(depList, ['A'])).toThrow(
		'Cycle detected in dependencies involving modules: A, B, C',
	);
});

test('throws error for missing module in shouldBringUp', () => {
	const depList = {
		A: createUnit(),
	};
	expect(() => depResolver(depList, ['B'])).toThrow('Module "B" not found in dependency list');
});

test('throws error for missing transitive dependency', () => {
	const depList = {
		A: createUnit(['B']),
		B: createUnit(['C']),
	};
	expect(() => depResolver(depList, ['A'])).toThrow(
		'Dependency "C" of module "B" not found in dependency list',
	);
});

test('handles no dependencies', () => {
	const depList = {
		A: createUnit(),
	};
	expect(depResolver(depList, ['A'])).toEqual(['A']);
});
