import { test, describe } from '@jest/globals';
import monitorLess from '../src/monitorLess';
import { monitorConfigProps } from '../src/Types';

const config: monitorConfigProps = {
  theme: [
    '__tests__/theme/colorDefault.less',
    '__tests__/theme/colorBlue.less',
    '__tests__/theme/layoutDefault.less',
    '__tests__/theme/layoutLarge.less'
  ],
  monitor: '__tests__/components',
  output: '.theme'
};

describe('monitorLess', () => {
  test('1', async () => {
    const data = await monitorLess(config);
    return data;
  });
});
