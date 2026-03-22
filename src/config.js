import 'dotenv/config';

export const config = {
  // Provider Selection
  aiProvider: process.env.AI_PROVIDER || 'ollama',

  // API Keys
  groqApiKey: process.env.GROQ_API_KEY || '',
  openRouterKey: process.env.OPEN_ROUTER || '',
  hfToken: process.env.HF_TOKEN || '',
  anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  resendApiKey: process.env.RESEND_API_KEY || '',

  // Models
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  hfModel: process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct',
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',

  // Ollama fallback config
  ollamaUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2',

  // General config
  botName: process.env.BOT_NAME || 'LeoBot',
  targetGroupName: process.env.TARGET_GROUP_NAME || 'Canal Sandeco AI',
  allowedChats: process.env.ALLOWED_CHATS?.split(',').filter(Boolean) || [],
  promoChats: process.env.PROMO_CHATS?.split(',').filter(Boolean) || [],
  temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
  maxTokens: parseInt(process.env.MAX_TOKENS) || 500,
  commandPrefix: process.env.COMMAND_PREFIX || '!',
};

export function isChatAllowed(chatId, chatName) {
  return config.allowedChats.includes(chatId);
}

export function isPromoChat(chatId) {
  return config.promoChats.includes(chatId);
}

export function getChatInfo(chat) {
  const isGroup = chat.id && chat.id.server === 'g.us';
  return {
    id: chat.id ? chat.id._serialized : null,
    name: chat.name,
    isGroup,
    participant: isGroup ? null : (chat.id ? chat.id.user : null),
  };
}
