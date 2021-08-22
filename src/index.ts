import path from 'path';
import globby from 'globby';
import fs from 'fs-extra';
import { expandFunction, getLessFunction } from './expandFunction';
import { extractVariables } from './extractVariables';
import { formatLess } from './formatLess';
import { monitor } from './monitor';
import {
  getLessVariable,
  getFileUTF8,
  transferAbsolutePath,
  lessToCss,
  removeComments,
  getUserConfig
} from './util';
import {
  lessysConfigProps,
  themeConfigProps,
  themeItemProps,
  strObjProps,
  funcDefinedProps
} from './Types';

// 根据 公用变量、函数 删除一些与换肤无关结构。
// accept: 一个 less 字符串，公用变量、函数
// return: 一个处理后的 less 字符串。
export const extractLess = async (
  lessStr: string,
  variable: strObjProps,
  func_defined?: { [name: string]: funcDefinedProps }
): Promise<string> => {
  return formatLess(lessStr)
    .then((str) => expandFunction(str, func_defined))
    .then((str) => extractVariables(str, variable));
};

// 获取单个 theme 中的 less 变量和函数
// accept: 一个 less 文件路径
// return: 此 less 文件的 变量，函数变量，以及 less 字符串。
export const getThemeVariables = async (
  themePath: string
): Promise<
  Omit<
    themeItemProps,
    | 'originLessPath'
    | 'outputCssPath'
    | 'outputCssName'
    | 'cateKey'
    | 'outputLessName'
  >
> => {
  const lessStr = await getFileUTF8(themePath).then(removeComments);
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
  const originLessPath = path.resolve(data.themePath);
  return {
    originLessPath,
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
    config.theme[cateKey].forEach((itemPath) => {
      pathList.push({
        cateKey,
        themePath: itemPath,
        outputDir: config.outputDir
      });
    });
  }
  return await Promise.all(pathList.map(getSingleTheme));
};

// 映射 D:\lessys\__tests__\components\button\style.less  ->
//      D:\lessys\.theme\monitor\button\color\Default.less
//      D:\lessys\.theme\monitor\button\color\Blue.less
//      ...
export const generateOneLess = async (
  commonThemeList: themeItemProps[],
  config: lessysConfigProps,
  lessFilePath: string
) => {
  const outputcomponentDirPath = path.resolve(config.outputDir, 'monitor'); // D:\lessys\.theme\monitor
  const componentDirPath = path.resolve(config.componentDir); // D:\lessys\__tests__\components
  lessFilePath = path.resolve(lessFilePath);
  return getFileUTF8(lessFilePath).then((lessStr) => {
    // #1 将 lessStr 中的相对路径转换为 绝对路径
    const pathParser = path.parse(lessFilePath);
    lessStr = transferAbsolutePath(lessStr, pathParser.dir);

    // #2 根据 commonThemeList 生成 component 级的 less 文件
    return Promise.all(
      commonThemeList.map((item) => {
        return extractLess(
          lessStr,
          item.lessVariables,
          item.lessFunction.funcDefined
        ).then(async (outputLessStr) => {
          // 组装 output less 文件的路径
          // TODO: output css | 返回格式
          const outputLessPath = path.join(
            pathParser.dir.replace(componentDirPath, outputcomponentDirPath),
            item.cateKey,
            item.outputLessName
          );
          const outputCssPath = path.join(
            pathParser.dir.replace(componentDirPath, outputcomponentDirPath),
            item.cateKey,
            item.outputCssName
          );

          const cssStr = await lessToCss(outputLessStr, item);
          const result = {
            outputLessPath,
            outputCssStr: cssStr,
            outputThemeCssPath: item.outputCssPath
          };
          await Promise.all([
            fs
              .createFile(outputLessPath)
              .then(() => fs.writeFile(outputLessPath, outputLessStr)),
            fs
              .createFile(outputCssPath)
              .then(() => fs.writeFile(outputCssPath, cssStr))
          ]);
          return result;
        });
      })
    );
  });
};

export const transferComponentLess = async (
  commonThemeList: themeItemProps[],
  config: lessysConfigProps
) => {
  const monitorFileRegx = config.componentDir + '/**/*.less'; // D:\lessys\__tests__\components\**\*.less
  const lessPaths = await globby(monitorFileRegx);
  return (
    Promise.all(
      // 生成 .theme/monitor/**/*.less 文件
      lessPaths.map((lessPath) =>
        generateOneLess(commonThemeList, config, lessPath)
      )
    )
      // merge css:  各个组件同类的 css 文件，生成 .theme/color/*.css 文件
      .then((results) => {
        const themeCssMap: strObjProps = {};
        results.forEach((arr) => {
          arr.forEach((item) => {
            let key = item.outputThemeCssPath;
            let value = item.outputCssStr;
            if (themeCssMap[key]) {
              themeCssMap[key] += value;
            } else {
              themeCssMap[key] = value;
            }
          });
        });
        return themeCssMap;
      })
      .then((themeCssMap) => {
        return Promise.all([
          Object.keys(themeCssMap).map((themeCssPath) => {
            return fs
              .createFile(themeCssPath)
              .then(() =>
                fs.writeFile(themeCssPath, themeCssMap[themeCssPath])
              );
          })
        ]).then(() => 'success');
      })
  );
};

export const main = async () => {

  const config: lessysConfigProps = await getUserConfig();

  // #1 获取主题的配置列表
  const commonThemeList = await getCommonTheme(config);
  // #2 生成 .theme/monitor/**/*.less 文件
  await transferComponentLess(commonThemeList, config);
  if (config.watching) {
    monitor();
  }
};

main();
