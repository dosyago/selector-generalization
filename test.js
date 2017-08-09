"use strict";
{
  const sg = require('./lib.js');
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
    document.addEventListener('click', e => {
      if ( e.target.tagName == 'A' ) {
        e.preventDefault();
      }
      if( e.target.id == 'generalize' ) {
        const sel = sg.generalize( [...set] );
        const found = Array.from( document.querySelectorAll(sel) );
        const result = validate( set, found );
        console.log(" Test result?", result );
        console.log( sel, set, found );
      } else if ( e.target.id == 'clear' ) {
        set.clear();
      } else {
        set.add( e.target );
      }
    });
  }
}
