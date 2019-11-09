#!/usr/bin/env node
const program = require('commander');
const package = require('../package.json');

program
  // 处理显示版本命令，默认选项标识为-V和--version，当存在时会打印版本号并退出
  .version(package.version, '-v, --version', 'output the current version')

  // 重写覆盖默认的帮助标识和描述
  .helpOption('-h, --help', 'read more information')

  .usage('数据治理项目前端自动部署工具')

  // 为最高层命令指定子命令，第一个参数可以指定命令的名字以及任何参数，参数可以是 <required>(必须的) or [optional](可选的)，第二个参数为命令的描述
  // 当 .command() 带有描述参数时，不能采用 .action(callback) 来处理子命令，否则会出错。这告诉 commander，你将采用单独的可执行文件作为子命令，就像 git(1) 和其他流行的工具一样。 Commander 将会尝试在入口脚本（例如 ./lib/lzg）的目录中搜索 program-command 形式的可执行文件，例如 lzg-init, lzg-stop
  // 指定 opts.isDefault 为 true 将会在没有其它子命令指定的情况下，执行该子命令。例如 lzg  执行 lzg init
  .command('fetch', '数据治理项目前端自动部署工具', { isDefault: true })

  // 处理参数，没有被使用的选项会被存放在program.args数组中
  .parse(process.argv);
