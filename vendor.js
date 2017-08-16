/**
  (c) David Walsh

  Taken then adapted from here: https://davidwalsh.name/vendor-prefix
**/

"use strict";
{
  const vendor = {
    get_prefix
  };

  module.exports = vendor;

  function get_prefix() {
    const styles = window.getComputedStyle(document.documentElement, '');
    const pre = (Array.prototype.slice
      .call(styles)
      .join('') 
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1];
    return pre;
  }
}
