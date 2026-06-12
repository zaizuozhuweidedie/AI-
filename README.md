<div align="center">
  <br />
  <div align="center">
    <img src="https://img.shields.io/badge/Next.js-14.2-000000?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Prisma-6.5-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/NextAuth-v5-000000?style=flat-square" alt="NextAuth" />
  </div>

  <br />

  <h1>🧠 CardWise — AI 学习助手</h1>

  <p>
    <strong>粘贴笔记、文章或链接，AI 自动生成 Flashcards。<br />配合间隔重复算法，让你记得更牢、学得更快。</strong>
  </p>

  <br />

  <p>
    <a href="https://ai-l4v3gksxy-shihua-s-projects1.vercel.app" target="_blank"><strong>🌐 在线体验</strong></a>
    ·
    <a href="#-快速开始"><strong>🚀 快速开始</strong></a>
    ·
    <a href="#-功能展示"><strong>📸 功能展示</strong></a>
  </p>

  <br />
</div>

---

## 📖 项目简介

CardWise 是一个 AI 驱动的间隔重复 Flashcards 应用。它的核心场景是：

1. **📝 粘贴学习材料** → AI 自动提取知识点，生成问答卡片
2. **🧠 间隔重复复习** → 基于 SM‑2 算法，在最佳时间点提醒你复习
3. **📊 可视化学习数据** → 热力图、掌握曲线，清晰看到自己的进步

无论是备考、学习新技术、还是记忆外语单词，CardWise 都能帮你提升记忆效率。

---

## ✨ 功能亮点

| 功能 | 描述 |
|------|------|
| 🤖 **AI 自动生成卡片** | 粘贴文本、文章链接，AI 自动提取关键知识点并生成 Flashcards |
| 🧠 **SM‑2 间隔重复** | 自研实现 SM-2 算法（Anki 同款），科学安排复习计划 |
| 🃏 **翻转卡片学习** | 点击翻转 + 四档自评（Again / Hard / Good / Easy） |
| 📚 **卡组管理** | 创建多个主题卡组，标签分类，颜色标记 |
| 📊 **学习仪表盘** | GitHub 风格热力图、掌握曲线、复习统计概览 |
| 🔐 **多用户支持** | 邮箱注册 + Google OAuth，数据云端同步 |

---

## 🛠 技术栈

```
Frontend         Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
Backend          Next.js Server Actions · API Routes
Database         PostgreSQL (Neon) · Prisma ORM
Authentication   NextAuth v5 (Credentials + Google OAuth)
AI               Claude API / OpenAI API
Deployment       Vercel
```

### 关键依赖

| 包 | 用途 |
|------|---------|
| `next-auth` | 用户认证（邮箱密码 + Google） |
| `@prisma/client` + `prisma` | 数据库 ORM |
| `bcryptjs` | 密码加密 |
| `framer-motion` | 卡片翻转动画 |
| `recharts` | 学习数据图表可视化 |
| `tailwindcss-animate` | 动画工具类 |

---

## 🏗 架构概览

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Browser    │ ───→ │  Next.js 14  │ ───→ │  PostgreSQL  │
│  (Tailwind)  │ ←─── │  (Vercel)    │ ←─── │   (Neon)     │
└──────────────┘      └──────┬───────┘      └──────────────┘
                             │
                    ┌────────┴────────┐
                    │   NextAuth v5   │
                    │  (Credentials)  │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  AI API 路由    │
                    │ (Claude/OpenAI) │
                    └─────────────────┘
