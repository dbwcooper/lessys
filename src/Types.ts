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

export interface listenLessPathObjProps {
  origin_path: string; // 代码内的 less; 文件不会变更
  new_path: string; // 换肤程序将使用的 文件路径， 此路径下的文件将实时变更
}

export interface lessThemeObjProps {
  [name: string]: listenLessPathObjProps[];
}

export interface monitorConfigProps {
  themeList: string[];
  monitorDir: string;
  outputDir: string; // '.theme'
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
