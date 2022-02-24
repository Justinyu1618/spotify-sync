import path from "path";
import { Configuration } from "webpack";
import * as webpackDevServer from "webpack-dev-server";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

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
};

export default config;
