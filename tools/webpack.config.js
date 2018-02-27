const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const extend = require('extend');
const StatsPlugin = require('stats-webpack-plugin');

const isProduction = process.argv.includes('--production');
const isStaging = process.argv.includes('--staging');

// Look for the sources of any deprecation warnings
// in loaders
process.traceDeprecation = true;

const isDebug = !(isProduction || isStaging);
const isVerbose = process.argv.includes('--verbose');

//
// Common configuration chunk to be used for both
// client-side (client.js) and server-side (server.js) bundles
// -----------------------------------------------------------------------------

const babelLoader = targets => ({
  // JS files are run through the babel loader, which takes care of the
  // javascript transpilation process. The configuration is in the root
  // .babelrc file.
  test: /\.js/,
  loader: 'babel-loader',
  options: {
    // If we're on local, we want to put the cached files in a location
    // that stays in the container (i.e. in the build folder).
    // If we're actually building the project, such as on circleCI,
    // we don't want those cached files to end up in the build zip
    // that's sent off to the server.
    cacheDirectory: isDebug ? 'build/.cache' : true,
    presets: [
      ['env',
        {
          modules: false,
          targets,
        },
      ],
      'stage-0',
      'react',
    ],
  },
  include: [
    path.resolve(__dirname, '../src'),
  ],
});
const config = {
  // Capture build statistics.
  profile: true,

  // The path relative to which all other paths in the webpack build
  // are referenced. Entrypoints resolve relative to this, for example.
  context: path.resolve(__dirname, '../src'),

  output: {
    path: path.resolve(__dirname, '../build/public/assets'),
    publicPath: '/assets/',
  },

  resolve: {
    // This means that if an absolute import is called (e.g. import React from 'react')
    // it knows to look in node_modules for react.
    modules: ['node_modules'],
    extensions: ['.webpack.js', '.web.js', '.js', '.jsx', '.json'],
  },

  cache: isDebug,

  stats: {
    colors: true,
    reasons: isDebug,
    hash: isVerbose,
    version: isVerbose,
    timings: true,
    chunks: isVerbose,
    chunkModules: isVerbose,
    cached: isVerbose,
    cachedAssets: isVerbose,
  },

  // Create a source map for the output files. We do this for both server and client.
  devtool: isDebug ? 'cheap-module-source-map' : 'source-map',
};

//
// Configuration for the client-side bundle (client.js)
// -----------------------------------------------------------------------------
const clientConfig = extend(true, {}, config, {
  name: 'client',
  entry: {
    main: [
      'babel-polyfill',
      './client.js',
    ],
  },

  module: {
    // This a list of loaders, which tells Webpack what to do with each of the
    // files that it finds.
    rules: [
      babelLoader({ browsers: 'last 2 versions' }),
    ],
  },


  // If the target is the production build, we want to add cache strings
  // to the end of it, so that the client knows to download new code
  // as it becomes available.
  output: {
    filename: isDebug ? '[name].js' : '[name].[chunkhash].js',
    chunkFilename: isDebug ? '[name].js' : '[name].[chunkhash].js',
  },

  // This refers to compilation target. Webpack will use javascript that
  // is available to web browsers (as opposed to node, which would be a
  // different target, for example).
  target: 'web',

  plugins: [

    // Define free variables
    // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({
      'process.env.BROWSER': true,
    }),

    // Get build statistics
    // That path is relative to the assets output.
    // This puts it outside of the public folder.
    new StatsPlugin('../../stats.json'),

    // This splits off a minimal webpack bootstrapper bundle, which goes
    // before all application code. This sets up webpack-related functions
    // for use by other bundles.
    new webpack.optimize.CommonsChunkPlugin({
      names: ['bootstrap'],
      filename: isDebug ? '[name].js' : '[name].[chunkhash].js',
      minChunks: Infinity,
    }),
  ],
});

//
// Configuration for the server-side bundle (server.js)
// -----------------------------------------------------------------------------

// TODO: we're going to need a config for build and a config for running.
const res = p => path.resolve(__dirname, p);
const nodeModules = res('../node_modules');
// This pulls in all of the node_modules stuff except for react-universal-component
// and webpack-flush-chunks, except for a few things, namely isomorphic styles
// packages and constants.
const nodeExternals = fs
  .readdirSync(nodeModules)
  .filter(x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x))
  .reduce((externalObject, nodeModule) => ({
    ...externalObject,
    [nodeModule]: `commonjs ${nodeModule}`,
  }), {});
const externals = [
  nodeExternals,
  // stats is supplied by the build process, so it won't be present
  // for the build process. It's marked as external so that webpack
  // doesn't try and import it during build.
  /.*stats.json/,
];
const serverConfig = extend(true, {}, config, {
  name: 'server',
  entry: isDebug ? ['./render.js'] : ['babel-polyfill', './server.js'],

  // This tells the compiler to spit out the server bundle two directories
  // down from where the client code is output. Since we're sticking the
  // client code in build/public/assets, this sticks the server code at build.
  output: {
    filename: '../../server.js',
    libraryTarget: 'commonjs2',
  },

  target: 'node',
  module: {
    // This a list of loaders, which tells Webpack what to do with each of the
    // files that it finds.
    rules: [
      babelLoader({ node: '8.1.4' }),
    ],
  },

  externals,

  plugins: [
    // Define free variables
    // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({
      'process.env.BROWSER': false,
    }),

    // Do not create separate chunks of the server bundle. We want all
    // of the server code to be in one bundle for faster execution.
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
  ],

  // These are needed for node compilation to work properly.
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },
});

module.exports = [clientConfig, serverConfig];
