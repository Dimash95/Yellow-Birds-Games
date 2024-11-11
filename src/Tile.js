export default class Tile {
  constructor(value) {
    this.value = value || (Math.random() < 0.9 ? 2 : 4); // Случайное значение 2 или 4
    this.merged = false; // Показывает, что плитка уже была объединена
  }

  resetMergeStatus() {
    this.merged = false; // Сбрасывает статус объединения в начале каждого хода
  }
}
