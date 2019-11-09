const os = require('os');
const path = require('path');
const fs = require('fs');
const package = require('../package.json');

const configFilePath = path.join(os.homedir(), `.${package.name}`);

// 做缓存，不然每次操作都要查找所有配置
let configs;

const getAll = () => {
  try {
    configs = JSON.parse(fs.readFileSync(configFilePath, { encoding: 'utf8' }));
  } catch (e) {
    configs = [];
  }
  return configs;
};

const get = path => {
  if (!configs) {
    getAll();
  }
  const target = configs.find(item => item.path === path);
  return target || {};
};

const save = config => {
  const targetIndex = configs.findIndex(item => item.path === config.path);
  if (targetIndex === -1) {
    configs.push(config);
  } else {
    configs[targetIndex] = config;
  }
  fs.writeFileSync(configFilePath, JSON.stringify(configs));
};

const remove = path => {
  const newConfigs = configs.filter(item => item.path !== path);
  fs.writeFileSync(configFilePath, JSON.stringify(newConfigs));
};

module.exports = { getAll, get, save, remove };
