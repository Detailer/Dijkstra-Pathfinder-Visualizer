import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';

import './PathfindingVisualizer.css';

var START_NODE_ROW = 10;
var START_NODE_COL = 15;
var FINISH_NODE_ROW = 10;
var FINISH_NODE_COL = 35;
var flag1 = false;
var flag2 = false;


export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({grid});
  }

  // Mouse Handling For Walls
  handleMouseDown(row, col) {
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid, mouseIsPressed: true});
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
  }

  handleMouseUp(row, col) {
    this.setState({mouseIsPressed: false});
  }

  // Mouse Handling for Start Node
  handleMouseDownStart(row, col) {
    const newGrid = getNewGridWithNoStartNode(this.state.grid, row, col);
    this.setState({grid: newGrid, mouseIsPressed: true});
    flag1 = true;
  }

  handleMouseEnterStart(row, col) {
    if (!this.state.mouseIsPressed){
      flag1 = false; 
      return;
    }
    const newGrid = getNewGridWithNoStartNode(this.state.grid, row, col);
    this.setState({grid: newGrid});  
  }

  handleMouseUpStart(row, col) {
    const newGrid = getNewGridWithStartNode(this.state.grid, row, col);
    this.setState({grid: newGrid});
    flag1 = false;
    START_NODE_ROW = row;
    START_NODE_COL = col;
    this.setState({mouseIsPressed: false});
  }

  // Mouse Handling for Finish Node
  handleMouseDownFinish(row, col) {
    const newGrid = getNewGridWithNoFinishNode(this.state.grid, row, col);
    this.setState({grid: newGrid, mouseIsPressed: true});
    flag2 = true;
  }

  handleMouseEnterFinish(row, col) {
    if (!this.state.mouseIsPressed){
      flag2 = false; 
      return;
    }
    const newGrid = getNewGridWithNoFinishNode(this.state.grid, row, col);
    this.setState({grid: newGrid});  
  }

  handleMouseUpFinish(row, col) {
    const newGrid = getNewGridWithFinishNode(this.state.grid, row, col);
    this.setState({grid: newGrid});
    flag2= false;
    FINISH_NODE_ROW = row;
    FINISH_NODE_COL = col;
    this.setState({mouseIsPressed: false});
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  render() {
    const {grid, mouseIsPressed} = this.state;

    return (
      <>
        <button class="button button2"onClick={() => this.visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm
        </button>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={
                        (isStart) ? 
                        (
                          (row, col) => this.handleMouseDownStart(row, col)
                        ) 
                        :
                        (
                          (isFinish) ? (row, col) => this.handleMouseDownFinish(row, col) :
                          (row, col) => this.handleMouseDown(row, col)
                        )
                      }
                      onMouseEnter={ 
                        (flag1 == true) ? 
                        (
                          (row, col) => this.handleMouseEnterStart(row, col) 
                        ) 
                        : 
                        (
                          (flag2 == true) ? (row, col) => this.handleMouseEnterFinish(row, col) :
                          (row, col) => this.handleMouseEnter(row, col) 
                        )
                        
                      }
                      onMouseUp={
                        (flag1 == true) ? 
                        (
                          (row, col) => this.handleMouseUpStart(row, col)
                        ) 
                        :
                        ( 
                          (flag2 == true) ?
                          (row, col) => this.handleMouseUpFinish(row, col) : 
                          (row, col) => this.handleMouseUp(row, col)
                        )
                      } 
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithStartNode = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isStart: !node.isStart,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithNoStartNode = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isStart: false,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithFinishNode = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isFinish: !node.isFinish,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithNoFinishNode = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isFinish: false,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
