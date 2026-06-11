import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">C</div>
            <span className="text-xl font-bold">CardWise</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-sm text-slate-300 hover:text-white transition">登录</Link>
            <Link
              href="/auth/register"
              className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-sm font-semibold transition"
            >
              免费注册
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm text-indigo-300 mb-8">
          🧠 AI 驱动的智能学习工具
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
          用 AI 生成卡片
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            科学记忆一切
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          粘贴笔记、文章或链接，AI 自动生成 Flashcards。
          <br />
          配合间隔重复算法，让你记得更牢、学得更快。
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl font-semibold text-lg transition shadow-lg shadow-indigo-500/25"
          >
            免费开始学习 →
          </Link>
        </div>

        {/* Preview Card */}
        <div className="mt-20 max-w-md mx-auto">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-6xl mb-4">🧠</div>
            <p className="text-lg font-medium mb-2">什么是间隔重复？</p>
            <p className="text-sm text-slate-400">
              间隔重复是一种基于遗忘曲线的学习方法，通过在最佳时间点复习，让你的记忆效率最大化。
            </p>
            <div className="mt-6 flex justify-center gap-2">
              {['Again', 'Hard', 'Good', 'Easy'].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">为什么选择 CardWise？</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              emoji: '🤖',
              title: 'AI 自动生成',
              desc: '粘贴文本、文章链接甚至 PDF，AI 自动提取知识点并生成 Flashcards。再也不用手动一张张做卡片。',
            },
            {
              emoji: '📐',
              title: '科学记忆算法',
              desc: '基于 SM-2 间隔重复算法（Anki 同款），在最佳时间点提醒你复习，记忆效率提高 3 倍。',
            },
            {
              emoji: '📊',
              title: '学习数据可视化',
              desc: '热力图、掌握曲线、复习统计——清晰看到自己的进步，保持学习动力。',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <div className="text-3xl mb-5">{feature.emoji}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        CardWise &mdash; AI 学习助手
      </footer>
    </div>
  )
}
