#!/usr/bin/env node
const program = require('commander');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const download = require('../lib/download');
const message = require('../lib/message');
const storage = require('../lib/storage');
const { defaultDownloadSources } = require('../lib/data');

program
  .option('-s, --super', '超级模式')
  .usage('数据治理项目前端自动部署工具')
  .parse(process.argv);

const deployPath = program.args[0];
if (deployPath) {
  const config = storage.get(deployPath);
  if (config.path) {
    deploy(config);
  } else {
    message.error('路径没配置过，请先配置');
  }
} else {
  selectPath();
}

// 删除文件夹内的文件
function deleteFolderRecursive(url) {
  let files = [];
  // 判断给定的路径是否存在
  if (fs.existsSync(url)) {
    // 返回文件和子目录的数组
    files = fs.readdirSync(url);
    files.forEach((file, index) => {
      const curPath = path.join(url, file);
      // 如果是文件夹，重复触发函数
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

async function selectPath() {
  const configs = storage.getAll();
  // 保存的路径
  const choices = configs.map((item) => {
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
      message: '请选择部署路径',
      choices: [...choices, '新建'],
    },
  ]);

  if (answers.path === '新建') {
    createPath();
  } else {
    const config = storage.get(answers.path);
    selectOperation(config);
  }
}

async function selectOperation(config) {
  const choices = ['部署/更新', '修改配置', '删除部署路径'];

  if (program.super) {
    choices.push('设置代码下载源', '添加代码下载源');
  }

  const answer = await inquirer.prompt([
    {
      type: 'list', // rawlist
      name: 'operation',
      message: '操作？',
      choices,
    },
  ]);

  if (answer.operation === '部署/更新') {
    deploy(config);
  } else if (answer.operation === '修改配置') {
    createConfig(config);
  } else if (answer.operation === '删除部署路径') {
    const answer2 = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'isDelete',
        message: '确定删除部署路径 (NO)?',
        default: false,
      },
    ]);
    if (answer2.isDelete) {
      storage.remove(config.path);
      message.success('删除成功');
      selectPath();
    } else {
      selectOperation(config);
    }
  } else if (answer.operation === '设置代码下载源') {
    setDownloadSource(config);
  } else if (answer.operation === '添加代码下载源') {
    addDownloadSource(config);
  }
}

async function createPath() {
  const answers1 = await inquirer.prompt([
    {
      type: 'input', // rawlist
      name: 'path',
      message: '请输入部署路径',
      default: process.cwd(),
    },
  ]);

  try {
    const files = fs.readdirSync(answers1.path);

    if (
      files.length === 0
      || (files.includes('config.js')
        && files.includes('logo.png')
        && files.includes('index.html'))
    ) {
      createConfig({ path: answers1.path });
    } else {
      const answer2 = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'isContinue',
          message:
            '检测到该文件夹不为空，并且有可能不是数据治理的数据，确定继续？ (NO)',
          default: false,
        },
      ]);
      if (answer2.isContinue) {
        createConfig({ path: answers1.path });
      } else {
        selectPath();
        message.info('取消新建');
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
      choices: [
        { name: '单独版/整合版', value: 0 },
        { name: '标准版', value: 1 },
      ],
      default: data.version === undefined ? 0 : data.version,
    },
    {
      type: 'input',
      name: 'port',
      message: '端口，外壳80端口为空,不要填',
      default: data.port || '',
    },
  ]);

  storage.save({
    ...config,
    data: answer,
  });
  message.success('配置成功');
  selectPath();
}

async function deploy(config) {
  const downloadDir = path.join(__dirname, '../.download-temp');
  const downloadSrc = config.download && config.download.choice
    ? config.download.choice
    : defaultDownloadSources[0];

  deleteFolderRecursive(downloadDir);
  await download(downloadDir, downloadSrc);

  try {
    // 替换为以前的文件
    const files = ['logo.png'];
    files.forEach((item) => {
      fs.copyFileSync(
        path.join(config.path, item),
        path.join(downloadDir, item),
      );
    });
  } catch (e) {
    // console.log('目标文件夹没有配置');
  }

  const configjs = fs.readFileSync(path.join(downloadDir, 'config.js'), {
    encoding: 'utf8',
  });
  const configStr = configjs.slice(configjs.indexOf('{')).replace(/;/g, '');

  // 合并仓库的config.js以及脚手架配置
  const configObj = {
    ...(eval(`(${configStr})`) || {}),
    ...config.data,
  };

  const str = `window.config = ${JSON.stringify(configObj)}`;

  fs.writeFileSync(path.join(downloadDir, 'config.js'), str);

  deleteFolderRecursive(config.path);
  fs.renameSync(downloadDir, config.path);

  message.success('部署成功');

  process.exit(0);
}

async function setDownloadSource(config) {
  const sources = config.download && config.download.sources ? config.download.sources : [];
  const choiceSource = config.download && config.download.choice
    ? config.download.choice
    : defaultDownloadSources[0];
  const choices = [...defaultDownloadSources, ...sources];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'downloadSource',
      message: '请选择代码下载源',
      choices,
      default: choiceSource,
    },
  ]);

  const newConfig = {
    ...config,
    download: {
      ...config.download,
      choice:
        answer.downloadSource === defaultDownloadSources[0]
          ? ''
          : answer.downloadSource,
    },
  };
  storage.save(newConfig);
  selectOperation(newConfig);
}

async function addDownloadSource(config) {
  const sources = config.download && config.download.sources ? config.download.sources : [];

  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'downloadSource',
      message: '请输入代码下载源',
      default: defaultDownloadSources[0],
      validate(value) {
        const dealStr = value.trim();

        if (
          [...defaultDownloadSources, ...sources].some((item) => item === dealStr)
        ) {
          return '不能输入已存在的下载地址';
        }
        if (!dealStr.startsWith('http')) {
          return '输入的格式有误';
        }

        return true;
      },
    },
  ]);

  const newConfig = {
    ...config,
    download: {
      ...config.download,
      sources: [...sources, answer.downloadSource.trim()],
    },
  };
  storage.save(newConfig);
  selectOperation(newConfig);
}
