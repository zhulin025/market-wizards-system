# OpenBB + OpenAlice 集成部署任务清单

本文档基于 [车厘子教程](https://x.com/0xcherry/status/2025807825184620559) 整理，旨在将 OpenBB 开源金融终端集成到 Market Wizards System 项目中，作为本地化的数据与分析后端。

## 📅 阶段一：本地环境部署 (The Plumbing)
*目标：在本地机器跑通 OpenBB API，确保 `http://127.0.0.1:6900` 可用。*

### 1.1 环境准备
- [ ] **安装 Git**:
    - Windows: `winget install Git.Git`
    - Mac: `brew install git`
- [ ] **安装 `uv` (Python 包管理器)**:
    - Windows: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
    - Mac/Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- [ ] **安装 Python 3.12**:
    - `uv python install 3.12`

### 1.2 获取与安装 OpenBB-Alice
- [ ] **克隆仓库**:
    - `git clone https://github.com/OpenBB-finance/OpenBBTerminal.git OpenBB-Alice` (需确认具体分支地址，教程提及是特定分支，暂用主仓库或查找 `OpenBB-Alice` 关键词)
    - *注：若教程有特定分支链接，请替换。*
- [ ] **创建虚拟环境**:
    - `cd OpenBB-Alice`
    - `uv venv --python 3.12`
- [ ] **激活环境**:
    - Windows: `.venv\Scripts\activate`
    - Mac/Linux: `source .venv/bin/activate`
- [ ] **安装依赖**:
    - `uv pip install "openbb[all]"`
    - *注：Windows 用户如遇 C++ 错误需安装 Visual C++ Build Tools。*

### 1.3 启动与验证
- [ ] **启动 API**:
    - 在终端运行 `openbb-api`
- [ ] **验证**:
    - 浏览器访问 `http://127.0.0.1:6900`，应显示 API 文档/欢迎页。

---

## 🔌 阶段二：后端集成 (Integration)
*目标：让 Market Wizards System (Next.js) 能够调用本地 OpenBB 数据。*

### 2.1 创建 OpenBB Service
在 `src/services/openbbService.js` 中封装 API 调用：

```javascript
// src/services/openbbService.js

const OPENBB_BASE_URL = 'http://127.0.0.1:6900';

/**
 * 获取股票概况
 * @param {string} symbol - 股票代码 (e.g., 'AAPL')
 */
export async function getStockQuote(symbol) {
  try {
    // 假设 OpenBB API 路径为 /api/v1/equity/quote
    const response = await fetch(`${OPENBB_BASE_URL}/api/v1/equity/quote?symbol=${symbol}`);
    if (!response.ok) throw new Error('OpenBB API Error');
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch stock quote:", error);
    return null;
  }
}

/**
 * 获取加密货币数据 (示例)
 */
export async function getCryptoPrice(symbol) {
    // 待实现具体端点
}
```

### 2.2 API 路由代理 (可选)
如果遇到 CORS 问题，可以在 Next.js 的 `src/pages/api/` 中建立代理：

```javascript
// src/pages/api/openbb/[...path].js
export default async function handler(req, res) {
  const { path } = req.query;
  const url = `http://127.0.0.1:6900/${path.join('/')}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy Error' });
  }
}
```

---

## 🧠 阶段三：AI 分析师构建 (The Brain)
*目标：在应用中增加“AI 市场分析师”功能，结合数据输出观点。*

### 3.1 定义 Agent Prompt
在 `src/prompts/analystPrompt.js` 中：

```javascript
export const ANALYST_SYSTEM_PROMPT = `
你是一位资深的华尔街交易员，擅长威科夫操盘法和趋势跟踪。
你将接收 JSON 格式的金融数据（包含价格、成交量、RSI等）。
请根据数据分析当前市场情绪，并给出：
1. 趋势判断（Bullish/Bearish/Neutral）
2. 关键支撑/阻力位
3. 潜在的交易策略
不要只罗列数据，要给出具体的交易逻辑。
`;
```

### 3.2 接入 Gemini/LLM
利用现有的 `src/pages/api/analyze.js`，增加数据上下文注入：

```javascript
// 伪代码流程
1. 用户请求分析 "BTC"
2. 后端调用 openbbService.getCryptoPrice("BTC") 获取数据
3. 将数据 + ANALYST_SYSTEM_PROMPT 发送给 Gemini 3.1 Pro
4. 返回 AI 生成的分析报告
```

---

## ✅ 验收标准
1.  本地运行 `npm run dev` 时，能够通过页面点击按钮，从本地 6900 端口获取到数据。
2.  不再依赖不稳定的 Yahoo Finance 爬虫，而是使用 OpenBB 的标准化接口。
3.  AI 分析功能能够引用具体的实时数据（如“当前 RSI 为 72，显示超买”）。
