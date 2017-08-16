"use strict";
{
  const path_lcs = require('./path_lcs.js');
  const sg = {
    generalize, 
    get_parent,
    set any_mode( mode ) {
      path_lcs.any_mode = mode;
    }
  };
  // Selector Generalization package entrypoint

  module.exports = sg;

  // helpers ( interface to path_lcs )
    
    function isEl( thing ) {
      return thing instanceof HTMLElement;
    }

    function run_mlcs( p_sels, n_sels ) {
      const p_els = p_sels.map( sel => isEl( sel ) ? sel : document.querySelector(sel) );
      const n_els = n_sels.map( sel => isEl( sel ) ? sel : document.querySelector(sel) );
      const p_paths = p_els.map( el => path_lcs.get_canonical_path( el, false ).canonical );
      const n_paths = n_els.map( el => path_lcs.get_canonical_path( el, true ).canonical );
      const p_basic = path_lcs.basic_multiple_lcs_from_canonical_path_list( p_paths );
      const n_basic = path_lcs.basic_multiple_lcs_from_canonical_path_list( n_paths );
      return { p_basic, n_basic };
    }

  // simplification ( by heuristics )

    function heuristically_simplify_sel( mlcs_sel ) {
      // FIXME: implement
      return mlcs_sel;
    }

  // FIXME: implement issue #10 fully
    // for now we just take 1 list of positive and 1 list of negative examples
    // but the full specification calls for n lists of each
  function generalize( p_sels, n_sels ) {
    // run mlcs on sels
    const mlcs_path = run_mlcs( p_sels, n_sels );
    const p_mlcs_sel = path_lcs.selector_from_canonical_path( mlcs_path.p_basic || [] );
    const n_mlcs_sel = path_lcs.selector_from_canonical_path( mlcs_path.n_basic || [] );
    const p_simplified_sel = heuristically_simplify_sel( p_mlcs_sel );
    const n_simplified_sel = heuristically_simplify_sel( n_mlcs_sel );
    return { positive: p_simplified_sel, negative: n_simplified_sel };
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
