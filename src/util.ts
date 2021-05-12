import fs from 'fs-extra';
import prettier from 'prettier';
import removeComments from './removeComments';




const REGX_line = /\n/g; // 换行符


/**
 * #1 删除多余的行
 *  color: #fff; 等 没有变量的行
 */
export const keepVariables = (str: string) => {
  return str
    .split(REGX_line)
    .filter(item => {
      return (
        item.includes('@') ||
        item.includes('{') ||
        item.includes('}') ||
        item.includes(',') ||
        item.includes('.') ||
        item.includes('>')
      );
    })
    .join('\n');
};

/**
 * 格式化 less 文件字符串
 * @param str less string
 * @returns string
 */
export const formatLessString = async (str: string): Promise<string> => {
  return Promise.resolve(removeComments(str))
    .then(keepVariables)
    .then(str => {
      return prettier.format(str, {
        arrowParens: 'always',
        parser: 'less',
        bracketSpacing: true,
        embeddedLanguageFormatting: 'auto',
        htmlWhitespaceSensitivity: 'css',
        insertPragma: false,
        printWidth: 120,
        proseWrap: 'preserve',
        quoteProps: 'as-needed',
        requirePragma: false,
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        useTabs: false,
        vueIndentScriptAndStyle: false
      });
    });
};

/**
 * less 文件 -> less 字符串
 * @param less_path less 文件路径
 * @returns string
 */
export const getLessString = async (less_path: string) =>
  fs.readFile(less_path, 'utf8');
