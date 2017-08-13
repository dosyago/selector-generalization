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
  
  const lcs_path = {
    any_mode : true,
    get_canonical_path(node) {
      const path = [];
      const class_path = [];
      const canonical_path = [];
      while(!!node && node.tagName !== 'HTML') {
        if(!node.parentNode && !!node.host) {
          // FIXME: possible issue from spec updates
          // with the new changes in Shadow DOM v1
          // these selectors may no longer work even in the dynamic profile
          // so I may need to remove this code or find a workaround
          node = node.host;
          const shadow_level = {};
          shadow_level["TAG:"+node.tagName+"::shadow"] = 1;
          canonical_path.unshift(shadow_level);
        } else { 
          // TODO: add more information issue #8
            // add some way to add more information
            // such as other attributes, like src, href, type
            // value, aria-role, itemprop, maybe data- and so on
            // and some way to handle it in the algorithm
          const canonical_level = {};

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
              canonical_level[`#${node.id}`] = 1;
            }

          // get classes 
            let classes;
            try {
              classes = node.getAttribute('class');
            } catch(e) {
              classes = node.className;
            }
            if(typeof classes !== 'string') {
              // for SVG the className is an object. 
              // add a fallback ( which ought to have been prevented by getAttribute above )
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
                canonical_level['.'+classword] = 1;
              }
            });

          // add tag and index_name to canonical level 
            canonical_level["TAG:"+node.tagName] = 1;  
            canonical_level["IDX:"+index_name] = 1;  
            canonical_path.unshift(canonical_level);
        }
        node = node.parentNode;
      }      
      canonical_path.unshift({});
      return {canonical:canonical_path};
    },
    lcs_from_canonical_path_pair(path1,path2) {
      const score_matrix = new Float32Array(new ArrayBuffer(4*path1.length*path2.length));
      const row_offset = path2.length;
      let slice = [];
      let i1,i2;
      let address;
      let path1_path2_match_score, path1_insert_score, path2_insert_score;
      
      for(let si = 0;si <path2.length;si+=1) {
        slice.push(Number(score_matrix[si]).toFixed(2));
      }

      for(i1 = 1; i1 < path1.length; i1 += 1 ) {
        for(i2 = 1; i2 < path2.length; i2 += 1 ) {
          const quotient = utils.order(utils.intersection(path1[i1],path2[i2]))/utils.order(utils.union(path1[i1],path2[i2]));
          let tag_mismatch_penalty=0;
          /**
            const tag1 = utils.get_tag_or_any(path1[i1]);
            const tag2 = utils.get_tag_or_any(path2[i2]);
            let tag_mismatch_penalty = 0;
            if ( tag1 != tag2 && false ) {
              tag_mismatch_penalty = 0.5;
            }
          **/
          address = path2.length*i1+i2;
          path1_path2_match_score = score_matrix[address-path2.length-1]+quotient-tag_mismatch_penalty;
          path1_insert_score = score_matrix[address-1];
          path2_insert_score = score_matrix[address-path2.length];
          score_matrix[address] = Math.max(path1_insert_score,path1_path2_match_score,path2_insert_score);
        }
        slice = [];
        for(let si = i1*path2.length;si <= address;si+=1) {
          slice.push(Number(score_matrix[si]).toFixed(2));
        }
      }  

      const max_value_index = find_max_value_index(score_matrix,path1,path2);
      let last_match_i = max_value_index.row;
      let last_match_j = max_value_index.column;
      const lcs_selector = lcs_read(score_matrix,path1,path2,max_value_index.row,max_value_index.column);

      let last = lcs_selector[lcs_selector.length - 1];
      while(!!last && !!last['>']) {
        lcs_selector.pop();
        last = lcs_selector[lcs_selector.length - 1];
      }

      let first = lcs_selector[0];
      while(!!first && !!first['>']) {
        lcs_selector.shift();
        first = lcs_selector[0];
      }

      return {value:lcs_selector,score:max_value_index.value};  

      function find_max_value_index(s,x,y) {
        let max = 0;
        let max_index = s.length-1;
        for(let i = 0; i < s.length; i += 1) {
          if(s[i] >= max) {
            max = s[i];
            max_index = i;  
          }  
        }
        const column_index = max_index % y.length;
        const row_index = (max_index-column_index)/y.length;
        return {row:row_index,column:column_index,value:max};  
      }
      function lcs_read(s,x,y,i,j) {
        if(i <= 0 || j <= 0 ) {
          return [];
        }
        
        let xy_intersection;
        if ( lcs_path.any_mode ) {
          xy_intersection = utils.any_intersection(x[i],y[j]);
        } else {
          xy_intersection = utils.intersection(x[i],y[j]);
        }
        if(!!xy_intersection) {
          if(last_match_i-i == 1 && last_match_j-j == 1) {
            last_match_i = i;
            last_match_j = j;
            return lcs_read(s,x,y,i-1,j-1).concat([xy_intersection,{'>':1}]);
          } else {
            return lcs_read(s,x,y,i-1,j-1).concat([xy_intersection]);
          }
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
    },
    selector_from_canonical_path(path) {
      const selector = [];

      path.forEach( levelset => {
        if(!!levelset['>']) {
          const last = selector[selector.length-1];
          if(last !== '>') {
            selector.push('>');
          }
          return;
        }
        const classes = [];
        const level_sigs = Object.keys(levelset);
        level_sigs.sort().reverse();
        let tag_id = undefined;
        let invalid_tag = false;

        level_sigs.forEach( level_sig => {
          if(level_sig.indexOf("#") == 0) {
            //it's a tag id
            if(!tag_id) {
              tag_id = '';
            }
            tag_id = tag_id + level_sig;
          } else if(level_sig.indexOf("TAG:") == 0) {
            // it's a tag name
            let tag_name = level_sig.slice(4);
            if(!tag_id) {
              tag_id = '';
            }
            tag_id = tag_name+tag_id;
          } else if(level_sig.indexOf("IDX:") == 0) {
            // it's an tag nth of type index. Use it if we have a tagname
            if(!!tag_id) {
              tag_id = tag_id + level_sig.split("IDX:")[1];
            }
          } else {
            // it's a class name
            classes.push(level_sig);
          }
        });

        if(classes.length > 0) {
          if(!tag_id) {
            tag_id = '';
          }
          tag_id += classes.join('');
        }

        if(!!tag_id) {
          selector.push(tag_id);
        }
      });    

      let last = selector[selector.length - 1];
      // remove trailing > or whitespace
      while(!!last && last == '>') {
        selector.pop();
        last = selector[selector.length - 1];
      }

      let first = selector[0];
      while(!!first && !!first == '>') {
        selector.shift();
        first = selector[0];
      }

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
        const lcs = lcs_path.lcs_from_canonical_path_pair(path1,path2);
        if(!!lcs) {
          path2 = lcs.value;
        }
      }
      return path2;  
    },
    tournament_multiple_lcs_from_canonical_path_list(list) {
      const pairs = utils.all_pairs(list);
      const quadtuples = [];

      pairs.forEach( pair => {
        const pairlcs = lcs_path.lcs_from_canonical_path_pair(pair[0],pair[1]);
        const quadtuple = {score:pairlcs.score,lcs:pairlcs.value,p1:pair[0],p2:pair[1]};
        quadtuples.push(quadtuple);
      });    

      quadtuples.sort( (a,b) => {
        if(a.score < b.score) {
          return -1;
        } else if(a.score > b.score) {
          return 1;
        } else if(a.lcs.length < b.lcs.length) {
          return -1;
        } else if(a.lcs.length > b.lcs.length) {
          return 1;
        } else {
          return 0;
        } 
      });

      const tournament_matches = [];
      const paired = {};
      let hash_value = 0;

      quadtuples.forEach( q4 => {
        const p1 = q4.p1;
        const p2 = q4.p2;
        if(!!p1.hash_id || !!p2.hash_id) {
          return; // we have seen these
        } else {
          p1.hash_id = hash_value;
          paired[hash_value] = p1;
          hash_value += 1;
          p2.hash_id = hash_value;
          paired[hash_value] = p2;
          hash_value += 1;
          tournament_matches.push(q4.lcs);  
        }  
      });

      if(tournament_matches.length > 1) {
        return lcs_path.tournament_multiple_lcs_from_canonical_path_list(tournament_matches); 
      } else {
        return tournament_matches[0];
      }    
    }
  };

  module.exports = lcs_path;
}
