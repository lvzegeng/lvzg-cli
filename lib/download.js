const download = require('download-git-repo');
const path = require('path');
const ora = require('ora');

module.exports = function(target) {
  target = path.join(target, '.download-temp');
  return new Promise((resolve, reject) => {
    const spinner = ora('正在下载模板');
    spinner.start();

    download(
      'https://github.com:username/templates-repo#master',
      target,
      { clone: true }, // false 为 http下载，true 为 git clone 下载
      err => {
        if (err) {
          spinner.fail();
          reject(err);
        } else {
          spinner.succeed();
          // 下载的模板存放在一个临时路径中，下载完成后，向下通知这个临时路径
          resolve(target);
        }
      },
    );
  });
};
