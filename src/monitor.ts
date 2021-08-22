import path from 'path';
import gulp, { watch } from 'gulp';
import gulpConcat from 'gulp-concat';
import { generateOneLess, getCommonTheme } from './index';
import { lessysConfigProps, themeItemProps } from './Types';
import {
  getUserConfig
} from './util';
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





const mergeCss = (
  commonThemeList: themeItemProps[],
  config: lessysConfigProps,
  watchingLessPath: string
) => {
  return Promise.all(
    commonThemeList.map((item) => {
      const regx = path.resolve(
        config.componentDir + '/**/' + item.cateKey + '/' + item.outputCssName
      );
      gulp
        .src(regx)
        .pipe(gulpConcat(item.outputCssName))
        .pipe(gulp.dest(path.parse(item.outputCssPath).dir));
    })
  ).then(() => `${watchingLessPath} has transferred successfully`);
};

const handleLessChange = async (lessPath: string) => {
  const config = await getUserConfig();
  const commonThemeList = await getCommonTheme(config);
  return generateOneLess(commonThemeList, config, lessPath).then(() =>
    mergeCss(commonThemeList, config, lessPath)
  );
};


export const monitor = async () => {
  const entryConfig = await getUserConfig();
  const watcher = watch([`${entryConfig.componentDir}/**/*.less`]);

  watcher.on('change', function (path, __stats__) {
    handleLessChange(path).then(console.log);
  });

  watcher.on('unlink', function (path, stats) {
    handleLessChange(path).then(console.log);
  });

  // watcher.on('add', function (path, stats) {
  //   console.log(`File ${path} was added`);
  // });
}

