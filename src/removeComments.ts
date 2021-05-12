/**
 * 
 * @param {str} str less string
 * @input 
    // @breakpoint: 1600px;
    @table-bg-error: #ffd3c1;
   @output 
    @table-bg-error: #ffd3c1;
 */
const removeComments = (str: string) => {
  // const token_start_array_1 = "//";
  // const token_start_array_2 = "/*";
  // const token_end_array_1 = "\n";
  // const token_end_array_2 = "*/";

  const REGX_token_start_array_1 = /\/\//g;
  const REGX_token_end_array_1 = /\n/g;
  const REGX_token_start_array_2 = /\/\*/g;
  const REGX_token_end_array_2 = /\*\//g;

  let token_start_array_1 = [...str.matchAll(REGX_token_start_array_1)].map(
    item => item.index
  ); // [80, 82, 84, 131, 181];
  let token_start_array_2 = [...str.matchAll(REGX_token_start_array_2)].map(
    item => item.index
  ); // [134, 430];
  let token_end_array_1 = [...str.matchAll(REGX_token_end_array_1)].map(
    item => item.index
  ); // [36, 37, 79, 130, 179, 180, 242];
  let token_end_array_2 = [...str.matchAll(REGX_token_end_array_2)].map(
    item => item.index
  ); // [485];

  // 第一次循环
  // token_start_array_1 token_start_array_2 谁最小就先开始比对。
  // 找到 80 , 然后token_end_array_1 内找到 130
  // 注释第一段 ["80-130"]
  // [131, 181];
  // [180, 242];
  // [134, 430];
  // [485];

  // 第二次循环
  // [181];
  // [242];
  // [430];
  // [485];

  // 第三次循环
  // [];
  // [];
  // [430];
  // [485];

  // 第四次循环
  // [];
  // [];
  // [];
  // [];

  const comments = [];
  while (token_start_array_1.length > 0 || token_start_array_2.length > 0) {
    // 判断是 // 还是 /*
    let token_type = "token_start_array_1";
    token_start_array_1[0] < token_start_array_2[0]
      ? "token_start_array_1"
      : "token_start_array_2";
    if (
      token_start_array_1.length === 0 ||
      token_start_array_2[0] < token_start_array_1[0]
    ) {
      token_type = "token_start_array_2";
    }
    // 找到 一段注释的 起点到终点。
    let token_start_index = 0;
    let token_end_index = 0;
    if (token_type === "token_start_array_1") {
      token_start_index = token_start_array_1[0];
      token_end_index = token_end_array_1.filter(i => i > token_start_index)[0];
    } else {
      token_start_index = token_start_array_2[0];
      token_end_index = token_end_array_2.filter(i => i > token_start_index)[0];
    }
    comments.unshift([token_start_index, token_end_index, token_type]);

    // 重置 数组
    token_start_array_1 = token_start_array_1.filter(i => i > token_end_index);
    token_start_array_2 = token_start_array_2.filter(i => i > token_end_index);
    token_end_array_1 = token_end_array_1.filter(i => i > token_end_index);
    token_end_array_2 = token_end_array_2.filter(i => i > token_end_index);
  }

  // 删除 str 中的注释
  if (comments.length > 0) {
    comments.forEach(arr => {
      let start_index = arr[0];
      let end_index = arr[1];
      let token_type = arr[2];

      if (typeof start_index === "number" && typeof end_index === "number") {
        start_index =
          token_type === "token_start_array_2"
            ? start_index
            : start_index - 1;

        end_index =
          token_type === "token_start_array_2" ? end_index + 2 : end_index;
        str = str.substring(0, start_index) + str.substring(end_index);
      }
    });
  }
  return str;
};

export default removeComments;
