var PairingCombination = function(cell) {
	function lookupKey()  {
		var person1 = cell.parent().find("td:first").text() ;
		var person2 = $(cell.parents().find("th")[cell[0].cellIndex]).text();
		return [person1.toLowerCase(), person2.toLowerCase()]
	}
	
	function set(daysSincePaired) {
		cell.text(daysSincePaired);
	}
	
	var obj = { lookupKey : lookupKey, set : set };				
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
	
	function fillInPairDays(data) {
		var cells = _(actionableGrid()).chain().map(function(row) {return _.map(row, function(cell) {return PairingCombination($(cell)); } )}).flatten().value();

		_.each(data, function(person) {
			var availablePairs = _.filter(cells, function(cell){
				return cell.lookupKey()[0] === person.name;
			});
			
			_.each(person.pairs, function(person){
				var pair = _.find(availablePairs, function(candidate) { return candidate.lookupKey()[1] === person.name; })
				if(pair) {
					pair.set(person.daysSincePaired);
				}
			});
		});
	}
		
	var obj = {
		rows : rows,
		workingGrid : workingGrid,
		init : function(data) {
			applyToGrid(inertGrid(), function (cell) { $(cell).addClass("black"); });
			fillInPairDays(data);
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
		addAll: function(peeps) {
		    _.each(peeps, function(person) {people.push(person);});
		    return this;
		},
		build : function() {
			var html = "<table id=\"droppable\">";
			html += buildHeader();			
			html += _.reduce(people, function(rows, person) { return rows + "<tr><td>" + person + "</td>" + addEmptyCells() + "</tr>"; }, "")
			html += "</table>"
			
			$(".pairstair").html(html);
		}
	};
	
	function addEmptyCells() {
		return _.reduce(people, function(acc, _) { return acc + "<td></td>";  }, "")
	}
	
	function buildHeader() {
		return  _.reduce(people, function(columns, person) { return columns + "<th>" + person + "</th>"  }, "<tr><th>Name</th>") + "</tr>";
	}
	
	return obj;
}

var PairStair = function () {
	"use strict";
		
	var obj = {
		init : function () {
			$.getJSON("http://localhost:3000/git/people?jsonpCallback=?", function(names) {
				GridBuilder().addAll(names).build();	

				var gridData = [], namesCopy = names.slice(0);
				var today = new Date();
				today.setHours(0,0,0,0);
				
				(function getPairs() {
					var name = namesCopy.shift();
					
					if(namesCopy.length == 0) {
						var grid = Grid($("table"));									
						grid.init(gridData);
						
					} else {
						$.getJSON("http://localhost:3000/git/pairs/" + name + "?jsonpCallback=?", function(data) {
							var peoplePairedWith = parsePairs(data);
							
							var pairs = [];
							$.each(peoplePairedWith, function (person, options) {
								pairs.push({name : person.toLowerCase(), daysSincePaired : (today - new Date(options.lastPaired)) / (1000*60*60*24)});
							});
							gridData.push({ name : name.toLowerCase(), pairs : pairs });
							getPairs();
						})						
					}
				})();
				
				
				
			});			

		}
	};
	
	
    function parsePairs(data) {
      var pairs = {};
      $.each(data, function(key, val) {
        $.each(val, function(person, numberOfCommits) {
          if(!pairs[person]) {
            pairs[person] = { timesPaired : 0, numberOfCommits : 0, lastPaired : "0" };
          }

          if(new Date(pairs[person]["lastPaired"]) < new Date(key)) {
            pairs[person]["lastPaired"] = key;
          }

          pairs[person]["timesPaired"] += 1;
          pairs[person]["numberOfCommits"] += numberOfCommits;
        });              		
      }); 
      return pairs;
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