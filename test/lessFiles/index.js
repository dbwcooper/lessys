var less = require('less'),
  fs = require('fs-extra'),
  path = require('path');

var src = path.resolve(__dirname, './1.less'); //some less source file
var result = less.parse(
  fs.readFileSync(src).toString(),
  {
    filename: '123'
  },
  function (e, tree) {
    console.log('tree: ', tree);
    console.log(JSON.stringify(tree, null, 2));
  }
);


const data = {
  func_names: [
    {
      func_index: 2652,
      func_name: '.setSelection'
    }
  ],
  func_items: {
    '.getHeight': {
      func_index: 2900,
      params: ["@height", "@heightMedia"],
      content: `
        height: @height - @snx-px - 2px;
      `
    }
    '.setSelection': {
      func_index: 2900,
      params: ["@height", "@heightMedia"],
      content: `
        height: @height - @snx-px - 2px;
        line-height: @height - @snx-px - 2px;
        margin-top: @snx-px-half;
        .@{ant-select}-selection__choice__content {
          line-height: @height - @snx-px - 2px - 2px;
        }
        .getHeight(@height)
      `
    },
  }
};