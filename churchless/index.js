const { ChatCompletion } = require('./churchless');

async function main() {
  const prompt = 'What is the meaning of life?';
  const chatBotMessage = await ChatCompletion.create(prompt);
  console.log(chatBotMessage);
}

main();
