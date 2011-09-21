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

var DateStickies = function() {
	var weekday=new Array(7); 
	weekday[0]="Sunday";
	weekday[1]="Monday";
	weekday[2]="Tuesday";
	weekday[3]="Wednesday";
	weekday[4]="Thursday";
	weekday[5]="Friday";
	weekday[6]="Saturday";
	date = new Date();
	
	function setUpDraggableDays() {		
		_.each($( "#draggable p"), function(day){
			if($(day).text() === weekday[date.getDay()]) {
				$(day).addClass("today")
			}
		});

		$( "#draggable p" ).draggable({ 
			revert: true,
			snap: true,
			zIndex: 2700,
			revertDuration: 0	
		});
	}
	
	function dayDropped(event, dayElement){ 
		PairingCombination($(this)).add(Day(dayElement)).saveInto(store);			
	}
	
	var obj = {
		setUpDraggableDays: setUpDraggableDays, 
		dayDropped: dayDropped
	}
	
	return obj;
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
	
	function toGridBuilder() {
		var currentPeople = _.map(rootElement.find("tr th").splice(1), function(person) { return $(person).text(); });
		
		var gridBuilder = GridBuilder();
		$.each(currentPeople, function(index, person) {
			gridBuilder.add(person);
		});
		return gridBuilder; 
	}
		
		
	var obj = {
		rows : rows,
		workingGrid : workingGrid,
		init : function(eventHandlers) {
			console.log(workingGrid());
			
			applyToGrid(inertGrid(), function (cell) { $(cell).addClass("black"); });
		},
		toGridBuilder : toGridBuilder
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
		addAll: function(peeps) {
		    _.each(peeps, function(person) {people.push(person);});
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
		
	var obj = {
		init : function () {
			$.getJSON("http://localhost:3000/git/people?jsonpCallback=?", function(data) {
				GridBuilder().addAll(data).build();	
				var grid = Grid($("table"));
				
				resetPairStair(grid);
				$(".reset-stair").click(function() {
					store.reset();
					resetPairStair(dateStickies);
				});		

				$("#add-new-person").click(function(e) {
					grid.toGridBuilder().add($("#new-person").val()).build();
					grid = Grid($("table"));
					resetPairStair(grid);
					e.preventDefault();
				});				
				
			});			
			

		}
	};
	
	function resetPairStair(grid) {
		grid.init();	
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
	
	return obj;
};