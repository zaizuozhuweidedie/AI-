# CardWise — AI 学习助手 项目规格书

> 一句话：一个 AI 驱动的间隔重复 Flashcards 应用，帮你更快地记住任何知识点。

---

## 1. 产品概述

CardWise 是一个全栈 Web 应用，核心场景是：

1. **用户粘贴一段文字 / URL / PDF** → AI 自动提取关键知识点并生成 Flashcards
2. **用户按间隔重复算法（SM-2）复习卡片** → 系统智能安排复习时间
3. **用户通过仪表盘追踪学习进度** → 热力图、掌握曲线、统计数据

---

## 2. 核心功能清单

### P0 — MVP（必须完成）

| 功能 | 描述 |
|------|------|
| 用户注册/登录 | NextAuth，支持邮箱密码 + Google OAuth |
| Deck 管理 | 创建/编辑/删除学习卡组，支持卡片计数显示 |
| Card 管理 | 正反双面卡片，富文本编辑（Markdown），标签系统 |
| Deck 内卡片浏览 | 列表视图，翻页或虚拟滚动 |
| 学习模式 | 顺序复习 + 随机复习两种模式，翻转动画 |
| SM-2 间隔重复算法 | 看完卡片后自评（Again/Hard/Good/Easy），自动计算下次复习时间 |
| 基础仪表盘 | 今日待复习卡片数、总卡片数、掌握率 |

### P1 — AI 核心（差异化竞争力）

| 功能 | 描述 |
|------|------|
| 文本 → AI 生成卡片 | 粘贴学习材料，AI 提取关键知识点并自动生成多张卡片 |
| URL 抓取 → AI 生成 | 输入文章/博客链接，后端抓取内容后 AI 生成卡片 |
| PDF 上传 → AI 生成 | 上传 PDF 文件，解析文本后 AI 生成卡片 |
| AI 结果可编辑 | 生成的卡片在入库前可预览、编辑、删除、调整后才保存 |

### P2 — 数据可视化（展示加分）

| 功能 | 描述 |
|------|------|
| 学习热力图 | GitHub 风格的热力图，展示每日复习量 |
| 掌握进度曲线 | 展示每张卡片/每个卡组的掌握百分比变化 |
| 复习统计 | 近 7 天/30 天复习数量趋势图 |

### P3 — 扩展（有时间再做）

| 功能 | 描述 |
|------|------|
| 公开卡组分享 | 生成分享链接，别人可以导入你的卡组 |
| 导入/导出 | Anki APKG 格式导入/CSV 导出 |
| 图片/SVG 渲染 | 卡片支持嵌入图片和数学公式（LaTeX） |
| 移动端 PWA | 支持手机添加至桌面，离线复习 |

---

## 3. 技术栈

```
Frontend:      Next.js 14 (App Router) + TypeScript + Tailwind CSS
UI Library:    shadcn/ui (基于 Radix UI)
数据库:         PostgreSQL (Vercel Postgres / Supabase)
ORM:           Prisma
认证:           NextAuth.js (Credentials + Google OAuth)
AI:            Vercel AI SDK + Claude API (或 OpenAI)
图表:           Recharts
拖拽:           dnd-kit (卡片排序)
动画:           Framer Motion (卡片翻转)
部署:           Vercel
开发工具:       Cursor + Claude + GitHub Copilot
```

---

## 4. 数据库设计

### 核心 Models

```
User
  id            String @id @default(cuid())
  name          String?
  email         String? @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  decks         Deck[]
  studySessions StudySession[]

Deck
  id            String @id @default(cuid())
  name          String
  description   String?
  color         String?    // 卡片组颜色标记
  userId        String
  user          User @relation(fields: [userId], references: [id])
  cards         Card[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

Card
  id            String @id @default(cuid())
  front         String     // 卡片正面（问题/术语）
  back          String     // 卡片背面（答案/解释）
  tags          String[]   // 标签数组
  deckId        String
  deck          Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  userId        String
  user          User @relation(fields: [userId], references: [id])

  // SM-2 算法字段
  ease          Float   @default(2.5)     // 难度系数
  interval      Int     @default(0)       // 间隔天数
  repetitions   Int     @default(0)       // 复习次数
  nextReviewAt  DateTime @default(now())  // 下次复习时间
  lastReviewAt  DateTime?                  // 上次复习时间

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  reviewLogs    ReviewLog[]

ReviewLog
  id            String @id @default(cuid())
  cardId        String
  card          Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
  userId        String
  user          User @relation(fields: [userId], references: [id])
  quality       Int        // 0-5 质量评分
  ease          Float      // 当时的 ease
  interval      Int        // 当时的 interval
  reviewedAt    DateTime @default(now())

StudySession
  id            String @id @default(cuid())
  userId        String
  user          User @relation(fields: [userId], references: [id])
  deckId        String?
  cardsStudied  Int
  correctCount  Int
  duration      Int?       // 时长（秒）
  startedAt     DateTime @default(now())
  endedAt       DateTime?
```

