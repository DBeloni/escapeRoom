export function createQuestSystem() {
    const quests = new Map();

    return {
        register(id, quest) {
            quests.set(id, { ...quest, id, state: "locked" });
        },

        start(id) {
            const quest = quests.get(id);
            if (!quest) return false;
            quest.state = "active";
            return true;
        },

        complete(id) {
            const quest = quests.get(id);
            if (!quest) return false;
            quest.state = "completed";
            return true;
        },

        get(id) {
            return quests.get(id) ?? null;
        },

        update() {}
    };
}
