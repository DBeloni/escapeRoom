import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const focusTarget = {
    isConnected: true,
    focus() {}
};
const overlay = {
    hidden: true,
    classList: { add() {}, remove() {} },
    dataset: {},
    innerHTML: "",
    querySelector() { return focusTarget; },
    querySelectorAll() { return [focusTarget]; }
};
const prompt = { hidden: true };
const promptText = { textContent: "" };
const document = {
    activeElement: focusTarget,
    getElementById(id) {
        return {
            puzzleOverlay: overlay,
            interactionPrompt: prompt,
            interactionPromptText: promptText
        }[id] || null;
    }
};
const window = { dispatchEvent() {} };
const context = {
    window,
    document,
    console,
    Math,
    Set,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Infinity,
    performance: { now: () => 1000 }
};

runInNewContext(
    readFileSync("js/systems/puzzles/boatEscapePuzzles.js", "utf8"),
    context
);

let scene = "cidade";
let houseId = null;
const logs = [];
const inventory = ["ITM_001", "ITM_002", "ITM_003", "ITM_004", "ITM_005"];
window.boatPuzzles.init({
    getScene: () => scene,
    getHouseId: () => houseId,
    getInventory: () => inventory,
    addLog: (message) => logs.push(message),
    onPuzzleSolved: (message) => logs.push(message),
    onClueFound: (message) => logs.push(message)
});

const environments = [
    { scene: "cidade", houseId: null, expected: ["wood", "circuit", "assembly"] },
    { scene: "casa", houseId: "casa-costeira-01", expected: [] },
    { scene: "casa", houseId: "casa-costeira-02", expected: ["radio"] },
    { scene: "casa", houseId: "casa-costeira-03", expected: [] },
    { scene: "casa", houseId: "casa-costeira-04", expected: ["cover"] },
    { scene: "casa", houseId: "casa-costeira-05", expected: ["engine"] }
];

const foundIds = [];
for (const environment of environments) {
    scene = environment.scene;
    houseId = environment.houseId;
    const objects = window.boatPuzzles.getAccessibleObjects();
    const ids = Array.from(objects, (object) => object.id).sort();
    assert.deepEqual(ids, [...environment.expected].sort(), "Os mecanismos devem aparecer no ambiente correto.");

    for (const objectInfo of objects) {
        foundIds.push(objectInfo.id);
        const model = window.boatPuzzles.getObject(objectInfo.id);
        assert.ok(model, `O mecanismo ${objectInfo.id} deve possuir modelo de objeto.`);
        assert.equal(typeof model.inspect, "function");
        assert.equal(typeof model.interact, "function");
        assert.equal(typeof model.complete, "function");
        assert.equal(typeof model.reset, "function");
        assert.equal(typeof model.estado, "object");
        assert.equal(model.inspect().id, objectInfo.id);

        assert.equal(window.boatPuzzles.interactById(objectInfo.id), true,
            `O mecanismo ${objectInfo.id} deveria abrir pelo guia textual.`);
        assert.ok(overlay.innerHTML.includes("puzzle-dialog"),
            `A interface de ${objectInfo.id} deveria ser renderizada.`);
        window.boatPuzzles.close();
    }
}

const uniqueIds = [...new Set(foundIds)].sort();
assert.equal(uniqueIds.length, 6, "Devem existir seis mecanismos distintos no total.");
assert.deepEqual(uniqueIds, ["assembly", "circuit", "cover", "engine", "radio", "wood"]);
assert.equal(window.boatPuzzles.interactById("radio"), false,
    "Um mecanismo não deve abrir fora do ambiente onde está instalado.");

const progressBeforeReset = window.boatPuzzles.getProgress();
assert.equal(progressBeforeReset.total, 4, "Quatro desafios entregam as peças necessárias para a montagem.");
window.boatPuzzles.getObject("wood").complete();
assert.equal(window.boatPuzzles.getObject("wood").isSolved(), true);
window.boatPuzzles.reset();
assert.equal(window.boatPuzzles.getObject("wood").isSolved(), false,
    "O reinício deve limpar o estado de resolução dos mecanismos.");
assert.equal(window.boatPuzzles.getProgress().solved.length, 0);
assert.equal(overlay.hidden, true);

console.log("Puzzles OK: seis mecanismos em seus ambientes, modelos com estado/métodos, abertura acessível e reinicialização verificados.");
