import { useEffect, useRef, useSyncExternalStore } from 'react'
import Icon from './components/Icon.tsx'
import ProposalGallery from './components/ProposalGallery.tsx'
import ProposalView from './components/ProposalView.tsx'
import { getProposal, PROPOSALS } from './data/proposals.ts'
import './App.css'
import './pages.css'

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function App() {
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => '',
  )
  const proposal = getProposal(/^#\/proposal\/([^/]+)$/.exec(hash)?.[1])
  const main = useRef<HTMLElement | null>(null)
  const lastProposal = useRef<string | undefined>(undefined)

  useEffect(() => {
    document.title = proposal
      ? `${proposal.name} · 空间方案`
      : '空间方案 · 双人办公与公路车收纳'
    const returningTo = !proposal ? lastProposal.current : undefined
    const frame = requestAnimationFrame(() => {
      if (returningTo) {
        document
          .querySelector<HTMLAnchorElement>(`[data-proposal="${returningTo}"]`)
          ?.focus()
      } else if (proposal) {
        window.scrollTo({ top: 0, behavior: 'instant' })
        main.current?.focus({ preventScroll: true })
      }
    })
    lastProposal.current = proposal?.id
    return () => cancelAnimationFrame(frame)
  }, [proposal])

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          main.current?.focus()
        }}
      >
        跳至主要内容
      </a>
      <header className="site-header">
        <a className="site-brand" href="#/" aria-label="空间方案首页">
          <span className="brand-mark">
            <Icon name="cube" />
          </span>
          <span>
            空间方案<span className="brand-subtitle">双人办公与公路车收纳</span>
          </span>
        </a>
        <nav className="site-nav" aria-label="主导航">
          <a href="#/" aria-current={proposal ? undefined : 'page'}>
            方案总览
          </a>
          <a href="/room-layout.html" target="_blank" rel="noreferrer">
            <Icon name="floorplan" />
            房间户型
            <Icon name="arrow-right" className="external-arrow" />
          </a>
        </nav>
      </header>
      <main
        ref={main}
        id="main-content"
        tabIndex={-1}
        className={`app-shell ${proposal ? 'detail-page' : 'gallery-page'}`}
      >
        {proposal ? (
          <>
            <div className="breadcrumb">
              <a href="#/" aria-label="返回方案总览">
                <Icon name="arrow-left" />
                全部方案
              </a>
              <span>/</span>
              <span>方案 {proposal.number}</span>
            </div>
            <header className="detail-page-heading">
              <div>
                <p className="eyebrow">
                  方案 {proposal.number} · {proposal.theme}
                </p>
                <h1>{proposal.name}</h1>
              </div>
              <nav className="proposal-switcher" aria-label="切换设计方案">
                {PROPOSALS.map((item) => (
                  <a
                    key={item.id}
                    href={`#/proposal/${item.id}`}
                    aria-current={proposal.id === item.id ? 'page' : undefined}
                  >
                    <span className="mono">{item.number}</span>
                    {item.shortName}
                  </a>
                ))}
              </nav>
            </header>
            <ProposalView key={proposal.id} proposal={proposal} />
          </>
        ) : (
          <ProposalGallery />
        )}
      </main>
      <footer className="site-footer">
        <p>仅作空间与布局参考，非施工图纸</p>
        <p>
          <span className="footer-dot" />
          标准单位 cm<span className="footer-separator">/</span>等比例三维建模
        </p>
      </footer>
    </>
  )
}

export default App
