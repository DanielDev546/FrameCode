// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email?: string | null;
        name?: string | null;
        username?: string | null;
        role?: string | null;
      } | null;
    }
  }
}

export {};
