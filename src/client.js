import React from 'react';
import { hydrate } from 'react-dom';
import { EventReplayer } from 'preboot';

import App from './App';

hydrate(<App />, document.getElementById('app'));

// Play back events that have been captured by preboot
const replayer = new EventReplayer();
replayer.replayAll();
