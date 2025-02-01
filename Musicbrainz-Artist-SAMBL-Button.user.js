// ==UserScript==
// @name         Musicbrainz Artist SAMBL Button
// @description  Adds a SAMBL Button to compatible artists
// @version      2025-2-1.1
// @author       Lioncat6
// @license      MIT
// @namespace    https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @homepageURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @supportURL   https://github.com/Lioncat6/MusicBrainz-UserScripts/issues
// @match        https://musicbrainz.org/artist/*
// @match        https://beta.musicbrainz.org/artist/*
// @icon         https://lioncat6.github.io/SAMBL/assets/images/favicon.svg
// @grant        none
// @downloadURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Musicbrainz-Artist-SAMBL-Button.user.js
// @updateURL     https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Musicbrainz-Artist-SAMBL-Button.user.js
// ==/UserScript==

(function() {
    "use strict";
    let artistName = document.getElementsByClassName("artistheader")[0].getElementsByTagName("h1")[0];
    let mbid = document.location.pathname.split("/artist/")[1].split("/")[0];
    let spIcons = document.getElementsByClassName("spotify-favicon");
    if (spIcons) {
        let spids = "";
        for (let icon of spIcons) {
            let spUrl = icon.getElementsByTagName("a")[0].href;
            if (spUrl.match(/\/artist\/([^/?]+)/)) {
                let spId = spUrl.match(/\/artist\/([^/?]+)/)[1];
                if (spids == "") {
                    spids = spId;
                } else {
                    spids = spids + "," + spId;
                }
            }
        }
        let htmlToInsert = `<a href="https://lioncat6.github.io/SAMBL/artist/?spid=${spids}&artist_mbid=${mbid}" target="_blank"><img src="https://lioncat6.github.io/SAMBL/assets/images/favicon.svg" alt="SAMBL Icon" style="width: 18px; transform: scale(1.8) translate(6px, 2.5px);"></a>`;
        if (spIcons.length > 1) {
            htmlToInsert = `<a href="https://lioncat6.github.io/SAMBL/artist/?spids=${spids}&artist_mbid=${mbid}" target="_blank"><img src="https://lioncat6.github.io/SAMBL/assets/images/favicon.svg" alt="SAMBL Icon" style="width: 18px; transform: scale(1.8) translate(6px, 2.5px);"></a>`;
        }
        artistName.innerHTML = artistName.innerHTML + htmlToInsert;
    }
})();
