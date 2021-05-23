"use strict";

/* ==========Globals=============*/
const EMOTES = {
    alien:"1539692482285-alien.gif",
    angel:"1539692493644-angel.gif",
    awww:"1539692536730-awww.gif",
    banana:"1539692630638-banana.gif",
    beer:"1539692709259-beer.gif",
    bigeyes:"1539692683566-bigeyes.gif",
    bigsmile:"1539687021352-bigsmile.gif",
    blush:"1539687052167-blush.gif",
    bomb:"1539692948902-bomb.gif",
    bug:"1539685604359-bug.gif",
    bye:"1539692998605-bye.gif",
    cat:"1539693028753-cat.gif",
    cheers:"1539698180973-cheers.gif",
    chef:"https://forum.vivaldi.net/assets/uploads/files/1620378615905-1162cfde-2319-4b5f-8ebe-4cc9d50ce99f-image.png",
    coffee:"1539685551254-coffee.gif",
    confused:"1539685266409-confused.gif",
    cool:"1539693137735-cool.gif",
    detective:"1539693179226-detective.gif",
    devil:"1539693232474-devil.gif",
    doh:"1539685506587-doh.gif",
    drunk:"1539693282716-drunk.gif",
    eek:"1539693323529-eek.gif",
    faint:"1539693390072-faint.gif",
    flirt:"1539685662035-flirt.gif",
    frown:"1539685209586-frown.gif",
    furious:"1539685719517-furious.gif",
    haha:"1539685426101-haha.gif",
    headbang:"1539686921747-headbang.gif",
    idea:"1539686816525-idea.gif",
    irked:"1539698254681-irked.gif",
    jester:"1539685753306-jester.gif",
    lookleft:"1539698335612-left.gif",
    lookright:"1539698359299-right.gif",
    mad:"1539698407597-mad.gif",
    no:"1539686722752-no.gif",
    party:"1539698651945-party.gif",
    pingu:"1539685811063-pingu.gif",
    rip:"1539693574973-rip.gif",
    rolleyes:"1539693612367-rolleyes.gif",
    smile:"1539685039446-smile.gif",
    spock:"1539685852804-spock.gif",
    thumbsdown:"1539693743513-thumbsdown.gif",
    thumbsup:"1539693760607-thumbsup.gif",
    troll:"1539685894751-troll.gif",
    waiting:"1539685920932-waiting.gif",
    weeping:"1539685954572-weeping.gif",
    whistle:"1539698509979-whistle.gif",
    wink:"1539698493281-wink.gif",
    wizard:"1539685980783-wizard.gif",
    worried:"1539698551154-worried.gif",
    yes:"1539686029165-yes.gif",
    zipped:"1539685367819-zipped.gif",
    zzz:"1539685301665-zzz.gif"
};
const STATIC_URL = "https://lonm.vivaldi.net/wp-content/uploads/sites/1533/2018/10/";
let DRAG_START_POS = {x:0, y:0};
/**
 * Keep a reference to the list button used to simulte clicks on hidden elements
*/
let SIMULATED_FORMAT_BUTTON;
/* Definitions for new formatters
* [keystring (as per fa-icons), start tag, end tag] */
const FORMATTERS = [
    ["header", "# ", "", chrome.i18n.getMessage("header")],
    ["window-minimize", "", `
***
`, chrome.i18n.getMessage("horizontal_line")],
    ["quote-right", "> ", "", chrome.i18n.getMessage("block_quote")],
    ["file-code-o", "`", "`", chrome.i18n.getMessage("code")],
    ["th-large", `a | a
---|---
x | x
y | y
`, "", chrome.i18n.getMessage("table")],
    ["shield", `> Spoiler
>> `, "", chrome.i18n.getMessage("spoiler")],
    ["list-ol", "1. ", "", chrome.i18n.getMessage("number_list")]
];
/* default values - don't change these */
const DEFAULT_FORMATTING_BAR_CUSTOM_ORDER = {
    bold: 1,
    italic: 2,
    list: 3,
    strikethrough: 4,
    code: 5,
    link: 6,
    "picture-o": 7,
    zen: 8,
    picture: 9,
    "emoji-add-emoji": 10,
    header: -1,
    "window-minimize": -1,
    "quote-right": -1,
    "file-code-o": -1,
    "th-large": -1,
    "list-ol": -1,
    "shield": -1
};
/** Keep track of order of icon */
let FORMATTING_BAR_CUSTOM_ORDER = {
    bold: 1,
    italic: 2,
    list: 3,
    strikethrough: 4,
    code: 5,
    link: 6,
    "picture-o": 7,
    zen: 8,
    picture: 9,
    "emoji-add-emoji": 10,
    header: -1,
    "window-minimize": -1,
    "quote-right": -1,
    "file-code-o": -1,
    "th-large": -1,
    "list-ol": -1,
    "shield": -1
};
/** Keep references to the buttons
 * never delete and re-create, always move */
