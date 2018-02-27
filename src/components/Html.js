/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable react/no-danger */

class Html extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
    app: PropTypes.object, // eslint-disable-line
    children: PropTypes.string.isRequired,
  };

  static defaultProps = {
    scripts: [],
  };

  render() {
    const { title, scripts, children } = this.props;
    return (
      <html lang="en">
        <head>
          <title>Demo</title>
          {scripts.map(script => (
            <link key={script} rel="preload" href={script} as="script" />
          ))}
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
          {scripts.map(script => <script key={script} src={script} />)}
        </body>
      </html>
    );
  }
}

export default Html;
