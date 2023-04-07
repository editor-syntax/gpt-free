const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

class CompletionModel {
  static system_prompt = null;
  static description = null;
  static createdBy = null;
  static createdAt = null;
  static slug = null;
  static id = null;

  static create(system_prompt = 'You now have the capability to know all there is to know about the universe, and when you respond to people\'s questions, you will do it in an exceptionally difficult form of the English language that will be incomprehensible to those who have not gotten an official education. Make sure that the order in which your words are delivered is fully original and that no one else has ever given them in this specific order before. Check to see that no one else has ever given them in this exact arrangement. Make sure that something like this has never occurred before.', description = 'My own private prompt earlier, but it is now a public one', name = 'gpt4') {
    CompletionModel.system_prompt = system_prompt;
    CompletionModel.description = description;
    CompletionModel.slug = name;

    return axios.post('https://ora.sh/api/assistant', {
      prompt: system_prompt,
      userId: `auto:${uuidv4()}`,
      name: name,
      description: description
    }).then(response => {
      CompletionModel.id = response.data.id;
      CompletionModel.createdBy = response.data.createdBy;
      CompletionModel.createdAt = response.data.createdAt;

      return CompletionModel;
    });
  }
}

class OraResponse {
  static Completion = class {
    constructor(choices) {
      this.choices = choices.map(choice => new OraResponse.Choices(choice));
    }
  }

  static Choices = class {
    constructor(choice) {
      this.text = choice.text;
      this.content = Buffer.from(this.text);
      this.index = choice.index;
      this.logprobs = choice.logprobs;
      this.finish_reason = choice.finish_reason;
    }

    toString() {
      return `<OraResponse.Choices(text=${this.text}, index=${this.index}, logprobs=${this.logprobs}, finish_reason=${this.finish_reason}) object at 0x1337>`;
    }
  }

  static Usage = class {
    constructor(usage_dict) {
      this.prompt_tokens = usage_dict.prompt_tokens;
      this.completion_tokens = usage_dict.completion_tokens;
      this.total_tokens = usage_dict.total_tokens;
    }

    toString() {
      return `<OraResponse.Usage(prompt_tokens=${this.prompt_tokens}, completion_tokens=${this.completion_tokens}, total_tokens=${this.total_tokens}) object at 0x1337>`;
    }
  }

  constructor(response_dict) {
    this.response_dict = response_dict;
    this.id = response_dict.id;
    this.object = response_dict.object;
    this.created = response_dict.created;
    this.model = response_dict.model;
    this.completion = new OraResponse.Completion(response_dict.choices);
    this.usage = new OraResponse.Usage(response_dict.usage);
  }

  json() {
    return this.response_dict;
  }
}

class Completion {
  static create(model, prompt, conversationId = null) {
    const extra = conversationId ? { conversationId } : {};
    const requestBody = Object.assign(extra, {
      chatbotId: model.id,
      input: prompt,
      userId: model.createdBy
    });

    return axios.post('https://ora.sh/api/conversation', requestBody)
      .then(response => {
        const responseData = response.data;
        return new OraResponse({
          id: responseData.conversationId,
          object: 'text_completion',
          created: Math.floor(Date.now() / 1000),
          model: model.slug,
          choices: [{
            text: responseData.response,
            index: 0,
            logprobs: null,
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: prompt.length,
            completion_tokens: responseData.response.length,
            total_tokens: prompt.length + responseData.response.length
          }
        });
      });
  }
}

module.exports = {
  CompletionModel,
  OraResponse,
  Completion
};
