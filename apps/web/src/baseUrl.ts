const base = import.meta.env.BASE_URL;

/** Resolve public assets for both local / development and the Pages subpath. */
export function assetUrl(url: string): string {
  if (!url.startsWith("/") || url.startsWith("//") || /^(?:https?:|data:|blob:)/i.test(url)) return url;
  return `${base}${url.slice(1)}`;
}

/** Manifest URLs are data, so normalize every nested asset path after loading. */
export function normalizeAssetUrls<T>(value: T): T {
  if (typeof value === "string") return assetUrl(value) as T;
  if (Array.isArray(value)) return value.map(normalizeAssetUrls) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        normalizeAssetUrls(entry),
      ]),
    ) as T;
  }
  return value;
}
