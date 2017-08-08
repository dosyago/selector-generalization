StanTech.TheSystem = {
  name : window.StanTech.name + 'The System: ',
  basic_selector : function(elem) {
    var node = elem;
    var index_name = '';
    var path = [];
    var class_path = [];
    var canonical_path = [];
    var canonical_level;
    while(!!node && node.tagName !== 'HTML') {
      if(!node.parentNode && !!node.host) {
        node = node.host;
        var shadow_level = {};
        shadow_level["TAG:"+node.tagName+"::shadow"] = 1;
        canonical_path.unshift(shadow_level);
      } else { 
        canonical_level = {};
        var node_index = undefined;
        if(!!node.parentNode) {
          var count = 0;
          var siblings = node.parentNode.childNodes;
          for(var i = 0; i < siblings.length; i += 1) {
            if(siblings[i].tagName == node.tagName) {
              count += 1;
            }
            if(siblings[i] === node) {
              index_name = ":nth-of-type("+count+")";
              break;
            }
          }
        }
        if(!!node.id && node.id.length > 0) {
          canonical_level['#'+node.id] = 1;
        }
        var level_name = node.tagName += index_name;  
        var classes = node.className;
        if(typeof classes !== 'string') {
          // for SVG the className is an object. 
          classes = [];
        } else {
          classes = classes.split(/\s+/);
        }  
        var new_classes = [];
        classes.forEach(function(classword) {
            if(classword.length > 0) {
              canonical_level[classword] = 1;
              new_classes.push(classword);
            }
          } );
        if(new_classes.length > 0) {
          var class_name = '.' + new_classes.join('.');
          class_path.unshift(class_name);
        } else {
          class_path.unshift(level_name);  
        }
        path.unshift(level_name);
        canonical_level["TAG:"+node.tagName] = 1;  
        canonical_level["IDX:"+index_name] = 1;  
        canonical_path.unshift(canonical_level);
        /* try to work with shadow roots */
      }
      node = node.parentNode;
    }      
    canonical_path.unshift({});
    //console.log("Canonical paths : ", window.StanTech.TheSystem.canonical_paths);
    return {path:path.join('>'),class_path:class_path.join('>'),canonical:canonical_path};
  },
  save_to_db : function(type,data) {
    var id = Math.round(Math.random()*100000000);
    var msg = {id:id,action:'save',type:type,data:data};
    send_message(msg,function (r) { console.log("Data ", data, " saved ", r.id) });
  },
  delete_from_db : function(type,data) {
    var id = Math.round(Math.random()*100000000);
    var msg = {id:id,action:'delete',type:type,data:data};
    send_message(msg, function (r) { console.log("Data ", data, " deleted ", r.id) });
  },
  get_from_db : function(type,cb) {
    var id = Math.round(Math.random()*100000000);
    var msg = {id:id,action:'get',type:type};
    send_message(msg, function (r) { 
          cb(r.data);
          console.log("Data ", r.data, " received ", r.id);
         });
  },
  format_db : function(type) {
    var id = Math.round(Math.random()*100000000);
    var msg = {id:id,action:'format',type:type};
    send_message(msg, function (r) { console.log("Table ", type, " removed ", r.id) });
  },
  lcs_from_canonical_path_pair : function(path1,path2) {
      // implement
      score_matrix = new Float32Array(new ArrayBuffer(4*path1.length*path2.length));
      var i1,i2,address, row_offset = path2.length,quotient, path1_path2_match_score,path1_insert_score,path2_insert_score;  
      var slice = [];
      for(var si = 0;si <path2.length;si+=1) {
        slice.push(Number(score_matrix[si]).toFixed(2));
      }
      //console.log("Row ", 0, " : ", JSON.stringify(slice));  
      for(i1 = 1; i1 < path1.length; i1 += 1 ) {
        for(i2 = 1; i2 < path2.length; i2 += 1 ) {
          address = path2.length*i1+i2;
          quotient = order(intersection(path1[i1],path2[i2]))/order(union(path1[i1],path2[i2]));
          //console.log(JSON.stringify(path1[i1]),JSON.stringify(path2[i2]),quotient);
          path1_path2_match_score = score_matrix[address-path2.length-1];
          path1_insert_score = score_matrix[address-1];
          path2_insert_score = score_matrix[address-path2.length];
          score_matrix[address] = Math.max(path1_insert_score,Math.max(path1_path2_match_score+quotient,path2_insert_score));
        }
        slice = [];
        for(var si = i1*path2.length;si <= address;si+=1) {
          slice.push(Number(score_matrix[si]).toFixed(2));
        }
        //console.log("Row ", i1, " : ", JSON.stringify(slice));  
      }  
      function find_max_value_index(s,x,y) {
        max = 0;
        max_index = s.length-1;
        for(var i = 0; i < s.length; i += 1) {
          if(s[i] >= max) {
            max = s[i];
            max_index = i;  
          }  
        }
        var column_index = max_index % y.length;
        var row_index = (max_index-column_index)/y.length;
        return {row:row_index,column:column_index,value:max};  
      }
      var last_match_i = 0;
      var last_match_j = 0;
      function lcs_read(s,x,y,i,j) {
        if(i == 0 || j == 0 ) {
          return [];
        }
        
        var xy_intersection = intersection(x[i],y[j]);
        //console.log(x[i],y[j],xy_intersection);
        if(!!xy_intersection) {
          if(last_match_i-i == 1 && last_match_j-j == 1) {
            //console.log(last_match_i,i,last_match_j,j);
            last_match_i = i;
            last_match_j = j;
            return lcs_read(s,x,y,i-1,j-1).concat([{'>':1},xy_intersection]);
          } else {
            //console.log(last_match_i,i,last_match_j,j);
            last_match_i = i;
            last_match_j = j;
            return lcs_read(s,x,y,i-1,j-1).concat([xy_intersection]);
          }
        } else {
          var score_insert_y = s[i*y.length+j-1];
          var score_insert_x = s[(i-1)*y.length+j];
          if(score_insert_y > score_insert_x) {
            //console.log(last_match_i,i,last_match_j,j);
            return lcs_read(s,x,y,i,j-1);
          } else {
            //console.log(last_match_i,i,last_match_j,j);
            return lcs_read(s,x,y,i-1,j);
          }
        }
      }
      var max_value_index = find_max_value_index(score_matrix,path1,path2);
      //console.log("Max value index at : ", JSON.stringify(max_value_index));
      var lcs_selector = lcs_read(score_matrix,path1,path2,max_value_index.row,max_value_index.column);
      var last = lcs_selector[lcs_selector.length - 1];
      // remove trailing > or whitespace
      while(!!last && !!last['>']) {
        lcs_selector.pop();
        last = lcs_selector[lcs_selector.length - 1];
      }
      var first = lcs_selector[0];
      while(!!first && !!first['>']) {
        lcs_selector.shift();
        first = lcs_selector[0];
      }
      return {value:lcs_selector,score:max_value_index.value};  
  },
  selector_from_canonical_path : function(path) {
    selector = [];
    allowed_tags = {
      'IMG':true,'IFRAME':true,'CANVAS':true,'INPUT':true,'PATH':true,'path':true,'EM':true,'CITE':true,'BLOCKQUOTE':true,'Q':true,'TABLE':true, 'TR':true,'TD':true,'TBODY':true,'BODY':true,'HEAD':true,'TITLE':true,'HTML':true,'OL':true,'UL':true,'ARTICLE':true,'SECTION':true,'CENTER':true,'A':true,'SPAN':true,'I':true,'B':true,'STRIKE':true,'P':true,'H1':true,'H2':true,'H3':true,'H4':true,'H5':true,'H6':true,'DL':true,'DT':true,'DD':true,'OL':true,'LI':true,'ADDRESS':true,'CENTER':true,'DEL':true,'DIV':true,'HR':true,'INS':true,'PRE':true};  
    //console.log(path);
    var last_levelset = true;
    path.forEach( function (levelset) {
      if(!!levelset['>']) {
        if(last_levelset) {
          selector.push('>');
        }
        last_levelset = false;
        return;
      }
      var level_sigs = Object.keys(levelset);
      level_sigs.sort().reverse();
      var tag_id = undefined;
      var invalid_tag = false;
      var classes = [];
      level_sigs.forEach( function ( level_sig ) {
          if(level_sig.indexOf("#") == 0) {
            //it's a tag id
            if(!tag_id) {
              tag_id = '';
            }
            tag_id = tag_id + level_sig;
          } else if(level_sig.indexOf("TAG:") == 0) {
            // it's a tag name
            var tag_name = level_sig.split(/^TAG:/)[1];
            if(!(tag_name in allowed_tags || (!!tag_name && tag_name.indexOf('::shadow') !== -1))) {
              invalid_tag = true;
              if(selector.length > 0) {
                if(selector[selector.length-1] == '>') {
                  selector.pop();
                }
              }
            } else {
              if(!tag_id) {
                tag_id = '';
              }
              tag_id = tag_name+tag_id;
            }
          } else if(level_sig.indexOf("IDX:") == 0) {
            // it's an tag nth of type index. Use it if we have a tagname
            if(!!tag_id) {
              tag_id = tag_id + level_sig.split("IDX:")[1];
            }
          } else {
            // it's a class name
            classes.push(level_sig);
          }
        } );
      if(classes.length > 0) {
        if(!tag_id) {
          tag_id = '';
        }
        tag_id += '.' + classes.join('.');
      }
      if(!!tag_id) {
        //console.log("Produced id for this level : ", tag_id);
        selector.push(tag_id);
        last_levelset = true && !invalid_tag;
      } else {
        last_levelset = false;
      }
    } );    
    var last = selector[selector.length - 1];
    // remove trailing > or whitespace
    while(!!last && last == '>') {
      selector.pop();
      last = selector[selector.length - 1];
    }
    var first = selector[0];
    while(!!first && !!first == '>') {
      selector.shift();
      first = selector[0];
    }
    selector = selector.join(' ');
    //console.log("Produced selector from canonical path. Selector is : ", selector);
    return selector;
  },    
  basic_multiple_lcs_from_canonical_path_list : function(list) {
    if(list.length == 0) {
      return [];
    }
    var path2 = list[0];
    var path1;
    for(var i = 1; i < list.length; i+=1 ) {
      path1 = list[i];
      var lcs = window.StanTech.TheSystem.lcs_from_canonical_path_pair(path1,path2);
      if(!!lcs) {
        path2 = lcs.value;
      }
    }
    return path2;  
  },
  tournament_multiple_lcs_from_canonical_path_list : function(list) {
    var pairs = all_pairs(list);
    var quadtuples = [];
    pairs.forEach( function(pair) {
        var pairlcs = window.StanTech.TheSystem.lcs_from_canonical_path_pair(pair[0],pair[1]);
        var quadtuple = {score:pairlcs.score,lcs:pairlcs.value,p1:pair[0],p2:pair[1]};
        quadtuples.push(quadtuple);
      });    
    quadtuples.sort(function (a,b) {
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
    var paired = {}, hash_value = 0;
    var tournament_matches = [];
    quadtuples.forEach(function(q4) {
        var p1 = q4.p1;
        var p2 = q4.p2;
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
      return window.StanTech.TheSystem.tournament_multiple_lcs_from_canonical_path_list(tournament_matches); 
    } else {
      return tournament_matches[0];
    }    
  },
  text_walker : function(elem) {
    return document.createTreeWalker(
      elem,
      NodeFilter.SHOW_TEXT,
      null,
      false );
  },
  sentence_token : /[\u002E\u00B7\u0589\u06D4\u0701-\u0702\u1362\u166E\u1809\u2CFE\u3002\u30FB\uA4FF\uA60E\uA6F3\uFE12\uFE52\uFF0E\uFF61\uFF65]/,
  white_token : /\s/,
  element_text : function(elem,process_function) {
    // TODO:process_function optionall processes the element
    // useful for custom jobs when text obfuscation has been 
    // used
    // extract text from element
    // making sure to add spaces
    // to prevent WordJoiningBetweenSections
    var text = [],walker,node,value;
    walker = window.StanTech.TheSystem.text_walker(elem);
    while(node = walker.nextNode()) {
      if(node.parentNode.tagName == 'SCRIPT') {
        continue;
      }
      value = node.nodeValue;  
      text.push(value);
      if(!window.StanTech.TheSystem.white_token.test(value.charAt(value.length-1))) {
        text.push(' ');
      }
    }
    return text.join('');
  },
  paragraphs : function () {
    var block_elements = {
      'BLOCKQUOTE':true,'TABLE':true,'TBODY':true,'TR':true,'TD':true,'P':true,'H1':true,'H2':true,'H3':true,'H4':true,'H5':true,'H6':true,'DL':true,'DT':true,'DD':true,'OL':true,'LI':true,'ADDRESS':true,'CENTER':true,'DEL':true,'DIV':true,'HR':true,'INS':true,'PRE':true};  
    var excluded_elements = {
      'SCRIPT':true,'STYLE':true,'NOSCRIPT':true};
    var block_level = [],node,text_block=[];  
    var paragraph_walker = document.createTreeWalker(
      document,
      NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,
      function (n) {
        if(n.tagName in excluded_elements) {
          return false;
        }
        if(!!n.nodeValue && n.nodeValue.indexOf('<![CDATA[') !== -1 ) {
          return false;
        }
        return true
      },
      false );      
    while(node = paragraph_walker.nextNode()) {
      if(node.nodeType == 3) {
        var value = node.nodeValue;
        if(node.nodeValue.length > 0) {
          text_block.push(node.nodeValue);
        }
        if(!window.StanTech.TheSystem.white_token.test(value.charAt(value.length-1))) {
          text_block.push(' ');
        } 
      } else {
        if(node.tagName in block_elements || node.style.display == 'block' || getComputedStyle(node).display == 'block') {
          var paragraph = text_block.join('');
          if(paragraph.length > 0) {
            block_level.push(paragraph);
          }
          text_block = [];
        }
      }  
    }  
    return block_level;
  },
  paragraphs_joined : function() {
    return window.StanTech.TheSystem.paragraphs().join('');
  },
  collect_frequencies : function () {
    var source = window.StanTech.TheSystem.paragraphs_joined().split(/[ ,\n\r\t"']/);
    var freq= {};
    source.forEach( function (word) {
        if(word.length == 0) {
          return;
        }
        if(!(word in freq)) {
          freq[word] = 0;
        }
        freq[word] += 1;
      } );
    return sort_by_values(freq,true);  
  },
  token_classes : [/\s/,/\d/,/\w/,/[\u0080-\u00FF\u2000-\u2BFF\u2E00-\u2E7F\u3000-\u303F\uFF00-\uFFFF]/,/[^\w\d\s]/],
  tokenize : function (input, classes, return_indices, compress_white) {
    var catchall_token = 4; // the index of catchall in the token_classes list
    return_indices = return_indices || false;
    compress_white = compress_white || true;
    var current_token = [];
    var all_tokens = [];
    var current_token_j = -1;
    for(var i = 0; i < input.length; i+=1 ) {
      var next_char = input.charAt(i);
      for(var j = 0; j < classes.length; j+= 1) {
        if(classes[j].test(next_char)) {
          if(j == current_token_j && j !== catchall_token) {
            current_token.push(next_char);
          } else {
            if(return_indices) {
              current_token = i;      
            } else {
              if(compress_white && current_token_j == 0) {
                current_token = ' ';  
              } else { 
                current_token = current_token.join('');
              }
            }
            all_tokens.push(current_token);
            current_token = [next_char];
            current_token_j = j;
          }
          break;
        }
      }
    }
    return all_tokens;
  }, 
  update_table : function(existing,update) {
    var update_keys = Object.keys(update);
    update_keys.forEach( function(key) {
        if(!(key in existing)) {
          existing[key] = 0;
        }
        existing[key] += update[key];
      });
    return existing;  
  },
  clear_overlay : function () {
    window.StanTech.TheSystem.drawoverlay.clearRect(0,0,window.StanTech.TheSystem.overlay[0].width,window.StanTech.TheSystem.overlay[0].height);  
  },
  resize_overlay : function () {
    window.StanTech.TheSystem.overlay[0].width = window.innerWidth;
    window.StanTech.TheSystem.overlay[0].height = window.innerHeight;
  },
  make_overlay : function () {
    var overlay_canvas = document.createElement('canvas');

    /* style */
      overlay_canvas.style.setProperty("border","0","important");
      overlay_canvas.style.setProperty("margin","0","important");
      overlay_canvas.style.setProperty("padding","0","important");
      overlay_canvas.style.setProperty("width","100vw","important");
      overlay_canvas.style.setProperty("height","100vh","important");
      overlay_canvas.style.setProperty("z-index","30000000000","important");
      overlay_canvas.style.setProperty("top","0","important");
      overlay_canvas.style.setProperty("left","0","important");
      overlay_canvas.style.setProperty("pointer-events","none","important");
      overlay_canvas.style.setProperty("position","fixed","important");
      overlay_canvas.style.setProperty("background","fixed","important");

    window.StanTech.TheSystem.overlay = $(overlay_canvas);
    $(document.body).append(window.StanTech.TheSystem.overlay);
    window.StanTech.TheSystem.drawoverlay = window.StanTech.TheSystem.overlay[0].getContext('2d');
    window.StanTech.TheSystem.resize_overlay();
    $(window).resize( window.StanTech.TheSystem.resize_overlay );  
  },
  init : function () {
    window.StanTech.TheSystem.say = window.StanTech._say(window.StanTech.TheSystem.name);
    window.StanTech.TheSystem.canonical_paths = [];
    function load_can_paths(paths) {
      window.StanTech.TheSystem.canonical_paths = paths || [];
      window.StanTech.TheSystem.chosen_elements = [];
      window.StanTech.TheSystem.canonical_paths.forEach(function(path) {
          path = window.StanTech.TheSystem.selector_from_canonical_path(path);
          var jelem = jQuery(path);
          if(jelem.length > 0) {
            jelem.each(function(i,elem) {
                window.StanTech.TheSystem.chosen_elements.push(elem);
              });
          }
        });  
    }
    window.StanTech.TheSystem.get_from_db('can_paths',load_can_paths);
    window.StanTech.TheSystem.make_overlay();
    window.StanTech.TheSystem.say('setup');
  }
}
StanTech.TheSystem.init();
