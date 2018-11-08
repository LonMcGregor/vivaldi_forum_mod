/**
 * Override the websocket object to hook in a custom listener
 * Once done, rever the changes
 * Use a custom event to send updates to the content script
 */
const old = WebSocket.prototype.send;
WebSocket.prototype.send = function(){
    this.addEventListener("message", function socketMessage(event){
        document.dispatchEvent(new CustomEvent("vmNotifyMsg", {
            detail: {
                socketMessage: event.data
            }
        }));
    }.bind(this));
    WebSocket.prototype.send = old;
    old.apply(this, arguments);
};
