import { test } from '@jest/globals';
import fs from 'fs-extra';
import { getFileUTF8 } from '../src/util';
import formatLess from '../src/formatLess';
import expandFunction from '../src/expandFunction';
import extractLess from '../src/extractLess';

test('expandFunction', async () => {
  const less_file_path = './test/lessFiles/4.less';
  const result_path = './test/lessFiles/4.result.less';
  return getFileUTF8(less_file_path)
    .then(formatLess)
    .then(expandFunction)
    .then(data => {
      fs.writeFile(result_path, data);
    });
});
