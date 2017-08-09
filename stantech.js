// globals
function send_message(msg,cb) {
		if(!msg.id) {
			msg.id = Math.round(Math.random()*1000000);
		}
		//console.log("Sending msg ",msg.id, " : ", JSON.stringify(msg));
		chrome.runtime.sendMessage(msg,function(resp) {
				//console.log("Received response ", resp.id, " : ", JSON.stringify(resp));
				if(!!cb && !!resp.ok) {
					cb(resp);
				} else {
					console.error("Receive error ", resp.id, " : ", JSON.stringify(resp));
				}
			});
}
function all_pairs(list) {
	// assymetric, order-ignoring
	var pairs = [];
	for(var i = 0; i < list.length-1; i += 1) {
		for(var j = i+1; j < list.length; j+= 1) {
			pairs.push([list[i],list[j]]);
		}
	}
	return pairs;
}
function stringify(root) {
	if(!root) {
		return "";
	}
	var stack = [root], join=[];
	while(stack.length > 0) {
		var op = stack.shift();
		if(!!op && !!op.val) {
			for(var i = 0; i < op.val.length; i += 1) {
				if(!!op.val[i]) {
					stack.push(op.val[i]);
				}
			}		
		} else if (!!op) {
			join.push(op);
		}
	}
	return join.join('');
}
function inherits(parent_class, child_class) {
	function F() {}
	F.prototype = parent_class;
	child_class.prototype = new F();
}
function clone(obj,template) {
	var tkeys = Object.keys(template);
	tkeys.forEach( function (key) {
			obj[key] = template[key];
		} );
	return obj;
}
function unicodeAt (str,idx) {
	// supports vs01 - vs16 variation selectors (i.e., ignores them)
	// does not support vs17 - vs256 variation selectors,
	// or fvs1 - fvs3 variation selectors for mongolian (i.e., these are treated as characters )
	// at some point vs17 - vs256, and fvs1 - fvs3 should be totally ignored here too.
	var ret = '';
	str += '';
	var end = str.length;

	var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]|.[\uFE00-\uFE0F]/g;
	while ((surrogatePairs.exec(str)) != null) {
		var li = surrogatePairs.lastIndex;
		if (li - 2 < idx) {
			idx+=1;
		} else {
			break;
		}
	}

	if (idx >= end || idx < 0) {
		return '';
	}

  	ret += str.charAt(idx);

	if ((/[\uD800-\uDBFF]/.test(ret) && /[\uDC00-\uDFFF]/.test(str.charAt(idx+1))) || /[\uFE00-\uFE0F]/.test(str.charAt(idx+1))) {
		ret += str.charAt(idx+1); 	
	}
	return ret;
}
if (!String.prototype.codePointAt) {
	String.prototype.codePointAt = function (pos) {
		pos = isNaN(pos) ? 0 : pos;
		var str = String(this),
		    code = str.charCodeAt(pos),
		    next = str.charCodeAt(pos + 1);
		if (0xD800 <= code && code <= 0xDBFF && 0xDC00 <= next && next <= 0xDFFF) {
		    return ((code - 0xD800) * 0x400) + (next - 0xDC00) + 0x10000;
		}
		return code;
	};
}
if (!String.fromCodePoint) {
	String.fromCodePoint = function fromCodePoint () {
		var chars = [], point, offset, units, i;
		for (i = 0; i < arguments.length; ++i) {
			point = arguments[i];
			offset = point - 0x10000;
			units = point > 0xFFFF ? [0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF)] : [point];
			chars.push(String.fromCharCode.apply(null, units));
		}
		return chars.join("");
	};
}
function query_free_url() {
	if(!window._query_free_url) {
		window._query_free_url = document.location.protocol+'//'+document.location.hostname+document.location.pathname;
	}
	return decodeURI(window._query_free_url);
}
function modify_by_func(dic,func) {
	if(typeof(func) !== 'function') {
		console.error("Error modify_by_func called with",func,"not a function");
		return dic;
	}
	var keys = Object.keys(dic), key;
	for(var i = 0; i < keys.length; i+=1) {
		key = keys[i];
		dic[key] = func(key,dic[key]);
	}
	return dic;
};
function key_value_pairs(dic) {
	var tuples = [];
	var keys = Object.keys(dic), key;
	for(var i = 0; i < keys.length; i+=1) {
		key = keys[i];
		tuples.push({key:key,value:dic[key]});
	}
	return tuples;
}
function sort_by_func(dic,reverse,func) {
	return key_value_pairs(dic).sort(func);
}
function sort_by_values(dic,reverse) {
	var true_positive = reverse ? -1 : 1;
	return sort_by_func(dic,reverse,function(a,b) {
			if(a.value > b.value) {
				return true_positive;
			} else if (a.value < b.value) {
				return true_positive * -1;
			} 
			return 0;
		} );
}
function sort_by_keys(dic,reverse) {
	var true_positive = reverse ? -1 : 1;
	return sort_by_func(dic,reverse,function(a,b) {
			if(a.key > b.key) {
				return true_positive;
			} else if (a.key < b.key) {
				return true_positive * -1;
			} 
			return 0;
		} );
}
function intersection(dic1,dic2) {
	if(!dic1 || !dic2) {
		return undefined;
	}
	var keys1 = Object.keys(dic1);
	var i = {};
	var empty = true;
	for(var j = 0; j < keys1.length; j+=1 ) {
		var key = keys1[j];
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
function union(dic1,dic2) {
	if(!dic1) {
		return dic2 || undefined;
	}
	if(!dic2) {
		return dic1 || undefined;
	}
	var keys = Object.keys(dic1).concat(Object.keys(dic2));
	var u = {};
	for(var j = 0; j < keys.length; j+=1 ) {
		var key = keys[j];
		u[key] = 1;
	}
	if(Object.keys(u).length == 0) {
		return undefined;
	}
	return u;	
}
function order(dic) {
	if(!dic) {
		return 0;
	} else {
		return Object.keys(dic).length;
	}
}
function union_add(dic1,dic2) {
	// must be numerically valued
	if(!dic1) {
		return dic2 || undefined;
	}
	if(!dic2) {
		return dic1 || undefined;
	}
	var keys = Object.keys(dic1).concat(Object.keys(dic2));
	var u = {};
	for(var j = 0; j < keys.length; j+=1 ) {
		var key = keys[j];
		u[key] = (dic1[key] || 0) + (dic2[key] || 0);
	}
	if(Object.keys(u).length == 0) {
		return undefined;
	}
	return u;	
}
function unionall(list,exclude) {
	exclude = exclude || {};
	if(!list) {
		return undefined;
	}
	var bigu = {};
	if(!(list instanceof Array)) {
		var keys = Object.keys(list);
		newlist = [];
		keys.forEach( function ( key ) {
				if(!exclude.key) {
					newlist.push(list[key]);
				}
			} );	
		list = newlist;
	}
	list.forEach( function ( li ) {
				bigu = union(bigu, li);
		} );
	var order = Object.keys(bigu).length;
	if(order == 0) {
		return undefined;
	}
	return bigu;
}
// StanTech setup
var StanTech = {
	name : '##ST ' + query_free_url() + ' Stan Tech( ' + (!!chrome && !!chrome.extension ? 'extension' : 'hostpage')+' ): ',
	_say : function () {
		var curry = Array.prototype.slice.call(arguments,0);
		return function() {
			var args = curry.concat(Array.prototype.slice.call(arguments, 0));
			Function.apply.call(console.log, console, args);
		};
	},
	init : function()  {
		window.StanTech.say = window.StanTech._say(window.StanTech.name);
		window.StanTech.say('Loading mouse handlers...');
		function track_mouse(e) {
			window.StanTech.mouse = {clientX:e.clientX, clientY:e.clientY};
		}
		window.StanTech.mouse = {clientX:0,clientY:0};
		window.addEventListener('mousemove',track_mouse);
		window.StanTech.say('setup');
	}
};
StanTech.init();
