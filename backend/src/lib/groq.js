const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function chatCompletion(messages, { model = "llama-3.3-70b-versatile", temperature = 0.7, maxTokens = 1024 } = {}) {
  const completion = await groq.chat.completions.create({
    messages,
    model,
    temperature,
    max_tokens: maxTokens,
  });
  return completion.choices[0].message.content;
}

module.exports = { groq, chatCompletion };
