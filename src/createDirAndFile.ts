import fs from 'fs-extra';
import path from 'path';
import globby from 'globby';
import {
  themeDirProps,
  listenLessPathObjProps,
  lessThemeObjProps,
  lessPathProps
} from './Types';

const common_path = '.theme';
const listen_theme_path = `${common_path}/listen`;
const listen_style_path = `${listen_theme_path}/**/*.less`;

/**
 * 创建 .theme/listen 文件夹 以及内部文件
 * @param components_path 传入监听的文件夹 test/storeVariables/components
 * @returns
 *  [{
 *   origin_path: 'xx/xx/xxx.less'
 *   new_path: '.theme/listen/xx/xx/xxx.less'
 *  }]
 */
export const createListeningLessFile = async (
  components_path: string,
  theme_obj: themeDirProps
): Promise<lessThemeObjProps> => {
  const less_theme_keys = Object.keys(theme_obj);
  const less_theme_map: lessThemeObjProps = {};
  less_theme_keys.forEach(key => {
    less_theme_map[key] = [];
  });

  await fs.ensureDir(common_path);
  await fs.copy(path.resolve(components_path), path.resolve(listen_theme_path));
  const files = await globby(listen_style_path);

  const less_path_array: listenLessPathObjProps[] = files.reduce(
    (arr, origin_path) => {
      const lastIndex = origin_path.lastIndexOf('/');
      const path_array = less_theme_keys.map(k => {
        const item = {
          origin_path,
          new_path:
            origin_path.substring(0, lastIndex) +
            `/.${k}` +
            origin_path.substring(lastIndex)
        };
        less_theme_map[k].push(item);
        return item;
      });

      return arr.concat(path_array);
    },
    []
  );
  return await Promise.all(
    less_path_array.map(o => fs.ensureFile(o.new_path))
  ).then(() => less_theme_map);
};

/**
 * 创建 color/layout 文件夹
 * @param obj
  {
    color: [
      "test/storeVariables/color/Default.less",
      "test/storeVariables/color/Blue.less",
      "test/storeVariables/color/Green.less"
    ],
    layout: [
      "test/storeVariables/layout/Default.less",
      "test/storeVariables/layout/Small.less",
      "test/storeVariables/layout/Large.less"
    ]
  }
  // 将创建以下文件
  .theme/color/Default.less
  .theme/color/Blue.less
  .theme/color/Green.less
  .theme/layout/Default.less
  .theme/layout/Small.less
  .theme/layout/Large.less
 */
export const createThemeComonFile = (
  theme_obj: themeDirProps
): Promise<lessThemeObjProps> => {
  let theme_file_path_array: listenLessPathObjProps[] = [];
  const less_theme_map: lessThemeObjProps = {};
  const less_theme_keys = Object.keys(theme_obj);
  less_theme_keys.forEach(key => {
    less_theme_map[key] = [];
  });

  less_theme_keys.forEach(key => {
    const theme_file_path_prefix = path.resolve(`${common_path}/${key}`);
    const arr = theme_obj[key].map(origin_path => {
      const fileName = origin_path.split('/').pop();
      const theme_file_path = path.resolve(
        `${theme_file_path_prefix}/${fileName}`
      );
      const item = {
        origin_path,
        new_path: theme_file_path
      };
      less_theme_map[key].push(item);
      return item;
    });

    theme_file_path_array = theme_file_path_array.concat(arr);
  });
  return Promise.all(
    theme_file_path_array.map(o => {
      return fs
        .ensureFile(o.new_path)
        .then(() => fs.copyFile(o.origin_path, o.new_path));
    })
  ).then(() => less_theme_map);
};

/**
 * 
 * @param config 
 * @returns 
 * 
 * theme_file_path_array: {
      color: [{
        origin_path: 'test/storeVariables/color/Default.less',
         new_path: 'D:\\lessToCss\\.theme\\color\\Default.less'
      }]
    }
    
   less_file_path_array: {
      color: [
        {
          origin_path: '.theme/listen/input/style.less',
          new_path: '.theme/listen/input.color/style.less'
        }
      ]
    }
 */

export const createThemeDirAndFiles = async (config: lessPathProps) => {
  const p1 = createThemeComonFile(config.theme);
  const p2 = createListeningLessFile(config.components, config.theme);
  return Promise.all([p1, p2]);
};
