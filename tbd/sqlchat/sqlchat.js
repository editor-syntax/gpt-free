const axios = require('axios');

const headers = {
    'authority': 'www.sqlchat.ai',
    'accept': '*/*',
    'accept-language': 'en,fr-FR;q=0.9,fr;q=0.8,es-ES;q=0.7,es;q=0.6,en-US;q=0.5,am;q=0.4,de;q=0.3',
    'content-type': 'text/plain;charset=UTF-8',
    'origin': 'https://www.sqlchat.ai',
    'referer': 'https://www.sqlchat.ai/',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
};

class SqlchatResponse {
    // Completion Class
    static Completion = class Completion {
        constructor(choices) {
            this.choices = choices.map(choice => new SqlchatResponse.Completion.Choices(choice));
        }
    }

    // Choices Class
    static Choices = class Choices {
        constructor(choice) {
            this.text = choice.text;
            this.content = Buffer.from(this.text);
            this.index = choice.index;
            this.logprobs = choice.logprobs;
            this.finish_reason = choice.finish_reason;
        }
    }

    // Usage Class
    static Usage = class Usage {
        constructor(usageDict) {
            this.prompt_tokens = usageDict.prompt_chars;
            this.completion_tokens = usageDict.completion_chars;
            this.total_tokens = usageDict.total_chars;
        }
    }

    constructor(responseDict) {
        this.responseDict = responseDict;
        this.id = responseDict.id;
        this.object = responseDict.object;
        this.created = responseDict.created;
        this.model = responseDict.model;
        this.completion = new SqlchatResponse.Completion(responseDict.choices);
        this.usage = new SqlchatResponse.Usage(responseDict.usage);
    }

    json() {
        return this.responseDict;
    }
}

class Completion {
    static async create(prompt = 'hello world', messages = []) {
        const response = await axios.post('https://www.sqlchat.ai/api/chat', {
            messages: messages,
            openAIApiConfig: { key: '', endpoint: '' }
        }, { headers: headers });

        return new SqlchatResponse({
            id: `cmpl-1337-${Math.floor(Date.now() / 1000)}`,
            object: 'text_completion',
            created: Math.floor(Date.now() / 1000),
            model: 'gpt-3.5-turbo',
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
        });
    }
}

class StreamCompletion {
    // Not implemented - this code uses async/await instead of streams
    static create(prompt = 'hello world', messages = []) { }
}

module.exports = {
    SqlchatResponse,
    Completion,
    StreamCompletion
};
