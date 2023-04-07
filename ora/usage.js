const { CompletionModel, Completion } = require('./ora');

async function run() {
  // Create a new CompletionModel
  await CompletionModel.create();

  // Create a new completion for the model
  const prompt = "What is the meaning of life?";
  const conversationId = null;
  const completion = await Completion.create(CompletionModel, prompt, conversationId);

  // Log the completion response
  console.log(completion.completion.choices[0].text);
}

run();
