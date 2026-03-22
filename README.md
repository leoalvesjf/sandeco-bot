# 🚀 Sandeco WhatsApp Link Bot

**O fim da desorganização nos grupos de WhatsApp.**

Este projeto é um **bot experimental** projetado para organizar e centralizar os links e informações de qualquer grupo do WhatsApp — nascido da necessidade real da comunidade **Canal Sandeco AI**.

Em grupos de tecnologia e estudo, é comum que novos membros façam perguntas repetidas: *"Quais são os links? Onde está o material?"*. O Sandeco WhatsApp Bot soluciona isso engolindo o histórico do grupo, guardando os links de forma estruturada, e respondendo de modo inteligente e automático às dúvidas dos membros.

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza um stack moderno focado em automação no WhatsApp e integração com LLMs de ponta:

- **Node.js**: O núcleo da nossa aplicação, permitindo execução rápida e manipulação de arquivos.
- **whatsapp-web.js (WWebJS)**: Biblioteca robusta para orquestrar a sessão do WhatsApp como um cliente web real (sem precisar de APIs oficiais custosas).
- **Integração com LLMs (Inteligência Artificial)**:
  - Suporte à **Groq API** e **Hugging Face** para processamento ultrarrápido de inferências.
  - LLMs como o LLaMA 3 cuidam do processamento da linguagem natural e dão "carisma" às respostas do bot.
- **Clean Architecture & Command Pattern**: Estrutura de rotas organizada no diretório `src/commands` para escalar o bot facilmente.
- **Adm-Zip / Mammoth**: Bibliotecas auxiliares para ler dados brutos de arquivos anexos como `.zip`, `.docx` e `.txt`.

---

## 🧠 Como funciona a Inteligência do Bot (Fluxo `data_zip`)

Para evitar custos exponenciais analisando a internet inteira, o bot tira suas informações de uma fonte muito rica e confiável: **o próprio histórico do grupo!**

Todo o conhecimento é centralizado no arquivo vital `data/data.json`. Para populá-lo usando o seu celular, você deve seguir este fluxo inovador:

### O Fluxo de Importação via LLM

1. **Exporte do Celular:** No seu aplicativo do WhatsApp, abra as opções do grupo alvo e escolha **Exportar Conversa** (selecione "Sem Mídia" para ficar leve).
2. **Envio e Arquivo:** Envie esse arquivo exportado (geralmente via Email, Google Drive ou iCloud) para o seu computador.
3. **A Pasta data_zip:** Baixe esse arquivo `.zip` exportado e coloque-o diretamente dentro da pasta `data_zip/` na raiz deste projeto.
4. **Acione o LLM (AntiGravity / Gemini):** Abra a sua interface de IA local ou seu agente de código (como o Gemini no AntiGravity) e **peça diretamente a ele**: *"Utilize os zips exportados na pasta data_zip/ para atualizar o data/data.json com os novos links e contexto do histórico."*
5. O agente de IA interpretará seu pedido, descompactará o `.zip`, extrairá as URLs, montará a matriz de conhecimento e vai gravar tudo estruturadamente no `data.json`.
6. A partir desse momento, o seu SandecoBot (quando a aplicação for iniciada com `npm run dev`) já lerá o `data/data.json` atualizado e utilizará todo o histórico recente como base paras as respostas!

---

## 💬 Cartilha de Comandos (O `!help` Completo)

Aqui estão todos os comandos que você, os membros do grupo e os administradores autorizados podem usar no chat. Para ver essa lista no WhatsApp a qualquer momento, basta enviar `!help`.

### 🤖 Inteligência Artificial
- **`!oi <dúvida>` ou `!o <dúvida>`**
  Aciona a IA com uma personalidade carinhosa (fofa/adorável) baseada brevemente nos conhecimentos do grupo.
- **`!links <dúvida>`**
  Consulta formal e analítica à Base de Dados Sênior via IA. Extrai do `data.json` os links exatos para a sua dúvida.
- **`!ai <dúvida>`**
  Consulta direta (Raw LLM Request) para perguntar livremente ao modelo de linguagem configurado.

### 🔍 Ferramentas Utilitárias
- **`!help`**
  Lista e exibe o painel flutuante com todos os comandos disponíveis.
- **`!search <termo>`**
  Faz uma busca textual bruta pelos links catalogados na base primitiva sem o uso do motor LLM.
- **`!sharelink <id>`**
  Mostra os atributos (URL, Título, Contexto) de um Link Cadastrado através de seu identificador numérico. Se enviado sem o ID, lista todos.
- **`!clear`**
  Esvazia permanentemente a Memória Curta de interações (Short-Term-Cache) do Roteador para aquela sessão de chat.
- **`!history`**
  Mostra o consumo do espaço/iterações e quantas chaves o bot tem salvo em memória (cache) para responder à conversa atual.
- **`!info`**
  Diagnóstico Técnico - Retorna os dados locais do sandbox do WWebJS (Útil para mapear o *Group ID* necessário pro `.env`).

### ⚙️ Administração (Apenas Chats Autorizados via `PROMO_CHATS`)
- **`!addlink <título> <url> [descrição]`**
  Adiciona um link ou recurso de forma manual e direcionada na Base Geral de Links (`data.json`).
- **`!rmlink <id>`**
  Remove e trunca um nó específico (através do ID Numérico) da Base Geral Primária.

---

## 🚀 Como Iniciar

1. Instale o Node.js v18+;
2. Execute `npm install` (ou `pnpm install`) para baixar os pacotes do `package.json`.
3. Copie o arquivo `.env.example` para `.env` e preencha as variáveis de ambiente necessárias (como os tokens das provedoras LLM e os IDs de grupo).
4. Inicie tudo executando:
   ```bash
   npm run dev
   ```
5. Leia o QR Code que surgirá no terminal escaneando a seção "Aparelhos Conectados" do WhatsApp no seu telefone de bot.
6. Comece a curtir! O seu grupo já está monitorado pelo `!help` com toda a cartilha.
