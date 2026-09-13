import { useState } from 'react'
import SceneViewer from './components/SceneViewer.tsx'
import { PROPOSALS } from './data/proposals.ts'
import './App.css'

function App() {
  const [proposal, setProposal] = useState(PROPOSALS[0])
  return (
    <main className="app-shell">
      <header className="page-heading">
        <p className="eyebrow">双人办公与公路车收纳</p>
        <h1>空间方案</h1>
      </header>
      <nav className="proposal-nav" aria-label="设计方案">
        {PROPOSALS.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={proposal.id === item.id}
            onClick={() => setProposal(item)}
          >
            {item.number} / {item.name}
          </button>
        ))}
      </nav>
      <SceneViewer key={proposal.id} proposal={proposal} />
    </main>
  )
}

export default App
