/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEMO_MODE: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  // mais variáveis de ambiente conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 