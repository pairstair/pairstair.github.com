var PairStair = function () {
	"use strict";
	
	var rows = $("table tr"), obj = {
		init : function () {
			setupGrid();
			setUpDraggableDays();
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
		applyToGrid(actionableGrid(), function (cell) { 
			$(cell).droppable({
				 drop: function (event, ui) { 
					$(this).addClass("red"); 
					$(this).append(addTheDayOfTheWeekToTheChart(ui));
				}
			}); 
		});
		applyToGrid(inertGrid(), function (cell) { $(cell).addClass("black"); });	
	}
	
	function addTheDayOfTheWeekToTheChart(ui){
		return function(index, existingDays) {
			if(existingDays !== "" && existingDays.indexOf(ui.draggable.text()) !== -1)	 {
				return;	
			} else if(existingDays !== "") {
				return "& " + ui.draggable.text();
			} else {
				return ui.draggable.text();
			}
		}	
	}
	
	function setUpDraggableDays() {
		$( "#draggable p" ).draggable({ 
			revert: true,
			snap: true,
			zIndex: 2700,
			revertDuration: 0	
		});
	}
	
	return obj;
};
