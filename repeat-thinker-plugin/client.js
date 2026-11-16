/**
 * @deepseek-ai/dsh-repeat-thinker - 客户端模块（Web UI）
 * 
 * Web UI 集成：显示打断提示和配置选项
 */

// 插件配置状态（持久化）
let pluginConfig = {
  enabled: true,
  threshold: 3,
  windowSize: 20,
  similarityThreshold: 0.85,
  maxInterruptionsPerSession: 5,
  interruptMessage: "检测到重复思考模式，已自动打断循环。请尝试重新表述问题或提供新信息。"
};

// 当前会话状态
let currentSessionId = null;
let interruptionCount = 0;
let isMonitoring = false;

/**
 * 初始化客户端模块
 */
function init() {
  console.log("[RepeatThinker Client] 初始化客户端模块...");
  
  // 加载持久化配置（如果有）
  try {
    const savedConfig = localStorage.getItem("repeat-thinker-config");
    if (savedConfig) {
      pluginConfig = { ...pluginConfig, ...JSON.parse(savedConfig) };
    }
  } catch (e) {
    console.warn("[RepeatThinker Client] 无法加载持久化配置:", e);
  }
  
  // 创建 UI 元素
  createUI();
  
  // 绑定事件监听器
  bindEventListeners();
  
  return true;
}

/**
 * 创建 UI 元素
 */
function createUI() {
  const container = document.createElement("div");
  container.id = "repeat-thinker-ui";
  container.className = "dsh-plugin-panel";
  
  // 标题栏
  const header = document.createElement("h3");
  header.textContent = "🔄 重复思考检测";
  header.style.margin = "0 0 10px 0";
  header.style.borderBottom = "1px solid #e2e8f0";
  header.style.paddingBottom = "10px";
  
  // 状态指示器
  const statusDiv = document.createElement("div");
  statusDiv.id = "repeat-thinker-status";
  statusDiv.className = "status-indicator";
  statusDiv.innerHTML = `
    <span class="status-dot" style="background-color: #94a3b8; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
    <span style="margin-left: 8px; color: #64748b;">未激活</span>
  `;
  
  // 配置表单
  const form = document.createElement("form");
  form.id = "repeat-thinker-form";
  form.style.marginTop = "10px";
  
  // 启用/禁用开关
  const enabledLabel = document.createElement("label");
  enabledLabel.innerHTML = `
    <input type="checkbox" id="rt-enabled" ${pluginConfig.enabled ? "checked" : ""}>
    <span style="margin-left: 6px;">启用重复思考检测</span>
  `;
  
  // 阈值设置
  const thresholdLabel = document.createElement("label");
  thresholdLabel.innerHTML = `
    <input type="number" id="rt-threshold" min="1" max="10" value="${pluginConfig.threshold}">
    <span style="margin-left: 6px;">重复次数阈值</span>
  `;
  
  // 窗口大小设置
  const windowSizeLabel = document.createElement("label");
  windowSizeLabel.innerHTML = `
    <input type="number" id="rt-window-size" min="5" max="50" value="${pluginConfig.windowSize}">
    <span style="margin-left: 6px;">检测窗口大小</span>
  `;
  
  // 相似度阈值设置
  const similarityLabel = document.createElement("label");
  similarityLabel.innerHTML = `
    <input type="number" id="rt-similarity-threshold" min="0.7" max="1.0" step="0.05" value="${pluginConfig.similarityThreshold}">
    <span style="margin-left: 6px;">相似度阈值</span>
  `;
  
  // 最大打断次数设置
  const maxInterruptionsLabel = document.createElement("label");
  maxInterruptionsLabel.innerHTML = `
    <input type="number" id="rt-max-interruptions" min="1" max="100" value="${pluginConfig.maxInterruptionsPerSession}">
    <span style="margin-left: 6px;">最大打断次数</span>
  `;
  
  // 提示消息设置
  const messageLabel = document.createElement("label");
  messageLabel.innerHTML = `
    <textarea id="rt-interrupt-message" rows="2">${pluginConfig.interruptMessage}</textarea>
    <small style="color: #64748b;">打断时显示的提示消息</small>
  `;
  
  // 统计信息
  const statsDiv = document.createElement("div");
  statsDiv.id = "repeat-thinker-stats";
  statsDiv.style.marginTop = "10px";
  statsDiv.style.padding = "8px";
  statsDiv.style.background = "#f1f5f9";
  statsDiv.style.borderRadius = "4px";
  statsDiv.innerHTML = `
    <div><strong>打断次数:</strong> ${interruptionCount}</div>
    <div style="margin-top: 4px;"><strong>当前会话:</strong> ${currentSessionId || '无'}</div>
  `;
  
  // 保存按钮
  const saveBtn = document.createElement("button");
  saveBtn.id = "rt-save-btn";
  saveBtn.textContent = "保存配置";
  saveBtn.style.marginTop = "10px";
  saveBtn.style.padding = "6px 12px";
  saveBtn.style.background = "#3b82f6";
  saveBtn.style.color = "white";
  saveBtn.style.border = "none";
  saveBtn.style.borderRadius = "4px";
  saveBtn.style.cursor = "pointer";
  
  // 组装 UI
  container.appendChild(header);
  container.appendChild(statusDiv);
  container.appendChild(form);
  
  const formGroup = document.createElement("div");
  formGroup.className = "form-group";
  formGroup.appendChild(enabledLabel);
  form.appendChild(formGroup);
  
  formGroup = document.createElement("div");
  formGroup.className = "form-group";
  formGroup.appendChild(thresholdLabel);
  form.appendChild(formGroup);
  
  formGroup = document.createElement("div");
  formGroup.className = "form-group";
  formGroup.appendChild(windowSizeLabel);
  form.appendChild(formGroup);
  
  formGroup = document.createElement("div");
  formGroup.className = "form-group";
  formGroup.appendChild(similarityLabel);
  form.appendChild(formGroup);
  
  formGroup = document.createElement("div");
  formGroup.className = "form-group";
  formGroup.appendChild(maxInterruptionsLabel);
  form.appendChild(formGroup);
  
  formGroup = document.createElement("div");
  formGroup.className = "form-group";
  formGroup.appendChild(messageLabel);
  form.appendChild(formGroup);
  
  container.appendChild(statsDiv);
  container.appendChild(saveBtn);
  
  // 插入到页面中（通常在工具面板附近）
  const existingPanel = document.getElementById("dsh-plugin-panel");
  if (existingPanel) {
    existingPanel.insertBefore(container, existingPanel.firstChild);
  } else {
    document.body.appendChild(container);
  }
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
  // 启用/禁用开关
  const enabledCheckbox = document.getElementById("rt-enabled");
  if (enabledCheckbox) {
    enabledCheckbox.addEventListener("change", (e) => {
      pluginConfig.enabled = e.target.checked;
      updateStatus();
    });
  }
  
  // 阈值设置
  const thresholdInput = document.getElementById("rt-threshold");
  if (thresholdInput) {
    thresholdInput.addEventListener("input", (e) => {
      pluginConfig.threshold = parseInt(e.target.value);
    });
  }
  
  // 窗口大小设置
  const windowSizeInput = document.getElementById("rt-window-size");
  if (windowSizeInput) {
    windowSizeInput.addEventListener("input", (e) => {
      pluginConfig.windowSize = parseInt(e.target.value);
    });
  }
  
  // 相似度阈值设置
  const similarityInput = document.getElementById("rt-similarity-threshold");
  if (similarityInput) {
    similarityInput.addEventListener("input", (e) => {
      pluginConfig.similarityThreshold = parseFloat(e.target.value);
    });
  }
  
  // 最大打断次数设置
  const maxInterruptionsInput = document.getElementById("rt-max-interruptions");
  if (maxInterruptionsInput) {
    maxInterruptionsInput.addEventListener("input", (e) => {
      pluginConfig.maxInterruptionsPerSession = parseInt(e.target.value);
    });
  }
  
  // 提示消息设置
  const messageTextarea = document.getElementById("rt-interrupt-message");
  if (messageTextarea) {
    messageTextarea.addEventListener("input", (e) => {
      pluginConfig.interruptMessage = e.target.value;
    });
  }
  
  // 保存按钮
  const saveBtn = document.getElementById("rt-save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveConfig);
  }
}

