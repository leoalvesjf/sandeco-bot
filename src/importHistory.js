import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { addLink, getAllLinks, addKnowledge } from './dataManager.js';

const targetFile = process.argv[2];

if (!targetFile) {
  console.error("Uso: node src/importHistory.js <caminho-para-o-arquivo.zip ou .txt>");
  process.exit(1);
}

if (!fs.existsSync(targetFile)) {
  console.error(`Erro: Arquivo não encontrado: ${targetFile}`);
  process.exit(1);
}

const ext = path.extname(targetFile).toLowerCase();
let chatText = '';

if (ext === '.zip') {
  console.log(`Extraindo zip: ${targetFile} ...`);
  const zip = new AdmZip(targetFile);
  const zipEntries = zip.getEntries();
  const chatEntry = zipEntries.find(entry => entry.entryName.endsWith('.txt'));
  
  if (!chatEntry) {
    console.error("Erro: Nenhum arquivo .txt encontrado dentro do ZIP.");
    process.exit(1);
  }
  chatText = zip.readAsText(chatEntry);
} else if (ext === '.txt') {
  chatText = fs.readFileSync(targetFile, 'utf8');
} else {
  console.error("Erro: Formato de arquivo não suportado. Use .zip ou .txt");
  process.exit(1);
}

console.log("Processando mensagens do histórico...");

const lines = chatText.split('\n');
const urlRegex = /(https?:\/\/[^\s]+)/g;

let countLinks = 0;
let countKnowledge = 0;
const existingLinks = getAllLinks();

for (const line of lines) {
  const match = line.match(urlRegex);
  if (match) {
    for (const url of match) {
      // Avoid adding duplicate URLs
      const isDuplicate = existingLinks.some(l => l.url === url);
      if (!isDuplicate) {
        // Limpar URL caso termine com pontuação
        const cleanUrl = url.replace(/[.,;!?)\\]+$/, '');
        // Usamos a linha inteira como contexto/descrição para a IA poder referenciar
        const descriptionContext = line.substring(0, 150) + "..."; 
        
        addLink(cleanUrl, "Link do Histórico", descriptionContext);
        
        // Adiciona localmente para a próxima checagem no mesmo script não duplicar
        existingLinks.push({ url: cleanUrl });
        countLinks++;
      }
    }
  } else {
    // If it's a message without URL but rich in text, index it!
    const msgMatch = line.match(/\] [^:]+: (.+)/);
    if (msgMatch) {
      const content = msgMatch[1].trim();
      if (content.length > 50 && !content.includes('<Media omitted>')) {
        const added = addKnowledge(content);
        if (added) countKnowledge++;
      }
    }
  }
}

console.log(`Importação concluída! Foram encontrados:`);
console.log(` - ${countLinks} novos Links indexados no AI Context.`);
console.log(` - ${countKnowledge} novos Tópicos/Frases indexadas no Knowledge Dictionary.`);
