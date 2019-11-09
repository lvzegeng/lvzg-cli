# 数据治理项目前端自动部署工具

---

## 安装 nodejs，nodejs 版本大于 8 可跳过，通过 node -v 查看版本

### 安装方式一：Using rpm

- curl -sL https://rpm.nodesource.com/setup_13.x | sudo bash -
- sudo yum install -y nodejs

### 安装方式二：Using Ubuntu

- curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
- sudo apt-get install -y nodejs

---

## 部署，需要进行交互

- npx lvzg

---

## 高级（可跳过）

- npx lvzg PATH  
  自动部署指定路径，不用任何交互，需要确保路径已配置过，命令如 npx lvzg /root/test。可配合 Linux 的 crontab 命令实现指定时间自动更新

- npx lvzg -s  
  超级模式，增加了 设置、添加代码下载源 操作，为其他项目部署提供了接口。等价于 npx lvzg --super

---

## 截图

![](https://github.com/lvzegeng/lvzg/blob/master/screenshots/1.png))
![](https://github.com/lvzegeng/lvzg/blob/master/screenshots/2.png))
![](https://github.com/lvzegeng/lvzg/blob/master/screenshots/3.png))
![](https://github.com/lvzegeng/lvzg/blob/master/screenshots/4.png))
