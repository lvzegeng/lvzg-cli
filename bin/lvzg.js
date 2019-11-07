#!/usr/bin/env node
const program = require('commander');
const package = require('../package');

program
  // 处理显示版本命令，默认选项标识为-V和--version，当存在时会打印版本号并退出
  .version(package.version, '-V, --version', 'output the current version')

  // 重写覆盖默认的帮助标识和描述
  .helpOption('-h, --help', 'read more information')

  // 定义选项，同时也用于这些选项的文档。每个选项可以有一个短标识(单个字符)和一个长名字，它们之间用逗号或空格分开
  // 选项会被放到 Commander 对象的属性上，多词选项如"--template-engine"会被转为驼峰法program.templateEngine。多个短标识可以组合为一个参数，如-a -b -c等价于-abc
  // 最常用的两个选项类型是boolean(选项后面不跟值)和选项跟一个值（使用尖括号声明）。除非在命令行中指定，否则两者都是undefined
  .option('-d, --debug', 'output extra debugging')
  .option('-p, --pizza-type <type>', 'flavour of pizza')
  .option('-c, --cheese <type>', 'add the specified type of cheese', 'blue') // 指定默认值
  .option('-e, --cheese [type]', 'Add cheese with optional type') // 指定一个用作标志的选项，它可以接受值（使用方括号声明，即传值不是必须的）

  .usage('自定义在帮助信息第一行中显示的命令使用描述')

  // 为最高层命令指定子命令，第一个参数可以指定命令的名字以及任何参数，参数可以是 <required>(必须的) or [optional](可选的)，第二个参数为命令的描述
  // 当 .command() 带有描述参数时，不能采用 .action(callback) 来处理子命令，否则会出错。这告诉 commander，你将采用单独的可执行文件作为子命令，就像 git(1) 和其他流行的工具一样。 Commander 将会尝试在入口脚本（例如 ./lib/lzg）的目录中搜索 program-command 形式的可执行文件，例如 lzg-init, lzg-stop
  // 指定 opts.isDefault 为 true 将会在没有其它子命令指定的情况下，执行该子命令。例如 lzg  执行 lzg init
  .command('fetch', '创建新项目', { isDefault: true })
  .alias('ex')

  // 处理参数，没有被使用的选项会被存放在program.args数组中
  .parse(process.argv);
