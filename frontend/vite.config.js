import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit slightly
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          react: ["react", "react-dom"],
          lucide: ["lucide-react"],
        },
      },
    },
    // Enable minification
    minify: "esbuild",
    // Enable source maps for production debugging (set to false to reduce size)
    sourcemap: false,
    // Target modern browsers for smaller output
    target: "es2020",
  },
  // Optimise dependency pre-bundling
  optimizeDeps: {
    include: ["react", "react-dom", "lucide-react"],
  },
});
