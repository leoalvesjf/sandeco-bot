import { addLink, removeLink, formatLink } from '../dataManager.js';
import { isPromoChat } from '../config.js';

export async function handleAddLink(message, args, chat, chatInfo) {
  if (!isPromoChat(chatInfo.id)) {
    return message.reply('⚠️ Access Denied: Nível de privilégio insuficiente neste chat para CRUD de links.');
  }
  if (args.length < 2) {
    return message.reply('Sintaxe Exigida: !addlink <título_compacto> <url_valida> [descrição_longa_opcional]');
  }
  const title = args.shift();
  const url = args.shift();
  const description = args.join(' ');
  const newLink = addLink(url, title, description);
  await message.reply(`✅ Resource alocado com Sucesso na Base Geral de Links!\n${formatLink(newLink)}`);
}

export async function handleRemoveLink(message, args, chat, chatInfo) {
  if (!isPromoChat(chatInfo.id)) {
    return message.reply('⚠️ Access Denied: Nível de privilégio insuficiente neste chat para drop de nodes.');
  }
  if (args.length === 0) return message.reply('Sintaxe Exigida: !rmlink <id_numerico>');
  
  const linkId = parseInt(args[0]);
  const removed = removeLink(linkId);
  if (removed) {
    await message.reply(`Node [${removed.title}] extirpado com sucesso da Base Primária!`);
  } else {
    await message.reply(`Referência cruzada de ID [${linkId}] não mapeada no cluster.`);
  }
}
