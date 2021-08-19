import path from 'path';
import gulp, { watch } from 'gulp';
import gulpConcat from 'gulp-concat';
import globby from 'globby';
import { generateOneLess, getCommonTheme } from './index';
import { lessysConfigProps, themeItemProps } from './Types';

// #1 将 monitor 中的 less 文件转换为 css 文件
// #2 合并 css 文件
export const mergeThemeFiles = async (
  commonThemeList: themeItemProps[],
  config: lessysConfigProps
) => {
  return commonThemeList.map((theme) => {
    const regx = `${config.outputDir}/monitor/**/${theme.cateKey}/${theme.outputCssName}`;
    const outputThemeDir = `${config.outputDir}/${theme.cateKey}/`;
    gulp
      .src(regx)
      .pipe(gulpConcat(theme.outputCssName))
      .pipe(gulp.dest(outputThemeDir));
  });
};

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

const watchRegx = `${entryConfig.monitorDir}/**/*.less`;
const watcher = watch([watchRegx]);
const getConfig = () => entryConfig;

const mergeCss = (
  commonThemeList: themeItemProps[],
  config: lessysConfigProps
) => {
  return Promise.all(
    commonThemeList.map((item) => {
      const regx = path.resolve(
        config.monitorDir + '/**/' + item.cateKey + '/' + item.outputCssName
      );
      gulp
        .src(regx)
        .pipe(gulpConcat(item.outputCssName))
        .pipe(gulp.dest(path.parse(item.outputCssPath).dir));
    })
  ).then(() => 'merge css successfully');
};

const handleLessChange = async (lessPath: string) => {
  const config = getConfig();
  const commonThemeList = await getCommonTheme(config);
  return generateOneLess(commonThemeList, config, lessPath).then(() =>
    mergeCss(commonThemeList, config)
  );
};

watcher.on('change', function (path, __stats__) {
  handleLessChange(path).then(console.log);
});

// watcher.on('add', function (path, stats) {
//   console.log(`File ${path} was added`);
// });

watcher.on('unlink', function (path, stats) {
  console.log(`File ${path} was removed`);
});
