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
  monitorDir: string;
  outputDir: string; // '.theme'
}

export interface themeItemProps {
  outputCssPath: string;
  outputCssName: string;
  outputLessName: string;
  cateKey: string;
  lessVariables: strObjProps;
  lessFunction: lessFunctionProps;
  lessStr: string;
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
