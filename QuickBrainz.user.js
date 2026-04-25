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
                z-index: 1;
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
            }
            .gbz-url-row-image {
                width: 1.5em;
                margin-top: 0.2em;
                box-shadow: 0 0 6px #0000005e;
            }
            .gbz-url-row-image.top {
                margin-top: 0.6em;    
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
                cursor: pointer;
                box-shadow: #00000073 0px 0px 12px;
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
            
        `;
        document.head.appendChild(style);
    }

    function injectButton() {
        const wrapper = document.createElement('div');
        wrapper.id = 'QuickBrainz-Button-Wrapper';
        wrapper.className = 'gbz-wrapper';
        const button = document.createElement('div');
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
        urls = urls.filter((url) => !blackListedUrls.some((bl) => url.includes(bl)))
        const urlRow = document.getElementById('QuickBrainz-UrlRow')
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
                img.src = `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(urlDomain)}`;
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
        const pageUrl = window.location.href;
        let response = await fetch(`https://musicbrainz.org/ws/2/url?fmt=json&resource=${encodeURIComponent(pageUrl)}&inc=artist-rels+work-rels+release-group-rels`);
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

    async function fetchEntity(mbid, type) {
        log(`Looking up ${type} ${mbid}...`, 'purple')
        try {
            let response = await fetch(`https://musicbrainz.org/ws/2/${type}/${mbid}?fmt=json&inc=url-rels`)
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
                    let entity = await fetchEntity(urlResults[0].mbid, type);
                    if (entity) {
                        const urls = entity.relations?.filter((rel) => rel['target-type'] == 'url').map((urlRel) => urlRel.url.resource)
                        console.log(entity)
                        setClass('green', true);
                        if (urls) {
                            setUrls(urls)
                        }
                    }
                }
            }
            setClass('loading', false);
        } catch (e) {
            setClass('loading', false);
            setClass('error', true);
            log('Failed to lookup current page', 'red', e)
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
        const pageBlacklist = ['apple_music_player', '/discussions/'];
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