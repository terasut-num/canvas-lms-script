# Canvas LMS User scripts
A collection of custom scripts to enhance and extend Canvas LMS functionality. These scripts offer personalized modifications and additional features to improve the user experience. 

## 1. Canvas Course Event Manager

### Function:
- This script enables users to the mass deletion of calendar events in Canvas LMS, allowing users to manage multiple events efficiently. Users have the option to delete all displayed events (up to 100 at a time) or selectively choose which events to delete. It's compatible with Tampermonkey in Chrome and other userscript tools, streamlining calendar management tasks.

### Modified Script:
- This repository contains a modified version of a canvas course event manager.user.js script originally found in [Original Repository](https://github.com/sukotsuchido/CanvasUserScripts).

### What's change:
- Adding $ = unsafeWindow.$ and including jQuery, along with jQuery UI files (jquery-ui.js and jquery-ui.css) via @resource directives, resolved the issue of TypeError: $(...).dialog is not a function when using jQuery UI dialog functionality.

## 2. Canvas Student Navigation in Assignment Page

### Function:
- This script can be used as a substitute for grading through the SpeedGrader system. On the Assignment page, there will be a link called "Go to First Student Submission (Grader)." When you click on it, you'll be taken to a submission system that includes a dropdown menu, allowing you to select the name of the student whose assignment you want to review, grade, or provide feedback on. It's compatible with Tampermonkey in Chrome and other userscript tools.
