// ==UserScript==
// @name         Edit Release: No Label + No Cat. No Buttons
// @description  Adds "Label" and "Cat. no" strikethrough buttons to MusicBrainz release editor
// @version      2025-2-5
// @author       Lioncat6 (modded by ChatGPT)
// @license      MIT
// @namespace    https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @homepageURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @supportURL   https://github.com/Lioncat6/MusicBrainz-UserScripts/issues
// @match        https://musicbrainz.org/release/*/edit
// @match        https://musicbrainz.org/release/add
// @match        https://beta.musicbrainz.org/release/*/edit
// @match        https://beta.musicbrainz.org/release/add
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addNoLabelAndNoCatNoButtons() {
        const allRows = document.querySelectorAll('tr');
        const labelRows = Array.from(allRows).filter(row => {
            const label = row.querySelector('label[for^="label-"]');
            return label && row.querySelector('td:first-child');
        });

        labelRows.forEach((row) => {
            const labelCell = row.querySelector('td:first-child');
            if (labelCell.querySelector('.no-label-btn')) return;

            // Label button
            const noLabelButton = document.createElement('button');
            noLabelButton.innerHTML = '<s>Label</s>';
            noLabelButton.classList.add('no-label-btn', 'negative');
            noLabelButton.style.cssText = 'font-size: 11px;height: 22px;line-height: 10px;margin-right: 4px;padding: 2px 6px;';
            noLabelButton.addEventListener('click', function (e) {
                e.preventDefault();
                const labelInput = document.getElementById("label-0");
                if (labelInput) {
                    labelInput.value = 'https://musicbrainz.org/label/157afde4-4bf5-4039-8ad2-5a15acc85176';
                    labelInput.dispatchEvent(new KeyboardEvent('keydown', {
                        key: '', bubbles: true, cancelable: true
                    }));
                }
            });

            // Cat. no button
            const noCatNoButton = document.createElement('button');
            noCatNoButton.innerHTML = '<s>Cat. no</s>';
            noCatNoButton.classList.add('no-catno-btn', 'negative');
            noCatNoButton.style.cssText = 'font-size: 11px;height: 22px;line-height: 10px;padding: 2px 6px;';
            noCatNoButton.addEventListener('click', function (e) {
                e.preventDefault();
                const catNoInput = document.getElementById("catno-0");
                if (catNoInput) {
                    catNoInput.value = '[none]';
                    catNoInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });

            const buttonDiv = document.createElement('div');
            buttonDiv.classList.add('buttons');
            buttonDiv.style.cssText = 'position: absolute; transform: translateY(-6px);';
            buttonDiv.append(noLabelButton, noCatNoButton);
            labelCell.insertBefore(buttonDiv, labelCell.firstChild);
        });
    }

    window.addEventListener('load', addNoLabelAndNoCatNoButtons);
})();
