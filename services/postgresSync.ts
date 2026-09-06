import { StorageService } from './storage';

const apiBase = () =>
  (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_API_URL?.replace(/\/$/, '') ||
  '';

export const isPostgresApiEnabled = (): boolean => Boolean(apiBase());

/** Pull snapshot from PostgreSQL API into localStorage */
export async function pullFromPostgres(): Promise<{ ok: boolean; error?: string }> {
  const base = apiBase();
  if (!base) return { ok: false, error: 'VITE_API_URL تنظیم نشده است.' };
  try {
    const res = await fetch(`${base}/api/bootstrap`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    StorageService.applyRemoteBootstrap(data);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Push current localStorage dump into PostgreSQL */
export async function pushToPostgres(): Promise<{ ok: boolean; error?: string; imported?: unknown }> {
  const base = apiBase();
  if (!base) return { ok: false, error: 'VITE_API_URL تنظیم نشده است.' };
  try {
    const dump = StorageService.exportLocalDump();
    const res = await fetch(`${base}/api/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dump),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    const body = await res.json();
    return { ok: true, imported: body.imported };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function checkPostgresHealth(): Promise<boolean> {
  const base = apiBase();
  if (!base) return false;
  try {
    const res = await fetch(`${base}/api/health`);
    const data = await res.json();
    return Boolean(data.ok);
  } catch {
    return false;
  }
}
