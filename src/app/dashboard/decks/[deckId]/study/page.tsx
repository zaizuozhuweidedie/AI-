import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDueCards, getDeck } from '@/actions'
import StudyView from '@/components/study/StudyView'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: { deckId: string }
}

export default async function DeckStudyPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  let deck
  try {
    deck = await getDeck(params.deckId)
  } catch {
    notFound()
  }

  const dueCards = await getDueCards(params.deckId)

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/decks/${params.deckId}`}
        className="text-sm text-slate-500 hover:text-slate-300 transition inline-block"
      >
        ← 返回 {deck.name}
      </Link>
      <StudyView cards={dueCards} />
    </div>
  )
}
