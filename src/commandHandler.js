import { config } from './config.js';
import * as utils from './commands/utils.js';
import * as admin from './commands/admin.js';
import * as core from './commands/core.js';

const commands = {
  // Core AI Commands
  oi: core.handleOi,
  o: core.handleOi,
  links: core.handleLinks,
  ai: core.handleAi,

  // Admin Configs
  addlink: admin.handleAddLink,
  rmlink: admin.handleRemoveLink,

  // Utils e Ferramentas
  search: utils.handleSearch,
  sharelink: utils.handleShareLink,
  clear: utils.handleClear,
  history: utils.handleHistory,
  info: utils.handleInfo,
  groups: utils.handleGroups,
  help: utils.handleHelp
};

/**
 * Processador central que injeta Clean Architecture segregando o que é logica do Whatsapp
 * com as execuções de comandos específicos em diretórios separados.
 */
export async function dispatchCommand(message, chat, chatInfo, fromName) {
  const body = message.body.trim();
  if (!body.startsWith(config.commandPrefix)) return;

  const args = body.slice(config.commandPrefix.length).trim().split(' ');
  const commandName = args.shift().toLowerCase();

  const cmdFn = commands[commandName];
  if (cmdFn) {
    try {
      await cmdFn(message, args, chat, chatInfo, fromName);
    } catch (e) {
      console.error(`Erro Interno no comando [/${commandName}]:`, e);
      await message.reply("⚠️ Ocorreu um erro interno de servidor ao processar o seu comando. Verifique os logs.");
    }
  } else {
    await message.reply(`Comando não reconhecido pelo roteador. Digite ${config.commandPrefix}help para acessar a cartilha de comandos.`);
  }
}
