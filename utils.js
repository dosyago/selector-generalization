"use strict";
{
  let vendor;

  const utils = {
    get_code(o) {
      const codekey = Object.keys(o).find( k => k.startsWith('code') );
      if ( !codekey ) {
        return 0;
      } else {
        return parseInt( codekey.slice(4) );
      }
    }
    ,get_tag_or_any(e,o) {
      vendor = vendor || require('./vendor.js').get_prefix();
      const eset = new Set(e.split(/\s*,\s*/g));
      const tag = Object.keys(o).find( k => k.startsWith('TAG:') );
      const any = Object.keys(o).find( k => k.startsWith(`:-${vendor}-any`) );
      if ( !! tag ) {
        return [...new Set([...eset, tag.slice(4)])].join(',').trim();
      } else if ( !! any ) {
        const parts = any.slice(7+vendor.length,-1).split(/\s*,\s*/g);
        return [...new Set([...eset, ...parts])].join(',').trim();
      } else {
        return '*';
      }
    }
    ,any_intersection(dic1,dic2) {
      if(!dic1 || !dic2) {
        return undefined;
      }
      vendor = vendor || require('./vendor.js').get_prefix();
      const keys1 = Object.keys(dic1);
      const i = {};
      let empty = true;
      let tag;
      for(let j = 0; j < keys1.length; j+=1 ) {
        const key = keys1[j];
        if(key in dic2) {
          i[key] = 1;
          empty = false;
        } else if ( key.startsWith('TAG:') ) {
          tag = `:-${vendor}-any(${utils.get_tag_or_any(key.slice(4),dic2)})`;
          i[tag] = 1; 
          empty = false;
        } else if ( key.startsWith(`:-${vendor}-any` ) ) {
          tag = `:-${vendor}-any(${utils.get_tag_or_any(key.slice(7+vendor.length,-1),dic2)})`;
          i[tag] = 1; 
          empty = false;
        }
      }
      if(empty) {
        return undefined;
      }
      return i;
    }
    ,intersection(dic1,dic2) {
      if(!dic1 || !dic2) {
        return undefined;
      }
      const keys1 = Object.keys(dic1);
      const i = {};
      let empty = true;
      for(let j = 0; j < keys1.length; j+=1 ) {
        const key = keys1[j];
        if(key in dic2) {
          i[key] = 1;
          empty = false;
        }
      }
      if(empty) {
        return undefined;
      }
      return i;
    }
    ,union(dic1,dic2) {
      if(!dic1) {
        return dic2 || undefined;
      }
      if(!dic2) {
        return dic1 || undefined;
      }
      const keys = Object.keys(dic1).concat(Object.keys(dic2));
      const u = {};
      for(let j = 0; j < keys.length; j+=1 ) {
        const key = keys[j];
        u[key] = 1;
      }
      if(Object.keys(u).length == 0) {
        return undefined;
      }
      return u;	
    }
    ,order(dic) {
      if(!dic) {
        return 0;
      } else {
        return Object.keys(dic).length;
      }
    }
  };

  module.exports = utils;
}

