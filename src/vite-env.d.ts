/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_IMAGE_PROVIDER: string;
  readonly VITE_IMAGE_API_URL: string;
  readonly VITE_IMAGE_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_REPLICATE_API_KEY: string;
  readonly VITE_STABILITY_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
