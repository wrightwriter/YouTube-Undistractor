// ==UserScript==
// @name         Youtube Distraction Toggler
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Plugin, which enables you to choose whether you want to see distractions on YouTube.
// @author       Gug
// @match        https://*.youtube.com/*
// @include      https://youtube.com/*

// @run-at       document-end
// @require      https://gist.githubusercontent.com/raw/2625891/waitForKeyElements.js
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @grant        GM_addStyle
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

const radioButtonOff =
  '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="3.6em" width="3.6em" style="color: rgb(51, 51, 51);"><path d="M256 48C141.601 48 48 141.601 48 256s93.601 208 208 208 208-93.601 208-208S370.399 48 256 48zm0 374.399c-91.518 0-166.399-74.882-166.399-166.399S164.482 89.6 256 89.6 422.4 164.482 422.4 256 347.518 422.399 256 422.399z"></path></svg>';
const radioButtonOn =
  '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="3.6em" width="3.6em" style="color: rgb(51, 51, 51);"><path d="M256 152c-57.2 0-104 46.8-104 104s46.8 104 104 104 104-46.8 104-104-46.8-104-104-104zm0-104C141.601 48 48 141.601 48 256s93.601 208 208 208 208-93.601 208-208S370.399 48 256 48zm0 374.4c-91.518 0-166.4-74.883-166.4-166.4S164.482 89.6 256 89.6 422.4 164.482 422.4 256 347.518 422.4 256 422.4z"></path></svg>';
const buttonColorOff = "#9A5959";
const buttonColorOff_Hover = "#9A5980";
const buttonColorOn = "#599A78";
const buttonColorOn_Hover = "#629A59";

function hideByQuery(targObjQuery) {
  var likeObjArray = document.querySelectorAll(targObjQuery);
  for (var i in likeObjArray) {
    if (
      likeObjArray[i] != undefined &&
      likeObjArray[i].style != undefined &&
      likeObjArray[i].style.display != undefined
    ) {
      likeObjArray[i].style.display = "none";
    }
  }
}
function showByQuery(targObjQuery) {
  var likeObjArray = document.querySelectorAll(targObjQuery);
  for (var i in likeObjArray) {
    if (
      likeObjArray[i] != undefined &&
      likeObjArray[i].style != undefined &&
      likeObjArray[i].style.display != undefined
    ) {
      likeObjArray[i].style.display = "block";
    }
  }
}

(function() {
  "use strict";
  // vars...
  let distractionsAreDisabled;
  // ------------------- BUTTON ---------------------- //
  function onMouseOverButton(button) {
    button.style.cursor = "pointer";
    button.querySelector("svg").style.transform = "scale(1.1)";
    button.querySelector("svg").style.transition = "100ms all ease-out";
    if (distractionsAreDisabled) {
      button.querySelector("svg").style.color = buttonColorOn_Hover;
    } else {
      button.querySelector("svg").style.color = buttonColorOff_Hover;
      button.querySelector("svg").style.transform = "scale(0.9)";
    }
  }
  // initial button style
  function onMouseLeaveButton(button) {
    if (distractionsAreDisabled) {
      button.innerHTML = radioButtonOn;
      button.querySelector("svg").style.color = buttonColorOn;
    } else {
      button.innerHTML = radioButtonOff;
      button.querySelector("svg").style.color = buttonColorOff;
    }
    button.querySelector("svg").style.transition = "100ms all ease-out";
    button.querySelector("svg").style.transform = "scale(1.1)";
    button.classList.add("distraction-toggler");
  }
  async function onMouseDown(button) {
    distractionsAreDisabled = await GM.getValue("distractionsAreDisabled");
    distractionsAreDisabled = !distractionsAreDisabled;
    GM.setValue("distractionsAreDisabled", distractionsAreDisabled);
    if (distractionsAreDisabled) {
      disableDistractions();
    } else {
      enableDistractions();
    }
  }

  function showButton() {
    // create button
    var button = document.createElement("div");
    //.
    onMouseLeaveButton(button);
    //button.style = `border: 1px solid black;`;
    //button.querySelector('svg').style = "width: 32px; height: 32px ; border: 1px solid white;";
    //button.style.width = "100%";
    //button.style.height = "100%";

    button.addEventListener("mouseenter", event => {
      onMouseOverButton(button);
    });
    button.addEventListener("mouseleave", event => {
      onMouseLeaveButton(button);
    });
    button.addEventListener("mousedown", event => {
      if (event.which == 1) {
        onMouseDown(button);
      }
    });
    // add button to html
    if (document.getElementsByClassName("distraction-toggler").length <= 0) {
      document.getElementById("end").appendChild(button);
    }
  }

  // ------------------- DISTRACTION LOGIC ---------------------- //
  function disableDistractions() {
    //        alert("hiding distractions");
    // if history page
    waitForKeyElements(
      'ytd-two-column-browse-results-renderer[page-subtype="history"]',
      jNode => {
        showByQuery(
          'ytd-two-column-browse-results-renderer[page-subtype="history"]'
        );
      }
    );

    // side recommendations
    waitForKeyElements("ytd-watch-next-secondary-results-renderer", jNode => {
      hideByQuery("ytd-watch-next-secondary-results-renderer");
    });
    // comments
    waitForKeyElements("ytd-comments", jNode => {
      hideByQuery("ytd-comments");
    });
    // homepage
    waitForKeyElements(
      'ytd-two-column-browse-results-renderer[page-subtype="home"]',
      jNode => {
        hideByQuery(
          'ytd-two-column-browse-results-renderer[page-subtype="home"]'
        );
      }
    );
  }

  function enableDistractions() {
    location.reload();
  }
  // ------------------- INIT ---------------------- //
  window.onload = async e => {
    distractionsAreDisabled = await GM.getValue("distractionsAreDisabled");
    //        alert(distractionsAreDisabled);
    if (distractionsAreDisabled == true) {
      disableDistractions();
    }
    showButton();
  };
})();