### SM-2 间隔重复算法

```
复习时用户对卡片打分:
  Again (1)   → 完全忘了，重置
  Hard (2)    → 想起来了但很困难
  Good (3)    → 正常记住
  Easy (4)    → 非常轻松

算法逻辑:
  if quality < 3:
    repetitions = 0
    interval = 1
  else:
    if repetitions == 0:
      interval = 1
    elif repetitions == 1:
      interval = 6
    else:
      interval = Math.round(interval * ease)

  ease = Math.max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  nextReviewAt = now + interval 天
```

---

## 5. 目录结构

```
cardwise/
├── prisma/
│   └── schema.prisma            # 数据库模型
├── public/
│   ├── favicon.ico
│   └── og-image.png
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # Landing page
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx       # Dashboard 布局（侧边栏 + 内容）
│   │   │   ├── page.tsx         # 仪表盘主页（热力图 + 统计）
│   │   │   └── decks/
│   │   │       ├── page.tsx     # 卡组列表
│   │   │       ├── [deckId]/
│   │   │       │   ├── page.tsx        # 卡组详情 / 卡片列表
│   │   │       │   └── study/
│   │   │       │       └── page.tsx    # 学习模式
│   │   │       └── new/
│   │   │           └── page.tsx        # 新建卡组
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── decks/
│   │       │   ├── route.ts           # GET/POST decks
│   │       │   └── [id]/
│   │       │       └── route.ts       # PUT/DELETE deck
│   │       ├── cards/
│   │       │   ├── route.ts           # GET/POST cards
│   │       │   ├── [id]/
│   │       │   │   └── route.ts       # PUT/DELETE card
│   │       │   └── review/
│   │       │       └── route.ts       # POST 提交复习评分
│   │       └── ai/
│   │           ├── generate/
│   │           │   └── route.ts       # POST AI 生成卡片
│   │           └── parse-url/
│   │               └── route.ts       # POST 解析 URL 内容
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 组件
│   │   ├── dashboard/
│   │   │   ├── study-heatmap.tsx
│   │   │   ├── progress-chart.tsx
│   │   │   └── stats-cards.tsx
│   │   ├── decks/
│   │   │   ├── deck-card.tsx    # 卡组卡片组件
│   │   │   ├── deck-form.tsx
│   │   │   └── deck-list.tsx
│   │   ├── cards/
│   │   │   ├── flashcard.tsx    # 翻转卡片组件
│   │   │   ├── card-form.tsx
│   │   │   ├── card-list.tsx
│   │   │   └── ai-generator.tsx # AI 生成器表单
│   │   ├── study/
│   │   │   ├── study-view.tsx   # 学习模式主视图
│   │   │   └── review-buttons.tsx # Again/Hard/Good/Easy
│   │   └── shared/
│   │       ├── navbar.tsx
│   │       ├── sidebar.tsx
│   │       └── theme-toggle.tsx
│   ├── lib/
│   │   ├── prisma.ts            # Prisma 客户端
│   │   ├── auth.ts              # NextAuth 配置
│   │   └── sm2.ts               # SM-2 算法实现
│   ├── actions/                  # Server Actions
│   │   ├── deck-actions.ts
│   │   ├── card-actions.ts
│   │   └── study-actions.ts
│   └── types/
│       └── index.ts
├── .env.local
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. 四周开发计划

### Week 1：基础架构 + 认证 + Deck/Card CRUD

| 天 | 任务 | 产出 |
|----|------|------|
| Day 1 | 项目初始化，配置 Next.js + Tailwind + Prisma + 数据库 | 项目骨架跑通 |
| Day 2 | NextAuth 配置（Credentials + Google） | 注册/登录/登出流程 |
| Day 3 | Deck CRUD（Server Actions + 页面） | 可以创建/编辑/删除卡组 |
| Day 4 | Card CRUD（表单、列表、富文本） | 可以在卡组内管理卡片 |
| Day 5 | 卡片列表页 + 卡片编辑器优化 | 可以浏览和搜索卡片 |
| Day 6 | UI 打磨、响应式布局、细节修复 | 页面美观、移动端可用 |
| Day 7 | **缓冲日** / 补前面的坑 | — |

### Week 2：学习模式 + SM-2 算法 + 基础仪表盘

| 天 | 任务 | 产出 |
|----|------|------|
| Day 8 | 学习模式 UI（卡片翻转动画） | 卡片翻转效果 |
| Day 9 | SM-2 算法实现 + ReviewLog | 复习后自动计算下次时间 |
| Day 10 | 复习按钮（Again/Hard/Good/Easy）+ 连击动画 | 完整的复习交互 |
| Day 11 | StudySession 记录 + 学习流程闭环 | 开始→复习→结束→统计 |
| Day 12 | Dashboard 页（待复习数、热力图基础版） | 仪表盘能看数据 |
| Day 13 | 进度图表（Recharts） | 可视化曲线 |
| Day 14 | **缓冲日** / 修复 bug / 测试 | — |

### Week 3：AI 集成（核心差异化）

| 天 | 任务 | 产出 |
|----|------|------|
| Day 15 | 配置 AI API + Vercel AI SDK | AI 调用链路通 |
| Day 16 | 文本 → AI 生成卡片（Prompt 工程） | 粘贴文本，AI 返回多张卡片 |
| Day 17 | AI 生成结果预览/编辑/保存界面 | AI 生成后的编辑流程 |
| Day 18 | URL 抓取 → AI 生成（后端 fetch + AI） | 输入链接即可生成卡片 |
| Day 19 | PDF 上传 → AI 生成 | 支持 PDF 解析和生成 |
| Day 20 | AI 功能缺陷打磨 + 错误处理 | 鲁棒性提升 |
| Day 21 | **缓冲日** / 综合修复 | — |

### Week 4：打磨 + 部署 + 作品展示准备

| 天 | 任务 | 产出 |
|----|------|------|
| Day 22 | 全局 UI 打磨（空状态、加载态、错误态） | 视觉体验提升 |
| Day 23 | 热力图完善 + 数据可视化增强 | GitHub 风格热力图 |
| Day 24 | 搜索引擎优化 + Open Graph + 性能优化 | 性能达标 |
| Day 25 | 部署到 Vercel（域名、环境变量、数据库） | 线上可用 |
| Day 26 | 写 README / 项目介绍 / Demo 视频脚本 | 项目呈现材料 |
| Day 27 | 准备面试话术：架构决策、技术选择、遇到的坑 | 面试准备 |
| Day 28 | 最后测试 + 修复 + 录制 Dem | 项目完美收尾 |

---

## 7. 面试亮点清单

这个项目可以用来展示的能力：

| 能力 | 体现在 |
|------|--------|
| **全栈能力** | Next.js App Router + Prisma + PostgreSQL 完整链路 |
| **交互设计** | 卡片翻转动画、拖拽排序、热力图 |
| **算法理解** | 自己实现 SM-2 间隔重复算法 |
| **AI 整合** | 多源输入（文本/URL/PDF）→ AI 生成结构性内容 |
| **产品思维** | 思考了 MVP → 扩展的迭代路线 |
| **工程规范** | TypeScript、Prisma Schema、Server Actions、API 路由 |

---

## 8. 推荐工具链

```
代码编写：       Cursor (AI 辅助编码)
AI 对话：       Claude (架构设计、Debug、Prompt 工程)
UI 开发：       shadcn/ui 组件库（开箱即用、美观）
数据库：        Supabase (免费 PostgreSQL + 后台界面)
部署：          Vercel (一键部署 Next.js)
版本控制：      GitHub (免费私有仓库)
项目管理：      GitHub Projects / Linear
设计参考：      Linear 的 UI 风格（简洁、深色模式友好）
```
