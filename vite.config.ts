/// <reference types="vitest/config" />

import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import { type ConfigEnv, defineConfig, type UserConfig } from 'vite';

const mainConfig: UserConfig = {
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
};

const cliConfig: UserConfig = {
	build: {
		lib: {
			entry: resolve(__dirname, 'src/typeGen/index.ts'),
			formats: ['cjs'],
			fileName: `cli.cjs`,
		},
		rollupOptions: {
			external: [...builtinModules, /^node:/, 'ts-morph'],
			input: {
				cli: resolve(__dirname, 'src/typeGen/index.ts'),
			},
			output: {
				dir: resolve(__dirname, 'dist'),
				banner: "#!/usr/bin/env node\n'use strict';",
			},
		},
		emptyOutDir: false,
		target: 'node18',
		ssr: true,
		minify: false,
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src/'),
		},
	},
	server: { hmr: false },
	optimizeDeps: { noDiscovery: true, include: undefined },
};

export default defineConfig((env: ConfigEnv) => {
	return env.mode === 'cli' ? cliConfig : mainConfig;
});
