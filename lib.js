"use strict";
{
  const path_lcs = require('./path_lcs.js');
  const sg = {
    generalize, 
    get_parent,
  };
  // Selector Generalization package entrypoint

  module.exports = sg;

  // helpers ( interface to path_lcs )
    
    function isEl( thing ) {
      return thing instanceof HTMLElement;
    }

    function run_mlcs( sels, options ) {
      const els = sels.map( sel => isEl( sel ) ? sel : document.querySelector(sel) );
      const paths = els.map( el => path_lcs.get_canonical_path( el, options.negation ).canonical );
      const basic = path_lcs.basic_multiple_lcs_from_canonical_path_list( paths );
      const tournament = path_lcs.tournament_multiple_lcs_from_canonical_path_list( paths );
      return { basic, tournament };
    }

  // simplification ( by heuristics )

    function heuristically_simplify_sel( mlcs_sel ) {
      // FIXME: implement
      return mlcs_sel;
    }

  function generalize( sels, {negation:negation = false} = {}) {
    // run mlcs on sels
    const options = { 
      negation
    };
    const mlcs_path = run_mlcs( sels, options );
    const mlcs_sel = path_lcs.selector_from_canonical_path( mlcs_path.tournament );
    const simplified_sel = heuristically_simplify_sel( mlcs_sel );
    return simplified_sel;
  }

  function get_parent( sels ) {
    // return the lowest common parent selector
    // of all the selectors in the set
    const els = gets_els( sels );
    const parent = get_lowest_common_parent( sels );
    const parent_sel = get_sel( parent );
    const simplified_sel = heuristically_simplify_sel( mlcs_sel );
    return simplified_sel;
  }
}
