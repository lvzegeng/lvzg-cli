#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const download = require('../lib/download');

program.usage('数据治理项目前端自动部署工具').parse(process.argv);

const configFilePath = path.join(__dirname, '../lib/config.js');

function getConfigs() {
  return JSON.parse(fs.readFileSync(configFilePath, { encoding: 'utf8' }));
}

function getConfig(path) {
  const target = getConfigs().find(item => item.path === path);
  return target || {};
}

function setConfig(config) {
  const configs = getConfigs();
  const targetIndex = configs.findIndex(item => item.path === config.path);

  if (targetIndex === -1) {
    configs.push(config);
  } else {
    configs[targetIndex] = config;
  }

  fs.writeFileSync(configFilePath, JSON.stringify(configs));
}

selectPath();

async function selectPath() {
  const configs = getConfigs();
  const answers = await inquirer.prompt([
    {
      type: 'list', // rawlist
      name: 'path',
      message: '选择部署路径',
      choices: [...configs.map(item => item.path), '新建'],
    },
  ]);

  if (answers.path === '新建') {
    createPath();
  } else {
    const config = getConfig(answers.path);
    selectOperation(config);
  }
}

async function selectOperation(config) {
  const answer = await inquirer.prompt([
    {
      type: 'list', // rawlist
      name: 'operation',
      message: '操作？',
      choices: ['部署', '修改配置'],
    },
  ]);

  if (answer.operation === '部署') {
    deploy(config);
  } else if (answer.operation === '修改配置') {
    createConfig(config);
  }
}

async function createPath() {
  const answers1 = await inquirer.prompt([
    {
      type: 'input', // rawlist
      name: 'path',
      message: '输入部署路径',
      default: process.cwd(),
    },
  ]);

  try {
    const files = fs.readdirSync(answers1.path);

    if (
      files.length === 0 ||
      (files.includes('config.js') && files.includes('logo.png') && files.includes('index.html'))
    ) {
      createConfig({ path: answers1.path });
    } else {
      const answer2 = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'isContinue',
          message: '检测到该文件夹不为空，并且有可能不是数据治理的数据，确定继续？',
          default: false,
        },
      ]);
      if (answer2.isContinue) {
        createConfig({ path: answers1.path });
      } else {
        selectPath();
      }
    }
  } catch (e) {
    // fs.mkdirSync(answers1.path)
    console.log('文件夹不存在，请先建立');
  }
}

async function createConfig(config) {
  const { data = {} } = config;
  console.log(data);
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'schoolName',
      message: '学校名称？',
      default: data.schoolName || '三盟科技',
    },
    {
      type: 'input',
      name: 'copyRight',
      message: '版权？',
      default: data.copyRight || 'Copyright 三盟科技股份有限公司',
    },
    {
      type: 'list', // rawlist
      name: 'version',
      message: '版本？',
      choices: [{ name: '单独版/整合版', value: 0 }, { name: '标准版', value: 1 }],
      default: data.version === undefined ? 0 : data.version,
    },
  ]);

  setConfig({
    ...config,
    data: answer,
  });
  console.log('配置创建成功');
  selectPath();
}

async function deploy(config) {
  // 下载路径
  const downloadTemp = path.join(__dirname, '../.download-temp');
  try {
    fs.rmdirSync(downloadTemp);
  } catch (e) {
    console.log(e);
  }
  // 下载完成之后，再将临时下载目录中将项目模板文件转移到项目目录中，可以使用新的API copyFile()
  await download(downloadTemp);
}

/*

let next;
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
else if (rootName === projectName) {
  next = inquirer
    .prompt([
      {
        name: 'buildInCurrent',
        message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
        type: 'confirm',
        default: true,
      },
    ])
    .then(answer => Promise.resolve(answer.buildInCurrent ? '.' : projectName));
} else {
  next = Promise.resolve(projectName);
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


    // 成功用绿色显示，给出积极的反馈
    // logSymbols.info    logSymbols.warning
    console.log(logSymbols.success, chalk.green('创建成功:)'));
    // 实现脚手架给模板插值的功能  lib/generator.js
  } catch (err) {
    // 失败了用红色，增强提示
    console.error(logSymbols.error, chalk.red(`创建失败：${err}`));
  }
}
*/
