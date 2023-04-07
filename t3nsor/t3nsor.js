const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class T3nsorResponse {
  static Completion = class {
    static Choices = class {
      constructor(choice) {
        this.text = choice.text;
        this.content = Buffer.from(this.text);
        this.index = choice.index;
        this.logprobs = choice.logprobs;
        this.finish_reason = choice.finish_reason;
      }

      toString() {
        return `<Choices(text=${this.text}, index=${this.index}, logprobs=${this.logprobs}, finish_reason=${this.finish_reason})>`;
      }
    }

    constructor(choices) {
      this.choices = choices.map(choice => new T3nsorResponse.Completion.Choices(choice));
    }
  }

  static Usage = class {
    constructor(usage_dict) {
      this.prompt_tokens = usage_dict.prompt_chars;
      this.completion_tokens = usage_dict.completion_chars;
      this.total_tokens = usage_dict.total_chars;
    }

    toString() {
      return `<Usage(prompt_tokens=${this.prompt_tokens}, completion_tokens=${this.completion_tokens}, total_tokens=${this.total_tokens})>`;
    }
  }

  constructor(response_dict) {
    this.response_dict = response_dict;
    this.id = response_dict.id;
    this.object = response_dict.object;
    this.created = response_dict.created;
    this.model = response_dict.model;
    this.completion = new T3nsorResponse.Completion(response_dict.choices);
    this.usage = new T3nsorResponse.Usage(response_dict.usage);
  }

  toJSON() {
    return this.response_dict;
  }

  toString() {
    return `<T3nsorResponse(id=${this.id}, object=${this.object}, created=${this.created}, model=${JSON.stringify(this.model)}, completion=${this.completion}, usage=${this.usage})>`;
  }
}

class Completion {
  static model = {
    model: {
      id: 'gpt-3.5-turbo',
      name: 'Default (GPT-3.5)'
    }
  }

  create(prompt = 'hello world', messages = []) {
    return axios.post('https://www.t3nsor.tech/api/chat', {
      ...Completion.model,
      messages,
      key: '',
      prompt
    })
      .then(response => new T3nsorResponse({
        id: `cmpl-${uuidv4()}`,
        object: 'text_completion',
        created: Math.floor(Date.now() / 1000),
        model: Completion.model,
        choices: [{
          text: response.data,
          index: 0,
          logprobs: null,
          finish_reason: 'stop'
        }],
        usage: {
          prompt_chars: prompt.length,
          completion_chars: response.data.length,
          total_chars: prompt.length + response.data.length
        }
      }));
  }
}

class StreamCompletion {
  static model = {
    model: {
      id: 'gpt-3.5-turbo',
      name: 'Default (GPT-3.5)'
    }
  }

  static async* create(prompt = 'hello world', messages = []) {
    const response = await axios.post('https://www.t3nsor.tech/api/chat', {
      ...StreamCompletion.model,
      messages,
      key: '',
      prompt
    }, {
      responseType: 'stream'
    });

    let chunks = [];

    for await (const chunk of response.data) {
      chunks.push(chunk);

      if (chunk.endsWith('\n')) {
        const completionText = Buffer.concat(chunks).toString();
        chunks = [];

        yield new T3nsorResponse({
          id:       `cmpl-${uuidv4()}`,
      object: 'text_completion',
      created: Math.floor(Date.now() / 1000),
      model: StreamCompletion.model,
      choices: [{
        text: completionText,
        index: 0,
        logprobs: null,
        finish_reason: 'stop'
      }],
      usage: {
        prompt_chars: prompt.length,
        completion_chars: completionText.length,
        total_chars: prompt.length + completionText.length
      }
    });
  }
}
}
}

module.exports = {
  T3nsorResponse,
  Completion,
  StreamCompletion
};
