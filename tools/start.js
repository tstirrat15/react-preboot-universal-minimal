import webpack from 'webpack';
import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackHotServerMiddleware from 'webpack-hot-server-middleware';

import config from './webpack.config';
import run from './run';
import clean from './clean';

// Log unhandled promise rejections to the console.
process.on('unhandledRejection', r => console.log(r));

const { publicPath } = config[0].output;
const app = express();

let isBuilt = false;

const done = () =>
  !isBuilt &&
    app.listen(3000, () => {
      isBuilt = true;
      console.log('BUILD COMPLETE -- Listening @ http://localhost:3000');
    });

async function start() {
  await run(clean);
  const compiler = webpack(config);
  const clientCompiler = compiler.compilers[0];
  const options = {
    publicPath,
    stats: { colors: true },
  };

  // Don't try and serve favicons
  app.use('/favicon.ico', (req, res) => res.sendStatus(204));
  app.use(webpackDevMiddleware(compiler, options));
  app.use(webpackHotMiddleware(clientCompiler));
  app.use(webpackHotServerMiddleware(compiler));

  compiler.plugin('done', done);
}

export default start;
