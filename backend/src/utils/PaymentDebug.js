// Utility to capture and retrieve detailed verification logs in memory.
// In development mode only. Not suitable for production persistence.

const _store = new Map(); // txn_id -> [string]

function append(txnId, message) {
  if (!_store.has(txnId)) {
    _store.set(txnId, []);
  }
  _store.get(txnId).push(`${new Date().toISOString()} | ${message}`);
}

function get(txnId) {
  return _store.get(txnId) || [];
}

module.exports = { append, get };