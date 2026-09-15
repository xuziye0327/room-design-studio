import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import GitHub from '@mui/icons-material/GitHub'
import GridView from '@mui/icons-material/GridView'
import ViewInAr from '@mui/icons-material/ViewInAr'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useSyncExternalStore } from 'react'
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
      : '空间方案 · 双人办公空间'
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
      <Link
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          main.current?.focus()
        }}
      >
        跳至主要内容
      </Link>
      <header className="site-header">
        <Link
          className="site-brand"
          href="#/"
          aria-label="空间方案首页"
          underline="none"
        >
          <span className="brand-mark">
            <ViewInAr className="icon" />
          </span>
          <span>
            空间方案<span className="brand-subtitle">双人办公空间</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="主导航">
          <Link href="#/" aria-current={proposal ? undefined : 'page'}>
            方案总览
          </Link>
          <Link href="/room-layout.html" target="_blank" rel="noreferrer">
            <GridView className="icon" />
            房间户型
            <ArrowForward className="icon external-arrow" />
          </Link>
          <Link
            href="https://github.com/xuziye0327/room-design-studio"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub 项目仓库（在新标签页打开）"
          >
            <GitHub className="icon" />
            GitHub
            <ArrowForward className="icon external-arrow" />
          </Link>
        </nav>
      </header>
      <Box
        component="main"
        ref={main}
        id="main-content"
        tabIndex={-1}
        className={`app-shell ${proposal ? 'detail-page' : 'gallery-page'}`}
      >
        {proposal ? (
          <>
            <div className="breadcrumb">
              <Link href="#/" aria-label="返回方案总览">
                <ArrowBack className="icon" />
                全部方案
              </Link>
              <span>/</span>
              <span>方案 {proposal.number}</span>
            </div>
            <header className="detail-page-heading">
              <div>
                <Typography component="p" className="eyebrow">
                  方案 {proposal.number} · {proposal.theme}
                </Typography>
                <Typography component="h1" variant="h1">
                  {proposal.name}
                </Typography>
              </div>
              <nav className="proposal-switcher" aria-label="切换设计方案">
                {PROPOSALS.map((item) => (
                  <Button
                    key={item.id}
                    href={`#/proposal/${item.id}`}
                    variant={proposal.id === item.id ? 'contained' : 'text'}
                    aria-current={proposal.id === item.id ? 'page' : undefined}
                  >
                    <span className="mono">{item.number}</span>
                    {item.shortName}
                  </Button>
                ))}
              </nav>
            </header>
            <ProposalView key={proposal.id} proposal={proposal} />
          </>
        ) : (
          <ProposalGallery />
        )}
      </Box>
      <footer className="site-footer">
        <Typography variant="inherit" component="p">
          仅作空间与布局参考，非施工图纸
        </Typography>
        <Typography variant="inherit" component="p">
          <span className="footer-dot" />
          标准单位 cm<span className="footer-separator">/</span>等比例三维建模
        </Typography>
      </footer>
    </>
  )
}

export default App
