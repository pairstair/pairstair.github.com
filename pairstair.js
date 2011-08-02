var store = function(){
	var obj = { put : put, 
		        get : get,
		        reset : reset };
	
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
	
	var obj = { pairNames : pairNames,
			    update : update,
			    saveInto : saveInto };
				
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
		return _(rows).chain().map(function(item) { return $(item).find("td"); })
			          		  .map(function(cells) { return _(cells).map(function(item) { return $(item); }) })
					  		  .map(function(elements) { return elements.slice(1); })
					  		  .filter(function(entry) { return entry.length > 0; })					
		  			  		  .value();
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
				 drop: dayDropped
			}); 
		});
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
		var cell  = $(this);
		var ourPairingCombination = PairingCombination(cell);
		cell.append(addTheDayOfTheWeekToTheChart(day));				
		ourPairingCombination.saveInto(store);
	}
	
	function loadPairings(cell) {
		var ourPairingCombination = PairingCombination(cell)
		var previousDaysPaired = store.get(ourPairingCombination.pairNames());		
		ourPairingCombination.update(previousDaysPaired);
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