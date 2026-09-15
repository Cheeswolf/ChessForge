import PixelButton from '../../components/PixelButton'
import PixelPanel from '../../components/PixelPanel'
import PixelSprite from '../../components/pixel/PixelSprite'
import {
  CAT_ART,
  CAT_PALETTE,
  CHEVRON_ART,
  CLOUD_A_ART,
  CLOUD_B_ART,
  CLOUD_PALETTE,
  CROWN_ART,
  CROWN_PALETTE,
  FLAME_ART,
  FLAME_PALETTE,
  KING_ART,
  KING_OUTLINE,
  KING_PALETTE,
  MINI_BLACK_OUTLINE,
  MINI_BLACK_PIECE,
  MINI_PIECE_ART,
  MINI_WHITE_OUTLINE,
  MINI_WHITE_PIECE,
  MOON_ART,
  MOON_PALETTE,
  type MiniPieceType,
} from '../../components/pixel/sprites'
import './HomePage.css'

export interface HomePageProps {
  onStartSetup(): void
  onQuickStart(): void
}

/** Distant castle silhouette built from integer rects (two depth layers). */
function CastleSilhouette() {
  const far = '#141f3a'
  const near = '#0c1322'
  const windowLight = '#ffae34'

  return (
    <svg
      className="home-castle"
      viewBox="0 0 400 120"
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {/* far layer */}
      <rect x="30" y="40" width="28" height="80" fill={far} />
      <rect x="26" y="36" width="8" height="6" fill={far} />
      <rect x="40" y="36" width="8" height="6" fill={far} />
      <rect x="52" y="36" width="8" height="6" fill={far} />
      <rect x="150" y="24" width="34" height="96" fill={far} />
      <rect x="146" y="18" width="8" height="8" fill={far} />
      <rect x="160" y="18" width="8" height="8" fill={far} />
      <rect x="174" y="18" width="8" height="8" fill={far} />
      <rect x="260" y="48" width="24" height="72" fill={far} />
      <rect x="256" y="42" width="8" height="6" fill={far} />
      <rect x="276" y="42" width="8" height="6" fill={far} />
      <rect x="340" y="32" width="30" height="88" fill={far} />
      <rect x="336" y="26" width="8" height="8" fill={far} />
      <rect x="350" y="26" width="8" height="8" fill={far} />
      <rect x="362" y="26" width="8" height="8" fill={far} />
      <rect x="0" y="92" width="400" height="28" fill={far} />

      {/* near layer */}
      <rect x="80" y="56" width="30" height="64" fill={near} />
      <rect x="76" y="50" width="8" height="8" fill={near} />
      <rect x="90" y="50" width="8" height="8" fill={near} />
      <rect x="104" y="50" width="8" height="8" fill={near} />
      <rect x="200" y="40" width="38" height="80" fill={near} />
      <rect x="196" y="32" width="10" height="10" fill={near} />
      <rect x="212" y="32" width="10" height="10" fill={near} />
      <rect x="228" y="32" width="10" height="10" fill={near} />
      <rect x="300" y="64" width="26" height="56" fill={near} />
      <rect x="296" y="58" width="8" height="8" fill={near} />
      <rect x="310" y="58" width="8" height="8" fill={near} />
      <rect x="0" y="100" width="400" height="20" fill={near} />

      {/* warm windows */}
      <rect x="90" y="72" width="4" height="6" fill={windowLight} />
      <rect x="162" y="44" width="4" height="6" fill={windowLight} />
      <rect x="170" y="60" width="4" height="6" fill={windowLight} />
      <rect x="214" y="56" width="4" height="6" fill={windowLight} />
      <rect x="222" y="76" width="4" height="6" fill={windowLight} />
      <rect x="310" y="80" width="4" height="6" fill={windowLight} />
      <rect x="350" y="48" width="4" height="6" fill={windowLight} />
    </svg>
  )
}

interface MiniPlacedPiece {
  type: MiniPieceType
  color: 'white' | 'black'
}

/**
 * Decorative mid-game position for the scene board. Rendered with pixel
 * silhouettes only — no unicode chess glyphs.
 */
