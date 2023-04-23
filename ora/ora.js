const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class CompletionModel {
    static async create(system_prompt, description, name) {
        const instance = new CompletionModel();
        instance.system_prompt = system_prompt;
        instance.description = description;
        instance.slug = name;

        const headers = {
            'Origin': 'https://ora.sh',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15',
            'Referer': 'https://ora.sh/',
            'Host': 'ora.sh',
        };

        try {
            const response = await axios.post('https://ora.sh/api/assistant', {
                prompt: system_prompt,
                userId: `auto:${uuidv4()}`,
                name: name,
                description: description
            }, { headers });

            instance.id = response.data.id;
            instance.createdBy = response.data.createdBy;
            instance.createdAt = response.data.createdAt;
            instance.modelName = 'gpt-3.5-turbo';

            return instance;
        } catch (error) {
            console.log(error.response.data);
        }
    }
}

class OraResponse {
    constructor(response_dict) {
        this.response_dict = response_dict;
        this.id = response_dict.id;
        this.object = response_dict.object;
        this.created = response_dict.created;
        this.model = response_dict.model;
        this.choices = response_dict.choices.map((choice) => ({
            text: choice.text,
            content: choice.content,
            index: choice.index,
            logprobs: choice.logprobs,
            finish_reason: choice.finish_reason,
        }));
        this.usage = {
            prompt_tokens: response_dict.usage.prompt_tokens,
            completion_tokens: response_dict.usage.completion_tokens,
            total_tokens: response_dict.usage.total_tokens,
        };
    }

    json() {
        return this.response_dict;
    }
}

class Completion {
    static async create(model, prompt, includeHistory = true, conversationId = null) {
        const extra = conversationId ? { conversationId } : {};

        try {
            const response = await axios.post('https://ora.sh/api/conversation', Object.assign({}, extra, {
                chatbotId: model.id,
                input: prompt,
                userId: model.createdBy,
                model: model.modelName,
                provider: 'OPEN_AI',
                includeHistory: includeHistory
            }), {
                headers: {
                    'host': 'ora.sh',
                    'authorization': `Bearer AY0${Math.floor(1111 + Math.random() * 8889)}`,
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                    'origin': 'https://ora.sh',
                    'referer': 'https://ora.sh/chat/',
                }
            });

            return new OraResponse({
                id: response.data.conversationId,
                object: 'text_completion',
                created: Math.floor(Date.now() / 1000),
                model: model.slug,
                choices: [
                    {
                        text: response.data.response,
                        index: 0,
                        logprobs: null,
                        finish_reason: 'stop'
                    }
                ],
                usage: {
                    prompt_tokens: prompt.length,
                    completion_tokens: response.data.response.length,
                    total_tokens: prompt.length + response.data.response.length
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = {
    CompletionModel,
    OraResponse,
    Completion,
};
