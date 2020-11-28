/* Modifications */

chrome.storage.sync.get({
    'headerScroll': '',
    'compact': '',
    'darkGrey': '',
    'lightGrey': '',
    'bookmarks': '',
    'notificationIcons': '',
    'tooltips': '',
    'unread': '',
    'timestamp': '',
    'userID': '',
    'signatureMod' : '',
    'square': '',
    'advancedFormatting': '',
    'linkBugs': '',
},
function(mods) {
    if (mods.headerScroll === '1') {
        var modHeaderScroll = document.createElement('script');
        if (mods.compact === '1' || mods.darkGrey === '1' || mods.lightGrey === '1') {
            modHeaderScroll.src = chrome.extension.getURL('mods/header_scroll_compact.js');
        }
        else {
            modHeaderScroll.src = chrome.extension.getURL('mods/header_scroll.js');
        }
        document.getElementsByTagName('body')[0].appendChild(modHeaderScroll);
    }
    if (mods.notificationIcons === '1') {
        var modNotificationIcons = document.createElement('link');
        modNotificationIcons.href = chrome.extension.getURL('mods/notification-icons.css');
        modNotificationIcons.type = 'text/css';
        modNotificationIcons.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(modNotificationIcons);
    }
    if (mods.tooltips === '1') {
        var modTooltips = document.createElement('link');
        modTooltips.href = chrome.extension.getURL('mods/tooltips.css');
        modTooltips.type = 'text/css';
        modTooltips.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(modTooltips);
    }
    if (mods.unread === '1') {
        var modUnread = document.createElement('link');
        modUnread.href = chrome.extension.getURL('mods/unread.css');
        modUnread.type = 'text/css';
        modUnread.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(modUnread);
    }
    if (mods.timestamp === '1') {
        var modTimestamp = document.createElement('link');
        modTimestamp.href = chrome.extension.getURL('mods/timestamp.css');
        modTimestamp.type = 'text/css';
        modTimestamp.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(modTimestamp);
    }
    if (mods.userID === '1') {
        var modUserID = document.createElement('link');
        modUserID.href = chrome.extension.getURL('mods/userID.css');
        modUserID.type = 'text/css';
        modUserID.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(modUserID);
    }
    if (mods.signatureMod === '1') {
        var modSignature = document.createElement('link');
        modSignature.href = chrome.extension.getURL('mods/signature-mod.css');
        modSignature.type = 'text/css';
        modSignature.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(modSignature);
    }
    if (mods.square === '1') {
        var modSquare = document.createElement('link');
        modSquare.href = chrome.extension.getURL('mods/square-avatars.css');
        modSquare.type = 'text/css';
        modSquare.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(modSquare);
    }
    if (mods.advancedFormatting === '1') {
        var modAdvancedFormatting = document.createElement('link');
        modAdvancedFormatting.href = chrome.extension.getURL('mods/advanced-formatting.css');
        modAdvancedFormatting.type = 'text/css';
        modAdvancedFormatting.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(modAdvancedFormatting);
    }
    if (mods.linkBugs === '1') {
        var modLinkBugs = document.createElement('script');
        modLinkBugs.src = chrome.extension.getURL('mods/linkBugs.js');
        modLinkBugs.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(modLinkBugs);
    }

    userMenu();
    add_copy_code();
    discord();
    _modflagsself()
    if (mods.bookmarks === '1') { _bookmarks() }
    if (mods.signatureMod === '1') { _smod() }
    if (mods.timestamp === '1') { _lastedit() }

    document.addEventListener('click', function() {
        add_copy_code();
        if (mods.signatureMod === '1') { w_smod() }
        if (mods.timestamp === '1') { w_lastedit() }
        _modflagsself();
    });

    window.addEventListener('popstate', function() {
        add_copy_code();
        if (mods.signatureMod === '1') { w_smod() }
        if (mods.timestamp === '1') { w_lastedit() }
        _modflagsself();
    });

    setTimeout(function() {
        notificationCheck();
    }, 700);
});

/* Assign mod flag to self */
function _modflagsself(){
    if(window.location.href.indexOf("https://forum.vivaldi.net/flags/")===0 && !document.querySelector("#mod-assignMe")){
        const options = Array.from(document.querySelectorAll("#assignee option"));
        const userName = document.querySelector("#user-header-name").innerText;
        let myId = 0;
        for (let i = 0; i < options.length; i++) {
            if(options[i].innerText === userName){
                myId = options[i].value;
                break;
            }
        }
        if(myId===0){
            console.error("Failed to get logged in user");
            return;
        }
        const assignedUser = document.querySelector("#assignee");
        const assignMe = document.createElement("span");
        assignMe.className = "btn btn-block btn-primary";
        assignMe.id = "mod-assignMe";
        assignMe.innerText = `Assign to ${userName}`;
        assignMe.addEventListener("click", () => {
            assignedUser.value = myId;
        });
        assignedUser.insertAdjacentElement("afterend", assignMe);
    }
}



