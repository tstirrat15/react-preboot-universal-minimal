import path from 'path';
import express from 'express';

// eslint-disable-next-line import/no-unresolved
import clientStats from './stats.json';
import serverRender from './render';

const app = express();

const publicPath = path.join(__dirname, 'public');
const assetsPath = path.join(publicPath, 'assets');
const port = process.env.PORT || 3000;

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use('/assets', express.static(assetsPath));
app.use(serverRender({ clientStats }));


//
// Launch the server
// -----------------------------------------------------------------------------
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`The server is running at http://localhost:${port}/`);
});
