const { createT3nsorResponse } = require('./t3nsor');

async function main() {
    const response = await createT3nsorResponse('Hello, world!');
  console.log(response.json().choices[0].text);
}

main();
