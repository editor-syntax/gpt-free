const axios = require('axios');

class CompletionModel {
  static async create(prompt) {
    const requestBody = {
      messages: [{ role: 'user', content: prompt }],
    };
    const config = {
      headers: { 'Content-Type': 'application/json' },
    };

    const res = await axios.post('https://free.churchless.tech/v1/chat/completions', requestBody, config);
    return res.data;
  }
}

class ChatCompletion {
  static async create(prompt) {
    const completion = await CompletionModel.create(prompt);
    const chatBotMessage = completion.choices[0]?.message?.content || 'No response found';
    return chatBotMessage;
  }
}

module.exports = {
  ChatCompletion,
};