let FORMATTING_BUTTONS = {
    bold: undefined,
    italic: undefined,
    list: undefined,
    strikethrough: undefined,
    code: undefined,
    link: undefined,
    "picture-o": undefined,
    zen: undefined,
    picture: undefined,
    "emoji-add-emoji": undefined,
    header: undefined,
    "window-minimize": undefined,
    "quote-right": undefined,
    "file-code-o": undefined,
    "th-large": undefined,
    "list-ol": undefined,
    "shield": undefined
};
const TOOLBAR_MODAL = "toolbar-custom";
/* use a nonce to prevent accidental dnd of text */
const NONCE = get_random();

/**
 * Generate random number
 * @param {int} length in bytes
 * @returns {string} random numbers
 */
function get_random(length=4){
    const buf = new Uint32Array(length);
    window.crypto.getRandomValues(buf);
    return buf.join("");
}

/* ==========UpdateComposer============*/

/**
 * Add a before and after string to the selected part of the text area
 * @param beforeSelection the string to put at the start of selection
 * @param afterSelection the string to put at the end of selection
 */
function writeToTextarea(beforeSelection, afterSelection){
    const textarea = document.querySelector("textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let replacement = textarea.value.substring(0, start) + beforeSelection + textarea.value.substring(start, end) + afterSelection + textarea.value.substring(end);
    textarea.value = replacement;
    forceUpdatePreview(start + beforeSelection.length);
}

/**
 * Force update of preview box
 * @param {int} finalPos where the text caret should be placed
 */
function forceUpdatePreview(finalPos){
    const textarea = document.querySelector(".composer .write");
    if(!textarea){
        return;
    }
    const forceUpdate = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: ""
    });
    textarea.dispatchEvent(forceUpdate);
    textarea.setSelectionRange(finalPos, finalPos);
    textarea.focus();
}

/* ============Modals============= */

/**
 * User started to drag a modal
 * @param {DragEvent} e dragstart
 */
function modalDragStart(e){
    const box = e.target.getBoundingClientRect();
    DRAG_START_POS = {
        x: e.clientX - box.left,
        y: e.clientY - box.top
    };
}

/**
 * Move a modal to a new position as specified by user dragging it
 * @param {DragEvent} e dragend
 */
function modalDrag(e){
    const modal = e.target.parentElement;
    if(modal){
        modal.style.top = (e.clientY - DRAG_START_POS.y - 10) + "px";
        modal.style.left = (e.clientX - DRAG_START_POS.x - 10) + "px";
    }
}

/**
 * Show a modal. Use the mouse position to align it with the button
 *   in case the user resizes the message composer
 * If modal will clip off-screen positively (to right or below),
 *   move it back on-screen automatically
 * @param {MouseEvent} pos where the mouse was when you want to show the modal
 * @param {string} modalId of the modal to show
 */
function showModal(pos, modalId){
    const modal = document.getElementById(modalId);
    if(modal){
        modal.style.display = "grid";
    } else {
        return;
    }
    const modalBounds = modal.getClientRects()[0];
    let x = pos.clientX + 10;
    let y = pos.clientY + 10;
    if((x + modalBounds.width) > window.innerWidth){
        x -= (modalBounds.width - (window.innerWidth - x));
    }
    if((y + modalBounds.height) > window.innerHeight){
        y -= (modalBounds.height - (window.innerHeight - y));
    }
    modal.style.top = y + "px";
    modal.style.left = x + "px";
}

/**
 * Hide the modal
 * @param {string} identifier string of the modal id
 * @param {MouseEvent} identifier MouseEvent of close button click
 */
