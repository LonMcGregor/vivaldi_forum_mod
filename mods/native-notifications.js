"use strict";

/**
 * Check notification permission
 */
function checkPermission(){
    if(Notification.permission !== "granted"){
        Notification.requestPermission();
    }
}

const OBSERVER = new MutationObserver(onMutate);
const UNREAD_CONFIG = {attributes: true, attributeFilter: ["data-content"]};
let NOTIF_LIST, CHAT_LIST, MOBILE_NOTIF_LIST, MOBILE_CHAT_LIST;

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
 * Simulate opening and closing the list so it loads the notifications
 * @param {DOMElement} button to simulate open/close with
 */
function simulateOpenClose(button){
    button.click();
    button.click();
}

/**
 * Get the list of notifications for a given unread badge
 * @param {string} listId "chat_dropdown" or "notif_dropdown"
 */
function getList(listId){
    const isMobile = window.innerWidth < 992;
    if(listId!=="chat_dropdown" && listId!=="notif_dropdown"){
        throw "Incorrect list id "+listId;
    }
    const isChat = listId==="chat_dropdown";
    if(isMobile && isChat){
        if(!MOBILE_CHAT_LIST){
            simulateOpenClose(document.getElementById("mobile-chats"));
            MOBILE_CHAT_LIST = document.querySelector("#chats-menu > section > ul");
        }
        return MOBILE_CHAT_LIST;
    }else if(isMobile && !isChat){
        if(!MOBILE_NOTIF_LIST){
            simulateOpenClose(document.getElementById("mobile-menu"));
            MOBILE_NOTIF_LIST = document.querySelector("#menu > section:nth-child(5) > ul");
        }
        return MOBILE_NOTIF_LIST;
    }else if(!isMobile && isChat){
        if(!CHAT_LIST){
            simulateOpenClose(document.querySelector("#chat_dropdown"));
            CHAT_LIST = document.querySelector(".chats .chat-list");
        }
        return CHAT_LIST;
    }else if(!isMobile && !isChat){
        if(!NOTIF_LIST){
            simulateOpenClose(document.querySelector("#notif_dropdown"));
            NOTIF_LIST = document.querySelector(".notifications .notification-list");
        }
        return NOTIF_LIST;
    }
}

/**
 * One of the unread count badges has changed
 * @param {DOMElement} target that changed
 */
function newUnreadData(target){
    console.log("New unread", target);
    const unreadId = target.parentElement.id;
    const list = getList(unreadId);
    if(!list){
        console.error("Failed to get list", unreadId);
        return;
    }
    const latest = list.children[0];
    if(!latest.classList.contains("unread")){
        console.warn("Tried to read a notification that was already read / notifications haven't loaded yet", latest);
        return;
    }
    console.log("latest unread", latest);
    let latestText = latest.innerText.replace(/[\t\n\r]/g, "");
    chrome.runtime.sendMessage({verb: "Notify", content: latestText}, responseFromBackground);
}

/**
 * Something being observed (an unread badge) mutated
 * @param {MutationRecord[]} mutations
 */
function onMutate(mutations){
    console.log("Mutations hapenned.", mutations);
    mutations.forEach(mutation => {
        if (mutation.type==="attributes" && mutation.target.classList.contains("unread-count")){
            newUnreadData(mutation.target);
        }
    });
}

/**
 * Start observing the unread counts for notification lists
 */
function observeNotifications(){
    const unreadNotificationCount = document.querySelector("#notif_dropdown > i");
    const unreadChatCount = document.querySelector("#chat_dropdown > i");
    if(unreadNotificationCount && unreadChatCount){
        simulateOpenClose(unreadNotificationCount.parentElement);
        NOTIF_LIST = unreadNotificationCount.parentElement.querySelector(".notification-list");
        simulateOpenClose(unreadChatCount.parentElement);
        CHAT_LIST = unreadNotificationCount.parentElement.querySelector(".chat-list");
        OBSERVER.observe(unreadNotificationCount, UNREAD_CONFIG);
        OBSERVER.observe(unreadChatCount, UNREAD_CONFIG);
    } else {
        console.warn("failed to find unread counter");
        setTimeout(observeNotifications, 500);
    }
}

/**
 * Init the mod
 */
chrome.storage.sync.get({
    nativeNotifications: ""
}, settings => {
    if(settings.nativeNotifications==="1"){
        checkPermission();
        observeNotifications();
    }
});
