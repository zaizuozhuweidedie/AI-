import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

interface GenerateRequest {
  source: string
  sourceType: 'text' | 'url'
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  let body: GenerateRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '无效的请求格式' }, { status: 400 })
  }

  const { source, sourceType } = body
  if (!source?.trim()) {
    return NextResponse.json({ error: '请输入学习材料' }, { status: 400 })
  }

  // 如果 sourceType 是 url，先尝试抓取内容
  let content = source.trim()
  if (sourceType === 'url') {
    try {
      const fetchRes = await fetch(source)
      const html = await fetchRes.text()
      // 简单的 HTML 正文提取
      const textMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      if (textMatch) {
        content = textMatch[1]
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 8000)
      }
    } catch {
      content = source.trim().slice(0, 8000)
    }
  }

  // 调用 API
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      cards: [
        { front: '什么是间隔重复？', back: '间隔重复是一种在逐渐增加的时间间隔内复习信息的技术，基于遗忘曲线原理，能显著提高长期记忆 retention。' },
        { front: 'SM-2 算法的四个评分等级是什么？', back: 'Again (1) - 完全忘了\nHard (2) - 想起来了但很困难\nGood (3) - 正常记住\nEasy (4) - 非常轻松' },
        { front: '为什么 AI 生成卡片比手动制作更高效？', back: 'AI 可以快速提取文本中的关键知识点，自动生成结构化的问答对，节省大量手动整理和编写的时间。' },
      ],
    })
  }

  try {
    const prompt = `你是一个学习助手。请根据以下学习材料，生成多张 Flashcards（问答卡片）。
要求：
1. 每张卡片包含一个「问题」（front）和一个「答案」（back）
2. 问题应该抓住核心知识点，答案应该简洁准确
3. 生成 3-8 张卡片，不要太多
4. 用 JSON 格式返回，格式：{"cards":[{"front":"问题","back":"答案"}]}

学习材料：
${content.slice(0, 6000)}`

    let cards: { front: string; back: string }[] = []

    if (process.env.ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const jsonMatch = text.match(/\{[\s\S]*"cards"[\s\S]*\}/)
      if (jsonMatch) {
        cards = JSON.parse(jsonMatch[0]).cards
      }
    } else if (process.env.OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''
      const jsonMatch = text.match(/\{[\s\S]*"cards"[\s\S]*\}/)
      if (jsonMatch) {
        cards = JSON.parse(jsonMatch[0]).cards
      }
    }

    if (!cards || cards.length === 0) {
      // Fallback
      cards = [
        { front: '第一张卡片：主要知识点', back: content.slice(0, 200) },
        { front: '第二张卡片：关键概念', back: content.slice(200, 400) || '请重试生成更多卡片' },
      ]
    }

    return NextResponse.json({ cards })
  } catch (err) {
    console.error('AI generate error:', err)
    return NextResponse.json(
      { error: 'AI 生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
