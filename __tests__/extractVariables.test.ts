import { test, describe } from '@jest/globals';
import fs from 'fs-extra';
import extractVariables from '../src/extractVariables';
import { getFileUTF8, getLessVariable } from '../src/util';
import formatLess from '../src/formatLess';

const cdp = './__tests__/theme/color/Default.less'; // color Default path

describe('extract less variables', () => {
  test('variables.1.less  ----->  remove undefined theme variables', async () => {
    const lfp = './__tests__/styles/variables.1.less'; // less file path
    const lfpv = './__tests__/styles/variables.1.result.less'; // less file variables path
    const data = await getFileUTF8(cdp);
    const tcv = getLessVariable(data); // theme comon variable
    return getFileUTF8(lfp)
      .then(formatLess)
      .then(str => extractVariables(str, tcv))
      .then(formatLess)
      .then(str => fs.writeFile(lfpv, str));
  });

  test('variables.2.less ----->  remove undefined theme variables in function params', async () => {
    const lfp = './__tests__/styles/variables.2.less';
    const lfpv = './__tests__/styles/variables.2.result.less';

    const data = await getFileUTF8(cdp);
    const tcv = getLessVariable(data);
    return getFileUTF8(lfp)
      .then(formatLess)
      .then(str => extractVariables(str, tcv))
      .then(formatLess)
      .then(str => fs.writeFile(lfpv, str));
  });

  test('variables.3.less ----->  remove undefined theme variables in function params', async () => {
    const lfp = './__tests__/styles/variables.3.less';
    const lfpv = './__tests__/styles/variables.3.result.less';

    const data = await getFileUTF8(cdp);
    const tcv = getLessVariable(data);
    return getFileUTF8(lfp)
      .then(formatLess)
      .then(str => extractVariables(str, tcv))
      .then(formatLess)
      .then(str => fs.writeFile(lfpv, str));
  });
});
