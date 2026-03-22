import { findLink, getAllLinks, formatLink, formatLinksList } from '../dataManager.js';
import { clearHistory, getHistorySize } from '../aiService.js';

export async function handleSearch(message, args) {
  if (args.length === 0) {
    await message.reply('Uso Necessário: !search <termo>\nExemplo: !search curso');
    return;
  }
  const query = args.join(' ');
  const found = findLink(query);
  if (found.length === 0) {
    await message.reply(`Zero matches brutos para "${query}".`);
    return;
  }
  let response = `Matches exatos na Base (${found.length} registros):\n\n`;
  found.forEach(l => { response += `${formatLink(l)}\n\n`; });
  await message.reply(response);
}

export async function handleShareLink(message, args) {
  const links = getAllLinks();
  if (args.length === 0) {
    if (links.length === 0) return message.reply('Base global em branco.');
    return message.reply(formatLinksList());
  }
  const shareId = parseInt(args[0]);
  const linkToShare = links.find(l => l.id === shareId);
  if (linkToShare) {
    await message.reply(formatLink(linkToShare));
  } else {
    await message.reply(`Link / ID [${shareId}] não encontrado nos diretórios.`);
  }
}

export async function handleClear(message, args, chat, chatInfo) {
  clearHistory(chatInfo.id);
  await message.reply('Buffer de curto-prazo da IA truncado permanentemente nesta sessão.');
}

export async function handleHistory(message, args, chat, chatInfo) {
  const size = getHistorySize(chatInfo.id);
  await message.reply(`A memória de Curto Prazo (Short-Term-Cache) retém ${size} iteracoes no pool desta rota.`);
}

export async function handleInfo(message, args, chat, chatInfo, fromName) {
  const infoText = `*Diagnostic Ping*\nNome: ${chatInfo.name}\nGrupo ID: ${chatInfo.id}\nGrupo Validador: ${chatInfo.isGroup ? 'True' : 'False'}\nTarget Sender: ${fromName}`;
  await message.reply(infoText);
}

export async function handleHelp(message, args, chat, chatInfo) {
  const helpText = `*🤖 Córtex SandecoBot v2.0*\n\n*Inteligência Artificial:*\n!oi <dúvida>ou !o <dúvida> - Inteligência Afetiva (Fofa/Adorável)\n!links <dúvida> - Consulta à Base de Conhecimento e Links via IA\n!ai <dúvida> - Consulta Direta e Formal ao LLM\n\n*Ferramentas Utilitárias:*\n!search <termo> - Busca Textual exata na Base Primitiva\n!sharelink <id> - Mostra Atributos de um Link Cadastrado\n!clear - Esvazia a Memória de Curto Prazo do Chat\n!history - Mostra o Tamanho da Memória de Curto Prazo\n!info - Diagnóstico Local e Dados do SandBox\n!help - Exibe este painel de comandos\n\n*Admin (Grupos Autorizados):*\n!addlink <título> <url> [descrição] - Adiciona Link na Base\n!rmlink <id> - Remove Link da Base`;
  await message.reply(helpText);
}
