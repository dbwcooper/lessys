import path from 'path';
import gulp from 'gulp';
import gulpConcat from 'gulp-concat';
import fs from 'fs-extra';
import through2 from 'through2';
import { getLessVariable, getFileUTF8, transferAbsolutePath, lessToCss } from './util';
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

let themeConfigList: themeItemProps[] = [
  // {
  //   outputCssPath: 'D:/lessys/.theme/monitor/color/Default.less',
  //   cateKey: 'color',
  //   fileName: 'Default.less',
  //   lessVariables,
  //   lessFunction,
  //   lessStr
  // }
];

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
// #2 生成 .theme/monitor 文件夹
const getMonitorLessVariables = async (config: lessysConfigProps) => {
  themeConfigList = await getThemeConfig(config);
  const monitorFiles = config.monitorDir + '/**/*.less';
  const outputDirPath = path.resolve(config.outputDir, 'monitor'); // D:\lessys\.theme\monitor
  const monitorDirPath = path.resolve(config.monitorDir); // D:\lessys\__tests__\components

  // TODO: replace with globby
  gulp
    .src(monitorFiles)
    // .pipe(gulp.dest(outputPath))
    // 根据 theme list 生成特定的 less 文件
    .pipe(
      through2.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          // 处理 less 文件中的 @import， 将相对路径转变为绝对路径
          let originLessStr = file.contents.toString();
          const fileParser = path.parse(file.path)
          originLessStr = transferAbsolutePath(originLessStr, fileParser.dir)

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
              const cssThemePath = path.join(
                fileOutputDir,
                item.cateKey,
                item.outputCssName
              );

              const lessStr = await extractLess(
                originLessStr,
                item.lessVariables,
                item.lessFunction.funcDefined
              );
              monitorLessMap[stylePath][styleThemePath] = lessStr;
              const cssStr = await lessToCss(
                lessStr,
              );
              return Promise.all([
                fs.createFile(styleThemePath).then(() => {
                  fs.writeFile(styleThemePath, lessStr);
                }),
                fs.createFile(cssThemePath).then(() => {
                  fs.writeFile(cssThemePath, cssStr);
                })])
            })
          );
          file.contents = Buffer.from(originLessStr);
        }
        cb(null, file);
      })
    )
};

// getMonitorLessVariables(entryConfig)

// #1 将 monitor 中的 less 文件转换为 css 文件
// #2 合并 css 文件
const mergeLessFile = async (config: lessysConfigProps) => {
  themeConfigList = await getThemeConfig(config);
  themeConfigList.map(item => {
    const reg = `${config.outputDir}/monitor/**/${item.cateKey}/${item.outputCssName}`;
    const outputDir = `${config.outputDir}/${item.cateKey}/`;
    gulp
      .src(reg)
      .pipe(gulpConcat(item.outputCssName))
      .pipe(gulp.dest(outputDir));
  });
};
mergeLessFile(entryConfig);

// TODO: 项目开发阶段监听 less 文件
// gulp.task('monitorLessFile', function () {
//   let monitorRegx = entryConfig.monitorDir + '/**/.less'
//   gulp.watch(monitorRegx, () => {

//   })
// });
