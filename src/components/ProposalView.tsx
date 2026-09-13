import { useState } from 'react'
import type { Proposal } from '../data/proposals.ts'
import type { ScenePresentation } from '../scene/room.ts'
import PowerDetails from './PowerDetails.tsx'
import ProposalDetails from './ProposalDetails.tsx'
import ProposalSpecifications from './ProposalSpecifications.tsx'
import SceneViewer from './SceneViewer.tsx'
import '../inspection.css'

export default function ProposalView({ proposal }: { proposal: Proposal }) {
  const [presentation, setPresentation] =
    useState<ScenePresentation>('furniture')
  return (
    <>
      <div className="detail-layout">
        <SceneViewer
          proposal={proposal}
          presentation={presentation}
          onPresentationChange={setPresentation}
        />
        {presentation === 'electrical' ? (
          <PowerDetails />
        ) : (
          <ProposalDetails proposal={proposal} />
        )}
      </div>
      <ProposalSpecifications proposal={proposal} />
    </>
  )
}
