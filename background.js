function sleep(ms = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

let loaded = false;
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && !loaded) {
        loaded = true;

        chrome.webRequest.onCompleted.addListener(
            async details => {
                console.log(details);
                const { method } = details;
                await sleep();
                chrome.tabs.sendMessage(tabId, { summarizeRoughly: true });
            },
            {
                tabId,
                urls: [
                    'https://roughlyright.com/employees/*/hours*',
                    'https://roughlyright.com/employees/*/hours/',
                ],
            }
        );
    }
});
