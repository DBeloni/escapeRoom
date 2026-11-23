import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const overlay = {
    hidden: true,
    classList: { remove() {} },
    dataset: {},
    innerHTML: "",
    querySelector() { return null; }
};
const prompt = { hidden: true };
const promptText = { textContent: "" };
const document = {
    getElementById(id) {
        return {
            puzzleOverlay: overlay,
            interactionPrompt: prompt,
            interactionPromptText: promptText
        }[id] || null;
    }
};
const window = {};
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
    Infinity
};

runInNewContext(
    readFileSync("js/systems/puzzles/boatEscapePuzzles.js", "utf8"),
    context
);

let scene = "cidade";
let houseId = null;
const logs = [];
window.boatPuzzles.init({
    getScene: () => scene,
    getHouseId: () => houseId,
    getInventory: () => [],
    addLog: (message) => logs.push(message)
});

const environments = [
    ["cidade", null],
    ["casa", "casa-costeira-01"],
    ["casa", "casa-costeira-02"],
    ["casa", "casa-costeira-03"],
    ["casa", "casa-costeira-04"],
    ["casa", "casa-costeira-05"]
];
const foundIds = [];

for (let environmentIndex = 0; environmentIndex < environments.length; environmentIndex += 1) {
    scene = environments[environmentIndex][0];
    houseId = environments[environmentIndex][1];

    const objects = window.boatPuzzles.getAccessibleObjects();
    for (let objectIndex = 0; objectIndex < objects.length; objectIndex += 1) {
        const object = objects[objectIndex];
        foundIds.push(object.id);

        assert.equal(
            window.boatPuzzles.interactById(object.id),
            true,
            `O objeto ${object.id} deveria abrir no ambiente correto.`
        );
        assert.ok(overlay.innerHTML.length > 0, `A interface de ${object.id} não foi renderizada.`);
        window.boatPuzzles.close();
    }
}

const uniqueIds = [...new Set(foundIds)].sort();
const expectedIds = [
    "wood", "engine", "circuit", "cover", "radio",
    "safe", "breaker", "valve", "crates", "assembly"
].sort();

assert.deepEqual(uniqueIds, expectedIds, "A lista de dez objetos interativos deve estar completa e sem duplicatas.");
assert.equal(foundIds.length, 10, "Cada objeto deve aparecer em exatamente um ambiente.");
assert.equal(logs.length, 10, "A inspeção dos dez objetos deve gerar registros no diário.");

console.log("Teste de puzzles OK: 10 objetos listados, abertos e registrados sem exceção.");
