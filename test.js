"use strict";
{
  const sg = require('./lib.js');
  const navigable = new Set([
    'A',
    'BUTTON'
  ]);
  const test = {
    run
  };

  module.exports = test;

  Object.assign( self, { test } );

  // one possible test
  function validate( must_find, found ) {
    found = new Set(found);
    const okay = [...must_find].every( el => found.has( el ) );
    return okay;
  }

  // helpers

    function inc( el ) {
      const n = parseFloat( el.innerText );
      el.innerText = n + 1;
    }

    function zero( el ) {
      el.innerText = 0;
    }
  // we could also make another test that tests if it 
  // somehow not too general 
  function run() {
    console.log("Running tests...");
    const set = new Set();
    let found = [];
    document.addEventListener('click', e => {
      if ( navigable.has( e.target.tagName ) ) {
        e.preventDefault();
      }
    });
    document.addEventListener('mouseup', e => {
      if( e.target.id == 'generalize' ) {
        const negation = negate.checked;
        console.log('neg', negation);
        const sel = sg.generalize( [...set], { negation } );
        generalized_selector.innerText = sel || 'n/a';
        found.forEach( el => {
          el.style.filter = "none";
          el.style.background = "none";
        });
        found = Array.from( document.querySelectorAll(sel) );
        found_count.innerText = found.length;
        const result = validate( set, found );
        console.log(" Test result?", result );
        console.log( sel, set, found );
        Array.from( set ).forEach( el => {
          el.style.outline = "3px dashed lime";
        });
        found.forEach( el => {
          el.style.filter = "sepia(1)";
          el.style.background = "lime";
        });
      } else if ( e.target.id == 'clear' ) {
        Array.from( set ).forEach( el => {
          el.style.outline = "none";
        });
        found.forEach( el => {
          el.style.filter = "none";
          el.style.background = "none";
        });
        set.clear();
        found_count.innerText = 'n/a';
        zero( positive_example_count );
        zero( negative_example_count );
        generalized_selector.innerText = 'n/a';
      } else {
        if ( e.target.matches( 'article#testcontrols, article#testcontrols *' ) ) {
          return;
        }
        set.add( e.target );
        if ( negate.checked ) {
          inc( negative_example_count );
        } else {
          inc( positive_example_count );
        }
        console.log(e.target.dataset.outline);
        e.target.style.outline = "2px solid lime";
      }
    });
  }
}
