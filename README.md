# @deepseek-ai/dsh-repeat-thinker

**DeepSeek Harness 重复思考检测插件** - 自动识别并打断 AI 的循环思考模式，提升对话质量

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/tao1832-little/dsh-repeat-thinker/releases/tag/v1.0.0)

---

## ✨ 功能特性

- 🔍 **实时监控**：通过 Cordis API 监听 AI 的思考过程（`session-log-deepseek`）
- 🔄 **重复检测**：基于 Jaccard 相似系数的文本相似度算法，精准识别重复思考模式
- ⚡ **自动打断**：达到阈值时自动打断循环并提示用户
- 💬 **友好提示**：提供清晰的打断消息，引导用户重新表述问题
- 🎨 **Web UI**：状态指示器 + 配置面板（localStorage 持久化）
- 🌐 **多语言支持**：中文/英文本地化

---

## 📦 安装方法

### 方式一：通过 npm 包名安装

```bash
dsh plugin add @deepseek-ai/dsh-repeat-thinker@1.0.0 --profile web
```

### 方式二：使用本地目录安装

```bash
# Windows
dsh plugin add C:\path\to\repeat-thinker-plugin --profile web

# macOS/Linux
dsh plugin add /path/to/repeat-thinker-plugin --profile web
```

### 方式三：从 GitHub Release 下载

1. 访问 [Release 页面](https://github.com/tao1832-little/dsh-repeat-thinker/releases/tag/v1.0.0)
2. 下载 `repeat-thinker-plugin.zip`
3. 解压后使用上述命令安装

---

## 🚀 快速开始

### 默认配置

插件启用后，默认配置如下：

```json
{
  "enabled": true,
  "threshold": 3,              // 重复次数阈值
  "windowSize": 20,           // 检测窗口大小
  "similarityThreshold": 0.85,// 相似度阈值（0-1）
  "maxInterruptionsPerSession": 5, // 每会话最大打断次数
  "interruptMessage": "检测到重复思考模式，已自动打断循环。请尝试重新表述问题或提供新信息。"
}
```

### Web UI 使用

安装后，在 DeepSeek Harness Web UI 中：

1. **查看状态**：插件图标显示当前运行状态
2. **配置参数**：点击图标打开配置面板，调整检测阈值
3. **实时日志**：查看插件运行日志和打断记录

---

## 🧪 测试场景示例

### 场景 A: 简单循环问题

```bash
用户：请解释什么是人工智能。
AI: [回答...]
用户：请再详细解释一下人工智能的概念。
AI: [回答...]
用户：能不能用更简单的语言说明？
# → 第 3-4 次时触发打断提示
```

### 场景 B: 代码生成循环

```javascript
// 让 AI 多次修改同一行代码
function add(a, b) {
  return a + b;
}
// 请优化这个函数
function add(a, b) {
  return (a + b); // 添加分号
}
// 再优化一次
function add(a, b) {
  return (a + b); // 再次修改
}
```

### 场景 C: 多轮对话循环

```bash
用户：帮我写一个 Python 函数计算斐波那契数列。
AI: [代码...]
用户：请再写一个斐波那契数列的函数，用不同的方法。
AI: [代码...]
用户：能不能再用另一种方式实现？
# → 检测到重复模式并打断
```

---

## 📋 日志输出示例

```bash
[RepeatThinker] 初始化重复思考检测插件...
[RepeatThinker] 插件初始化完成
[RepeatThinker] 配置:
  - 重复阈值：3
  - 窗口大小：20
  - 相似度阈值：0.85
  - 最大打断次数：5

# 会话开始时
[RepeatThinker] 新会话开始：session-xxx

# 检测到重复时
[RepeatThinker] 检测到重复思考模式，已自动打断循环。请尝试重新表述问题或提供新信息。
[RepeatThinker] 打断次数：1/5
```

---

## 🎯 技术架构

### 核心组件

- **Cordis API**: `ctx.on("session-start", onSessionStart)`、`ctx.on("thought", onThought)`
- **状态管理**: 会话级状态隔离，避免跨会话干扰
- **相似度算法**: Jaccard 相似系数（文本分词后计算）
- **持久化存储**: Web UI 配置使用 localStorage

### 文件结构

```
repeat-thinker-plugin/
├── package.json              # DSH bundle 定义
├── cordis.patch.yml          # Cordis 补丁配置
├── index.js                  # Host 端主逻辑（ES Module）
├── client.js                 # Web UI 模块
├── locale/zh-CN.json         # 中文本地化
├── docs/DETAIL.md            # 详细文档
├── icon.svg                  # 插件图标
└── LICENSE                   # MIT 许可证

test-scenario.md              # 测试场景文档
README.md                     # 快速指南
```

---

## 📖 完整文档

- [DETAIL.md](./repeat-thinker-plugin/docs/DETAIL.md) - 详细技术文档
- [test-scenario.md](./test-scenario.md) - 完整测试场景指南

---

## ⚠️ 注意事项

- 插件运行在宿主进程中，属于可信代码
- 建议在生产环境使用前充分测试
- 可调整阈值参数以适应不同使用场景

---

## 📄 License

MIT License - [查看 LICENSE 文件](./repeat-thinker-plugin/LICENSE)

---

## 👨‍💻 作者

**tao1832-little**  
Homepage: https://deepseek-harness.github.io/

---

## 🔗 相关链接

- [GitHub Release](https://github.com/tao1832-little/dsh-repeat-thinker/releases/tag/v1.0.0)
- [DETAIL.md](./repeat-thinker-plugin/docs/DETAIL.md) - 详细文档
- [test-scenario.md](./test-scenario.md) - 测试场景

---

**需要帮助？**  
查看 [test-scenario.md](./test-scenario.md) 获取详细的测试步骤和场景，或访问项目仓库提交 Issue。
