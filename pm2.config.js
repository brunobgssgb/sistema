module.exports = {
  apps: [{
    name: 'recharge-system',
    script: 'npm',
    args: 'run dev',
    env: {
      NODE_ENV: 'production',
      PORT: 5173
    },
    watch: false,
    instances: 1,
    exec_mode: 'fork'
  }]
}