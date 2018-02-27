import { copyFile, makeDir } from './lib/fs';

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy() {
  await makeDir('build');
  await Promise.all([
    copyFile('package.json', 'build/package.json'),
    copyFile('yarn.lock', 'build/yarn.lock'),
    copyFile('LICENSE.txt', 'build/LICENSE.txt'),
  ]);
}

export default copy;
