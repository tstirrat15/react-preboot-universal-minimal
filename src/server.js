/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import App from './components/App';
import Html from './components/Html';
import assets from './assets.json'; // eslint-disable-line import/no-unresolved
import config from './config';

const app = express();

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  console.log('maybe?')
  try {
    const data = {
      children: ReactDOM.renderToString(<App />),
      scripts: [assets.vendor.js],
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});

//
// Launch the server
// -----------------------------------------------------------------------------
app.listen(config.port, () => {
  console.info(`The server is running at http://localhost:${config.port}/`);
});
export default app;
