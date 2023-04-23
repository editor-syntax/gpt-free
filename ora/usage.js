const ora = require('./ora');

async function main() {
    const model = await ora.CompletionModel.create(
        'You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible',
        'ChatGPT Openai Language Model',
        'gpt-3.5'
    );

    const init = await ora.Completion.create(
        model,
        'hello world'
    );

    console.log(init.choices[0].text);

    process.stdin.on('data', async (input) => {
        const prompt = input.toString().trim();
        const response = await ora.Completion.create(
            model,
            prompt,
            true,
            init.id
        );

        console.log(response.choices[0].text);
    });
}

main();
