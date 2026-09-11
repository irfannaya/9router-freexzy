/**
 * UI Helper Functions (Safe fallback without external chalk/ora deps for standalone)
 */

export function success(message) {
  console.log(`\n✓ ${message}\n`);
}

export function error(message) {
  console.error(`\n✗ ${message}\n`);
}

export function info(message) {
  console.log(`\n${message}\n`);
}

export function warn(message) {
  console.warn(`\n⚠ ${message}\n`);
}

export function gray(message) {
  console.log(message);
}

export function spinner(text) {
  return {
    start: () => { console.log(text); return this; },
    stop: () => {},
    succeed: (msg) => console.log(`✓ ${msg || text}`),
    fail: (msg) => console.error(`✗ ${msg || text}`)
  };
}

export function printSection(title) {
  console.log(`\n=== ${title} ===\n`);
}

export function printKeyValue(key, value, isSuccess = false) {
  console.log(`  ${key}: ${value}`);
}

export function printList(items, isSuccess = false) {
  const symbol = isSuccess ? "✓" : "✗";
  items.forEach((item) => {
    console.log(`  ${symbol} ${item}`);
  });
}
