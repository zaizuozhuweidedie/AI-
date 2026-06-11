import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDeck, getCards } from '@/actions'
import DeckActions from '@/components/decks/DeckActions'
import CardList from '@/components/cards/CardList'
import AIGenerator from '@/components/cards/AIGenerator'

interface Props {
  params: { deckId: string }
}

export default async function DeckPage({ params }: Props) {
  const deckId = params.deckId
  let deck, cards

  try {
    deck = await getDeck(deckId)
    cards = await getCards(deckId)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/decks"
            className="text-sm text-slate-500 hover:text-slate-300 transition mb-2 inline-block"
          >
            ← 返回卡组列表
          </Link>
          <h1 className="text-3xl font-bold text-white">{deck.name}</h1>
          {deck.description && (
            <p className="text-slate-400 mt-1">{deck.description}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">{deck._count.cards} 张卡片</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/decks/${deckId}/study`}
            className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white font-medium transition text-sm"
          >
            开始学习
          </Link>
          <DeckActions deckId={deckId} />
        </div>
      </div>

      {/* AI Generator */}
      <AIGenerator deckId={deckId} />

      {/* Cards */}
      <CardList cards={cards} deckId={deckId} />
    </div>
  )
}
