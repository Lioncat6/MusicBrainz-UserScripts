// ==UserScript==
// @name         Musicbrainz Artist SAMBL Button
// @description  Adds a SAMBL Button to compatible artists
// @version      2024-11-03
// @author       Lioncat6
// @namespace    https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @homepageURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @supportURL   https://github.com/Lioncat6/MusicBrainz-UserScripts/issues
// @downloadURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Musicbrainz-Artist-SAMBL-Button.js
// @updateURL    https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Musicbrainz-Artist-SAMBL-Button.js
// @match        https://musicbrainz.org/artist/*
// @icon         https://lioncat6.github.io/SAMBL/assets/images/favicon.svg
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    let artistName = document.getElementsByClassName("artistheader")[0].getElementsByTagName("h1")[0]
    let mbid = document.location.href.split("/").pop()
    let spIcon = document.getElementsByClassName("spotify-favicon")[0]
    if (spIcon){
        let spUrl = spIcon.getElementsByTagName('a')[0].href
        let spId = spUrl.match(/\/artist\/([^/?]+)/)[1];
        let htmlToInsert = `<a href="https://lioncat6.github.io/SAMBL/artist/?spid=${spId}&artist_mbid=${mbid}"><img src="https://lioncat6.github.io/SAMBL/assets/images/favicon.svg" alt="SAMBL Icon" style="width: 18px; transform: scale(1.8) translate(6px, 2.5px);"></a>`
        artistName.innerHTML = artistName.innerHTML+htmlToInsert
    } 
    
})();
