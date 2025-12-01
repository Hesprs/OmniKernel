import { expect, test } from 'vitest';
import { Store } from '@';
import tokenizer from '@/utilities/tokenizer';

const samplePreserved = { preserved: true };
const sampleFunc = () => {};

test('single value into tokenizer', () => {
	expect(tokenizer('hello')).toEqual([{ label: 'default:store', path: 'facade', value: 'hello' }]);
	expect(tokenizer(undefined)).toEqual([{ label: 'default:store', path: 'facade', value: undefined }]);
	expect(tokenizer(1.1)).toEqual([{ label: 'default:store', path: 'facade', value: 1.1 }]);

	expect(tokenizer(samplePreserved)).toEqual([
		{ label: 'preserved', path: 'facade', value: samplePreserved },
	]);

	expect(tokenizer(sampleFunc)).toEqual([{ label: 'default:runner', path: 'facade', value: sampleFunc }]);

	expect(tokenizer(['Hello', 'World'])).toEqual([{  label: 'default:store', path: 'facade', value: ['Hello', 'World'] }])
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
		{ label: 'preserved', path: 'facade.users.current', value: store },
		{
			label: 'preserved',
			path: 'facade.users.trashcan.samplePreserved',
			value: samplePreserved,
		},
		{ label: 'default:store', path: 'facade.settings.debug', value: true },
	]);
});
