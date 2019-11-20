const path = require('path');
const { exec } = require('child_process');
const ora = require('ora');
const fse = require('fs-extra');

module.exports = function(downloadDir, downloadSrc) {
  return new Promise((resolve, reject) => {
    const spinner = ora('正在下载模板...');
    spinner.start();

    exec(
      `git clone --branch master --single-branch --depth 1 ${downloadSrc} ${downloadDir}`,
      (err, stdout, stderr) => {
        if (err) {
          spinner.fail('下载失败');
          reject(err);
        }
        fse.removeSync(path.join(downloadDir, '.git'));
        spinner.succeed('下载成功');
        resolve();
      },
    );
  });
};
