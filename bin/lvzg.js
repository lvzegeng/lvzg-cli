#!/usr/bin/env node
const program = require('commander');

// 可以自动的解析命令和参数，合并多选项，处理短参，等等
program
// 用于显示命令版本
    .version('1.0.0')

    // 定义选项，也可以作为选项的文档。每个选项都可以有一个短标志（单个字符）和一个长名称，用逗号或空格分隔
    // 这些选项可以作为命令对象上的属性进行访问。诸如“ --template-engine”之类的多字选项用驼峰式表示，变为program.templateEngine等等。多个短标记可以组合为单个arg，例如-abc等效于-a -b -c
    .option('-d, --debug', 'output extra debugging')
    .option('-p, --pizza-type <type>', 'flavour of pizza')
    .option('-c, --cheese <type>', 'add the specified type of cheese', 'blue') // 指定默认值
    .option('-c, --cheese [type]', 'Add cheese with optional type') // 该选项用作标志，但也可以采用一个值（使用方括号声明）

    .usage('在帮助的第一行中自定义用法说明')

    .command('init <projectName>', '创建新项目')

    // 将选项未消耗的所有args保留为program.args数组
    .parse(process.argv);

if (program.debug) console.log(program.opts());
if (program.pizzaType) console.log(`- ${program.pizzaType}`);

// pizza-options -p   // error: option '-p, --pizza-type <type>' argument missing