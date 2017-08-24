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
    function validate( must_find, found, must_not_find ) {
      found = new Set(found);
      const must_find_ok = [...must_find].every( el => found.has( el ) );
      const must_not_find_ok = [...must_not_find].every( el => ! found.has(el) );
      const okay = must_find_ok && must_not_find_ok;
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

  function run() {
    console.log("Running tests...");
    const neg_set = new Set();
    const set = new Set();
    let found = [];
    document.addEventListener('click', e => {
      if ( e.target.id == 'negate' ) {
        found.forEach( el => {
          el.style.filter = "none";
          el.style.background = "none";
        });
      } else if ( e.target.id == 'any_mode' ) {
        sg.any_mode = e.target.checked;
      } else {
        if ( navigable.has( e.target.tagName ) ) {
          e.preventDefault();
        }
      }
    });
    document.addEventListener('mouseup', e => {
      if( e.target.id == 'generalize' ) {
        const result1 = gen( set, neg_set, found );
        if ( ! result1 ) {
          if ( sg.any_mode ) {
            sg.any_mode = false;
          } else {
            sg.any_mode = true;
          }
          const result2 = gen( set, neg_set, found );
          if ( ! result2 ) {
            console.log("Test result? false");
            show_result( set, neg_set, found );
            return;
          }
        } 
        console.log("Test result? true");
        show_result( set, neg_set, found );
      } else if ( e.target.id == 'clear' ) {
        Array.from( set ).forEach( el => {
          el.style.outline = "none";
        });
        Array.from( neg_set ).forEach( el => {
          el.style.outline = "none";
        });
        found.forEach( el => {
          el.style.filter = "none";
          el.style.background = "none";
        });
        neg_set.clear();
        set.clear();
        negate.checked = false;
        found_count.innerText = 'n/a';
        zero( positive_example_count );
        zero( negative_example_count );
        generalized_selector.innerText = 'n/a';
      } else {
        if ( !( e.target instanceof HTMLElement ) || e.target.matches( 'article#testcontrols, article#testcontrols *' ) ) {
          return;
        }
        if ( negate.checked ) {
          if ( set.has( e.target ) ) {
            set.delete( e.target );
          }
          if ( ! neg_set.has( e.target ) ) {
            neg_set.add( e.target );
            inc( negative_example_count );
          }
        } else {
          if ( neg_set.has( e.target ) ) {
            neg_set.delete( e.target );
          }
          if ( ! set.has( e.target ) ) {
            set.add( e.target );
            inc( positive_example_count );
          }
        }
        if ( e.target.style ) {
          if ( negate.checked ) {
              e.target.style.outline = "2px solid red";
          } else {
              e.target.style.outline = "2px solid lime";
          }
        }
      }
    });
  }
  
  function show_result( set, neg_set, found ) {
    Array.from( set ).forEach( el => {
      el.style.outline = "3px dashed lime";
    });
    Array.from( neg_set ).forEach( el => {
      el.style.outline = "3px dashed red";
    });
    found.forEach( el => {
      el.style.filter = "sepia(1)";
      el.style.background = "lime";
    });
  }

  function gen( set, neg_set, found ) {
    const {positive,negative} = sg.generalize( [...set], [...neg_set] );
    generalized_selector.innerText = `${positive} !(${negative})` || 'n/a';

    found.forEach( el => {
      el.style.filter = "none";
      el.style.background = "none";
    });

    try { 
      found.length = 0;
      found.push( ... Array.from( document.querySelectorAll(positive) ) );
    } catch(e) {
      console.warn(" Error on query selector", e );
      console.warn("Note, MS Edge and IE do not support ':matches' or ':any' as of the time I wrote this code, August 16 2017");
    }

    if ( !!negative ) {
      const remove = new Set( Array.from( document.querySelectorAll(negative) ) );
      const cfound = Array.from(found);
      found.length = 0;
      found.push( ...found.filter( el => ! remove.has( el ) ) );
    }

    found_count.innerText = found.length;
    const result = validate( set, found, neg_set );
    return result;
  }
}

