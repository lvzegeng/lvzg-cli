const chalk = require('chalk');
const logSymbols = require('log-symbols');

// bold -使文字加粗
// italic-将文字设为斜体（不被广泛支持）
// underline-使文字加下划线（不被广泛支持）

// chalk.blue.bgRed.bold.underline('Hello world!')
// chalk.bold.rgb(10, 100, 200).bgRgb(15, 100, 204)('Hello!')

exports.success = (str) => {
  // 成功用绿色显示，给出积极的反馈
  console.log(logSymbols.success, chalk.green(str));
};

exports.error = (str) => {
  // 失败了用红色，增强提示
  console.log(logSymbols.error, chalk.red(str));
};

exports.info = (str) => {
  console.log(logSymbols.info, chalk.blue(str));
};

exports.warning = (str) => {
  console.log(logSymbols.warning, chalk.magenta(str));
};
