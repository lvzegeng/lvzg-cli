#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const fs = require('fs');
const os = require('os');
const inquirer = require('inquirer');
const download = require('../lib/download');
const message = require('../lib/message');

program.usage('数据治理项目前端自动部署工具').parse(process.argv);

const configFilePath = path.join(os.homedir(), '.lvzg');

function getConfigs() {
  try {
    return JSON.parse(fs.readFileSync(configFilePath, { encoding: 'utf8' }));
  } catch (e) {
    return [];
  }
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

// 删除文件夹内的文件
function deleteFolderRecursive(url) {
  var files = [];
  // 判断给定的路径是否存在
  if (fs.existsSync(url)) {
    // 返回文件和子目录的数组
    files = fs.readdirSync(url);
    files.forEach(function(file, index) {
      var curPath = path.join(url, file);
      // fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    // 清除文件夹
    fs.rmdirSync(url);
  } else {
    // console.log('给定的路径不存在，请给出正确的路径');
  }
}

selectPath();

async function selectPath() {
  const configs = getConfigs();
  const choices = configs.map(item => {
    const result = { name: item.path };
    try {
      fs.readdirSync(item.path);
    } catch (e) {
      result.disabled = '路径不存在，请先建立';
    }
    return result;
  });

  const answers = await inquirer.prompt([
    {
      type: 'list', // rawlist
      name: 'path',
      message: '选择部署路径',
      choices: [...choices, '新建'],
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
      choices: ['部署/更新', '修改配置'],
    },
  ]);

  if (answer.operation === '部署/更新') {
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
          message: '检测到该文件夹不为空，并且有可能不是数据治理的数据，确定继续？ (NO)',
          default: false,
        },
      ]);
      if (answer2.isContinue) {
        createConfig({ path: answers1.path });
      } else {
        selectPath();
        message.info('退出创建');
      }
    }
  } catch (e) {
    message.info(`文件夹${answers1.path}不存在，稍后记得建立`);
    createConfig({ path: answers1.path });
  }
}

async function createConfig(config) {
  const { data = {} } = config;
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
    {
      type: 'input',
      name: 'port',
      message: '端口，外壳80端口为空,不要填',
      default: data.port || '',
    },
  ]);

  setConfig({
    ...config,
    data: answer,
  });
  message.success('配置创建成功');
  selectPath();
}

async function deploy(config) {
  // 下载路径
  const downloadTemp = path.join(__dirname, '../.download-temp');
  deleteFolderRecursive(downloadTemp);
  await download(downloadTemp);

  try {
    const files = ['logo.png'];
    files.forEach(item => {
      fs.copyFileSync(path.join(config.path, item), path.join(downloadTemp, item));
    });
  } catch (e) {
    // console.log('目标文件夹没有配置');
  }

  const str = `window.config = ${JSON.stringify(config.data)}`;

  fs.writeFileSync(path.join(downloadTemp, 'config.js'), str);

  deleteFolderRecursive(config.path);

  fs.renameSync(downloadTemp, config.path);

  message.success('部署成功');

  // const configjs = fs.readFileSync(path.join(downloadTemp, 'config.js'), { encoding: 'utf8' })
  // const objStr = configjs.slice(configjs.indexOf('{'))
  // console.log(objStr)
  // console.log(eval(objStr))
  // console.log(JSON.parse(objStr))

  // fs.copyFile(src, dest[, flags], callback(err))  将 src 拷贝到 dest，如果 dest 已经存在会被覆盖
  //    src     <string> | <Buffer> | <URL> 要被拷贝的源文件名称
  //    dest    <string> | <Buffer> | <URL> 拷贝操作的目标文件名

  process.exit(0);
}
