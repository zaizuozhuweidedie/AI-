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
  const deepseekKey = process.env.DEEPSEEK_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  const apiKey = deepseekKey || anthropicKey || openaiKey
  if (!apiKey) {
    return NextResponse.json({
      cards: [
        { type: 'qa', front: '什么是间隔重复？', back: '间隔重复是一种在逐渐增加的时间间隔内复习信息的技术，基于遗忘曲线原理，能显著提高长期记忆 retention。' },
        { type: 'qa', front: 'SM-2 算法的四个评分等级是什么？', back: 'Again (1) - 完全忘了\nHard (2) - 想起来了但很困难\nGood (3) - 正常记住\nEasy (4) - 非常轻松' },
        { type: 'judge', front: '间隔重复和死记硬背的效果差不多。', back: '错误。间隔重复通过合理安排复习时间，比死记硬背的记忆效率高得多。' },
        { type: 'blank', front: 'SM-2 算法中，如果用户选择 "Again"，卡片间隔会__。', back: '重置为 1 天' },
      ],
    })
  }

  // 截取内容，避免超出 token 限制
  const trimmedContent = content.slice(0, 5000)

  const systemPrompt = `你是一个专业的 Flashcard 生成助手。你的任务是根据学习材料生成 Flashcards，帮助用户高效记忆。

生成要求：
1. 深入理解材料，提取最重要的知识点
2. 每种卡片类型都要抓住核心概念，答案要准确、简洁、有信息量
3. 总共生成 6-12 张卡片（每种类型至少 2 张），根据材料长度灵活调整
4. 用 JSON 格式返回，格式：{"cards":[{"type":"qa","front":"问题","back":"答案"}, ...]}

卡片类型说明：
- "qa" = 问答卡：正面是问题，反面是答案。用于考察概念理解、定义、原理等。
- "judge" = 判断题：正面是一个陈述句（可以是正确或错误的），反面写"正确"或"错误"并附上解释。
- "blank" = 填空题：正面是一句带空白（用____表示）的句子，反面是空白处应填的内容。适用于术语记忆、关键数据等。`

  const userPrompt = `请根据以下学习材料生成 Flashcards：

${trimmedContent}

请严格按照 JSON 格式输出，只输出 JSON 对象本身，不要加其他说明文字。`

  try {
    let cards: { type: string; front: string; back: string }[] = []

    if (process.env.DEEPSEEK_API_KEY) {
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 4096,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      })

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''
      const jsonMatch = text.match(/\{[\s\S]*"cards"[\s\S]*\}/)
      if (jsonMatch) {
        cards = JSON.parse(jsonMatch[0]).cards
      }
    } else if (process.env.ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
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
          max_tokens: 4096,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
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
      return NextResponse.json({
        cards: [
          { type: 'qa', front: '未能从材料中提取到足够的知识点', back: '请尝试提供更多或更清晰的学习材料' },
          { type: 'qa', front: '第一次主要知识点是什么？', back: content.slice(0, 150) },
        ],
      })
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
