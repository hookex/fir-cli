# fir-cli

一个现代化的命令行工具，通过 AI 功能增强你的开发工作流程。

[English](./README.md) | [简体中文](./README.zh-CN.md)

## 安装

```bash
npm install -g fir-cli
```

## 配置（可选）

CLI 工具可以直接使用基本的 Git 操作。如果需要使用 AI 功能，你需要配置 OpenAI API 访问。

在你的主目录中创建 `.firrc` 文件：

```json
{
  "openai": {
    "apiKey": "你的-api-密钥",
    "apiBaseUrl": "你的-api-基础-url",  // 可选
    "apiModel": "你的-api-模型"        // 可选
  }
}
```

或者使用环境变量：

- `OPENAI_API_KEY`：你的 OpenAI API 密钥（AI 功能需要）
- `OPENAI_API_BASE_URL`：自定义 API 基础 URL（可选）
- `OPENAI_API_MODEL`：自定义 API 模型（可选）

## 快速开始

1. 初始化 Git 仓库：
   ```bash
   git init
   ```

2. 对代码进行一些更改

3. 使用 AI 生成的消息提交：
   ```bash
   f commit
   ```

4. 推送到远程：
   ```bash
   f push
   ```

## 命令参考

| 命令 | 别名 | 描述 | 示例 |
|------|------|------|------|
| Git 命令 |
| `f commit` | `f c`, `f co`, `f com` | 使用 AI 消息提交更改 | `f commit` |
| `f commit -v` | `f c -v`, `f co -v`, `f com -v` | 使用详细模式提交 | `f c -v` |
| `f push` | `f p`, `f pu` | 推送更改到远程 | `f push` |
| `f push -v` | `f p -v`, `f pu -v` | 使用详细模式推送 | `f p -v` |
| `f open` | - | 在浏览器中打开仓库 | `f open` |
| `f clean` | `f c`, `f cl` | 清理工作目录 | `f clean` |
| `f git` | `f g`, `f gi` | Git 操作 | `f git open` |
| 编辑器命令 |
| `f code` | `f c`, `f co` | 在 VS Code 中打开 | `f code` |
| 浏览器命令 |
| `f chrome` | `f c`, `f ch` | 打开 Chrome | `f chrome` |
| `f chrome <url>` | `f c <url>`, `f ch <url>` | 使用 URL 打开 Chrome | `f chrome https://github.com` |
| 网络命令 |
| `f ip` | `f i`, `f ip` | 显示本地 IP 地址 | `f ip` |
| `f ping` | `f p`, `f pi` | Ping 域名 | `f ping github.com` |
| NPM 命令 |
| `f nrm` | - | 运行 NRM 包 | `f nrm ls` |
| `f ncu` | - | 检查包更新 | `f ncu` |
| `f install` | `f i`, `f in` | 运行或安装并运行全局 npm 包 | `f install nrm` |
| 时间命令 |
| `f time` | `f t`, `f ti` | 显示当前时间 | `f time` |
| `f time --watch` | `f t --watch`, `f ti -w` | 显示自动更新的时间 | `f time --watch` |
| AI 命令 |
| `f translate` | `f t`, `f tr` | 在中英文之间翻译文本 | `f translate "你好"` |
| `f debug` | `f d`, `f de` | 使用 AI 辅助调试代码 | `f debug` |
| `f ai` | `f a`, `f ai` | 与 AI 助手对话 | `f ai "如何使用 git？"` |
| 其他命令 |
| `f config` | `f c`, `f co` | 配置 CLI 设置 | `f config set openai.apiKey "你的密钥"` |
| `f help` | - | 显示帮助信息 | `f help commit` |

## 功能特性

### Git 命令

#### 提交更改 (`f commit` 或 `f c`)
使用 AI 生成的提交消息提交更改。

功能特点：
- 自动检测和暂存未暂存的更改
- 使用 AI 生成有意义的提交消息
- 支持手动输入提交消息
- 显示详细的状态信息

示例：
```bash
# 使用 AI 消息基本提交
f commit

# 使用详细模式提交
f c -v

# AI 生成的消息示例：
feat(auth): 添加 Google OAuth2 认证
- 实现 Google 认证的 OAuth2 流程
- 添加用户资料同步
- 更新 OAuth 凭证配置
```

#### 推送更改 (`f push` 或 `f p`)
推送更改到远程仓库。

功能特点：
- 显示当前更改和未推送的提交
- 自动暂存和提交更改
- 如需要则创建远程分支
- 处理上游分支设置

示例：
```bash
# 使用 AI 提交消息推送
f push

# 使用详细模式推送
f p -v

# 状态输出示例：
Git 状态：
----------------------------------------
分支：feature/auth
最后提交：a1b2c3d - feat: 添加登录页面

更改的文件：
  修改：src/auth/login.ts
  新增：src/components/LoginForm.tsx
  
未推送的提交：
a1b2c3d feat: 添加登录页面
b2c3d4e fix: 处理认证错误
----------------------------------------
```

#### 打开仓库 (`f open`)
在浏览器中打开仓库。

功能特点：
- 支持 HTTPS 和 SSH 远程 URL
- 在默认浏览器中打开
- 支持 GitHub、GitLab 和 Bitbucket URL

示例：
```bash
# 打开当前仓库
f open

# 输出示例：
✓ 在浏览器中打开 https://github.com/username/repo
```

#### 清理工作目录 (`f clean`)
清理工作目录并删除未跟踪的文件。

功能特点：
- 清理前显示详细状态
- 重置暂存的更改
- 删除未跟踪的文件
- 交互式确认

示例：
```bash
# 清理工作目录
f clean

# 输出示例：
发现更改：

修改的文件：
  src/components/Button.tsx
  src/styles/main.css

未跟踪的文件：
  .env.local
  temp/
```

### AI 命令

#### 代码翻译 (`f translate` 或 `f t`)
在不同编程语言之间翻译代码。

功能特点：
- 支持多种编程语言
- 保持代码结构和逻辑
- 添加有用的注释
- 处理语言特定的习惯用法

示例：
```bash
# 翻译当前文件
f translate python typescript

# 输出示例：
# Python 输入：
def calculate_total(items):
    return sum(item.price for item in items)

# TypeScript 输出：
function calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### 调试代码 (`f debug` 或 `f d`)
使用 AI 辅助调试代码。

功能特点：
- 分析代码和错误消息
- 提供详细解释
- 建议修复方案
- 显示示例

示例：
```bash
# 调试最后一个错误
f debug

# 输出示例：
错误分析：
- TypeError：无法读取 undefined 的 'data' 属性
- 位置：src/api/users.ts:45
- 根本原因：在访问之前 API 响应是 undefined

解决方案：
1. 在访问数据之前添加空值检查：
   ```typescript
   const response = await api.get('/users');
   const data = response?.data ?? [];
   ```

预防措施：
- 始终处理 undefined/null 情况
- 使用可选链和空值合并
- 添加类型检查
```

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
4. 链接到本地开发：
   ```bash
   npm link
   ```

## 许可证

MIT
