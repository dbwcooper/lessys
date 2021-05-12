import path from 'path';
import fs from 'fs-extra';
import { getLessVariable, getLessFuncVariable } from './storeVariables';
import { lessPathProps } from './Types';

import { formatLessString, getLessString } from './util';
import { getCommonVariables } from './main';
import { createThemeDirAndFiles } from './createDirAndFile';

const path1 = path.resolve('test/mock/comments/1.less');
const path2 = path.resolve('test/mock/comments/2.less');
const path3 = path.resolve('test/mock/comments/3.less');
const path4 = path.resolve('test/mock/comments/4.less');
const path5 = path.resolve('test/mock/comments/5.less');
const path6 = path.resolve('test/mock/comments/6.less');
const path7 = path.resolve('test/mock/comments/7.less');
const select_style_path = path.resolve('test/components/select/style.less');
const path_result = path.resolve('D:/lessToCss/dist/result.less');

const config: lessPathProps = {
  theme: {
    color: [
      'test/theme/color/Default.less',
      'test/theme/color/Blue.less',
      'test/theme/color/Green.less'
    ],
    layout: [
      'test/theme/layout/Default.less',
      'test/theme/layout/Small.less',
      'test/theme/layout/Large.less'
    ]
  },
  output: '.theme',
  components: 'test/components'
};

const test = async (config: lessPathProps) => {
  const path_array = await createThemeDirAndFiles(config);
  const theme_file_path_array = path_array[0];
  const less_file_path_array = path_array[1];

  const theme_variables = await getCommonVariables(theme_file_path_array);
  // test
  const common_layout = theme_variables.layout;
  const str = await getLessString(select_style_path);
  const less_variables_obj = await getLessVariable(str);
  console.log('less_variables_obj: ', less_variables_obj);
  const less_variables_func_obj = await getLessFuncVariable(str);
  console.log('less_variables_func_obj: ', less_variables_func_obj);

  const format_str = await formatLessString(str);
  console.log('format_str: ', format_str);
  // const replaced_str = await replaceFuncVairables(format_str, less_variables_func_obj);

  fs.writeFile(path_result, format_str);

  /**
   * 合并变量，合并函数变量
   * 替换less 文件中的 函数, 变量
   * 生成 less 文件
   */
  //  extractLess(less_file_path_array, theme_variables)
};
test(config);
