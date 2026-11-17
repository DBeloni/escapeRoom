import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const projectRoot = process.cwd();
const htmlFiles = [];
const cssFiles = [];
const jsFiles = [];
const errors = [];

function findFiles(folder) {
    for (const name of readdirSync(folder)) {
        const file = join(folder, name);

        if (statSync(file).isDirectory()) {
            findFiles(file);
            continue;
        }

        const extension = extname(file).toLowerCase();

        if (extension === ".html") htmlFiles.push(file);
        if (extension === ".css") cssFiles.push(file);
        if (extension === ".js") jsFiles.push(file);
    }
}

function isExternalPath(path) {
    return (
        !path ||
        path.startsWith("#") ||
        path.startsWith("//") ||
        /^[a-z][a-z0-9+.-]*:/i.test(path)
    );
}

function checkPath(path, baseFolder, sourceFile) {
    const cleanPath = decodeURIComponent(path.split(/[?#]/)[0]);

    if (isExternalPath(path) || !cleanPath) return;

    const target = cleanPath.startsWith("/")
        ? resolve(projectRoot, `.${cleanPath}`)
        : resolve(baseFolder, cleanPath);

    if (!existsSync(target)) {
        errors.push(`${sourceFile}: arquivo não encontrado: ${path}`);
    }
}

function checkHtml(file) {
    const html = readFileSync(file, "utf8");
    const tags = html.match(/<(?:a|area|audio|embed|iframe|img|input|link|script|source|track|video)\b[^>]*>/gi) || [];

    for (const tag of tags) {
        const attributes = tag.matchAll(/\b(?:href|src|poster)\s*=\s*["']([^"']*)["']/gi);

        for (const attribute of attributes) {
            checkPath(attribute[1], dirname(file), file);
        }
    }
}

function checkCss(file) {
    const css = readFileSync(file, "utf8");
    const urls = css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi);

    for (const match of urls) {
        checkPath(match[1].trim(), dirname(file), file);
    }
}

function checkGameImagePaths() {
    const gamePage = join(projectRoot, "html", "mapaPrincipal.html");

    for (const file of jsFiles) {
        const javascript = readFileSync(file, "utf8");
        const paths = javascript.matchAll(/["']((?:\.\.\/|\.\/|assets\/)[^"']+\.(?:png|jpe?g|webp|gif|svg|mp3|wav|ogg))["']/gi);

        for (const match of paths) {
            // Os caminhos das imagens do jogo são resolvidos a partir de mapaPrincipal.html.
            checkPath(match[1], dirname(gamePage), file);
        }
    }
}

findFiles(projectRoot);

for (const file of htmlFiles) checkHtml(file);
for (const file of cssFiles) checkCss(file);
checkGameImagePaths();

if (errors.length > 0) {
    console.error(`Foram encontrados ${errors.length} caminho(s) quebrado(s):\n`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
} else {
    console.log("Caminhos locais OK.");
    console.log(`${htmlFiles.length} HTML, ${cssFiles.length} CSS e ${jsFiles.length} JavaScript verificados.`);
}
