import path from 'path';
import gulp from 'gulp';
import through2 from 'through2';
import { getLessVariable, getFileUTF8 } from './util';
import { getLessFunction } from './expandFunction';
import { lessysConfigProps, themeConfigProps, themeItemProps } from './Types';

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

let themeList: themeItemProps[] = [
  // {
  //   outputCssPath: '',
  //   lessVariables,
  //   lessFunction,
  //   lessStr
  // }
];

// 获取单个 theme 中的 less 变量和函数
export const getThemeVariables = async (
  themePath: string
): Promise<Omit<themeItemProps, 'outputCssPath'>> => {
  const lessStr = await getFileUTF8(themePath);
  const lessVariables = getLessVariable(lessStr);
  const lessFunction = await getLessFunction(lessStr);
  return {
    lessVariables,
    lessFunction,
    lessStr
  };
};

export const getThemeConfig = async (
  data: themeConfigProps
): Promise<themeItemProps> => {
  const variables = await getThemeVariables(data.themePath);
  const filename = path.basename(data.themePath); // Default.less
  const outputCssPath = path.join(
    data.outputDir,
    data.cateKey + '/' + filename
  );
  return {
    outputCssPath,
    ...variables
  };
};

export const copyTheme = async (config: lessysConfigProps) => {
  themeList = [];

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
  themeList = await Promise.all(pathList.map(getThemeConfig))
  console.log(themeList);
};

copyTheme(entryConfig);

// function copyMonitorDir(config: themeConfigProps) {
//   const monitorFiles = config.monitorDir + '/**/*.less';
//   const outputPath = config.outputDir + '/monitor/';

//   gulp
//     .src(monitorFiles)
//     // .pipe(gulp.dest(outputPath))
//     // 根据 theme list 生成特定的 less 文件
//     .pipe(
//       through2.obj(function (file, _, cb) {
//         if (file.isBuffer()) {
//           console.log(file.path);
//           const code = file.contents.toString();
//           file.contents = Buffer.from(code);
//         }
//         cb(null, file);
//       })
//     );
// }

// copyComponents(entryConfig);

// test
// getThemeMap(entryConfig).then(data => {
//   console.log('data', data);
// });
