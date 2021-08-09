import path from 'path';
import gulp from 'gulp';
import fs from 'fs-extra';
import through2 from 'through2';
import { getLessVariable, getFileUTF8 } from './util';
import { getLessFunction, expandFunction } from './expandFunction';
import {
  lessysConfigProps,
  themeConfigProps,
  themeItemProps,
  monitorLessFileProps,
  strObjProps,
  funcDefinedProps
} from './Types';

import { extractVariables } from './extractVariables';
import { formatLess } from './formatLess';

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

// let themeConfigList: themeItemProps[] = [
//   {
//     outputCssPath: 'D:/lessys/.theme/monitor/color/Default.less',
//     cateKey: 'color',
//     fileName: 'Default.less',
//     lessVariables,
//     lessFunction,
//     lessStr
//   }
// ];

const monitorLessMap: monitorLessFileProps = {
  //   'D:/lessys/__tests__/components/button/style.less': {
  //     'D:/lessys/.theme/monitor/button/color/Default.less': '',
  //     'D:/lessys/.theme/monitor/button/color/Blue.less': '',
  //     'D:/lessys/.theme/monitor/button/layout/Default.less': '',
  //     'D:/lessys/.theme/monitor/button/layout/Large.less': ''
  //   }
};

export const extractLess = (
  lessStr: string,
  variable: strObjProps,
  func_defined?: { [name: string]: funcDefinedProps }
): Promise<string> => {
  return formatLess(lessStr)
    .then(str => expandFunction(str, func_defined))
    .then(str => extractVariables(str, variable));
};

// 获取单个 theme 中的 less 变量和函数
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

export const getSingleConfig = async (
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

export const getThemeConfig = async (
  config: lessysConfigProps
): Promise<themeItemProps[]> => {
  // themeConfigList = [];
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
  return await Promise.all(pathList.map(getSingleConfig));
};

// #1 生成 monitorLessMap
// #2 生成 monitor 文件夹
const getMonitorLessVariables = async (config: lessysConfigProps) => {
  const themeConfigList = await getThemeConfig(config);
  const monitorFiles = config.monitorDir + '/**/*.less';
  const outputDirPath = path.resolve(config.outputDir, 'monitor'); // D:\lessys\.theme\monitor
  const monitorDirPath = path.resolve(config.monitorDir); // D:\lessys\__tests__\components

  gulp
    .src(monitorFiles)
    // .pipe(gulp.dest(outputPath))
    // 根据 theme list 生成特定的 less 文件
    .pipe(
      through2.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          const originLessStr = file.contents.toString();
          const stylePath = file.path.toString();
          monitorLessMap[stylePath] = {};
          const fileOutputDir = path
            .parse(file.path)
            .dir.replace(monitorDirPath, outputDirPath);

          Promise.all(
            themeConfigList.map(async item => {
              const styleThemePath = path.join(
                fileOutputDir,
                item.cateKey,
                item.outputLessName
              );
              const lessStr = await extractLess(
                originLessStr,
                item.lessVariables,
                item.lessFunction.funcDefined
              );
              monitorLessMap[stylePath][styleThemePath] = lessStr;

              fs.createFile(styleThemePath).then(() => {
                fs.writeFile(styleThemePath, lessStr);
              });
              return {
                styleThemePath,
                lessStr
              };
            })
          );
          file.contents = Buffer.from(originLessStr);
        }
        cb(null, file);
      })
    );
};
getMonitorLessVariables(entryConfig);

// TODO: merge less file
const mergeLessFile = async () => {
  for (const lessPath in monitorLessMap) {
  }
};

// TODO: 项目开发阶段监听 less 文件
gulp.task('monitorLessFile', function () {
  let monitorRegx = entryConfig.monitorDir + '/**/.less'
  gulp.watch(monitorRegx, () => {

  })
});