function hideModal(identifier){
    let target = identifier.target;
    if(!target){
        target = document.getElementById(identifier);
    } else if(target.tagName.toUpperCase()==="I"){
        target = target.parentElement.parentElement;
    } else if(target.tagName.toUpperCase()==="BUTTON"){
        target = target.parentElement;
    }
    if(target){
        target.style.display = "none";
    }
}

/**
 * The user pressed a button that toggles a modal, so show or hide as needed
 * @remark Becuse it takes an additional argument this is not a listener method
 * @param {MouseEvent} event click event
 * @param {string} modalId for the modal window
 */
function toggleModal(event, modalId){
    const modal = document.getElementById(modalId);
    if(modal){
        if(modalIsVisible(modalId)){
            hideModal(modalId);
        } else {
            showModal(event, modalId);
        }
    } else {
        switch (modalId) {
        case TOOLBAR_MODAL:
            createToolbarCustomModal();
            break;
        default:
            throw "Unknown modal ID "+modalId;
        }
        showModal(event, modalId);
    }
}

// TODO after first upload of a custom emote, replace it with a URL link

/**
 * Creates a modal box that floats on the page
 * @param {string} id of the modal
 * @param {string} titleText to show on the modal
 */
function makeModalBox(id, titleText){
    const box = document.createElement("div");
    box.id = id;
    box.className = "vivaldi-mod-modal-box";
    box.style.display = "none";

    const controlBar = document.createElement("div");
    controlBar.className = "vivaldi-mod-modal-box-control-bar";
    controlBar.innerText = titleText;
    controlBar.title = chrome.i18n.getMessage("dragText");
    controlBar.draggable = true;
    controlBar.addEventListener("dragstart", modalDragStart);
    controlBar.addEventListener("dragend", modalDrag);
    box.appendChild(controlBar);

    const closeBtn = document.createElement("button");
    closeBtn.className = "vivaldi-mod-modal-box-close";
    closeBtn.classList.add("btn-primary");
    closeBtn.innerHTML = "<i class='fa fa-times'></i>";
    closeBtn.addEventListener("click", hideModal);
    box.appendChild(closeBtn);

    return box;
}

/**
 * Remove a modal from the DOM
 * @param {string} id of modal
 */
function destroyModal(id){
    const modal = document.getElementById(id);
    if(modal){
        modal.parentElement.removeChild(modal);
    }
}

/**
 * Is the modal currently visible
 * @param {string} id of modal
 * @returns {boolean} if it is visible
 */
function modalIsVisible(id){
    const modal = document.getElementById(id);
    return modal && modal.style.display==="grid";
}

/* ==========Emote============= */

/**
 * User clicked on an emote
 * @param {MouseEvent} event mouse click
 */
function emotePicked(event){
    event.preventDefault();
    const textarea = document.querySelector(".composer .write");
    if(!textarea){
        return;
    }
    const newtext = `![${event.target.alt}](${event.target.src} "${event.target.alt}") `;
    writeToTextarea(newtext, "");
}

/**
 * Create the DOM for a new custom emote
 * @param {[string, string]} emoteData
 * @returns DOM element
 * Choose a different insert method depending on if it is a data: upload
 * or referencing an image already uploaded to the forum.
 */
function makeCustomeEmoteButton(emoteData){
    const emoteButton = document.createElement("img");
    emoteButton.alt = emoteName;
    emoteButton.title = emoteName;
    if (emoteName === "chef") emoteButton.src = emoteUrl;
    else emoteButton.src = STATIC_URL + emoteUrl;
    emoteButton.addEventListener("click", emotePicked);
    return emoteButton;
}

/**
 * Emoji search string has changed
 * @param {InputEvent} event
 */
function emojiSearch(event){
    const terms = event.target.value.trim();
    const emotes = Array.from(document.querySelectorAll("#emoji-tab-emoticons img"));
    const matches = emotes.filter(x => x.title.includes(terms));
    const negmatches = emotes.filter(x => !x.title.includes(terms));
    matches.forEach(emote => emote.className = "");
    negmatches.forEach(emote => emote.className = "hidden");
    /* stop force showing when search is removed */
    document.querySelector("#emoji-tab-emoticons").className = (terms === "") ? "tab-pane" : "tab-pane searching";
}

/**
 * Add the custom emotes to a special nodebb emote picker tab
 */
