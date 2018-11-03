const RECENT_NOTIFICATION_SET = new Set();
const RECENT_TIME_MS = 5000;
/**
 * Check if a new notification is in the set and decide wether to send it or not
 * @param {*} message with verb and content
 * @param {*} sendResponse function
 */
function onNativeNotificationMessage(message, sendResponse){
    const notifyText = message.content;
    console.log("Checking Notification", notifyText);
    /* Race */
    if(RECENT_NOTIFICATION_SET.has(notifyText)){
        console.warn("Duplicate Notification", notifyText);
        sendResponse({verb: "DontSendNotify"});
    } else {
        console.log("New Notification", notifyText);
        RECENT_NOTIFICATION_SET.add(notifyText);
        sendResponse({verb: "SendNotify", content: notifyText});
        setTimeout(() => {
            console.log("Cleared", notifyText);
            RECENT_NOTIFICATION_SET.delete(notifyText);
        }, RECENT_TIME_MS);
    }
    /* Race end */
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if ( message === 'options pls' ) {
        chrome.runtime.openOptionsPage();
    }

    if(message.verb === "Notify"){
        onNativeNotificationMessage(message, sendResponse);
    }
});
