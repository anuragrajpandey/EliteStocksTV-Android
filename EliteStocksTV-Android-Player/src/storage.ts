import type { Credentials, PlayerItem } from "./types";

const CREDENTIALS_KEY = "elitestocks.credentials.v1";
const FAVORITES_KEY = "elitestocks.favorites.v1";

export function loadCredentials(): Credentials | null {
  try {
    const value = localStorage.getItem(CREDENTIALS_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveCredentials(value: Credentials) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(value));
}

export function clearCredentials() {
  localStorage.removeItem(CREDENTIALS_KEY);
}

export function loadFavorites(): PlayerItem[] {
  try {
    const value = localStorage.getItem(FAVORITES_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(items: PlayerItem[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
}