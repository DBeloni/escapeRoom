export function createInventorySystem(maxSlots = 10) {
    const items = [];

    return {
        maxSlots,

        add(item) {
            if (items.length >= maxSlots) return false;
            items.push({ ...item });
            return true;
        },

        removeFirst() {
            return items.shift() ?? null;
        },

        removeById(id) {
            const index = items.findIndex((item) => item.id === id);
            if (index < 0) return null;
            return items.splice(index, 1)[0];
        },

        has(id) {
            return items.some((item) => item.id === id);
        },

        list() {
            return items.map((item) => ({ ...item }));
        },

        clear() {
            items.length = 0;
        }
    };
}
