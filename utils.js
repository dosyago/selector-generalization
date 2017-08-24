"use strict";
{
  let vendor;
  const slots = [
    'tags',
    'ids',
    'classes',
    'geometry'
  ];

  const score2_of = {
    tags: 1.0,
    geometry: 0.8,
    ids: 2.0,
    classes: 0.5
  }

  const score_of = {
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
    ,order(dic, any_mode) {
      return slots.reduce( (a, s) => a + assign_score(s, dic[s].size, any_mode), 0 );
    }
  };

  // helpers 
    function and(s1,s2) {
      return new Set( [...s1].filter( el => s2.has(el) ) );
    }
    function or(s1,s2) {
      return new Set( [...s1, ...s2] );
    }

    function assign_score( category, set_size, any_mode ) {
      const score = score_of[category];
      switch( category ) {
        case "tags":
          if ( any_mode ) {
            return score / set_size;
          } else {
            return score;
          }
        default:
          return score * set_size;
      }
    }

  module.exports = utils;
}

