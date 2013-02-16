function MazeGeneratorTest()
{
	this.main = function()
	{
		var mazeSizeInCells = new Coords(16, 16);
		var maze = Maze.generateRandom(mazeSizeInCells);

		document.body.appendChild(maze.htmlElementBuild());
	}
}

// classes

function Coords(x, y)
{
	this.x = x;
	this.y = y;
}
{
	Coords.prototype.add = function(other)
	{
		this.x += other.x;
		this.y += other.y;

		return this;
	}

	Coords.prototype.isWithinRange = function(range)
	{
		var returnValue = 
		(
			this.x >= 0
			&& this.x < range.x
			&& this.y >= 0
			&& this.y < range.y
		);

		return returnValue;
	}

	Coords.prototype.overwriteWith = function(other)
	{
		this.x = other.x;
		this.y = other.y;

		return this;
	}

	Coords.prototype.overwriteWithDimensions = function(x, y)
	{
		this.x = x;
		this.y = y;

		return this;
	}

}

function Maze()
{
	// do nothing
}
{
	// static methods

	Maze.generateRandom = function(sizeInCells)
	{
		var returnValue = new Maze();

		returnValue.sizeInCells = sizeInCells;
		returnValue.cells = new Array();

		var numberOfCells = sizeInCells.x * sizeInCells.y;

		for (var i = 0; i < numberOfCells; i++)
		{
			var cell = new MazeCell();
			returnValue.cells.push(cell);
		}

		var neighborOffsets = returnValue.neighborOffsets_Get();

		var numberOfNeighbors = neighborOffsets.length;

		var cellPos = new Coords(-1, -1);
		var cellPosNeighbor = new Coords(-1, -1);

		var numberOfCellsInLargestNetworkSoFar = 0;

		while (numberOfCellsInLargestNetworkSoFar  < numberOfCells)
		{
			for (var y = 0; y < sizeInCells.y; y++)
			{
				cellPos.y = y;
			
				for (var x = 0; x < sizeInCells.x; x++)
				{
					cellPos.x = x;

					var numberOfCellsInNetworkMerged = Maze.generateRandom_ConnectCellToRandomNeighbor
					(
						returnValue,
						sizeInCells,
						cellPos, 
						neighborOffsets, 
						numberOfNeighbors,
						cellPosNeighbor
					);

					if (numberOfCellsInNetworkMerged > numberOfCellsInLargestNetworkSoFar)
					{
						numberOfCellsInLargestNetworkSoFar = numberOfCellsInNetworkMerged
					}
				}
			}			
		}

		return returnValue;
	}

	Maze.generateRandom_ConnectCellToRandomNeighbor = function
	(
		maze, 
		sizeInCells,
		cellPos, 
		neighborOffsets, 
		numberOfNeighbors, 
		cellPosNeighbor
	)
	{
		var numberOfCellsInNetworkMerged = 0;

		var cellCurrent = maze.cellAtPos(cellPos);

		var neighborOffsetIndex = Math.floor(Math.random() * numberOfNeighbors);
					
		var neighborOffset = neighborOffsets[neighborOffsetIndex];

		cellPosNeighbor.overwriteWith(cellPos).add(neighborOffset);

		if (cellPosNeighbor.isWithinRange(sizeInCells) == true)
		{
			if (cellCurrent.connectedToNeighborsNESW[neighborOffsetIndex] == false)
			{
				var cellNeighbor = maze.cellAtPos(cellPosNeighbor);

				if (cellCurrent.network.networkID != cellNeighbor.network.networkID)
				{
					cellCurrent.connectedToNeighborsNESW[neighborOffsetIndex] = true;

					var neighborOffsetIndexReversed = (neighborOffsetIndex + 2) % numberOfNeighbors;
					cellNeighbor.connectedToNeighborsNESW[neighborOffsetIndexReversed] = true;

					var networkMerged = Network.MergeNetworks
					(
						cellCurrent.network,
						cellNeighbor.network
					);

					numberOfCellsInNetworkMerged = networkMerged.cells.length;
				}
			}
		}	

		return numberOfCellsInNetworkMerged;	
	}

	// instance methods

	Maze.prototype.cellAtPos = function(cellPos)
	{
		var cellIndex = this.indexOfCellAtPos(cellPos);
		return this.cells[cellIndex];
	}

	Maze.prototype.htmlElementBuild = function()
	{
		var returnValue = document.createElement("table");
		returnValue.style.fontFamily = "Courier New"; 
		returnValue.cellSpacing = 0;
		returnValue.cellPadding = 0;

		var cellPos = new Coords(-1, -1);
		var numberOfNeighbors = 4;
		var neighborOffsets = this.neighborOffsets_Get();
		var innerTableCellPos = new Coords(-1, -1);

		var trForNorthWall = document.createElement("tr");
		for (var x = 0; x < this.sizeInCells.x + 1; x++)
		{
			var tdForNorthWall = document.createElement("td");
			tdForNorthWall.innerHTML = "[]";
			tdForNorthWall.style.backgroundColor = "#000000";
			trForNorthWall.appendChild(tdForNorthWall);
		}
		returnValue.appendChild(trForNorthWall);

		for (var y = 0; y < this.sizeInCells.y; y++)
		{
			cellPos.y = y;

			var trForRow = document.createElement("tr");			

			var tdForWestWall = document.createElement("td");
			tdForWestWall.innerHTML = "[]";
			tdForWestWall.style.backgroundColor = "#000000";
			trForRow.appendChild(tdForWestWall);

			for (var x = 0; x < this.sizeInCells.x; x++)
			{
				cellPos.x = x;
				var cellCurrent = this.cellAtPos(cellPos);

				var tableInnerForCell = document.createElement("table");
				tableInnerForCell.cellPadding = 0;
				tableInnerForCell.cellSpacing = 0;

				for (var yy = 0; yy < 2; yy++)
				{	
					var trInnerForCell = document.createElement("tr");
			
					for (var xx = 0; xx < 2; xx++)
					{
						var tdInnerForCell = document.createElement("td");
						tdInnerForCell.innerHTML = "[]";
						tdInnerForCell.style.backgroundColor = "#000000";
						trInnerForCell.appendChild(tdInnerForCell);
					}

					tableInnerForCell.appendChild(trInnerForCell);
				}

				tableInnerForCell.children[0].children[0].style.backgroundColor = "#ffffff";

				for (var n = 1; n <= 2; n++) // e and s only
				{
					var isConnectedToNeighbor = cellCurrent.connectedToNeighborsNESW[n];

					if (isConnectedToNeighbor == true)
					{
						var neighborOffset = neighborOffsets[n];
						innerTableCellPos.overwriteWith(neighborOffset);

						tableInnerForCell.children[innerTableCellPos.y].children[innerTableCellPos.x].style.backgroundColor = "#ffffff";
					}
				}

				var tdForCell = document.createElement("td");
				tdForCell.appendChild(tableInnerForCell);
				trForRow.appendChild(tdForCell);
			}

			returnValue.appendChild(trForRow); 
		}

		this.htmlElement = returnValue;

		return returnValue;
	}

	Maze.prototype.indexOfCellAtPos = function(cellPos)
	{
		var cellIndex = cellPos.y * this.sizeInCells.x + cellPos.x;

		return cellIndex;
	}

	Maze.prototype.neighborOffsets_Get = function()
	{
		return new Array
		(
			new Coords(0, -1),
			new Coords(1, 0),
			new Coords(0, 1),
			new Coords(-1, 0)
		);
	}
}

function MazeCell()
{
	this.connectedToNeighborsNESW = new Array(false, false, false, false);
	this.network = new Network();
	this.network.cells.push(this);
}

function Network()
{
	this.networkID = Network.MaxIDSoFar;
	Network.MaxIDSoFar++;
	this.cells = new Array();
}
{
	Network.MaxIDSoFar = 0;

	Network.MergeNetworks = function(network0, network1)
	{
		var networkMerged = new Network();

		var networksToMerge = new Array(network0, network1);

		var numberOfNetworks = networksToMerge.length;

		for (var n = 0; n < numberOfNetworks; n++)
		{
			var network = networksToMerge[n];
			for (var c = 0; c < network.cells.length; c++)
			{
				var cell = network.cells[c];
				cell.network = networkMerged;
				networkMerged.cells.push(cell);
			}
		}

		return networkMerged;
	}


}


// run

new MazeGeneratorTest().main();