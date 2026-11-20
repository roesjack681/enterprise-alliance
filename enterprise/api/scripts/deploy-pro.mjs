#!/usr/bin/env node
import inquirer from 'inquirer';
import { spawnSync } from 'child_process';
import chalk from 'chalk';

// 定义服务器配置
const serverConfig = {
  host: '115.190.133.216',
  user: 'root',
  path: '/www/wwwroot/enterprise/api/app',
  upload_file: './build/app-api.min.js'
}

// 定义部署确认问题
const prompts = [
  {
    type: 'confirm',
    name: 'confirmDeploy',
    message: '确定要部署到生产环境吗？',
    default: false
  }
];

inquirer
  .prompt(prompts)
  .then((answers) => {
    if (!answers.confirmDeploy) {
      console.log(chalk.yellow('部署已取消'));
      return;
    }

    const targetPath = `${serverConfig.user}@${serverConfig.host}:${serverConfig.path}`;

    // 执行文件上传（不显示SSH/SCP调试信息）
    console.log(chalk.green('正在上传文件，请等待...'));
    const scpResult = spawnSync('scp', [
      '-o', 'StrictHostKeyChecking=no', // 忽略主机密钥检查
      '-r', // 递归上传目录
      serverConfig.upload_file,
      targetPath
    ], {
      stdio: ['ignore', process.stdout, process.stderr] // 只显示标准输出和标准错误
    });

    if (scpResult.status !== 0) {
      console.log(chalk.red('文件上传失败'));
      return;
    }

    console.log(chalk.green.bold(`🎉 ${targetPath} 项目部署完成！`));
  })
  .catch((error) => {
    console.log(chalk.red('部署过程中发生错误:'));
    console.error(error);
  });

