import path from "path";
import { Configuration, EnvironmentPlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import * as webpackDevServer from "webpack-dev-server";
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const config: Configuration = {
  entry: "./src/index.tsx",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  devServer: {
    hot: true,
    static: path.join(__dirname, "build"),
    compress: true,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        router: () => "http://localhost:5000",
        logLevel: "debug" /*optional*/,
      },
      "/auth": {
        target: "http://localhost:3000",
        router: () => "http://localhost:5000",
        logLevel: "debug" /*optional*/,
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new EnvironmentPlugin(["WS_URL_PROD", "NODE_ENV", "WS_URL_DEV"]),
  ],
};

export default config;
