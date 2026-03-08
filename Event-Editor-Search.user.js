// ==UserScript==
// @name        Event edit search
// @namespace   Violentmonkey Scripts
// @match       https://musicbrainz.org/event/*/edit*
// @version     1.0
// @author      Lioncat6
// @description 3/7/2026, 9:05:52 PM
// ==/UserScript==

(function () {
    document.addEventListener('keydown', (event) => {
        // Log the key pressed to the console
        console.log(`Key pressed: ${event.key}`);

        // Perform an action based on a specific key
        if (event.key === '@') {
            openSearch(event, true);
        } else if (event.key === '*') {
            openSearch(event, false);
        } else if (event.key === 'Enter') {
            runSearch();
        } else if (event.key === 'Escape') {
            closeSearch();
        }
    });
    injectCSS();
})();

let artistSearch = false;

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
            position: absolute;
            top: 50%;
            left: 50%;
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
        }
        .resultDescription {
            margin-left: 2px;
            color: gray;
        }
    `
    const styleElement = document.createElement('style');
    styleElement.appendChild(document.createTextNode(css));
    document.head.appendChild(styleElement);
}

function runSearch() {

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
        const cursorPosition = checkFocus();
        if (cursorPosition != null) {
            console.log(cursorPosition);
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

function closeSearch() {
    const container = document.getElementById("eventSearchBoxWrapper");
    if (container) {
        container.remove();
    }
}


function injectSearchBox() {
    var container = document.createElement("div");
    container.id = "eventSearchBoxWrapper";
    var background = document.createElement("div");
    background.className = "searchBoxBackground";
    container.appendChild(background);
    var box = document.createElement("div");
    box.id = "eventSearchBox";
    box.className = "eventSearchBox";
    var input = document.createElement("input");
    input.id = "eventSearchInput";
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

function handleSearchResults(results) {
    var results = [];
    results.forEach((result, index) => {
        var result = document.createElement("div");
        result.id = "eventSearchResult_" + index;
        result.className = "eventSearchResult";
        var name = document.createElement("div");
        name.className = "resultName";
        name.innerText = result.name || result.title || "[unkown]";
        result.appendChild(name);
        var description = document.createElement("div");
        description.className = "resultDescription";
        description.innerText = result.disambigation || "";
        result.appendChild(description);
        results.push(result);
    });
}