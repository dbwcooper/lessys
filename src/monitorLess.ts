import path from 'path';
import gulp from 'gulp';
import through2 from 'through2';
import { getLessVariable, getFileUTF8 } from './util';
import { getLessFunction } from './expandFunction';
import { themeConfigProps } from './Types';

const entryConfig: themeConfigProps = {
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

// 获取单个 theme 中的 less 变量和函数
export const getThemeVariables = async (themePath: string) => {
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
  themePath: string,
  cateKey: string,
  outputDir: string
) => {
  const variables = await getThemeVariables(themePath);
  const filename = path.basename(themePath); // Default.less
  const outputCssPath = path.join(outputDir, cateKey + '/' + filename);
  return {
    outputCssPath,
    ...variables,
  }
};

async function copyTheme(config: themeConfigProps) {
  const themePathList = Object.keys(config.theme).reduce((acc, key) => {
    acc.concat(config.theme[key]);
    return acc;
  }, []);
  const outputDir = config.outputDir || '.theme';
  const results = await Promise.all(
    themePathList.map(p => {
      getThemeVariables(p);
    })
  );
}

function copyComponents(config: themeConfigProps) {
  const monitorFiles = config.monitorDir + '/**/*.less';
  const outputPath = config.outputDir + '/monitor/';

  gulp
    .src(monitorFiles)
    // .pipe(gulp.dest(outputPath))
    // 根据 theme list 生成特定的 less 文件
    .pipe(
      through2.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          console.log(file.path);
          const code = file.contents.toString();
          file.contents = Buffer.from(code);
        }
        cb(null, file);
      })
    );
}

copyComponents(entryConfig);

// test
// getThemeMap(entryConfig).then(data => {
//   console.log('data', data);
// });
