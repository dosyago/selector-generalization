/**

   Copyright 2013-2017 Cris Stringfellow / DOSAYGO CREATIVE INTANGIBLE HOLDINGS (UK) LTD

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

**/


"use strict";
{
  const utils = require('./utils.js');
  const MAX_DEPTH = 10000;
  const CLASS_MATCHER = /(\.\w+)/g;
  const ID_MATCHER = /#(\w+)/g;
  const TAG_MATCHER = /^(\w+)/g;
  const ANY_MATCHER = /:\w+\(\s*([^\)]+)\s*\)/g;
  const NTH_MATCHER = /(:nth-of-type\([^)]*\))/g;

  let vendor;
  let current_code = 2;
  
  const path_lcs = {
    any_mode : false,
    get_canonical_path(node) {
      const path = [];
      const class_path = [];
      const canonical_path = [];
      let code = next_code();
      while(!!node && node.tagName != 'HTML') {
        if(!node.parentNode && !!node.host) {
          // Issue: this is only here for reference when we add in updated shadow dom support, or remove this code
          node = node.host;
          const shadow_level = {};
          shadow_level["TAG:"+node.tagName+"::shadow"] = 1;
          canonical_path.unshift(shadow_level);
        } else { 
          const canonical_level = {
            tags: new Set(),
            geometry: new Set(),
            classes: new Set(),
            ids: new Set()
          };

          // make the level 
            // get index_name ( like nth-of-type(n) )
              let index_name = '';
              if(!!node.parentNode) {
                let count = 0;
                const siblings = Array.from( node.parentNode.childNodes );
                for( const sibling of siblings ) {
                  if(sibling.tagName == node.tagName) {
                    count += 1;
                  }
                  if(sibling === node) {
                    index_name = `:nth-of-type(${count})`;
                    break;
                  }
                }
              }

            // add id ( if any ) to canonical level 
              if(!!node.id && node.id.length > 0) {
                canonical_level.ids.add( node.id );
              }

            // get classes 
              let classes;
              try {
                classes = node.getAttribute('class');
              } catch(e) {
                classes = node.className;
              }
              if(typeof classes !== 'string') {
                // fallback for SVG the className is an object. 
                try {
                  classes = Array.from( node.classList );
                } catch(e) {
                  classes = []
                }
              } else {
                classes = classes.split(/\s+/);
              }  

            // add class words to canonical_level 
              classes.forEach( classword => {
                if(classword.length > 0) {
                  canonical_level.classes.add(`.${classword}`);
                }
              });

            // add tag and index_name to canonical level 
              canonical_level.tags.add(node.tagName); 
              canonical_level.geometry.add(index_name); 


            // add code
              canonical_level.code = code;
              code += 1;
          
          canonical_path.unshift(canonical_level);
        }
        node = node.parentNode;
      }      
      return {canonical:canonical_path};
    },
    path_from_sel(sel) {
      const levels = sel.split(/\s*>\s*/g);
      const path = [];
      let code = next_code();
      for( const level of levels ) {
        const canonical_level = {
          tags: new Set(),
          geometry: new Set(),
          classes: new Set(),
          ids: new Set()
        };

        const classes = new Set( run_match(CLASS_MATCHER,level));
        let anys = run_match(ANY_MATCHER,level)[0];
        if ( anys ) {
          anys = new Set( anys.split(/\s*,\s*/g) );
        } else {
          anys = new Set();
        }

        const tag = run_match(TAG_MATCHER,level)[0];
        const id = run_match(ID_MATCHER,level)[0];
        const geometry = run_match(NTH_MATCHER,level)[0];

        canonical_level.classes = classes;
        canonical_level.tags = anys;

        if ( tag ) {
          if ( anys.size == 0 ) {
            canonical_level.tags.add( tag );
          } else if ( tag !== '*' ) {
            canonical_level.tags.add( tag );
          }
        }
        if ( id ) {
          canonical_level.ids.add(id);
        }
        if ( geometry ) {
          canonical_level.geometry.add(geometry);
        }

        canonical_level.code = code;
        code -= 1;
        path.push( canonical_level );
      }
      return path;
    },
    selector_from_canonical_path(path) {
      vendor = vendor || require('./vendor.js').get_prefix();
      path = Array.from(path);
      if ( path.length == 0 ) {
        return '';
      }
      const selector = [];

      // add direct descendent combinators
        let last_level = path[0];
        for( let i = 1; i < path.length; i++ ) {
          const level = path[i];
          const diff = get_code_diff(last_level,level);
          if ( diff == 1 ) {
            path.splice( i, 0, {'>': 1});
          }
          last_level = level;
        }

      path.forEach( levelset => {
        if(!!levelset['>']) {
          const last = selector[selector.length-1];
          if(last !== '>') {
            selector.push('>');
          }
          return;
        }
        const { tags, classes, ids, geometry } = levelset;
        let level_sel = '';
        
        if ( path_lcs.any_mode && tags.size > 1 ) {
          level_sel += `:-${vendor}-any(${[...tags].join(',')})`;
        } else {
          level_sel += `${[...tags].join(',')}`;
        }

        if ( ids.size ) {
          level_sel += `#${[...ids].join('##')}`;
        }

        if ( classes.size) {
          level_sel += `${[...classes].join('')}`;
        }

        if ( geometry.size ) {
          level_sel += `${[...geometry].join('')}`;
        }

        if(!!level_sel) {
          selector.push(level_sel);
        }
      });    

      const selector_str = selector.join(' ');
      return selector_str;
    },    
    basic_multiple_lcs_from_canonical_path_list(list) {
      if(list.length == 0) {
        return [];
      }
      let path2 = list[0];
      let path1;
      for(let i = 1; i < list.length; i+=1 ) {
        path1 = list[i];
        const lcs = lcs_from_canonical_path_pair(path1,path2);
        if(!!lcs) {
          path2 = lcs.value;
        }
      }
      return path2;  
    }
  };

  // helpers 
    function run_match(R,s) {
      const m = [];
      let match;
      while(match = R.exec(s)) {
        m.push(match[1]);
      }
      return m;
    }
    function find_max_value_index(s,x,y) {
      let value = 0;
      let max_index = s.length-1;
      for(let i = 0; i < s.length; i += 1) {
        if(s[i] >= value) {
          value = s[i];
          max_index = i;  
        }  
      }
      if ( y.length ) {
        const column = max_index % y.length;
        const row = (max_index-column)/y.length;
        return { row, column, value };
      } else {
        return { row: 0, column: 0, value };
      }
    }

    function lcs_read(s,x,y,i,j) {
      if ( i <= 0 || j <= 0 ) {
        return [];
      }
      
      let xy_intersection;
      if ( path_lcs.any_mode ) {
        xy_intersection = utils.any_intersection(x[i],y[j]);
      } else {
        xy_intersection = utils.intersection(x[i],y[j]);
      }
      const order = utils.order(xy_intersection, path_lcs.any_mode);
      if(!!order) {
        const xcode = utils.get_code(x[i]);
        const ycode = utils.get_code(y[j]);
        Object.assign( xy_intersection, {
          xcode, ycode
        });
        return lcs_read(s,x,y,i-1,j-1).concat([xy_intersection]);
      } else {
        let score_insert_y = s[i*y.length+j-1];
        let score_insert_x = s[(i-1)*y.length+j];
        if(score_insert_y > score_insert_x) {
          return lcs_read(s,x,y,i,j-1);
        } else {
          return lcs_read(s,x,y,i-1,j);
        }
      }
    }

    function next_code() {
      current_code += MAX_DEPTH;
      return current_code;
    }

    function get_code_diff(last_level, level) {
      const lcode = utils.get_code(last_level);
      const code = utils.get_code(level);
      return lcode - code;
    }

    function diffs( last_level, level ) {
      const {xcode,ycode} = last_level;
      const xdif = xcode - level.xcode;
      const ydif = ycode - level.ycode;
      return [xdif, ydif];
    }

    function isOneLevel( last_level, level ) {
      const [xdif, ydif] = [...diffs(last_level, level )];
      return xdif == 1 && ydif == 1;
    }

    function max_diff( last_level, level ) {
      return Math.max( ...diffs( last_level, level ) );
    }

    function lcs_from_canonical_path_pair(path1,path2) {
      const score_matrix = new Float32Array(new ArrayBuffer(4*path1.length*path2.length));
      const row_offset = path2.length;
      let i1,i2;
      let address;
      let path1_path2_match_score, path1_insert_score, path2_insert_score;
      
      for(i1 = 1; i1 < path1.length; i1 += 1 ) {
        for(i2 = 1; i2 < path2.length; i2 += 1 ) {
          const union_order = utils.order(utils.union(path1[i1],path2[i2]), path_lcs.any_mode);
          let quotient = 0;
          if ( union_order ) {
            quotient = utils.order(utils.intersection(path1[i1],path2[i2]), path_lcs.any_mode)/union_order;
          }
          address = path2.length*i1+i2;
          path1_path2_match_score = score_matrix[address-path2.length-1]+quotient;
          path1_insert_score = score_matrix[address-1];
          path2_insert_score = score_matrix[address-path2.length];
          score_matrix[address] = Math.max(path1_insert_score,path1_path2_match_score,path2_insert_score);
        }
      }  

      const max_value_index = find_max_value_index(score_matrix,path1,path2);
      let last_match_i = max_value_index.row;
      let last_match_j = max_value_index.column;
      const lcs_selector = lcs_read(score_matrix,path1,path2,last_match_i, last_match_j);

      // add codes
        if ( lcs_selector.length ) {
          let code = next_code();
          let last_level = lcs_selector[0];
          last_level.code = code;
          for( let i = 1; i < lcs_selector.length; i++ ) {
            const level = lcs_selector[i];
            const is_one_level = isOneLevel( last_level, level );
            if ( is_one_level ) {
              code -= 1;
            } else {
              code -= max_diff( last_level, level );
            }
            level.code = code;
            last_level = level;
          }
        }

        lcs_selector.forEach( level => {
          delete level.xcode;
          delete level.ycode;
        });

      return {value:lcs_selector,score:max_value_index.value};  
    }

  module.exports = path_lcs;
}
