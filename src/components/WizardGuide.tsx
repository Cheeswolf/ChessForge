import type { GameStatus as GameStatusModel, MoveRecord } from '../core/types'
import PixelSprite from './pixel/PixelSprite'

/*
 * Blue pixel wizard — the match guide NPC. Character-map art: hat with a
 * gold star, face, beard, robe. `m`/`l` blues, `w` gold, `f` skin,
 * `e` eyes, `b` beard, `s` hem shadow. The auto-outline pass adds the
 * crisp 1px dark edge.
 */
const WIZARD_ART: readonly string[] = [
  '.......mm.......',
  '......mllm......',
  '......mllm......',
  '.....mllllm.....',
  '.....mlwllm.....',
  '....mllllllm....',
  '....mllllllm....',
  '...mllllllllm...',
  '..mmmmmmmmmmmm..',
  '....ffffffff....',
  '....feffffef....',
  '....ffffffff....',
  '....bbbbbbbb....',
  '...bbbbbbbbbb...',
  '...bbbbbbbbbb...',
  '....bbbbbbbb....',
  '.....bbbbbb.....',
  '.....bbbbbb.....',
  '....mmmmmmmm....',
  '...mmmmmmmmmm...',
  '...mllmmmmllm...',
  '...mmmmmmmmmm...',
  '..mmmmmmmmmmmm..',
  '..ssssssssssss..',
]

const WIZARD_PALETTE: Record<string, string> = {
  m: '#3d5a99',
  l: '#8fb2ea',
  w: '#ffd866',
  f: '#f2cf9e',
  e: '#101827',
  b: '#e9e4d4',
  s: '#22325a',
}

export interface WizardGuideProps {
  status: GameStatusModel
  history: MoveRecord[]
}

/**
 * State-aware flavor line for the wizard's speech bubble.
 */
export function wizardMessage(
  status: GameStatusModel,
  history: MoveRecord[],
): string {
  if (status.phase === 'checkmate') {
    return status.winner === 'white'
      ? '白方获胜！精彩的一局。'
      : '黑方获胜！精彩的一局。'
  }
  if (status.phase === 'draw') {
    return '握手言和，势均力敌。'
  }
  if (status.inCheck) {
    return '将军！小心应对。'
  }
  if (history.length === 0) {
    return '让我们开始吧！每一步，都是新的可能。'
  }
  return `上一步：${history[history.length - 1].san}，继续加油。`
}

/**
 * Presentational: the wizard NPC panel — sprite + speech bubble.
 */
export default function WizardGuide({ status, history }: WizardGuideProps) {
  return (
    <section className="wizard-guide" data-testid="wizard-guide" aria-label="向导">
      <PixelSprite
        art={WIZARD_ART}
        palette={WIZARD_PALETTE}
        outline="#0b1220"
        className="wizard-guide__sprite"
        title="像素法师向导"
      />
      <p className="wizard-guide__bubble">{wizardMessage(status, history)}</p>
    </section>
  )
}
