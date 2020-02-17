const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const ora = require('ora');
const fse = require('fs-extra');
const pkg = require('../package.json');

module.exports = function (downloadSrc) {
  return new Promise((resolve, reject) => {
    const downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), pkg.name));

    const spinner = ora('正在下载模板...');
    spinner.start();
    /* setTimeout(() => {
       spinner.color = 'yellow';
       spinner.text = 'Loading rainbows';
     }, 1000); */

    exec(
      `git clone --branch master --single-branch --depth 1 ${downloadSrc} ${downloadDir}`,
      (err, stdout, stderr) => {
        if (err) {
          spinner.fail('下载失败');
          reject(err);
        }
        fse.removeSync(path.join(downloadDir, '.git'));
        spinner.succeed('下载成功');
        resolve(downloadDir);
      },
    );
  });
};
