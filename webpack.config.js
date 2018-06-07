const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const configParts = require('./webpack/config-parts');
const pkg = require('./package.json');
const webpack = require("webpack");

const PATHS = {
  client: path.join(__dirname, "index.js"),
  style: [
    path.join(__dirname, "node_modules", "purecss"),
    path.join(__dirname, "static", "styles", "style.css")
  ],
  build: path.join(__dirname, "static", "js")
};

const common = {
  entry: {
    //style: PATHS.style,
    client: PATHS.client
  },
  output: {
    //path: "static",//PATHS.build,
    filename: 'static/js/client.js'
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".css", ".html"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './static/index.html',
      filename: "./index.html"
    }),
    new webpack.DefinePlugin({
      '(!self.Buffer && !window.Buffer)': '1 == 2'})
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: false }
          }
        ]
      }
    ]
  },
  // node: {
  //   Buffer: true
  // }

  // externals: {
  //   Buffer: "{}"
  // }
};

var config;

switch (process.env.npm_lifecycle_event) {
  case "build":
  case "stats":
    config = merge(
      common, {
        devtool: "source-map",
        output: {
          filename: "static/js/[name].[chunkhash].js",
          chunkFilename: "static/js/[chunkhash].js"
        }
      },
      configParts.clean(PATHS.build),
      configParts.setFreeVariable("process.env.NODE_ENV", "production"),
      configParts.extractBundle({
        name: "vendor",
        entries: Object.keys(pkg.dependencies)
      }),
      configParts.minify()
    );
    break;
  case "build-dev":
    config = merge(
      common, {
        devtool: "cheap-module-eval-source-map",
        output: {
          filename: "static/js/[name].js",
          chunkFilename: "static/js/[name].js"
        }
      },
      configParts.clean(PATHS.build),
      configParts.extractBundle([{
        name: "commons",
        entries: Object.keys(pkg.dependencies)
      }])
    );
    break;
  default:
    config = merge(
      common, {
        devtool: "cheap-module-eval-source-map",
        output: {
          filename: "static/js/[name].js",
          chunkFilename: "static/js/[name].js"
        }
      },

      configParts.extractBundle({
        name: "commons",
        entries: Object.keys(pkg.dependencies)
      }),
      configParts.devServer({
        host: "localhost",
        port: 5000,
        entries: [{ id: "client", file: PATHS.client }],
        entry: PATHS.client
      })
    );
}
console.log(config);
// Exécution du validateur en mode silencieux pour éviter du texte superflu
// vers des sorties json (et donc pour la commande 'stats')
module.exports = config;
