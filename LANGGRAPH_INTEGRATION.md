# LangGraph 前端集成指南

这是一个专为 LangGraph 应用设计的现代化前端界面，支持流式操作、复杂对话流程和状态管理。

## 🎨 特性

- **Element UI 风格设计** - 专业的蓝色主题，清洁的界面设计
- **流式消息支持** - 实时显示 AI 响应，支持打字机效果
- **复杂对话流程** - 支持多轮对话、条件分支、状态跟踪
- **记忆管理** - 可视化显示对话上下文和记忆存储
- **API 配置界面** - 灵活的后端连接配置
- **响应式设计** - 适配各种屏幕尺寸

## 🔧 与 LangGraph 后端集成

### 1. API 端点要求

您的 LangGraph 后端需要提供以下端点：

```python
# 健康检查
GET /health

# 创建会话
POST /sessions
{
  "graph_id": "your-graph-id"
}

# 发送消息 (支持流式)
POST /invoke
{
  "input": {
    "message": "用户消息",
    "session_id": "session-uuid",
    "graph_id": "your-graph-id"
  },
  "stream": true
}

# 获取会话状态
GET /sessions/{session_id}/state
```

### 2. 流式响应格式

前端期望以下格式的流式响应：

```
data: {"content": "部分响应内容", "isComplete": false, "metadata": {"state": "thinking"}}
data: {"content": "完整响应内容", "isComplete": true, "metadata": {"state": "completed", "memory": {...}}}
```

### 3. 配置 API 连接

1. 点击界面右上角的 "API配置" 按钮
2. 输入您的 LangGraph 后端 URL（如：`http://localhost:8000`）
3. 输入 Graph ID
4. 可选：输入 API 密钥
5. 点击 "测试连接" 确认配置正确

## 📦 使用的组件

- **ChatInterface** - 主要聊天界面
- **MessageBubble** - 消息气泡组件
- **ContextPanel** - 上下文面板，显示状态和记忆
- **APIConfigDialog** - API 配置对话框
- **useLangGraphAPI** - LangGraph API 集成 Hook

## 🎯 快速开始

```typescript
import { ChatInterface } from "@/components/chat/ChatInterface";

function App() {
  return (
    <div className="h-screen">
      <ChatInterface />
    </div>
  );
}
```

## 🔄 自定义后端集成

如果您需要自定义集成逻辑，可以修改 `src/hooks/useLangGraphAPI.ts` 文件：

```typescript
const { sendMessage, createSession, getSessionState } = useLangGraphAPI({
  baseUrl: "http://your-backend-url",
  graphId: "your-graph-id",
  apiKey: "optional-api-key"
});
```

## 📱 响应式特性

- 移动端优化的触摸交互
- 自适应的消息布局
- 可折叠的上下文面板
- 平滑的动画效果

## 🎨 样式自定义

所有样式都基于设计系统定义在 `src/index.css` 中：

- 使用 CSS 变量进行主题定制
- Element UI 风格的颜色方案
- 支持深色/浅色模式切换
- 流畅的动画和过渡效果

## 🚀 部署建议

1. 构建生产版本：`npm run build`
2. 配置 CORS 允许前端域名访问 LangGraph API
3. 设置适当的 API 认证机制
4. 考虑使用 WebSocket 进一步优化实时性能

## 🤝 贡献

欢迎提交问题和改进建议！这个前端界面设计为与 LangGraph 生态系统完美集成。