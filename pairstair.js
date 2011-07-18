function colourEmBlack () {
	$("table tr").each(function(index) { 
		var cells = $(this).find("td");
		if(typeof cells != "undefined") {
			$(cells.slice(1,index+1)).addClass("black"); 
		} 
	})
}	