/* Bookmarks in navigation */

function _bookmarks() {
    var nav = document.querySelector('#submenu ul');
    var li = document.createElement('li');
    var link = document.createElement('a');
    link.classList.add('navigation-link');
    link.href = '/user/' + username() + '/bookmarks';
    link.setAttribute('title', '');
    link.setAttribute('title', 'Bookmarks');
    link.innerHTML = '<i class="fa fa-fw fa-bookmark"></i><span class="visible-xs-inline showmenutext" style="margin-left: 2px">' + chrome.i18n.getMessage('bookmarks') + '</span>';
    nav.insertBefore(li, nav.childNodes[15]);
    li.appendChild(link);
};


/* Signature mod */

function _smod() {
    var signature = document.querySelector('.post-signature');
    if (signature) {
        var trans = chrome.i18n.getMessage('signature');
        var signatures = document.getElementsByClassName('post-signature');
        var siblings = document.querySelectorAll('.post-signature + .pull-right .post-tools');
        var prevent = document.querySelectorAll('.post-signature + .pull-right .post-tools a:nth-of-type(1)');
        for (var i=0; i < signatures.length; i++) {
            if (prevent[i].classList.contains('sig') === false) {
                var button = document.createElement('a');
                button.innerHTML = trans;
                button.classList.add('no-select', 'sig');
                siblings[i].insertBefore(button, siblings[i].firstChild);
            }
        }
        var showsig = document.getElementsByClassName('sig');
        for (i=0; i < showsig.length; i++) {
              showsig[i].addEventListener('click', function(i) {
                signatures[i].style = 'display: block';
                showsig[i].style = 'text-decoration: none; cursor: default';
              }.bind(this, i));
        }
    }
};

function w_smod() {
    setTimeout(function() {
        _smod();
    }, 700);
};

/* scheduled themes */

//do scheduling
function doSchedule() {
    const now = new Date().getHours();
    if(now < 9){
        loadTheme("2");
    } else if (now < 21) {
        loadTheme("1");
    } else {
        loadTheme("2");
    }
}

