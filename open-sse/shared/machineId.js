import { createRequire } from "node:module";
import crypto from "node:crypto";

const require = createRequire(import.meta.url);
let machineIdSync;
try {
  machineIdSync = require("node-machine-id").machineIdSync;
} catch {
  machineIdSync = () => crypto.randomUUID();
}

let cachedRawId = null;

function loadRawMachineId() {
  if (cachedRawId) return cachedRawId;
  try {
    cachedRawId = machineIdSync();
  } catch {
    cachedRawId = crypto.randomUUID();
  }
  return cachedRawId;
}

export async function getConsistentMachineId(salt = "endpoint-proxy-salt") {
  const rawId = loadRawMachineId();
  return crypto.createHash("sha256").update(rawId + salt).digest("hex").substring(0, 16);
}
