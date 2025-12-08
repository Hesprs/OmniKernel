/// <reference types="vitest/config" />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'OmniKernel',
			formats: ['es', 'cjs'],
			fileName: format => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
		},
		emptyOutDir: true,
		sourcemap: true,
		minify: 'terser',
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src/'),
		},
	},
});
