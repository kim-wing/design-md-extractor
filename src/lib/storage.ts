const STORAGE_KEY = 'design-md-extension-storage';

export interface StorageData {
  apiKey: string;
  history: Array<{
    id: string;
    url: string;
    title: string;
    content: string;
    createdAt: number;
  }>;
}

// Check if running in Chrome extension environment
const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage;

export async function loadFromStorage(): Promise<StorageData> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        const data = result[STORAGE_KEY];
        resolve(
          data || {
            apiKey: '',
            history: [],
          }
        );
      });
    });
  }
  
  // Fallback for non-extension environments (e.g., testing)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { apiKey: '', history: [] };
    }
  }
  return { apiKey: '', history: [] };
}

export async function saveToStorage(data: StorageData): Promise<void> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
    });
  }
  
  // Fallback for non-extension environments
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function getApiKey(): Promise<string> {
  const data = await loadFromStorage();
  return data.apiKey;
}

export async function setApiKey(key: string): Promise<void> {
  const data = await loadFromStorage();
  data.apiKey = key;
  await saveToStorage(data);
}

export async function addToHistory(
  item: StorageData['history'][0]
): Promise<void> {
  const data = await loadFromStorage();
  data.history = [item, ...data.history].slice(0, 20);
  await saveToStorage(data);
}
