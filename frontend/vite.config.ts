import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      // Add your Cloudflare Tunnel domain here when hosting:
      // '<your-subdomain>.<your-domain>.com',
      // 'api.<your-domain>.com'
    ]
  }
})
