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
 * The alert box changed
 * Alert Types:
 *  * alert-warning - connection was lost (don't notify)
 *  * alert-success - "options saved", "marked as unread" (don't notify)
 *  * alert-info - "new reply", "upvote" (notify)
 * @param {MutationRecord[]} mutations
 */
function alertChanged(mutations){
    mutations.forEach(mutation => {
        if(mutation.type === "childList" && mutation.addedNodes.length > 0){
            console.log("Alert!", mutation);
            const alertBox = mutation.addedNodes[0];
            if(alertBox.classList.contains("alert-success") || alertBox.classList.contains("alert-warning")){
                console.log("Pointless alert", mutation);
                return;
            }
            let notifyText = alertBox.querySelector("p").innerText;
            notifyText = notifyText.trim();
            if(!notifyText){
                console.warn("Couldn't read alert", mutation, notifyText);
                return;
            }
            chrome.runtime.sendMessage({verb: "Notify", content: notifyText}, response => {
                if(response.verb==="SendNotify"){
                    console.log("Alert Notification!", notifyText);
                    /*const notification = */new Notification("Vivaldi Forum", {
                        body: notifyText,
                        icon: "https://forum.vivaldi.net/plugins/nodebb-theme-vivaldi/images/favicon.png"
                    });
                    /*
                    // maybe disable - all it does is open a new tab in the default browser. somehow? it doesn't note this in the console... something is broke
                    notification.onclick = event => {
                        console.log("Clicked notification", event);
                        alertBox.click();
                    };*/
                }
            });
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
        const alertbox = document.querySelector("body > div.alert-window");
        ALERT_OBSERVER.observe(alertbox, OBSERVER_CONFIG);
    }
});
