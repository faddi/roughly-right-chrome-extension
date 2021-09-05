function sleep(ms = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


function createNetworkListener() {
    console.log('Creating listener');
    chrome.webRequest.onCompleted.addListener(
        async details => {
            console.log(details);
            const { method, tabId } = details;
            await sleep();
            chrome.tabs.sendMessage(tabId, { summarizeRoughly: true });
        },
        {
            urls: [
                'https://roughlyright.com/employees/*/hours*',
            ],
        }
    );
}

createNetworkListener();