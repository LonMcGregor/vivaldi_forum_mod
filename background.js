const NOTIFICATION_SET = new Set();

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if ( message === 'options pls' ) {
        chrome.runtime.openOptionsPage();
    }

    if(message.verb === "Notify"){
        const notifyText = message.content;
        console.log("Checking Notification", notifyText);
        /* Race */
        if(NOTIFICATION_SET.has(notifyText)){
            console.warn("Duplicate Notification", notifyText);
            sendResponse({verb: "DontSendNotify"});
        } else {
            console.log("New Notification", notifyText);
            NOTIFICATION_SET.add(notifyText);
            sendResponse({verb: "SendNotify"});
            setTimeout(() => {
                console.log("Cleared", notifyText);
                NOTIFICATION_SET.delete(notifyText);
            }, 5000);
        }
        /* Race end */
    }
});
