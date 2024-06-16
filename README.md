# Canvas LMS User scripts
A collection of custom scripts to enhance and extend Canvas LMS functionality. These scripts offer personalized modifications and additional features to improve the user experience. 

## 1. Canvas Course Event Manager

### Function:
- This script enables users to the mass deletion of calendar events in Canvas LMS, allowing users to manage multiple events efficiently. Users have the option to delete all displayed events (up to 100 at a time) or selectively choose which events to delete. It's compatible with Tampermonkey in Chrome and other userscript tools, streamlining calendar management tasks.

### Modified Script:
- This repository contains a modified version of a canvas course event manager.user.js script originally found in [Original Repository](https://github.com/sukotsuchido/CanvasUserScripts).

### What's change:
- Adding $ = unsafeWindow.$ and including jQuery, along with jQuery UI files (jquery-ui.js and jquery-ui.css) via @resource directives, resolved the issue of TypeError: $(...).dialog is not a function when using jQuery UI dialog functionality.
