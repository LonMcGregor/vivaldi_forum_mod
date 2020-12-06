/* Restore Options */

function _restore() {
    _restoreThemes();
    chrome.storage.sync.get({
        'advancedFormatting': '',
        'headerScroll': '',
        'bookmarks': '',
        'notificationIcons': '',
        'tooltips': '',
        'unread': '',
        'timestamp': '',
        'compact': '',
        'userID': '',
        'signatureMod': '',
        'square': '',
        'cssToggle': '0',
        'linkBugs': '',
        'undoMoji': '',
    },
    function(restore){
        chrome.storage.local.get({'userCSS': ''}, function(local) {
            document.getElementById('userCSS').value = local.userCSS;
        });
        if (restore.advancedFormatting === '1') {
            document.getElementById('advancedFormatting').classList.add('selected');
        }
        if (restore.headerScroll === '1') {
            document.getElementById('headerScroll').classList.add('selected');
        }
        if (restore.bookmarks === '1') {
            document.getElementById('bookmarks').classList.add('selected');
        }
        if (restore.notificationIcons === '1') {
            document.getElementById('notificationIcons').classList.add('selected');
        }
        if (restore.tooltips === '1') {
            document.getElementById('tooltips').classList.add('selected');
        }
        if (restore.unread === '1') {
            document.getElementById('unread').classList.add('selected');
        }
        if (restore.timestamp === '1') {
            document.getElementById('timestamp').classList.add('selected');
        }
        if (restore.compact === '1') {
            document.getElementById('compact').classList.add('selected');
        }
        if (restore.userID === '1') {
            document.getElementById('userID').classList.add('selected');
        }
        if (restore.signatureMod === '1') {
            document.getElementById('signatureMod').classList.add('selected');
        }
        if (restore.square === '1') {
            document.getElementById('square').classList.add('selected');
        }
        if (restore.cssToggle === '0') {
            toggleBtn.classList.add('deactivated');
            textarea.disabled = true;
            save2Btn.disabled = true;
            backupBtn.disabled = true;
        }
        if (changeMessage === false) {
            status.style.opacity = '0';
            status.innerText = chrome.i18n.getMessage('statusThemes');
            _fade();
        }
        if (restore.linkBugs === '1') {
            document.getElementById('linkBugs').classList.add('selected');
        }
        if (restore.undoMoji === '1') {
            document.getElementById('undoMoji').classList.add('selected');
        }
        loadCustomEmoteSettings();
    });
};


/* Save Modifications */

function _selectMods(event) {
    const mod = event.currentTarget;
    const name = mod.getAttribute('id');
    if (mod.classList.contains('selected')) {
        mod.removeAttribute('class');
        chrome.storage.sync.set({[name]: '0'});
    }
    else {
        mod.classList.add('selected');
        chrome.storage.sync.set({[name]: '1'});
    }
};


/* Use tab in textarea (tab to 4 spaces) */

function _tabSpaces(key) {
    if (key.keyCode === 9 || key.which === 9) {
        key.preventDefault();
        var select = this.selectionStart;
        this.value = this.value.substring(0,this.selectionStart) + "    " + this.value.substring(this.selectionEnd);
        this.selectionEnd = select+4;
    }
};


/* Toggle User CSS */

function _toggleUserCSS() {
    if (toggleBtn.classList.contains('deactivated')) {
        chrome.storage.sync.set({'cssToggle': '1'}, function() {
            toggleBtn.classList.remove('deactivated');
            save2Btn.disabled = false;
            backupBtn.disabled = false;
            textarea.disabled = false;
            status.style.opacity = '0';
            status.innerText = chrome.i18n.getMessage('activateUserCSS');
            _fade();
        });
    }
    else {
        chrome.storage.sync.set({'cssToggle': '0'}, function() {
            toggleBtn.classList.add('deactivated');
            save2Btn.disabled = true;
            backupBtn.disabled = true;
            textarea.disabled = true;
            status.style.opacity = '0';
            status.innerText = chrome.i18n.getMessage('deactivateUserCSS')
            _fade();
        });
    }
};


/* Save User CSS */

function _saveUserCSS() {
    var userCSS = document.getElementById('userCSS').value;
    chrome.storage.local.set({
        'userCSS': userCSS
    },
    function() {
        status.style.opacity = '0';
        status.innerText = chrome.i18n.getMessage('saveUserCSS');
        _fade();
    });
};


/* Backup User CSS */

function _backupUserCSS() {
    var userCSS = document.getElementById('userCSS').value;
    const url = 'data:text/css;base64,' + btoa(userCSS);
    chrome.downloads.download({
        url: url,
        saveAs: true,
        filename: 'backup.css'
    });
};


