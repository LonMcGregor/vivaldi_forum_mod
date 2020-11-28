/**
 * Turn VB- text into links.
*/

const bugIdRe = /((VB|VAB|CW|VIV|HP)-\d{1,8})/gi;

function linkify(node){
    if(node.getAttribute("bugsLinked")){
        /* when running on a loop, don't try to regex it twice in a row */
        return;
    }
    const replacement = node.innerHTML.replaceAll(bugIdRe, '<a href="https://bugs.vivaldi.com/browse/$1" target="_blank">$1</a>');
    node.innerHTML = replacement;
    node.setAttribute("bugsLinked", true);
}

/* to avoid potential breakage, only edit posts that actually contain a bug id */
function checkPost(postNode){
    const thereAreIdsInThisPost = bugIdRe.test(postNode.innerText);
    if(thereAreIdsInThisPost){
        linkify(postNode.querySelector('.content'));
    }
}

/* cant just globally replace the HTML or that will break attached listeners,
so go through each post text one by one */
function checkDocument() {
    Array.from(document.querySelectorAll('[component="post"]')).forEach(checkPost);
}

/* wait for the page to fully load */
setInterval(checkDocument, 2000);
