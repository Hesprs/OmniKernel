import { expect, test } from 'vitest';
import { Store } from '@';
import { tokenizer } from '@/utilities/tokenizer';

const samplePreserved = new Store('hello');
const sampleFunc = () => {};

test('single value into tokenizer', () => {
	expect(tokenizer('hello')).toEqual([{ label: 'store', path: [], value: 'hello' }]);
	expect(tokenizer(undefined)).toEqual([{ label: 'store', path: [], value: undefined }]);
	expect(tokenizer(1.1)).toEqual([{ label: 'store', path: [], value: 1.1 }]);

	expect(tokenizer(samplePreserved)).toEqual([{ label: 'preserved', path: [], value: samplePreserved }]);

	expect(tokenizer(sampleFunc)).toEqual([{ label: 'runner', path: [], value: sampleFunc }]);

	expect(tokenizer(['Hello', 'World'])).toEqual([{ label: 'store', path: [], value: ['Hello', 'World'] }]);
});

test('nested object into tokenizer', () => {
	const store = new Store(sampleFunc);
	expect(
		tokenizer({
			users: {
				current: store,
				trashcan: {
					samplePreserved,
				},
			},
			settings: {
				debug: true,
			},
		}),
	).toEqual([
		{ label: 'preserved', path: ['users', 'current'], value: store },
		{
			label: 'preserved',
			path: ['users', 'trashcan', 'samplePreserved'],
			value: samplePreserved,
		},
		{ label: 'store', path: ['settings', 'debug'], value: true },
	]);
});
