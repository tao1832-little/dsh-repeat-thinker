# 🔄 重复思考检测插件

## 功能说明

**@deepseek-ai/dsh-repeat-thinker** 是一个用于 DeepSeek Harness 的插件，旨在检测和打断 AI 的循环思考模式。

### 核心功能

1. **实时监控**：通过 `session-log-deepseek` 监控 AI 的思考过程
2. **重复检测**：识别相同的 prompt、相似的意图和重复的思考模式
3. **自动打断**：当检测到重复思考达到阈值时，自动打断循环
4. **用户提示**：显示友好的提示信息，引导用户提供新信息

### 工作原理

```
AI 思考 → 计算相似度 → 检查是否重复 → 达到阈值？
    ↓是              ↓否          ↓是
   打断循环         继续监控     打断循环 + 提示用户
```

### 检测算法

- **文本相似度**：基于 Jaccard 相似系数计算思考内容的相似度
- **滑动窗口**：维护最近 N 次思考的历史记录（默认 20 次）
- **哈希去重**：使用字符串哈希快速识别完全相同的思考

## 配置选项

### 插件配置（cordis.patch.yml）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | true | 是否启用重复思考检测 |
| `threshold` | integer (1-10) | 3 | 触发打断的重复次数阈值 |
| `windowSize` | integer (5-50) | 20 | 检测窗口大小（最近 N 次思考） |
| `similarityThreshold` | number (0.7-1.0) | 0.85 | 相似度阈值（低于此值视为重复） |
| `maxInterruptionsPerSession` | integer (1-100) | 5 | 每会话最大打断次数 |
| `interruptMessage` | string | "检测到重复思考..." | 打断时显示的提示消息 |

### 使用场景

#### ✅ 适用场景

- AI 陷入循环回答相同内容
- 用户问题表述不清，AI 反复询问同一信息
- 代码生成任务中 AI 重复尝试相同的错误方案
- 数据分析任务中 AI 重复执行相同的查询

#### ❌ 不适用场景

- 正常的多轮对话（如澄清问题）
- 需要多次迭代才能收敛的任务
- 探索性讨论或头脑风暴

## 安装与启用

### 方法一：通过插件市场安装

1. 打开 DeepSeek Harness 设置
2. 进入"插件管理"页面
3. 搜索 `@deepseek-ai/dsh-repeat-thinker`
4. 点击"安装并启用"

### 方法二：手动安装

```bash
# 复制插件目录到 DSH 的 plugins 目录
cp -r repeat-thinker-plugin ~/.deepseek-harness/plugins/

# 或者使用 pnpm（如果已配置）
pnpm add @deepseek-ai/dsh-repeat-thinker
```

### 方法三：通过 cordis_inspect_query 启用

```javascript
// 查询现有插件配置
cordis_inspect_query({
  platform: "host",
  provider: "Config",
  method: "listConfigs"
});

// 启用插件（需要适当的权限）
plugin_manager({
  action: "set_plugin",
  target: "@deepseek-ai/dsh-repeat-thinker",
  enabled: true
});
```

## Web UI 界面

### 面板位置

插件会在 DeepSeek Harness 的工具面板中显示一个独立的区域：

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
│ 打断次数: 0                      │
│ 当前会话: session-xxx            │
│                                 │
│ [保存配置]                       │
└─────────────────────────────────┘
```

### UI 功能

- **状态指示器**：显示插件是否激活（绿色=激活，灰色=未激活）
- **实时统计**：显示打断次数和当前会话 ID
- **配置表单**：可调整所有参数并保存
- **持久化存储**：配置自动保存到 localStorage

## 日志输出

### 控制台日志格式

```
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

## API 接口

### 主模块（index.js）

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
repeatThinker.CONFIG.WINDOW_SIZE;
```

### 客户端模块（client.js）

```javascript
import { api } from "@deepseek-ai/dsh-repeat-thinker/client";

// 初始化 UI
api.init();

// 获取配置
const config = api.getConfig();

// 设置配置
api.setConfig({ enabled: false });

// 保存配置
api.saveConfig();
```

## 故障排除

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

## 性能影响

- **内存占用**：约 50KB（存储最近 N 次思考历史）
- **CPU 开销**：<1%（简单的字符串相似度计算）
- **网络请求**：无（纯本地处理）

## 兼容性

- ✅ DeepSeek Harness v0.1.x+
- ✅ Chrome/Edge/Firefox/Safari
- ✅ Node.js 18+（服务端模块）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**版本**: 1.0.0  
**作者**: DeepSeek Harness Community  
**文档生成时间**: 2026-11-16
