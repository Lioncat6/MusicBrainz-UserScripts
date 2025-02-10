// ==UserScript==
// @name         MB Release Edit Seeding Helper
// @namespace    https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @homepageURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/
// @supportURL   https://github.com/Lioncat6/MusicBrainz-UserScripts/issues
// @match        https://musicbrainz.org/release/*/edit*
// @match        https://test.musicbrainz.org/release/*/edit*
// @match        https://beta.musicbrainz.org/release/*/edit*
// @grant        none
// @version      2/10/2025
// @author       Lioncat6
// @license      MIT
// @description  Enables the seeding of MusicBrainz release editor fields via URL parameters. Fixes MBS-13688
// @icon         https://www.google.com/s2/favicons?sz=64&domain=musicbrainz.org
// @downloadURL  https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Seeding-Helper.user.js
// @updateURL    https://github.com/Lioncat6/MusicBrainz-UserScripts/raw/main/Seeding-Helper.user.js
// ==/UserScript==

(function () {
	"use strict";
	const maxAddedFields = 10;
	async function updateFields() {
		console.log("%c||MB Release Seeding Helper • Lioncat6||", "color: cyan;");
        console.log("%c||Version 2/9/2025||", "color: cyan;");
        console.log("%c||Report issues at: https://github.com/Lioncat6/MusicBrainz-UserScripts/issues||", "color: cyan;");
		const urlParams = new URLSearchParams(window.location.search);
		urlParams.forEach(async (value, key) => {
			try {
				let field = document.getElementById(key);
				if (field) {
					try {
						setInputValue(field, value);
					} catch (error) {
						field.value = value;
					}
					bumpField(field);
					foundField(key, value);
				} else if (key.startsWith("events.")) {
					const parts = key.split(".");
					const eventNumber = parts[1];
					let yearField = document.getElementById("event-date-" + eventNumber);
					let added = 0;
					while (!yearField && added < maxAddedFields) {
						// Limit added fields to avoid infinite loop
						addNewReleaseEvent();
						yearField = document.getElementById("event-date-" + eventNumber);
						added++;
					}
					if (key.includes(".date")) {
						if (yearField) {
							let monthField = yearField.nextElementSibling;
							let dayField = monthField.nextElementSibling;
							if (key.endsWith(".year")) {
								setInputValue(yearField, value);
								bumpField(yearField);
								foundField(key, value);
							} else if (key.endsWith(".month")) {
								setInputValue(monthField, value);
								bumpField(monthField);
								foundField(key, value);
							} else if (key.endsWith(".day")) {
								setInputValue(dayField, value);
								bumpField(dayField);
								foundField(key, value);
							}
						} else {
							fieldNotFound(key);
						}
					} else if (key.endsWith(".country")) {
						let countryField = document.getElementById("country-" + eventNumber);
						if (countryField) {
							countryField.value = value;
							bumpField(countryField);
							foundField(key, value);
						} else {
							fieldNotFound(key);
						}
					}
				} else if (key.startsWith("labels.")) {
					const parts = key.split(".");
					const labelNumber = parts[1];
					let labelField = document.getElementById("label-" + labelNumber);
					let catnoField = document.getElementById("catno-" + labelNumber);
					let added = 0;
					while ((!labelField || !catnoField) && added < maxAddedFields) {
						// Limit added fields to avoid infinite loop
						addNewReleaseLabel();
						labelField = document.getElementById("label-" + labelNumber);
						catnoField = document.getElementById("catno-" + labelNumber);
						added++;
					}
					if (key.endsWith(".name")) {
						if (labelField && !labelField.value) {
							labelField.value = value;
							bumpField(labelField);
							foundField(key, value);
						} else if (labelField && labelField.value) {
							console.log("%c||Label name already set, skipping: " + key + " to avoid overwriting MBID||", "color: yellow;");
						} else {
							fieldNotFound(key);
						}
					} else if (key.endsWith(".mbid")) {
						if (labelField) {
							labelField.value = value;
							bumpField(labelField);
							foundField(key, value);
						} else {
							fieldNotFound(key);
						}
					} else if (key.endsWith(".catalog_number")) {
						if (catnoField) {
							catnoField.value = value;
							bumpField(catnoField);
							foundField(key, value);
						} else {
							fieldNotFound(key);
						}
					}
				} else if (key.startsWith("artist_credit.names")) {
					const parts = key.split(".");
					const nameNumber = parts[2];
					await openArtistEditMenu();
					let artistField = await document.getElementById("ac-source-artist-" + nameNumber);
					let added = 0;
					while (!artistField && added < maxAddedFields) {
						// Limit added fields to avoid infinite loop
						await addNewArtist();
						artistField = await document.getElementById("ac-source-artist-" + nameNumber);
						added++;
					}
					if (key.endsWith(".mbid") || key.endsWith("artist.name")) {
						let nameField = document.getElementById("ac-source-artist-" + nameNumber);
						if (nameField) {
							setInputValue(nameField, value);
							bumpField(nameField);
							foundField(key, value);
						} else {
							fieldNotFound(key);
						}
					} else if (key.endsWith(".name")) {
						let creditedAsField = document.getElementById("ac-source-credited-as-" + nameNumber);
						if (creditedAsField) {
							setInputValue(creditedAsField, value);
							bumpField(creditedAsField);
							foundField(key, value);
						} else {
							fieldNotFound(key);
						}
					} else if (key.endsWith(".join_phrase")) {
						let joinPhraseField = document.getElementById("ac-source-join-phrase-" + nameNumber);
						if (joinPhraseField) {
							setInputValue(joinPhraseField, value);
							bumpField(joinPhraseField);
							foundField(key, value);
						} else {
							fieldNotFound(key);
						}
					}
				} else if (key.startsWith("urls.")) {
                    const parts = key.split(".");
                    const urlNumber = parts[1];
                    let externalLinksEditor = document.getElementById("external-links-editor-container");
                    if (externalLinksEditor) {
                        if (key.endsWith(".url")) {
                            waitForInputs(externalLinksEditor, (inputs) => {
                                let inputsArray = Array.from(inputs);
                                let lastInput = inputsArray[inputsArray.length - 1];
                                if (lastInput) {
                                    setInputValue(lastInput, value);
                                    bumpField(lastInput);
                                    foundField(key, value);
                                    console.log("%c||Modifying existing urls is not supported yet; Added as a new URL||", "color: purple;");
                                } else {
                                    fieldNotFound(key);
                                }
                            });
                        } else if (key.endsWith(".link_type")) {
                            console.log("%c||Link type field not supported yet||", "color: purple;");
                        }
                    } else {
						fieldNotFound(key);
					}
				} else if (key.startsWith("mediums.")) { 
                    // const parts = key.split(".");
                    // const mediumNumber = parts[1];
                    // if (parts.length > 3) {
                    //     const trackNumber = parts[3];
                    //     let trackField = document.getElementById("mediums." + mediumNumber + ".tracks." + trackNumber + ".name");
                    //     if (trackField) {
                    //         trackField.value = value;
                    //         bumpField(trackField);
                    //         foundField(key, value);
                    //     } else {
                    //         fieldNotFound(key);
                    //     }
                    // }
                    console.log("%c||Mediums fields not supported yet||", "color: purple;");
                } else if(key == "edit_note") {

                    let editNoteField = await document.getElementById("edit-note-text");
                    if (editNoteField) {
                        setTextInputValue(editNoteField, value);
                        bumpField(editNoteField);
                        foundField(key, value);
                    } else {
                        fieldNotFound(key);
                    }
                } else if(key == 'redirect_uri') {
                    console.log("%c||Redirect URI field not supported yet||", "color: purple;");
                    
                }else {
					fieldNotFound(key);
				}
			} catch (error) {
				console.log("%c||Error: " + error + "||", "color: red;");
			}
		});
		await closeArtistEditMenu();
	}

	function addNewReleaseEvent() {
		const addButton = document.querySelector('button.with-label.add-item[data-click="addReleaseEvent"]');
		if (addButton) {
			addButton.click();
			console.log("%c||Added new release event||", "color: blue;");
		}
	}

	function addNewReleaseLabel() {
		const addButton = document.querySelector('button.with-label.add-item[data-click="addReleaseLabel"]');
		if (addButton) {
			addButton.click();
			console.log("%c||Added new label||", "color: blue;");
		}
	}

	function openArtistEditMenu() {
		const openButton = document.getElementsByClassName("open-ac")[0];
		if (openButton) {
			openButton.click();
			console.log("%c||Opening artist credit menu||", "color: pink;");
		}
	}

    function waitForInputs(container, callback) {
        const observer = new MutationObserver((mutations, obs) => {
            const inputs = container.getElementsByTagName("input");
            if (inputs.length > 0) {
                obs.disconnect(); // Stop observing once the inputs are found
                callback(inputs);
            }
        });
    
        observer.observe(container, {
            childList: true,
            subtree: true
        });
    
        // Initial check in case the inputs are already in the DOM
        const inputs = container.getElementsByTagName("input");
        if (inputs.length > 0) {
            observer.disconnect(); // Stop observing if the inputs are already in the DOM
            callback(inputs);
        }
    }

	function setInputValue(input, value) {
		if (!input || input.disabled) {
			return;
		}
		const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
		nativeInputValueSetter.call(input, value);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	}


    function setTextInputValue(input, value) {
        if (!input || input.disabled) {
            return;
        }
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(input.constructor.prototype, "value").set;
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }

	async function closeArtistEditMenu() {
		const pasteButton = await document.getElementById("paste-ac");
		if (pasteButton) {
			const closeButton = pasteButton.nextElementSibling;
			if (closeButton) {
				closeButton.click();
				console.log("%c||Closed artist credit menu||", "color: pink;");
			}
		}
	}

	function addNewArtist() {
		// openArtistEditMenu();
		const acWindow = document.getElementById("artist-credit-bubble");
		const addButton = acWindow.querySelector("button.add-item.with-label");
		if (addButton && addButton.textContent.trim() === "Add artist credit") {
			addButton.click();
			console.log("%c||Added new artist||", "color: blue;");
		}
	}

	function bumpField(field) {
		const event = new KeyboardEvent("keydown", {
			key: "",
			bubbles: true,
			cancelable: true,
		});
		field.dispatchEvent(event);
	}

	function fieldNotFound(key) {
		console.log("%c||Field not found: " + key + "||", "color: orange;");
	}

	function foundField(key, value) {
		console.log("%c||Found field: " + key + " | Set Value: " + value + "||", "color: green;");
	}

	window.addEventListener("load", async function () {
		await updateFields();
	});
})();
