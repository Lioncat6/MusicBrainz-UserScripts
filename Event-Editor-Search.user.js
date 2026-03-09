// ==UserScript==
// @name        MusicBrainz event setlist search
// @namespace   Violentmonkey Scripts
// @match       https://musicbrainz.org/event/*/edit*
// @match       https://beta.musicbrainz.org/event/*/edit*
// @match       https://test.musicbrainz.org/event/*/edit*
// @match       https://musicbrainz.org/event/create*
// @match       https://beta.musicbrainz.org/event/create*
// @match       https://test.musicbrainz.org/event/create*
// @namespace    https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @homepageURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @supportURL   https://github.com/Lioncat6/MusicBrainz-UserScripts/issues
// @version     03-09-2026.1
// @author      Lioncat6
// @license      CC-NC
// @description Search for entities in the musicbrainz event setlist editor
// @downloadURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Event-Editor-Search.user.js
// @updateURL     https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Event-Editor-Search.user.js
// ==/UserScript==

(function () {
    document.addEventListener('keydown', (event) => {
        if (event.key === '@') {
            openSearch(event, true);
        } else if (event.key === '*') {
            openSearch(event, false);
        } else if (event.key === 'Enter') {
            handleEnter();
        } else if (event.key === 'ArrowDown') {
            selectResult();
        } else if (event.key === 'ArrowUp') {
            selectResult(true);
        } else if (event.key === 'Escape') {
            closeSearch();
        }
    });
    injectCSS();
})();

let artistSearch = false;

let selectedResultIndex = null;
/**
 * @type ({name: string, mbid: string} | null)
 */
let selectedResult = null; // {name, mbid}

let cursorPosition = 0;

let prevQuery = null;

function injectCSS() {
    const css = `
        .searchBoxBackground {
            background: #00000087;
            width: 100%;
            height: 100%;
            position: absolute;
            z-index: 9;
            top: 0;
            left: 0;
        }
        .eventSearchBox {
            display: flex;
            z-index: 10;
            flex-direction: column;
        }
        .eventSearchResults {
            background: #fff;
            z-index: -1;
        }
        .eventSearchResult {
            display: flex;
            padding: 2px;
            border: 2px solid gray;
            align-items: center;
        }
        .resultDescription {
            margin-left: 6px;
            font-size: smaller;
            color: gray;
        }
        .resultName {
            color: black;
        }
        .eventSearchResult.selected {
            border: 4px solid green;
        }
        .eventSearchInput {
            font-size: large;
        }
        .eventSearchBoxWrapper {
            width: 100%;
            height: 100%;
            display: flex;
            position: absolute;
            top: 0;
            left: 0;
            justify-content: center;
            align-content: center;
            align-items: center;
        }
    `
    const styleElement = document.createElement('style');
    styleElement.appendChild(document.createTextNode(css));
    document.head.appendChild(styleElement);
}

function selectResult(up = false) {
    if (checkFocus(true)) {
        const resultsArea = document.getElementById("eventSearchResults");
        let results = resultsArea?.childNodes || [];
        if (results.length > 0) {
            if (selectedResultIndex == null) {
                selectedResultIndex = 0;
            } else if (up) {
                if (selectedResultIndex - 1 < 0) {
                    selectedResultIndex = results.length - 1
                } else {
                    selectedResultIndex--;
                }
            } else {
                if (selectedResultIndex + 1 > results.length - 1) {
                    selectedResultIndex = 0;
                } else {
                    selectedResultIndex++;
                }
            }
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                if (i == selectedResultIndex) {
                    result.className = "eventSearchResult selected";
                    let name = result.dataset.name;
                    let mbid = result.dataset.mbid;
                    selectedResult = { name: name, mbid: mbid }
                } else {
                    result.className = "eventSearchResult";
                }
            }
        }
    }
}

function handleEnter() {
    const searchBoxInput = document.getElementById("eventSearchInput");
    const query = searchBoxInput ? searchBoxInput.value : null;
    if (checkFocus(true)) {
        if (selectedResultIndex != null && selectedResult != null && query == prevQuery) {
            closeSearch(false);
            const setListInput = document.getElementById("id-edit-event.setlist");
            if (setListInput) {
                let setList = setListInput.value || "";
                let creditString = `${artistSearch ? "@" : "*"} [${selectedResult.mbid}|${selectedResult.name}]`
                setListInput.value = setList.substring(0, cursorPosition) + creditString + setList.substring(cursorPosition)
            }
            selectedResult = null;
            selectedResultIndex = null;
        } else {
            prevQuery = query;
            const regex = /musicbrainz\.org\/([a-z\-]+)\/([0-9a-fA-F\-]{36})/;
            const match = query.match(regex);
            if (match) {
                lookupEntity(match[1], match[2]).then((result) => {
                    if (result){
                        handleSearchResults(result);
                    }
                })
            } else {
                runSearch(query).then((results) => {
                    if (results) {
                        handleSearchResults(results);
                    }
                });
            }
            
        }
    }
}

