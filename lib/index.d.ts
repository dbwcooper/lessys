interface strObjProps {
    [name: string]: string;
}
interface funcDefinedProps {
    type: lessFuncTypeEnum.defined;
    name: string;
    start: number;
    end: number;
    params: string[];
    content: string;
}
interface funcUsedProps {
    type: lessFuncTypeEnum.used;
    name: string;
    start: number;
    end: number;
    params: string[];
}
interface lessFunctionProps {
    funcUsedList: funcUsedProps[];
    funcDefined: {
        [name: string]: funcDefinedProps;
    };
}
interface lessysConfigProps {
    theme: {
        [name: string]: string[];
    };
    componentDir: string;
    outputDir: string;
    watching: boolean;
}
interface themeItemProps {
    originLessPath: string;
    outputCssPath: string;
    outputCssName: string;
    outputLessName: string;
    cateKey: string;
    lessVariables: strObjProps;
    lessFunction: lessFunctionProps;
    lessStr: string;
}
interface themeConfigProps {
    themePath: string;
    cateKey: string;
    outputDir: string;
}
declare enum lessFuncTypeEnum {
    'used' = "used",
    'defined' = "defined",
    'others' = "others"
}

declare const extractLess: (lessStr: string, variable: strObjProps, func_defined?: {
    [name: string]: funcDefinedProps;
}) => Promise<string>;
declare const getThemeVariables: (themePath: string) => Promise<Omit<themeItemProps, 'originLessPath' | 'outputCssPath' | 'outputCssName' | 'cateKey' | 'outputLessName'>>;
declare const getSingleTheme: (data: themeConfigProps) => Promise<themeItemProps>;
declare const getCommonTheme: (config: lessysConfigProps) => Promise<themeItemProps[]>;
declare const generateOneLess: (commonThemeList: themeItemProps[], config: lessysConfigProps, lessFilePath: string) => Promise<{
    outputLessPath: string;
    outputCssStr: string;
    outputThemeCssPath: string;
}[]>;
declare const transferComponentLess: (commonThemeList: themeItemProps[], config: lessysConfigProps) => Promise<string>;
declare const main: () => Promise<void>;

export { extractLess, generateOneLess, getCommonTheme, getSingleTheme, getThemeVariables, main, transferComponentLess };
