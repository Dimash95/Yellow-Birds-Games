import Tile from "./Tile";

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.isMoving = false;
    this.initializeGame();

    window.addEventListener("keydown", e => this.handleInput(e));
    document
      .getElementById("restart")
      .addEventListener("click", () => this.resetGame());
  }

  createEmptyGrid() {
    return Array(4)
      .fill()
      .map(() => Array(4).fill(null));
  }

  initializeGame() {
    this.addTile();
    this.addTile();
    this.draw();
  }

  addTile() {
    let emptyCells = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!this.grid[row][col]) emptyCells.push({ row, col });
      }
    }
    if (emptyCells.length > 0) {
      let { row, col } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.grid[row][col] = new Tile(); // Создаем новую плитку
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        this.drawTile(row, col);
      }
    }
  }

  drawTile(row, col) {
    const size = 100;
    const tile = this.grid[row][col];
    const value = tile ? tile.value : null;

    const colorMap = {
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f2b179",
      16: "#f59563",
      32: "#f67c5f",
      64: "#f65e3b",
      128: "#edcf72",
      256: "#edcc61",
      512: "#edc850",
      1024: "#edc53f",
      2048: "#edc22e",
    };

    this.ctx.fillStyle = colorMap[value] || "#cdc1b4";
    this.ctx.fillRect(col * size, row * size, size, size);

    if (value) {
      this.ctx.fillStyle = "black";
      this.ctx.font = "bold 40px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        value,
        col * size + size / 2,
        row * size + size / 2 + 15,
      );
    }
  }

  handleInput(event) {
    if (this.isMoving) return; // Если ход еще не завершен
    this.isMoving = true;

    switch (event.key) {
      case "ArrowUp":
        this.moveUp();
        break;
      case "ArrowDown":
        this.moveDown();
        break;
      case "ArrowLeft":
        this.moveLeft();
        break;
      case "ArrowRight":
        this.moveRight();
        break;
    }

    setTimeout(() => {
      this.isMoving = false;
    }, 200); // Небольшая задержка для завершения хода
  }

  moveRight() {
    let moved = false;
    const merged = Array(4)
      .fill()
      .map(() => Array(4).fill(false));

    for (let row = 0; row < 4; row++) {
      const line = this.getRow(row);
      const newLine = this.mergeLine(line.reverse(), merged).reverse();
      this.setRow(row, newLine);
      if (this.rowChanged(line, newLine)) moved = true;
    }

    if (moved) {
      this.addTile();
      this.updateScore();
      this.draw();
      if (this.checkGameOver()) alert("Game Over!");
    }
  }

  moveDown() {
    let moved = false;
    const merged = Array(4)
      .fill()
      .map(() => Array(4).fill(false));

    // Перебираем каждый столбец
    for (let col = 0; col < 4; col++) {
      const column = this.getColumn(col); // Получаем столбец
      const newColumn = this.mergeLine(column.reverse(), merged).reverse(); // Переворачиваем столбец, сливаем, потом переворачиваем обратно
      this.setColumn(col, newColumn); // Устанавливаем обновленный столбец
      if (this.columnChanged(column, newColumn)) moved = true; // Проверяем, были ли изменения
    }

    if (moved) {
      this.addTile();
      this.updateScore();
      this.draw();
      if (this.checkGameOver()) alert("Game Over!");
    }
  }

  moveLeft() {
    let moved = false;
    const merged = Array(4)
      .fill()
      .map(() => Array(4).fill(false));

    // Перебираем каждую строку
    for (let row = 0; row < 4; row++) {
      const line = this.getRow(row); // Получаем строку
      const newLine = this.mergeLine(line, merged); // Сливаем плитки в строке
      this.setRow(row, newLine); // Устанавливаем обновленную строку
      if (this.rowChanged(line, newLine)) moved = true; // Проверяем, были ли изменения
    }

    if (moved) {
      this.addTile();
      this.updateScore();
      this.draw();
      if (this.checkGameOver()) alert("Game Over!");
    }
  }

  moveUp() {
    let moved = false;
    const merged = Array(4)
      .fill()
      .map(() => Array(4).fill(false));

    // Перебираем каждый столбец
    for (let col = 0; col < 4; col++) {
      const column = this.getColumn(col); // Получаем столбец
      const newColumn = this.mergeLine(column, merged); // Сливаем плитки в столбце
      this.setColumn(col, newColumn); // Устанавливаем обновленный столбец
      if (this.columnChanged(column, newColumn)) moved = true; // Проверяем, были ли изменения
    }

    if (moved) {
      this.addTile();
      this.updateScore();
      this.draw();
      if (this.checkGameOver()) alert("Game Over!");
    }
  }

  mergeLine(line, merged) {
    // Фильтруем пустые значения из строки (null или undefined)
    const nonEmptyTiles = line.filter(
      tile => tile !== null && tile !== undefined,
    );

    // Механизм слияния плиток (например, для 2048)
    for (let i = 0; i < nonEmptyTiles.length - 1; i++) {
      if (
        nonEmptyTiles[i] &&
        nonEmptyTiles[i].value === nonEmptyTiles[i + 1].value
      ) {
        nonEmptyTiles[i].value *= 2; // Сливаем плитки
        merged[i] = true; // Обозначаем плитку как сливающуюся
        nonEmptyTiles[i + 1] = null; // Очистить следующую плитку
      }
    }

    // Сдвигаем плитки влево
    const newLine = nonEmptyTiles.filter(tile => tile !== null); // Оставляем только непустые плитки
    const emptyTiles = Array(4 - newLine.length).fill(null); // Заполняем оставшиеся места null
    return [...newLine, ...emptyTiles]; // Возвращаем объединенную строку
  }

  getRow(row) {
    return this.grid[row];
  }

  getColumn(col) {
    const column = [];
    for (let row = 0; row < 4; row++) {
      column.push(this.grid[row][col]);
    }
    return column;
  }

  setRow(row, line) {
    this.grid[row] = line;
  }

  setColumn(col, newColumn) {
    for (let row = 0; row < 4; row++) {
      this.grid[row][col] = newColumn[row];
    }
  }

  rowChanged(originalRow, newRow) {
    return JSON.stringify(originalRow) !== JSON.stringify(newRow);
  }

  columnChanged(originalColumn, newColumn) {
    return JSON.stringify(originalColumn) !== JSON.stringify(newColumn);
  }

  updateScore() {
    this.score = this.grid
      .flat()
      .reduce((sum, tile) => sum + (tile ? tile.value : 0), 0);
    document.getElementById("score").innerText = `Score: ${this.score}`;
  }

  resetGame() {
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.updateScore();
    this.initializeGame();
  }

  checkGameOver() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (!this.grid[row][col]) return false;
        if (
          (row < 3 && this.grid[row][col] === this.grid[row + 1][col]) ||
          (col < 3 && this.grid[row][col] === this.grid[row][col + 1])
        ) {
          return false;
        }
      }
    }
    return true;
  }
}
