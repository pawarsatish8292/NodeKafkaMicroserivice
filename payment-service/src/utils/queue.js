const queue = [];

const MAX_QUEUE = 10000;

const push = (data) => {
  queue.push(data);
};

const popBatch = (size = 50) => {
  return queue.splice(0, size);
};

const size = () => queue.length;

module.exports = { push, popBatch, size, MAX_QUEUE };