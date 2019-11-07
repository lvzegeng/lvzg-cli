const download = require('download-git-repo');
const ora = require('ora');

module.exports = function(target) {
  return new Promise((resolve, reject) => {
    const spinner = ora('正在下载模板');
    spinner.start();

    download(
      'direct:https://gitee.com/sunmnet/data_governance.git#master',
      target,
      { clone: true }, // false 为 http下载，true 为 git clone 下载
      err => {
        if (err) {
          spinner.fail();
          reject(err);
        } else {
          spinner.succeed('下载完成');
          resolve();
        }
      },
    );
  });
};
