import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDueCards, getDecks } from '@/actions'
import StudyView from '@/components/study/StudyView'

export default async function StudyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const [dueCards, decks] = await Promise.all([
    getDueCards(),
    getDecks(),
  ])

  return (
    <div className="space-y-6">
      <StudyView cards={dueCards} decks={decks} />
    </div>
  )
}
