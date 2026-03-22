import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { config, isChatAllowed, getChatInfo } from './config.js';
import { dispatchCommand } from './commandHandler.js';

/**
 * Ponto de Entrada da Arquitetura Limpa do WhatsApp Bot.
 * Aplicando padrões SOLID para estruturar os listeners e delegar lógica ao Dispatcher.
 */

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: '.wwebjs_auth'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.1.json'
  }
});

client.on('qr', (qr) => {
  console.log('\n=== ACESSO: ESCANEIE O QR CODE ===\n');
  qrcode.generate(qr, { small: true });
  console.log('\n=================================\n');
});

client.on('authenticated', () => {
  console.log('✅ WwebJS Client Authenticated Locally!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Falha Crítica de Autenticação Automática:', msg);
});

client.on('ready', () => {
  console.log(`\n🤖 Node [${config.botName}] ONLINE na engine: ${config.aiProvider.toUpperCase()}`);
});

client.on('disconnected', (reason) => {
  console.log('🔌 Sub-Processo Desconectado. Reason Code:', reason);
});

client.on('change_state', (state) => {
  console.log('🔄 Mutation State Client:', state);
});

client.on('message', async (message) => {
  try {
    const chat = await message.getChat();
    const contact = await message.getContact();
    const chatInfo = getChatInfo(chat);

    const fromName = contact.pushname || contact.name || 'Terminal_User';

    // Enforcement Estrito do Allowance Map (.ENV)
    if (!isChatAllowed(chatInfo.id, chatInfo.name)) {
      return; 
    }

    const preview = message.body.length > 50 ? message.body.substring(0, 50) + '...' : message.body;
    console.log(`\n[MSG IN] Input from ${fromName} (${chatInfo.name}): ${preview}`);

    // Clean Architecture Route Dispatcher
    await dispatchCommand(message, chat, chatInfo, fromName);

  } catch (error) {
    if (error.message && error.message.includes('Execution context was destroyed')) return;
    console.error('🚨 Erro Fatal no Ciclo de Mensagem (Core Layer):', error);
  }
});

console.log('=================================');
console.log(` Córtex ${config.botName} - WhatsApp Architecture Refactored`);
console.log(' Inicializando Node Engine (Standby)...');
console.log('=================================');

client.initialize().catch(e => {
  console.error('Fail to Hook Sandbox Auth:', e);
});

process.on('SIGINT', async () => {
  console.log('\n[SIGINT] Sinais Interrompidos. Desacoplando Client Node...');
  await client.destroy();
  process.exit(0);
});
