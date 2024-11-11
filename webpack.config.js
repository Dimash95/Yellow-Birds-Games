const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js", // ваш главный файл
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"), // выходная папка
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  devServer: {
    static: "./dist",
    port: 3000, // Устанавливаем порт для локального сервера
    open: true, // Автоматически открывает браузер при старте
  },
  mode: "development", // Для локальной разработки
};
