import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 text-primary">
          AI Tool Match
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A gameful, live, multi-player simulation where attendees act as an AI agent and pick the right tool for the job.
        </p>
        
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-2xl font-semibold mb-4">For Players</h2>
            <p className="text-muted-foreground mb-4">
              Join the game with a codename and start picking the best AI tools for different scenarios!
            </p>
            <Link href="/join" className="btn-primary inline-block">
              Join Game
            </Link>
          </div>
          
          <div className="card p-6">
            <h2 className="text-2xl font-semibold mb-4">For Facilitators</h2>
            <p className="text-muted-foreground mb-4">
              Monitor the game progress, view live leaderboards, and manage the session.
            </p>
            <Link href="/admin" className="btn-secondary inline-block">
              Admin Dashboard
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            View <Link href="/leaderboard" className="underline hover:text-foreground">Live Leaderboard</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