/* Load custom emotes */
customEmotes = [];
/* add all the custom emotes the first time advanced formatting is enabled */
document.getElementById('advancedFormatting').addEventListener("click", e => {
    chrome.storage.local.get({"customEmotes": []}, data =>{
        if(data["customEmotes"].length === 0 || data["customEmotes"] === "[]"){
            resetEmotes();
        }
    });
});
function loadCustomEmoteSettings(){
    document.querySelector("#customemotes").addEventListener("input", addCustomEmote);
    document.querySelector("#resetEmotes").addEventListener("click", resetEmotes);
    loadCustomEmotes();
}
function resetEmotes(){
    chrome.runtime.sendMessage("reset emotes", () => {
        Array.from(document.querySelectorAll("#emotetable div")).forEach(
            emotediv => {emotetable.removeChild(emotediv);}
        );
        loadCustomEmotes();
    });
}
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
    });
}
function deleteCustomEmote(event){
    var emotediv = event.target.parentElement;
    var targetEmote = emotediv.querySelector("img").title;
    customEmotes = customEmotes.filter(x => x[0] !== targetEmote);
    emotediv.parentElement.removeChild(emotediv);
    chrome.storage.local.set({"customEmotes": JSON.stringify(customEmotes)});
}
function sleep(ms) {
   return new Promise(resolve => setTimeout(resolve, ms));
}
/* TODO file size limit */
async function addCustomEmote(event){
    Array.from(event.target.files).forEach(emotefile => {
        var reader = new FileReader();
        reader.readAsDataURL(emotefile);
        reader.addEventListener("load", () => {
            /* prevent dupes */
            if(!customEmotes.some(x => x[0]===emotefile.name || x[1]===reader.result)){
                customEmotes.push([emotefile.name, reader.result]);
            }
        });
        /* this is async so we need to wait a bit */
    });
    await sleep(500); /* proper way is to wait on reader.readystate, but that just blocks things up as everything is on the same thread */
    chrome.storage.local.set({"customEmotes": JSON.stringify(customEmotes)});
    var emotetable = document.querySelector("#emotetable");
    Array.from(document.querySelectorAll("#emotetable div")).forEach(
        emotediv => {emotetable.removeChild(emotediv);}
    );
    loadCustomEmotes();
}

/* Reset Extension */

function _resetOptions() {
    if (!resetBtn.classList.contains('confirm')) {
        resetBtn.classList.add('confirm');
        status.style.opacity = '0';
        status.innerText = chrome.i18n.getMessage('confirmReset');
        _fade();
        setTimeout(function() {
            if (status.innerText === chrome.i18n.getMessage('confirmReset')) {
                status.style.opacity = '0';
                status.innerText = chrome.i18n.getMessage('cancelReset');
                _fade();
            }
            resetBtn.removeAttribute('class');
        }, 8000);
    }
    else {
        resetBtn.removeAttribute('class');
        chrome.storage.sync.clear(function() {
            chrome.storage.local.clear(function() {
                selectMods.forEach(function(mod) {
                    if (mod.classList.contains('selected')) {
                        mod.removeAttribute('class');
                    }
                });
                document.querySelectorAll('button.themebox').forEach(function(theme) {
                    if (theme.classList.contains('active')) {
                        theme.classList.remove('active');
                    }
                });
                _restore();
                _showThemes();
                changeMessage = true;
                status.style.opacity = '0';
                status.innerText = chrome.i18n.getMessage('optionsReset');
                _fade();
            });
        });
    }
};


/* Navigation */

function _showThemes() {
    document.querySelector('.view').removeAttribute('class');
    btnThemes.classList.add('view');
    navThemes.style.display = 'block';
    navModifications.style.display = 'none';
    navInfo.style.display = 'none';
    status.style.opacity = '0';
    status.innerText = chrome.i18n.getMessage('statusThemes');
    _fade();
};
function _showModifications() {
    document.querySelector('.view').removeAttribute('class');
    btnModifications.classList.add('view');
    navThemes.style.display = 'none';
    navModifications.style.display = 'block';
    navInfo.style.display = 'none';
    status.style.opacity = '0';
    status.innerText = chrome.i18n.getMessage('statusModifications');
    _fade();
};
function _showInfo() {
    document.querySelector('.view').removeAttribute('class');
    btnInfo.classList.add('view');
    navThemes.style.display = 'none';
    navModifications.style.display = 'none';
    navInfo.style.display = 'block';
    status.style.opacity = '0';
    status.innerText = chrome.i18n.getMessage('statusInfo');
    _fade();
};


const navThemes = document.getElementById('themes');
const navModifications = document.getElementById('modifications');
const navInfo = document.getElementById('info');
const btnThemes = document.getElementById('themes-btn');
const btnModifications = document.getElementById('modifications-btn');
const btnInfo = document.getElementById('info-btn');
const selectMods = document.querySelectorAll('#selectMods > p > span');
const textarea = document.querySelector('textarea');
const toggleBtn = document.getElementById('css-toggle');
const save2Btn = document.getElementById('css-save');
const backupBtn = document.getElementById('css-backup');
const resetBtn = document.getElementById('reset-btn');
var changeMessage = false;

btnThemes.addEventListener('click', _showThemes);
btnModifications.addEventListener('click', _showModifications);
btnInfo.addEventListener('click', _showInfo);
selectMods.forEach(function(mod) {
    mod.addEventListener('click', _selectMods);
});
textarea.addEventListener('keydown', _tabSpaces);
toggleBtn.addEventListener('click', _toggleUserCSS);
save2Btn.addEventListener('click', _saveUserCSS);
backupBtn.addEventListener('click', _backupUserCSS);
resetBtn.addEventListener('click', _resetOptions);

_restore();
