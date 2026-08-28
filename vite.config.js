import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/courses': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req, res) => {
          if (req.headers.accept && req.headers.accept.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ai': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/audit': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Use regex proxies so Vite only forwards actual API calls, NOT bare SPA route loads.
      // The frontend routes /challenges/search, /challenges/login, /challenges/files
      // must be handled by React Router — they cannot be intercepted by this proxy.
      '^/challenges/search': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          // Only proxy if there is a query string (real API call: ?q=...)
          // Otherwise let React Router handle the bare /challenges/search SPA route
          if (!req.url.includes('?')) return req.url;
        },
      },
      '^/challenges/login$': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          // Only proxy POST requests; GET /challenges/login is the SPA route
          if (req.method === 'GET') return req.url;
        },
      },
      '^/challenges/reports/evaluate': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '^/challenges/files/\\d+': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '^/challenges/\\d': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
