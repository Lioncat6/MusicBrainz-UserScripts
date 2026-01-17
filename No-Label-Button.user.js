// ==UserScript==
// @name         Edit Release: No Label & No Cat. no Button
// @description  Adds a No Label & No Cat. no button to MusicBrainz release editor
// @version      2026-1-16
// @author       Lioncat6
// @license      MIT
// @namespace    https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @homepageURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @supportURL   https://github.com/Lioncat6/MusicBrainz-UserScripts/issues
// @match        https://musicbrainz.org/release/*/edit
// @match        https://musicbrainz.org/release/add
// @match        https://beta.musicbrainz.org/release/*/edit
// @match        https://beta.musicbrainz.org/release/add
// @icon         https://www.google.com/s2/favicons?sz=64&domain=musicbrainz.org
// @grant        none
// @downloadURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/No-Label-Button.user.js
// @updateURL    https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/No-Label-Button.user.js
// ==/UserScript==


(function() {
    'use strict';

    function addNoLabelButton() {
        const labelRows = document.querySelectorAll('tr:has(label[for^="label-"])');

        labelRows.forEach((row) => {
            const labelCell = row.querySelector('td:first-child');
            if (labelCell.querySelector('.no-label-btn')) return;
            const noLabelButton = document.createElement('button');
            noLabelButton.innerHTML = '<s>Label</s>';
            noLabelButton.title = 'Set Label to [no label]';
            noLabelButton.classList.add('no-label-btn');
            noLabelButton.classList.add('negative');
            noLabelButton.style.cssText = 'font-size: 11px;height: 28px;line-height: 10px;';
            noLabelButton.addEventListener('click', function(e) {
                e.preventDefault();
                const labelInput = document.getElementById("label-0");
                if (labelInput) {
                    labelInput.value = 'https://musicbrainz.org/label/157afde4-4bf5-4039-8ad2-5a15acc85176';
                    //trigger update
                    const inputEvent = new Event('input', { bubbles: true });
                    const changeEvent = new Event('change', { bubbles: true });
                    labelInput.dispatchEvent(inputEvent);
                    labelInput.dispatchEvent(changeEvent);
                }
            });


            const noCatNoButton = document.createElement('button');
            noCatNoButton.innerHTML = '<s>Cat. no</s>';
            noCatNoButton.title = 'Set Catalog Number to [none]';
            noCatNoButton.classList.add('no-label-btn');
            noCatNoButton.classList.add('negative');
            noCatNoButton.style.cssText = 'font-size: 11px;height: 28px;line-height: 10px;'
            noCatNoButton.addEventListener('click', function (e) {
                e.preventDefault();
                const catNoInput = document.getElementById("catno-0");
                if (catNoInput) {
                    catNoInput.value = '[none]';
                    const inputEvent = new Event('input', { bubbles: true });
                    const changeEvent = new Event('change', { bubbles: true });
                    catNoInput.dispatchEvent(inputEvent);
                    catNoInput.dispatchEvent(changeEvent);
                }
            });

            const buttonDiv = document.createElement('div');
            buttonDiv.classList.add('buttons');
            buttonDiv.style.cssText = 'position: absolute;transform: translateY(-22px);display: flex;flex-direction: column;align-items: center;gap: 5px;';
            buttonDiv.append(noLabelButton, noCatNoButton);
            labelCell.insertBefore(buttonDiv, labelCell.firstChild);
        });
    }

    addNoLabelButton();

})();
