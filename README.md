# :mag: [selector-generalization](https://github.com/crislin2046/selector-generalization) [![version](https://img.shields.io/npm/v/selector-generalization.svg?label=&color=0080FF)](https://github.com/crislin2046/selector-generalization/releases/latest) ![npm downloads](https://img.shields.io/npm/dt/selector-generalization)

JavaScript utils to generalize a set of CSS selectors to a single selector that matches them all. Useful for mapping the structure of web apps. 

I developed this algorithm in 2013 but only recently open sourced it.

[Live demo: https://cris691.github.io/selector-generalization/](https://cris691.github.io/selector-generalization/)

## running the test

If you haven't install beefy and browserify ( just for convenience, to serve the test page )

`npm install -g browserify beefy`

Then go to the directory where you checked out this code and run it

`beefy test.js 8080`

You can then visit `http://<your ip | localhost>:8080` in your browser ( the page was tested in Chrome )

Open console / devtools on that page to get a view of what's happening. 

Then to add some elements to the set of examples, just click on them ( don't worry, links won't navigate ). 
When you want to see the generalized selector, click 'generalize'
When you want to clear the example set, click 'clear'

If you notice something weird, open an issue! :thumbsup: 

## Dev Notes

- *Thursday August 27 2020* 
 - Updated packaging and test scripts
 - Pushed live test demo to a github site
- *Wednesday August 16 2017*
 - All the current open issues are improvements. Some of improvements to `:any` and others are just improvements.
 - None of these currently can be done because:
  1. I need to think more about `:any` and
  2. The other improvements either need to be thought more about as well, or depend on some human interface element being made,
  (for example), the composition issue
