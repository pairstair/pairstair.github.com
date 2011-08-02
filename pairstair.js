var PairingCombination = function(cell) {
	function pairNames()  {
		return cell.parent().find("td:first").text() + "-" + $(cell.parents().find("th")[cell[0].cellIndex]).text();
	}
	
	function update(newValue) {
		cell.text(newValue);
	}
	
	function saveInto(store) {
		store.put(pairNames(), cell.text())
	}
	
	function loadFrom(store) {
		var previousDaysPaired = store.get(pairNames());		
		update(previousDaysPaired);
	}
	
	var obj = { pairNames : pairNames, update : update, saveInto : saveInto, loadFrom : loadFrom };				
	return obj;	
}

var PairStair = function () {
	"use strict";
	
	var rows = $("table tr"), obj = {
		init : function () {
			setupGrid();
			setUpDraggableDays();
			$(".reset-stair").click(function() {
				store.reset();
				setupGrid();
				setUpDraggableDays();
			});			
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
		return _(rows).map(function(row) { return _($(row).find("td")).map(function(item) { return $(item); }); })
					  .map(function(elements) { return elements.slice(1); })
					  .filter(function(entry) { return entry.length > 0; });
	}
	
	function inertGrid() {
		return _(workingGrid()).map(function(row, idx) { return row.slice(0, idx+1) });
	}
	
	function actionableGrid() {
		return _(workingGrid()).map(function(row, idx) { return row.slice(idx+1);  });
	}
	
	function setupGrid() {
		applyToGrid(actionableGrid(), function (cell) { $(cell).droppable({ drop: dayDropped }); });
		applyToGrid(actionableGrid(), loadPairings)
		applyToGrid(inertGrid(), function (cell) { $(cell).addClass("black"); });	
	}
	
	function addTheDayOfTheWeekToTheChart(day){
		return function(index, existingDays) {
			if(existingDays !== "" && existingDays.indexOf(day.draggable.text()) !== -1)	 {
				return;	
			} else if(existingDays !== "") {
				return " & " + day.draggable.text();
			} else {
				return day.draggable.text();
			}
		}	
	}
	
	function dayDropped(event, day){ 
		var cell = $(this);
		var pairingCombination = PairingCombination(cell);
		cell.append(addTheDayOfTheWeekToTheChart(day));				
		pairingCombination.saveInto(store);
	}
	
	function loadPairings(cell) {
		var pairingCombination = PairingCombination(cell)
		pairingCombination.loadFrom(store);
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