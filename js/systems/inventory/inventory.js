import {
    getItemDefinition,
    INVENTORY_CAPACITY
} from "./itemCatalog.js";

export function createInventorySystem(maxItems = INVENTORY_CAPACITY) {
    const items = [];
    const capacity = Number.isFinite(maxItems)
        ? Math.max(0, Math.min(Math.floor(maxItems), INVENTORY_CAPACITY))
        : INVENTORY_CAPACITY;

    return {
        get items() {
            return [...items];
        },
        maxItems: capacity,

        add(itemOrId) {
            const id = typeof itemOrId === "string" ? itemOrId : itemOrId?.id;
            const definition = getItemDefinition(id);
            if (!definition || items.length >= capacity || items.some(item => item.id === id)) return false;

            items.push(definition);
            return true;
        },

        get(itemId) {
            return items.find(item => item.id === itemId) ?? null;
        },

        has(itemId) {
            return items.some(item => item.id === itemId);
        },

        remove(itemId) {
            const index = items.findIndex(item => item.id === itemId);
            if (index === -1) return null;
            return items.splice(index, 1)[0];
        },

        use(itemId, applyToTarget) {
            const item = items.find(candidate => candidate.id === itemId) ?? null;
            if (!item || typeof applyToTarget !== "function") return false;

            // A failed or inapplicable interaction never consumes the item.
            if (applyToTarget(item) !== true) return false;
            if (item.consumption === "single-use") {
                items.splice(items.findIndex(candidate => candidate.id === itemId), 1);
            }
            return true;
        },

        clear() {
            items.length = 0;
        }
    };
}

export function createWorldItemSystem(inventory, world, pickupRadius = 46) {
    return {
        nearbyItem(player) {
            return world.items.find(item =>
                Math.hypot(item.x - player.x, item.y - player.y) <= pickupRadius
            ) ?? null;
        },

        pickup(player) {
            const item = this.nearbyItem(player);
            if (!item || !inventory.add(item.id)) return null;
            world.items.splice(world.items.indexOf(item), 1);
            return item;
        }
    };
}
