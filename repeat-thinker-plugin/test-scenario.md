# 重复思考检测插件 - 测试指南

## 🎯 测试目标

验证 `@deepseek-ai/dsh-repeat-thinker` 插件在 DeepSeek Harness 中的功能：
1. ✅ 插件正确加载并激活
2. ✅ 会话开始时状态重置
3. ✅ 重复思考模式检测
4. ✅ 自动打断循环
5. ✅ Web UI 配置界面

## 📋 测试步骤

### 步骤 1: 检查插件状态

在 DeepSeek Harness 中查看已安装插件：

```bash
# 通过 plugin_manager 命令查看
plugin_manager list_plugins --limit 200
```

**预期输出：**
```json
{
  "entryId": "include:repeat-thinker",
  "moduleName": "@deepseek-ai/dsh-repeat-thinker",
  "enabled": true,
  "fiberPhase": "active"
}
```

### 步骤 2: 创建新会话测试

在 DeepSeek Harness Web UI 中：

1. **点击「New Session」按钮**（顶部导航栏）
2. **选择一个工作区**（或选择临时任务）
3. **观察控制台日志**，应看到：
   ```
   [RepeatThinker] 初始化重复思考检测插件...
   [RepeatThinker] 插件初始化完成
   [RepeatThinker] 新会话开始：session-xxx
   ```

### 步骤 3: 触发重复思考场景

#### 测试场景 A: 简单循环问题

**用户输入：**
```
请解释什么是人工智能。
（等待 AI 回答后）
请再详细解释一下人工智能的概念。
（再次询问类似问题，直到达到阈值）
```

**预期行为：**
- AI 会检测到重复的思考模式
- 在第 3 次或第 4 次时触发打断
- 控制台显示：
  ```
  [RepeatThinker] 检测到重复思考模式，已自动打断循环。请尝试重新表述问题或提供新信息。
  [RepeatThinker] 打断次数：1/5
  ```

#### 测试场景 B: 代码生成循环

**用户输入：**
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

**预期行为：**
- AI 会检测到相似的代码修改意图
- 触发打断提示

#### 测试场景 C: 多轮对话循环

**用户输入：**
```
帮我写一个 Python 函数计算斐波那契数列。
（AI 回答后）
请再写一个斐波那契数列的函数，用不同的方法。
（AI 回答后）
能不能再用另一种方式实现？
（再次询问类似问题）
```

**预期行为：**
- AI 检测到重复的思考模式
- 触发打断机制

### 步骤 4: 检查 Web UI 配置界面

在 DeepSeek Harness 的插件面板中：

1. **查看状态指示器**
   - ✅ 绿色圆点 + "已激活" = 正常工作
   - ❌ 红色圆点 + "未激活" = 需要启用

2. **调整配置参数**
   ```
   [x] 启用重复思考检测
   重复次数阈值：[3]
   检测窗口大小：[20]
   相似度阈值：[0.85]
   最大打断次数：[5]
   ```

3. **点击「保存配置」按钮**
   - 配置保存到 localStorage
   - 下次会话自动加载

### 步骤 5: 验证日志输出

在控制台或日志文件中查看：

```bash
# 预期日志格式
[RepeatThinker] 初始化重复思考检测插件...
[RepeatThinker] 插件初始化完成
[RepeatThinker] 配置:
  - 重复阈值：3
  - 窗口大小：20
  - 相似度阈值：0.85
  - 最大打断次数：5

# 会话开始时
[RepeatThinker] 新会话开始：session-abc123

# 检测到重复时
[RepeatThinker] 检测到重复思考模式，已自动打断循环。请尝试重新表述问题或提供新信息。
[RepeatThinker] 打断次数：1/5
```

## 🧪 自动化测试脚本（可选）

创建一个简单的测试脚本来验证插件功能：

```javascript
// test-repeat-thinker.js
import { cordis } from "@deepseek-ai/cordis";

async function testRepeatThinker() {
  const cordisInstance = await cordis();
  
  // 监听会话开始事件
  cordisInstance.on("session-start", (sessionId) => {
    console.log(`[TEST] 新会话开始：${sessionId}`);
  });
  
  // 监听思考事件（模拟）
  const thoughts = [];
  let thoughtCount = 0;
  
  cordisInstance.on("thought", async (thought) => {
    thoughtCount++;
    console.log(`[TEST] 思考 #${thoughtCount}: ${thought.content.substring(0, 50)}...`);
    
    // 模拟重复检测（简化版）
    if (thoughtCount >= 3) {
      console.log("[TEST] ⚠️ 检测到可能的重复思考模式");
    }
  });
  
  console.log("[TEST] 测试脚本已启动，等待会话...");
}

testRepeatThinker();
```

## ✅ 测试结果检查清单

- [ ] 插件在 `plugin_manager list_plugins` 中显示为 enabled: true
- [ ] 新会话时控制台显示 `[RepeatThinker] 初始化重复思考检测插件...`
- [ ] Web UI 面板显示状态指示器（绿色/红色圆点）
- [ ] 触发重复场景后，控制台显示打断提示
- [ ] 配置参数可以调整并保存

## 🐛 常见问题排查

### Q1: 插件未激活？

**检查：**
```bash
plugin_manager list_plugins | grep repeat-thinker
```

**解决：**
```bash
# 卸载后重新安装
plugin_manager remove_bundle --target @deepseek-ai/dsh-repeat-thinker
plugin_manager install_bundle --target C:\Users\tao\Documents\deepseek-harness\default-workspace\repeat-thinker-plugin
```

### Q2: 控制台没有日志输出？

**检查：**
1. 确认插件已启用（`enabled: true`）
2. 查看 `fiberPhase` 是否为 `"active"`
3. 检查 Cordis 事件监听器是否正确注册

### Q3: Web UI 不显示配置面板？

**可能原因：**
- 浏览器缓存问题（尝试硬刷新 Ctrl+Shift+R）
- 插件模块未正确加载
- 检查浏览器控制台是否有 JavaScript 错误

## 📊 性能指标

| 指标 | 预期值 | 说明 |
|------|--------|------|
| 插件启动时间 | < 100ms | 会话开始时快速初始化 |
| 检测延迟 | < 50ms | 思考事件处理及时 |
| 打断响应 | 即时 | 达到阈值立即触发 |

## 📝 测试报告模板

```markdown
# 重复思考检测插件测试结果

**测试时间：** YYYY-MM-DD HH:MM:SS  
**测试环境：** DeepSeek Harness vX.X.X  
**插件版本：** @deepseek-ai/dsh-repeat-thinker@1.0.0  

## 功能验证

### ✅ 插件加载
- [ ] 状态：已激活
- [ ] Fiber Phase: active

### ✅ 会话管理
- [ ] 新会话时正确重置状态
- [ ] Session ID 正确记录

### ✅ 重复检测
- [ ] 场景 A（简单循环）：触发打断 ✓/✗
- [ ] 场景 B（代码生成）：触发打断 ✓/✗
- [ ] 场景 C（多轮对话）：触发打断 ✓/✗

### ✅ Web UI
- [ ] 状态指示器显示正常
- [ ] 配置参数可调整
- [ ] 配置保存成功

## 日志输出

```bash
# 粘贴实际日志...
```

## 结论

插件功能：[正常工作 / 需要修复]  
建议：[下一步行动]
```

---

**测试完成！** 🎉
