/* find all the image emojis and turn them into native unicode ones */
function undoMoji(img){
    var emojidom = document.createElement("span");
    emojidom.innerText = img.alt;
    img.insertAdjacentElement("beforebegin", emojidom);
    var post = img.parentElement;
    post.removeChild(img);
}

/* cant just globally replace the HTML or that will break attached listeners,
so go through each post text one by one */
function checkDocument() {
    Array.from(document.querySelectorAll("img.emoji")).forEach(undoMoji);
}

/* wait for the page to fully load */
setInterval(checkDocument, 2000);
