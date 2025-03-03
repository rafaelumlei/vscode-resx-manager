const path = require("path");

module.exports = [
  {
    mode: "production",
    target: "node",
    entry: "./src/extension.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "extension.js",
      libraryTarget: "commonjs2",
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    externals: {
      vscode: "commonjs vscode", // This tells Webpack not to bundle vscode module
    },    
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
  },
  // {
  //   mode: "production",
  //   target: "web",
  //   entry: "./src/webview/App.tsx",
  //   output: {
  //     path: path.resolve(__dirname, "dist"),
  //     filename: "webview.js",
  //   },
  //   resolve: {
  //     extensions: [".tsx", ".ts", ".js"],
  //   },
  //   module: {
  //     rules: [
  //       {
  //         test: /\.[jt]sx?$/,
  //         exclude: /node_modules/,
  //         use: {
  //           loader: "babel-loader",
  //           options: {
  //             presets: ["@babel/preset-react", "@babel/preset-env", "@babel/preset-typescript"]
  //           }
  //         }
  //       },
  //       {
  //         test: /\.css$/,
  //         use: ["style-loader", "css-loader"],
  //       },
  //     ],
  //   }
  // }
];