// @ts-nocheck

export function getScaffold(framework, language, projectName) {
  const name = projectName.toLowerCase().replace(/\s+/g, "-");
  const isTS = language === "TypeScript";

  const scaffolds = {
    React: {
      "package.json": JSON.stringify(
        {
          name,
          version: "0.0.1",
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
          devDependencies: {
            "@vitejs/plugin-react": "^4.3.1",
            vite: "^6.0.0",
            ...(isTS
              ? {
                  typescript: "^5.0.0",
                  "@types/react": "^18.0.0",
                  "@types/react-dom": "^18.0.0",
                }
              : {}),
          },
        },
        null,
        2,
      ),

      "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${isTS ? "tsx" : "jsx"}"></script>
  </body>
</html>`,

      [`src/main.${isTS ? "tsx" : "jsx"}`]: `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.${isTS ? "tsx" : "jsx"}'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)`,

      [`src/App.${isTS ? "tsx" : "jsx"}`]: `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>${projectName}</h1>
      <p>Edit <code>src/App.${isTS ? "tsx" : "jsx"}</code> to get started</p>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  )
}

export default App`,

      "src/index.css": `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #ffffff; }`,

      "vite.config.js": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
    },

    SvelteKit: {
      "package.json": JSON.stringify(
        {
          name,
          version: "0.0.1",
          type: "module",
          scripts: {
            dev: "vite dev",
            build: "vite build",
            preview: "vite preview",
            prepare: "svelte-kit sync",
          },
          dependencies: {},
          devDependencies: {
            "@sveltejs/adapter-auto": "^3.0.0",
            "@sveltejs/kit": "^2.0.0",
            "@sveltejs/vite-plugin-svelte": "^4.0.0",
            svelte: "^5.0.0",
            vite: "^6.0.0",
            tailwindcss: "^4.0.0",
            "@tailwindcss/vite": "^4.0.0",
          },
        },
        null,
        2,
      ),

      "svelte.config.js": `import adapter from '@sveltejs/adapter-auto'

export default {
  kit: { adapter: adapter() }
}`,

      "vite.config.js": `import { defineConfig }   from 'vite'
import { sveltekit }     from '@sveltejs/vite-plugin-svelte'
import tailwindcss       from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
})`,

      "src/app.css": `@import 'tailwindcss';`,

      "src/app.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`,

      "src/routes/+layout.svelte": `<script>
  import '../app.css'
  let { children } = $props()
</script>

{@render children()}`,

      "src/routes/+page.svelte": `<script>
  let count = $state(0)
</script>

<div class="min-h-screen flex items-center justify-center bg-white">
  <div class="text-center">
    <h1 class="text-4xl font-bold mb-4">${projectName}</h1>
    <p class="text-gray-500 mb-6">Edit src/routes/+page.svelte to get started</p>
    <button
      onclick={() => count++}
      class="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
    >
      Count: {count}
    </button>
  </div>
</div>`,
    },

    "Next.js": {
      "package.json": JSON.stringify(
        {
          name,
          version: "0.0.1",
          scripts: {
            dev: "next dev",
            build: "next build",
            start: "next start",
          },
          dependencies: {
            next: "^15.0.0",
            react: "^18.3.1",
            "react-dom": "^18.3.1",
          },
          devDependencies: {
            tailwindcss: "^3.4.0",
            ...(isTS
              ? {
                  typescript: "^5.0.0",
                  "@types/react": "^18.0.0",
                  "@types/node": "^20.0.0",
                }
              : {}),
          },
        },
        null,
        2,
      ),

      "app/layout.jsx": `import './globals.css'

export const metadata = { title: '${projectName}' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,

      "app/page.jsx": `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">${projectName}</h1>
      <p className="mt-4 text-gray-500">Edit app/page.jsx to get started</p>
    </main>
  )
}`,

      "app/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;`,

      "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig`,

      "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}`,
    },

    Elysia: {
      "package.json": JSON.stringify(
        {
          name,
          version: "0.0.1",
          type: "module",
          scripts: {
            dev: "bun run --watch src/index.ts",
            start: "bun src/index.ts",
          },
          dependencies: { elysia: "^1.2.0" },
        },
        null,
        2,
      ),

      "src/index.ts": `import { Elysia } from 'elysia'

const app = new Elysia()

app.get('/', () => ({
  message: 'Welcome to ${projectName}',
  status: 'running',
}))

app.get('/health', () => ({ status: 'ok' }))

app.listen(3000)

console.log(\`🦊 ${projectName} running at http://localhost:3000\`)`,

      "README.md": `# ${projectName}

Built with Bun + Elysia

## Development

\`\`\`bash
bun install
bun run dev
\`\`\`
`,
    },

    Vue: {
      "package.json": JSON.stringify(
        {
          name,
          version: "0.0.1",
          type: "module",
          scripts: { dev: "vite", build: "vite build" },
          dependencies: { vue: "^3.4.0" },
          devDependencies: { "@vitejs/plugin-vue": "^5.0.0", vite: "^6.0.0" },
        },
        null,
        2,
      ),

      "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,

      "src/main.js": `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,

      "src/App.vue": `<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <div style="text-align:center; padding:2rem">
    <h1>${projectName}</h1>
    <p>Edit <code>src/App.vue</code> to get started</p>
    <button @click="count++">Count: {{ count }}</button>
  </div>
</template>`,

      "vite.config.js": `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({ plugins: [vue()] })`,
    },

    Astro: {
      "package.json": JSON.stringify(
        {
          name,
          version: "0.0.1",
          type: "module",
          scripts: {
            dev: "astro dev",
            build: "astro build",
            preview: "astro preview",
          },
          dependencies: { astro: "^4.0.0" },
        },
        null,
        2,
      ),

      "astro.config.mjs": `import { defineConfig } from 'astro/config'
export default defineConfig({})`,

      "src/pages/index.astro": `---
const title = '${projectName}'
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <p>Edit src/pages/index.astro to get started</p>
  </body>
</html>`,

      "src/layouts/Layout.astro": `---
const { title } = Astro.props
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>`,
    },

    None: {
      "README.md": `# ${projectName}\n\nStart coding here.\n`,
      "index.js": `// ${projectName}\nconsole.log('Hello from ${projectName}')\n`,
    },
  };

  return scaffolds[framework] ?? scaffolds["None"];
}
