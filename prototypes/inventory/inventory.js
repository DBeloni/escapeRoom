export function createInventory(maxSlots = Infinity) {
    const items = [];

    return {
        push(item) {
            if (items.length >= maxSlots) return false;
            items.push(item);
            return true;
        },
        shift() {
            return items.shift() ?? null;
        },
        values() {
            return [...items];
        }
    };
}
