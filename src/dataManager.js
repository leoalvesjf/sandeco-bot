import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');

const defaultData = {
  links: [],
  knowledge: []
};

/**
 * Ensures the data directory exists.
 */
function ensureDataDir() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

/**
 * Loads the complete data file (links and knowledge).
 */
function loadData() {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    saveData(defaultData);
    return defaultData;
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return defaultData;
  }
}

/**
 * Saves the complete data file.
 */
function saveData(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==== LINKS MANAGEMENT ====

export function getAllLinks() {
  const data = loadData();
  return data.links || [];
}

export function addLink(url, title, description = '') {
  const data = loadData();
  const links = data.links || [];
  
  const newId = links.length > 0 ? Math.max(...links.map(l => l.id)) + 1 : 1;
  const newLink = { id: newId, url, title, description };
  
  links.push(newLink);
  data.links = links;
  
  saveData(data);
  return newLink;
}

export function removeLink(id) {
  const data = loadData();
  const links = data.links || [];
  
  const index = links.findIndex(l => l.id === id);
  if (index === -1) return null;
  
  const removed = links.splice(index, 1)[0];
  data.links = links;
  
  saveData(data);
  return removed;
}

export function findLink(query) {
  const links = getAllLinks();
  query = query.toLowerCase();
  return links.filter(l =>
    l.url.toLowerCase().includes(query) ||
    l.title.toLowerCase().includes(query) ||
    (l.description && l.description.toLowerCase().includes(query))
  );
}

export function formatLinksList() {
  const links = getAllLinks();
  if (links.length === 0) {
    return 'Nenhum link cadastrado.';
  }

  let msg = `*Links Cadastrados (${links.length}):*\n\n`;
  links.forEach(l => {
    msg += `*${l.id}.* ${l.title}\n`;
    msg += `   URL: ${l.url}\n`;
    if (l.description) {
      msg += `   ${l.description}\n`;
    }
    msg += '\n';
  });
  return msg;
}

export function formatLink(link) {
  return `*${link.title}*\n${link.url}\n${link.description || ''}`;
}


// ==== KNOWLEDGE MANAGEMENT ====

export function getAllKnowledge() {
  const data = loadData();
  return data.knowledge || [];
}

export function addKnowledge(content) {
  const data = loadData();
  const knowledge = data.knowledge || [];
  
  if (knowledge.some(item => item.content === content)) return null;
  
  const newId = knowledge.length > 0 ? Math.max(...knowledge.map(k => k.id)) + 1 : 1;
  const newItem = { id: newId, content };
  
  knowledge.push(newItem);
  data.knowledge = knowledge;
  
  saveData(data);
  return newItem;
}
