# TaskGenie Frontend

> 基于 React Native 的智能任务管理移动应用

## 🚀 快速开始

### 环境要求
- Node.js 16+
- React Native CLI
- Android Studio / Xcode

### 安装与运行
```bash
# 克隆项目
git clone https://github.com/yangbc30/taskgenie-frontend.git
cd taskgenie-frontend

# 安装依赖
npm install

# iOS 额外安装
cd ios && pod install && cd ..

# 启动开发服务器
npm start

# 运行应用
npm run android  # Android
npm run ios      # iOS
```

## ✨ 主要功能

- 🤖 **AI智能规划** - 自动分解复杂目标为可执行任务
- 📅 **智能日程安排** - AI优化时间分配和优先级
- 🏷️ **动态标签系统** - 自动标记今日、明日、重要任务
- 🔍 **智能搜索** - 下拉搜索，历史记录，实时筛选
- 📱 **流畅交互** - 滑动操作，手势导航，动画效果

## 🏗️ 技术架构

- **框架**: React Native 0.72+
- **状态管理**: Context API + Hooks
- **网络请求**: Fetch API
- **导航**: 自定义Tab导航
- **样式**: StyleSheet + 响应式设计

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── TaskListTab.js  # 任务列表
│   ├── CalendarTab.js  # 日历视图
│   └── AIPlanningModal.js # AI规划模态框
├── context/            # 全局状态
├── hooks/              # 自定义Hook
├── styles/             # 样式文件
└── utils/              # 工具函数
```

## ⚙️ 配置

在 `src/context/TaskContext.js` 中配置后端API地址：

```javascript
// Android 模拟器
export const API_URL = 'http://10.0.2.2:8000';
// iOS 模拟器
// export const API_URL = 'http://localhost:8000';
```

## 🧪 开发调试

```bash
# 查看日志
npm run log-android
npm run log-ios

# 重置缓存
npm start -- --reset-cache

# 构建测试
npm run build-android
npm run build-ios
```

## 📦 打包发布

```bash
# Android APK
cd android && ./gradlew assembleRelease

# iOS Archive
# 使用 Xcode 打开 ios/TaskGenie.xcworkspace
```

## 🐛 常见问题

**Metro 连接失败**
```bash
npm start -- --reset-cache
```

**Android 构建错误**
```bash
cd android && ./gradlew clean
```

**iOS Pod 安装失败**
```bash
cd ios && pod deintegrate && pod install
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License