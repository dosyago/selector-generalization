"use strict";
{
  const sg = {
    generalize, 
    selector_for_all, 
    path_union,
    columnize, 
    parentalize,
    selector_for_parent,
    path_intersection,
    rowize
  };
  // Selector Generalization package entrypoint

  module.exports = sg;

  function generalize( sels ) {
    // run mlcs on sels
    const options = { 

    };
    const mlcs_sel = run_mlcs( sels, options );
    const simplified_sel = heuristically_simplify_sel( mlcs_sel );
    return simplified_sel;
  }

  function selector_for_all( sels ) {
    return generalize( sels );
  }

  function path_union( sels ) {
    return generalize( sels );
  }

  function columnize( sels ) {
    return generalize( sels );
  }

  function get_lowest_common_parent_sel( sels ) {
    // return the lowest common parent selector
    // of all the selectors in the set
    const els = gets_els( sels );
    const parent = get_lowest_common_parent( sels );
    const parent_sel = get_sel( parent );
    const simplified_sel = heuristically_simplify_sel( mlcs_sel );
    return simplified_sel;
  }

  function parentalize( sels ) {
    return get_lowest_common_parent_sel( sels );
  }

  function selector_for_parent( sels ) {
    return get_lowest_common_parent_sel( sels );
  }

  function path_intersection( sels ) {
    return get_lowest_common_parent_sel( sels );
  }

  function rowize( sels ) {
    return get_lowest_common_parent_sel( sels );
  }
}
