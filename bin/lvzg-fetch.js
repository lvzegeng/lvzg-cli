#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const download = require('../lib/download');

program.usage('初始化项目').parse(process.argv);
// 根据输入，获取项目名称
let projectName = program.args[0];
if (!projectName) {
    // 相当于执行命令的--help选项，显示help信息
    program.help();
    return;
}

const list = fs.readdirSync(process.cwd()); // 遍历当前目录
let rootName = path.basename(process.cwd());
let next = undefined;
// 如果当前目录不为空，目录中不存在与project-name同名的目录，则创建以project-name作为名称的目录作为工程的根目录，否则提示项目已经存在，结束命令执行
if (list.length) {
    if (
        list.some(name => {
            const fileName = path.join(process.cwd(), name);
            const isDir = fs.statSync(fileName).isDirectory();
            return name === projectName && isDir;
        })
    ) {
        console.log(`项目${projectName}已经存在`);
        return;
    }
    next = Promise.resolve(projectName);
}

// 如果当前目录是空的，并且目录名称和项目名称相同，那么就通过终端交互的方式确认是否直接在当前目录下创建项目，否则，在当前目录下创建以project-name作为名称的目录作为工程的根目录
else {
    if (rootName === projectName) {
        next = inquirer
            .prompt([
                {
                    name: 'buildInCurrent',
                    message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
                    type: 'confirm',
                    default: true,
                },
            ])
            .then(answer => {
                return Promise.resolve(answer.buildInCurrent ? '.' : projectName);
            });
    } else {
        next = Promise.resolve(projectName);
    }
}

next && go();

async function go() {
    try {
        const projectRoot = await next;
        if (projectRoot !== '.') {
            fs.mkdirSync(projectRoot);
        }
        // 下载完成之后，再将临时下载目录中将项目模板文件转移到项目目录中，可以使用新的API copyFile()
        const downloadTemp = await download(projectRoot);

        // 下载完成后，提示用户输入新项目信息
        const answers = await inquirer.prompt([
            {
                name: 'projectName',
                message: '项目的名称',
                default: projectRoot,
            },
            {
                name: 'projectVersion',
                message: '项目的版本号',
                default: '1.0.0',
            },
            {
                name: 'projectDescription',
                message: '项目的简介',
                default: `A project named ${projectRoot}`,
            },
            {
                type: 'confirm',
                name: 'toBeDelivered',
                message: 'Is this for delivery?',
                default: false,
            },
            {
                type: 'list', // rawlist
                name: 'size',
                message: 'What size do you need?',
                choices: ['Jumbo', 'Large', 'Standard', 'Medium', 'Small', 'Micro'],
                when(answers) {
                    return answers.toBeDelivered === false;
                },
            },
            {
                type: 'checkbox',
                message: 'Select toppings',
                name: 'toppings',
                choices: [
                    {
                        name: 'Ham',
                        checked: true,
                    },
                    {
                        name: 'Mozzarella',
                    },
                ],
            },
            {
                type: 'input',
                name: 'phone',
                message: "What's your phone number",
                default: 'Doe',
                validate(value) {
                    const pass = value.match(
                        /^([01]{1})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\s?((?:#|ext\.?\s?|x\.?\s?){1}(?:\d+)?)?$/i,
                    );
                    if (pass) {
                        return true;
                    }

                    return 'Please enter a valid phone number';
                },
            },
            {
                type: 'password',
                message: 'Enter a masked password',
                name: 'password2',
                mask: '*',
            },
        ]);

        console.log(answers);
        // 成功用绿色显示，给出积极的反馈
        // logSymbols.info    logSymbols.warning
        console.log(logSymbols.success, chalk.green('创建成功:)'));
        // 实现脚手架给模板插值的功能  lib/generator.js
    } catch (err) {
        // 失败了用红色，增强提示
        console.error(logSymbols.error, chalk.red(`创建失败：${err}`));
    }
}