/**
 * 更新状态指示器
 */
function updateStatus() {
  const statusDiv = document.getElementById("repeat-thinker-status");
  if (!statusDiv) return;
  
  if (pluginConfig.enabled) {
    statusDiv.innerHTML = `
      <span class="status-dot" style="background-color: #22c55e; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
      <span style="margin-left: 8px; color: #16a34a;">已激活</span>
    `;
  } else {
    statusDiv.innerHTML = `
      <span class="status-dot" style="background-color: #ef4444; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
      <span style="margin-left: 8px; color: #dc2626;">未激活</span>
    `;
  }
}

/**
 * 保存配置到 localStorage
 */
function saveConfig() {
  try {
    localStorage.setItem("repeat-thinker-config", JSON.stringify(pluginConfig));
    
    // 显示成功提示
    const statsDiv = document.getElementById("repeat-thinker-stats");
    if (statsDiv) {
      statsDiv.innerHTML += `<div style="color: #16a34a; margin-top: 4px;">✓ 配置已保存</div>`;
      
      // 2 秒后清除提示
      setTimeout(() => {
        const tempStats = document.getElementById("repeat-thinker-stats");
        if (tempStats) {
          tempStats.innerHTML = tempStats.innerHTML.split("</div>").slice(0, -1).join("</div>");
        }
      }, 2000);
    }
    
    console.log("[RepeatThinker Client] 配置已保存:", pluginConfig);
  } catch (e) {
    console.error("[RepeatThinker Client] 保存配置失败:", e);
  }
}

/**
 * 会话开始时的初始化
 */
function onSessionStart(sessionId) {
  currentSessionId = sessionId;
  
  const statsDiv = document.getElementById("repeat-thinker-stats");
  if (statsDiv) {
    statsDiv.innerHTML = `
      <div><strong>打断次数:</strong> ${interruptionCount}</div>
      <div style="margin-top: 4px;"><strong>当前会话:</strong> ${sessionId || '无'}</div>
    `;
  }
  
  // 重置打断计数
  interruptionCount = 0;
}

/**
 * 插件暴露的 API
 */
export const api = {
  init,
  onSessionStart,
  getConfig: () => pluginConfig,
  setConfig: (config) => {
    pluginConfig = { ...pluginConfig, ...config };
    updateStatus();
  },
  saveConfig
};

export default api;
