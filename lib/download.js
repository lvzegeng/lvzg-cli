const download = require('download-git-repo');
const ora = require('ora');

module.exports = function(downloadDir) {
  return new Promise((resolve, reject) => {
    const spinner = ora('正在下载模板...');
    spinner.start();

    download(
      'direct:https://gitee.com/sunmnet/data_governance.git#master',
      downloadDir,
      { clone: true },
      err => {
        if (err) {
          spinner.fail('下载失败');
          reject(err);
        } else {
          spinner.succeed('下载成功');
          resolve();
        }
      },
    );
  });
};
