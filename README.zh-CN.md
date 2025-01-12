# fir-cli

> 使用 TypeScript 编写的个人命令行工具集

[English](./README.md) | [简体中文](./README.zh-CN.md)

## 安装

```bash
npm install -g fir-cli
```

## 特性

- 🤖 **AI 驱动的 Git 提交**: 自动生成规范的提交信息
- 🚀 **智能编辑器集成**: 在 VS Code 或 WebStorm 中打开项目
- 🌐 **浏览器命令**: 快速启动 Chrome 并支持 URL
- 📦 **NPM 工具**: 运行全局包并检查更新
- ⏰ **时间显示**: 显示当前时间，支持自动更新

## 使用方法

```bash
fir [命令] [选项]
```

### Git 命令

```bash
# 使用 AI 生成的消息提交更改
fir commit

# 使用指定消息提交
fir commit "feat: 添加新功能"

# 使用 AI 消息提交并推送
fir push

# 使用指定消息推送
fir push "feat: 新功能"

# 在浏览器中打开仓库
fir open
```

### 编辑器命令

```bash
# 在编辑器中打开当前目录（VS Code 或 WebStorm）
fir code
fir c    # 简写
fir o    # 另一个简写
```

### 浏览器命令

```bash
# 打开 Chrome
fir chrome

# 使用指定 URL 打开 Chrome
fir chrome https://github.com
```

### NPM 命令

```bash
# 安装并运行全局包
fir nrm
fir nrm ls

# 检查包更新
fir ncu
```

### 时间命令

```bash
# 显示当前时间
fir time
fir t

# 显示自动更新的时间
fir time --watch
fir t -w
```

## 配置

### 环境变量

- `ARK_API_KEY`: AI 提交信息生成的 API 密钥（可选）

## 开发

1. 克隆仓库
2. 安装依赖：
   ```bash
   npm install
   ```
3. 构建项目：
   ```bash
   npm run build
   ```
4. 全局安装以测试：
   ```bash
   npm install -g --force
   ```

## 许可证

MIT
