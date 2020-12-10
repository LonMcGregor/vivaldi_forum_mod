
/* Load custom emotes */
let customEmotes = [];

/* Defaults collected by pesala */
const default_emotes = [
["alien.gif", "1539692482285-alien.gif"],
["angel.gif", "1539692493644-angel.gif"],
["awww.gif", "1539692536730-awww.gif"],
["banana.gif", "1539692630638-banana.gif"],
["beer.gif", "1539692709259-beer.gif"],
["bigeyes.gif", "1539692683566-bigeyes.gif"],
["bigsmile.gif", "1539687021352-bigsmile.gif"],
["blush.gif", "1539687052167-blush.gif"],
["bomb.gif", "1539692948902-bomb.gif"],
["bug.gif", "1539685604359-bug.gif"],
["bye.gif", "1539692998605-bye.gif"],
["cat.gif", "1539693028753-cat.gif"],
["cheers.gif", "1539698180973-cheers.gif"],
["chef.gif", "1539692893638-chef.gif"],
["coffee.gif", "1539685551254-coffee.gif"],
["confused.gif", "1539685266409-confused.gif"],
["cool.gif", "1539693137735-cool.gif"],
["detective.gif", "1539693179226-detective.gif"],
["devil.gif", "1539693232474-devil.gif"],
["doh.gif", "1539685506587-doh.gif"],
["drunk.gif", "1539693282716-drunk.gif"],
["eek.gif", "1539693323529-eek.gif"],
["exitstageright.gif", "1606672548352-exitstageright.gif"],
["faint.gif", "1539693390072-faint.gif"],
["flirt.gif", "1539685662035-flirt.gif"],
["frown.gif", "1539685209586-frown.gif"],
["furious.gif", "1539685719517-furious.gif"],
["haha.gif", "1539685426101-haha.gif"],
["headbang.gif", "1539686921747-headbang.gif"],
["idea.gif", "1539686816525-idea.gif"],
["irked.gif", "1539698254681-irked.gif"],
["jester.gif", "1539685753306-jester.gif"],
["left.gif", "1539698335612-left.gif"],
["mad.gif", "1539698407597-mad.gif"],
["no.gif", "1539686722752-no.gif"],
["party.gif", "1539698651945-party.gif"],
["pingu.gif", "1539685811063-pingu.gif"],
["right.gif", "1539698359299-right.gif"],
["rip.gif", "1539693574973-rip.gif"],
["rolleyes.gif", "1539693612367-rolleyes.gif"],
["smile.gif", "1539685039446-smile.gif"],
["spock.gif", "1539685852804-spock.gif"],
["thumbsdown.gif", "1539693743513-thumbsdown.gif"],
["thumbsup.gif", "1539693760607-thumbsup.gif"],
["troll.gif", "1539685894751-troll.gif"],
["waiting.gif", "1539685920932-waiting.gif"],
["weeping.gif", "1539685954572-weeping.gif"],
["whistle.gif", "1539698509979-whistle.gif"],
["wink.gif", "1539698493281-wink.gif"],
["wizard.gif", "1539685980783-wizard.gif"],
["worried.gif", "1539698551154-worried.gif"],
["yes.gif", "1539686029165-yes.gif"],
["zipped.gif", "1539685367819-zipped.gif"],
["zzz.gif", "1539685301665-zzz.gif"],
]

/**
 * When the advanced formatting mod is turned on
 * If there are no stored emotes (i.e. the first time)
 * Reset them
 */
document.getElementById('advancedFormatting').addEventListener("click", e => {
    chrome.storage.local.get({"customEmotes": []}, data =>{
        if(data["customEmotes"].length === 0 || data["customEmotes"] === "[]"){
            chrome.storage.local.set({
                "customEmotes": JSON.stringify(default_emotes)
            }, () => {
                eraseEmoteTable();
                loadCustomEmotes();
            });
        }
    });
});

/** auxiliary function to use with array sorting */
function sortEmotesByName(x,y) {
    if(x[0] > y[0]){return 1}
    if(x[0] == y[0]){return 0}
    if(x[0] < y[0]){return -1}
}

/**
 * Erase everything in the emote table
 * Helper function for when you want to redraw the whole thing
 */
