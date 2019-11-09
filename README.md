# 数据治理项目前端自动部署工具

## 安装 nodejs，nodejs 版本大于 8 可跳过这个步骤，通过命令 node -v 可查看版本

### 方式一：Using rpm

curl -sL https://rpm.nodesource.com/setup_13.x | sudo bash - sudo yum install -y nodejs

### 方式二：Using Ubuntu

curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash - sudo apt-get install -y nodejs

## 部署

npx lvzg

## 高级

npx lvzg -s  
npx lvzg --super  
超级模式，可查看、修改代码下载源
