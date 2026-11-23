import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const files = [];
function walk(folder) {
    for (const name of readdirSync(folder)) {
        if (name === ".git" || name === "node_modules") continue;
        const file = join(folder, name);
        if (statSync(file).isDirectory()) walk(file);
        else if (extname(file).toLowerCase() === ".html") files.push(file);
    }
}

walk(".");
let errors = 0;
for (const file of files) {
    try {
        const response = await fetch("https://validator.w3.org/nu/?out=json", {
            method: "POST",
            headers: { "Content-Type": "text/html; charset=utf-8" },
            body: readFileSync(file, "utf8")
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        const messages = result.messages || [];
        const problems = messages.filter((message) => message.type === "error" || message.type === "info" && message.subType === "warning");
        if (problems.length) {
            errors += problems.length;
            console.error(`\n${file}: ${problems.length} aviso(s)/erro(s)`);
            for (const problem of problems) console.error(`- ${problem.message}`);
        } else {
            console.log(`OK ${file}`);
        }
    } catch (error) {
        console.error(`Não foi possível validar ${file}: ${error.message}`);
        process.exitCode = 2;
        break;
    }
}

if (process.exitCode !== 2 && errors) process.exitCode = 1;
if (!errors && process.exitCode !== 2) console.log(`Nu HTML Checker: ${files.length} páginas sem erros ou avisos selecionados.`);
