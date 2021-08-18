import gulp from 'gulp';
import gulpConcat from 'gulp-concat';
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

// TODO: watch
export const watchLess = (config: lessysConfigProps) => {
  const watchRegx = `${config.monitorDir}/**/.less`;
  console.log('config', config);
  gulp.watch(watchRegx, (data) => {
    console.log('watch');
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
watchLess(entryConfig);
