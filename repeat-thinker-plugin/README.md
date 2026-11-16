# 🔄 @deepseek-ai/dsh-repeat-thinker - 重复思考检测插件

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)](./docs/DETAIL.md)

> 自动打断 AI 的循环思考并提示用户，防止陷入重复模式

## 📖 快速开始

### 安装

```bash
# 方法一：通过 pnpm（推荐）
pnpm add @deepseek-ai/dsh-repeat-thinker

# 方法二：手动复制插件目录
cp -r repeat-thinker-plugin ~/.deepseek-harness/plugins/

# 方法三：使用 plugin_manager
plugin_manager({
  action: "install_bundle",
  target: "@deepseek-ai/dsh-repeat-thinker"
})
```

### 启用

1. **打开 DeepSeek Harness**
2. **进入设置 → 插件管理**
3. **搜索 `@deepseek-ai/dsh-repeat-thinker`**
4. **点击"安装并启用"**

或者通过 Cordis API：

```javascript
// 查询插件配置
cordis_inspect_query({
  platform: "host",
  provider: "Config",
  method: "listConfigs"
});

// 启用插件
plugin_manager({
  action: "set_plugin",
  target: "@deepseek-ai/dsh-repeat-thinker",
  enabled: true
});
```

## 🎯 核心功能

| 功能 | 说明 |
|------|------|
| 🔍 **实时监控** | 通过 `session-log-deepseek` 监控 AI 思考过程 |
| 🔄 **重复检测** | 识别相同的 prompt、相似的意图和重复的思考模式 |
| ⚡ **自动打断** | 当检测到重复思考达到阈值时，自动打断循环 |
| 💬 **用户提示** | 显示友好的提示信息，引导用户提供新信息 |

## ⚙️ 配置选项

### 默认配置

```json
{
  "enabled": true,                    // 是否启用
  "threshold": 3,                     // 重复次数阈值（触发打断）
  "windowSize": 20,                   // 检测窗口大小（最近 N 次思考）
  "similarityThreshold": 0.85,       // 相似度阈值（低于此值视为重复）
  "maxInterruptionsPerSession": 5,   // 每会话最大打断次数
  "interruptMessage": "检测到重复思考模式，已自动打断循环。请尝试重新表述问题或提供新信息。"
}
```

### Web UI 配置

插件会在工具面板中显示一个独立的配置区域：

- ✅ **启用/禁用开关**
- 🔢 **阈值设置**（1-10）
- 📊 **窗口大小**（5-50）
- 🎯 **相似度阈值**（0.7-1.0）
- 🔄 **最大打断次数**（1-100）
- 💬 **自定义提示消息**

## 🖼️ 界面预览

```
┌─────────────────────────────────┐
│ 🔄 重复思考检测                  │
│ ───────────────────────         │
│ ● 已激活                         │
│                                 │
│ ☑ 启用重复思考检测               │
│ [3] 重复次数阈值                 │
│ [20] 检测窗口大小                │
│ [0.85] 相似度阈值                │
│ [5] 最大打断次数                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │检测到重复思考模式，已自动... │ │
│ └─────────────────────────────┘ │
│                                 │
│ 打断次数：0                      │
│ 当前会话：session-xxx            │
│                                 │
│ [保存配置]                       │
└─────────────────────────────────┘
```

## 📊 工作原理

### 检测流程

```
AI 思考 → 计算相似度 → 检查是否重复 → 达到阈值？
    ↓是              ↓否          ↓是
   打断循环         继续监控     打断循环 + 提示用户
```

### 算法说明

- **文本相似度**：基于 Jaccard 相似系数计算思考内容的相似度
- **滑动窗口**：维护最近 N 次思考的历史记录（默认 20 次）
- **哈希去重**：使用字符串哈希快速识别完全相同的思考

## 📝 日志示例

```bash
[RepeatThinker] 初始化重复思考检测插件...
[RepeatThinker] 插件初始化完成
[RepeatThinker] 配置:
  - 重复阈值：3
  - 窗口大小：20
  - 相似度阈值：0.85
  - 最大打断次数：5

[RepeatThinker] 新会话开始：session-xxx
[RepeatThinker] 检测到重复思考模式，已自动打断循环。请尝试重新表述问题或提供新信息。
[RepeatThinker] 打断次数：1/5
```

## 🎯 使用场景

### ✅ 适用场景

- AI 陷入循环回答相同内容
- 用户问题表述不清，AI 反复询问同一信息
- 代码生成任务中 AI 重复尝试相同的错误方案
- 数据分析任务中 AI 重复执行相同的查询

### ❌ 不适用场景

- 正常的多轮对话（如澄清问题）
- 需要多次迭代才能收敛的任务
- 探索性讨论或头脑风暴

## 🔧 API 接口

### 主模块

```javascript
import repeatThinker from "@deepseek-ai/dsh-repeat-thinker";

// 初始化插件
await repeatThinker.init();

// 访问状态
repeatThinker.state.thoughtHistory;
repeatThinker.state.interruptionCount;
repeatThinker.state.sessionId;

// 配置常量
repeatThinker.CONFIG.THRESHOLD;
```

### 客户端模块

```javascript
import { api } from "@deepseek-ai/dsh-repeat-thinker/client";

// 获取配置
const config = api.getConfig();

// 设置配置
api.setConfig({ enabled: false });

// 保存配置
api.saveConfig();
```

## 🐛 故障排除

### 插件未激活

1. 检查状态指示器是否为灰色
2. 确认"启用重复思考检测"复选框已勾选
3. 点击"保存配置"按钮应用更改

### 打断次数过多

- 增加 `threshold`（默认 3）的值
- 减少 `windowSize`（默认 20）的值
- 提高 `similarityThreshold`（默认 0.85）的值

### 插件不响应

1. 刷新页面重新加载插件
2. 清除 localStorage 中的旧配置：
   ```javascript
   localStorage.removeItem("repeat-thinker-config");
   ```
3. 重启 DeepSeek Harness

## 📦 文件结构

```
repeat-thinker-plugin/
├── package.json              # 包定义
├── cordis.patch.yml          # Cordis 补丁配置
├── index.js                  # 主逻辑（服务端）
├── client.js                 # Web UI 模块（客户端）
├── locale/
│   └── zh-CN.json            # 本地化文本
├── docs/
│   ├── DETAIL.md             # 详细文档
│   ├── preview.svg           # 预览图
│   └── icon.svg              # 图标
└── README.md                 # 快速指南
```

## 📄 许可证

MIT License

---

**版本**: 1.0.0  
**作者**: DeepSeek Harness Community  
**文档生成时间**: 2026-11-16
