const env = {
  MUTA_ENDPOINT: 'http://127.0.0.1:8000/graphql',
  HERMIT_DATABASE_URL: 'mysql://root:123456@127.0.0.1:3306/muta',
  HERMIT_CACHE_URL: '',
  DEBUG: 'muta-extra:*',
};

module.exports = {
  apps: [
    {
      name: 'hermit-sync',
      script: './packages/app-sync/lib/index.js',
      env: {
        ...env,
      },
    },
    {
      name: 'hermit-api',
      script: './packages/app-server/lib/index.js',
      env: {
        ...env,
        HERMIT_BYPASS_CHAIN: '/chain',
        HERMIT_CORS_ORIGIN: '',
        HERMIT_MAX_COMPLEXITY: 500,
        HERMIT_FETCH_CONCURRENCY: 50,
        HERMIT_MAX_SKIP_SIZE: 10000,
        HERMIT_PORT: 4040,
      },
    },
  ],
};
