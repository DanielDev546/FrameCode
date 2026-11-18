// @ts-nocheck

function getLanguageScaffold(language, framework, projectName) {
  const name =
    projectName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "my-project";

  const className =
    projectName
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[^a-zA-Z]+/, "") || "Main";

  // JAVA
  if (language === "Java") {
    if (framework === "Gradle") {
      return {
        "settings.gradle": `rootProject.name = '${name}'`,

        "build.gradle": `plugins {
    id 'java'
}

group = 'com.framecode'
version = '1.0.0'

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}`,

        "src/main/java/Main.java": `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from ${projectName}!");
    }
}`,

        "README.md": `# ${projectName}

Java project powered by Gradle.

## Run

\`\`\`bash
gradle run
\`\`\`
`,
        ".gitignore": "build/\n.gradle/\n*.class\n",
      };
    }

    // Default Java build system: Maven
    return {
      "pom.xml": `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.framecode</groupId>
    <artifactId>${name}</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.release>21</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <junit.version>5.10.2</junit.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.5</version>
            </plugin>
        </plugins>
    </build>
</project>`,

      "src/main/java/Main.java": `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from ${projectName}!");
    }
}`,

      "src/test/java/MainTest.java": `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MainTest {
    @Test
    void applicationStarts() {
        assertTrue(true);
    }
}`,

      "README.md": `# ${projectName}

Java project powered by Maven.

## Run

\`\`\`bash
mvn compile
mvn exec:java -Dexec.mainClass="Main"
\`\`\`
`,
      ".gitignore": "target/\n*.class\n",
    };
  }

  // C++
  if (language === "C++") {
    if (framework === "Make") {
      return {
        "src/main.cpp": `#include <iostream>

int main() {
    std::cout << "Hello from ${projectName}!" << std::endl;
    return 0;
}`,

        Makefile: `CXX = g++
CXXFLAGS = -std=c++20 -Wall -Wextra
TARGET = app
SOURCE = src/main.cpp

all:
	$(CXX) $(CXXFLAGS) $(SOURCE) -o $(TARGET)

run: all
	./$(TARGET)

clean:
	rm -f $(TARGET)
`,
        "README.md": `# ${projectName}

C++ project using Make.

## Build and run

\`\`\`bash
make
make run
\`\`\`
`,
        ".gitignore": "app\n*.o\nbuild/\n",
      };
    }

    return {
      "CMakeLists.txt": `cmake_minimum_required(VERSION 3.20)
project(${className} LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(${name} src/main.cpp)`,

      "src/main.cpp": `#include <iostream>

int main() {
    std::cout << "Hello from ${projectName}!" << std::endl;
    return 0;
}`,

      "README.md": `# ${projectName}

C++ project using CMake.

## Build

\`\`\`bash
cmake -S . -B build
cmake --build build
./build/${name}
\`\`\`
`,
      ".gitignore": "build/\n*.o\n*.exe\n",
    };
  }

  // PYTHON
  if (language === "Python") {
    return {
      "main.py": `def main():
    print("Hello from ${projectName}!")


if __name__ == "__main__":
    main()`,

      "requirements.txt": "",

      "README.md": `# ${projectName}

Python project.

## Run

\`\`\`bash
python main.py
\`\`\`
`,
      ".gitignore": "__pycache__/\n*.py[cod]\n.venv/\nvenv/\n",
    };
  }

  // RUST
  if (language === "Rust") {
    return {
      "Cargo.toml": `[package]
name = "${name}"
version = "0.1.0"
edition = "2021"

[dependencies]
`,

      "src/main.rs": `fn main() {
    println!("Hello from ${projectName}!");
}`,

      "README.md": `# ${projectName}

Rust project powered by Cargo.

## Run

\`\`\`bash
cargo run
\`\`\`
`,
      ".gitignore": "target/\n",
    };
  }

  // GO
  if (language === "Go") {
    return {
      "go.mod": `module example.com/${name}

go 1.23`,

      "main.go": `package main

import "fmt"

func main() {
    fmt.Println("Hello from ${projectName}!")
}`,

      "README.md": `# ${projectName}

Go project using Go Modules.

## Run

\`\`\`bash
go run .
\`\`\`
`,
      ".gitignore": "bin/\n*.exe\n",
    };
  }

  // Let the existing framework templates handle JS and TS.
  return null;
}

export function getScaffold(framework, language, projectName) {
  const name = projectName.toLowerCase().replace(/\s+/g, "-");
  const isTS = language === "TypeScript";

  const languageScaffold = getLanguageScaffold(
    language,
    framework,
    projectName,
  );

  if (languageScaffold) {
    return languageScaffold;
  }

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

  const files = getScaffold("Maven", "Java", "FrameCode Test");

  console.log(Object.keys(files));
  console.log(files["src/main/java/Main.java"]);

  return scaffolds[framework] ?? scaffolds["None"];
}