function loadTheme(key) {
    chrome.storage.sync.get(data => {
        const name = "custom"+key;
        if(data[name]==="1"){
            return;
        } else {
            var colorBg = data["c"+key+"Bg"];
            var colorFg = data["c"+key+"Fg"];
            var colorHi = data["c"+key+"Hi"];
            var colorBtn = data["c"+key+"Btn"];
            var colorDrop = data["c"+key+"Drop"];
            var colorLi = data["c"+key+"Li"];
            var colorLi2 = data["c"+key+"Li2"];

            // calculate automatic colors
            function lum(color) {
                var colorL = color.substring(1);
                var rgb = parseInt(colorL, 16);
                var r = (rgb >> 16) & 0xff;
                var g = (rgb >>  8) & 0xff;
                var b = (rgb >>  0) & 0xff;
                return Math.round(0.2126*r+0.7152*g+0.0722*b);
            };
            function gray(color) {
                var colorG = color.substring(1);
                var rgb = parseInt(colorG, 16);
                var r = (rgb >> 16) & 0xff;
                var g = (rgb >>  8) & 0xff;
                var b = (rgb >>  0) & 0xff;
                var c = Math.round(0.30*r+0.59*g+0.11*b);
                return "#"+(0x1000000+c*0x10000+c*0x100+c).toString(16).slice(1);
            };
            function shade(color, percent) {
                var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
                return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
            };
            // dropdown
            var drop = lum(colorDrop);
            if (drop < 130) {
                var colorDropFg = '#fbfbfb';
                var colorDropHi = shade(colorDrop, 0.2);
                var colorDropHi2 = shade(colorDrop, 0.3);
                var colorDropHi3 = shade(colorDrop, 0.5);
            }
            else {
                var colorDropFg = '#121212';
                var colorDropHi = shade(colorDrop, -0.1);
                var colorDropHi2 = shade(colorDrop, -0.2);
                var colorDropHi3 = shade(colorDrop, -0.3);
            }
            var colorDropHiG = gray(colorDropHi);
            // background
            var bg = lum(colorBg);
            var bg2 = gray(colorBg);
            if (bg < 130) {
                var colorBgHiG = shade(bg2, 0.2);
                var colorBgHiG2 = shade(bg2, 0.4);
                var colorBgHi = shade(colorBg, 0.2);
                var colorBgHiC = shade(colorBg, 0.1);
                var colorBgHiCG = shade(bg2, 0.1);
                var logoWhite = '1';
            }
            else {
                var colorBgHiG = shade(bg2, -0.1);
                var colorBgHiG2 = shade(bg2, -0.22);
                var colorBgHi = shade(colorBg, -0.1);
                var colorBgHiC = shade(colorBg, -0.05);
                var colorBgHiCG = shade(bg2, -0.05);
                var logoWhite = '0';
            }
            // foreground
            var fg = lum(colorFg);
            var fg2 = gray(colorFg);
            if (fg < 130) {
                var colorFg2 = shade(fg2, 0.25);
            }
            else {
                var colorFg2 = shade(fg2, -0.1);
            }
            // highlight
            var hi = lum(colorHi);
            if (hi < 130) {
                var colorHiFg = '#fbfbfb';
            }
            else {
                var colorHiFg = '#121212';
            }
            // link
            var link = lum(colorLi);
            var linkR = gray(colorLi);
            if (link < 130) {
                var colorLiHi = shade(colorLi, 0.25);
                var colorLiR = shade(linkR, 0.25);
            }
            else {
                var colorLiHi = shade(colorLi, -0.12);
                var colorLiR = shade(linkR, -0.07);
            }
            // link2
            var link2 = lum(colorLi2);
            if (link2 < 130) {
                var colorLi2Hi = shade(colorLi2, 0.25);
            }
            else {
                var colorLi2Hi = shade(colorLi2, -0.12);
            }
            // button
            var btn = lum(colorBtn);
            if (btn < 130) {
                var colorBtnHi = shade(colorBtn, 0.1);
                var colorBtnFg = '#fbfbfb';
            }
            else {
                var colorBtnHi = shade(colorBtn, -0.07);
                var colorBtnFg = '#121212';
            }
            // store custom theme
            const update = {
                'logoWhite': logoWhite,
                'colorBg': colorBg,
                'colorFg': colorFg,
                'colorHi': colorHi,
                'colorBtn': colorBtn,
                'colorDrop': colorDrop,
                'colorLi': colorLi,
                'colorLi2': colorLi2,
                'colorDropFg': colorDropFg,
                'colorDropHi': colorDropHi,
                'colorDropHi2': colorDropHi2,
                'colorDropHi3': colorDropHi3,
                'colorDropHiG': colorDropHiG,
                'colorBgHi': colorBgHi,
                'colorBgHiC': colorBgHiC,
                'colorBgHiCG': colorBgHiCG,
                'colorBgHiG': colorBgHiG,
                'colorBgHiG2': colorBgHiG2,
                'colorFg2': colorFg2,
                'colorHiFg': colorHiFg,
                'colorLiHi': colorLiHi,
                'colorLiR': colorLiR,
                'colorLi2Hi': colorLi2Hi,
                'colorBtnHi': colorBtnHi,
                'colorBtnFg': colorBtnFg,
                custom1: "0",
                custom2: "0",
                custom3: "0",
                custom4: "0"
            };
            update[name] = "1";
            chrome.storage.sync.set(update, () => {
                window.location.reload()
            });
        }
    })
}

doSchedule();

//swap theme
    //if theme not needing swapped
        //return
    //activate other theme
    //reload page


/* Last edit timestamp to local */

function tolocalISO(date) {
    function pad(n) { return n < 10 ? '0' + n : n }
    var localISO = date.getFullYear() + '-'
        + pad(date.getMonth() + 1) + '-'
        + pad(date.getDate()) + ' '
        + pad(date.getHours()) + ':'
        + pad(date.getMinutes());
    return localISO;
};

function _lastedit() {
    var topic = document.querySelector('.topic');
    if (topic != null) {
        var metas = document.getElementsByTagName('meta');
        for (var i=0; i < metas.length; i++) {
            if (metas[i].getAttribute('itemprop') && metas[i].getAttribute('itemprop') === 'dateModified' && metas[i].getAttribute('content') !== '') {
                var utcDate = metas[i].getAttribute('content');
                var localDate = new Date(utcDate);
                metas[i].setAttribute('content', tolocalISO(localDate));
                metas[i].setAttribute('itemprop', 'localdateModified');
            }
        }
    }
};

function w_lastedit() {
    setTimeout(function() {
        _lastedit();
    }, 700);
};
