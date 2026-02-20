
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["server/tests/**/*.test.ts"],
        /* DO NOT use testSetupFiles here unless needed; we don't have a setup file yet */
    },
    resolve: {
        alias: {
            "@shared": path.resolve(__dirname, "./shared"),
        },
    },
});