const MINI_BOARD_POSITION: Array<Array<MiniPlacedPiece | null>> = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    null,
    { type: 'rook', color: 'black' },
  ],
  [
    { type: 'pawn', color: 'black' },
    { type: 'pawn', color: 'black' },
    { type: 'pawn', color: 'black' },
    { type: 'pawn', color: 'black' },
    null,
    { type: 'pawn', color: 'black' },
    { type: 'pawn', color: 'black' },
    { type: 'pawn', color: 'black' },
  ],
  [null, null, null, null, null, null, { type: 'knight', color: 'black' }, null],
  [null, null, null, null, { type: 'pawn', color: 'black' }, null, null, null],
  [null, null, null, null, { type: 'pawn', color: 'white' }, null, null, null],
  [null, null, null, null, null, { type: 'knight', color: 'white' }, null, null],
  [
    { type: 'pawn', color: 'white' },
    { type: 'pawn', color: 'white' },
    { type: 'pawn', color: 'white' },
    { type: 'pawn', color: 'white' },
    null,
    { type: 'pawn', color: 'white' },
    { type: 'pawn', color: 'white' },
    { type: 'pawn', color: 'white' },
  ],
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    null,
    { type: 'rook', color: 'white' },
  ],
]

function MiniChessBoard() {
  return (
    <div className="home-mini-board">
      {MINI_BOARD_POSITION.map((row, r) =>
        row.map((piece, c) => {
          const isLight = (r + c) % 2 === 0
          return (
            <div
              key={`${r}-${c}`}
              className={`home-mini-square ${isLight ? 'home-mini-square--light' : 'home-mini-square--dark'}`}
            >
              {piece && (
                <PixelSprite
                  art={MINI_PIECE_ART[piece.type]}
                  palette={
                    piece.color === 'white' ? MINI_WHITE_PIECE : MINI_BLACK_PIECE
                  }
                  outline={
                    piece.color === 'white'
                      ? MINI_WHITE_OUTLINE
                      : MINI_BLACK_OUTLINE
                  }
                  className="home-mini-piece"
                />
              )}
            </div>
          )
        }),
      )}
    </div>
  )
}

const BOOK_TITLES = ['RULES', 'PLAYERS', 'BOARDS', 'THEMES', 'STORAGE']

export default function HomePage({ onStartSetup, onQuickStart }: HomePageProps) {
  return (
    <div className="home-page">
      <div className="home-sky" aria-hidden="true">
        <div className="home-stars home-stars--a" />
        <div className="home-stars home-stars--b" />
        <PixelSprite
          art={MOON_ART}
          palette={MOON_PALETTE}
          className="home-moon"
        />
        <PixelSprite
          art={CLOUD_A_ART}
          palette={CLOUD_PALETTE}
          className="home-cloud home-cloud--a"
        />
        <PixelSprite
          art={CLOUD_B_ART}
          palette={CLOUD_PALETTE}
          className="home-cloud home-cloud--b"
        />
        <PixelSprite
          art={CLOUD_A_ART}
          palette={CLOUD_PALETTE}
          className="home-cloud home-cloud--c"
        />
        <CastleSilhouette />
        <div className="home-horizon-glow" />
      </div>

      <main className="home-content">
        <section className="home-left">
          <PixelSprite
            art={KING_ART}
            palette={KING_PALETTE}
            outline={KING_OUTLINE}
            className="home-king-icon"
          />

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
              <span>开始游戏</span>
              <PixelSprite
                art={CHEVRON_ART}
                palette={{ m: 'currentColor' }}
                className="home-menu-chevron"
              />
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
            <PixelSprite
              art={CROWN_ART}
              palette={CROWN_PALETTE}
              outline="#8a6e2f"
              className="home-banner-crown"
            />
            <span className="home-banner-text">
              GOOD GAMES BUILD BETTER THINKERS
            </span>
          </PixelPanel>
        </aside>
      </main>

      <div className="home-scene" aria-hidden="true">
        <div className="home-scene-light" />

        <div className="home-books">
          {BOOK_TITLES.map((title, index) => (
            <div key={title} className={`home-book home-book--${index + 1}`}>
              <span className="home-book__label">{title}</span>
            </div>
          ))}
        </div>

        <div className="home-candle">
          <div className="home-candle-glow" />
          <PixelSprite
            art={FLAME_ART}
            palette={FLAME_PALETTE}
            className="home-candle-flame"
          />
          <div className="home-candle-wick" />
          <div className="home-candle-body">
            <div className="home-candle-drip" />
          </div>
          <div className="home-candle-holder" />
        </div>

        <div className="home-chest">
          <PixelSprite
            art={CAT_ART}
            palette={CAT_PALETTE}
            outline="#05070c"
            className="home-cat-icon"
          />
          <div className="home-chest-lid" />
          <div className="home-chest-body">
            <div className="home-chest-band home-chest-band--left" />
            <div className="home-chest-band home-chest-band--right" />
            <div className="home-chest-lock" />
          </div>
        </div>

        <MiniChessBoard />
      </div>

      <footer className="home-footer">
        A MODDABLE CHESS FRAMEWORK FOR CREATORS, PLAYERS AND DREAMERS.
      </footer>
    </div>
  )
}
