import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // esbuild handles the JSX transform directly; @vitejs/plugin-react is not
  // installable here (it peers on vite 8, this repo is on vite 7) and is not
  // needed — these are plain render assertions, not fast-refresh dev.
  esbuild: { jsx: "automatic" },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environment: "node",
    environmentMatchGlobs: [["tests/**/*.test.tsx", "jsdom"]],
    // The section registry pulls in InlineSignupForm, which initialises
    // Firebase at import time and throws on a missing key. These are inert
    // placeholders so a render test can mount the page tree.
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "0",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:0:web:0",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
