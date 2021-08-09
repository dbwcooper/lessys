import {
  strObjProps,
  funcDefinedProps
} from './Types';

import { expandFunction } from './expandFunction';
import { extractVariables } from './extractVariables';
import { formatLess } from './formatLess';
import './monitorLess';

export const extractLess = (
  lessStr: string,
  variable: strObjProps,
  func_defined?: { [name: string]: funcDefinedProps }
) => {
  return formatLess(lessStr)
    .then(str => expandFunction(str, func_defined))
    .then(str => extractVariables(str, variable));
};
