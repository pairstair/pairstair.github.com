PairStair = function() {
	var rows = $("table tr");

	function setupGrid () {
		$.each(actionableGrid(), function(idx,row) {
			 $.each(row, function() {
				$(this).click(function(){
					colourRed($(this));
				});
			});
		});
		
		$.each(inertGrid(), function(idx,row) {
			 $.each(row, function() {
				$(this).addClass("black");
			});
		});		
	}
	
	function inertGrid() {
		var unactionable = new Array();
		
		$.each(workingGrid(), function(idx, row) {
			unactionable.push(row.slice(0, idx+1));
		});
		
		return unactionable;
	}
	
	function actionableGrid() {
		var actionable = new Array();
		
		$.each(workingGrid(), function(idx, row) {
			actionable.push(row.slice(idx+1));
		});
		
		return actionable;
	}	
	
	function workingGrid () {
		var matrix = new Array();
		rows.each(function(index) { 
			var cells = $(this).find("td");
			if(typeof cells != "undefined") {
				elements = new Array();
				cells.each(function(cellIndex) {
					elements[cellIndex]=$(this);
				});
				matrix[index-1] = elements.slice(1);
			}
		});
		return matrix;
	}

	function colourRed(cell) {
		cell.addClass("red");
	}
	
	var obj = {
		init : function() {
			setupGrid();
		}
	};
	
	return obj;
}