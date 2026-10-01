import { CONFIG } from "./config.js";

export function createGrid(world) {
    const cols = Math.floor(world.width / CONFIG.gridSize);
    const rows = Math.floor(world.height / CONFIG.gridSize);
    const grid = Array.from({ length: cols }, () => Array(rows).fill(0));

    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const rect = {
                x: col * CONFIG.gridSize,
                y: row * CONFIG.gridSize,
                w: CONFIG.gridSize,
                h: CONFIG.gridSize
            };

            grid[col][row] = world.obstacles.some((obstacle) =>
                rect.x < obstacle.x + obstacle.w &&
                rect.x + rect.w > obstacle.x &&
                rect.y < obstacle.y + obstacle.h &&
                rect.y + rect.h > obstacle.y
            ) ? 1 : 0;
        }
    }

    return { grid, cols, rows };
}

export function findPath(gridData, startCol, startRow, targetCol, targetRow) {
    const { grid, cols, rows } = gridData;

    startCol = clamp(startCol, 0, cols - 1);
    startRow = clamp(startRow, 0, rows - 1);
    targetCol = clamp(targetCol, 0, cols - 1);
    targetRow = clamp(targetRow, 0, rows - 1);

    if (grid[targetCol][targetRow] === 1) {
        const neighbors = [
            [0, -1], [0, 1], [-1, 0], [1, 0],
            [-1, -1], [1, -1], [-1, 1], [1, 1]
        ];

        const alternative = neighbors.find(([dc, dr]) => {
            const c = targetCol + dc;
            const r = targetRow + dr;
            return c >= 0 && c < cols && r >= 0 && r < rows && grid[c][r] === 0;
        });

        if (!alternative) return [];
        targetCol += alternative[0];
        targetRow += alternative[1];
    }

    const openSet = [];
    const closed = new Set();

    const key = (c, r) => `${c},${r}`;

    const start = {
        c: startCol,
        r: startRow,
        g: 0,
        h: Math.hypot(startCol - targetCol, startRow - targetRow),
        parent: null
    };
    start.f = start.g + start.h;
    openSet.push(start);

    const directions = [
        [0, -1], [0, 1], [-1, 0], [1, 0],
        [-1, -1], [1, -1], [-1, 1], [1, 1]
    ];

    while (openSet.length) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        if (current.c === targetCol && current.r === targetRow) {
            const path = [];
            let cursor = current;

            while (cursor) {
                path.push({
                    x: cursor.c * CONFIG.gridSize + CONFIG.gridSize / 2,
                    y: cursor.r * CONFIG.gridSize + CONFIG.gridSize / 2
                });
                cursor = cursor.parent;
            }

            return path.reverse();
        }

        closed.add(key(current.c, current.r));

        for (const [dc, dr] of directions) {
            const c = current.c + dc;
            const r = current.r + dr;

            if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
            if (grid[c][r] === 1 || closed.has(key(c, r))) continue;

            const cost = dc !== 0 && dr !== 0 ? 1.414 : 1;
            const g = current.g + cost;
            const existing = openSet.find((node) => node.c === c && node.r === r);

            if (!existing) {
                const h = Math.hypot(c - targetCol, r - targetRow);
                openSet.push({ c, r, g, h, f: g + h, parent: current });
            } else if (g < existing.g) {
                existing.g = g;
                existing.f = g + existing.h;
                existing.parent = current;
            }
        }
    }

    return [];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