function addCustomEmotesToNodeBBPicker(){
    const emojipanel = document.querySelector("#emoji-tab-emoticons");
    if(emojipanel){
        return; /* don't add it twice */
    }
    const dialog = document.querySelector("#emoji-dialog");
    if(!dialog){
        setTimeout(addCustomEmotesToNodeBBPicker, 500); /* if the dialog spawned late, wait */
        return;
    }
    /* add tab */
    const tabs = dialog.querySelector("ul.nav");
    tabs.querySelector("li.active").classList.remove("active");
    const newtab = document.createElement("li");
    newtab.className = "active";
    newtab.setAttribute("role", "presentation");
    newtab.innerHTML = `<a href="#emoji-tab-emoticons" aria-controls="emoticons" role="tab" data-toggle="tab" data-ajaxify="false" aria-expanded="true">
      Emoticons
    </a>`;
    tabs.insertAdjacentElement("afterbegin", newtab);
    /* add panel */
    const panels = dialog.querySelector(".tab-content");
    panels.querySelector(".tab-pane.active").classList.remove("active");
    const newpanel = document.createElement("div");
    newpanel.setAttribute("role", "tabpanel");
    newpanel.className = "tab-pane active";
    newpanel.id = "emoji-tab-emoticons";
    chrome.storage.local.get({"customEmotes": []}, data =>{
        if(data["customEmotes"].length === 0 || data["customEmotes"] === "[]"){
            newpanel.innerText = chrome.i18n.getMessage("customEmoteFirstRun");
        } else {
            var customEmotes = JSON.parse(data["customEmotes"]);
            customEmotes.forEach(emote => {
                newpanel.appendChild(makeCustomeEmoteButton(emote));
            });
        }
        panels.insertAdjacentElement("afterbegin", newpanel);
    });
    dialog.querySelector("input").addEventListener("input", emojiSearch);
}

/* hijack the real emotes button */
function hookIntoEmotesButton(){
    FORMATTING_BUTTONS["emoji-add-emoji"].addEventListener("click", addCustomEmotesToNodeBBPicker);
}

/* ========Formatting======= */

/**
 * Create a new formatting button
 * @param {string} buttonTitle
 * @param {string} buttonDisplayClass (for font-awesome)
 * @param {string} openTag that appears before selection
 * @param {string} endTag that appears after selection
 * @param {string} title for button tooltip
 * @returns {DOM} list item
 */
function createSpecialFormattingbutton(buttonDisplayClass, openTag, endTag, title){
    const li = document.createElement("li");
    li.innerHTML = `<i class='fa fa-${buttonDisplayClass}'></i>`;
    li.addEventListener("click", () => {writeToTextarea(openTag, endTag);});
    li.title = title;
    li.setAttribute("tabindex", "-1");
    li.setAttribute("data-format", buttonDisplayClass);
    li.id = "additional-format-"+buttonDisplayClass;
    return li;
}

/**
 * A special formatting button is required to support clicking hidden
 *   default buttons as their listener is normally registered as a
 *   jquery click simulator, which requires a toolbar button
 */
function createJQueryClickSimulatorButton(){
    const button = document.createElement("li");
    button.style.position = "fixed";
    button.style.left = "-9999px";
    button.style.top = "-9999px";
    button.style.order = "-99999";
    return button;
}

/**
 * Add the special formatting buttons to the composer
 */
function addSpecialFormattingButtons(){
    const composerFormatters = document.querySelector(".composer .formatting-group");
    FORMATTERS.forEach(button => {
        const madeButton = createSpecialFormattingbutton(button[0], button[1], button[2], button[3]);
        composerFormatters.appendChild(madeButton);
    });
    SIMULATED_FORMAT_BUTTON = createJQueryClickSimulatorButton();
    const formatterForm = composerFormatters.querySelector("form");
    composerFormatters.insertBefore(SIMULATED_FORMAT_BUTTON, formatterForm);
}

/* ===========DraggableToolbar===========*/

/**
 * Generate references to the individual formatting buttons
 * for later use in the draggableToolbar functions
 */
