const axios = require('axios');

const headers = {
    'authority': 'www.t3nsor.tech',
    'accept': '*/*',
    'accept-language': 'en,fr-FR;q=0.9,fr;q=0.8,es-ES;q=0.7,es;q=0.6,en-US;q=0.5,am;q=0.4,de;q=0.3',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'origin': 'https://www.t3nsor.tech',
    'pragma': 'no-cache',
    'referer': 'https://www.t3nsor.tech/',
};

class Choices {
    constructor(choice) {
        this.text = choice.text;
        this.content = Buffer.from(this.text);
        this.index = choice.index;
        this.logprobs = choice.logprobs;
        this.finish_reason = choice.finish_reason;
    }

    toString() {
        return `<__main__.APIResponse.Completion.Choices(\n    text           = ${this.content},\n    index          = ${this.index},\n    logprobs       = ${this.logprobs},\n    finish_reason  = ${this.finish_reason})object at 0x1337>`;
    }
}

class Usage {
    constructor(usage_dict) {
        this.prompt_tokens = usage_dict.prompt_chars;
        this.completion_tokens = usage_dict.completion_chars;
        this.total_tokens = usage_dict.total_chars;
    }

    toString() {
        return `<__main__.APIResponse.Usage(\n    prompt_tokens      = ${this.prompt_tokens},\n    completion_tokens  = ${this.completion_tokens},\n    total_tokens       = ${this.total_tokens})object at 0x1337>`;
    }
}

class T3nsorResponse {
  constructor(response_dict) {
    this.response_dict = response_dict;
    this.id = response_dict.id;
    this.object = response_dict.object;
    this.created = response_dict.created;
    this.model = response_dict.model;
    this.completion = new this.Completion(response_dict.choices);
    this.usage = new this.Usage(response_dict.usage);
  }

  json() {
    return this.response_dict;
  }

  Completion = class {
    constructor(choices) {
      this.choices = choices.map(choice => new Choices(choice));
    }
  }

  Usage = class {
    constructor(usage_dict) {
      this.prompt_tokens = usage_dict.prompt_chars;
      this.completion_tokens = usage_dict.completion_chars;
      this.total_tokens = usage_dict.total_chars;
    }

    toString() {
      return `<__main__.APIResponse.Usage(
        prompt_tokens      = ${this.prompt_tokens},
        completion_tokens  = ${this.completion_tokens},
        total_tokens       = ${this.total_tokens})object at 0x1337>`;
    }
  }

  toString() {
    return `<T3nsorResponse object at 0x1337>`;
  }
}

const Completion = {
    model: {
        'model': {
            'id': 'gpt-3.5-turbo',
            'name': 'Default (GPT-3.5)'
        }
    },

    create: async (prompt = 'hello world', messages = []) => {
        const response = await axios.post('https://www.t3nsor.tech/api/chat', {
            ...Completion.model,
            'messages': messages,
            'key': '',
            'prompt': prompt
        }, {
            headers: headers
        });

        return new T3nsorResponse({
            'id': `cmpl-1337-${Math.floor(Date.now() / 1000)}`,
            'object': 'text_completion',
            'created': Math.floor(Date.now() / 1000),
            'model': Completion.model,
            'choices': [{
                'text': response.data,
                'index': 0,
                'logprobs': null,
                'finish_reason': 'stop'
            }],
            'usage': {
                'prompt_chars': prompt.length,
                'completion_chars': response.data.length,
                'total_chars': prompt.length + response.data.length
            }
        });
    }
};

const StreamCompletion = {
    model: {
        'model': {
            'id': 'gpt-3.5-turbo',
            'name': 'Default (GPT-3.5)'
        }
    },

    create: async function* (prompt = 'hello world', messages = []) {
        const response = await axios.post('https://www.t3nsor.tech/api/chat', { ...StreamCompletion.model, 'messages': messages, 'key': '', 'prompt': prompt }, { headers: headers, responseType: 'stream' });
      for await (const chunk of response.data) {
        yield new T3nsorResponse({
            'id': `cmpl-1337-${Math.floor(Date.now() / 1000)}`,
            'object': 'text_completion',
            'created': Math.floor(Date.now() / 1000),
            'model': StreamCompletion.model,
            'choices': [{
                'text': chunk.toString(),
                'index': 0,
                'logprobs': null,
                'finish_reason': 'stop'
            }],
            'usage': {
                'prompt_chars': prompt.length,
                'completion_chars': chunk.length,
                'total_chars': prompt.length + chunk.length
            }
        });
    }
}
};

async function createT3nsorResponse(prompt, messages, stream = false) {
  if (stream) {
    return StreamCompletion.create(prompt, messages);
  } else {
    return Completion.create(prompt, messages);
  }
}

module.exports = { 
  createT3nsorResponse
};
