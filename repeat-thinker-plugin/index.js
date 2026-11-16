/**
 * @deepseek-ai/dsh-repeat-thinker - 重复思考检测插件（Host 端）
 * 
 * 功能：
 * 1. 监控 AI 的思考过程（通过 session-log-deepseek）
 * 2. 识别重复思考模式（相同的 prompt、相似的意图）
 * 3. 自动打断循环并提示用户
 */

// 配置常量
const DEFAULT_CONFIG = {
  enabled: true,
  threshold: 3,              // 触发打断的重复次数阈值
  windowSize: 20,           // 检测窗口大小（最近 N 次思考）
  similarityThreshold: 0.85,// 相似度阈值
  maxInterruptionsPerSession: 5, // 每会话最大打断次数
};

// 状态管理
class RepeatThinkerState {
  constructor() {
    this.thoughtHistory = [];      // 思考历史
    this.interruptionCount = 0;    // 打断计数
    this.sessionId = null;         // 当前会话 ID
    this.isMonitoring = false;     // 是否正在监控
  }

  reset() {
    this.thoughtHistory = [];
    this.interruptionCount = 0;
    this.sessionId = null;
    this.isMonitoring = false;
  }
}

const state = new RepeatThinkerState();

/**
 * 计算思考内容的相似度（基于文本）
 */
function calculateSimilarity(text1, text2) {
  // 简单的 Jaccard 相似度
  const set1 = new Set(text1.split(/\s+/).filter(w => w.length > 0));
  const set2 = new Set(text2.split(/\s+/).filter(w => w.length > 0));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * 生成思考内容的哈希值（用于快速去重）
 */
function generateHash(text) {
  // 使用简单的字符串哈希
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * 检测重复思考模式
 */
function detectRepeatThought(thought) {
  const currentHash = generateHash(thought.content);
  
  // 检查是否在窗口内存在相似思考
  for (let i = 0; i < state.thoughtHistory.length; i++) {
    const prevThought = state.thoughtHistory[i];
    
    if (!prevThought) continue;
    
    const similarity = calculateSimilarity(thought.content, prevThought.content);
    
    // 如果相似度低于阈值，视为重复思考
    if (similarity < DEFAULT_CONFIG.similarityThreshold) {
      return {
        isRepeat: true,
        repeatCount: i + 1,
        similarThoughtIndex: i,
        similarity
      };
    }
  }
  
  return { isRepeat: false };
}

/**
 * 检查是否需要打断循环
 */
function checkInterruption(thought) {
  const repeatInfo = detectRepeatThought(thought);
  
  if (!repeatInfo.isRepeat) {
    // 不是重复思考，添加到历史
    state.thoughtHistory.push(thought);
    
    // 保持窗口大小
    while (state.thoughtHistory.length > DEFAULT_CONFIG.windowSize) {
      state.thoughtHistory.shift();
    }
    
    return false;
  }
  
  const repeatCount = repeatInfo.repeatCount + 1;
  
  // 检查是否达到打断阈值
  if (repeatCount >= DEFAULT_CONFIG.threshold && 
      state.interruptionCount < DEFAULT_CONFIG.maxInterruptionsPerSession) {
    
    state.interruptionCount++;
    return {
      shouldInterrupt: true,
      repeatCount,
      interruptionNumber: state.interruptionCount
    };
  }
  
  return false;
}

/**
 * 打断循环并显示提示
 */
function interruptLoop(thought) {
  const message = DEFAULT_CONFIG.interruptMessage || 
    "检测到重复思考模式，已自动打断循环。请尝试重新表述问题或提供新信息。";
  
  console.log(`[RepeatThinker] ${message}`);
  console.log(`[RepeatThinker] 打断次数：${state.interruptionCount}/${DEFAULT_CONFIG.maxInterruptionsPerSession}`);
  
  // 重置状态，避免连续打断
  state.interruptionCount = Math.min(state.interruptionCount + 1, DEFAULT_CONFIG.maxInterruptionsPerSession);
  
  return message;
}

/**
 * 会话开始时的初始化
 */
function onSessionStart(sessionId) {
  console.log(`[RepeatThinker] 新会话开始：${sessionId}`);
  state.sessionId = sessionId;
  state.reset();
}

/**
 * 思考事件处理
 */
async function onThought(thought) {
  if (!state.isMonitoring) return;
  
  // 检查是否需要打断
  const result = checkInterruption(thought);
  
  if (result.shouldInterrupt) {
    interruptLoop(thought);
    
    // 重置计数器，避免连续打断
    state.interruptionCount = 0;
  } else {
    // 正常添加思考到历史
    state.thoughtHistory.push(thought);
    
    // 保持窗口大小
    while (state.thoughtHistory.length > DEFAULT_CONFIG.windowSize) {
      state.thoughtHistory.shift();
    }
  }
}

/**
 * 插件主入口 - Host 端导出形式
 */
export function apply(ctx, config) {
  console.log("[RepeatThinker] 初始化重复思考检测插件...");
  
  // 合并配置
  const effectiveConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // 使用 ctx.on() 注册事件监听器（正确的 Cordis API 用法）
    ctx.on("session-start", onSessionStart);
    ctx.on("thought", onThought);
    
    console.log("[RepeatThinker] 插件初始化完成");
    console.log(`[RepeatThinker] 配置:`);
    console.log(`  - 重复阈值：${effectiveConfig.threshold}`);
    console.log(`  - 窗口大小：${effectiveConfig.windowSize}`);
    console.log(`  - 相似度阈值：${effectiveConfig.similarityThreshold}`);
    console.log(`  - 最大打断次数：${effectiveConfig.maxInterruptionsPerSession}`);
    
    return () => {
      // 清理函数（可选）
      console.log("[RepeatThinker] 插件已卸载");
    };
  } catch (error) {
    console.error("[RepeatThinker] 初始化失败:", error);
    throw error;
  }
}

// 导出配置 schema（用于验证）
export const configSchema = {
  enabled: true,
  threshold: DEFAULT_CONFIG.threshold,
  windowSize: DEFAULT_CONFIG.windowSize,
  similarityThreshold: DEFAULT_CONFIG.similarityThreshold,
  maxInterruptionsPerSession: DEFAULT_CONFIG.maxInterruptionsPerSession,
  interruptMessage: "检测到重复思考模式，已自动打断循环。请尝试重新表述问题或提供新信息。"
};

// 导出状态（用于调试）
export { state };
