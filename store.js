var store = function(){
	var obj = { put : put, get : get, reset : reset };
	
	function put(key, values) {
		amplify.store(key, values);
	}
	
	function get(key) {
		return amplify.store(key) || "";
	}
	
	function reset() {
		$.each(amplify.store(), function(key) { 
			amplify.store(key, null);
		}); 
	}
	
	return obj;
}();