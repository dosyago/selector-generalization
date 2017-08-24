"use strict";
{
  let vendor;
  const slots = [
    'tags',
    'ids',
    'classes',
    'geometry'
  ];

  const score2 = {
    tags: 1.0,
    geometry: 0.8,
    ids: 2.0,
    classes: 0.5
  }

  const score = {
    tags: 1.0,
    geometry: 0.5,
    ids: 2.0,
    classes: 0.333
  }

  const utils = {
    get_code(o) {
      return o.code;
    }
    ,get_tag_or_any(e,o) {
      vendor = vendor || require('./vendor.js').get_prefix();
      const eset = new Set(e.split(/\s*,\s*/g));
      const tags = o.tags;
      if ( o.tags.size ) {
        return [...eset, ...o.tags].join(',').trim();
      } else {
        return '*';
      }
    }
    ,any_intersection(dic1,dic2) {
      return slots.reduce( (d3, s) => {
        if ( s != 'tags' ) {
          d3[s] = and(dic1[s],dic2[s]); 
        } else {
          d3[s] = or(dic1[s],dic2[s]);
        }
        return d3;
      }, {});
    }
    ,intersection(dic1,dic2) {
      return slots.reduce( (d3, s) => {
        d3[s] = and(dic1[s],dic2[s]); 
        return d3;
      }, {});
    }
    ,union(dic1,dic2) {
      return slots.reduce( (d3, s) => {
        d3[s] = or(dic1[s],dic2[s]); 
        return d3;
      }, {});
    }
    ,order(dic) {
      return slots.reduce( (a, s) => a + (score[s] * dic[s].size), 0 );
    }
  };

  // helpers 
    function and(s1,s2) {
      return new Set( [...s1].filter( el => s2.has(el) ) );
    }
    function or(s1,s2) {
      return new Set( [...s1, ...s2] );
    }

  module.exports = utils;
}

