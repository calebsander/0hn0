var rows = document.getElementById('grid');
if (rows) {
	var Tile = function(empty, blue, number) {
		if (blue === undefined) this.empty = empty;
		else if (number === undefined) {
			this.empty = empty;
			this.blue = blue;
		}
		else {
			this.empty = empty;
			this.blue = blue;
			this.number = number;
		}
	};
	Tile.fromNode = function(node) {
		var inner = node.childNodes[0];
		var sub = inner.childNodes[0];
		if (sub.innerHTML) return new Tile(false, true, Number(sub.innerHTML));
		else if (inner.classList.contains('tile-1')) return RED_TILE;
		else if (inner.classList.contains('tile-2')) return BLUE_TILE;
		else return EMPTY_TILE;
	}
	Tile.prototype = {
		equals: function(tile) {
			if (this.empty != tile.empty) return false;
			if (this.empty && tile.empty) return true;
			if (this.blue == tile.blue) return true;
			return false;
		},
		getNumber: function() {
			return this.number;
		},
		toString: function() {
			if (this.equals(EMPTY_TILE)) return ' ';
			if (this.equals(RED_TILE)) return 'R';
			if (this.number === undefined) return 'B';
			return String(this.number);
		}
	};
	var EMPTY_TILE = new Tile(true);
	var RED_TILE = new Tile(false, false);
	var BLUE_TILE = new Tile(false, true);

	var Direction = function(di, dj) {
		this.di = di;
		this.dj = dj;
	};
	Direction.prototype = {
		getDI: function() {
			return this.di;
		},
		getDJ: function() {
			return this.dj;
		}
	};
	var directions = [new Direction(-1, 0), new Direction(1, 0), new Direction(0, -1), new Direction(0, 1)];

	var Address = function(i, j) {
		this.i = i;
		this.j = j;
	};
	Address.prototype = {
		increment: function(direction) {
			this.i += direction.getDI();
			this.j += direction.getDJ();
		},
		getI: function() {
			return this.i;
		},
		getJ: function() {
			return this.j;
		},
		clone: function() {
			return new Address(this.i, this.j);
		}
	};

	var Board = function(tiles) {
		this.board = [];
		this.board.length = tiles.length;
		for (var i = 0, j; i < this.size(); i++) {
			this.board[i] = [];
			for (j = 0; j < this.size(); j++) this.setAt(new Address(i, j), tiles[i][j]);
		}
	};
	Board.prototype = {
		size: function() {
			return this.board.length;
		},
		getAt: function(address) {
			var i = address.getI(), j = address.getJ();
			if (i < 0 || i > this.size() - 1 || j < 0 || j > this.size() - 1) return RED_TILE;
			return this.board[i][j];
		},
		setAt: function(address, tile) {
			var i = address.getI(), j = address.getJ();
			if (i > -1 && i < this.size() && j > -1 && j < this.size()) this.board[i][j] = tile;
		},
		count: function(addressIn) {
			var address = addressIn.clone();
			var original = address.clone();
			var count = 0;
			for (var direction in directions) {
				address.increment(directions[direction]);
				while (this.getAt(address).equals(BLUE_TILE)) {
					count++;
					address.increment(directions[direction]);
				}
				address = original.clone();
			}
			return count;
		},
		possibleCount: function(addressIn, direction) {
			var address = addressIn.clone();
			var count = 0;
			address.increment(direction);
			while (!this.getAt(address).equals(RED_TILE)) {
				count++;
				address.increment(direction);
			}
			return count;
		},
		additionalConnection: function(addressIn, direction) {
			var address = addressIn.clone();
			address.increment(direction);
			while (this.getAt(address).equals(BLUE_TILE)) address.increment(direction);
			if (this.getAt(address).equals(RED_TILE)) return 0;
			var count = 1;
			address.increment(direction);
			while (this.getAt(address).equals(BLUE_TILE)) {
				count++;
				address.increment(direction);
			}
			return count;
		},
		fillRed: function() {
			var address, newAddress, allRed, direction;
			for (var i = 0, j; i < this.size(); i++) {
				for (j = 0; j < this.size(); j++) {
					address = new Address(i, j);
					if (this.getAt(address).equals(EMPTY_TILE)) {
						allRed = true;
						for (direction in directions) {
							newAddress = address.clone();
							newAddress.increment(directions[direction]);
							if (!this.getAt(newAddress).equals(RED_TILE)) {
								allRed = false;
								break;
							}
						}
						if (allRed) this.setAt(address, RED_TILE);
					}
				}
			}
		},
		avoidJumps: function() {
			var address, tile, number, count, direction, newAddress;
			var changes = 0;
			for (var i = 0, j; i < this.size(); i++) {
				for (j = 0; j < this.size(); j++) {
					address = new Address(i, j);
					if ((tile = this.getAt(address)).equals(BLUE_TILE) && (number = tile.getNumber())) {
						count = this.count(address);
						for (direction in directions) {
							if (count + this.additionalConnection(address, directions[direction]) > number) {
								newAddress = address.clone();
								newAddress.increment(directions[direction]);
								while (this.getAt(newAddress).equals(BLUE_TILE)) newAddress.increment(directions[direction]);
								this.setAt(newAddress, RED_TILE);
								changes++;
							}
						}
					}
				}
			}
			return changes;
		},
		fillNecessary: function() {
			var address, newAddress, tile, number, direction, subDirection, possibleOtherCount, filled;
			for (var i = 0, j; i < this.size(); i++) {
				for (j = 0; j < this.size(); j++) {
					address = new Address(i, j);
					if ((tile = this.getAt(address)).equals(BLUE_TILE) && (number = tile.getNumber())) {
						for (direction in directions) {
							possibleOtherCount = 0;
							for (subDirection in directions) {
								if (subDirection != direction) possibleOtherCount += this.possibleCount(address, directions[subDirection]);
							}
							newAddress = address.clone();
							for (filled = 0; filled < number - possibleOtherCount; filled++) {
								newAddress.increment(directions[direction]);
								if (this.getAt(newAddress).equals(EMPTY_TILE)) this.setAt(newAddress, BLUE_TILE);
							}
						}
					}
				}
			}
		},
		solve: function() {
			this.fillRed();
			this.avoidJumps();
			this.fillNecessary();
		},
		equals: function(board) {
			if (this.size() != board.size()) return false;
			var address;
			for (var i = 0, j; i < this.size(); i++) {
				for (j = 0; j < this.size(); j++) {
					address = new Address(i, j);
					if (!this.getAt(address).equals(board.getAt(address))) return false;
				}
			}
			return true;
		},
		clone: function(board) {
			var tiles = [];
			for (var i = 0, j; i < this.size(); i++) {
				tiles[i] = [];
				for (j = 0; j < this.size(); j++) {
					tiles[i][j] = this.getAt(new Address(i, j));
				}
			}
			return new Board(tiles);
		}
	};

	rows = rows.childNodes[0].childNodes;
	var cells;
	var tiles = [];
	for (var i = 0, j; i < rows.length; i++) {
		cells = rows[i].childNodes;
		tiles[i] = [];
		for (j = 0; j < cells.length; j++) {
			tiles[i][j] = Tile.fromNode(cells[j]);
		}
	}

	var board = new Board(tiles);
	var oldboard;
	do {
		oldboard = board.clone();
		board.solve();
	} while (!board.equals(oldboard));

	function mousedown(element) {
		var event = document.createEvent('HTMLEvents');
		event.initEvent('mousedown', true, true);
		element.dispatchEvent(event);
		return element;
	}
	var address;
	for (i = 0; i < rows.length; i++) {
		cells = rows[i].childNodes;
		for (j = 0; j < cells.length; j++) {
			if (tiles[i][j].equals(EMPTY_TILE)) {
				address = new Address(i, j);
				if (board.getAt(address).equals(RED_TILE)) mousedown(mousedown(cells[j]));
				else if (board.getAt(address).equals(BLUE_TILE)) mousedown(cells[j]);
			}
		}
	}
}