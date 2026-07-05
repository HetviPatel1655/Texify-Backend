import { AsyncLocalStorage } from "node:async_hooks";

interface TenantStore {
  tenantId: string;
}

export const tenantContext = new AsyncLocalStorage<TenantStore>();

export function getCurrentTenantId(): string | undefined {
  return tenantContext.getStore()?.tenantId;
}
