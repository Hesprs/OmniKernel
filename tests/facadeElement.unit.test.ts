import { expect, test, vi } from 'vitest';
import { FacadeElement, type OmniKernel } from '@';

class TestFacadeElement extends FacadeElement {}

// Create a minimal mock Facade that satisfies the interface
const createMockFacade = (): Facade => {
	const facade = () => undefined;
	return facade as Facade;
};

test('handles facades property', () => {
	const element = new TestFacadeElement();
	expect(() => element.facades).toThrow(
		'[OmniKernel] Cannot get rootFacade since the element is not yet in the facade tree.',
	);
	const mockFacade = createMockFacade();
	element.facadeInjections.facades = [mockFacade];
	expect(element.facades).toEqual([mockFacade]);
});

test('handles facadeName property', () => {
	const element = new TestFacadeElement();
	expect(() => element.facadeName).toThrow(
		'[OmniKernel] Cannot get facadeName since the element is not yet in the facade tree.',
	);
	element.facadeInjections.facadeName = 'test-element';
	expect(element.facadeName).toBe('test-element');
});

test('handles Kernel property', () => {
	const element = new TestFacadeElement();
	expect(() => element.Kernel).toThrow(
		'[OmniKernel] Cannot get Kernel since the element is not yet in the facade tree.',
	);

	// Create a minimal object that satisfies the OmniKernel structure needed for testing
	const mockKernel = {
		facadeMap: new Map(),
		units: {},
		facade: createMockFacade(),
		record: vi.fn(),
		bringUp: vi.fn(),
		shutDown: vi.fn(),
		register: vi.fn(),
		registerCall: vi.fn(),
		normalize: vi.fn(),
		delete: vi.fn(),
		walker: vi.fn(),
		registerAt: vi.fn(),
		registerCallAt: vi.fn(),
	} as unknown as OmniKernel;
	element.facadeInjections.Kernel = mockKernel;
	expect(element.Kernel).toBe(mockKernel);
});
