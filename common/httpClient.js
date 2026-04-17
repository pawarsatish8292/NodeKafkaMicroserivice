const axios = require('axios');
const CircuitBreaker = require('opossum');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

// 🔥 Retry logic
const retry = async (fn, retries = 3, delay = 500) => {
  try {
    return await fn();
  } catch (err) {
    const status = err.response?.status;

    // ❌ Do NOT retry client errors
    if (status && status < 500) {
      throw err;
    }

    if (retries === 0) throw err;

    logger.warn('Retrying request...', { retries, delay });

    await new Promise(res => setTimeout(res, delay));

    return retry(fn, retries - 1, delay * 2);
  }
};

// 🔥 Create circuit breaker per service
const createBreaker = (serviceFn, serviceName) => {
  const breaker = new CircuitBreaker(serviceFn, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
  });

  breaker.on('open', () => logger.error(`${serviceName} circuit OPEN`));
  breaker.on('halfOpen', () => logger.warn(`${serviceName} circuit HALF-OPEN`));
  breaker.on('close', () => logger.info(`${serviceName} circuit CLOSED`));

  return breaker;
};

// 🔥 Main HTTP call wrapper
const callService = async ({
  method = 'GET',
  url,
  data = {},
  headers = {},
  serviceName = 'external-service',
  idempotencyKey = null,
}) => {

  // 🔥 Add idempotency key if needed
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const requestFn = async () => {
    return axios({
      method,
      url,
      data,
      headers,
      timeout: 3000,
    });
  };

  const breaker = createBreaker(requestFn, serviceName);

  try {
    const result = await retry(() => breaker.fire());

    logger.info(`${serviceName} success`, { url });

    return {
        success: true,
        data: result.data,
        error: null,
    };

  } catch (err) {
    logger.error(`${serviceName} failed`, {
      url,
      error: err.message,
    });

    // 🔥 Fail-soft (do NOT crash main flow)
    return {
        success: false,
        data: null,
        error: {
        message: err.message,
        service: serviceName,
        status: err.response?.status || 500,
        },
    };
    }
};

module.exports = {
  callService,
};