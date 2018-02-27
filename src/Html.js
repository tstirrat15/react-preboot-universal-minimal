import PropTypes from 'prop-types';
import React from 'react';
import { getInlinePrebootCode } from 'preboot';

// These are copied from the defaults in the
// preboot source code, minus the `freeze` keys,
// which produce the black overlay.
const eventSelectors = [
  // for recording changes in form elements
  { selector: 'input,textarea', events: ['input', 'change'] },
  { selector: 'select,option', events: ['change'] },
];
const prebootCode = getInlinePrebootCode({
  appRoot: '#app',
  buffer: false,
  eventSelectors,
});

const Html = ({ scriptTags, children }) => (
  <html className="no-js" lang="en">
    {/* TODO: Update the lang here for a11y and i18n purposes to match the lang */}
    <head>
      <meta charSet="utf-8" />
      {/* This is a script that listens for user events before bootstrapping is finsihed,
      holds onto them, and then allows for playback when the page has loaded. */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: prebootCode }}
      />
    </head>
    <body>
      <div
        id="app"
          // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: children }}
      />
      {scriptTags}
    </body>
  </html>
);

Html.propTypes = {
  scriptTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.string.isRequired,
};

export default Html;
