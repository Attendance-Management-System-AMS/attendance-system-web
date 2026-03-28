/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL cho axios (`/api` khi dev + proxy, hoặc URL đầy đủ khi build). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
