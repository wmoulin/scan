const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

/*
 * Dev configurations
 */
// Serveur de développement avec activation du Hot Module Replacement
exports.devServer = (options) => {

  let conf = {entry: [
    "webpack-dev-server/client?http://" + options.host + ":" + options.port,
    "webpack/hot/only-dev-server",
    options.entry
  ]};

  return merge(conf, {
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      stats: { colors: true },
      host: options.host,
      port: options.port
    },
    // module: {
    //   rules: [
    //     {
    //       test: /\.jsx?$/,
    //       use: ["react-hot-loader/webpack"],
    //       exclude: /node_modules/,
    //     }
    //   ]
    // },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
    })
    ]
  });
}

// Transformations CSS :
//    - résolution des @import et url()
//    - ajout de feuille de style au DOM via l'injection d'une balise <style>
exports.setupCSS = (paths) => {
  return {
    module: {
      loaders: [{
        test: /\.css$/,
        loaders: ['style', 'css'],
        include: paths
      }]
    }
  };
}

/*
 * Build configurations
 */
// Minification
exports.minify = () => {
  return {
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              warnings: true,
              drop_console: true
            },
            mangle: true,
            ecma: 5
          }
        })
      ]
    }
  };
}

// Injection de variables globales à la compilation :
//    - spécialisation de comportements
//    - minification
exports.setFreeVariable = (key, value) => {
  const env = {};
  env[key] = JSON.stringify(value);
  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  };
}

// Bundle splitting :
//    - création d'un nouveau bundle ('entry chunk')
exports.extractBundle = (bundles, options) => {
  const entry = {};
  const bundlesNname = [];

  [bundles].forEach(({ name, entries }) => {
    if (entries) {
      entry[name] = entries;
    }

    bundlesNname.push(name);
  });

  return {
      entry
    };
}

// Nettoyage de répertoire
exports.clean = (path) => {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        root: process.cwd()
      })
    ]
  };
}

// Génération d'une feuille de style séparée (du JS => gestion du
// cache optimisée puisque dans bundles différents)
exports.extractCSS = (paths) => {
  return {
    module: {
      loaders: [{
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css'),
        include: paths
      }]
    },
    plugins: [
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  };
}

// Suppression des portions de feuilles de style inutilisées
exports.purifyCSS = (paths) => {
  return {
    plugins: [
      new PurifyCSSPlugin({
        basePath: process.cwd(),
        paths: paths
      })
    ]
  };
}
