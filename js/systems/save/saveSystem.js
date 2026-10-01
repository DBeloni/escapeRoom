const STORAGE_KEY = "escape-room-save";

export function createSaveSystem() {
    return {
        save(data) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        },

        load() {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        },

        clear() {
            localStorage.removeItem(STORAGE_KEY);
        }
    };
}
