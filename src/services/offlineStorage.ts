// IndexedDB-based offline storage service

const DB_NAME = 'BankingOfflineDB';
const DB_VERSION = 1;
const STORES = {
  accounts: 'accounts',
  transactions: 'transactions',
  syncQueue: 'syncQueue',
};

interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
}

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for cached accounts
        if (!db.objectStoreNames.contains(STORES.accounts)) {
          db.createObjectStore(STORES.accounts, { keyPath: 'id' });
        }

        // Store for cached transactions
        if (!db.objectStoreNames.contains(STORES.transactions)) {
          const txStore = db.createObjectStore(STORES.transactions, { keyPath: 'id' });
          txStore.createIndex('accountId', 'accountId', { unique: false });
        }

        // Store for sync queue
        if (!db.objectStoreNames.contains(STORES.syncQueue)) {
          const syncStore = db.createObjectStore(STORES.syncQueue, { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private ensureDb(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // Generic store operations
  async getAll<T>(storeName: string): Promise<T[]> {
    await this.init();
    const db = this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    await this.init();
    const db = this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async save<T>(storeName: string, data: T): Promise<void> {
    await this.init();
    const db = this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveAll<T>(storeName: string, items: T[]): Promise<void> {
    await this.init();
    const db = this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      items.forEach(item => store.put(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    await this.init();
    const db = this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    await this.init();
    const db = this.ensureDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync queue operations
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    };
    await this.save(STORES.syncQueue, queueItem);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const items = await this.getAll<SyncQueueItem>(STORES.syncQueue);
    return items.sort((a, b) => a.timestamp - b.timestamp);
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    await this.delete(STORES.syncQueue, id);
  }

  async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    await this.save(STORES.syncQueue, item);
  }

  async getSyncQueueCount(): Promise<number> {
    const items = await this.getSyncQueue();
    return items.length;
  }

  // Account-specific operations
  async cacheAccounts(accounts: any[]): Promise<void> {
    await this.saveAll(STORES.accounts, accounts);
  }

  async getCachedAccounts(): Promise<any[]> {
    return this.getAll(STORES.accounts);
  }

  // Transaction-specific operations
  async cacheTransactions(transactions: any[]): Promise<void> {
    await this.saveAll(STORES.transactions, transactions);
  }

  async getCachedTransactions(): Promise<any[]> {
    return this.getAll(STORES.transactions);
  }
}

export const offlineStorage = new OfflineStorageService();
export type { SyncQueueItem };
