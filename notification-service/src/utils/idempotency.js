const processed = new Set();

// ✅ check duplicate
const isProcessed = (eventId) => processed.has(eventId);

// ✅ mark processed
const markProcessed = (eventId) => processed.add(eventId);

module.exports = {
  isProcessed,
  markProcessed,
};