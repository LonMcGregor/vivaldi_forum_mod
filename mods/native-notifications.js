"use strict";

/**
 * Check notification permission
 */
function checkPermission(){
    if(Notification.permission !== "granted"){
        Notification.requestPermission();
    }
}

const ALERT_OBSERVER = new MutationObserver(alertChanged);
const OBSERVER_CONFIG = {childList: true};

/**
 * Handle the response from the background script indicating
 *  * SendNotify: a notification is to be sent
 *  * DontSendNotify: nothing is to be sent
 * @param {*} response with verb and content
 */
function responseFromBackground(response) {
    if(response.verb==="SendNotify"){
        console.log("Alert Notification!", response.notifyText);
        new Notification("Vivaldi Forum", {
            body: response.content,
            icon: "https://forum.vivaldi.net/plugins/nodebb-theme-vivaldi/images/favicon.png"
        });
    }
}

/**
 * Do something with a mutation
 * Alert Types from class:
 *  * alert-danger - bad permissions
 *  * alert-warning - connection was lost (don't notify)
 *  * alert-success - "options saved", "marked as unread" (don't notify)
 *  * alert-info - "new reply", "upvote" (notify)
 * @param {MutationRecord} mutation
 */
function handleMutation(mutation){
    console.log("Alert!", mutation);
    const alertBox = mutation.addedNodes[0];
    if(alertBox.classList.contains("alert-success") || alertBox.classList.contains("alert-warning") || alertBox.classList.contains("alert-danger")){
        console.log("Pointless alert", mutation);
        return;
    }
    let notifyText = alertBox.querySelector("p").innerText;
    notifyText = notifyText.trim();
    if(!notifyText){
        console.warn("Couldn't read alert", mutation, notifyText);
        return;
    }
    chrome.runtime.sendMessage({verb: "Notify", content: notifyText}, responseFromBackground);
}

/**
 * The alert box changed
 * Only do something if an alert node was added
 * @param {MutationRecord[]} mutations
 */
function alertChanged(mutations){
    console.log("Mutations hapenned.", mutations);
    mutations.forEach(mutation => {
        if(mutation.type === "childList" && mutation.addedNodes.length > 0){
            handleMutation(mutation);
        }
    });
}

/**
 * Init the mod
 */
chrome.storage.sync.get({
    nativeNotifications: ""
}, settings => {
    if(settings.nativeNotifications==="1"){
        checkPermission();
        const alertbox = document.querySelector(".alert-window");
        ALERT_OBSERVER.observe(alertbox, OBSERVER_CONFIG);
    }
});
