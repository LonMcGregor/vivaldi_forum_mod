
/* Load custom emotes */
customEmotes = [];

/**
 * When the advanced formatting mod is turned on
 * If there are no stored emotes (i.e. the first time)
 * Reset them
 */
document.getElementById('advancedFormatting').addEventListener("click", e => {
    chrome.storage.local.get({"customEmotes": []}, data =>{
        if(data["customEmotes"].length === 0 || data["customEmotes"] === "[]"){
            resetEmotes(false);
        }
    });
});

/**
 * Erase everything in the emote table
 * Helper function for when you want to redraw the whole thing
 */
function eraseEmoteTable(){
    var emotetable = document.querySelector("#emotetable");
    Array.from(document.querySelectorAll("#emotetable div")).forEach(
        emotediv => {emotetable.removeChild(emotediv);}
    );
}

/**
 * Make a call to the background page to reset all the emotes back to the defaults
 * @param {false | any} userInitiated False if this is the first time, otherwise double check the user is sure they want to do this */
function resetEmotes(userInitiated){
    if(!userInitiated || (userInitiated && confirm("Erase all emotes and reset defaults?"))){
        chrome.runtime.sendMessage("reset emotes", () => {
            eraseEmoteTable()
            loadCustomEmotes();
        });
    }
}

/**
 * Show current storage use
 */
function updateStorageMonitor(){
    chrome.storage.local.getBytesInUse(null, bytesInUse => {
        document.querySelector("#storagemonitor progress").value = bytesInUse;
    });
}

/**
 * Get all emotes from storage and load them in
 */
function loadCustomEmotes(){
    chrome.storage.local.get({"customEmotes": []}, data =>{
        var emotetable = document.querySelector("#emotetable");
        var emotebutton = document.querySelector("#emotetable button");
        customEmotes = JSON.parse(data["customEmotes"]);
        customEmotes.forEach(emote => {
            var emotedel = document.createElement("button");
            emotedel.innerText = "X";
            emotedel.addEventListener("click", deleteCustomEmote)
            var emoteimg = document.createElement("img");
            emoteimg.src = emote[1];
            emoteimg.title = emote[0];
            var emotediv = document.createElement("div");
            emotediv.appendChild(emoteimg);
            emotediv.appendChild(emotedel);
            emotetable.insertBefore(emotediv, emotebutton);
        });
        updateStorageMonitor();
    });

}

/**
 * User clicked delete button next to emote
 * @param {MousEvent} event click
 */
function deleteCustomEmote(event){
    var emotediv = event.target.parentElement;
    var targetEmote = emotediv.querySelector("img").title;
    customEmotes = customEmotes.filter(x => x[0] !== targetEmote);
    emotediv.parentElement.removeChild(emotediv);
    chrome.storage.local.set({"customEmotes": JSON.stringify(customEmotes)});
}

/**
 * Helper function to temporarily pause while reader reads in images
 * @param {Number} ms
 */
function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * A file(s) has/have been selected. Add them as custom emotes.
 * Only adds up to a max of 4KB in any one image
 * @param {FileInput} event
 * TODO add from URL
 */
async function addCustomEmote(event){
    Array.from(event.target.files).forEach(emotefile => {
        var reader = new FileReader();
        reader.readAsDataURL(emotefile);
        reader.addEventListener("load", () => {
            if(reader.result.length > 4000) {
                console.warn("Emote is too large. Skipping "+emotefile.name);
                return;
            }
            if(customEmotes.some(x => x[0]===emotefile.name || x[1]===reader.result)){
                console.warn("Emote already added. Skipping "+emotefile.name);
            } else {
                customEmotes.push([emotefile.name, reader.result]);
            }
        });
        /* this is async so we need to wait a bit */
    });
    await sleep(500); /* proper way is to wait on reader.readystate, but that just blocks things up as everything is on the same thread */
    chrome.storage.local.set({"customEmotes": JSON.stringify(customEmotes)});
    eraseEmoteTable();
    loadCustomEmotes();
}

/**
 * First time function to set up ennote settings */
function loadCustomEmoteSettings(){
    document.querySelector("#customemotes").addEventListener("input", addCustomEmote);
    document.querySelector("#resetEmotes").addEventListener("click", resetEmotes);
    loadCustomEmotes();
}

loadCustomEmoteSettings();
