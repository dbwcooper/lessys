
import path from 'path';
import globby from 'globby';

import { expandFunction, getLessFunction } from './expandFunction';
import { extractVariables } from './extractVariables';
import { formatLess } from './formatLess';
import { getLessVariable, getFileUTF8, } from './util';
import {
  lessysConfigProps,
  themeConfigProps,
  themeItemProps,
  strObjProps,
  funcDefinedProps
} from './Types';
// import './monitorLess';

// 根据 公用变量、函数 删除一些与换肤无关结构。
// accept: 一个 less 字符串，公用变量、函数
// return: 一个处理后的 less 字符串。
export const extractLess = async (
  lessStr: string,
  variable: strObjProps,
  func_defined?: { [name: string]: funcDefinedProps }
): Promise<string> => {
  return formatLess(lessStr)
    .then(str => expandFunction(str, func_defined))
    .then(str => extractVariables(str, variable));
};

// 获取单个 theme 中的 less 变量和函数
// accept: 一个 less 文件路径
// return: 此 less 文件的 变量，函数变量，以及 less 字符串。
export const getThemeVariables = async (
  themePath: string
): Promise<
  Omit<
    themeItemProps,
    'outputCssPath' | 'outputCssName' | 'cateKey' | 'outputLessName'
  >
> => {
  const lessStr = await getFileUTF8(themePath);
  const lessVariables = getLessVariable(lessStr);
  const lessFunction = await getLessFunction(lessStr);
  return {
    lessVariables,
    lessFunction,
    lessStr
  };
};

// accept: 一个换肤 theme 文件配置: Blue.less
// return: 此文件将生成的文件配置: Blue.css ...
export const getSingleTheme = async (
  data: themeConfigProps
): Promise<themeItemProps> => {
  const variables = await getThemeVariables(data.themePath);
  const cssName = path.parse(data.themePath).name + '.css'; // Default.css
  const lessName = path.parse(data.themePath).name + '.less'; // Default.less
  const outputCssPath = path.join(data.outputDir, data.cateKey + '/' + cssName);
  return {
    outputCssPath: path.resolve(outputCssPath),
    outputCssName: cssName,
    outputLessName: lessName,
    cateKey: data.cateKey,
    ...variables
  };
};

// accept: 此插件对外暴露的配置
// return: 所有 theme 的配置列表
export const getCommonTheme = async (
  config: lessysConfigProps
): Promise<themeItemProps[]> => {
  let pathList: any = [];
  for (const cateKey in config.theme) {
    config.theme[cateKey].forEach(itemPath => {
      pathList.push({
        cateKey,
        themePath: itemPath,
        outputDir: config.outputDir
      });
    });
  }
  return await Promise.all(pathList.map(getSingleTheme));
};

export const transferComponentLess = async (commonThemeList: themeItemProps[], config: lessysConfigProps) => {
  const monitorFileRegx = config.monitorDir + '/**/*.less'; // D:\lessys\__tests__\components\**\*.less
  const outputDirPath = path.resolve(config.outputDir, 'monitor'); // D:\lessys\.theme\monitor
  const monitorDirPath = path.resolve(config.monitorDir); // D:\lessys\__tests__\components

  const lessPaths = await globby(monitorFileRegx);

  console.log(lessPaths)
}

export const main = async (config: lessysConfigProps) => {
  // #1 获取主题的配置列表
  const commonThemeList = await getCommonTheme(config);
  // #2 生成 .theme/monitor/**/*.less 文件
  const data = await transferComponentLess(commonThemeList, config)
}
const entryConfig: lessysConfigProps = {
  theme: {
    color: [
      '__tests__/theme/color/Default.less',
      '__tests__/theme/color/Blue.less'
    ],
    layout: [
      '__tests__/theme/layout/Default.less',
      '__tests__/theme/layout/Large.less'
    ]
  },
  monitorDir: '__tests__/components',
  outputDir: '.theme'
};
main(entryConfig)

export default main;