function getReferencesToButtons(){
    FORMATTING_BUTTONS = {
        bold: document.querySelector(".composer .formatting-group li[data-format='bold']"),
        italic: document.querySelector(".composer .formatting-group li[data-format='italic']"),
        list: document.querySelector(".composer .formatting-group li[data-format='list']"),
        strikethrough: document.querySelector(".composer .formatting-group li[data-format='strikethrough']"),
        link: document.querySelector(".composer .formatting-group li[data-format='link']"),
        "picture-o": document.querySelector(".composer .formatting-group li[data-format='picture-o']"),
        zen: document.querySelector(".composer .formatting-group li[data-format='zen']"),
        picture: document.querySelector(".composer .formatting-group li[data-format='picture']"),
        "emoji-add-emoji": document.querySelector(".composer .formatting-group li[data-format='emoji-add-emoji']"),
        header: document.querySelector(".composer .formatting-group li[data-format='header']"),
        "window-minimize": document.querySelector(".composer .formatting-group li[data-format='window-minimize']"),
        "quote-right": document.querySelector(".composer .formatting-group li[data-format='quote-right']"),
        code: document.querySelector(".composer .formatting-group li[data-format='code']"),
        "file-code-o": document.querySelector(".composer .formatting-group li[data-format='file-code-o']"),
        "th-large": document.querySelector(".composer .formatting-group li[data-format='th-large']"),
        "list-ol": document.querySelector(".composer .formatting-group li[data-format='list-ol']"),
        "shield": document.querySelector(".composer .formatting-group li[data-format='shield']")
    };
}

/**
 * Set the transfer data for the dragging
 * @param {DragEvent} dragEvent
 */
function makeDataTransfer(dragEvent){
    dragEvent.dataTransfer.setData("text", JSON.stringify({
        order: Number(dragEvent.target.style.order),
        key: dragEvent.target.getAttribute("data-format"),
        nonce: NONCE
    }));
}

/**
 * Attempt to read the transfer data according to expected format
 * If it fails for any reason, throw an error
 * @param {DropEvent} dropEvent
 * @returns {object} transfer data with order, key
 * @throws {string} Badly Formatted transfer data error
 */
function getDataTranfer(dropEvent){
    try {
        const data = JSON.parse(dropEvent.dataTransfer.getData("text"));
        if(isNaN(data.order) || !data.key || data.nonce !== NONCE){
            throw "Badly formatted drop";
        }
        return data;
    } catch(e) {
        throw "Badly formatted drop";
    }
}

/**
 * Don't do anything, but this is necessary in order to allow
 * things to be dropped onto the target that listens to this event
 * @param {DragEvent} dragEvent
 */
function makeValidDropTarget(dragEvent){
    dragEvent.preventDefault();
}

/**
 * Something was dropped onto the modal
 * If it was another button, begin the process of moving it
 * @param {DropEvent} dropEvent
 */
function buttonDroppedOnToModal(dropEvent){
    let data;
    try {
        data = getDataTranfer(dropEvent);
    } catch (e) {
        hideDropMarker();
        return;
    }
    const orderOfDropped = Number(data.order);
    const keyOfDropped = data.key;
    for (const key in FORMATTING_BAR_CUSTOM_ORDER) {
        if (FORMATTING_BAR_CUSTOM_ORDER.hasOwnProperty(key)) {
            const order = Number(FORMATTING_BAR_CUSTOM_ORDER[key]);
            if(order > orderOfDropped){
                FORMATTING_BAR_CUSTOM_ORDER[key] = order - 1;
            }
        }
    }
    FORMATTING_BAR_CUSTOM_ORDER[keyOfDropped] = -1;
    saveToolbarOrder();
    setOrderAndHideAccordingToRemembered();
    dropEvent.preventDefault();
}

/**
 * Add a listener that listens for default button clicks
 *   as these need to be manually simulated for the forum to work properly
 *   as the listener was applied using a jquery selector not a native listener
 * @param {DOMElement} modal only ever pass it an instance of a TOOLBAR_MODAL
 */
function addJqueryClickSimulator(modal){
    modal.classList.add("formatting-bar");
    modal.addEventListener("click", event => {
        let target = event.target;
        if(target.tagName.toUpperCase()==="I"){
            target = target.parentElement;
        }
        if(target.tagName.toUpperCase()==="LI" && target.getAttribute("data-format")){
            SIMULATED_FORMAT_BUTTON.setAttribute("data-format", target.getAttribute("data-format"));
            SIMULATED_FORMAT_BUTTON.click();
        }
    });
}

/**
 * Create and add to page the modal for holding hidden toolbar items
 * Allow dropping to this modal
 * List items should always be a child of the <ul> within this
 */
