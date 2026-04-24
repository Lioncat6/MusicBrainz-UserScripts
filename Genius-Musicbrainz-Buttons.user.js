// ==UserScript==
// @name        Genius MusicBrainz Buttons
// @namespace   https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @match       https://genius.com/artists/*
// @match       https://genius.com/albums/*
// @match       https://genius.com/*-lyrics
// @match       https://genius.com/*-annotated
// @match       https://genius.com/search?q=*
// @match       https://genius.com/artists-index/*
// @homepageURL https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @icon        https://www.google.com/s2/favicons?sz=64&domain=genius.com
// @grant       none
// @version     04-24-2026
// @author      Lioncat6
// @description Adds MusicBrainz buttons to Genius pages
// @downloadURL https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Genius-Musicbrainz-Buttons.user.js
// @updateURL   https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Genius-Musicbrainz-Buttons.user.js
// @license     CC-NC
// @homepageURL https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @supportURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/issues
// ==/UserScript==

(async function () {
    'use strict';

    const scriptName = "%c||Genius MusicBrainz Buttons||";

    const allowed_types = ['artist', 'work', 'release_group'];

    let lastSetMarker = null;

    function findRetry(query) {
        let target = document.querySelector(query);
        let tries = 0;
        const maxTries = 4;
        const intervalTime = 300; // ms

        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                target = document.querySelector(query);
                if (target) {
                    clearInterval(interval);
                    resolve(target);
                } else if (tries >= maxTries) {
                    clearInterval(interval);
                    resolve(null);
                }
                tries++;
            }, intervalTime);
        }); 
    }

    function injectCss() {
        const style = document.createElement('style');
        style.textContent = `
            .square_button--musicbrainz {
                background-color: #e37333;
                border-color: #e37333;
                width: 40px;
            }
            .square_button--musicbrainz:hover {
                background-color: #f08548;
                border-color: #f08548;
            }
            .mb_icon {
                transform: scale(80%) translateY(-11px) translateX(-5px)
            }
            .mbWorkLink {
                text-decoration: underline;color: #9e9e9e;
                transition: all 0.3s ease;
                font-size: 0.75rem;
                padding-left: 1.313rem;
            }
            .mbWorkLink:hover {
                color: black;
                text-decoration: none;
            }
            .mbRGLink {
                text-decoration: underline;
                color: #9a9a9a;
                transition: all 0.3s ease;
            }
            .mbRGLink:hover {
                color: white;
                text-decoration: none;
            }
            .mbIconLink {
                transform: translateY(-4px);
                overflow: visible;
            }
            .mbArtistLink {
                margin-left: 0.25rem;
            }
        `;
        document.head.appendChild(style);
    }

    async function injectButtons(mbUrl, urlName) {
        if (window.location.href.match(/genius\.com\/artists\/([^/?]+)/)) {
            let linkContainer = await findRetry('.u-text_center.u-vertical_margins');
            if (!linkContainer) {
                console.error(`${scriptName} %cButton injection failed`, "color: cyan;", "color: red;");
                return;
            }
            const mbButton = document.createElement('a');
            mbButton.href = mbUrl;
            mbButton.target = "_blank";
            mbButton.className = 'square_button square_button--musicbrainz u-quarter_vertical_margins';
            mbButton.title = `View '${urlName}' on MusicBrainz`;
            const mbSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            mbSvg.setAttribute('height', '30');
            mbSvg.setAttribute('width', '30');
            mbSvg.className.baseVal = 'inline_icon mb_icon';
            mbSvg.innerHTML = `<g><path d="m13 1-12 7v14l12 7z" fill="#ffffff"/><path d="m14 1 12 7v14l-12 7z" fill="#ffffff"/></g>`;
            mbButton.appendChild(mbSvg);
            linkContainer.appendChild(mbButton);
            console.log(`${scriptName} %cButton injected for artist '${urlName}'`, "color: cyan;", "color: green;");
        }
        if (window.location.href.match(/genius\.com\/([^/?]+)-lyrics/)) {
            let linkContainer = await findRetry('.ContributorSidebar__Body-sc-b06c6d43-2');
            if (!linkContainer) {
                console.warn(`${scriptName} %cCould not find link container by class; Falling back to id`, "color: cyan;", "color: orange;");
                let linkContainerChild = document.getElementById('collapsible-song-info-content');
                if (linkContainerChild) {
                    linkContainer = linkContainerChild.parentElement.parentElement;
                } else {
                    console.error(`${scriptName} %cButton injection failed`, "color: cyan;", "color: red;");
                    return;
                }

            }
            const mbButton = document.createElement('a');
            mbButton.href = mbUrl;
            mbButton.target = "_blank";
            mbButton.className = 'mbWorkLink';
            mbButton.innerText = 'View on MusicBrainz';
            mbButton.title = `View '${urlName}' on MusicBrainz`;
            mbButton.appendChild(getMarker());
            linkContainer.appendChild(mbButton);
            console.log(`${scriptName} %cButton injected for work '${urlName}'`, "color: cyan;", "color: green;");
        }
        if (window.location.href.match(/genius\.com\/albums\/([^/?]+)/)) {
            let linkContainer = await findRetry('.header_with_cover_art-primary_info');
            if (!linkContainer) {
                console.error(`${scriptName} %cButton injection failed`, "color: cyan;", "color: red;");
                return;
            }
            const mbButton = document.createElement('a');
            mbButton.href = mbUrl;
            mbButton.target = "_blank";
            mbButton.className = 'mbRGLink';
            mbButton.innerText = 'View on MusicBrainz';
            mbButton.title = `View '${urlName}' on MusicBrainz`;
            mbButton.appendChild(getMarker());
            linkContainer.appendChild(mbButton);
            console.log(`${scriptName} %cButton injected for release group '${urlName}'`, "color: cyan;", "color: green;");
        }
    }

    async function fetchUrl() {
        let mbUrl = null;
        let urlName = null;

        const pageUrl = window.location.href;
        let response = await fetch(`https://musicbrainz.org/ws/2/url?fmt=json&resource=${encodeURIComponent(pageUrl)}&inc=artist-rels+work-rels+release-group-rels`);
        if (response.ok) {
            console.log(`${scriptName} %cResult found for ${pageUrl}`, "color: cyan;", "color: green;");
            let data = await response.json();
            if (data.relations && data.relations.length > 0) {
                for (let rel of data.relations) {
                    if (allowed_types.includes(rel['target-type'])) {
                        console.log(`${scriptName} %cFound MB id: ${rel[rel['target-type']]?.id} for ${rel['target-type']} ${rel[rel['target-type']]?.name || rel[rel['target-type']]?.title}`, "color: cyan;", `color: magenta; font-style: italic;`);
                        mbUrl = `https://musicbrainz.org/${rel['target-type'].replace(/_/g, '-')}/${rel[rel['target-type']]?.id}`;
                        urlName = rel[rel['target-type']]?.name || rel[rel['target-type']]?.title;
                        break;
                    }
                }
            }
        } else if (response.status === 404) {
            console.log(`${scriptName} %cNo result found for ${pageUrl}`, "color: cyan;", "color: orange;");
        } else {
            console.error(`${scriptName} %cError fetching data for ${pageUrl}: ${response.status} ${response.statusText}`, "color: cyan;", "color: red;");
        }
        return { mbUrl, urlName, resource: pageUrl };
    }

    async function fetchUrls(urls) {
        if (urls.length === 0 || !urls) return [];
        if (urls.length == 1) {
            const urlData = await fetchUrl(urls[0]);
            return urlData ? [urlData] : [];
        }
        const results = [];
        const batchSize = 100;
        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);
            let response = await fetch(`https://musicbrainz.org/ws/2/url?fmt=json${batch.map(url => `&resource=${encodeURIComponent(url)}`).join('')}&inc=artist-rels+work-rels+release-group-rels`);
            if (response.ok) {
                let data = await response.json();
                for (let url of data.urls) {
                    let mbUrl = null;
                    let urlName = null;
                    if (url.relations && url.relations.length > 0) {
                        for (let rel of url.relations) {
                            if (allowed_types.includes(rel['target-type'])) {
                                mbUrl = `https://musicbrainz.org/${rel['target-type'].replace(/_/g, '-')}/${rel[rel['target-type']]?.id}`;
                                urlName = rel[rel['target-type']]?.name || rel[rel['target-type']]?.title;
                                break;
                            }
                        }
                    }
                    if (mbUrl) {
                        results.push({ mbUrl, urlName, resource: url.resource });
                        console.log(`${scriptName} %cFound MB id: ${mbUrl} for URL ${url.resource}`, "color: cyan;", "color: magenta; font-style: italic;");
                    }
                }
            } else {
                console.error(`${scriptName} %cError fetching data for URLs: ${response.status} ${response.statusText}`, "color: cyan;", "color: red;");
            }
        }
        return results;
    }

    async function checkArtistLinks() {
        const blackListClasses = ['mini_card'];
        let linkElements = Array.from(document.querySelectorAll('a[href*="genius.com/artists/"]')).filter((element) => element.className.split(" ").every((className) => !blackListClasses.includes(className)));
        console.log(`${scriptName} %cChecking ${linkElements.length} artist links`, "color: cyan;", "color: blue;");
        let urlsToCheck = linkElements ? Array.from(linkElements).map(el => el.href) : [];
        let urlData = await fetchUrls(Array.from(new Set(urlsToCheck)));
        linkElements.forEach(el => {
            let urlInfo = urlData.find(data => data.resource === el.href);
            if (urlInfo && urlInfo.mbUrl) {
                const mbLink = document.createElement('a');
                mbLink.href = urlInfo.mbUrl;
                mbLink.target = "_blank";
                mbLink.innerHTML = `<svg height="1em" width="1em" viewBox="0 0 26 16" class="mbIconLink" style="color: ${document.defaultView.getComputedStyle(el).color || 'inherit'}; display: inline; vertical-align: -0.125em;"><g><path d="m13 1-12 7v14l12 7z" fill="currentColor"/><path d="m14 1 12 7v14l-12 7z" fill="currentColor"/></g></svg>`;
                mbLink.title = `View '${urlInfo.urlName}' on MusicBrainz`;
                mbLink.className = 'mbArtistLink';
                mbLink.appendChild(getMarker());
                el.parentElement.insertBefore(mbLink, el.nextSibling);
                console.log(`${scriptName} %cAdded MB link for artist URL ${el.href}`, "color: cyan;", "color: green;");
            }
        });

    }

    function getMarker() {
        const marker = document.createElement('meta');
        marker.className = 'genius-musicbrainz-buttons-injected';
        return marker;
    }

    function isInjected() {
        return document.querySelector('.genius-musicbrainz-buttons-injected') !== null;
    }

    function setRoutableMarker() {
        const routableParent = document.querySelector('routable-page');
        if (routableParent) {
            const marker = getMarker();
            marker.id='genius-musicbrainz-buttons-routable-marker';
            routableParent.firstElementChild.firstElementChild.appendChild(marker);
        }
    }

    async function runInjector() {
        try {
            if (!isInjected()) {
                console.log(`${scriptName} %cRunning injector`, "color: cyan;", "color: yellow;");
                const { mbUrl, urlName, resource } = await fetchUrl();
                try {
                    injectCss();
                } catch (error) {
                    console.error(`${scriptName} %cError injecting CSS`, "color: cyan;", "color: red;", error);
                }
                if (mbUrl) {
                    try {
                        await injectButtons(mbUrl, urlName);
                    } catch (error) {
                        console.error(`${scriptName} %cError injecting buttons`, "color: cyan;", "color: red;", error);
                    }
                }
                try {
                    await checkArtistLinks();
                } catch (error) {
                    console.error(`${scriptName} %cError injecting artist links`, "color: cyan;", "color: red;", error);
                }
                try {
                    setRoutableMarker();
                } catch (error) {
                    console.error(`${scriptName} %cError setting routable marker`, "color: cyan;", "color: red;", error);
                }
            } else {
                console.log("b")
            }
        } catch (error) {
            console.error(`${scriptName} %cError running script`, "color: cyan;", "color: red;", error);
        }
    }

    function watchRoutableMarker() {
        console.log(`${scriptName} %cWatching page change...`, "color: cyan;", "color: yellow;");
        let watcher = setInterval(async () => {
            if (!document.getElementById('genius-musicbrainz-buttons-routable-marker')) {
                clearInterval(watcher);
                await runInjector();
            }
        }, 100)
    }

    await runInjector();

    const originalPushState = history.pushState;
    history.pushState = function () { //Watching for location changes, since genius is partially react
        originalPushState.apply(this, arguments);
        watchRoutableMarker();
    };
    window.addEventListener("popstate", (event) => { //Watching for the back/forward buttons being used
        watchRoutableMarker();
    });

})();