```

### 项目结构

```
cardwise/
├── prisma/                    # 数据库 Schema
│   └── schema.prisma          # User / Deck / Card / ReviewLog 模型
├── src/
│   ├── actions/               # Server Actions（CRUD + 复习逻辑）
│   ├── app/
│   │   ├── api/               # API 路由（Auth + AI 生成）
│   │   ├── auth/              # 登录/注册页面
│   │   └── dashboard/         # 仪表盘、卡组管理、学习模式
│   ├── components/
│   │   ├── cards/             # Flashcard 组件 + AI 生成器
│   │   ├── dashboard/         # 热力图、统计卡片
│   │   ├── decks/             # 卡组列表、删除确认
│   │   └── study/             # 学习模式主视图
│   ├── lib/
│   │   ├── sm2.ts             # SM-2 间隔重复算法实现
│   │   ├── auth.ts            # NextAuth 配置
│   │   └── prisma.ts          # Prisma 客户端
│   └── types/                 # TypeScript 类型定义
└── ...
```

---

## 🧠 SM-2 间隔重复算法

CardWise 使用 SuperMemo SM-2 算法来安排每张卡片的复习时间：

```
评分标准:
  Again (1)  → 完全忘了，重置间隔
  Hard  (2)  → 想起来了但很困难
  Good  (3)  → 正常记住，按计划推进
  Easy  (4)  → 非常轻松，加速推进

间隔计算:
  again/hard → 1 天后复习
  good       → 根据 easeFactor 增长间隔
  easy       → 间隔增长更快，easeFactor 提高
```

算法实现见 [`src/lib/sm2.ts`](src/lib/sm2.ts)。

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 数据库（推荐 [Neon](https://neon.tech) 免费版）

### 本地运行

```bash
# 1. 克隆项目
git clone https://github.com/zaizuozhuweidedie/AI-.git
cd AI-

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env .env.local
# 编辑 .env.local，填入你的 DATABASE_URL 和 AUTH_SECRET

# 4. 初始化数据库
npx prisma db push

# 5. 启动开发服务器
npm run dev
```

打开 [https://ai-l4v3gksxy-shihua-s-projects1.vercel.app](https://ai-l4v3gksxy-shihua-s-projects1.vercel.app) 即可体验。

### 环境变量

```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
AUTH_SECRET="your-random-secret"
AUTH_URL="https://ai-l4v3gksxy-shihua-s-projects1.vercel.app"

# AI 生成（二选一，不配则使用示例卡片）
ANTHROPIC_API_KEY="sk-ant-..."
# OPENAI_API_KEY="sk-..."
```

---

## 📸 功能展示

> *截图待补充 — 运行项目或访问 [在线 Demo](https://ai-l4v3gksxy-shihua-s-projects1.vercel.app) 查看完整效果*

| 页面 | 说明 |
|------|------|
| **Landing Page** | 深色主题首页，展示核心卖点 |
| **仪表盘** | 今日待复习、总卡片数、热力图、掌握曲线 |
| **卡组列表** | 以卡片形式展示所有学习卡组 |
| **卡组详情** | 卡组内的卡片列表 + AI 生成入口 |
| **学习模式** | 翻转卡片 → 自评 → 自动安排下次复习 |
| **AI 生成** | 粘贴文本或链接，AI 提取知识点生成卡片 |

---

## 🎯 面试亮点

这个项目展示了以下能力：

| 能力 | 体现 |
|------|------|
| **全栈开发** | Next.js App Router + Prisma + PostgreSQL 完整链路 |
| **交互设计** | 卡片翻转动画、键盘快捷键（1-4 快速评分） |
| **算法实现** | 手写 SM-2 间隔重复算法 |
| **AI 集成** | 多源输入（文本/链接）→ AI 生成结构性内容 |
| **工程规范** | TypeScript、Server Actions、Prisma ORM、响应式布局 |
| **产品思维** | 从 MVP 到扩展的迭代路线规划 |

---

## 🔮 未来规划

- [ ] **PDF 上传** — 支持 PDF 文档直接解析生成卡片
- [ ] **Anki 导入/导出** — 兼容 Anki APKG 格式
- [ ] **卡组分享** — 生成分享链接，社区共享学习资料
- [ ] **数学公式支持** — LaTeX 渲染，适配理科学习
- [ ] **PWA 离线支持** — 手机端离线复习
- [ ] **AI 出题模式** — 根据笔记自动生成选择题、填空题

---

## 📄 许可证

MIT License

---

<div align="center">
  <sub>Built with ❤️ for vibecoding</sub>
</div>
