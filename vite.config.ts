/// <reference types="vitest/config" />
import { resolve } from 'node:path';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'OmniKernel',
			formats: ['es', 'cjs'],
			fileName: format => `index.${format === 'cjs' ? 'cjs' : 'js'}`,
		},
		rollupOptions: {
			// Externalize dependencies that shouldn't be bundled
			output: {
				plugins: [terser()],
			},
		},
		emptyOutDir: true,
		sourcemap: true,
		minify: 'esbuild',
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src/'),
		},
	},
	plugins: [
		dts({
			insertTypesEntry: true, // Auto-adds "types" field to package.json
			include: ['src'], // Source files to process
		}),
	],
	test: {},
});
