import { removeComments, removeConstantLine } from './util';
import prettier from 'prettier';

/**
 * 格式化 less 文件字符串
 * @param str less string
 * @returns string
 */
export const formatLess = async (less_str: string): Promise<string> => {
  return Promise.resolve(less_str)
    .then(removeConstantLine)
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
    })
    .then(removeComments);
};

export default formatLess;
