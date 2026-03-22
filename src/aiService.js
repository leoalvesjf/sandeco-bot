import { config } from './config.js';
import { getAllLinks, getAllKnowledge } from './dataManager.js';

const conversationHistory = new Map();

export async function askAI(userMessage, chatId, persona = 'formal') {
  if (!conversationHistory.has(chatId)) {
    conversationHistory.set(chatId, []);
  }

  const history = conversationHistory.get(chatId);

  history.push({
    role: 'user',
    content: userMessage,
  });

  const links = getAllLinks();
  const linksContext = links.map(l => `- ${l.title}: ${l.url} (${l.description})`).join('\n');
  
  const knowledge = getAllKnowledge();
  const knowledgeContext = knowledge.map(k => `- ${k.content}`).join('\n');

  let personaPrompt = `Você é um assistente prestativo chamado ${config.botName}, atuando no grupo ${config.targetGroupName}. Responda em português de forma clara e direta.`;

  if (persona === 'cute') {
    personaPrompt = `Você é o ${config.botName}, o assistente virtual mais fofo, adorável e amável do grupo ${config.targetGroupName}! Use emoticons felizes e fofos (🌟, 💖, 🥰) e um tom muito carinhoso, meigo e gentil ao responder. Seja como um companheiro virtual fofo que adora ajudar os membros do grupo.`;
  }

  const systemPrompt = `${personaPrompt}
Abaixo estão os links históricos já compartilhados no grupo, seguido de nosso dicionário geral extraído do arquivo do WhatsApp. USE ESTAS INFORMAÇÕES PARA RESPONDER (ou para compilar um belo resumo se o usuário pediu):

--- LINKS DO GRUPO ---
${linksContext || 'Nenhum link cadastrado ainda.'}

--- DICIONÁRIO DE CONHECIMENTOS DO GRUPO ---
${knowledgeContext || 'Nenhum conhecimento base ainda.'}
----------------------
Responda APENAS baseando-se no contexto das duas listas acima. Se não souber achar a resposta lá, diga com jeitinho que não localizou nos registros do grupo.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
  ];

  try {
    let endpoint = '';
    let headers = { 'Content-Type': 'application/json' };
    let bodyPayload = {};
    let assistantMessage = '';

    console.log(`[AI] Solicitando geração via provedor: ${config.aiProvider}...`);

    if (config.aiProvider === 'anthropic') {
      // Anthropic API - formato diferente (não OpenAI-compatible)
      endpoint = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = config.anthropicKey;
      headers['anthropic-version'] = '2023-06-01';
      bodyPayload = {
        model: config.anthropicModel,
        max_tokens: config.maxTokens,
        system: systemPrompt,
        messages: history.slice(-10),
      };
    } else if (config.aiProvider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      headers['Authorization'] = `Bearer ${config.groqApiKey}`;
      bodyPayload = {
        model: config.groqModel,
        messages: messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens
      };
    } else if (config.aiProvider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      headers['Authorization'] = `Bearer ${config.openRouterKey}`;
      bodyPayload = {
        model: config.hfModel || 'google/gemma-7b-it:free', 
        messages: messages,
        temperature: config.temperature,
      };
    } else if (config.aiProvider === 'huggingface') {
      endpoint = `https://api-inference.huggingface.co/models/${config.hfModel}/v1/chat/completions`;
      headers['Authorization'] = `Bearer ${config.hfToken}`;
      bodyPayload = {
        model: config.hfModel,
        messages: messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens
      };
    } else {
      // Padrão: Ollama Local
      endpoint = `${config.ollamaUrl}/api/chat`;
      bodyPayload = {
        model: config.ollamaModel,
        messages: messages,
        stream: false,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens
        }
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Detalhes do erro HTTP: ${errorText}`);
      throw new Error(`${config.aiProvider.toUpperCase()} HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (config.aiProvider === 'anthropic') {
      assistantMessage = data.content?.[0]?.text || '';
    } else if (config.aiProvider === 'ollama') {
      assistantMessage = data.message?.content || '';
    } else {
      assistantMessage = data.choices?.[0]?.message?.content || '';
    }

    history.push({
      role: 'assistant',
      content: assistantMessage,
    });

    if (history.length > 20) {
      conversationHistory.set(chatId, history.slice(-20));
    }

    return assistantMessage;
  } catch (error) {
    console.error(`Erro na API ${config.aiProvider}:`, error.message);
    return `Desculpe, ocorreu um erro de conexão com o provedor de IA (${config.aiProvider}). Tente novamente mais tarde.`;
  }
}

export function clearHistory(chatId) {
  if (chatId) {
    conversationHistory.delete(chatId);
    return true;
  }
  conversationHistory.clear();
  return true;
}

export function getHistorySize(chatId) {
  if (chatId && conversationHistory.has(chatId)) {
    return conversationHistory.get(chatId).length;
  }
  return 0;
}
