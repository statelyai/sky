interface ImportMeta {
  env: {
    [key: string]: string | boolean | undefined;
    MODE: string;
    BASE_URL: string;
    PROD: boolean;
    DEV: boolean;
    VITE_SKY_HOST?: string;
    VITE_SKY_API_URL?: string;
  };
}
