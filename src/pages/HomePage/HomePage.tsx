import PixelButton from '../../components/PixelButton'
import PixelPanel from '../../components/PixelPanel'
import './HomePage.css'

export interface HomePageProps {
  onStartSetup(): void
  onQuickStart(): void
}

function PixelKingIcon() {
  return (
    <svg
      viewBox="0 0 120 180"
      className="home-king-icon"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 0 h40 v20 h20 v20 h-10 v20 h20 l10 30 h-10 v30 h10 v40 h-100 v-40 h10 v-30 h-10 l10 -30 h20 v-20 h-10 v-20 h20 z"
        fill="#d9ad45"
        stroke="#8a6e2f"
        strokeWidth="3"
      />
      <path
        d="M35 110 h50 v40 h-50 z"
        fill="#b88a2d"
      />
      <circle cx="45" cy="55" r="5" fill="#3a2a0d" />
      <circle cx="75" cy="55" r="5" fill="#3a2a0d" />
    </svg>
  )
}

function CrownIcon() {
  return (
    <svg
      viewBox="0 0 48 40"
      className="home-banner-crown"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 32 h40 v6 h-40 z M4 32 l8 -28 l8 20 l8 -20 l8 20 l8 -20 v28 z"
        fill="#d9ad45"
        stroke="#8a6e2f"
        strokeWidth="2"
      />
    </svg>
  )
}

function CatIcon() {
  return (
    <svg
      viewBox="0 0 80 60"
      className="home-cat-icon"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 60 v-25 l-8 -15 l10 4 l8 -12 l8 12 l10 -4 l-8 15 v25 z"
        fill="#0b0d12"
      />
      <circle cx="30" cy="30" r="2" fill="#f2e7c9" />
      <circle cx="42" cy="30" r="2" fill="#f2e7c9" />
      <path
        d="M34 36 q4 4 8 0"
        fill="none"
        stroke="#f2e7c9"
        strokeWidth="1.5"
      />
      <path
        d="M48 48 q12 -4 16 -16"
        fill="none"
        stroke="#0b0d12"
        strokeWidth="4"
      />
    </svg>
  )
}

function MiniChessBoard() {
  const pieces = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜']
  const pawns = Array(8).fill('♟')
  const empty = Array(8).fill(null)
  const rows = [pieces, pawns, empty, empty, empty, empty, Array(8).fill('♙'), ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']]

  return (
    <div className="home-mini-board">
      {rows.map((row, r) =>
        row.map((piece, c) => {
          const isLight = (r + c) % 2 === 0
          return (
            <div
              key={`${r}-${c}`}
              className={`home-mini-square ${isLight ? 'home-mini-square--light' : 'home-mini-square--dark'}`}
            >
              {piece}
            </div>
          )
        }),
      )}
    </div>
  )
}

export default function HomePage({ onStartSetup, onQuickStart }: HomePageProps) {
  return (
    <div className="home-page">
      <main className="home-content">
        <section className="home-left">
          <div className="home-king" aria-hidden="true">
            <PixelKingIcon />
          </div>

          <div className="home-brand">
            <h1 className="home-title">CHESSFORGE</h1>
            <p className="home-subtitle">PLUGIN-DRIVEN PIXEL CHESS</p>
            <p className="home-tagline">用插件，打造属于你的棋局。</p>
          </div>

          <nav className="home-menu" aria-label="主菜单">
            <PixelButton
              variant="primary"
              onClick={onStartSetup}
              className="home-menu-btn home-menu-btn--cta"
            >
              开始游戏
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={onQuickStart}
              className="home-menu-btn"
            >
              快速开始
            </PixelButton>
            <PixelButton variant="secondary" className="home-menu-btn" disabled>
              插件说明
            </PixelButton>
            <PixelButton variant="secondary" className="home-menu-btn" disabled>
              设置
            </PixelButton>
            <PixelButton variant="secondary" className="home-menu-btn" disabled>
              关于
            </PixelButton>
          </nav>
        </section>

        <aside className="home-banner" aria-hidden="true">
          <PixelPanel className="home-banner-panel">
            <CrownIcon />
            <span className="home-banner-text">GOOD GAMES BUILD BETTER THINKERS</span>
          </PixelPanel>
        </aside>
      </main>

      <div className="home-scene" aria-hidden="true">
        <div className="home-books">
          <div className="home-book">RULES</div>
          <div className="home-book">PLAYERS</div>
          <div className="home-book">BOARDS</div>
          <div className="home-book">THEMES</div>
          <div className="home-book">STORAGE</div>
        </div>

        <div className="home-candle">
          <div className="home-candle-body" />
          <div className="home-candle-flame" />
        </div>

        <div className="home-chest">
          <CatIcon />
        </div>

        <MiniChessBoard />
      </div>

      <footer className="home-footer">
        A MODDABLE CHESS FRAMEWORK FOR CREATORS, PLAYERS AND DREAMERS.
      </footer>
    </div>
  )
}
