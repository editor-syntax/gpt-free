const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const chalk = require("chalk");

const createCompletion = async (
    prompt,
    {
        page = 1,
        count = 10,
        safeSearch = "Moderate",
        onShoppingpage = false,
        mkt = "",
        responseFilter = "WebPages,Translations,TimeZone,Computation,RelatedSearches",
        domain = "youchat",
        queryTraceId = null,
        chat = [],
        includelinks = false,
        detailed = false,
        debug = false
    } = {}
) => {
    const client = axios.create({
        baseURL: "https://you.com",
        headers: {
            "authority": "you.com",
            "accept": "text/event-stream",
            "accept-language": "en,fr-FR;q=0.9,fr;q=0.8,es-ES;q=0.7,es;q=0.6,en-US;q=0.5,am;q=0.4,de;q=0.3",
            "cache-control": "no-cache",
            "referer": "https://you.com/search?q=who+are+you&tbm=youchat",
            "sec-ch-ua": '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "cookie": `safesearch_guest=Moderate; uuid_guest=${uuidv4()}`,
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
        },
    });

    const response = await client.get("/api/streamingSearch", {
        params: {
            q: prompt,
            page: page,
            count: count,
            safeSearch: safeSearch,
            onShoppingPage: onShoppingpage,
            mkt: mkt,
            responseFilter: responseFilter,
            domain: domain,
            queryTraceId: queryTraceId === null ? uuidv4() : queryTraceId,
            chat: JSON.stringify(chat), // {"question":"","answer":" '"}
        },
    });

    if (debug) {
        console.clear();
        console.log(chalk.green("[DEBUGGER]:"));
        console.log(response.data);
    }

    const youChatSerpResults = response.data.match(/youChatSerpResults\ndata: (.*)\n\nevent/)[1];
    const thirdPartySearchResults = response.data.match(/thirdPartySearchResults\ndata: (.*)\n\nevent/)[1];
    const text = response.data.split('}]}\n\nevent: youChatToken\ndata: {"youChatToken": "')[1].replace(/"}\n\nevent: youChatToken\ndata: {"youChatToken": "|event: done\ndata: I'm Mr. Meeseeks. Look at me.\n\n/g, '');

    const extra = {
        youChatSerpResults: JSON.parse(youChatSerpResults),
    };

    return {
        response: text,
        links: includelinks ? JSON.parse(thirdPartySearchResults).search.third_party_search_results : null,
        extra: detailed ? extra : null,
    };
};

module.exports = {
    createCompletion,
};
