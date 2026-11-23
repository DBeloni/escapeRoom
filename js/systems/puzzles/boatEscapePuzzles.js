/*
 * Desafios procedurais da fuga pelo cais.
 * Cada desafio recebe uma configuração aleatória na primeira execução da partida.
 * As configurações são sempre geradas com solução válida e permanecem estáveis
 * enquanto o jogador fecha/reabre o painel.
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

    const PUZZLE_DESCRIPTIONS = {
        wood: "Separar três tábuas do tronco usando precisão e tempo.",
        engine: "Liberar o motor da oficina ajustando as engrenagens acopladas.",
        circuit: "Restabelecer a ligação elétrica do guincho girando os segmentos do circuito.",
        cover: "Aliviar a tensão das quatro presilhas para recuperar lona e cordame.",
        radio: "Sintonizar a frequência e o ganho para recuperar uma mensagem da oficina.",
        assembly: "Montar o casco, instalar os componentes, abastecer e dar partida no barco."
    };

    const REQUIRED_FOR_WOOD = ["ITM_001"];
    const REQUIRED_FOR_ENGINE = ["ITM_001", "ITM_002"];
    const REQUIRED_FOR_CIRCUIT = ["ITM_003", "ITM_004"];
    const REQUIRED_FOR_ASSEMBLY = ["ITM_001", "ITM_002", "ITM_005"];
    const PUZZLE_INTERACTION_RADIUS = 160;
    const DIRECTIONS = ["N", "E", "S", "W"];
    const OPPOSITE = { N: "S", E: "W", S: "N", W: "E" };
    const DIRECTION_GLYPHS = { N: "↑", E: "→", S: "↓", W: "←" };
    const CRANK_KEYS = ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"];
    const CRANK_GLYPHS = ["↑", "←", "↓", "→"];

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function shuffled(values) {
        const result = [...values];
        for (let index = result.length - 1; index > 0; index -= 1) {
            const swapIndex = randomInt(0, index);
            [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
        }
        return result;
    }

    function createWoodRound(round) {
        return {
            target: randomInt(24, 76),
            tolerance: [11, 9, 7][Math.min(round, 2)],
            duration: [2200, 1850, 1500][Math.min(round, 2)],
            startedAt: 0,
            misses: 0
        };
    }

    function createCircuitPath() {
        const start = [0, 0];
        const finish = [3, 3];
        function keyOf(point) { return `${point[0]},${point[1]}`; }

        function search(current, path, visited) {
            if (current[0] === finish[0] && current[1] === finish[1]) {
                return path.length >= 7 && path.length <= 12 ? [...path] : null;
            }

            const [row, column] = current;
            const candidates = shuffled([
                [row - 1, column], [row + 1, column],
                [row, column - 1], [row, column + 1]
            ]).filter(function (candidate) {
                const nextRow = candidate[0];
                const nextColumn = candidate[1];
                return nextRow >= 0 && nextRow < 4 && nextColumn >= 0 && nextColumn < 4;
            });

            for (const candidate of candidates) {
                const key = keyOf(candidate);
                if (visited.has(key)) continue;
                // Evita passeios longos que se afastam demais da saída.
                const remaining = Math.abs(3 - candidate[0]) + Math.abs(3 - candidate[1]);
                if (path.length + remaining > 12) continue;
                visited.add(key);
                path.push(candidate);
                const result = search(candidate, path, visited);
                if (result) return result;
                path.pop();
                visited.delete(key);
            }
            return null;
        }

        for (let attempt = 0; attempt < 40; attempt += 1) {
            const result = search(start, [start], new Set([keyOf(start)]));
            if (result) return result;
        }

        // Rota de segurança: continua sendo embaralhada pelas rotações iniciais.
        return [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2], [3, 3]];
    }

    function directionBetween(from, to) {
        const rowDelta = to[0] - from[0];
        const columnDelta = to[1] - from[1];
        if (rowDelta === -1) return "N";
        if (rowDelta === 1) return "S";
        if (columnDelta === 1) return "E";
        return "W";
    }

    function createCircuitState() {
        const path = createCircuitPath();
        const tiles = path.map(function (point, index) {
            const basePorts = [];
            if (index === 0) basePorts.push("W");
            else basePorts.push(directionBetween(point, path[index - 1]));
            if (index === path.length - 1) basePorts.push("E");
            else basePorts.push(directionBetween(point, path[index + 1]));
            return {
                row: point[0],
                column: point[1],
                basePorts,
                rotation: randomInt(0, 3)
            };
        });
        return { path, tiles };
    }

    function createEngineState() {
        let gears = [randomInt(0, 3), randomInt(0, 3), randomInt(0, 3)];
        while (gears.every(function (value) { return value === 0; })) {
            gears = [randomInt(0, 3), randomInt(0, 3), randomInt(0, 3)];
        }
        return { gears, moves: 0 };
    }

    function createCoverState() {
        const target = {
            head: randomInt(1, 5),
            foot: randomInt(1, 5),
            left: randomInt(1, 5),
            right: randomInt(1, 5)
        };
        const values = {
            head: randomInt(0, 5),
            foot: randomInt(0, 5),
            left: randomInt(0, 5),
            right: randomInt(0, 5)
        };
        if (Object.keys(target).every(function (key) { return target[key] === values[key]; })) {
            values.head = (values.head + 1) % 6;
        }
        return {
            target,
            values,
            clues: [
                { label: "Cabeceira + pés", value: target.head + target.foot },
                { label: "Esquerda + direita", value: target.left + target.right },
                { label: "Cabeceira + esquerda", value: target.head + target.left },
                { label: "Cabeceira + direita", value: target.head + target.right }
            ]
        };
    }

    function createRadioState() {
        const targetFrequency = randomInt(900, 1060) / 10;
        const targetGain = randomInt(1, 5);
        let frequency = 98;
        let gain = 3;
        if (Math.abs(frequency - targetFrequency) <= 0.2 && gain === targetGain) {
            frequency = targetFrequency < 107 ? targetFrequency + 0.7 : targetFrequency - 0.7;
        }
        return { frequency, gain, targetFrequency, targetGain, solved: false };
    }

    const solved = new Set();

    // Cada mecanismo mantém seu estado e oferece operações próprias.
    function criarObjetoInterativo(id, estado) {
        return {
            id: id,
            estado: estado,
            isSolved: function () { return solved.has(id) || this.estado.solved === true; },
            inspect: function () {
                return {
                    id: this.id,
                    solved: this.isSolved(),
                    description: PUZZLE_DESCRIPTIONS[this.id] || "Mecanismo interativo da zona costeira."
                };
            },
            interact: function () { return interactById(this.id); },
            complete: function () {
                if (this.isSolved()) return false;
                solved.add(id);
                this.estado.solved = true;
                return true;
            },
            reset: function (novoEstado) {
                for (const chave of Object.keys(this.estado)) {
                    delete this.estado[chave];
                }
                Object.assign(this.estado, novoEstado);
                solved.delete(id);
            }
        };
    }

    const puzzleState = {
        wood: { round: 0, current: createWoodRound(0) },
        engine: createEngineState(),
        circuit: createCircuitState(),
        cover: createCoverState(),
        radio: createRadioState(),
        assembly: {
            selected: null,
            installedWood: [false, false, false],
            installed: { engine: false, propeller: false, cover: false },
            fastened: false,
            fuelled: false,
            starter: {
                pattern: Array.from({ length: 6 }, function () { return randomInt(0, 3); }),
                armed: false,
                progress: 0
            }
        }
    };

    const objetosInterativos = {
        wood: criarObjetoInterativo("wood", puzzleState.wood),
        engine: criarObjetoInterativo("engine", puzzleState.engine),
        circuit: criarObjetoInterativo("circuit", puzzleState.circuit),
        cover: criarObjetoInterativo("cover", puzzleState.cover),
        radio: criarObjetoInterativo("radio", puzzleState.radio),
        assembly: criarObjetoInterativo("assembly", puzzleState.assembly)
    };

    let options = null;
    let overlay = null;
    let prompt = null;
    let promptText = null;
    let activePuzzle = null;
    let modalReturnFocus = null;
    let victory = false;
    let victoryTime = "";

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };
            return entities[character];
        });
    }

    function hasItems(itemIds) {
        const inventory = options?.getInventory?.() ?? [];
        return itemIds.every(function (itemId) { return inventory.includes(itemId); });
    }

    function missingItems(itemIds) {
        const inventory = options?.getInventory?.() ?? [];
        return itemIds.filter(function (itemId) { return !inventory.includes(itemId); });
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
            ? `<ul class="puzzle-requirements">${missing.map(function (id) { return `<li>${escapeHTML(ITEM_NAMES[id] || id)}</li>`; }).join("")}</ul>`
            : "";
        renderShell(title, context, `
            <div class="puzzle-locked">
                <p>${escapeHTML(explanation)}</p>
                ${missingMarkup}
                <button class="puzzle-button puzzle-button--quiet" type="button" data-action="close">Voltar</button>
            </div>`, "Os itens não são consumidos ao abrir o desafio.");
    }

    function completePuzzle(id, rewardTitle, rewardText) {
        const objeto = objetosInterativos[id];
        if (objeto && !objeto.complete()) return;
        if (!objeto && solved.has(id)) return;
        if (!objeto) solved.add(id);
        if (options?.onPuzzleSolved) {
            const tarefa = TASKS.find(function (item) { return item.id === id; });
            options.onPuzzleSolved(tarefa ? tarefa.label : id, rewardTitle);
        }
        renderShell("Peça recuperada", "PLANO DE FUGA", `
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
            if (TASKS.some(function (task) { return task.id === location.id; }) && solved.has(location.id)) continue;
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
        const zoom = Math.max(1, sceneZoom);
        const radius = 14 / zoom;
        context.font = `bold ${15 / zoom}px monospace`;

        for (const location of LOCATIONS) {
            if (location.scene !== scene) continue;
            if (location.houseId && location.houseId !== houseId) continue;
            if (TASKS.some(function (task) { return task.id === location.id; }) && solved.has(location.id)) continue;
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
                    "A chave de fenda serve como cunha. O tronco está sob tensão: cada tábua precisa ser separada no ponto certo."
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
                    "A proteção do eixo está presa. A chave de fenda e a chave inglesa são necessárias para alcançar e liberar o conjunto de engrenagens."
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
            const missingParts = TASKS.filter(function (task) { return !solved.has(task.id); });
            if (missingParts.length) {
                renderShell("Ainda faltam peças", "CAIS VELHO", `
                    <div class="puzzle-locked">
                    <p>Antes de montar, reúna os materiais necessários para construir o barco.</p>
                        <ul class="puzzle-requirements">${missingParts.map(function (task) { return `<li>${escapeHTML(task.reward)}</li>`; }).join("")}</ul>
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

    // ---------------------------------------------------------------------
    // 1. MADEIRA — desafio de precisão e tempo
    // ---------------------------------------------------------------------
    function renderWood() {
        const state = puzzleState.wood;
        const round = state.round;
        const current = state.current;
        current.startedAt = performance.now();
        const progress = Math.round((round / 3) * 100);
        renderShell("Separar a madeira", "TRONCO CAÍDO · ZONA COSTEIRA", `
            <p class="puzzle-story-note">O tronco está rachado, mas a madeira ainda está presa pelas fibras. Acione a alavanca quando o ponteiro cruzar a faixa marcada. A janela fica menor a cada tábua.</p>
            <div class="advanced-wood">
                <div class="advanced-wood__log" aria-hidden="true"><span></span><span></span><span></span></div>
                <div class="advanced-wood__readout">
                    <div><span>TÁBUA</span><strong>${round + 1}/3</strong></div>
                    <div><span>FALHAS NESTA TÁBUA</span><strong data-wood-misses>${current.misses}/3</strong></div>
                </div>
                <div class="wood-meter" style="--wood-duration:${current.duration}ms" aria-label="Ponteiro móvel e faixa segura">
                    <span class="wood-meter__safe" style="left:${current.target - current.tolerance}%;width:${current.tolerance * 2}%"></span>
                    <i class="wood-meter__needle"></i>
                </div>
                <div class="wood-meter__scale"><span>SEM PRESSÃO</span><span>ALÍVIO MÁXIMO</span></div>
                <div class="puzzle-progress">
                    <div><span>MADEIRA SEPARADA</span><b>${round}/3</b></div>
                    <span class="puzzle-progress__track"><i style="width:${progress}%"></i></span>
                </div>
                <button class="puzzle-button wood-strike" type="button" data-action="wood-strike">Acionar a cunha <kbd>ESPAÇO</kbd></button>
            </div>
            <p class="puzzle-hint">Não adianta clicar rápido: observe o movimento e escolha o instante. Três falhas fazem a fibra escapar e obrigam a repetir a tábua atual.</p>
        `, "Clique no botão ou pressione Espaço. A chave de fenda é reutilizável.");
    }

    function woodNeedlePosition() {
        const current = puzzleState.wood.current;
        const elapsed = (performance.now() - current.startedAt) % current.duration;
        const phase = elapsed / current.duration;
        return phase <= 0.5 ? phase * 200 : (1 - phase) * 200;
    }

    function handleWoodStrike() {
        const state = puzzleState.wood;
        const current = state.current;
        const distance = Math.abs(woodNeedlePosition() - current.target);
        if (distance <= current.tolerance) {
            state.round += 1;
            if (state.round >= 3) {
                completePuzzle("wood", "Três tábuas", "A cunha abriu as fibras sem rachar a madeira. As três tábuas estão prontas para o casco.");
                return;
            }
            state.current = createWoodRound(state.round);
            renderWood();
            setFeedback("Boa. A próxima fibra está mais presa — a janela de precisão diminuiu.", "success");
            return;
        }

        current.misses += 1;
        const missCounter = overlay?.querySelector("[data-wood-misses]");
        if (missCounter) missCounter.textContent = `${current.misses}/3`;
        if (current.misses >= 3) {
            state.current = createWoodRound(state.round);
            renderWood();
            setFeedback("A fibra escapou. A tábua continua inteira, mas você precisa encontrar outro ponto de pressão.", "warning");
            return;
        }
        setFeedback(distance > current.tolerance * 2
            ? "Muito fora da marca. Espere o ponteiro voltar à faixa." 
            : "Quase. Segure a mão e tente no próximo ciclo.", "warning");
    }

    // ---------------------------------------------------------------------
    // 2. MOTOR — engrenagens acopladas e estado modular
    // ---------------------------------------------------------------------
    function renderEngine() {
        const state = puzzleState.engine;
        const solvedGears = state.gears.every(function (value) { return value === 0; });
        const gearNames = ["ENGRENAGEM ESQUERDA", "ENGRENAGEM CENTRAL", "ENGRENAGEM DIREITA"];
        const gearsMarkup = state.gears.map(function (orientation, index) { return `
            <button class="gear-control${solvedGears ? " is-aligned" : ""}" type="button" data-gear="${index}" ${solvedGears ? "disabled" : ""} aria-label="Girar ${gearNames[index].toLowerCase()}. Posição atual ${DIRECTION_GLYPHS[DIRECTIONS[orientation]]}">
                <span class="gear-control__target"></span>
                <span class="gear-wheel" style="transform:rotate(${orientation * 90}deg)"><i>${DIRECTION_GLYPHS[DIRECTIONS[orientation]]}</i></span>
                <strong>${index + 1}</strong>
                <small>${DIRECTION_GLYPHS[DIRECTIONS[orientation]]} · ${gearNames[index].replace("ENGRENAGEM ", "")}</small>
            </button>`; }).join("");

        renderShell("Sincronizar o suporte", "CASA 05 · OFICINA", `
            <p class="puzzle-story-note">O motor está preso por um conjunto de engrenagens de segurança. Alinhe as três marcas com o pino superior. Girar uma roda também movimenta as rodas acopladas — não são independentes.</p>
            <div class="gear-workbench">
                <div class="gear-controls">${gearsMarkup}</div>
                <div class="gear-legend">
                    <span><b>ESQUERDA</b> move esquerda + centro</span>
                    <span><b>CENTRAL</b> move as três</span>
                    <span><b>DIREITA</b> move centro + direita</span>
                </div>
                <div class="puzzle-progress">
                    <div><span>GIROS REGISTRADOS</span><b>${state.moves}</b></div>
                    <span class="puzzle-progress__track"><i style="width:${Math.min(100, state.moves * 5)}%"></i></span>
                </div>
                ${solvedGears ? `<div class="gear-success"><strong>CONJUNTO ALINHADO</strong><p>As marcas estão na vertical. O suporte pode ser liberado.</p><button class="puzzle-button" type="button" data-action="engine-lift">Liberar e retirar o motor</button></div>` : ""}
            </div>
            <p class="puzzle-hint">Cada clique avança as engrenagens envolvidas em 90°. A posição correta é sempre a seta apontada para cima.</p>
        `, "Use o mouse ou o toque. A chave de fenda e a chave inglesa permanecem no inventário.");
    }

    function handleGearTurn(index) {
        const state = puzzleState.engine;
        if (state.gears.every(function (value) { return value === 0; })) return;
        const coupled = [[0, 1], [0, 1, 2], [1, 2]];
        if (!Number.isInteger(index) || index < 0 || index > 2) return;
        coupled[index].forEach(function (gearIndex) {
            state.gears[gearIndex] = (state.gears[gearIndex] + 1) % 4;
        });
        state.moves += 1;
        renderEngine();
        setFeedback(state.gears.every(function (value) { return value === 0; })
            ? "As três marcas coincidiram. O suporte está destravado."
            : "O eixo respondeu. Observe como as rodas acopladas também mudaram.", state.gears.every(function (value) { return value === 0; }) ? "success" : "normal");
    }

    // ---------------------------------------------------------------------
    // 3. CIRCUITO — roteamento procedural em uma matriz 4 x 4
    // ---------------------------------------------------------------------
    function rotatePorts(ports, amount) {
        return ports.map(function (port) { return DIRECTIONS[(DIRECTIONS.indexOf(port) + amount) % 4]; });
    }

    function getCircuitPorts(tile) {
        return rotatePorts(tile.basePorts, tile.rotation);
    }

    function circuitHasConnection() {
        const state = puzzleState.circuit;
        const board = new Map(state.tiles.map(function (tile) { return [`${tile.row},${tile.column}`, tile]; }));
        const start = state.tiles[0];
        const finish = state.tiles[state.tiles.length - 1];
        if (!getCircuitPorts(start).includes("W")) return false;

        const queue = [start];
        const visited = new Set([`${start.row},${start.column}`]);
        const steps = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };

        while (queue.length) {
            const tile = queue.shift();
            if (tile === finish && getCircuitPorts(tile).includes("E")) return true;
            for (const direction of getCircuitPorts(tile)) {
                const [rowDelta, columnDelta] = steps[direction];
                const row = tile.row + rowDelta;
                const column = tile.column + columnDelta;
                const neighbor = board.get(`${row},${column}`);
                if (!neighbor || !getCircuitPorts(neighbor).includes(OPPOSITE[direction])) continue;
                const key = `${row},${column}`;
                if (visited.has(key)) continue;
                visited.add(key);
                queue.push(neighbor);
            }
        }
        return false;
    }

    function renderCircuit() {
        const state = puzzleState.circuit;
        const tileMap = new Map(state.tiles.map(function (tile, index) { return [`${tile.row},${tile.column}`, { tile, index }]; }));
        const cells = [];
        for (let row = 0; row < 4; row += 1) {
            for (let column = 0; column < 4; column += 1) {
                const entry = tileMap.get(`${row},${column}`);
                if (!entry) {
                    cells.push(`<span class="pipe-cell pipe-cell--empty" aria-hidden="true"></span>`);
                    continue;
                }
                const { tile, index } = entry;
                const ports = getCircuitPorts(tile);
                const arms = ports.map(function (port) { return `<i class="pipe-arm pipe-arm--${port.toLowerCase()}"></i>`; }).join("");
                const endpoint = index === 0 ? " is-source" : index === state.tiles.length - 1 ? " is-sink" : "";
                const shape = ports.length === 2 && (DIRECTIONS.indexOf(ports[0]) + 2) % 4 === DIRECTIONS.indexOf(ports[1])
                    ? "straight" : "corner";
                cells.push(`<button class="pipe-cell pipe-cell--${shape}${endpoint}" type="button" data-wire="${index}" aria-label="Girar conexão ${index + 1}; portas atuais: ${ports.join(", ")}">${arms}<i class="pipe-hub"></i></button>`);
            }
        }

        renderShell("Reativar o guincho", "CAIS VELHO · PAINEL ELÉTRICO", `
            <p class="puzzle-story-note">A energia precisa atravessar o painel até o motor. O trajeto foi montado com peças giratórias e a fiação está embaralhada. Gire cada conexão até formar um caminho contínuo entre a bateria e o guincho.</p>
            <div class="circuit-endpoints"><span>◉ BATERIA / ENTRADA</span><span>MOTOR / SAÍDA ◉</span></div>
            <div class="pipe-board" role="group" aria-label="Painel de conexões 4 por 4">${cells.join("")}</div>
            <div class="circuit-status"><span>PEÇAS NO TRAJETO</span><strong>${state.tiles.length}</strong><span>·</span><span>ROTA ALEATÓRIA</span></div>
            <p class="puzzle-hint">Uma conexão só conduz energia quando os dois lados encostam. Peças vazias não conduzem. O caminho muda a cada partida.</p>
        `, "Clique ou toque nas conexões. O reparo consome a fita isolante e o fusível.");
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

    function handleWireTurn(index) {
        const tile = puzzleState.circuit.tiles[index];
        if (!tile) return;
        tile.rotation = (tile.rotation + 1) % 4;
        if (circuitHasConnection()) {
            finishCircuit();
            return;
        }
        renderCircuit();
        setFeedback("Ainda há uma interrupção no caminho. Confira as extremidades de cada peça.");
    }

    // ---------------------------------------------------------------------
    // 4. LONA — sistema de equações para equilibrar a tensão das presilhas
    // ---------------------------------------------------------------------
    function coverEquationsSatisfied() {
        const state = puzzleState.cover;
        const values = state.values;
        return values.head + values.foot === state.clues[0].value &&
            values.left + values.right === state.clues[1].value &&
            values.head + values.left === state.clues[2].value &&
            values.head + values.right === state.clues[3].value;
    }

    function renderCover() {
        const state = puzzleState.cover;
        const labels = [
            { id: "head", label: "Cabeceira", short: "N" },
            { id: "right", label: "Lateral direita", short: "L" },
            { id: "foot", label: "Pés", short: "S" },
            { id: "left", label: "Lateral esquerda", short: "O" }
        ];
        const matches = [
            state.values.head + state.values.foot === state.clues[0].value,
            state.values.left + state.values.right === state.clues[1].value,
            state.values.head + state.values.left === state.clues[2].value,
            state.values.head + state.values.right === state.clues[3].value
        ];
        const controls = labels.map(function (item) { return `
            <div class="tension-control">
                <div class="tension-control__name"><b>${item.short}</b><span>${item.label}</span></div>
                <button type="button" data-tension="${item.id}" data-delta="-1" aria-label="Diminuir tensão da ${item.label.toLowerCase()}" ${state.values[item.id] <= 0 ? "disabled" : ""}>−</button>
                <strong>${state.values[item.id]}</strong>
                <button type="button" data-tension="${item.id}" data-delta="1" aria-label="Aumentar tensão da ${item.label.toLowerCase()}" ${state.values[item.id] >= 5 ? "disabled" : ""}>+</button>
            </div>`; }).join("");
        const clues = state.clues.map(function (clue, index) { return `
            <li class="${matches[index] ? "is-matched" : ""}"><span>${escapeHTML(clue.label)}</span><b>= ${clue.value}</b></li>`; }).join("");

        renderShell("Equilibrar a lona", "CASA 04 · ENFERMARIA", `
            <p class="puzzle-story-note">A lona está presa à armação da maca. Se soltar um lado com tensão desigual, o tecido rasga. Ajuste as quatro presilhas usando as relações anotadas no verso da etiqueta.</p>
            <div class="tension-workbench">
                <div class="tension-equations">
                    <span class="tension-equations__title">ANOTAÇÕES DE CARGA</span>
                    <ol>${clues}</ol>
                </div>
                <div class="tension-controls">${controls}</div>
                <div class="tension-progress"><span>RELAÇÕES CONFERIDAS</span><strong>${matches.filter(Boolean).length}/4</strong></div>
                ${matches.every(Boolean) ? `<div class="gear-success"><strong>TENSÃO EQUILIBRADA</strong><p>As quatro presilhas estão sob a carga correta. A lona pode ser retirada inteira.</p><button class="puzzle-button" type="button" data-action="cover-release">Soltar a armação</button></div>` : ""}
            </div>
            <p class="puzzle-hint">Cada presilha varia de 0 a 5. As quatro relações precisam ser verdadeiras ao mesmo tempo; não basta acertar apenas uma dupla.</p>
        `, "Use os botões + e −. As quatro equações têm uma única combinação válida.");
    }

    function adjustCoverTension(id, delta) {
        const state = puzzleState.cover;
        if (!Object.prototype.hasOwnProperty.call(state.values, id)) return;
        state.values[id] = Math.max(0, Math.min(5, state.values[id] + delta));
        if (coverEquationsSatisfied()) {
            renderCover();
            setFeedback("As quatro relações fecharam. Agora retire as presilhas sem forçar a lona.", "success");
            return;
        }
        renderCover();
        const matched = overlay?.querySelectorAll(".tension-equations li.is-matched").length ?? 0;
        setFeedback(`${matched}/4 relações conferidas. Ajuste as demais sem perder as que já fecharam.`);
    }

    // ---------------------------------------------------------------------
    // 5. RÁDIO — varredura analógica com frequência procedimental
    // ---------------------------------------------------------------------
    function radioSignalStrength() {
        const state = puzzleState.radio;
        const frequencyError = Math.abs(state.frequency - state.targetFrequency);
        const gainError = Math.abs(state.gain - state.targetGain);
        return Math.max(0, Math.round(100 - frequencyError * 18 - gainError * 15));
    }

    function renderRadio() {
        const state = puzzleState.radio;
        const strength = radioSignalStrength();
        renderShell("Sintonizar a rádio", "CASA 02 · RÁDIO COMUNITÁRIA", `
            <p class="puzzle-story-note">O rádio ainda recebe energia, mas o dial perdeu a calibração. Varra a faixa até encontrar a transmissão da comunidade. Quanto mais perto, mais forte fica o sinal.</p>
            <div class="radio-tuner radio-tuner--advanced">
                <div class="radio-tuner__screen">
                    <small>FREQUÊNCIA FM</small>
                    <strong data-radio-frequency>${state.frequency.toFixed(1)} <span>MHz</span></strong>
                    <div class="radio-signal" aria-label="Intensidade do sinal"><i data-signal-fill style="width:${strength}%"></i></div>
                    <span class="radio-signal__label" data-signal-label>${strength}% DE SINAL</span>
                    <div class="radio-gain"><span>GANHO</span><button type="button" data-action="radio-gain-down" aria-label="Diminuir ganho">−</button><strong data-radio-gain>${state.gain}</strong><button type="button" data-action="radio-gain-up" aria-label="Aumentar ganho">+</button></div>
                </div>
                <div class="radio-tuner__controls">
                    <button class="puzzle-button puzzle-button--quiet" type="button" data-action="radio-down" aria-label="Diminuir frequência">−</button>
                    <input type="range" min="88" max="108" step="0.1" value="${state.frequency}" data-frequency aria-label="Frequência da rádio">
                    <button class="puzzle-button puzzle-button--quiet" type="button" data-action="radio-up" aria-label="Aumentar frequência">+</button>
                </div>
                <button class="puzzle-button" type="button" data-action="radio-tune">Fixar transmissão</button>
            </div>
            <p class="puzzle-hint">A frequência e o ganho mudam a cada partida. Use o medidor de sinal: o canal correto está no pico da transmissão.</p>
        `, "A rádio é opcional, mas registra uma pista útil no diário mental da partida.");
    }

    function updateRadioDisplay() {
        const frequency = overlay?.querySelector("[data-radio-frequency]");
        const fill = overlay?.querySelector("[data-signal-fill]");
        const label = overlay?.querySelector("[data-signal-label]");
        const gain = overlay?.querySelector("[data-radio-gain]");
        if (!frequency || !fill || !label || !gain) return;
        const strength = radioSignalStrength();
        frequency.innerHTML = `${puzzleState.radio.frequency.toFixed(1)} <span>MHz</span>`;
        gain.textContent = String(puzzleState.radio.gain);
        fill.style.width = `${strength}%`;
        label.textContent = `${strength}% DE SINAL`;
    }

    function handleFrequencyInput(event) {
        const slider = event.target.closest("[data-frequency]");
        if (!slider || activePuzzle !== "radio") return;
        puzzleState.radio.frequency = Number(slider.value);
        updateRadioDisplay();
    }

    // ---------------------------------------------------------------------
    // 6. MONTAGEM — encaixe, fixação, combustível e partida por memória
    // ---------------------------------------------------------------------
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

        const partButtons = availableParts.map(function (part) {
            const installed = part.id === "wood"
                ? woodCount >= 3
                : state.installed[part.id];
            return `<button class="assembly-part${installed ? " is-used" : ""}${state.selected === part.id ? " is-selected" : ""}" type="button" data-part="${part.id}" ${installed ? "disabled" : ""}>
                <strong>${escapeHTML(part.title)}</strong>
                <small>${installed ? "Instalado" : `${part.detail}${part.amount > 1 ? " · 3 peças" : ""}`}</small>
            </button>`;
        }).join("");

        let starterMarkup = "";
        if (allPartsInstalled && state.fastened && state.fuelled) {
            const starter = state.starter;
            if (!starter.armed) {
                starterMarkup = `
                    <div class="starter-challenge">
                        <div><span class="assembly-tray__label">PARTIDA MANUAL · SEQUÊNCIA DE IGNIÇÃO</span><p>O cabo do arranque está travado. Memorize a sequência de seis movimentos; depois arme o motor e repita sem inverter a ordem.</p></div>
                        <div class="starter-pattern" aria-label="Sequência de partida">${starter.pattern.map(function (index) { return `<span>${CRANK_GLYPHS[index]}</span>`; }).join("")}</div>
                        <button class="puzzle-button" type="button" data-action="arm-starter">Memorizei — armar o motor</button>
                    </div>`;
            } else {
                starterMarkup = `
                    <div class="starter-challenge">
                        <div><span class="assembly-tray__label">PARTIDA MANUAL · REPITA A SEQUÊNCIA</span><p>Use os botões ou as setas do teclado. Um movimento errado faz o cabo voltar ao início, mas não apaga a montagem.</p></div>
                        <div class="starter-progress"><strong>${starter.progress}/6</strong><span class="puzzle-progress__track"><i style="width:${(starter.progress / 6) * 100}%"></i></span></div>
                        <div class="starter-controls">
                            ${CRANK_GLYPHS.map(function (glyph, index) { return `<button type="button" data-crank="${index}" aria-label="Movimento ${glyph}">${glyph}</button>`; }).join("")}
                        </div>
                    </div>`;
            }
        }

        renderShell("Montar o barco", "CAIS VELHO", `
            <p class="puzzle-story-note">Monte o casco primeiro. Depois reforce as emendas com a lona, instale o motor e encaixe a hélice. Por último, aperte as fixações, abasteça e faça o motor pegar.</p>
            <div class="assembly-layout assembly-layout--plain">
                <div class="boat-blueprint" aria-label="Esquema do barco em construção">
                    <div class="boat-blueprint__cover${state.installed.cover ? " is-installed" : ""}"><span>LONA</span></div>
                    <div class="boat-blueprint__hull">
                        ${state.installedWood.map(function (installed, index) { return `<button class="assembly-slot assembly-slot--wood${installed ? " is-installed" : ""}" type="button" data-slot="wood" data-index="${index}" aria-label="Tábua ${index + 1}: ${installed ? "instalada" : "encaixar"}">${installed ? "OK" : `TÁBUA ${index + 1}`}</button>`; }).join("")}
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
            </div>
            ${starterMarkup}
            <p class="puzzle-hint">Selecione uma peça e depois clique no encaixe correspondente. A partida final é diferente em cada tentativa.</p>
        `, "As ferramentas são reutilizáveis. A gasolina é consumida.");
    }

    function showVictory() {
        victory = true;
        objetosInterativos.assembly.complete();
        const tempoDecorrido = options?.getSpeedrunTime?.() ?? "00:00.000";
        victoryTime = String(tempoDecorrido);
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
                <p class="victory-time" aria-live="polite">Tempo: <time>${escapeHTML(victoryTime || "00:00.000")}</time></p>
                <button class="puzzle-button" type="button" data-action="restart">Jogar novamente</button>
            </div>`;
        overlay.querySelector("[data-action='restart']")?.focus();
    }

    function handleCoverRelease() {
        if (!coverEquationsSatisfied()) {
            setFeedback("A tensão mudou. Confira novamente as quatro relações antes de soltar a armação.", "warning");
            return;
        }
        completePuzzle("cover", "Lona e cordame", "As quatro presilhas foram aliviadas sem rasgar o tecido. A lona e as amarras podem reforçar o casco.");
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
            if (!Number.isInteger(index) || index < 0 || index >= 3 || state.installedWood[index]) return;
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

    function handleStarterInput(direction) {
        const state = puzzleState.assembly;
        const starter = state.starter;
        if (!starter.armed || !state.installedWood.every(Boolean) ||
            !Object.values(state.installed).every(Boolean) || !state.fastened || !state.fuelled) return;
        if (direction === starter.pattern[starter.progress]) {
            starter.progress += 1;
            if (starter.progress >= starter.pattern.length) {
                showVictory();
                return;
            }
            renderAssembly();
            setFeedback("Movimento correto. Continue mantendo o ritmo.", "success");
            return;
        }
        starter.progress = 0;
        starter.armed = false;
        renderAssembly();
        setFeedback("O cabo escapou. A montagem continua intacta; memorize a sequência novamente antes de armar.", "warning");
    }

    function handleAction(action) {
        if (action === "close") {
            close();
            return;
        }
        if (action === "wood-strike") {
            handleWoodStrike();
            return;
        }
        if (action === "engine-lift") {
            if (puzzleState.engine.gears.every(function (value) { return value === 0; })) {
                completePuzzle("engine", "Motor de popa", "O conjunto destravou e o motor saiu do suporte. Está sujo e enferrujado, mas ainda pode funcionar.");
            }
            return;
        }
        if (action === "cover-release") {
            handleCoverRelease();
            return;
        }
        if (action === "radio-down" || action === "radio-up") {
            const change = action === "radio-up" ? 0.1 : -0.1;
            puzzleState.radio.frequency = Math.max(88, Math.min(108, Math.round((puzzleState.radio.frequency + change) * 10) / 10));
            updateRadioDisplay();
            const slider = overlay?.querySelector("[data-frequency]");
            if (slider) slider.value = puzzleState.radio.frequency.toFixed(1);
            return;
        }
        if (action === "radio-gain-down" || action === "radio-gain-up") {
            const change = action === "radio-gain-up" ? 1 : -1;
            puzzleState.radio.gain = Math.max(1, Math.min(5, puzzleState.radio.gain + change));
            updateRadioDisplay();
            return;
        }
        if (action === "radio-tune") {
            const frequencyReady = Math.abs(puzzleState.radio.frequency - puzzleState.radio.targetFrequency) <= 0.2;
            const gainReady = puzzleState.radio.gain === puzzleState.radio.targetGain;
            if (!frequencyReady || !gainReady) {
                if (!frequencyReady) {
                    const direction = puzzleState.radio.frequency < puzzleState.radio.targetFrequency ? "Aumente" : "Diminua";
                    setFeedback(`${direction} um pouco a frequência. O sinal ainda está fora do pico.`, "warning");
                } else {
                    const direction = puzzleState.radio.gain < puzzleState.radio.targetGain ? "Aumente" : "Reduza";
                    setFeedback(`${direction} o ganho. A frequência está certa, mas a recepção ainda está instável.`, "warning");
                }
                return;
            }
            puzzleState.radio.solved = true;
            if (options?.onClueFound) {
                options.onClueFound("Rádio: as rodas laterais puxam a engrenagem central; a marca de referência deve ficar voltada para cima.");
            }
            renderShell("Mensagem recebida", "RÁDIO COMUNITÁRIA · TRANSMISSÃO RECUPERADA", `
                <div class="puzzle-reward">
                    <p>“A senha para passar pela passagem secreta da montanha é 67”</p>
                    <p>A mensagem parece ser uma orientação deixada por alguém da oficina antes da evacuação.</p>
                    <button class="puzzle-button" type="button" data-action="close">Fechar rádio</button>
                </div>`, "A frequência correta foi encontrada.");
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
            setFeedback("Tanque abastecido. Memorize a sequência de partida.", "success");
            return;
        }
        if (action === "arm-starter") {
            puzzleState.assembly.starter.armed = true;
            puzzleState.assembly.starter.progress = 0;
            renderAssembly();
            setFeedback("Arranque armado. Repita os seis movimentos na ordem exibida.");
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

        const gear = event.target.closest("[data-gear]");
        if (gear && activePuzzle === "engine") {
            handleGearTurn(Number(gear.dataset.gear));
            return;
        }

        const wire = event.target.closest("[data-wire]");
        if (wire && activePuzzle === "circuit") {
            handleWireTurn(Number(wire.dataset.wire));
            return;
        }

        const tension = event.target.closest("[data-tension]");
        if (tension && activePuzzle === "cover") {
            adjustCoverTension(tension.dataset.tension, Number(tension.dataset.delta));
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
            return;
        }

        const crank = event.target.closest("[data-crank]");
        if (crank && activePuzzle === "assembly") {
            handleStarterInput(Number(crank.dataset.crank));
        }
    }

    function close(clearActive = true) {
        const closedPuzzle = activePuzzle;
        if (overlay) overlay.hidden = true;
        if (clearActive) activePuzzle = null;
        if (prompt) prompt.hidden = true;
        const target = modalReturnFocus;
        if (clearActive) modalReturnFocus = null;
        if (target && target.isConnected && typeof target.focus === "function") target.focus();
        if (clearActive && closedPuzzle && options?.onPuzzleClosed) options.onPuzzleClosed(closedPuzzle);
    }

    function handleOverlayKeydown(event) {
        if (event.key === "Tab" && overlay) {
            const controls = Array.from(overlay.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"));
            if (controls.length) {
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                    return;
                }
                if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                    return;
                }
            }
        }
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            close();
            return;
        }
        if (event.repeat) return;
        if (activePuzzle === "wood" && event.code === "Space" && !event.target.closest("[data-action='close']")) {
            event.preventDefault();
            event.stopPropagation();
            handleWoodStrike();
            return;
        }
        if (activePuzzle === "assembly") {
            const directionIndex = CRANK_KEYS.indexOf(event.key);
            if (directionIndex !== -1) {
                event.preventDefault();
                event.stopPropagation();
                handleStarterInput(directionIndex);
            }
        }
    }

    function setVictoryTime(timeText) {
        victoryTime = String(timeText || "00:00.000");
        const time = overlay?.querySelector(".victory-time time");
        if (time) time.textContent = victoryTime;
    }

    function interact(player) {
        if (isModalOpen() || victory) return true;
        const location = nearbyLocation(player);
        if (!location) return false;
        modalReturnFocus = document.activeElement || null;
        if (location.id === "assembly" && solved.size < TASKS.length) {
            openPuzzle("assembly");
            return true;
        }
        openPuzzle(location.id);
        return true;
    }

    function getAccessibleObjects() {
        const scene = options?.getScene?.();
        const houseId = options?.getHouseId?.();
        const result = [];

        for (const location of LOCATIONS) {
            if (location.scene !== scene) continue;
            if (location.houseId && location.houseId !== houseId) continue;

            const object = objetosInterativos[location.id];
            const isSolved = object ? object.isSolved() : false;
            result.push({
                id: location.id,
                label: location.label,
                scene: location.scene,
                houseId: location.houseId || null,
                solved: isSolved,
                description: PUZZLE_DESCRIPTIONS[location.id] || "Mecanismo interativo da zona costeira."
            });
        }

        return result;
    }

    function interactById(id) {
        if (!LOCATIONS.some(function (location) {
            if (location.id !== id) return false;
            const scene = options?.getScene?.();
            const houseId = options?.getHouseId?.();
            return location.scene === scene && (!location.houseId || location.houseId === houseId);
        })) {
            return false;
        }

        if (isModalOpen() || victory) return false;
        const object = objetosInterativos[id];
        if (object && object.isSolved()) return false;
        if (id === "radio" && puzzleState.radio.solved) return false;
        if (id === "assembly" && victory) return false;
        modalReturnFocus = document.activeElement || null;
        openPuzzle(id);
        return true;
    }

    function reset() {
        solved.clear();
        objetosInterativos.wood.reset({ round: 0, current: createWoodRound(0) });
        objetosInterativos.engine.reset(createEngineState());
        objetosInterativos.circuit.reset(createCircuitState());
        objetosInterativos.cover.reset(createCoverState());
        objetosInterativos.radio.reset(createRadioState());
        objetosInterativos.assembly.reset({
            selected: null,
            installedWood: [false, false, false],
            installed: { engine: false, propeller: false, cover: false },
            fastened: false,
            fuelled: false,
            starter: {
                pattern: Array.from({ length: 6 }, function () { return randomInt(0, 3); }),
                armed: false,
                progress: 0
            }
        });
        victory = false;
        victoryTime = "";
        activePuzzle = null;
        modalReturnFocus = null;
        if (overlay) {
            overlay.hidden = true;
            overlay.classList.remove("puzzle-overlay--victory");
            overlay.innerHTML = "";
        }
        if (prompt) prompt.hidden = true;
        return true;
    }

    function init(config) {
        options = config;
        overlay = document.getElementById("puzzleOverlay");
        prompt = document.getElementById("interactionPrompt");
        promptText = document.getElementById("interactionPromptText");

        if (overlay && !overlay.dataset.bound) {
            overlay.onclick = handleOverlayClick;
            overlay.oninput = handleFrequencyInput;
            overlay.onkeydown = handleOverlayKeydown;
            overlay.dataset.bound = "true";
        }
    }

    window.boatPuzzles = {
        init,
        updateProximity,
        drawMarkers,
        interact,
        interactById,
        getAccessibleObjects,
        getObject(id) { return objetosInterativos[id] || null; },
        close,
        reset,
        setVictoryTime,
        isModalOpen,
        getProgress() {
            return { solved: [...solved], total: TASKS.length, victory };
        }
    };
})();
