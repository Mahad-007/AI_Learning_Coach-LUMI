import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'tanstack': ['@tanstack/react-query'],
          'supabase': ['@supabase/supabase-js'],
          // Feature chunks
          'charts': ['recharts'],
          'animations': ['framer-motion'],
          'canvas': ['react-konva', 'konva'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1500,
    // Enable sourcemaps for production debugging
    sourcemap: false,
    // Use esbuild for minification (faster and built-in)
    minify: 'esbuild',
    target: 'esnext',
  },
  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
  // Performance settings
  server: {
    hmr: {
      overlay: true,
    },
  },
});
