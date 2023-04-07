# Free GPT-3.5 Text Completion Models and APIs

This repository provides free and easy-to-use text completion models and APIs based on GPT-3.5, allowing developers to generate human-like text responses for their applications.

## Available APIs

| API | Description | Provider | 
| --- | --- | --- | 
| `ora.sh` | Provides text completion models with adjustable levels of creativity and specificity | ora.sh | 
| `t3nsor.tech` | Provides text completion models with a focus on natural-sounding responses and personalized conversations | t3nsor.tech | 

## Usage

Each API offers a class for creating a new text completion instance and a class for processing the completion response.

### `ora.sh`

#### `CompletionModel`

Represents a text completion model and provides a method to create a new model on the ora.sh API platform.

##### `create(system_prompt: string, description: string, name: string): Promise<CompletionModel>`

Creates a new text completion model on the ora.sh API platform with the given `system_prompt`, `description`, and `name`. Returns a `Promise` that resolves to the created `CompletionModel`.

#### `OraResponse`

Represents a response from the ora.sh API and provides a structured representation of the completion response.

##### `Completion`

Represents the completion response returned by the ora.sh API, including a list of possible choices.

##### `Choices`

Represents a single completion choice, including the generated text, index, log probabilities, and finish reason.

##### `Usage`

Represents the usage statistics for a completion response, including the number of prompt tokens, completion tokens, and total tokens.

#### `Completion`

Provides a method for generating text completions using an existing `CompletionModel` on the ora.sh API platform.

##### `create(model: CompletionModel, prompt: string, conversationId: string | null): Promise<OraResponse>`

Generates a text completion response for the given `prompt` using the provided `CompletionModel` on the ora.sh API platform. If `conversationId` is provided, the response will be generated within the context of the specified conversation. Returns a `Promise` that resolves to an `OraResponse` object.

### `t3nsor.tech`

#### `Completion`

Provides a method for generating text completions using the t3nsor.tech API.

##### `create(prompt: string, messages: Array<Object>): Promise<T3nsorResponse>`

Generates a text completion response for the given `prompt` and `messages` using the t3nsor.tech API. Returns a `Promise` that resolves to a `T3nsorResponse` object.

#### `T3nsorResponse`

Represents a response from the t3nsor.tech API and provides a structured representation of the completion response.

##### `Completion`

Represents the completion response returned by the t3nsor.tech API, including a list of possible choices.

##### `Choices`

Represents a single completion choice, including the generated text, index, log probabilities, and finish reason.

##### `Usage`

Represents the usage statistics for a completion response, including the number of prompt characters, completion characters, and total characters.

#### `StreamCompletion`

Provides a method for generating text completions using the t3nsor.tech API with streaming support.

##### `create(prompt: string, messages: Array<Object>): AsyncIterable<T3nsorResponse>`

Generates a text completion response for the given `prompt` and `messages` using the t3nsor.tech API with streaming support. Returns an async iterable that yields `T3nsorResponse` objects.
