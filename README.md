# selector-generalization

JavaScript utils to generalize a set of CSS selectors to a single selector that matches them all. Useful for mapping the structure of web apps.

## running the test

If you haven't install beefy and browserify

`npm install -g browserify beefy`

Then go to the directory where you checked out this code and run it

`beefy test.js 8080`

You can then visit `http://<your ip | localhost>:8080` in your browser ( the page was tested in Chrome )

Open console / devtools on that page to get a view of what's happening. 

Then to add some elements to the set of examples, just click on them ( don't worry, links won't navigate ). 
When you want to see the generalized selector, click 'generalize'
When you want to clear the example set, click 'clear'

If you notice something weird, open an issue! :thumbsup: 
