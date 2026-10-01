import { createInventorySystem } from "./inventory/inventory.js";
import { createInventoryUI } from "./inventory/inventoryUI.js";
import { createDialogueSystem } from "./dialogue/dialogueSystem.js";
import { createInteractionSystem } from "./interaction/interactionSystem.js";
import { createPointSystem } from "./points/pointSystem.js";
import { createPuzzleSystem } from "./puzzles/puzzleSystem.js";
import { createQuestSystem } from "./quests/questSystem.js";
import { createSaveSystem } from "./save/saveSystem.js";
import { createTimerSystem } from "./timer/timerSystem.js";

export function createGameSystems(state) {
    const inventory = createInventorySystem();

    return {
        inventory,
        inventoryUI: createInventoryUI(),
        dialogue: createDialogueSystem(),
        interaction: createInteractionSystem(),
        points: createPointSystem(),
        puzzles: createPuzzleSystem(),
        quests: createQuestSystem(),
        save: createSaveSystem(),
        timer: createTimerSystem()
    };
}
