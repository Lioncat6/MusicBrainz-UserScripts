// ==UserScript==
// @name        QuickBrainz
// @namespace   https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @match       https://genius.com/*
// @homepageURL https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @icon        https://www.google.com/s2/favicons?sz=64&domain=genius.com
// @grant       none
// @version     04-24-2026
// @author      Lioncat6
// @description Genius MusicBrainz lookup tools
// @downloadURL https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/QuickBrainz.user.js
// @updateURL   https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/QuickBrainz.user.js
// @license     CC-NC
// @homepageURL https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @supportURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/issues
// ==/UserScript==


(async function () {
    'use strict';

    const scriptName = "%c||%cQuick%cBrainz%c||";

    function log(message, color = 'gray', error) {
        if (error) {
            console.error(`${scriptName} %c${message}`, "color: cyan", "color: yellow", "color: orange", "color: cyan", `color: ${color}`)
            console.error(error);
        } else {
            console.log(`${scriptName} %c${message}`, "color: cyan", "color: yellow", "color: orange", "color: cyan", `color: ${color}`)
        }
    }

    function injectCss() {
        const style = document.createElement('style');
        style.textContent = `
            .gbz-wrapper {
                width: 100%;
                height: 100%;
                position: fixed;
                display: flex;
                top: 0;
                left: 0;
                min-height: 100%;
                z-index: 666;
                pointer-events: none;
            }
            .gbz-button {
	            position: absolute;
                bottom: 1em;
                left: 1em;
                width: 3.8em;
                height: 3.8em;
                background: white;
                border-radius: 40px;
                box-shadow: #00000073 0px 0px 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
                opacity: 0;
                animation: fadeIn 0.2s ease-in forwards;
                transition: all 0.2s ease-in;
                z-index: 1;
                cursor: pointer;
            }
            .gbz-url-row {
                position: absolute;
                bottom: 1.5em;
                left: 1.9em;
                width: 2em;
                height: auto;
                background: white;
                border-radius: 40px;
                box-shadow: #00000073 0px 0px 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
                opacity: 0;
                animation: fadeIn 0.2s ease-in forwards;
                transition: all 0.2s ease-in;
                flex-direction: column-reverse;
                z-index: 0;
                display: none;
            }
            .gbz-url-row:not(.hidden)::before {
                content: '';
                position: absolute;
                top: -0.75em;
                left: -0.75em;
                width: calc(100% + 1.5em);
                height: calc(100% + 1.5em);
                background: transparent;
                border-radius: 40px;
                z-index: -1;
                display: none;
            }
            .gbz-url-row.hidden {
                display: none;
            }
            .gbz-url-row-image {
                width: 1.5em;
                margin-top: 0.2em;
                box-shadow: 0 0 6px #0000005e;
                border-radius: 13px
            }
            .top {
                margin-top: 0.6em !important;    
            }
            .gbz-url-row-a {}
            .gbz-url-row-placeholder {
                width: 1px;
                height: 3.2em;
            }
            .gbz-button.idle {
                box-shadow: none;
                background: transparent;
            }
            .gbz-wrapper:hover .gbz-button {
                background: white;
                box-shadow: #00000073 0px 0px 12px;
            }
            .gbz-wrapper:hover .gbz-url-row {
                display: flex;
            }
            .gbz-wrapper:hover .gbz-url-row::before {
                display: inherit;
            }
            .gbz-inner {
                width: 80%;
                height: 80%;
                background: white;
                border-radius: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .gbz-inner.green {
                border: #0ff40f solid 6px;
                box-shadow: #0ff40f 0px 0px 5px;
            }
            .gbz-inner.error {
                border: #f40f0f solid 6px;
                box-shadow: #f40f0f 0px 0px 5px;
            }
            .gbz-inner.loading {
                border: lightgray solid 6px;
                box-shadow: 0 0 0 0 rgba(128, 128, 128, 0.5);
                animation: pulse 1.5s ease-out infinite;
            }
            .gbz-inner.gray:not(.error):not(.green) {
                border: lightgray solid 6px;
                box-shadow: lightgray 0 0 5px;
            }
            .gbz-icon {
                scale: 0.85;
            }
            @keyframes pulse {
                0% {
                    border: lightgray solid 6px;
                    box-shadow: 0 0 0 0 rgba(128, 128, 128, 0.5);
                    transform: scale(1);
                }
                50% {
                    border: gray solid 6px;
                    box-shadow: 0 0 0 16px rgba(128, 128, 128, 0);
                    transform: scale(1.03);
                }
                100% {
                    border: lightgray solid 6px;
                    box-shadow: 0 0 0 28px rgba(128, 128, 128, 0);
                    transform: scale(1);
                }
            }
            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
            @keyframes idle {
                from {
                    opacity: 1;
                    background: white;
                    box-shadow: #00000073 0px 0px 12px;
                }
                to {
                    opacity: 1;
                    background: transparent;
                    box-shadow: none;
                }
            }
            .gbz-settings {
                color: black;
                width: 1.5em;
                height: 1.5em;
                margin-bottom: 0.2em;
            }
            .gbz-artistIcon {
                color: black;
                width: 1.4em;
                height: 1.4em;
                margin-top: 0.1em;
                cursor: pointer;
                margin-left: 0.1em;
                margin-bottom: -0.16em;
            }
            .gbz-artistIcon.noArtist {
                color: #00000025;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }

    function injectButton() {
        const wrapper = document.createElement('div');
        wrapper.id = 'QuickBrainz-Button-Wrapper';
        wrapper.className = 'gbz-wrapper';
        const button = document.createElement('a');
        button.id = 'QuickBrainz-Button';
        button.className = 'gbz-button idle';
        const innerDiv = document.createElement('div');
        innerDiv.id = 'QuickBrainz-Button-Inner'
        innerDiv.className = 'gbz-inner gray';
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('height', '30');
        icon.setAttribute('width', '27');
        icon.className.baseVal = 'gbz-icon';
        icon.innerHTML = `<g><path d="m13 1-12 7v14l12 7z" fill="#ba478f"/><path d="m14 1 12 7v14l-12 7z" fill="#eb743b"/></g>`;
        innerDiv.appendChild(icon);
        button.appendChild(innerDiv);
        wrapper.appendChild(button);
        const urlRow = document.createElement('div');
        urlRow.id = 'QuickBrainz-UrlRow';
        urlRow.className = 'gbz-url-row'
        const placeHolderUrl = document.createElement('div');
        placeHolderUrl.id = 'QuickBrainz-UrlRow-Gap';
        placeHolderUrl.className = 'gbz-url-row-placeholder'
        urlRow.appendChild(placeHolderUrl)
        const settings = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        settings.setAttribute('height', '1em');
        settings.setAttribute('width', '1.5em');
        settings.className.baseVal = 'gbz-settings';
        settings.id = 'QuickBrainz-Settings-Icon'
        settings.innerHTML = `<path viewBox="0 0 25 25" fill-rule="evenodd" clip-rule="evenodd" fill="currentcolor" d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46531 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z"></path>`;
        urlRow.appendChild(settings)
        const artistIconWrapper = document.createElement('div')
        artistIconWrapper.id = 'QuickBrainz-Info-Icon'
        artistIconWrapper.className = 'top'
        artistIconWrapper.title = 'This entity was not found on MusicBrainz'
        const artistIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        artistIcon.setAttribute('height', '1.1em');
        artistIcon.setAttribute('width', '1.1em');
        artistIcon.setAttribute('viewBox', '0 0 24 24')
        artistIcon.className.baseVal = 'gbz-artistIcon noArtist';
        artistIcon.innerHTML = `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z" fill="currentcolor"/>`;
        artistIconWrapper.appendChild(artistIcon)
        urlRow.appendChild(artistIconWrapper)
        wrapper.appendChild(urlRow);
        document.body.appendChild(wrapper);
        log("Injected Button")
    }


    function checkButton() {
        return document.getElementById('QuickBrainz-Button-Wrapper') != null
    }

    function setClass(className, bool) {
        if (checkButton()) {
            const inner = document.getElementById('QuickBrainz-Button-Inner');
            if (inner) {
                if (bool) {
                    inner.classList.add([className])
                } else {
                    inner.classList.remove([className])
                }
            }
        }
    }

    function setUrls(urls) {
        const blackListedUrls = ['genius.com']
        const whiteListedUrls = ['open.spotify.com', 'discogs.com', 'x.com', 'twitter.com', 'instagram.com', 'facebook.com', 'music.apple.com', 'itunes.apple.com', 'bandcamp.com', 'soundcloud.com', 'music.amazon.', 'tidal.com', 'www.youtube.com', 'shazam.com', 'tiktok.com']
        urls = urls.filter((url) => whiteListedUrls.some((bl) => url.includes(bl)))
        urls = [...new Set(urls)]
        const urlRow = document.getElementById('QuickBrainz-UrlRow')
        if (urls.length > 0) {
            const artistIcon = document.getElementById('QuickBrainz-Info-Icon');
            if (artistIcon) {
                artistIcon.classList.remove(['top'])
            }
        } else {
            const artistIcon = document.getElementById('QuickBrainz-Info-Icon');
            if (artistIcon) {
                artistIcon.classList.add(['top'])
            }
        }
        if (urlRow) {
            let oldUrls = urlRow.getElementsByClassName('gbz-url-row-a');
            Array.from(oldUrls).forEach(element => {
                element.remove()
            });
            function createUrl(url, top = false) {
                const a = document.createElement('a');
                a.className = 'gbz-url-row-a';
                a.href = url;
                a.target = '_blank';
                const img = document.createElement('img');
                const urlDomain = new URL(url).hostname.replace(/^www\./, '');
                img.src = `https://favicon.vemetric.com/${encodeURIComponent(urlDomain)}`;
                img.className = `gbz-url-row-image${top ? ' top': ''}`;
                a.appendChild(img);
                return a;
            }
            urls.forEach((url, index) => {
                if (url) {
                    urlRow.appendChild(createUrl(url, (index == urls.length-1)));
                }
            })
        }
    }

    function setRoutableMarker() {
        const routableParent = document.querySelector('routable-page');
        if (routableParent) {
            const marker = document.createElement('meta');
            marker.id='QuickBrainz--routable-marker';
            if (routableParent?.firstElementChild?.firstElementChild) {
                routableParent.firstElementChild.firstElementChild.appendChild(marker);
            }
        }
    }

    async function fetchUrl() {
        let mbUrl = null;
        let urlName = null;
        let results = [];
        const pageUrl = new URL(window.location.href);
        pageUrl.search = '';
        const cleanUrl = pageUrl.toString();
        let response = await fetch(`https://musicbrainz.org/ws/2/url?fmt=json&resource=${encodeURIComponent(cleanUrl)}&inc=artist-rels+work-rels+release-group-rels`);
        if (response.ok) {
            log(`Result found for ${pageUrl}`, "green");
            let url = await response.json();
            if (url.relations && url.relations.length > 0) {
                for (let rel of url.relations) {
                    let mbUrl = null;
                    let urlName = null;
                    let type = null;
                    let mbid = null
                    if (rel.ended != true) {
                        mbUrl = `https://musicbrainz.org/${rel['target-type'].replace(/_/g, '-')}/${rel[rel['target-type']]?.id}`;
                        urlName = rel[rel['target-type']]?.name || rel[rel['target-type']]?.title;
                        type = rel['target-type'];
                        mbid = rel[rel['target-type']]?.id
                    }
                    if (mbUrl) {
                        results.push({ mbUrl, urlName, resource: url.resource, type, mbid });
                        log(`Found MB id: ${mbUrl} for URL ${url.resource}`, "magenta");
                    }
                }
            }
        } else if (response.status === 404) {
            log(`No result found for ${pageUrl}`, "orange");
        } else {
            log(`Error fetching data for ${pageUrl}: ${response.status} ${response.statusText}`, "red", response.status);
        }
        return results;
    }

    async function fetchUrls(urls) {
        if (urls.length === 0 || !urls) return [];
        if (urls.length == 1) {
            const urlData = await fetchUrl(urls[0]);
            return urlData;
        }
        const results = [];
        const batchSize = 100;
        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);
            let response = await fetch(`https://musicbrainz.org/ws/2/url?fmt=json${batch.map(url => `&resource=${encodeURIComponent(url)}`).join('')}&inc=artist-rels+work-rels+release-group-rels`);
            if (response.ok) {
                let data = await response.json();
                for (let url of data.urls) {
                    if (url.relations && url.relations.length > 0) {
                        for (let rel of url.relations) {
                            let mbUrl = null;
                            let urlName = null;
                            let type = null;
                            let mbid = null
                            if (allowed_types.includes(rel['target-type']) && rel.ended != true) {
                                mbUrl = `https://musicbrainz.org/${rel['target-type'].replace(/_/g, '-')}/${rel[rel['target-type']]?.id}`;
                                urlName = rel[rel['target-type']]?.name || rel[rel['target-type']]?.title;
                                type = rel['target-type'];
                                mbid = rel[rel['target-type']]?.id
                            }
                            if (mbUrl) {
                                results.push({ mbUrl, urlName, resource: url.resource, type, mbid });
                                log(`Found MB id: ${mbUrl} for URL ${url.resource}`, "magenta");
                            }
                        }
                    }
                }
            } else {
                log(`Error fetching data for URLs: ${response.status} ${response.statusText}`, "red", response.status);
            }
        }
        return results;
    }

    async function fetchEntity(mbid, type, inc= ['url-rels']) {
        log(`Looking up ${type} ${mbid}...`, 'purple')
        try {
            let response = await fetch(`https://musicbrainz.org/ws/2/${type}/${mbid}?fmt=json&inc=${inc.join("+")}`)
            if (response.ok) {
                return await response.json();
            } else {
                log(`MusicBrainz fetch failed for ${type} ${mbid}: ${response.status}`, "orange")
            }
        } catch (e) {
            log(`Failed to fetch ${type} ${mbid}`, "red", e);
            setClass('loading', false);
            setClass('error', true);
        }
        return null;
    }


    async function lookupPage(url, type) {
        log(`Looking up url: ${url}`, 'purple')
        try {
            setClass('loading', true);
            let urlResults = await fetchUrls([url]);
            if (urlResults.length > 0) {
                const correctTypeResult = urlResults.find((result) => result.type == type.replace('release-group', 'release_group'))
                if (correctTypeResult) {
                    setButtonUrl(correctTypeResult.mbUrl)
                    const typeIncs ={
                        'artist': ['url-rels'],
                        'release-group': ['url-rels', 'releases'],
                        'work': ['url-rels', 'recording-rels']
                    }
                    let entity = await fetchEntity(urlResults[0].mbid, type, typeIncs[type]);
                    if (entity) {
                        let urls = entity.relations?.filter((rel) => rel['target-type'] == 'url').map((urlRel) => urlRel.url.resource)
                        if (type == 'release-group'){
                            const releaseIds = entity?.releases?.map((release) => release.id) || [];
                            const releases = [];
                            for (const id of releaseIds) {
                                console.log(id)
                                try {
                                    const release = await fetchEntity(id, 'release', ['url-rels'])
                                    if (release && release.relations){
                                        releases.push(release);
                                    }
                                } catch (e) {
                                    log('Failed to fetch release!', 'red', e);
                                }
                            }
                            let releaseUrls = releases.flatMap((release) => release.relations?.filter((rel) => rel['target-type'] == 'url').map((urlRel) => urlRel.url.resource))
                            urls = [...urls, ...releaseUrls]
                        } else if (type == 'work') {
                            console.log(entity)
                            const recordingIds = entity?.relations?.filter((rel) => rel['target-type'] == 'recording').map((recRel) => recRel.recording.id) || [];
                            console.log(recordingIds)
                            const recordings = [];
                            for (const id of recordingIds) {
                                console.log(id)
                                try {
                                    const release = await fetchEntity(id, 'recording', ['url-rels'])
                                    if (release && release.relations){
                                        recordings.push(release);
                                    }
                                } catch (e) {
                                    log('Failed to fetch release!', 'red', e);
                                }
                            }
                            let recordingUrls = recordings.flatMap((release) => release.relations?.filter((rel) => rel['target-type'] == 'url').map((urlRel) => urlRel.url.resource))
                            urls = [...urls, ...recordingUrls]
                        }
                        setClass('green', true);
                        if (urls) {
                            setUrls(urls)
                        }
                    }
                }
            }
            setClass('loading', false);
        } catch (e) {
            setButtonUrl(null);
            setClass('loading', false);
            setClass('error', true);
            log('Failed to lookup current page', 'red', e)
        }
    }

    function setButtonUrl(url) {
        const button = document.getElementById('QuickBrainz-Button');
        if (button) {
            button.href = url || undefined;
            button.target = "_blank"
        }
    }

    function checkPage() {
        log('Checking page...', 'yellow')
        const artistRegex = /https:\/\/genius\.com\/artists\/[\w-]+/
        const songRegex = /https:\/\/genius\.com\/[\w-]+-(lyrics|annotated)/
        const albumRegex = /https:\/\/genius\.com\/albums\/[\w-]+\/[\w-]+/
        const currentPage = document.location.href;
        if (currentPage.match(artistRegex)) {
            lookupPage(currentPage, 'artist');
        } else if (currentPage.match(songRegex)) {
            lookupPage(currentPage, 'work');
        } else if (currentPage.match(albumRegex)) {
            lookupPage(currentPage, 'release-group');
        } else {
            log('Page type not recognized', 'gray')
            return;
        }
    }

    injectCss();
    function checkInject() {
        const pageBlacklist = ['apple_music_player', '/discussions/', 'search/embed'];
        if (!checkButton() && !pageBlacklist.some((string) => document.location.href.includes(string))) {
            try {
                injectButton();
                setRoutableMarker();
            } catch (e) {
                log("Failed to inject button", 'red', e)
            }
        }
    }

    await checkInject();

    checkPage();

    function watchRoutableMarker() {
        log(`Watching page change...`,"yellow");
        let watcher = setInterval(async () => {
            if (!document.getElementById('QuickBrainz--routable-marker')) {
                clearInterval(watcher);
                await checkPage();
                checkInject();
                setRoutableMarker();
            }
        }, 100)
    }

    const originalPushState = history.pushState;
    history.pushState = function () { //Watching for location changes, since genius is partially react
        originalPushState.apply(this, arguments);
        watchRoutableMarker();
    };
    window.addEventListener("popstate", (event) => { //Watching for the back/forward buttons being used
        watchRoutableMarker();
    });

})();