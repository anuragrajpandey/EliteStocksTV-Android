import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import type {
  Account,
  Category,
  Credentials,
  EpgItem,
  LiveChannel,
  VodItem,
} from "./types";

function normalizeServer(value: string) {
  let server = value.trim();
  if (!/^https?:\/\//i.test(server)) server = `http://${server}`;
  return server.replace(/\/+$/, "");
}

function apiUrl(credentials: Credentials, action?: string, extra?: Record<string, string>) {
  const url = new URL(`${normalizeServer(credentials.server)}/player_api.php`);
  url.searchParams.set("username", credentials.username);
  url.searchParams.set("password", credentials.password);
  if (action) url.searchParams.set("action", action);
  for (const [key, value] of Object.entries(extra ?? {})) url.searchParams.set(key, value);
  return url.toString();
}

async function getJson<T>(url: string): Promise<T> {
  const response = await tauriFetch(url, {
    method: "GET",
    connectTimeout: 15000,
    headers: { Origin: "" },
  });
  if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);
  return (await response.json()) as T;
}

export async function login(credentials: Credentials): Promise<Account> {
  return getJson<Account>(apiUrl(credentials));
}

export async function getLiveCategories(credentials: Credentials) {
  return getJson<Category[]>(apiUrl(credentials, "get_live_categories"));
}

export async function getLiveChannels(credentials: Credentials, categoryId?: string) {
  return getJson<LiveChannel[]>(
    apiUrl(credentials, "get_live_streams", categoryId ? { category_id: categoryId } : undefined),
  );
}

export async function getVodCategories(credentials: Credentials) {
  return getJson<Category[]>(apiUrl(credentials, "get_vod_categories"));
}

export async function getVod(credentials: Credentials, categoryId?: string) {
  return getJson<VodItem[]>(
    apiUrl(credentials, "get_vod_streams", categoryId ? { category_id: categoryId } : undefined),
  );
}

export async function getShortEpg(credentials: Credentials, streamId: number) {
  return getJson<{ epg_listings?: EpgItem[] }>(
    apiUrl(credentials, "get_short_epg", { stream_id: String(streamId), limit: "4" }),
  );
}

export function streamUrl(
  credentials: Credentials,
  kind: "live" | "movie",
  id: number,
  extension = "ts",
) {
  const server = normalizeServer(credentials.server);
  const folder = kind === "live" ? "live" : "movie";
  return `${server}/${folder}/${encodeURIComponent(credentials.username)}/${encodeURIComponent(credentials.password)}/${id}.${extension}`;
}

export function imageUrl(value?: string) {
  if (!value) return undefined;
  return value;
}