function createToolbarCustomModal(){
    const box = makeModalBox(TOOLBAR_MODAL, chrome.i18n.getMessage("customToolbarTitle"));
    box.addEventListener("drop", buttonDroppedOnToModal);
    box.addEventListener("dragover", makeValidDropTarget);
    const list = document.createElement("ul");
    box.appendChild(list);
    addJqueryClickSimulator(box)
    document.body.appendChild(box);
}

/**
 * Save the current global order variable to storage
 */
function saveToolbarOrder(){
    chrome.storage.sync.set({VFM_FORMAT: FORMATTING_BAR_CUSTOM_ORDER});
}

/**
 * Go through each of the formatting buttons
 * If it has an order > 0, set it accordingly
 * If the order is -1, move it to the hidden items modal
 */
function setOrderAndHideAccordingToRemembered(){
    const composerFormatters = document.querySelector(".composer .formatting-group");
    composerFormatters.style.display = "inline-flex";
    for (const key in FORMATTING_BAR_CUSTOM_ORDER) {
        if (FORMATTING_BAR_CUSTOM_ORDER.hasOwnProperty(key)) {
            const order = Number(FORMATTING_BAR_CUSTOM_ORDER[key]);
            if(FORMATTING_BUTTONS[key]){
                FORMATTING_BUTTONS[key].style.order = order;
                if(order === -1){
                    document.querySelector(`#${TOOLBAR_MODAL} ul`).appendChild(FORMATTING_BUTTONS[key]);
                } else {
                    composerFormatters.appendChild(FORMATTING_BUTTONS[key]);
                }
            }
        }
    }
}

/**
 * Make a button, and add it to DOM, that will show the hidden items modal
 */
function makeModalWithHiddenButtonsOpener(){
    const button = document.createElement("li");
    button.style.order = 0;
    button.className = "hiddenButtons";
    button.innerHTML = "<i class='fa fa-wrench'></i>";
    button.title = chrome.i18n.getMessage("customToolbarTitle");
    button.addEventListener("click", event => {
        toggleModal(event, TOOLBAR_MODAL);
    });
    button.addEventListener("dragover", makeValidDropTarget);
    button.addEventListener("drop", buttonDroppedOn);
    document.querySelector("ul.formatting-group").appendChild(button);
}

/**
 * Get the dropping marker if it exists
 * If it doesn't, make it and add it to DOM
 * @returns {DOMElement} div.dropmarker
 */
function createOrGetDropListMarker(){
    const marker = document.querySelector(".dropmarker");
    if(marker){
        return marker;
    }
    const newMarker = document.createElement("div");
    newMarker.className = "dropmarker";
    document.body.append(newMarker);
    return newMarker;
}

/**
 * Shows the .dropmarker
 * Note: If it was never created, this will fail
 */
function showDropMarker(){
    const marker = createOrGetDropListMarker();
    marker.classList.remove("hidden");
}

/**
 * Hides the .dropmarker
 * Note: If it was never created, this will fail
 */
function hideDropMarker(){
    const marker = createOrGetDropListMarker();
    marker.classList.add("hidden");
}

/**
 * Move the drop marker to specified client co-ordinates
 * Note: If it was never created, this will create it and succeed
 */
function moveDropMarker(x, y){
    const marker = createOrGetDropListMarker();
    marker.style.top = Math.floor(y) + "px";
    marker.style.left = Math.floor(x) + "px";
}

/**
 * The user started to drag a formatting button
 * @param {DragEvent} dragEvent
 */
function formatButtonDragStart(dragEvent){
    makeDataTransfer(dragEvent);
    dragEvent.dataTransfer.dropEffect = "move";
    dragEvent.dataTransfer.effectAllowed = "move";
    if(modalIsVisible(TOOLBAR_MODAL) && getDataTranfer(dragEvent).order===-1){
        setTimeout(() => {hideModal(TOOLBAR_MODAL);}, 10);
    } else {
        showModal(dragEvent, TOOLBAR_MODAL);
    }
    moveDropMarker(-100,-100);
    showDropMarker();
}

/**
 * A formatting button has stopped being dragged
 * @param {DragEvent} dragEvent
 */
function formatButtonDragEnd(dragEvent){
    hideModal(TOOLBAR_MODAL);
    hideDropMarker();
}

