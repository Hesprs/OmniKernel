import { expect, test } from 'vitest';
import { Store } from '@';
import tokenizer from '@/utilities/tokenizer';

const samplePreserved = { preserved: true };
const sampleFunc = () => {};

test('single value into tokenizer', () => {
	expect(tokenizer('hello')).toEqual([{ label: 'default:store', path: 'root', value: 'hello' }]);
	expect(tokenizer(undefined)).toEqual([
		{ label: 'default:store', path: 'root', value: undefined },
	]);
	expect(tokenizer(1.1)).toEqual([{ label: 'default:store', path: 'root', value: 1.1 }]);

	expect(tokenizer(samplePreserved)).toEqual([
		{ label: 'preserved', path: 'root', value: samplePreserved },
	]);

	expect(tokenizer(sampleFunc)).toEqual([
		{ label: 'default:runner', path: 'root', value: sampleFunc },
	]);
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
		{ label: 'preserved', path: 'root.users.current', value: store },
		{
			label: 'preserved',
			path: 'root.users.trashcan.samplePreserved',
			value: samplePreserved,
		},
		{ label: 'default:store', path: 'root.settings.debug', value: true },
	]);
});
