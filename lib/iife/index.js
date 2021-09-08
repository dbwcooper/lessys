(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __require = (x) => {
    if (typeof require !== "undefined")
      return require(x);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // src/index.ts
  var import_path3 = __toModule(__require("path"));
  var import_globby = __toModule(__require("globby"));
  var import_fs_extra2 = __toModule(__require("fs-extra"));

  // src/Types.ts
  var lessFuncTypeEnum;
  (function(lessFuncTypeEnum2) {
    lessFuncTypeEnum2["used"] = "used";
    lessFuncTypeEnum2["defined"] = "defined";
    lessFuncTypeEnum2["others"] = "others";
  })(lessFuncTypeEnum || (lessFuncTypeEnum = {}));

  // src/expandFunction.ts
  var REGX_func_name = /\.[a-zA-Z]*(?=\()/g;
  var REGX_space = /\s/g;
  var REGX_used_func_params = /[\s,\(\)]/g;
  var REGX_func_params = /@[a-zA-Z-_\d]*/g;
  var REGX_less_params = /@[a-zA-Z-_\d]+/g;
  var getDefinedFuncStartIndex = (str, start) => {
    return start + str.substring(start).search("{");
  };
  var getDefinedFuncEndIndex = (str, start) => {
    let lcb = [];
    let rcb = [];
    const fi = [...str.substring(start).matchAll(/[{}]/g)].find((item) => {
      if (item[0] === "{") {
        lcb.push(item.index);
      }
      if (item[0] === "}") {
        rcb.push(item.index);
      }
      return lcb.length !== 0 && lcb.length === rcb.length;
    }).index;
    return start + fi;
  };
  var getDefinedFuncParams = (fdn) => {
    const params = [...fdn.matchAll(REGX_func_params)].map((o) => o[0]).filter((o) => !!o);
    return params;
  };
  var getUsedFuncEndIndex = (str, start) => {
    return start + str.substring(start).search(";");
  };
  var getUsedFuncParams = (fus, name) => {
    const arr = fus.split(REGX_used_func_params);
    if (arr[0] !== name) {
      return [];
    }
    return arr.filter((item, index) => index !== 0 && arr.length - 1 !== index && item);
  };
  var getLessFunctionImpl = (str, name, start = 0) => {
    const fi = str.substring(start).search(/[{;]/g) + start;
    const ffs = str.substring(start, fi + 1).replace(REGX_space, "");
    let type = "others";
    if (ffs.indexOf(")when(") > -1) {
      type = "others";
    } else if (ffs.substr(-2) !== "){") {
      type = "used";
    } else {
      type = "defined";
    }
    if (type === "used") {
      const end = getUsedFuncEndIndex(str, start);
      const fus = str.substring(start, end);
      const params = getUsedFuncParams(fus, name);
      const fo = {
        name,
        start,
        type: lessFuncTypeEnum.used,
        end,
        params
      };
      return fo;
    } else if (type === "defined") {
      const fds = getDefinedFuncStartIndex(str, start);
      const fde = getDefinedFuncEndIndex(str, fds);
      const fdc = str.substring(fds + 1, fde);
      const params = getDefinedFuncParams(str.substring(start, fds));
      const fo = {
        name,
        start: fds,
        end: fde,
        type: lessFuncTypeEnum.defined,
        params,
        content: fdc
      };
      return fo;
    }
  };
  var expandFunctionImpl = (str, fu, fd) => {
    const pm = {};
    fu.params.forEach((value, index) => {
      let k = fd[fu.name].params[index];
      pm[k] = value;
    });
    if (Object.keys(pm).length > 0) {
      let fdc = fd[fu.name].content;
      const arr = [...fdc.matchAll(REGX_less_params)].reverse();
      arr.forEach((p) => {
        let variable_name = p[0];
        let index = p.index;
        let length = variable_name.length;
        if (pm[variable_name]) {
          fdc = fdc.substring(0, index) + pm[variable_name] + fdc.substring(index + length);
        }
      });
      str = str.substring(0, fu.start) + fdc + str.substring(fu.end + 1);
    }
    return str;
  };
  var getNestFunction = (str, fd) => {
    let fra = [...str.matchAll(REGX_func_name)];
    const fdo = fra.find((item) => fd[item[0]]);
    if (!fdo) {
      return str;
    }
    const end = getUsedFuncEndIndex(str, fdo.index);
    const func_used = {
      type: lessFuncTypeEnum.used,
      name: fdo[0],
      start: fdo.index,
      end,
      params: getUsedFuncParams(str.substring(fdo.index, end), fdo[0])
    };
    str = expandFunctionImpl(str, func_used, fd);
    return getNestFunction(str, fd);
  };
  var getLessFunction = async (str) => {
    const fra = [...str.matchAll(REGX_func_name)];
    return Promise.all(fra.map((item) => {
      const func_name = item[0];
      const start = item.index;
      return getLessFunctionImpl(str, func_name, start);
    })).then((arr) => {
      const data = {
        funcUsedList: [],
        funcDefined: {}
      };
      arr.filter((i) => i).forEach((obj) => {
        if (obj.type === "used") {
          data.funcUsedList.push(obj);
        }
        if (obj.type === "defined") {
          data.funcDefined[obj.name] = obj;
        }
      });
      return data;
    }).then((data) => {
      Object.keys(data.funcDefined).forEach((func_name) => {
        data.funcDefined[func_name].content = getNestFunction(data.funcDefined[func_name].content, data.funcDefined);
      });
      return data;
    });
  };
  var expandFunction = async (str, commonFuncDefined) => {
    return getLessFunction(str).then((data) => {
      const funcUsedList = data.funcUsedList.reverse();
      const funcDefinedAll = __spreadValues(__spreadValues({}, commonFuncDefined), data.funcDefined);
      funcUsedList.forEach((funcUsed) => {
        const c = str.substring(funcUsed.start, funcUsed.end);
        if (funcDefinedAll[funcUsed.name] && c.startsWith(funcUsed.name)) {
          str = expandFunctionImpl(str, funcUsed, data.funcDefined);
        }
      });
      return str;
    });
  };

  // src/util.ts
  var import_fs_extra = __toModule(__require("fs-extra"));
  var import_path = __toModule(__require("path"));
  var import_less = __toModule(__require("less"));
  var REGX_line = /\n/g;
  var REGX_variables = /;/g;
  var removeConstantLine = (str) => {
    return str.split(REGX_line).filter((item) => {
      return item.includes("@") || item.includes("{") || item.includes("}") || item.includes(",") || item.includes(".") || item.includes("&") || item.includes(">");
    }).join("\n");
  };
  var removeComments = (str) => {
    const REGX_token_start_array_1 = /\/\//g;
    const REGX_token_end_array_1 = /\n/g;
    const REGX_token_start_array_2 = /\/\*/g;
    const REGX_token_end_array_2 = /\*\//g;
    let tsa1 = [...str.matchAll(REGX_token_start_array_1)].map((item) => item.index);
    let tsa2 = [...str.matchAll(REGX_token_start_array_2)].map((item) => item.index);
    let tea1 = [...str.matchAll(REGX_token_end_array_1)].map((item) => item.index);
    let tea2 = [...str.matchAll(REGX_token_end_array_2)].map((item) => item.index);
    const comments = [];
    while (tsa1.length > 0 || tsa2.length > 0) {
      let tType = "tsa1";
      tsa1[0] < tsa2[0] ? "tsa1" : "tsa2";
      if (tsa1.length === 0 || tsa2[0] < tsa1[0]) {
        tType = "tsa2";
      }
      let tsi = 0;
      let tei = 0;
      if (tType === "tsa1") {
        tsi = tsa1[0];
        tei = tea1.filter((i) => i > tsi)[0];
      } else {
        tsi = tsa2[0];
        tei = tea2.filter((i) => i > tsi)[0];
      }
      comments.unshift([tsi, tei, tType]);
      tsa1 = tsa1.filter((i) => i > tei);
      tsa2 = tsa2.filter((i) => i > tei);
      tea1 = tea1.filter((i) => i > tei);
      tea2 = tea2.filter((i) => i > tei);
    }
    if (comments.length > 0) {
      comments.forEach((arr) => {
        let si = arr[0];
        let ei = arr[1];
        let tType = arr[2];
        if (typeof si === "number" && typeof ei === "number") {
          si = tType === "tsa2" ? si : si - 1;
          ei = tType === "tsa2" ? ei + 2 : ei;
          str = str.substring(0, si) + str.substring(ei);
        }
      });
    }
    return str;
  };
  var getFileUTF8 = async (lessPath) => import_fs_extra.default.readFile(lessPath, "utf8");
  var getLessVariable = (str) => {
    return removeComments(str).split(REGX_variables).reduce((prev = {}, current) => {
      if (current.includes(":")) {
        let variable = current.split(":")[0].trim();
        let variv = current.split(":")[1];
        if (variable.includes("@{") || variable.includes("{") || variable.includes("//") || variable.includes("&") || variable.indexOf("@") === -1) {
          return prev;
        }
        if (variable && typeof variable === "string") {
          prev[variable] = variv;
        }
      }
      return prev;
    }, {});
  };
  var transferAbsolutePath = (lessStr, dir) => {
    let regx1 = /@import\s?\S*;/g;
    let regx2 = /[\'|\"]/g;
    const pathArr = [...lessStr.matchAll(regx1)].map((item) => {
      let lineStr = item[0];
      let startIndex = [...lineStr.matchAll(regx2)][0].index + 1;
      let endIndex = [...lineStr.matchAll(regx2)][1].index;
      return lineStr.substring(startIndex, endIndex);
    });
    const transferPathArr = pathArr.map((item) => {
      if (!import_path.default.isAbsolute(item)) {
        return import_path.default.resolve(dir, item).replace(/\\/g, "/");
      }
      return item;
    });
    transferPathArr.forEach((newPath, index) => {
      let oldPath = pathArr[index];
      lessStr = lessStr.replace(oldPath, newPath);
    });
    return lessStr;
  };
  var lessToCss = async (lessInputStr, themeItem) => {
    const renderOptions = {
      math: "always",
      modifyVars: themeItem.lessVariables
    };
    return import_less.default.render(lessInputStr, renderOptions).then((output) => output.css.replace(/:global ?/g, "")).then(removeComments).catch((e) => {
      console.log(e);
      return "";
    });
  };
  var getUserConfig = async () => {
    try {
      const configPath = import_path.default.resolve("lessys.config.js");
      return __require(configPath);
    } catch (err) {
      if (err.code !== "MODULE_NOT_FOUND") {
        console.error("lessys.config.js file cannot be found, please create it.");
      }
    }
  };

  // src/extractVariables.ts
  var REGX_br = /\n/g;
  var REGX_less_params2 = /@[a-zA-Z-_\d]+/g;
  var extractVariablesImpl = (str, variable) => {
    return str.split(REGX_br).filter((ls) => {
      if (ls.includes("{") || ls.includes("}") || ls.includes(",") || ls.includes(".") || ls.includes("&") || ls.includes(">")) {
        return true;
      }
      if (ls.includes("@")) {
        let is = ls.search(":");
        const llva = [...ls.substring(is).matchAll(REGX_less_params2)].map((i) => i[0].trim());
        return llva.some((k) => variable[k]);
      }
      return false;
    }).join("\n");
  };
  var extractVariables = (str, variable) => {
    return Promise.resolve(getLessVariable(str)).then((fv) => {
      if (typeof variable === "object") {
        const mv = __spreadValues({}, variable);
        for (const k in fv) {
          if (Object.prototype.hasOwnProperty.call(fv, k)) {
            const vk = fv[k].trim();
            if (mv[vk]) {
              mv[k] = vk;
            }
          }
        }
        return extractVariablesImpl(str, mv);
      }
      return str;
    });
  };

  // src/formatLess.ts
  var import_prettier = __toModule(__require("prettier"));
  var formatLess = async (less_str) => {
    return Promise.resolve(less_str).then(removeConstantLine).then((str) => {
      return import_prettier.default.format(str, {
        arrowParens: "always",
        parser: "less",
        bracketSpacing: true,
        embeddedLanguageFormatting: "auto",
        htmlWhitespaceSensitivity: "css",
        insertPragma: false,
        printWidth: 120,
        proseWrap: "preserve",
        quoteProps: "as-needed",
        requirePragma: false,
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        useTabs: false,
        vueIndentScriptAndStyle: false
      });
    }).then(removeComments);
  };

  // src/monitor.ts
  var import_path2 = __toModule(__require("path"));
  var import_gulp = __toModule(__require("gulp"));
  var import_gulp_concat = __toModule(__require("gulp-concat"));
  var mergeCss = (commonThemeList, config, watchingLessPath) => {
    return Promise.all(commonThemeList.map((item) => {
      const regx = import_path2.default.resolve(config.componentDir + "/**/" + item.cateKey + "/" + item.outputCssName);
      import_gulp.default.src(regx).pipe((0, import_gulp_concat.default)(item.outputCssName)).pipe(import_gulp.default.dest(import_path2.default.parse(item.outputCssPath).dir));
    })).then(() => `${watchingLessPath} has transferred successfully`);
  };
  var handleLessChange = async (lessPath) => {
    const config = await getUserConfig();
    const commonThemeList = await getCommonTheme(config);
    return generateOneLess(commonThemeList, config, lessPath).then(() => mergeCss(commonThemeList, config, lessPath));
  };
  var monitor = async () => {
    const entryConfig = await getUserConfig();
    const watcher = (0, import_gulp.watch)([`${entryConfig.componentDir}/**/*.less`]);
    watcher.on("change", function(path4, __stats__) {
      handleLessChange(path4).then(console.log);
    });
    watcher.on("unlink", function(path4, stats) {
      handleLessChange(path4).then(console.log);
    });
  };

  // src/index.ts
  var extractLess = async (lessStr, variable, func_defined) => {
    return formatLess(lessStr).then((str) => expandFunction(str, func_defined)).then((str) => extractVariables(str, variable));
  };
  var getThemeVariables = async (themePath) => {
    const lessStr = await getFileUTF8(themePath).then(removeComments);
    const lessVariables = getLessVariable(lessStr);
    const lessFunction = await getLessFunction(lessStr);
    return {
      lessVariables,
      lessFunction,
      lessStr
    };
  };
  var getSingleTheme = async (data) => {
    const variables = await getThemeVariables(data.themePath);
    const cssName = import_path3.default.parse(data.themePath).name + ".css";
    const lessName = import_path3.default.parse(data.themePath).name + ".less";
    const outputCssPath = import_path3.default.join(data.outputDir, data.cateKey + "/" + cssName);
    const originLessPath = import_path3.default.resolve(data.themePath);
    return __spreadValues({
      originLessPath,
      outputCssPath: import_path3.default.resolve(outputCssPath),
      outputCssName: cssName,
      outputLessName: lessName,
      cateKey: data.cateKey
    }, variables);
  };
  var getCommonTheme = async (config) => {
    let pathList = [];
    for (const cateKey in config.theme) {
      config.theme[cateKey].forEach((itemPath) => {
        pathList.push({
          cateKey,
          themePath: itemPath,
          outputDir: config.outputDir
        });
      });
    }
    return await Promise.all(pathList.map(getSingleTheme));
  };
  var generateOneLess = async (commonThemeList, config, lessFilePath) => {
    const outputcomponentDirPath = import_path3.default.resolve(config.outputDir, "monitor");
    const componentDirPath = import_path3.default.resolve(config.componentDir);
    lessFilePath = import_path3.default.resolve(lessFilePath);
    return getFileUTF8(lessFilePath).then((lessStr) => {
      const pathParser = import_path3.default.parse(lessFilePath);
      lessStr = transferAbsolutePath(lessStr, pathParser.dir);
      return Promise.all(commonThemeList.map((item) => {
        return extractLess(lessStr, item.lessVariables, item.lessFunction.funcDefined).then(async (outputLessStr) => {
          const outputLessPath = import_path3.default.join(pathParser.dir.replace(componentDirPath, outputcomponentDirPath), item.cateKey, item.outputLessName);
          const outputCssPath = import_path3.default.join(pathParser.dir.replace(componentDirPath, outputcomponentDirPath), item.cateKey, item.outputCssName);
          const cssStr = await lessToCss(outputLessStr, item);
          const result = {
            outputLessPath,
            outputCssStr: cssStr,
            outputThemeCssPath: item.outputCssPath
          };
          await Promise.all([
            import_fs_extra2.default.createFile(outputLessPath).then(() => import_fs_extra2.default.writeFile(outputLessPath, outputLessStr)),
            import_fs_extra2.default.createFile(outputCssPath).then(() => import_fs_extra2.default.writeFile(outputCssPath, cssStr))
          ]);
          return result;
        });
      }));
    });
  };
  var transferComponentLess = async (commonThemeList, config) => {
    const monitorFileRegx = config.componentDir + "/**/*.less";
    const lessPaths = await (0, import_globby.globby)(monitorFileRegx);
    return Promise.all(lessPaths.map((lessPath) => generateOneLess(commonThemeList, config, lessPath))).then((results) => {
      const themeCssMap = {};
      results.forEach((arr) => {
        arr.forEach((item) => {
          let key = item.outputThemeCssPath;
          let value = item.outputCssStr;
          if (themeCssMap[key]) {
            themeCssMap[key] += value;
          } else {
            themeCssMap[key] = value;
          }
        });
      });
      return themeCssMap;
    }).then((themeCssMap) => {
      return Promise.all([
        Object.keys(themeCssMap).map((themeCssPath) => {
          return import_fs_extra2.default.createFile(themeCssPath).then(() => import_fs_extra2.default.writeFile(themeCssPath, themeCssMap[themeCssPath]));
        })
      ]).then(() => "success");
    });
  };
  var main = async () => {
    const config = await getUserConfig();
    const commonThemeList = await getCommonTheme(config);
    await transferComponentLess(commonThemeList, config);
    if (config.watching) {
      monitor();
    }
  };
  main();
})();
//# sourceMappingURL=index.js.map
