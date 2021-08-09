import path from 'path';
import fs from 'fs-extra';
import { themeConfigProps, lessVariablesObjProps } from './Types';

import { getLessFunction } from './expandFunction';
import { getLessVariable, getFileUTF8 } from './util';
import './monitorLess';

