import fs from 'node:fs/promises';

// 1. Coloque o endereço (caminho local ou URL) do arquivo HTML aqui
const ENDERECO_HTML = 'https://127.0.0.1/html/finaisgit .html';
// Exemplo com link externo: const ENDERECO_HTML = 'https://example.com';

// 2. Função que valida a estrutura das tags HTML5
function validarTagsHTML5(html) {
  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  const stack = [];

  // Remove DOCTYPE, comentários e conteúdos de <script>/<style> para evitar falsos positivos
  const htmlLimpo = html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  const tagRegex = /<\/?([a-zA-Z0-9-]+)(?:\s[^>]*)?>/g;
  let match;

  while ((match = tagRegex.exec(htmlLimpo)) !== null) {
    const fullTag = match;
    const tagName = match.toLowerCase();

    if (voidTags.has(tagName) || fullTag.endsWith('/>')) {
      continue;
    }

    if (fullTag.startsWith('</')) {
      if (stack.length === 0) {
        return { valido: false, erro: `Tag de fechamento inesperada: </${tagName}>` };
      }
      const ultimaAberta = stack.pop();
      if (ultimaAberta !== tagName) {
        return {
          valido: false,
          erro: `Esperava fechar </${ultimaAberta}>, mas encontrou </${tagName}>`
        };
      }
    } else {
      stack.push(tagName);
    }
  }

  if (stack.length > 0) {
    return {
      valido: false,
      erro: `Tags abertas que não foram fechadas: ${stack.map(t => `<${t}>`).join(', ')}`
    };
  }

  return { valido: true, mensagem: 'Nenhum erro de estrutura encontrado!' };
}

// 3. Função que lê o arquivo local ou baixa da URL e executa a validação
async function verificarHTML(endereco) {
  try {
    console.log(`🔍 Verificando: ${endereco}...`);
    let codigoHTML = '';

    // Verifica se é uma URL web ou um arquivo local no computador
    if (endereco.startsWith('http://') || endereco.startsWith('https://')) {
      const resposta = await fetch(endereco);
      if (!resposta.ok) {
        throw new Error(`Erro HTTP ao acessar a URL: ${resposta.status}`);
      }
      codigoHTML = await resposta.text();
    } else {
      codigoHTML = await fs.readFile(endereco, 'utf-8');
    }

    const resultado = validarTagsHTML5(codigoHTML);

    if (resultado.valido) {
      console.log('✅ SUCESSO:', resultado.mensagem);
    } else {
      console.error('❌ ERRO NO HTML:', resultado.erro);
    }
  } catch (erro) {
    console.error('⚠️ Falha ao ler ou validar o HTML:', erro.message);
  }
}

// Executa o script
await verificarHTML(ENDERECO_HTML);