/**
 * Go through each of the formatting buttons and make it draggable
 * Add the dragstart and dragend listeners
 */
function makeFormatButtonsDraggable(){
    for (const key in FORMATTING_BUTTONS) {
        if (FORMATTING_BUTTONS.hasOwnProperty(key)) {
            const button = FORMATTING_BUTTONS[key];
            button.draggable = true;
            button.addEventListener("dragstart", formatButtonDragStart);
            button.addEventListener("dragend", formatButtonDragEnd);
            button.addEventListener("drag", buttonDraggedOverAnother);
        }
    }
}

/**
 * The button was dragged over another button
 * @param {DragEvent} dragEvent
 */
function buttonDraggedOverAnother(dragEvent){
    const x = dragEvent.clientX;
    const y = dragEvent.clientY;
    /* Dragged over another button */
    for (const key in FORMATTING_BUTTONS) {
        if (FORMATTING_BUTTONS.hasOwnProperty(key)) {
            const element = FORMATTING_BUTTONS[key];
            const box = element.getClientRects()[0];
            if(!box){
                continue;
            }
            const left = box.x;
            const right = box.x+box.width;
            const top = box.y;
            const bottom = box.y+box.height;
            if(left <= x && x <= right && top <= y && y <= bottom){
                if(Number(FORMATTING_BAR_CUSTOM_ORDER[key])===-1){
                    hideDropMarker();
                } else {
                    moveDropMarker(right, top);
                    showDropMarker();
                }
                return;
            }
        }
    }
    /* Dragged over leftmost button */
    const leftElement = document.querySelector("li.hiddenButtons");
    const leftBox = leftElement.getClientRects()[0];
    if(leftBox){
        const leftLeft = leftBox.x;
        const leftRight = leftBox.x+leftBox.width;
        const leftTop = leftBox.y;
        const leftBottom = leftBox.y+leftBox.height;
        if(leftLeft <= x && x <= leftRight && leftTop <= y && y <= leftBottom){
            moveDropMarker(leftRight, leftTop);
            showDropMarker();
            return;
        }
    }
    /* Not dragged over anything important */
    hideDropMarker();
}

/**
 * Something was dropped on a button
 * If it was another button, begin the process of moving it
 * @param {DropEvent} dropEvent
 */
function buttonDroppedOn(dropEvent){
    let data;
    try {
        data = getDataTranfer(dropEvent);
    } catch (e) {
        hideDropMarker();
        return;
    }
    let target = dropEvent.target;
    if(target.tagName.toUpperCase()==="I"){
        target = target.parentElement;
    }
    const targetOrder = Number(target.style.order);
    if(targetOrder === -1){ // dragged from toolbar to modal
        return;
    }
    if(data.order===-1){ // dragged from modal to toolbar
        for (const key in FORMATTING_BAR_CUSTOM_ORDER) {
            if (FORMATTING_BAR_CUSTOM_ORDER.hasOwnProperty(key)) {
                const order = Number(FORMATTING_BAR_CUSTOM_ORDER[key]);
                if(order > targetOrder){
                    FORMATTING_BAR_CUSTOM_ORDER[key] = order + 1;
                }
            }
        }
        FORMATTING_BAR_CUSTOM_ORDER[data.key] = targetOrder + 1;
    } else if(targetOrder > data.order) { // moved to the right
        for (const key in FORMATTING_BAR_CUSTOM_ORDER) {
            if (FORMATTING_BAR_CUSTOM_ORDER.hasOwnProperty(key)) {
                const order = Number(FORMATTING_BAR_CUSTOM_ORDER[key]);
                if(order > data.order && order <= targetOrder){
                    FORMATTING_BAR_CUSTOM_ORDER[key] = order - 1;
                }
            }
        }
        FORMATTING_BAR_CUSTOM_ORDER[data.key] = targetOrder;
    } else if (targetOrder < data.order) { // moved to the left
        for (const key in FORMATTING_BAR_CUSTOM_ORDER) {
            if (FORMATTING_BAR_CUSTOM_ORDER.hasOwnProperty(key)) {
                const order = Number(FORMATTING_BAR_CUSTOM_ORDER[key]);
                if(order > targetOrder && order <= data.order){
                    FORMATTING_BAR_CUSTOM_ORDER[key] = order + 1;
                }
            }
        }
        FORMATTING_BAR_CUSTOM_ORDER[data.key] = targetOrder + 1;
    } // else dropped on to self, so dont do anything
    saveToolbarOrder();
    setOrderAndHideAccordingToRemembered();
    dropEvent.preventDefault();
}

