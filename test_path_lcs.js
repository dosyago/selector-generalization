"use strict";
{
  const p = require('./path_lcs.js');

  run();

  function run() {
    const sel = 'tag#id.class1.class[2]:any(an1, an2):nth-of-type(geo)';
    console.log( p.path_from_sel(sel) );
  }
}
