// THese functions are basically extending querySelector
// to allow custom selectors ( for attributes and parents )
rn.selector = new (function selector() {
  /* functions */
    function attr(aselector) {
      var attr_regex = /\[([^\[\]]+)\]\s*$/;
      var match_result = attr_regex.exec(aselector);
      //console.log(this,aselector,match_result);
      var element_selector = aselector.replace(attr_regex,"");
      var attribute_requested = match_result[1].replace(trim_regex,"");
      return { element_selector: element_selector, attribute_requested : attribute_requested };
    }
    function get(selector_parent, selector, basis) {
      return get_all(selector_parent, selector, basis)[0];
    }
    function get_all(selector_parent, selector, basis) {
      /* handle parent place */
      /* the basis is assumed to be given */
      /* if parent selector is found we select relative to the basis */
      /* if it's not found then we select relative to the document */
      /* this supports traversing up through shadow roots to their shadow hosts as well. */
      ////console.log("Requested custm selector ", arguments );
      var root;
      var source, result = [];
      if(!!selector_parent || selector_parent == "") {
        var parentRoot = basis;
        var found = false;
        while(parentRoot.parentNode || parentRoot.host) {
          source = parentRoot.parentNode || parentRoot.host;
          /* empty parent selector */
          if(!!source.matches) {
            if(selector_parent == "") {
              found = true;
              break;
            }
            if(!!source.matches(selector_parent)) {
              found = true;
              break;
            }
            //console.log("AA",basis,source,result);
          } else if(source.__proto__ == ShadowRoot.prototype) {
            if(selector_parent == "::shadow") {
              found = true;
              break;
            }
          }
          parentRoot = source;
        }
        if(!found) {
          //console.log("Parent selector was not found ", selector );
        } else {
          //console.log("Parent selector was found ", selector, " updating root to ", parentRoot );
          root = source;
        }
      } 
      if(!!root) {
        result = [root];
      }
      if(!!selector) {
        if(!root) {
          root = document;
        }
        result = rn.conversion.arrify(root.querySelectorAll( selector ));
      }
      if(!result) {
        ////console.log("Warning ", basis, selector, "yields no selected elements");
      }
      //console.log("Result ", result);
      return result;
    }
    function extract(prop,object) {
      return object[prop];
    }
    function include ( arg_name, arg_value, api_element ) {
      if(api_element.matches('[include~="'+arg_name+'"]')) {
        var included_properties = api_element.getAttribute('include-'+arg_name);
        if(!!included_properties) {
          included_properties = included_properties.split(/\s+/g);
          var included_arg_value = arg_value;
          for(var prop of included_properties) {
            included_arg_value[prop] = api_element.getAttribute(prop);
          }
          arg_value = included_arg_value;  
        }  else {
          console.log("No included properties.", api_element, "indicates it includes", arg_name, "and specifies no properties of var_name to include.");
        }
      }
      return arg_value;
    }
    function project ( arg_name, arg_value, api_element ) {
      if(api_element.matches('[project~="'+arg_name+'"]')) {
        var projected_properties = api_element.getAttribute('project-'+arg_name);
        if(!!projected_properties) {
          projected_properties = projected_properties.split(/\s+/g);
          var projected_arg_value = {};
          for(var prop of projected_properties) {
            projected_arg_value[prop] = arg_value[prop];
          }
          arg_value = projected_arg_value;  
        }  else {
          console.log("No projected properties.", api_element, "indicates it projects", arg_name, "and specifies no properties of var_name to project.");
        }
      }
      return arg_value;
    }  
  /* api */
  this.attr = attr;
  this.get = get;
  this.get_all = get_all;
  this.extract = extract;
  this.include = include;
  this.project = project;
});

