import { readFileSync } from "node:fs";

const pages = ["index.html", ...[
    "cenarios", "como-jogar", "contato", "desenvolvedores", "enigmas",
    "finais", "galeria", "historia", "itens", "tecnologia"
].map((name) => `pages/${name}.html`)];
const errors = [];

for (const file of pages) {
    const html = readFileSync(file, "utf8");
    if (!/<a\b[^>]*class=["'][^"']*skip-link/i.test(html)) errors.push(`${file}: falta link para pular ao conteúdo.`);
    if (!/<main\b[^>]*id=["']conteudo["']/i.test(html)) errors.push(`${file}: a região principal precisa ter id="conteudo".`);
    if (!/<nav\b[^>]*aria-label=/i.test(html)) errors.push(`${file}: navegação principal sem nome acessível.`);
}

const game = readFileSync("html/mapaPrincipal.html", "utf8");
const requiredGameMarkup = [
    [/id=["']gameCanvas["'][^>]*aria-label=/i, "Canvas sem nome acessível"],
    [/id=["']gameCanvas["'][^>]*aria-describedby=["']gameMapDescription["']/i, "Canvas sem descrição textual"],
    [/id=["']accessibleGuideToggle["'][^>]*aria-controls=["']accessibleGuide["']/i, "Botão do guia acessível sem relação com o painel"],
    [/id=["']accessibleGuide["'][^>]*aria-labelledby=/i, "Painel do guia sem título acessível"],
    [/id=["']diaryToggle["'][^>]*aria-expanded=/i, "Diário sem estado expandido"],
    [/id=["']inventoryItems["'][^>]*aria-live=/i, "Inventário sem anúncio de atualizações"],
    [/id=["']puzzleOverlay["']/, "Área de puzzles ausente"],
    [/id=["']itemInspection["'][^>]*role=["']dialog["']/, "Diálogo de inspeção de itens ausente"]
];
for (const [pattern, message] of requiredGameMarkup) {
    if (!pattern.test(game)) errors.push(`html/mapaPrincipal.html: ${message}.`);
}

if (errors.length) {
    console.error(`Auditoria de acessibilidade: ${errors.length} problema(s).`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
} else {
    console.log("Auditoria básica de acessibilidade OK: navegação por teclado, landmarks, descrições e controles textuais presentes.");
}
