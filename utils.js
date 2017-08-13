"use strict";
{
  const utils = {
    all_pairs(list) {
      // asymmetric, order-ignoring
      const pairs = [];
      for(let i = 0; i < list.length-1; i += 1) {
        for(let j = i+1; j < list.length; j+= 1) {
          pairs.push([list[i],list[j]]);
        }
      }
      return pairs;
    }
    ,get_tag(o) {
      return Object.keys(o).find( k => k.startsWith('TAG:') );
    }
    ,get_tag_or_any(o) {
      const tag = Object.keys(o).find( k => k.startsWith('TAG:') );
      const any = Object.keys(o).find( k => k.startsWith(':-webkit-any') );
      if ( !! tag ) {
        return tag.slice(4);
      } else if ( !! any ) {
        return any.slice(13,-1);
      }
    }
    ,any_intersection(dic1,dic2) {
      if(!dic1 || !dic2) {
        return undefined;
      }
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
          tag = `:-webkit-any( ${key.slice(4)}, ${utils.get_tag_or_any(dic2)})`;
          i[tag] = 1; 
        } else if ( key.startsWith(":-webkit-any" ) ) {
          tag = `:-webkit-any( ${key.slice(13,-1)}, ${utils.get_tag_or_any(dic2)})`;
          i[tag] = 1; 
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
    ,union_add(dic1,dic2) {
      // must be numerically valued
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
        u[key] = (dic1[key] || 0) + (dic2[key] || 0);
      }
      if(Object.keys(u).length == 0) {
        return undefined;
      }
      return u;	
    }
    ,unionall(list,exclude) {
      exclude = exclude || {};
      if(!list) {
        return undefined;
      }
      if(!(list instanceof Array)) {
        let keys = Object.keys(list);
        newlist = [];
        keys.forEach( key => {
            if(!exclude.key) {
              newlist.push(list[key]);
            }
          } );	
        list = newlist;
      }
      let bigu = {};
      list.forEach( li => {
        bigu = union(bigu, li);
      } );
      const order = Object.keys(bigu).length;
      if(order == 0) {
        return undefined;
      }
      return bigu;
    }
  };

  module.exports = utils;
}

