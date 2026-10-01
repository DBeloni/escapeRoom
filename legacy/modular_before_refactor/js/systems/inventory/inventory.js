export function createInventorySystem() {
    return {
        items: [],

        add(item) {
            this.items.push(item);
        },

        remove(itemId) {
            this.items = this.items.filter(item => item.id !== itemId);
        },

        has(itemId) {
            return this.items.some(item => item.id === itemId);
        },

        clear() {
            this.items = [];
        }
    };
}
