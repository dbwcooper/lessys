import path from 'path';
import fs from 'fs-extra';
import { themeConfigProps, lessVariablesObjProps } from './Types';

import { getLessFunction } from './expandFunction';
import { getLessVariable, getFileUTF8 } from './util';
import './monitorLess';

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
export const getCommonVariable = async (entryConfig: themeConfigProps) => {
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
export const getThemeMap = async (
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

// // test
// // getThemeMap(entryConfig).then(data => {
// //   console.log('data', data);
// // });
