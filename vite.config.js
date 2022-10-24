import {defineConfig} from "vite";
import ViteComponents from "vite-plugin-components";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    siteName: "dessert-person",
    resolve: {
        alias: [{find: "@", replacement: "/src"}],
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
                @import "src/styles/animations.scss";
                @import "src/styles/colors.scss";
                @import "src/styles/fonts.scss";
                @import "src/styles/layout.scss";
                `,
            },
        },
    },
    assetsInclude: ["**/*.otf", "**/*.woff", "**/*.woff2", "**/*.png"],
    filenameHashing: false,
    plugins: [
        ViteComponents(),
        vue({
            include: [/\.vue$/, /\.md$/], // <--
        }),
        ViteComponents({
            // allow auto load markdown components under `./src/components/`
            extensions: ["vue", "md"],

            // allow auto import and register components used in markdown
            customLoaderMatcher: id => id.endsWith(".md"),
        }),
    ],
    ssgOptions: {
        script: "async",
        formatting: "minify",
        format: "cjs",
    },
});
