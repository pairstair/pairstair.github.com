var PairingCombination = function(cell) {
	function lookupKey()  {
		return cell.parent().find("td:first").text() + "-" + $(cell.parents().find("th")[cell[0].cellIndex]).text();
	}
	
	function add(day) {
		var days = _(cell.text().split(" & ")).reject(function(day) { return day == "" })
		if(! _.include(days, day.name())) {
			days.push(day.name());
			cell.text(days.join(" & "));
		}
		return obj;		
	}
	
	function update(newValue) {
		cell.text(newValue);
	}
	
	function saveInto(store) {
		store.put(lookupKey(), cell.text());
	}
	
	function loadFrom(store) {
		var previousDaysPaired = store.get(lookupKey());		
		update(previousDaysPaired);
	}
	
	var obj = { update : update, saveInto : saveInto, loadFrom : loadFrom, add : add };				
	return obj;	
}

var Day = function(day) {
	return { 
		name : function() { 
			return day.draggable.text() 
		} 
	};
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
	
	function dayDropped(event, dayElement){ 
		PairingCombination($(this)).add(Day(dayElement)).saveInto(store);			
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