import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import flushChunks from 'webpack-flush-chunks';
import { flushChunkNames } from 'react-universal-component/server';

import App from './App';
import Html from './Html';

const scriptTags = (scripts, publicPath) =>
  scripts.map(file => (
    <script
      src={`${publicPath}/${file}`}
      key={file}
      defer
    />
  ));

export default ({ clientStats }) =>
  async (req, res) => {
    const children = renderToString(<App />);

    // This is the webpack-flush-chunks magic that pulls
    // in only the JS necessary for the first render.
    const chunkNames = flushChunkNames();
    const { scripts, publicPath } = flushChunks(clientStats, { chunkNames });

    const data = {
      children,
      // This is gonna get rewritten
      scriptTags: scriptTags(scripts, publicPath),
    };
    const html = renderToStaticMarkup(<Html {...data} />);

    res.status(200);
    res.send(`<!doctype html>${html}`);
  };
