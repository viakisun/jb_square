import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		paths: {
			// 프로덕션: admin.jb2.kr (서브도메인)
			// 로컬: localhost:5174 (별도 포트)
			base: process.env.PUBLIC_BASE_PATH || ''
		}
	}
};

export default config;
