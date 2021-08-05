import { test, describe } from '@jest/globals';
import fs from 'fs-extra';
import expandFunction from '../src/expandFunction';
import { getFileUTF8 } from '../src/util';
import formatLess from '../src/formatLess';

const ldp = './__tests__/theme/layout/Default.less'; // layout Default path

describe('expand less functions', () => {
  test('function.1.less  ----->  expand functions', async () => {
    const lfp = './__tests__/styles/function.1.less'; // less file path
    const lfpv = './__tests__/styles/function.1.result.less'; // less file variables path
    return getFileUTF8(lfp)
      .then(formatLess)
      .then(str => expandFunction(str))
      .then(formatLess)
      .then(str => fs.writeFile(lfpv, str));
  });

  test('function.2.less  ----->  expand nested functions', async () => {
    const lfp = './__tests__/styles/function.2.less';
    const lfpv = './__tests__/styles/function.2.result.less';
    return getFileUTF8(lfp)
      .then(formatLess)
      .then(str => expandFunction(str))
      .then(formatLess)
      .then(str => fs.writeFile(lfpv, str));
  });
});
