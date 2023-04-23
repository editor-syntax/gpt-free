const axios = require("axios");
const queryString = require("query-string");
const readline = require("readline");

const headers = {
  authority: "openai.a2hosted.com",
  accept: "text/event-stream",
  "accept-language": "en-US,en;q=0.9,id;q=0.8,ja;q=0.7",
  "cache-control": "no-cache",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.0.0",
};

function createQueryParam(conversation) {
  const encodedConversation = JSON.stringify(conversation);
  return queryString.stringify({ q: encodedConversation });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let conversationHistory = [];

function askQuestion() {
  rl.question("Enter your message: ", (userInput) => {
    if (userInput === "quit") {
      console.log("Goodbye!");
      return rl.close();
    }

    conversationHistory.push({ role: "user", content: userInput });

    const queryParam = createQueryParam(conversationHistory);
    const url = `https://openai.a2hosted.com/chat?${queryParam}`;

    axios
      .get(url, { headers: headers, responseType: "stream" })
      .then((response) => {
        let assistantOutput = "";

        response.data.on("data", (chunk) => {
          const message = chunk.toString("utf-8");
          const msgMatch = /"msg":"(.*?)"/.exec(message);
          const numMatch = /\[DONE\] (\d+)/.exec(message);

          if (msgMatch) {
            assistantOutput += " " + msgMatch[1].trim().replace(/\n/g, " ");
          }

          if (numMatch) {
            console.log("Assistant:", assistantOutput.trim());
            console.log("Remaining Completion:", numMatch[1]);
            conversationHistory.push({ role: "assistant", content: assistantOutput.trim() });
            askQuestion();
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

askQuestion();
