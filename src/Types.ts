export interface themeDirProps {
  [name: string]: string[];
}

export interface strObjProps {
  [name: string]: string;
}

export interface funcDefinedProps {
  type: lessFuncTypeEnum.defined;
  name: string;
  start: number; // 标记定义函数 开始的 index
  end: number; // 标记定义函数 结束的 index
  params: string[];
  content: string;
}

export interface funcUsedProps {
  type: lessFuncTypeEnum.used;
  name: string;
  start: number; // 标记使用函数 开始的 index
  end: number; // 标记使用函数 结束的 index
  params: string[];
}

export interface lessFunctionProps {
  funcUsedList: funcUsedProps[]; // 当前 less string 用到的所有 function name
  funcDefined: {
    [name: string]: funcDefinedProps;
  };
}
export interface lessysConfigProps {
  theme: {
    [name: string]: string[];
  };
  componentDir: string;
  outputDir: string; // '.theme'
  watching: boolean, // 监控 componentDir 文件夹中的 less 文件是否变更
}

export interface themeItemProps {
  originLessPath: string; // 原始的 theme less 路径,
  outputCssPath: string; // 最终输出的 theme css 路径
  outputCssName: string; // 最终输出的 theme less 路径
  outputLessName: string; // 最终输出的 theme less 名: Default.less
  cateKey: string; // color | layout
  lessVariables: strObjProps; // theme less 的变量
  lessFunction: lessFunctionProps; // theme less 的函数变量
  lessStr: string; // theme less 字符串
}

export interface themeConfigProps {
  themePath: string;
  cateKey: string;
  outputDir: string;
}

export interface lessVariablesObjProps {
  [name: string]: {
    lessVariables: strObjProps;
    lessFunction: lessFunctionProps;
  };
}
export enum lessFuncTypeEnum {
  'used' = 'used',
  'defined' = 'defined',
  'others' = 'others'
}

export interface monitorLessFileProps {
  [name: string]: {
    [name: string]: string;
  };
}
