import { askAI } from '../aiService.js';

/**
 * Encapsulamento local para chamadas de IA.
 */
export async function sendAIResponse(message, chat, chatInfo, question, persona = 'formal') {  
  await chat.sendStateTyping();
  try {
    const response = await askAI(question, chatInfo.id, persona);
    await message.reply(response);
  } catch (error) {
    console.error('Erro na Resolução da AI:', error);
    await message.reply('Desculpe, ocorreu um erro de payload ao contatar nossos agentes cognitivos.');
  } finally {
    await chat.clearState();
  }
}

export async function handleOi(message, args, chat, chatInfo, fromName) {
  const question = args.length === 0 
    ? "Faça uma saudação muito fofa, adorável e supercarinhosa, resumindo um pouco do que temos na base sem muitos detalhes." 
    : args.join(' ');
  
  console.log(`[ROUTE: Core] !oi processado para: "${question}"`);
  await sendAIResponse(message, chat, chatInfo, question, 'cute');
}

export async function handleLinks(message, args, chat, chatInfo, fromName) {
  const question = args.length === 0 
    ? "Crie um mini compêndio formal descrevendo os principais links e informações valiosas que temos catalogados na base." 
    : args.join(' ');

  console.log(`[ROUTE: Core] !links processado para: "${question}"`);
  await sendAIResponse(message, chat, chatInfo, question, 'formal');
}

export async function handleAi(message, args, chat, chatInfo, fromName) {
  if (args.length === 0) {
    await message.reply('Forneça perguntas reais. Parâmetros vazios negados.\nUso: !ai <pergunta>\nEx: !ai Quem foi Alan Turing?');
    return;
  }
  const question = args.join(' ');
  console.log(`[ROUTE: Core] !ai Bypass: "${question}"`);
  await sendAIResponse(message, chat, chatInfo, question, 'formal');
}
