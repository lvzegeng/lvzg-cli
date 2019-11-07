const { exec } = require('child_process');

const command = process.argv.slice(2).join(' ');
exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
  }
  console.log(stdout);
});
