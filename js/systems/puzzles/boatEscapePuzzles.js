/*
 * Desafios da fuga pelo cais.
 * Cada interação fica perto do objeto que a justifica no cenário.
 * O módulo não controla o movimento: recebe a posição do jogador e abre
 * apenas o desafio que estiver ao alcance.
 */
(function () {
    "use strict";

    const ITEM_NAMES = {
        ITM_001: "Chave de fenda",
        ITM_002: "Chave inglesa",
        ITM_003: "Fita isolante",
        ITM_004: "Fusível",
        ITM_005: "Galão de gasolina"
    };

    const TASKS = [
        { id: "wood", label: "Separar a madeira", reward: "Três tábuas para o casco" },
        { id: "engine", label: "Retirar o motor", reward: "Motor de popa" },
        { id: "circuit", label: "Reativar o guincho", reward: "Hélice recuperada" },
        { id: "cover", label: "Recuperar a lona", reward: "Lona e cordame" }
    ];

    const LOCATIONS = [
        { id: "wood", scene: "cidade", x: 495, y: 610, label: "Tronco caído", number: "1" },
        { id: "engine", scene: "casa", houseId: "casa-costeira-05", x: 1080, y: 335, label: "Bancada da oficina", number: "2" },
        { id: "circuit", scene: "cidade", x: 270, y: 900, label: "Guincho do cais", number: "3" },
        { id: "cover", scene: "casa", houseId: "casa-costeira-04", x: 340, y: 280, label: "Maca da enfermaria", number: "4" },
        { id: "radio", scene: "casa", houseId: "casa-costeira-02", x: 650, y: 200, label: "Rádio comunitário", number: "R" },
        { id: "assembly", scene: "cidade", x: 470, y: 900, label: "Cais velho", number: "B" }
    ];

    const REQUIRED_FOR_WOOD = ["ITM_001"];
    const REQUIRED_FOR_ENGINE = ["ITM_001", "ITM_002"];
    const REQUIRED_FOR_CIRCUIT = ["ITM_003", "ITM_004"];
    const REQUIRED_FOR_ASSEMBLY = ["ITM_001", "ITM_002", "ITM_005"];
    const RADIO_FREQUENCY = 104;
    const PUZZLE_INTERACTION_RADIUS = 160;
    const COVER_SEQUENCE = ["head", "foot", "side"];
    const DIRECTIONS = ["N", "E", "S", "W"];
    const OPPOSITE = { N: "S", E: "W", S: "N", W: "E" };

    const solved = new Set();
    const puzzleState = {
        wood: { hits: 0 },
        engine: { coverScrews: [false, false], bolts: [false, false, false] },
        circuit: { rotations: [0, 0] },
        cover: { step: 0 },
        radio: { frequency: 98, solved: false },
        assembly: {
            selected: null,
            installedWood: [false, false, false],
            installed: { engine: false, propeller: false, cover: false },
            fastened: false,
            fuelled: false
        }
    };

    let options = null;
    let overlay = null;
    let prompt = null;
    let promptText = null;
    let activePuzzle = null;
    let victory = false;

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    function hasItems(itemIds) {
        const inventory = options?.getInventory?.() ?? [];
        return itemIds.every(itemId => inventory.includes(itemId));
    }

    function missingItems(itemIds) {
        const inventory = options?.getInventory?.() ?? [];
        return itemIds.filter(itemId => !inventory.includes(itemId));
    }

    function isModalOpen() {
        return Boolean(overlay && !overlay.hidden);
    }

    function setFeedback(message, kind = "normal") {
        const feedback = overlay?.querySelector("[data-puzzle-feedback]");
        if (!feedback) return;
        feedback.textContent = message;
        feedback.dataset.kind = kind;
    }

    function renderShell(title, context, body, note = "Pressione E ou Esc para voltar") {
        if (!overlay) return;
        overlay.hidden = false;
        overlay.classList.remove("puzzle-overlay--victory");
        overlay.innerHTML = `
            <div class="puzzle-dialog" role="dialog" aria-modal="true" aria-labelledby="puzzleTitle">
                <header class="puzzle-header">
                    <div>
                        <p class="puzzle-eyebrow">${escapeHTML(context)}</p>
                        <h2 id="puzzleTitle">${escapeHTML(title)}</h2>
                    </div>
                    <button class="puzzle-close" type="button" data-action="close" aria-label="Fechar">×</button>
                </header>
                <div class="puzzle-body">${body}</div>
                <footer class="puzzle-footer">
                    <span data-puzzle-feedback aria-live="polite">Observe o local antes de agir.</span>
                    <small>${escapeHTML(note)}</small>
                </footer>
            </div>`;
        const firstControl = overlay.querySelector(".puzzle-body button:not(:disabled), .puzzle-body input");
        (firstControl || overlay.querySelector("[data-action='close']"))?.focus();
    }

    function renderLocked(title, context, missing, explanation) {
        const missingMarkup = missing.length
            ? `<ul class="puzzle-requirements">${missing.map(id => `<li>${escapeHTML(ITEM_NAMES[id] || id)}</li>`).join("")}</ul>`
            : "";
        renderShell(title, context, `
            <div class="puzzle-locked">
                <p>${escapeHTML(explanation)}</p>
                ${missingMarkup}
                <button class="puzzle-button puzzle-button--quiet" type="button" data-action="close">Voltar</button>
            </div>`, "Os itens não são consumidos ao abrir o desafio.");
    }

    function completePuzzle(id, rewardTitle, rewardText) {
        solved.add(id);
        renderShell("Item recuperado", "PLANO DE FUGA", `
            <div class="puzzle-reward">
                <h3>${escapeHTML(rewardTitle)}</h3>
                <p>${escapeHTML(rewardText)}</p>
                <button class="puzzle-button" type="button" data-action="close">Continuar</button>
            </div>`, "A peça foi separada para a montagem no cais.");
        window.dispatchEvent(new CustomEvent("game:boat-part-found", {
            detail: { id, reward: rewardTitle }
        }));
    }

    function nearbyLocation(player) {
        if (!player) return null;
        const scene = options?.getScene?.();
        const houseId = options?.getHouseId?.();
        let nearest = null;
        let shortest = Infinity;

        for (const location of LOCATIONS) {
            if (location.scene !== scene) continue;
            if (location.houseId && location.houseId !== houseId) continue;
            if (TASKS.some(task => task.id === location.id) && solved.has(location.id)) continue;
            if (location.id === "radio" && puzzleState.radio.solved) continue;
            if (location.id === "assembly" && victory) continue;

            const distance = Math.hypot(location.x - player.x, location.y - player.y);
            if (distance <= PUZZLE_INTERACTION_RADIUS && distance < shortest) {
                shortest = distance;
                nearest = location;
            }
        }
        return nearest;
    }

    function updateProximity(player) {
        if (!prompt || !promptText) return;
        if (isModalOpen() || victory) {
            prompt.hidden = true;
            return;
        }

        const location = nearbyLocation(player);
        const canCollect = options?.hasNearbyItem?.(player);
        if (canCollect) {
            prompt.hidden = false;
            promptText.textContent = options?.getNearbyItemName?.(player)
                ? `Pegar: ${options.getNearbyItemName(player)}`
                : "Coletar item";
            return;
        }
        if (!location) {
            prompt.hidden = true;
            return;
        }

        prompt.hidden = false;
        if (location.id === "assembly") {
            promptText.textContent = solved.size === TASKS.length
                ? "Montar o barco"
                : `Cais velho · ${solved.size}/${TASKS.length} peças`;
        } else {
            promptText.textContent = `Interagir: ${location.label}`;
        }
    }

    function drawMarkers(context, cameraX, cameraY, sceneZoom = 1) {
        if (victory) return;
        const scene = options?.getScene?.();
        const houseId = options?.getHouseId?.();
        context.save();
        context.textAlign = "center";
        context.textBaseline = "middle";
        // Coordinates are in world space and the canvas applies sceneZoom.
        // Keep badge dimensions consistent in screen space across scenes.
        const zoom = Math.max(1, sceneZoom);
        const radius = 14 / zoom;
        context.font = `bold ${15 / zoom}px monospace`;

        for (const location of LOCATIONS) {
            if (location.scene !== scene) continue;
            if (location.houseId && location.houseId !== houseId) continue;
            if (TASKS.some(task => task.id === location.id) && solved.has(location.id)) continue;
            if (location.id === "radio" && puzzleState.radio.solved) continue;
            if (location.id === "assembly" && victory) continue;

            const x = location.x - cameraX;
            const y = location.y - cameraY;
            const color = location.id === "assembly" && solved.size === TASKS.length
                ? "#b9c39a" : "#c69a70";

            context.fillStyle = "rgba(16, 20, 17, .9)";
            context.strokeStyle = color;
            context.lineWidth = 1.5;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.fillStyle = "#eee7d9";
            context.fillText(location.number, x, y);
        }
        context.restore();
    }

    function openPuzzle(id) {
        if (isModalOpen() || victory) return;
        activePuzzle = id;

        if (id === "wood") {
            const missing = missingItems(REQUIRED_FOR_WOOD);
            if (missing.length) {
                return renderLocked(
                    "Separar a madeira", "TRONCO CAÍDO · ZONA COSTEIRA",
                    missing,
                    "Use a chave de fenda como alavanca para soltar as tábuas do tronco sem quebrá-las."
                );
            }
            return renderWood();
        }

        if (id === "engine") {
            const missing = missingItems(REQUIRED_FOR_ENGINE);
            if (missing.length) {
                return renderLocked(
                    "Motor da oficina", "CASA 05 · OFICINA",
                    missing,
                    "A proteção do eixo está presa por dois parafusos. Depois será preciso soltar as três porcas do suporte."
                );
            }
            return renderEngine();
        }

        if (id === "circuit") {
            const missing = missingItems(REQUIRED_FOR_CIRCUIT);
            if (missing.length) {
                return renderLocked(
                    "Painel do guincho", "CAIS VELHO",
                    missing,
                    "O guincho está sem energia. O cabo foi remendado às pressas e o fusível queimou."
                );
            }
            return renderCircuit();
        }

        if (id === "cover") return renderCover();
        if (id === "radio") return renderRadio();

        if (id === "assembly") {
            const missingParts = TASKS.filter(task => !solved.has(task.id));
            if (missingParts.length) {
                renderShell("Ainda faltam peças", "CAIS VELHO", `
                    <div class="puzzle-locked">
                    <p>Antes de montar, reúna os materiais necessários para construir o barco.</p>
                        <ul class="puzzle-requirements">${missingParts.map(task => `<li>${escapeHTML(task.reward)}</li>`).join("")}</ul>
                        <button class="puzzle-button puzzle-button--quiet" type="button" data-action="close">Voltar</button>
                    </div>`);
                return;
            }
            const missingTools = missingItems(REQUIRED_FOR_ASSEMBLY);
            if (missingTools.length) {
                renderLocked(
                    "Preparar a montagem", "CAIS VELHO",
                    missingTools,
                    "As peças estão prontas. Ainda faltam as ferramentas e o combustível para concluir o barco."
                );
                return;
            }
            return renderAssembly();
        }
    }

    function renderWood() {
        const hits = puzzleState.wood.hits;
        const progress = Math.min(100, Math.round((hits / 6) * 100));
        renderShell("Preparar a madeira", "TRONCO CAÍDO · ZONA COSTEIRA", `
            <p class="puzzle-story-note">Use a ponta da chave de fenda como alavanca para soltar as tábuas sem quebrar a madeira.</p>
            <div class="woodcut-stage woodcut-stage--plain">
                <button class="woodcut-log" type="button" data-action="chop" aria-label="Cortar o tronco">
                    <span class="woodcut-log__bark"></span>
                    <span class="woodcut-log__label">TRONCO</span>
                    <span class="woodcut-log__mark">✕</span>
                </button>
                <div class="puzzle-progress">
                    <div><span>MADEIRA SEPARADA</span><b>${hits}/6</b></div>
                    <span class="puzzle-progress__track"><i style="width:${progress}%"></i></span>
                </div>
            </div>
            <p class="puzzle-hint">Faça seis movimentos de alavanca para soltar as três tábuas.</p>
        `, "Clique no tronco ou pressione o botão de ação. A chave de fenda é reutilizável.");
    }

    function renderEngine() {
        const state = puzzleState.engine;
        const coverRemoved = state.coverScrews.every(Boolean);
        const removed = state.bolts.filter(Boolean).length;
        const allRemoved = removed === state.bolts.length;

        const workMarkup = !coverRemoved
            ? `
                <p class="puzzle-story-note">A chapa de proteção cobre o eixo do motor. Retire os dois parafusos com a chave de fenda para alcançar o suporte.</p>
                <div class="engine-bolts engine-bolts--cover">
                    ${state.coverScrews.map((isRemoved, index) => `
                        <button class="engine-bolt${isRemoved ? " is-loose" : ""}" type="button" data-cover-screw="${index}" ${isRemoved ? "disabled" : ""}>
                            <span class="engine-bolt__head">${isRemoved ? "✓" : "＋"}</span>
                            <strong>PARAFUSO ${index + 1}</strong>
                            <small>${isRemoved ? "SOLTO" : "RETIRAR"}</small>
                        </button>`).join("")}
                </div>
                <div class="puzzle-progress">
                    <div><span>PROTEÇÃO REMOVIDA</span><b>${state.coverScrews.filter(Boolean).length}/2</b></div>
                    <span class="puzzle-progress__track"><i style="width:${(state.coverScrews.filter(Boolean).length / 2) * 100}%"></i></span>
                </div>`
            : `
                <p class="puzzle-story-note">Agora o suporte está acessível. Use a chave inglesa para retirar as três porcas que prendem o motor ao cavalete.</p>
                <div class="engine-bolts">
                    ${state.bolts.map((isRemoved, index) => `
                        <button class="engine-bolt${isRemoved ? " is-loose" : ""}" type="button" data-bolt="${index}" ${isRemoved ? "disabled" : ""}>
                            <span class="engine-bolt__head">${isRemoved ? "✓" : "＋"}</span>
                            <strong>PORCA ${index + 1}</strong>
                            <small>${isRemoved ? "SOLTA" : "RETIRAR"}</small>
                        </button>`).join("")}
                </div>
                <div class="puzzle-progress">
                    <div><span>PORCAS RETIRADAS</span><b>${removed}/3</b></div>
                    <span class="puzzle-progress__track"><i style="width:${(removed / 3) * 100}%"></i></span>
                </div>
                ${allRemoved ? `<button class="puzzle-button" type="button" data-action="engine-lift">Retirar motor da bancada</button>` : ""}`;

        renderShell("Retirar o motor", "CASA 05 · OFICINA", `
            <div class="engine-workbench engine-workbench--plain">
                ${workMarkup}
            </div>
            <p class="puzzle-hint">${coverRemoved ? "As porcas podem ser retiradas em qualquer ordem." : "Retire os dois parafusos para abrir a proteção."}</p>
        `, "A chave de fenda e a chave inglesa permanecem no inventário.");
    }

    function rotatePorts(ports, amount) {
        return ports.map(port => DIRECTIONS[(DIRECTIONS.indexOf(port) + amount) % 4]);
    }

    function circuitHasConnection(rotations) {
        const board = [
            [
                { ports: ["E"] },
                { ports: rotatePorts(["N", "S"], rotations[0]) },
                { ports: rotatePorts(["N", "E"], rotations[1]) }
            ],
            [
                { ports: [] },
                { ports: [] },
                { ports: ["N"] }
            ]
        ];
        const queue = [[0, 0]];
        const visited = new Set(["0,0"]);
        const steps = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };

        while (queue.length) {
            const [row, column] = queue.shift();
            if (row === 1 && column === 2) return true;
            for (const direction of board[row][column].ports) {
                const [dr, dc] = steps[direction];
                const nextRow = row + dr;
                const nextColumn = column + dc;
                if (nextRow < 0 || nextRow > 1 || nextColumn < 0 || nextColumn > 2) continue;
                const neighbor = board[nextRow][nextColumn];
                if (!neighbor.ports.includes(OPPOSITE[direction])) continue;
                const key = `${nextRow},${nextColumn}`;
                if (visited.has(key)) continue;
                visited.add(key);
                queue.push([nextRow, nextColumn]);
            }
        }
        return false;
    }

    function renderCircuit() {
        const state = puzzleState.circuit;
        renderShell("Ligar o guincho", "CAIS VELHO · PAINEL ELÉTRICO", `
            <p class="puzzle-story-note">A hélice ficou presa sob a plataforma. Repare o painel e ligue o guincho. Gire os dois trechos de cabo até ligar a fonte ao motor.</p>
            <div class="circuit-board circuit-board--plain">
                <div class="circuit-label circuit-label--source">BATERIA</div>
                <div class="circuit-grid">
                    <div class="circuit-terminal circuit-terminal--source">+</div>
                    <button class="wire-tile wire-tile--straight" type="button" data-wire="0" data-rotation="${state.rotations[0]}" aria-label="Girar trecho reto"></button>
                    <button class="wire-tile wire-tile--corner" type="button" data-wire="1" data-rotation="${state.rotations[1]}" aria-label="Girar curva"></button>
                    <span class="wire-empty"></span><span class="wire-empty"></span>
                    <div class="circuit-terminal circuit-terminal--sink">M</div>
                </div>
                <div class="circuit-label circuit-label--sink">MOTOR DO GUINCHO</div>
            </div>
            <p class="puzzle-hint">Clique em cada trecho para girá-lo. As conexões precisam se encontrar.</p>
        `, "O reparo consome a fita isolante e o fusível.");
    }

    function finishCircuit() {
        if (!hasItems(REQUIRED_FOR_CIRCUIT)) {
            renderLocked("Painel do guincho", "CAIS VELHO", missingItems(REQUIRED_FOR_CIRCUIT), "O painel precisa de um cabo isolado e de um fusível em boas condições.");
            return;
        }
        const consumedTape = options?.consumeItem?.("ITM_003") === true;
        const consumedFuse = options?.consumeItem?.("ITM_004") === true;
        if (!consumedTape || !consumedFuse) {
            setFeedback("Não foi possível concluir o reparo. Confira os itens.", "warning");
            return;
        }
        completePuzzle("circuit", "Hélice recuperada", "O guincho voltou a funcionar e ergueu a hélice que estava presa sob o píer.");
    }

    function renderCover() {
        const state = puzzleState.cover;
        const latches = [
            { id: "head", label: "Cabeceira" },
            { id: "foot", label: "Pés" },
            { id: "side", label: "Lateral" }
        ];
        renderShell("Soltar a lona da maca", "CASA 04 · ENFERMARIA", `
            <p class="puzzle-story-note">Solte as presilhas na ordem indicada no bilhete para retirar a lona e as amarras sem danificá-las.</p>
            <div class="cover-task">
                <div class="cover-task__stretcher" aria-label="Maca com três presilhas">
                    ${latches.map((latch, index) => {
                        const done = index < state.step;
                        return `<button class="cover-latch${done ? " is-released" : ""}" type="button" data-latch="${latch.id}" ${done ? "disabled" : ""}>
                            <span>${done ? "✓" : index + 1}</span><strong>${latch.label}</strong>
                        </button>`;
                    }).join("")}
                </div>
                <div class="puzzle-progress">
                    <div><span>PRESILHAS SOLTAS</span><b>${state.step}/3</b></div>
                    <span class="puzzle-progress__track"><i style="width:${(state.step / 3) * 100}%"></i></span>
                </div>
            </div>
            <p class="puzzle-hint">Solte as presilhas na ordem indicada no bilhete.</p>
        `, "A lona e o cordame serão usados no casco.");
    }

    function renderRadio() {
        const state = puzzleState.radio;
        renderShell("Sintonizar a rádio", "CASA 02 · RÁDIO COMUNITÁRIA", `
            <p class="puzzle-story-note">O rádio ainda recebe energia, mas o dial saiu do lugar. No papel preso ao aparelho está escrito: “Canal comunitário — 104,0 MHz”.</p>
            <div class="radio-tuner">
                <div class="radio-tuner__screen">
                    <small>FREQUÊNCIA FM</small>
                    <strong>${state.frequency.toFixed(1)} <span>MHz</span></strong>
                </div>
                <div class="radio-tuner__controls">
                    <button class="puzzle-button puzzle-button--quiet" type="button" data-action="radio-down" aria-label="Diminuir frequência">−</button>
                    <input type="range" min="88" max="108" step="1" value="${state.frequency}" data-frequency aria-label="Frequência da rádio">
                    <button class="puzzle-button puzzle-button--quiet" type="button" data-action="radio-up" aria-label="Aumentar frequência">+</button>
                </div>
                <button class="puzzle-button" type="button" data-action="radio-tune">Testar sintonia</button>
            </div>
            <p class="puzzle-hint">Ajuste o dial para 104,0 MHz.</p>
        `, "A rádio oferece uma pista opcional.");
    }

    function renderAssembly() {
        const state = puzzleState.assembly;
        const woodCount = state.installedWood.filter(Boolean).length;
        const allPartsInstalled = woodCount === 3 && Object.values(state.installed).every(Boolean);
        const installedCount = Object.values(state.installed).filter(Boolean).length;
        const availableParts = [
            { id: "wood", title: "Tábuas", detail: "Casco", amount: 3 },
            { id: "cover", title: "Lona e corda", detail: "Vedação", amount: 1 },
            { id: "engine", title: "Motor", detail: "Propulsão", amount: 1 },
            { id: "propeller", title: "Hélice", detail: "Propulsão", amount: 1 }
        ];

        const partButtons = availableParts.map(part => {
            const installed = part.id === "wood"
                ? woodCount >= 3
                : state.installed[part.id];
            return `<button class="assembly-part${installed ? " is-used" : ""}${state.selected === part.id ? " is-selected" : ""}" type="button" data-part="${part.id}" ${installed ? "disabled" : ""}>
                <strong>${escapeHTML(part.title)}</strong>
                <small>${installed ? "Instalado" : `${part.detail}${part.amount > 1 ? " · 3 peças" : ""}`}</small>
            </button>`;
        }).join("");

        renderShell("Montar o barco", "CAIS VELHO", `
            <p class="puzzle-story-note">Monte o casco primeiro. Depois prenda a lona nas emendas, fixe o motor e encaixe a hélice. No fim, aperte as peças e abasteça.</p>
            <div class="assembly-layout assembly-layout--plain">
                <div class="boat-blueprint" aria-label="Esquema simples do barco">
                    <div class="boat-blueprint__cover${state.installed.cover ? " is-installed" : ""}"><span>LONA</span></div>
                    <div class="boat-blueprint__hull">
                        ${state.installedWood.map((installed, index) => `<button class="assembly-slot assembly-slot--wood${installed ? " is-installed" : ""}" type="button" data-slot="wood" data-index="${index}" aria-label="Tábua ${index + 1}: ${installed ? "instalada" : "encaixar"}">${installed ? "OK" : `TÁBUA ${index + 1}`}</button>`).join("")}
                    </div>
                    <button class="assembly-slot assembly-slot--engine${state.installed.engine ? " is-installed" : ""}" type="button" data-slot="engine">${state.installed.engine ? "MOTOR OK" : "MOTOR"}</button>
                    <button class="assembly-slot assembly-slot--propeller${state.installed.propeller ? " is-installed" : ""}" type="button" data-slot="propeller">${state.installed.propeller ? "HÉLICE OK" : "HÉLICE"}</button>
                    <button class="assembly-slot assembly-slot--cover${state.installed.cover ? " is-installed" : ""}" type="button" data-slot="cover">${state.installed.cover ? "LONA OK" : "LONA"}</button>
                </div>
                <div class="assembly-tray">
                    <span class="assembly-tray__label">PEÇAS RECUPERADAS</span>
                    ${partButtons}
                </div>
            </div>
            <div class="assembly-checks">
                <div class="assembly-check${allPartsInstalled ? " is-ready" : ""}"><strong>Peças</strong><small>${woodCount}/3 tábuas · ${installedCount}/3 componentes</small></div>
                <div class="assembly-check${state.fastened ? " is-ready" : ""}"><strong>Fixações</strong><small>${state.fastened ? "Apertadas" : "Chave de fenda e chave inglesa"}</small></div>
                <div class="assembly-check${state.fuelled ? " is-ready" : ""}"><strong>Combustível</strong><small>${state.fuelled ? "Tanque abastecido" : "Galão de gasolina"}</small></div>
            </div>
            <div class="assembly-actions">
                ${allPartsInstalled && !state.fastened ? `<button class="puzzle-button" type="button" data-action="fasten">Apertar fixações</button>` : ""}
                ${allPartsInstalled && state.fastened && !state.fuelled ? `<button class="puzzle-button" type="button" data-action="fuel">Abastecer motor</button>` : ""}
                ${allPartsInstalled && state.fastened && state.fuelled ? `<button class="puzzle-button puzzle-button--launch" type="button" data-action="launch">Ligar o motor</button>` : ""}
            </div>
            <p class="puzzle-hint">Selecione uma peça e depois clique no encaixe correspondente.</p>
        `, "As ferramentas são reutilizáveis. A gasolina é consumida.");
    }

    function showVictory() {
        victory = true;
        if (options?.onVictory) options.onVictory();
        if (!overlay) return;
        overlay.hidden = false;
        overlay.classList.add("puzzle-overlay--victory");
        overlay.innerHTML = `
            <div class="puzzle-dialog puzzle-dialog--victory" role="dialog" aria-modal="true" aria-labelledby="victoryTitle">
                <p class="puzzle-eyebrow">VILA COSTEIRA · 1984</p>
                <h2 id="victoryTitle">Você conseguiu sair.</h2>
                <p>O motor pega depois de algumas tentativas. O barco se afasta do cais enquanto a maré começa a subir.</p>
                <p class="victory-note">A vila fica para trás. O pescador conseguiu construir um barco e escapar da região.</p>
                <button class="puzzle-button" type="button" data-action="restart">Jogar novamente</button>
            </div>`;
        overlay.querySelector("[data-action='restart']")?.focus();
    }

    function handleWoodHit() {
        const state = puzzleState.wood;
        state.hits += 1;
        if (state.hits >= 6) {
            completePuzzle("wood", "Três tábuas", "A parte reta do tronco rendeu madeira suficiente para montar o casco.");
            return;
        }
        renderWood();
        setFeedback("O corte avançou. Continue separando a madeira.", "success");
    }

    function handleCoverScrew(index) {
        const state = puzzleState.engine.coverScrews;
        if (!Number.isInteger(index) || index < 0 || index >= state.length || state[index]) return;
        state[index] = true;
        renderEngine();
        setFeedback(state.every(Boolean)
            ? "Proteção removida. Agora solte as três porcas com a chave inglesa."
            : "Parafuso retirado. Falta mais um.", "success");
    }

    function handleBolt(index) {
        const state = puzzleState.engine;
        if (!state.coverScrews.every(Boolean)) return;
        if (!Number.isInteger(index) || index < 0 || index >= state.bolts.length || state.bolts[index]) return;
        state.bolts[index] = true;
        const removed = state.bolts.filter(Boolean).length;
        renderEngine();
        setFeedback(removed === 3
            ? "O suporte está solto. Agora retire o motor da bancada."
            : "Porca retirada. Continue nas outras.", "success");
    }

    function handleCoverLatch(id) {
        const expected = COVER_SEQUENCE[puzzleState.cover.step];
        if (id !== expected) {
            setFeedback("Essa presilha ainda está segurando a lona. Siga a ordem indicada no bilhete.", "warning");
            return;
        }
        puzzleState.cover.step += 1;
        if (puzzleState.cover.step >= COVER_SEQUENCE.length) {
            completePuzzle("cover", "Lona e cordame", "A lona da maca está inteira. As amarras também podem reforçar as emendas do casco.");
            return;
        }
        renderCover();
        setFeedback("Presilha solta. Continue na ordem indicada.", "success");
    }

    function selectAssemblyPart(partId) {
        const state = puzzleState.assembly;
        if (partId === "wood" && state.installedWood.every(Boolean)) return;
        if (partId !== "wood" && state.installed[partId]) return;
        state.selected = partId;
        renderAssembly();
        setFeedback(`Peça selecionada: ${partId === "wood" ? "tábuas" : partId === "cover" ? "lona e corda" : partId === "engine" ? "motor" : "hélice"}. Escolha o encaixe.`);
    }

    function placeAssemblyPart(slot, index) {
        const state = puzzleState.assembly;
        if (!state.selected) {
            setFeedback("Selecione uma peça antes de escolher o encaixe.", "warning");
            return;
        }
        if (state.selected !== slot) {
            setFeedback("Essa peça não encaixa nesse ponto do barco.", "warning");
            return;
        }
        if (slot === "wood") {
            if (state.installedWood[index]) return;
            state.installedWood[index] = true;
        } else {
            if (slot === "cover" && !state.installedWood.every(Boolean)) {
                setFeedback("Primeiro monte as três tábuas do casco.", "warning");
                return;
            }
            if (slot === "engine" && !state.installed.cover) {
                setFeedback("Reforce as emendas com a lona antes de instalar o motor.", "warning");
                return;
            }
            if (slot === "propeller" && !state.installed.engine) {
                setFeedback("Instale o motor antes de encaixar a hélice.", "warning");
                return;
            }
            state.installed[slot] = true;
        }
        state.selected = null;
        renderAssembly();
        setFeedback("Peça instalada.", "success");
    }

    function handleAction(action) {
        if (action === "close") {
            close();
            return;
        }
        if (action === "chop") {
            handleWoodHit();
            return;
        }
        if (action === "engine-lift") {
            if (puzzleState.engine.coverScrews.every(Boolean) && puzzleState.engine.bolts.every(Boolean)) {
                completePuzzle("engine", "Motor de popa", "O motor saiu do suporte. Está sujo e enferrujado, mas ainda pode funcionar.");
            }
            return;
        }
        if (action === "radio-down" || action === "radio-up") {
            const change = action === "radio-up" ? 1 : -1;
            puzzleState.radio.frequency = Math.max(88, Math.min(108, puzzleState.radio.frequency + change));
            updateRadioDisplay();
            const slider = overlay?.querySelector("[data-frequency]");
            if (slider) slider.value = String(puzzleState.radio.frequency);
            return;
        }
        if (action === "radio-tune") {
            if (puzzleState.radio.frequency !== RADIO_FREQUENCY) {
                setFeedback("Ainda há chiado. Ajuste para 104,0 MHz.", "warning");
                return;
            }
            puzzleState.radio.solved = true;
            renderShell("Mensagem recebida", "RÁDIO COMUNITÁRIA · 104,0 MHZ", `
                <div class="puzzle-reward">
                    <p>“A lona da maca da enfermaria está inteira. Solte as presilhas na ordem indicada para aproveitar a lona e as amarras.”</p>
                    <button class="puzzle-button" type="button" data-action="close">Fechar rádio</button>
                </div>`, "A mensagem foi registrada.");
            return;
        }
        if (action === "fasten") {
            if (!hasItems(["ITM_001", "ITM_002"])) {
                setFeedback("Você precisa da chave de fenda e da chave inglesa.", "warning");
                return;
            }
            puzzleState.assembly.fastened = true;
            renderAssembly();
            setFeedback("As fixações estão firmes. Falta abastecer.", "success");
            return;
        }
        if (action === "fuel") {
            if (!hasItems(["ITM_005"])) {
                setFeedback("Você precisa do galão de gasolina.", "warning");
                return;
            }
            if (options?.consumeItem?.("ITM_005") !== true) {
                setFeedback("Não foi possível usar a gasolina.", "warning");
                return;
            }
            puzzleState.assembly.fuelled = true;
            renderAssembly();
            setFeedback("Tanque abastecido. O motor está pronto.", "success");
            return;
        }
        if (action === "launch") {
            const state = puzzleState.assembly;
            const complete = state.installedWood.every(Boolean) &&
                Object.values(state.installed).every(Boolean) && state.fastened && state.fuelled;
            if (complete) showVictory();
            return;
        }
        if (action === "restart") window.location.reload();
    }

    function handleOverlayClick(event) {
        const actionTarget = event.target.closest("[data-action]");
        if (actionTarget) {
            handleAction(actionTarget.dataset.action);
            return;
        }

        const coverScrew = event.target.closest("[data-cover-screw]");
        if (coverScrew && activePuzzle === "engine") {
            handleCoverScrew(Number(coverScrew.dataset.coverScrew));
            return;
        }

        const bolt = event.target.closest("[data-bolt]");
        if (bolt && activePuzzle === "engine") {
            handleBolt(Number(bolt.dataset.bolt));
            return;
        }

        const wire = event.target.closest("[data-wire]");
        if (wire && activePuzzle === "circuit") {
            const index = Number(wire.dataset.wire);
            puzzleState.circuit.rotations[index] = (puzzleState.circuit.rotations[index] + 1) % 4;
            if (circuitHasConnection(puzzleState.circuit.rotations)) {
                finishCircuit();
            } else {
                renderCircuit();
                setFeedback("Ainda existe uma interrupção. Gire outro trecho.");
            }
            return;
        }

        const latch = event.target.closest("[data-latch]");
        if (latch && activePuzzle === "cover") {
            handleCoverLatch(latch.dataset.latch);
            return;
        }

        const part = event.target.closest("[data-part]");
        if (part && activePuzzle === "assembly") {
            selectAssemblyPart(part.dataset.part);
            return;
        }

        const slot = event.target.closest("[data-slot]");
        if (slot && activePuzzle === "assembly") {
            placeAssemblyPart(slot.dataset.slot, Number(slot.dataset.index || 0));
        }
    }

    function updateRadioDisplay() {
        const display = overlay?.querySelector(".radio-tuner__screen strong");
        if (display) display.innerHTML = `${puzzleState.radio.frequency.toFixed(1)} <span>MHz</span>`;
    }

    function handleFrequencyInput(event) {
        const slider = event.target.closest("[data-frequency]");
        if (!slider || activePuzzle !== "radio") return;
        puzzleState.radio.frequency = Number(slider.value);
        updateRadioDisplay();
    }

    function close(clearActive = true) {
        if (overlay) overlay.hidden = true;
        if (clearActive) activePuzzle = null;
        if (prompt) prompt.hidden = true;
    }

    function interact(player) {
        if (isModalOpen() || victory) return true;
        const location = nearbyLocation(player);
        if (!location) return false;
        if (location.id === "assembly" && solved.size < TASKS.length) {
            openPuzzle("assembly");
            return true;
        }
        openPuzzle(location.id);
        return true;
    }

    function init(config) {
        options = config;
        overlay = document.getElementById("puzzleOverlay");
        prompt = document.getElementById("interactionPrompt");
        promptText = document.getElementById("interactionPromptText");

        if (overlay && !overlay.dataset.bound) {
            overlay.addEventListener("click", handleOverlayClick);
            overlay.addEventListener("input", handleFrequencyInput);
            overlay.addEventListener("keydown", event => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    close();
                }
            });
            overlay.dataset.bound = "true";
        }
    }

    window.boatPuzzles = {
        init,
        updateProximity,
        drawMarkers,
        interact,
        close,
        isModalOpen,
        getProgress() {
            return { solved: [...solved], total: TASKS.length, victory };
        }
    };
})();
