// db.js - Client-Side IndexedDB Storage Manager for Sessions and Agent Memory

const DB_NAME = 'LocalAISessionDB';
const DB_VERSION = 1;

class SessionDatabase {
    constructor() {
        this.db = null;
        this.initPromise = null;
    }

    async init() {
        if (this.db) return this.db;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Sessions Store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
                    sessionStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                // Messages Store
                if (!db.objectStoreNames.contains('messages')) {
                    const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
                    messageStore.createIndex('sessionId', 'sessionId', { unique: false });
                    messageStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // User Agent Memories Store
                if (!db.objectStoreNames.contains('memories')) {
                    const memoryStore = db.createObjectStore('memories', { keyPath: 'id' });
                    memoryStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('[IndexedDB] Failed to open database:', event.target.error);
                reject(event.target.error);
            };
        });

        return this.initPromise;
    }

    // --- Sessions CRUD ---

    async getAllSessions() {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sessions', 'readonly');
            const store = tx.objectStore('sessions');
            const index = store.index('updatedAt');
            const request = index.openCursor(null, 'prev'); // Latest first
            const sessions = [];

            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    sessions.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(sessions);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getSession(id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sessions', 'readonly');
            const request = tx.objectStore('sessions').get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async saveSession(session) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sessions', 'readwrite');
            const request = tx.objectStore('sessions').put(session);
            request.onsuccess = () => resolve(session);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteSession(id) {
        await this.init();
        // Delete session and all related messages
        const tx = this.db.transaction(['sessions', 'messages'], 'readwrite');
        const sessionStore = tx.objectStore('sessions');
        const messageStore = tx.objectStore('messages');
        const index = messageStore.index('sessionId');

        return new Promise((resolve, reject) => {
            sessionStore.delete(id);

            const request = index.openCursor(IDBKeyRange.only(id));
            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    messageStore.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };

            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }

    // --- Messages CRUD ---

    async getMessagesForSession(sessionId) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('messages', 'readonly');
            const store = tx.objectStore('messages');
            const index = store.index('sessionId');
            const request = index.getAll(IDBKeyRange.only(sessionId));

            request.onsuccess = () => {
                const messages = request.result || [];
                messages.sort((a, b) => a.timestamp - b.timestamp);
                resolve(messages);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveMessage(message) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('messages', 'readwrite');
            const request = tx.objectStore('messages').put(message);
            request.onsuccess = () => resolve(message);
            request.onerror = () => reject(request.error);
        });
    }

    async clearSessionMessages(sessionId) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('messages', 'readwrite');
            const store = tx.objectStore('messages');
            const index = store.index('sessionId');
            const request = index.openCursor(IDBKeyRange.only(sessionId));

            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }

    // --- Memories CRUD ---

    async getAllMemories() {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('memories', 'readonly');
            const store = tx.objectStore('memories');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async saveMemory(memory) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('memories', 'readwrite');
            const request = tx.objectStore('memories').put(memory);
            request.onsuccess = () => resolve(memory);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteMemory(id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('memories', 'readwrite');
            const request = tx.objectStore('memories').delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
}

export const db = new SessionDatabase();
