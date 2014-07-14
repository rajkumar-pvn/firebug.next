/* See license.txt for terms of usage */

"use strict";

var self = require("sdk/self");

const { Cu, Ci } = require("chrome");
const { Trace } = require("../core/trace.js");
const { loadSheet } = require("sdk/stylesheet/utils");
const { Class } = require("sdk/core/heritage");
const { Xul } = require("../core/xul.js");
const { Locale } = require("../core/locale.js");
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { emit } = require("sdk/event/core");
const { BaseOverlay } = require("../chrome/baseOverlay.js");

// XUL Builder
const { RADIO } = Xul;

/**
 * @overlay TODO: description
 */
const OptionsOverlay = Class(
/** @lends OptionsOverlay */
{
  extends: BaseOverlay,

  // Initialization
  initialize: function(options) {
    Trace.sysout("optionsOverlay.initialize;", options);
  },

  onReady: function(options) {
    Trace.sysout("optionsOverlay.onReady;", options);

    let panel = options.panel;
    let doc = panel.panelWin.document;
    let win = doc.documentElement;

    // xxxHonza: Theme light should be removed eventually
    //doc.documentElement.classList.remove("theme-light");
    doc.documentElement.classList.add("theme-firebug");

    // Define template for new <radio> button: "Firebug theme".
    var radio = RADIO({
      "class": "",
      "value": "firebug",
      "label": Locale.$STR("options.label.firebugTheme")
    });

    // Render the button.
    radio.build(doc.getElementById("devtools-theme-box"));

    // xxxDjalil handle theme switch event and apply/un-apply all styles
    // applying means setting the "theme-firebug" class in all toolbox
    // iframes. If we build Firebug theme on top of the Light theme
    // we might want to keep the "theme-light" class name.
    // See also:
    // http://dxr.mozilla.org/mozilla-central/source/browser/devtools/shared/theme-switching.js

    let optionsStylesUrl = "chrome://firebug/skin/options.css";
    loadSheet(panel.panelWin, optionsStylesUrl, "author");
    
    gDevTools.on("pref-changed", (ev, data) => {
      if (data.pref === "devtools.theme") {
        loadSheet(panel.panelWin,
          "chrome://firebug/skin/toolbars.css", "author");

        // List of styles to load
        let styles = [
          "toolbox.css",
          "toolbars.css",
          "buttons.css",
          "splitter.css",
          "searchbox.css",
          "tabmenu.css",
        ];
        
        // Apply firebug theme styles to the toolbox
        for (var style of styles) {
          var url = "chrome://firebug/skin/" + style;
          loadSheet(panel.panelWin, url, "author");
        }

        doc.documentElement.classList.remove("theme-" + data.oldValue);
        doc.documentElement.classList.add("theme-firebug");
      }
      
      emit(this, "pref-changed", data.pref, data.newValue, data.oldValue);
    });

    // xxxDjalil: we should also use common styles for toolbars.
    //loadSheet(options.panelWin,
    //  "chrome://firebug/skin/toolbars.css", "author");
  },

  destroy: function() {
  },
});

// Exports from this module
exports.OptionsOverlay = OptionsOverlay;