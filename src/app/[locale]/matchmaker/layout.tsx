import { LockProvider } from '@/lib/matchmaker/lockContext'

export default function MatchmakerLayout({ children }: { children: React.ReactNode }) {
  return <LockProvider>{children}</LockProvider>
}