function eraseEmoteTable(){
    let emotetable = document.querySelector("#emotetable");
    Array.from(document.querySelectorAll("#emotetable div")).forEach(
        emotediv => {emotetable.removeChild(emotediv);}
    );
}

/**
 * Make a call to the background page to reset all the emotes back to the defaults
 * @param {false | any} userInitiated False if this is the first time, otherwise double check the user is sure they want to do this */
function resetEmotes(userInitiated){
    if(!userInitiated || (userInitiated && confirm(chrome.i18n.getMessage("customEmoteResetMsg")))){
        chrome.storage.local.set({
            "customEmotes": JSON.stringify(default_emotes)
        }, () => {
            eraseEmoteTable();
            loadCustomEmotes();
        });
    }
}

/**
 * Show current storage use
 * Latest docs don't have this data. Come on, google.
 * check https://web.archive.org/web/20201111224627/https://developer.chrome.com/extensions/storage
 * SYNC: 102,400 total, 8,192 bytes per item, 512 items
 * LOCAL: 5,242,880 total
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
        let emotetable = document.querySelector("#emotetable");
        let emotebutton = document.querySelector("#emotetable button");
        customEmotes = JSON.parse(data["customEmotes"]);
        customEmotes.forEach(emote => {
            let emotedel = document.createElement("button");
            emotedel.innerText = "X";
            emotedel.addEventListener("click", deleteCustomEmote)
            let emoteimg = document.createElement("img");
            emoteimg.src = "https://forum.vivaldi.net/assets/uploads/files/" + emote[1];
            emoteimg.title = emote[0];
            let emotediv = document.createElement("div");
            emotediv.appendChild(emotedel);
            emotediv.appendChild(emoteimg);
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
    let emotediv = event.target.parentElement;
    let targetEmote = emotediv.querySelector("img").title;
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
 * Load emotes from a URL
 * TODO apparently it doesn't load every image in. investigate further: https://forum.vivaldi.net/compose?p=/topic/19728/vivaldi-forum-mod/800
 * @param {Number} topic ID to use
 */
async function loadFromURL(topic){
    const loading = document.querySelector("#loadEmotesFromTopic");
    loading.disabled = true;
    loading.innerText = "0%";
    let topicdata = await fetch("https://forum.vivaldi.net/api/topic/" + topic)
    .then(result => result.json())
    .catch(result => {
        loading.disabled = true;
        loading.innerText = "ERR";
        console.error(result);
    });
    let postcount = topicdata.postcount;
    let page = 1;
    let topic_emotes = [];
    while(postcount > 1){
        let pagedata = await fetch(`https://forum.vivaldi.net/api/topic/${topic}?page=${page}`)
        .then(result => result.json());
        postcount = postcount - pagedata.posts.length;
        loading.innerText = Math.floor((topicdata.postcount - Math.max(0, postcount))*100 / topicdata.postcount) + "%";
        pagedata.posts.forEach(post => {
            /* regex the posts for relevant images */
            post_emotes = [...post.content.matchAll(/<img src="\/assets\/uploads\/files\/(\d{13}-([^"]+))"[^\/>]*\/?>/g)];
            /* get a name, url pair */
            post_emotes = post_emotes.map(x => [x[2], x[1]]);
            topic_emotes = topic_emotes.concat(post_emotes);
        });
        /* throttle to not overload the forum */
        sleep(500);
    }
    topic_emotes.forEach(emote => {
        /* don't allow dupes of same name */
        if(customEmotes.some(x => x[0]===emote[0])){
            console.warn("Emote already added. Skipping "+emote[0]);
        } else {
            customEmotes.push([emote[0], emote[1]]);
        }
    });
    /* sort everything */
    customEmotes.sort(sortEmotesByName);
    chrome.storage.local.set({"customEmotes": JSON.stringify(customEmotes)}, () => {
        eraseEmoteTable()
        loadCustomEmotes();
        loading.innerText = chrome.i18n.getMessage('customEmoteTopic');
        loading.disabled = false;
    });
}

/**
 * First time function to set up ennote settings */
function loadCustomEmoteSettings(){
    document.querySelector("#resetEmotes").addEventListener("click", resetEmotes);
    document.querySelector("#loadEmotesFromTopic").addEventListener("click", () => {
        loadFromURL(document.querySelector("#emoteTopic").value);
    });
    loadCustomEmotes();
}

loadCustomEmoteSettings();
