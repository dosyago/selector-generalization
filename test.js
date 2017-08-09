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
      if( e.target.id == 'generalize' ) {
        const sel = sg.generalize( [...set] );
        found.forEach( el => {
          el.style.filter = "none";
          el.style.background = "none";
        });
        found = Array.from( document.querySelectorAll(sel) );
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
      } else {
        set.add( e.target );
        console.log(e.target.dataset.outline);
        e.target.style.outline = "2px solid lime";
      }
    });
  }
}
