var PairingCombination = function(cell) {
	function lookupKey()  {
		return cell.parent().find("td:first").text() + "-" + $(cell.parents().find("th")[cell[0].cellIndex]).text();
	}
	
	function saveToCell(days) {
		cell.text(days.join(" & "));
	}
	
	function daysInCell() {
		return _(cell.text().split(" & ")).reject(function(day) { return day == "" });
	}
	
	function add(day) {
		var days = daysInCell();
		if(! _.include(days, day.name())) {
			days.push(day.name());
			saveToCell(days);
		}
		return obj;		
	}

	function saveInto(store) {
		store.put(lookupKey(), daysInCell());
	}
	
	function loadFrom(store) {
		var previousDaysPaired = store.get(lookupKey()) || [];		
		saveToCell(previousDaysPaired);
	}
	
	var obj = { saveInto : saveInto, loadFrom : loadFrom, add : add };				
	return obj;	
}

var Day = function(day) {
	return { 
		name : function() { 
			return day.draggable.text(); 
		} 
	};
}

var Grid = function(rootElement) {
	function rows() {
		return rootElement.find("tr");
	}
	
	function workingGrid() {
		return _(rows()).map(function(row) { return _($(row).find("td")).map(function(item) { return $(item); }); })
					  .map(function(elements) { return elements.slice(1); })
					  .filter(function(entry) { return entry.length > 0; });
	}
	
	function actionableGrid() {
		return _(workingGrid()).map(function(row, idx) { return row.slice(idx+1);  });
	}	
	
	function inertGrid() {
		return _(workingGrid()).map(function(row, idx) { return row.slice(0, idx+1) });
	}
	
	function applyToGrid(grid, fn) {
		$.each(grid, function (idx, row) {
			$.each(row, function () {
				fn($(this));
			});
		});		
	}
		
		
	var obj = {
		rows : rows,
		workingGrid : workingGrid,
		init : function(eventHandlers) {
			applyToGrid(actionableGrid(), function (cell) { $(cell).droppable({ drop: eventHandlers.dayDropped }); });
			applyToGrid(actionableGrid(), eventHandlers.loadPairings);
			applyToGrid(inertGrid(), function (cell) { $(cell).addClass("black"); });
		}
	};
	return obj;
}

var GridBuilder = function() {
	var people = [];
	var obj = {
		add : function(person) {
			people.push(person);
			return this;
		},
		build : function() {
			var html = "<table id=\"droppable\">";
			html += buildHeader();			
			html += _.reduce(people, function(acc, person) { return acc + "<tr><td>" + person + "</td>" + addEmptyCells() + "</tr>"; }, "")
			html += "</table>"
			
			$(".pairstair").html(html);
		}
	};
	
	function addEmptyCells() {
		return _.reduce(people, function(acc, _) { return acc + "<td></td>";  }, "")
	}
	
	function buildHeader() {
		return  _.reduce(people, function(acc, person) { return acc + "<th>" + person + "</th>"  }, "<tr><th>Name</th>") + "</tr>";
	}
	
	return obj;
}

var PairStair = function () {
	"use strict";
	GridBuilder().add("Dave").add("Mark").add("Rob").build();
	var grid = Grid($("table"));	
	var obj = {
		init : function () {
			resetPairStair();
			$(".reset-stair").click(function() {
				store.reset();
				resetPairStair();
			});			
		}
	};
	
	function resetPairStair() {
		grid.init({ dayDropped : dayDropped, loadPairings : loadPairings });
		setUpDraggableDays();		
	}

	function applyToGrid(grid, fn) {
		$.each(grid, function (idx, row) {
			$.each(row, function () {
				fn($(this));
			});
		});		
	}	
	
	function actionableGrid() {
		return _(grid.workingGrid()).map(function(row, idx) { return row.slice(idx+1);  });
	}
	
	function setupGrid() {
		applyToGrid(actionableGrid(), function (cell) { $(cell).droppable({ drop: dayDropped }); });
		applyToGrid(actionableGrid(), loadPairings)
	}
	
	function dayDropped(event, dayElement){ 
		PairingCombination($(this)).add(Day(dayElement)).saveInto(store);			
	}
	
	function loadPairings(cell) {
		PairingCombination(cell).loadFrom(store);
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