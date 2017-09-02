"use strict";
{
  const path_lcs = require('./path_lcs.js');
  const sg = {
    generalize, 
    set any_mode( mode ) {
      path_lcs.any_mode = mode;
    }
  };

  module.exports = sg;

  // helpers ( interface to path_lcs )
    
    function isEl( thing ) {
      return thing instanceof HTMLElement;
    }

    function run_mlcs( p_sels, n_sels, isCanonical = false ) {
      console.log( p_sels, n_sels );
      let p_paths, n_paths;
      if ( !isCanonical ) {
        const p_els = p_sels.map( sel => isEl( sel ) ? sel : document.querySelector(sel) );
        const n_els = n_sels.map( sel => isEl( sel ) ? sel : document.querySelector(sel) );
        p_paths = p_els.map( el => path_lcs.get_canonical_path( el ).canonical );
        n_paths = n_els.map( el => path_lcs.get_canonical_path( el ).canonical );
      } else {
        p_paths = p_sels.map( sel => path_lcs.path_from_sel(sel) );
        n_paths = n_sels.map( sel => path_lcs.path_from_sel(sel) );
      }
      const p_basic = path_lcs.basic_multiple_lcs_from_canonical_path_list( p_paths );
      const n_basic = path_lcs.basic_multiple_lcs_from_canonical_path_list( n_paths );
      return { p_basic, n_basic };
    }

  function generalize( p_sels, n_sels, isCanonical ) {
    const mlcs_path = run_mlcs( p_sels, n_sels, isCanonical );
    const p_mlcs_sel = path_lcs.selector_from_canonical_path( mlcs_path.p_basic || [] );
    const n_mlcs_sel = path_lcs.selector_from_canonical_path( mlcs_path.n_basic || [] );
    return { positive: p_mlcs_sel, negative: n_mlcs_sel };
  }
}
