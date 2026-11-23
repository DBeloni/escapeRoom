import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const htmlFiles = [];
const errors = [];

function walk(folder) {
    for (const name of readdirSync(folder)) {
        if (name === ".git" || name === "node_modules") continue;
        const file = join(folder, name);
        if (statSync(file).isDirectory()) walk(file);
        else if (extname(file).toLowerCase() === ".html") htmlFiles.push(file);
    }
}

function checkFile(file) {
    const html = readFileSync(file, "utf8");
    const label = file.replaceAll("\\", "/");

    if (!/^\s*<!doctype\s+html\s*>/i.test(html)) errors.push(`${label}: falta <!doctype html>.`);
    if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) errors.push(`${label}: a tag html precisa declarar lang.`);
    if (!/<title>\s*[^<]+\s*<\/title>/i.test(html)) errors.push(`${label}: falta um título de página.`);
    if (!/<main\b/i.test(html)) errors.push(`${label}: falta a região principal <main>.`);

    const ids = new Set();
    for (const match of html.matchAll(/\bid=["']([^"']+)["']/gi)) {
        const id = match[1];
        if (ids.has(id)) errors.push(`${label}: id duplicado "${id}".`);
        ids.add(id);
    }

    for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
        if (!/\balt\s*=\s*["'][^"']*["']/i.test(match[1])) {
            errors.push(`${label}: imagem sem atributo alt.`);
        }
    }

    for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
        const attrs = match[1];
        const body = match[2].replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
        const hasLabel = /\baria-label\s*=\s*["'][^"']+/.test(attrs) || /\btitle\s*=\s*["'][^"']+/.test(attrs) || body.length > 0;
        if (!hasLabel) errors.push(`${label}: botão sem nome acessível.`);
    }
}

walk(".");
for (const file of htmlFiles) checkFile(file);

if (htmlFiles.length < 12) errors.push(`Esperadas pelo menos 12 páginas HTML incluindo o jogo; encontradas ${htmlFiles.length}.`);

if (errors.length) {
    console.error(`Auditoria estrutural HTML: ${errors.length} problema(s).`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
} else {
    console.log(`Auditoria estrutural OK: ${htmlFiles.length} arquivos HTML, IDs sem duplicação e requisitos básicos encontrados.`);
}