async function lookupEntity(type, id) {
    console.log(`Looking up ${type} ${id}`)
    if (!type || !id) return null;
    if (type == "artist") {
        artistSearch = true;
    } else if (type ==  "work"){
        artistSearch = false;
    } else {
        console.log(type)
        window.alert("Only artist and work URLs are supported here!")
        return null;
    }
    let url = `https://musicbrainz.org/ws/2/${type}/${id}?fmt=json&inc=artist-rels`
    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    } else {
        console.error(response.statusText);
        return null;
    }
}

async function runSearch(query) {
    if (!query) {
        return null;
    }
    console.log("Running query for " + query)
    let url = `https://musicbrainz.org/ws/2/${artistSearch ? "artist" : "work"}?query=${query}&fmt=json`
    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    } else {
        console.error(response.statusText);
        return null;
    }
}

function checkFocus(searchBox = false) {
    if (searchBox) {
        const searchBoxInput = document.getElementById("eventSearchInput");
        if (searchBoxInput) {
            if (document.activeElement == searchBoxInput) {
                return true;
            }
        }
        return null;
    }
    const setListInput = document.getElementById("id-edit-event.setlist");
    if (setListInput) {
        if (document.activeElement == setListInput) {
            return setListInput.selectionStart;
        }
    }
    return null;
}

function focusSearch() {
    const input = document.getElementById("eventSearchInput");
    if (input) {
        input.focus();
    }
}

function openSearch(event, isArtist) {
    artistSearch = isArtist
    if (!isInjected()) {
        const focusPosition = checkFocus();
        if (focusPosition != null) {
            cursorPosition = focusPosition;
            event.preventDefault();
            injectSearchBox();
            focusSearch();
        }
    }
}

function isInjected() {
    const container = document.getElementById("eventSearchBoxWrapper");
    return (container != undefined && container != null);
}

function closeSearch(hitEscape = true) {
    const searchBoxInput = document.getElementById("eventSearchInput");
    const query = searchBoxInput ? searchBoxInput.value : "";
    const container = document.getElementById("eventSearchBoxWrapper");
    if (container) {
        container.remove();
    }
    const setListInput = document.getElementById("id-edit-event.setlist");
    if (setListInput && hitEscape) {
        let setList = setListInput.value || "";
        let creditString = `${artistSearch ? "@" : "*"} ${query}`
        setListInput.value = setList.substring(0, cursorPosition) + creditString + setList.substring(cursorPosition)
    }
    setListInput.focus();
}


function injectSearchBox() {
    var container = document.createElement("div");
    container.id = "eventSearchBoxWrapper";
    container.className = "eventSearchBoxWrapper";
    var background = document.createElement("div");
    background.className = "searchBoxBackground";
    container.appendChild(background);
    var box = document.createElement("div");
    box.id = "eventSearchBox";
    box.className = "eventSearchBox";
    var input = document.createElement("input");
    input.id = "eventSearchInput";
    input.className = "eventSearchInput";
    box.appendChild(input);
    var results = document.createElement("div");
    results.id = "eventSearchResults";
    results.className = "eventSearchResults";
    box.appendChild(results);
    container.appendChild(box);
    document.body.appendChild(container);
}

function search() {

}

function clearSearchResults() {
    var results = document.getElementById("eventSearchResults");
    if (results) {
        results.innerHTML = "";
    }
}

function handleSearchResults(searchJson) {
    selectedResult = null;
    selectedResultIndex = null;
    clearSearchResults();
    let rawObjects = [];
    if (searchJson.artists) {
        rawObjects = searchJson.artists;
    } else if (searchJson.works) {
        rawObjects = searchJson.works;
    } else {
        rawObjects = [searchJson];
    }
    var results = [];
    rawObjects.forEach((result, index) => {
        let artistString = ""
        if (!artistSearch) {
            let artists = [];
            result.relations?.forEach(relation => {
                if ((relation.type == "composer" || relation.type == "lyricist" || relation.type == "writer") && relation.artist) {
                    artists.push(relation.artist.name);
                }
            })
            artistString = [... new Set(artists)].join(", ");
        }
        var resultBox = document.createElement("div");
        resultBox.id = "eventSearchResult_" + index;
        resultBox.className = "eventSearchResult";
        resultBox.dataset.name = result.name || result.title || "[unkown]";
        resultBox.dataset.description = result.disambiguation || "";
        resultBox.dataset.mbid = result.id || null;
        var name = document.createElement("a");
        name.className = "resultName";
        name.innerText = result.name || result.title || "[unkown]";
        name.href = `https://musicbrainz.org/${artistSearch ? "artist" : "work"}/${result.id}`
        name.target = "_blank"
        resultBox.appendChild(name);
        var description = document.createElement("div");
        description.className = "resultDescription";
        description.innerText = `${artistString ? artistString + " " : ""}${result.disambiguation || ""}`;
        resultBox.appendChild(description);
        results.push(resultBox);
    });
    var resultsArea = document.getElementById("eventSearchResults");
    results.forEach((result) => {
        resultsArea.appendChild(result)
    })
}