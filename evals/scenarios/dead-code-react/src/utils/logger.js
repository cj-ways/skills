export function log(message) {
  console.log(`[INFO] ${message}`);
}

// DEAD: exported but never imported
export function debugLog(message) {
  console.log(`[DEBUG] ${message}`);
}
