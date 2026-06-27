import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { renewApiKey } from "./gstin-key-renewer";

const MAX_CALLS = 20;
const MAX_DAYS = 30;

const DB_KEY_API = "gstin_api_key";
const DB_KEY_CALLS = "gstin_call_count";
const DB_KEY_CREATED = "gstin_key_created_at";

async function dbGet(tenantId: string, key: string): Promise<string | null> {
  try {
    const row = await prisma.systemSetting.findFirst({ where: { tenantId, key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function dbSet(tenantId: string, key: string, value: string): Promise<void> {
  const existing = await prisma.systemSetting.findFirst({ where: { tenantId, key } });
  if (existing) {
    await prisma.systemSetting.update({ where: { id: existing.id }, data: { value } });
  } else {
    await prisma.systemSetting.create({ data: { tenantId, key, value } });
  }
}

async function getTrackerFromDb(tenantId: string): Promise<{ apiKey: string; callCount: number; createdAt: string } | null> {
  const apiKey = await dbGet(tenantId, DB_KEY_API);
  if (!apiKey) return null;
  const callCount = parseInt(await dbGet(tenantId, DB_KEY_CALLS) ?? "0", 10);
  const createdAt = await dbGet(tenantId, DB_KEY_CREATED) ?? new Date().toISOString();
  return { apiKey, callCount, createdAt };
}

async function saveTrackerToDb(tenantId: string, apiKey: string, callCount: number, createdAt: string): Promise<void> {
  await Promise.all([
    dbSet(tenantId, DB_KEY_API, apiKey),
    dbSet(tenantId, DB_KEY_CALLS, String(callCount)),
    dbSet(tenantId, DB_KEY_CREATED, createdAt),
  ]);
}

function isKeyValid(callCount: number, createdAt: string): boolean {
  if (callCount >= MAX_CALLS) return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs < MAX_DAYS * 24 * 60 * 60 * 1000;
}

export async function getValidApiKey(tenantId: string): Promise<string | null> {
  let tracker = await getTrackerFromDb(tenantId);

  if (!tracker) {
    const envKey = env.GSTIN_API_KEY;
    if (envKey) {
      await saveTrackerToDb(tenantId, envKey, 0, new Date().toISOString());
      return envKey;
    }
  }

  if (tracker && isKeyValid(tracker.callCount, tracker.createdAt)) {
    return tracker.apiKey;
  }

  try {
    const newKey = await renewApiKey();
    const now = new Date().toISOString();
    await saveTrackerToDb(tenantId, newKey, 0, now);
    return newKey;
  } catch (err) {
    console.error("[gstin-key-manager] Auto-renewal failed:", err);
    return tracker?.apiKey ?? null;
  }
}

export async function incrementCallCount(tenantId: string): Promise<void> {
  const tracker = await getTrackerFromDb(tenantId);
  if (tracker) {
    await dbSet(tenantId, DB_KEY_CALLS, String(tracker.callCount + 1));
  }
}

export async function setApiKey(tenantId: string, apiKey: string): Promise<void> {
  await saveTrackerToDb(tenantId, apiKey, 0, new Date().toISOString());
}

export async function getKeyStatus(tenantId: string): Promise<{
  callCount: number;
  maxCalls: number;
  createdAt: string;
  daysRemaining: number;
  isValid: boolean;
} | null> {
  const tracker = await getTrackerFromDb(tenantId);
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
