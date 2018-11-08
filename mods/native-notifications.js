"use strict";

const MAX_NOTIFICATION_LENGTH = 80;

/**
 * Check notification permission
 */
function checkPermission(){
    if(Notification.permission !== "granted"){
        Notification.requestPermission();
    }
}

/**
 * Handle the response from the background script indicating
 *  * SendNotify: a notification is to be sent
 *  * DontSendNotify: nothing is to be sent
 * @param {*} response with verb and content
 */
function responseFromBackground(response) {
    if(response.verb==="SendNotify"){
        console.log("Alert Notification!", response.notifyText);
        new Notification(response.title ? response.title : chrome.i18n.getMessage("notificationTitle"), {
            body: response.content,
            icon: response.image ? response.image : "https://forum.vivaldi.net/plugins/nodebb-theme-vivaldi/images/favicon.png"
        });
    }
}

/**
 * We got a new notification, translate it to a native one
 * @param {NodeBB Notification} msgObj
 */
function notification(msgObj){
    const body = msgObj.bodyShort.substring(2, msgObj.bodyShort.length-2).split(", ");
    const action = body[0].split(":")[1];
    if(!NOTIFICATIONS){
        console.error("Got notification before notifications.json");
        return;
    }
    if(!NOTIFICATIONS[action]){
        console.error("Failed to get action template for ", action);
        return;
    }
    let template = NOTIFICATIONS[action];
    template = template.replace(/%1/g, body[1]);
    template = template.replace(/%2/g, body[2]);
    template = template.replace(/%3/g, body[3]);
    template = template.replace(/<\/?\w+>/g, "");
    if(template.length > MAX_NOTIFICATION_LENGTH){
        template = template.substring(0, MAX_NOTIFICATION_LENGTH) + "...";
    }
    chrome.runtime.sendMessage({verb: "Notify", content: template}, responseFromBackground);
}

/**
 * We got a new chat message, make a notification for it
 * @param {NodeBB Chat} msgObj
 */
function chat(msgObj){
    const user = msgObj.message.fromUser;
    let message = msgObj.message.cleanedContent;
    if(message.length > MAX_NOTIFICATION_LENGTH){
        message = message.substring(0, MAX_NOTIFICATION_LENGTH) + "...";
    }
    const title = chrome.i18n.getMessage("notificationChatTitle").replace(/%1/g, user.username);
    chrome.runtime.sendMessage({verb: "Notify", title: title, content: message, image: msgObj.pic}, responseFromBackground);
}

/**
 * Listen for messages to the web socket
 * We only care about notifications and chats
 */
function onSocketMessage(e) {
    let msg = e.detail.socketMessage;
    let msgObj;
    try {
        const msgArray = msg.substring(msg.indexOf("["));
        msgObj = JSON.parse(msgArray);
    } catch (e) {
        console.warn("failed to parse", msg);
        return;
    }
    console.log(msgObj);
    switch(msgObj[0]){
    case "event:new_notification":
        notification(msgObj[1]);
        return;
    case "event:chats.receive":
        chat(msgObj[1]);
        return;
    }
}

/**
 * Get the localised notification templates
 */
let NOTIFICATIONS;
function getNotificationTemplates(){
    fetch(`https://forum.vivaldi.net/assets/language/${document.documentElement.lang}/notifications.json`, {
        method: "GET",
    }).then(response => {
        return response.json();
    }).then(response => {
        NOTIFICATIONS = response;
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
        getNotificationTemplates();
        document.addEventListener("vmNotifyMsg", onSocketMessage);
    }
});
