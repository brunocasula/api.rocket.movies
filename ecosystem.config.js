module.exports = {
  apps: [{
    name: "app",
    script: "./source/server.js",
    instances: "1",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}