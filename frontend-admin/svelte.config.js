import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "index.html",
      precompress: false,
      strict: true,
    }),
    paths: {
      // 프로덕션: admin.jb2.kr (서브도메인)
      // 로컬: localhost:5174 (별도 포트)
      base: process.env.PUBLIC_BASE_PATH || "",
    },
  },

  // Disable some accessibility warnings for production build
  onwarn: (warning, handler) => {
    // Ignore specific a11y warnings that don't affect functionality
    if (
      warning.code === "a11y_autofocus" ||
      warning.code === "a11y_no_noninteractive_tabindex" ||
      warning.code === "a11y_click_events_have_key_events" ||
      warning.code === "a11y_no_static_element_interactions" ||
      warning.code === "a11y_label_has_associated_control" ||
      warning.code === "a11y_no_redundant_roles"
    ) {
      return;
    }
    handler(warning);
  },
};

export default config;
