module.exports = {
  get serviceName() {
    return process.env.SERVICE_NAME || 'unknown-service';
  },
  get env() {
    return process.env.NODE_ENV || 'development';
  }
};