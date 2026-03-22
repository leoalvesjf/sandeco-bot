import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import mammoth from 'mammoth';
import { addLink, getAllLinks, addKnowledge } from './dataManager.js';

const HIST_DIR = process.argv[2] || path.join(process.cwd(), 'hist');

if (!fs.existsSync(HIST_DIR)) {
  console.error(`Status: Pasta não encontrada -> ${HIST_DIR}`);
  console.log("Crie a pasta 'hist' e coloque seus arquivos lá, ou passe o caminho como argumento.");
  process.exit(1);
}

let countLinks = 0;
let countKnowledge = 0;
const existingLinks = getAllLinks();

/**
 * Processa linhas de texto, extraindo URLs e frases valiosas para o Dicionário de Conhecimento.
 * @param {string[]} lines - Array contendo o texto a ser analisado.
 */
function extractContextFromText(lines) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(urlRegex);
    if (match) {
      for (const url of match) {
        if (!existingLinks.some(l => l.url === url)) {
          const cleanUrl = url.replace(/[.,;!?)\\]+$/, '');
          const descriptionContext = trimmed.substring(0, 200) + "..."; 
          addLink(cleanUrl, "Link Massivo", descriptionContext);
          existingLinks.push({ url: cleanUrl });
          countLinks++;
        }
      }
    } else {
      // Indexando blocos de texto ou parágrafos extensos descritivos (>= 60 chars)
      // Remove carimbos do Wwebjs ou mensagens nulas se existirem
      let cleanText = trimmed;
      const msgMatch = trimmed.match(/\] [^:]+: (.+)/);
      if (msgMatch) {
         cleanText = msgMatch[1].trim();
      }

      if (cleanText.length > 60 && !cleanText.includes('<Media omitted>')) {
        const added = addKnowledge(cleanText);
        if (added) countKnowledge++;
      }
    }
  }
}

/**
 * Realiza o scanning recursivo de diretórios e extrai os conteúdos por tipo de arquivo.
 * Suporta .TXT, .MD, .ZIP e .DOCX
 * @param {string} dirPath - Caminho primário do diretório.
 */
async function scanDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await scanDirectory(fullPath);
      continue;
    }

    const ext = path.extname(fullPath).toLowerCase();
    console.log(`Analisando: ${fullPath} ...`);

    try {
      if (ext === '.txt' || ext === '.md') {
        const content = fs.readFileSync(fullPath, 'utf8');
        extractContextFromText(content.split('\n'));
      } 
      else if (ext === '.zip') {
        const zip = new AdmZip(fullPath);
        const zipEntries = zip.getEntries();
        for (const entry of zipEntries) {
          if (entry.entryName.endsWith('.txt') || entry.entryName.endsWith('.md')) {
             const text = zip.readAsText(entry);
             extractContextFromText(text.split('\n'));
          }
        }
      } 
      else if (ext === '.docx' || ext === '.doc') {
        const result = await mammoth.extractRawText({ path: fullPath });
        extractContextFromText(result.value.split('\n'));
      }
    } catch (e) {
      console.error(`Erro ao processar ${fullPath}: ${e.message}`);
    }
  }
}

async function run() {
  console.log(`\n\x1b[36m=============================================\x1b[0m`);
  console.log(`\x1b[36m  Mass Importer Inicializado. Lendo: ${HIST_DIR}\x1b[0m`);
  console.log(`\x1b[36m=============================================\x1b[0m\n`);

  await scanDirectory(HIST_DIR);

  console.log(`\n\x1b[32m✅ Varredura Concluída!\x1b[0m`);
  console.log(` - \x1b[33m${countLinks}\x1b[0m novos links foram salvos.`);
  console.log(` - \x1b[33m${countKnowledge}\x1b[0m novos índices de conhecimento foram compilados.\n`);
}

run();
