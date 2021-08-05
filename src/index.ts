import path from 'path';
import fs from 'fs-extra';
import { monitorConfigProps, lessVariablesObjProps } from './Types';

import { getLessFunction } from './expandFunction';
import { getLessVariable, getFileUTF8 } from './util';

const entryConfig: monitorConfigProps = {
  themeList: [
    '__tests__/theme/color/Default.less',
    '__tests__/theme/color/Blue.less',
    '__tests__/theme/layout/Default.less',
    '__tests__/theme/layout/Large.less'
  ],
  monitorDir: '__tests__/components',
  outputDir: '.theme'
};

/**
 *
 * @param lessFilePath __tests__/theme/colorDefault.less
 * @param output .theme
 * @returns {
 *   '.theme/color/Default.less': {
 *      lessVariables,
 *      lessFunction
 *   }
 * }
 */
const getCommonVariable = async (lessFilePath: string, output: string) => {
  let arr = lessFilePath.split(/\\|\//); //  ["__tests__", "theme", "color", "Default.less"]
  const file = arr.pop(); // Default.less
  const cate = arr.pop(); // color
  const outputFilePath = path.join(output, cate + '/' + file);

  const lessStr = await getFileUTF8(lessFilePath);
  const lessVariables = getLessVariable(lessStr);
  const lessFunction = await getLessFunction(lessStr);
  return {
    outputFilePath,
    fileData: {
      lessVariables,
      lessFunction,
      lessStr
    }
  };
};

/**
 *  获取公用文件中的 变量和函数
 */
const getThemeMap = async (
  config: monitorConfigProps
): Promise<lessVariablesObjProps> => {
  const themeList = config.themeList;
  const outputDir = config.outputDir || '.theme';
  const results = await Promise.all(
    themeList.map(p =>
      getCommonVariable(p, outputDir).then(item => {
        fs.ensureFile(item.outputFilePath).then(() => {
          fs.writeFile(item.outputFilePath, item.fileData.lessStr, {
            encoding: 'utf8'
          });
        });
        return {
          [item.outputFilePath]: item
        };
      })
    )
  );
  return Object.assign({}, ...results);
};

// test
// getThemeMap(entryConfig).then(data => {
//   console.log('data', data);
// });
