import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const errors = [];
const activeJs = [];
const htmlFiles = [];
const cssFiles = [];

function walk(folder) {
    for (const name of readdirSync(folder)) {
        if (name === ".git" || name === "node_modules") continue;
        const file = join(folder, name);
        if (statSync(file).isDirectory()) walk(file);
        else {
            const extension = extname(file).toLowerCase();
            if (extension === ".js") activeJs.push(file);
            if (extension === ".html") htmlFiles.push(file);
            if (extension === ".css") cssFiles.push(file);
        }
    }
}

walk(".");
const jsText = activeJs.map((file) => readFileSync(file, "utf8")).join("\n");
const allHtml = htmlFiles.map((file) => readFileSync(file, "utf8")).join("\n");
const allCss = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");

if (/\baddEventListener\s*\(/.test(jsText)) errors.push("Foi encontrado addEventListener; use as propriedades de evento exigidas no trabalho.");
if (/\bdocument\s*\.\s*createElement\s*\(/.test(jsText)) errors.push("Foi encontrado document.createElement; use innerHTML/template string.");
if (!/const\s+itensNoMundo\s*=\s*\[/.test(jsText)) errors.push("Vetor de objetos coletáveis não encontrado.");
if (!/ITM_005/.test(jsText) || !/capacidadeInventario\s*=\s*5/.test(jsText)) errors.push("O inventário de cinco itens não foi identificado.");
if (!/getAccessibleObjects/.test(jsText) || !/interactById/.test(jsText)) errors.push("API de navegação textual dos mecanismos ausente.");
if (!/reset\s*\(/.test(jsText)) errors.push("Método de reinicialização dos mecanismos ausente.");
if (!/<table\b/i.test(allHtml) || !/<th\b/i.test(allHtml)) errors.push("Tabela semântica com cabeçalhos não encontrada.");
if (!/:root\s*\{/.test(allCss)) errors.push("Variáveis CSS em :root não encontradas.");
if (!/@media\b/.test(allCss)) errors.push("Media queries não encontradas.");
if (!/(display\s*:\s*grid|display\s*:\s*flex)/i.test(allCss)) errors.push("Grid/Flexbox não encontrado.");
if (htmlFiles.length < 12) errors.push(`Contagem HTML abaixo do mínimo esperado: ${htmlFiles.length}.`);

if (errors.length) {
    console.error(`Auditoria das regras do projeto: ${errors.length} problema(s).`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
} else {
    console.log(`Regras do enunciado OK: ${htmlFiles.length} HTML, ${cssFiles.length} CSS e ${activeJs.length} JavaScript analisados.`);
}
