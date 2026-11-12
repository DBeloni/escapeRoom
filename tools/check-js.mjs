import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "js";
const files = [];

function walk(dir) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            walk(full);
        } else if (entry.endsWith(".js") || entry.endsWith(".mjs")) {
            files.push(full);
        }
    }
}

walk(root);

for (const file of files) {
    execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
}

console.log(`JS syntax OK: ${files.length} arquivos ativos.`);
