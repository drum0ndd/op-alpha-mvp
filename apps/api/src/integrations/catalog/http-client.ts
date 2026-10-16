export class SourceBlockedError extends Error {}
export function retryAfterMs(value: string | null, now = Date.now()) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value) * 1000;
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - now) : 0;
}
export class CatalogHttpClient {
  constructor(private readonly transport: typeof fetch = fetch,
    private readonly sleep: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
    private readonly random: () => number = Math.random) {}
  async get(url: string, conditional: { etag?: string | null; lastModified?: string | null } = {}) {
    const target = new URL(url);
    if (target.protocol !== 'https:' || target.hostname !== 'en.onepiece-cardgame.com' || target.pathname !== '/cardlist/' || target.username || target.password) throw new SourceBlockedError('Unapproved catalog URL');
    for (let attempt = 0; attempt < 3; attempt++) {
      let response: Response;
      try {
        response = await this.transport(url, { redirect: 'manual', signal: AbortSignal.timeout(10000), headers: {
          'User-Agent': 'OPAlphaCatalog/0.1 (manual authorized collection sync)',
          ...(conditional.etag ? { 'If-None-Match': conditional.etag } : {}),
          ...(conditional.lastModified ? { 'If-Modified-Since': conditional.lastModified } : {}),
        } });
      } catch {
        if (attempt === 2) throw new Error('Catalog transport unavailable');
        await this.sleep(1000 * 2 ** attempt + this.random() * 500); continue;
      }
      if (response.status === 304) return { notModified: true, text: null, etag: conditional.etag, lastModified: conditional.lastModified };
      if ([401, 403, 451].includes(response.status) || (response.status >= 300 && response.status < 400)) {
        await response.body?.cancel(); throw new SourceBlockedError('Source blocked or redirected; review required');
      }
      if (response.status === 429 || response.status >= 500) {
        const delay = Math.max(retryAfterMs(response.headers.get('retry-after')), 1000 * 2 ** attempt + this.random() * 500);
        await response.body?.cancel();
        if (delay > 30000 || attempt === 2) throw new SourceBlockedError('Source deferred; retry later after review');
        await this.sleep(delay); continue;
      }
      if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
        await response.body?.cancel(); throw new SourceBlockedError('Unexpected source response');
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Empty catalog response');
      let size = 0; const chunks: Uint8Array[] = [];
      try {
        while (true) {
          const { value, done } = await reader.read(); if (done) break;
          size += value.byteLength; if (size > 2 * 1024 * 1024) throw new SourceBlockedError('Catalog response too large');
          chunks.push(value);
        }
      } finally { await reader.cancel(); }
      const text = Buffer.concat(chunks).toString('utf8');
      if (/captcha|access denied|cf-chl-/i.test(text)) throw new SourceBlockedError('Challenge detected; collection stopped');
      return { text, notModified: false, etag: response.headers.get('etag'), lastModified: response.headers.get('last-modified') };
    }
    throw new Error('Catalog retries exhausted');
  }
}
