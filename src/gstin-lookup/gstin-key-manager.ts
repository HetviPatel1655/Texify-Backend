import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { renewApiKey } from "./gstin-key-renewer.js";

const MAX_CALLS = 20;
const MAX_DAYS = 30;

const DB_KEY_API = "gstin_api_key";
const DB_KEY_CALLS = "gstin_call_count";
const DB_KEY_CREATED = "gstin_key_created_at";

async function dbGet(key: string): Promise<string | null> {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function dbSet(key: string, value: string): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function getTrackerFromDb(): Promise<{ apiKey: string; callCount: number; createdAt: string } | null> {
  const apiKey = await dbGet(DB_KEY_API);
  if (!apiKey) return null;
  const callCount = parseInt(await dbGet(DB_KEY_CALLS) ?? "0", 10);
  const createdAt = await dbGet(DB_KEY_CREATED) ?? new Date().toISOString();
  return { apiKey, callCount, createdAt };
}

async function saveTrackerToDb(apiKey: string, callCount: number, createdAt: string): Promise<void> {
  await Promise.all([
    dbSet(DB_KEY_API, apiKey),
    dbSet(DB_KEY_CALLS, String(callCount)),
    dbSet(DB_KEY_CREATED, createdAt),
  ]);
}

function isKeyValid(callCount: number, createdAt: string): boolean {
  if (callCount >= MAX_CALLS) return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < MAX_DAYS * 24 * 60 * 60 * 1000;
}

export async function getValidApiKey(): Promise<string | null> {
  let tracker = await getTrackerFromDb();

  if (!tracker) {
    const envKey = env.GSTIN_API_KEY;
    if (envKey) {
      await saveTrackerToDb(envKey, 0, new Date().toISOString());
      return envKey;
    }
  }

  if (tracker && isKeyValid(tracker.callCount, tracker.createdAt)) {
    return tracker.apiKey;
  }

  try {
    const newKey = await renewApiKey();
    const now = new Date().toISOString();
    await saveTrackerToDb(newKey, 0, now);
    return newKey;
  } catch (err) {
    console.error("[gstin-key-manager] Auto-renewal failed:", err);
    return tracker?.apiKey ?? null;
  }
}

export async function incrementCallCount(): Promise<void> {
  const tracker = await getTrackerFromDb();
  if (tracker) {
    await dbSet(DB_KEY_CALLS, String(tracker.callCount + 1));
  }
}

export async function setApiKey(apiKey: string): Promise<void> {
  await saveTrackerToDb(apiKey, 0, new Date().toISOString());
}

export async function getKeyStatus(): Promise<{
  callCount: number;
  maxCalls: number;
  createdAt: string;
  daysRemaining: number;
  isValid: boolean;
} | null> {
  const tracker = await getTrackerFromDb();
  if (!tracker) return null;
  const ageMs = Date.now() - new Date(tracker.createdAt).getTime();
  const daysUsed = ageMs / (24 * 60 * 60 * 1000);
  return {
    callCount: tracker.callCount,
    maxCalls: MAX_CALLS,
    createdAt: tracker.createdAt,
    daysRemaining: Math.max(0, Math.round(MAX_DAYS - daysUsed)),
    isValid: isKeyValid(tracker.callCount, tracker.createdAt),
  };
}
