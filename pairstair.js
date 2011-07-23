var PairStair = function () {
	"use strict";
	
	var rows = $("table tr"), obj = {
		init : function () {
			setupGrid();
		}
	};

	function applyToGrid(grid, fn) {
		$.each(grid, function (idx, row) {
			$.each(row, function () {
				fn($(this));
			});
		});		
	}
	
	function workingGrid() {
		var matrix = [];
		rows.each(function (index) { 
			var cells = $(this).find("td"), elements = [];
			if (typeof cells !== "undefined") {
				cells.each(function (cellIndex) {
					elements[cellIndex] = $(this);
				});
				matrix[index - 1] = elements.slice(1);
			}
		});
		return matrix;
	}
	
	function inertGrid() {
		var unactionable = [], grid = workingGrid();
		
		$.each(grid, function (idx, row) {
			unactionable.push(row.slice(0, idx + 1));
		});
		
		return unactionable;
	}
	
	function actionableGrid() {
		var actionable = [], grid = workingGrid();
		
		$.each(grid, function (idx, row) {
			actionable.push(row.slice(idx + 1));
		});
		
		return actionable;
	}	

	
	function setupGrid() {
		applyToGrid(actionableGrid(), function (cell) { $(cell).click(function () { $(this).addClass("red"); }); });
		applyToGrid(inertGrid(), function (cell) { $(cell).addClass("black"); });	
	}
	
	return obj;
};
