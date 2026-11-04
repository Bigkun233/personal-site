// vite.config.ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目站点走 /personal-site/ 子路径；本地 dev/preview 也用同一 base，保持行为一致
  // 若日后绑自定义域名或改为 Bigkun233.github.io 根站点，把这里改成 '/'
  base: process.env.VITE_BASE ?? '/personal-site/',
  plugins: [react(), tailwindcss()],
  server: {
    // 允许通过反向代理 / 隧道域名（如 *.lhr.life）访问，仅影响本地 dev 预览
    allowedHosts: true,
  },
})
