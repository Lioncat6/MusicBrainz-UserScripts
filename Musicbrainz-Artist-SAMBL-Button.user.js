// ==UserScript==
// @name         Musicbrainz Artist SAMBL Button
// @description  Adds a SAMBL Button to compatible artists
// @version      2025-9-12
// @author       Lioncat6
// @license      MIT
// @namespace    https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @homepageURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @supportURL   https://github.com/Lioncat6/MusicBrainz-UserScripts/issues
// @match        https://musicbrainz.org/artist/*
// @match        https://beta.musicbrainz.org/artist/*
// @icon         https://sambl.lioncat6.com/assets/images/favicon.svg
// @grant        none
// @downloadURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Musicbrainz-Artist-SAMBL-Button.user.js
// @updateURL     https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Musicbrainz-Artist-SAMBL-Button.user.js
// ==/UserScript==

(function() {
    "use strict";
    let artistName = document.getElementsByClassName("artistheader")[0].getElementsByTagName("h1")[0];
    let mbid = document.location.pathname.split("/artist/")[1].split("/")[0];
    let externalLinks = document.getElementsByClassName("external_links")[0];
    if (externalLinks) {
        
    }
    let htmlToInsert = `<a href="${url}" target="_blank"><img src="https://sambl.lioncat6.com/assets/images/favicon.svg" alt="SAMBL Icon" style="width: 18px; transform: scale(1.8) translate(6px, 2.5px);"></a>`;
    artistName.innerHTML = artistName.innerHTML + htmlToInsert;
})();
