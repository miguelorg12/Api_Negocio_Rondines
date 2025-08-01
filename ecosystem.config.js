module.exports = {
  apps: [
    {
      name: 'api-negocio-dev',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_file: '.env'
    },
    {
      name: 'api-negocio-qa',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'qa',
        PORT: 3002
      },
      env_file: '.env.qa'
    },
    {
      name: 'api-negocio-prod',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      env_file: '.env.production'
    }
  ]
}; 