/**
 * Go through all of the button references and for each one
 * Set up dragover and drop listeners to allow dropping of
 *    other buttons on to them
 */
function makeFormattingButtonsDroppableOnTo(){
    for (const key in FORMATTING_BUTTONS) {
        if (FORMATTING_BUTTONS.hasOwnProperty(key)) {
            const button = FORMATTING_BUTTONS[key];
            button.addEventListener("dragover", makeValidDropTarget);
            button.addEventListener("drop", buttonDroppedOn);
        }
    }
}

/* =============Init=============*/

/**
 * Initialise the advanced formatting bar mod
 */
function initialiseOnComposerOpen(){
    addSpecialFormattingButtons();
    getReferencesToButtons();
    hookIntoEmotesButton();
    createToolbarCustomModal();
    makeModalWithHiddenButtonsOpener();
    setOrderAndHideAccordingToRemembered();
    makeFormatButtonsDraggable();
    makeFormattingButtonsDroppableOnTo();
}
/**
 * Something changed on the page.
 * If it was the composer being added, add the emote picker button.
 * If it was removed, kill the modals
 * @param {MutationRecord[]} mutationList
 */
function pageMutated(mutationList){
    mutationList.forEach(mutation => {
        mutation.addedNodes.forEach(element => {
            if(element.classList.contains("composer")){
                initialiseOnComposerOpen();
            }
        });
        mutation.removedNodes.forEach(element => {
            if(element.classList.contains("composer")){
                destroyModal(TOOLBAR_MODAL);
            }
        });
    });
}

/**
* Inject the emoji insertion script onto the webpage
* @param {string} dataurl
* @param {string} datatitle
*/
function uploadContentFiles(dataUrl, datatitle) {
    /* turn the function into a script */
    var txtscript =  '(' + simulateImageDrop + ')();';
    /* choose our image. Must be a blob. Can't download online images like this for security reasons */
    var datafile = datatitle.split(".");
    txtscript = txtscript.replace('FORMATURL', dataUrl);
    txtscript = txtscript.replace('FORMATTITLE', datatitle);
    txtscript = txtscript.replace('FORMATTYPE', datafile[1]);
    /* put it on the page */
    var script = document.createElement("script");
    var inlineScript = document.createTextNode(txtscript);
    script.appendChild(inlineScript);
    document.querySelector("body").appendChild(script);
}

/** simulate a drag and drop into the text composer
* @note Must be injected directly on to the page. For security reasons, it wont run in a content script
*/
async function simulateImageDrop(){
    /* Download our image behind the scenes */
    var tmpfile = await fetch("FORMATURL").then(r => r.blob()).then(tmpblob => new File([tmpblob], "FORMATTITLE", { type: "image/FORMATTYPE" }));

    /* We need to make a new data transfer object to contain our files
    Thank you fisker on Github for the point in the right direction
    derived from https://github.com/fisker/create-file-list/blob/master/src/index.js
    */
    let getDataTransfer = () => new DataTransfer()
    const dataTransfer = getDataTransfer()
    dataTransfer.items.add(tmpfile)

    /* Get a reference to the jQuery function that manages image uploads
    There is an appropriate one that is called when */
    var imagedrophandler = jQuery._data(document.querySelector(".imagedrop"), "events").drop[0].handler;

    /* This handler takes a drop event, containing the file */
    var tmpevent = {
        originalEvent: {
            dataTransfer: dataTransfer
        },
        preventDefault: () => {}
    }

    /* Simulate dropping our image */
    imagedrophandler(tmpevent);
}

/**
 * Init the mod
 */
chrome.storage.sync.get({
    VFM_MODS: "",
    VFM_FORMAT: FORMATTING_BAR_CUSTOM_ORDER
}, settings => {
    if(settings.VFM_MODS.advancedFormatting===true){
        const composerObserver = new MutationObserver(pageMutated);
        composerObserver.observe(document.body, {childList: true});
        FORMATTING_BAR_CUSTOM_ORDER = settings.VFM_FORMAT;
    }
});
