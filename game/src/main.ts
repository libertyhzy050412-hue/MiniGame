import './style.css'

import { computeHotspotNotePlacement } from './hotspotLayout'
import {
  noteDefinitions,
  sceneDefinitions,
  sequenceDefinitions,
  type DialogueLine,
  type SceneId,
  type SequenceId,
} from './narrativeData'
import { clearSavedState, createInitialSaveState, loadState, persistState, type SaveState } from './storage'
import { playClick, playOverlayMusic, playSceneMusic, playSfx, stopBgm } from './audio'
import {
  canAdvanceFromStudy,
  canFinishEnding,
  validateConstellationPlacement,
  validateLetterAssignments,
  validateRelicTeachings,
} from './validators'

type ViewMode = 'menu' | 'game'

interface DialogueOverlay {
  type: 'dialogue'
  title: string
  lines: DialogueLine[]
  index: number
  onClose?: {
    flags?: string[]
    goto?: SceneId
  }
}

interface NoteOverlay {
  type: 'note'
  title: string
  body: string
}

interface JournalOverlay {
  type: 'journal'
  selectedId?: string
}

interface StudyPuzzleOverlay {
  type: 'studyPuzzle'
  moves: string[]
  feedback?: string
}

interface RelicPuzzleOverlay {
  type: 'relicPuzzle'
  phase: 'teachings' | 'altar'
  teachingSelection: Record<string, string>
  altarSelection: Record<string, string>
  feedback?: string
}

interface RiddlePuzzleOverlay {
  type: 'riddlePuzzle'
  step: number
  feedback?: string
}

interface FirePuzzleOverlay {
  type: 'firePuzzle'
  heat: number
  air: number
  progress: number
  success?: boolean
  feedback?: string
}

interface LettersPuzzleOverlay {
  type: 'lettersPuzzle'
  selectedLetter?: string
  assignments: Record<string, string>
  feedback?: string
}

interface WoundedPuzzleOverlay {
  type: 'woundedPuzzle'
  found: string[]
  wrongIds: string[]
  feedback?: string
}

interface RescuePuzzleOverlay {
  type: 'rescuePuzzle'
  level: number
  player: { x: number; y: number }
  crates: Array<{ x: number; y: number }>
  villagers: Array<{ x: number; y: number }>
  rescued: number
  feedback?: string
}

interface SheepActor {
  id: number
  x: number
  y: number
  homeX: number
  homeY: number
  vx: number
  vy: number
}

interface SheepPuzzleOverlay {
  type: 'sheepPuzzle'
  remainingMs: number
  sheep: SheepActor[]
  capturedUntil: number[]  // timestamp (Date.now) when each sheep escapes the pen
  feedback?: string
}

interface JournalEntryDefinition {
  id: string
  flag: string
  title: string
  body: string
}

type OverlayState =
  | DialogueOverlay
  | NoteOverlay
  | JournalOverlay
  | StudyPuzzleOverlay
  | RelicPuzzleOverlay
  | RiddlePuzzleOverlay
  | FirePuzzleOverlay
  | LettersPuzzleOverlay
  | WoundedPuzzleOverlay
  | RescuePuzzleOverlay
  | SheepPuzzleOverlay

const appRoot = document.querySelector<HTMLDivElement>('#app')

if (!appRoot) {
  throw new Error('Missing app root')
}

const app = appRoot

function resolveAssetPath(path: string) {
  if (/^(data:|https?:)/.test(path)) {
    return path
  }

  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

function shuffle<T>(array: readonly T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const studyMoveOptions = [
  { id: 'queen', label: '白后逼近王侧' },
  { id: 'bishop', label: '白象封住退路' },
  { id: 'mate', label: '白后完成将杀' },
  { id: 'pawn', label: '边兵空走拖延' },
] as const

const teachingRows = [
  { slot: 'teaching1', text: '“不可跪拜那些像，也不可事奉它们……”' },
  { slot: 'teaching2', text: '“你要在米甸人身上报仇……”' },
  { slot: 'teaching3', text: '“三百人呐喊，使他们逃跑。”' },
  { slot: 'teaching4', text: '“凡能见火的，必过火洁净。”' },
] as const

const relicOptions = [
  { id: 'bari-idol', label: '金牛形巴力像' },
  { id: 'blood-spear', label: '米甸血矛' },
  { id: 'gold-breastplate', label: '祭司纯金胸牌' },
  { id: 'ram-horn', label: '基甸羊角号' },
] as const

const altarRows = [
  { slot: 'north', text: '正北位' },
  { slot: 'east', text: '正东位' },
  { slot: 'south', text: '正南位' },
  { slot: 'west', text: '正西位' },
] as const

const altarOptions = [
  { id: 'lamb', label: '羔羊' },
  { id: 'serpent', label: '蛇' },
  { id: 'eagle', label: '鹰' },
  { id: 'lion', label: '狮' },
] as const

const riddleQuestions = [
  {
    prompt: '是什么艳色诱人眼目，摘取便动真心？',
    correct: '夏娃的苹果',
    choices: ['夏娃的苹果', '山上的浆果', '主教花园的玫瑰'],
  },
  {
    prompt: '是什么利锋可破沉淤，矫健而辟新章？',
    correct: '沾血的长剑',
    choices: ['沾血的长剑', '田里的耕犁', '铁匠的重锤'],
  },
  {
    prompt: '是什么光彩引人心动，世人皆愿追逐？',
    correct: '闪耀的金币',
    choices: ['闪耀的金币', '头顶的星辰', '圣坛上的金杯'],
  },
] as const

const letterCards = [
  {
    id: 'letter1',
    title: '家书一',
    body: '亲爱的娜沙：我左肩受创，但尚能支撑。药很少，医生只草草包扎。',
  },
  {
    id: 'letter2',
    title: '家书二',
    body: '亲爱的妻儿：我年岁已老，头发尽数花白，只求战事早结，能卸甲归田。',
  },
  {
    id: 'letter3',
    title: '家书三',
    body: '亲爱的父亲母亲：晚餐是黑麦面包和土豆，我想起家里的床，也请你们为我祈祷。',
  },
] as const

const soldierSlots = [
  { id: 'soldier1', name: '阵亡士兵一', detail: '手上戴戒指，手臂带伤。' },
  { id: 'soldier2', name: '阵亡士兵二', detail: '头发花白，旧伤累累。' },
  { id: 'soldier3', name: '阵亡士兵三', detail: '个头更矮，像刚离家不久。' },
] as const

const woundedPatients = [
  { id: 'w1', name: '弩手', detail: '左肩新缠着渗血绷带，披风半垂。', injured: true, pose: 'shoulder' },
  { id: 'w2', name: '辎重兵', detail: '只是满脸烟灰，能自己站直说话。', injured: false, pose: 'standing' },
  { id: 'w3', name: '长枪兵', detail: '右腿被木板固定，只能借枪杆撑地。', injured: true, pose: 'leg' },
  { id: 'w4', name: '传令兵', detail: '裹着毯子发抖，但身上没有新伤口。', injured: false, pose: 'wrapped' },
  { id: 'w5', name: '盾兵', detail: '腹侧被临时压着布团，呼吸很急。', injured: true, pose: 'torso' },
  { id: 'w6', name: '伙夫', detail: '手背起泡，却还能拎着水桶走动。', injured: false, pose: 'carrying' },
  { id: 'w7', name: '老兵', detail: '旧伤很多，但此刻没有新的出血。', injured: false, pose: 'scarred' },
] as const

// ═══════════════════════════════════════════════════════════════
// 搜救推箱子关卡（共 3 关）
//
// 机制：WASD 移动，推动箱子。玩家走到村民位置即救出。
// 设计原则：每个箱子都卡在唯一通道上，必须推入侧边凹室才能通过。
//          直接往前推箱子会堵死村民位置 → 死局。
// ═══════════════════════════════════════════════════════════════

const rescueLevels = [
  // ── 第 1 关：巷口清障 ──
  // 箱子堵路，从下方口袋绕过去，把箱子往上推进凹室。
  {
    width: 9,
    height: 7,
    start: { x: 1, y: 1 },
    villagers: [{ x: 7, y: 1 }],
    crates: [{ x: 4, y: 1 }],
    walkable: new Set([
      // 上层凹室（箱子推进来的落点）
      '4,0',
      // 主通道（左→右），箱子在 (4,1)，村民在 (7,1)
      '1,1','2,1','3,1','4,1','5,1','6,1','7,1',
      // 下层口袋（从箱子左侧进入，走到箱子正下方，再往上推出箱子）
      '1,2','2,2','3,2','4,2',
    ]),
  },
  // ── 第 2 关：双障拦路 ──
  // 一条直路上两个箱子，各配一个口袋。必须先清第一个才能救到中间的村民，
  // 然后清第二个救出末尾的村民。
  {
    width: 9,
    height: 7,
    start: { x: 1, y: 1 },
    villagers: [
      { x: 5, y: 1 },   // 夹在两个箱子中间
      { x: 8, y: 1 },   // 走廊尽头
    ],
    crates: [
      { x: 3, y: 1 },   // 第一个路障
      { x: 7, y: 1 },   // 第二个路障
    ],
    walkable: new Set([
      // 上层凹室（箱子落点）
      '3,0',                     '7,0',
      // 主通道
      '1,1','2,1','3,1','4,1','5,1','6,1','7,1','8,1',
      // 下层口袋（每个箱子正下方 + 左侧入口）
      '1,2','2,2','3,2',   '6,2','7,2',
    ]),
  },
  // ── 第 3 关：火线三重障 ──
  // 一条直路三个箱子、三个村民。节奏紧凑，每一步都要走对口袋。
  {
    width: 9,
    height: 7,
    start: { x: 1, y: 1 },
    villagers: [
      { x: 3, y: 1 },   // C1 背后
      { x: 6, y: 1 },   // C2 背后
      { x: 8, y: 1 },   // C3 背后（与 C3 重叠，清掉 C3 即救出）
    ],
    crates: [
      { x: 2, y: 1 },   // 第一道
      { x: 5, y: 1 },   // 第二道
      { x: 8, y: 1 },   // 第三道（与 V3 同格）
    ],
    walkable: new Set([
      // 上层凹室
      '2,0',             '5,0',             '8,0',
      // 主通道
      '1,1','2,1','3,1','4,1','5,1','6,1','7,1','8,1',
      // 下层口袋
      '1,2','2,2',   '4,2','5,2',   '7,2','8,2',
    ]),
  },
] as const

function dialogueToJournalBody(lines: DialogueLine[]) {
  return lines
    .map((line) => {
      const speaker = line.speaker === '旁白' ? '' : line.speaker
      return speaker ? `${speaker}：${line.text}` : line.text
    })
    .join('\n\n')
}

const journalEntries: JournalEntryDefinition[] = [
  { id: 'notices', flag: 'notices_read', title: noteDefinitions.notices.title, body: noteDefinitions.notices.body },
  { id: 'portrait-1', flag: 'portrait_1_seen', title: noteDefinitions.portrait1.title, body: noteDefinitions.portrait1.body },
  { id: 'portrait-2', flag: 'portrait_2_seen', title: noteDefinitions.portrait2.title, body: noteDefinitions.portrait2.body },
  { id: 'portrait-3', flag: 'portrait_3_seen', title: noteDefinitions.portrait3.title, body: noteDefinitions.portrait3.body },
  { id: 'portrait-4', flag: 'portrait_4_seen', title: noteDefinitions.portrait4.title, body: noteDefinitions.portrait4.body },
  { id: 'draft', flag: 'study_draft', title: noteDefinitions.draft.title, body: noteDefinitions.draft.body },
  { id: 'finance', flag: 'study_finance', title: noteDefinitions.finance.title, body: noteDefinitions.finance.body },
  { id: 'secret-letter', flag: 'study_letter', title: noteDefinitions.secretLetter.title, body: noteDefinitions.secretLetter.body },
  { id: 'troop-report', flag: 'study_chess', title: noteDefinitions.troopReport.title, body: noteDefinitions.troopReport.body },
  { id: 'chronicle', flag: 'chronicle_read', title: noteDefinitions.chronicle.title, body: noteDefinitions.chronicle.body },
  { id: 'prayer', flag: 'prayer_heard', title: sequenceDefinitions.prayer.title, body: dialogueToJournalBody(sequenceDefinitions.prayer.lines) },
  { id: 'scripture', flag: 'scriptures_read', title: noteDefinitions.scripture.title, body: noteDefinitions.scripture.body },
  { id: 'tax-order', flag: 'tax_order_read', title: noteDefinitions.taxOrder.title, body: noteDefinitions.taxOrder.body },
  { id: 'ration-report', flag: 'ration_report_read', title: noteDefinitions.rationReport.title, body: noteDefinitions.rationReport.body },
  { id: 'children-answers', flag: 'children_met', title: sequenceDefinitions.childrenAnswers.title, body: dialogueToJournalBody(sequenceDefinitions.childrenAnswers.lines) },
]

// Shuffle puzzle options so answers aren't always in the same position
const shuffledStudyMoves = shuffle(studyMoveOptions)
const shuffledRelicOptions = shuffle(relicOptions)
const shuffledAltarOptions = shuffle(altarOptions)
const shuffledRiddleChoices = riddleQuestions.map((q) => ({ ...q, choices: shuffle(q.choices) }))
const shuffledWoundedPatients = shuffle(woundedPatients)
const shuffledLetterCards = shuffle(letterCards)
const shuffledSoldierSlots = shuffle(soldierSlots)

let viewMode: ViewMode = 'menu'
let state = sanitizeState(loadState())
let overlay: OverlayState | null = null
let toastMessage = ''
let toastTimer: number | undefined
let sheepTimer: number | undefined
let lastRenderedSceneId: SceneId | null = null
let lastOverlaySignature: OverlayState['type'] | null = null
let overlayAnimateOnRender = false
let draggedLetterId: string | null = null
let draggedSheepId: number | null = null

persistState(state)

function sanitizeState(candidate: SaveState): SaveState {
  return isSceneId(candidate.currentScene) ? candidate : createInitialSaveState()
}

function isSceneId(value: string): value is SceneId {
  return Object.prototype.hasOwnProperty.call(sceneDefinitions, value)
}

function currentSceneId(): SceneId {
  return isSceneId(state.currentScene) ? state.currentScene : 'farmhouse'
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderTextBody(text: string) {
  return text
    .split('\n\n')
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br>')}</p>`)
    .join('')
}

function currentOverlaySignature() {
  return overlay?.type ?? null
}

function overlayCardClass(cardClass: string) {
  return `paper-panel overlay-card ${overlayAnimateOnRender ? 'overlay-card-enter ' : ''}${cardClass}`.trim()
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isFireBalanced(heat: number, air: number) {
  return heat >= 38 && heat <= 76 && air >= 34 && air <= 72
}

function resolveFireAction(overlayState: FirePuzzleOverlay, action: 'spark' | 'feed' | 'fan') {
  let heat = clamp(overlayState.heat - 4, 0, 100)
  let air = clamp(overlayState.air - 2, 0, 100)
  let progress = clamp(overlayState.progress - 1, 0, 100)
  let feedback = ''

  if (action === 'spark') {
    heat = clamp(heat + 18, 0, 100)
    air = clamp(air - 8, 0, 100)
    feedback = '火石迸出一串亮星，火芯终于被点醒了。'
  }

  if (action === 'feed') {
    heat = clamp(heat + 10, 0, 100)
    air = clamp(air - 4, 0, 100)
    progress = clamp(progress + (isFireBalanced(heat, air) ? 18 : 7), 0, 100)
    feedback = '你把干燥草束塞进木堆缝隙，火芯更厚实了。'
  }

  if (action === 'fan') {
    air = clamp(air + 16, 0, 100)
    heat = clamp(heat + (overlayState.heat > 24 ? 7 : 2), 0, 100)
    progress = clamp(progress + (isFireBalanced(heat, air) ? 14 : 4), 0, 100)
    feedback = '你贴近火芯缓缓鼓风，火苗开始往上抬。'
  }

  if (heat > 90) {
    heat = 68
    progress = clamp(progress - 12, 0, 100)
    feedback = '火石打得太猛，刚起来的火芯又被惊散了。'
  }

  if (air > 92) {
    air = 74
    progress = clamp(progress - 10, 0, 100)
    feedback = '风送得太急，火苗被吹得东倒西歪。'
  }

  if (air < 12) {
    progress = clamp(progress - 8, 0, 100)
    feedback = '木堆太闷了，火星快要憋灭。'
  }

  if (heat < 10) {
    progress = clamp(progress - 10, 0, 100)
    feedback = '火芯已经发冷，得重新把温度养起来。'
  }

  if (isFireBalanced(heat, air)) {
    progress = clamp(progress + 6, 0, 100)
  }

  const success = progress >= 100
  return {
    type: 'firePuzzle' as const,
    heat,
    air,
    progress: success ? 100 : progress,
    success,
    feedback: success ? '火势终于稳稳立住了，士兵可以围上来取暖。' : feedback,
  }
}

function rescueCellKey(x: number, y: number) {
  return `${x},${y}`
}

function isRescueWalkable(x: number, y: number, level: number) {
  return rescueLevels[level].walkable.has(rescueCellKey(x, y))
}

function rescueCrateIndex(crates: Array<{ x: number; y: number }>, x: number, y: number) {
  return crates.findIndex((crate) => crate.x === x && crate.y === y)
}

function sheepIsInCircle(sheep: SheepActor) {
  const dx = sheep.x - sheep.homeX
  const dy = sheep.y - sheep.homeY
  return Math.hypot(dx, dy) < 12
}

function hasFlag(flag: string) {
  return state.flags.includes(flag)
}

function addFlags(...flags: string[]) {
  const merged = new Set(state.flags)
  flags.forEach((flag) => merged.add(flag))
  state = { ...state, flags: [...merged], updatedAt: Date.now() }
  persistState(state)
}

function showToast(message: string) {
  toastMessage = message
  if (toastTimer) {
    window.clearTimeout(toastTimer)
  }

  toastTimer = window.setTimeout(() => {
    toastMessage = ''
    render()
  }, 2400)
  render()
}

function openDialogue(title: string, lines: DialogueLine[], onClose?: DialogueOverlay['onClose']) {
  overlay = { type: 'dialogue', title, lines, index: 0, onClose }
  render()
}

function openSequence(sequenceId: SequenceId) {
  const sequence = sequenceDefinitions[sequenceId]
  const flags = [sequence.completionFlag, ...(sequence.unlockFlags ?? [])].filter(Boolean) as string[]
  openDialogue(sequence.title, sequence.lines, {
    flags,
    goto: sequence.goto,
  })
}

function openNote(title: string, body: string) {
  overlay = { type: 'note', title, body }
  render()
}

function openNoteById(noteId: keyof typeof noteDefinitions) {
  const note = noteDefinitions[noteId]
  openNote(note.title, note.body)
}

function openJournal(selectedId?: string) {
  const entries = visibleJournalEntries()
  overlay = { type: 'journal', selectedId: selectedId ?? entries[0]?.id }
  render()
}

function goToScene(sceneId: SceneId, options?: { skipEntry?: boolean }) {
  stopSheepTimer()
  overlay = null
  state = { ...state, currentScene: sceneId, updatedAt: Date.now() }
  persistState(state)
  playSceneMusic(sceneId)

  const scene = sceneDefinitions[sceneId]
  if (!options?.skipEntry && scene.entrySequence && scene.entryFlag && !hasFlag(scene.entryFlag)) {
    const sequence = sequenceDefinitions[scene.entrySequence]
    const flags = [sequence.completionFlag, ...(sequence.unlockFlags ?? [])].filter(Boolean) as string[]
    overlay = {
      type: 'dialogue',
      title: sequence.title,
      lines: sequence.lines,
      index: 0,
      onClose: {
        flags,
        goto: sequence.goto,
      },
    }
  }

  render()
}

function startGame() {
  viewMode = 'game'
  goToScene(currentSceneId())
}

function returnToMenu() {
  stopSheepTimer()
  overlay = null
  viewMode = 'menu'
  playSceneMusic('menu')
  render()
}

function resetGame() {
  stopSheepTimer()
  clearSavedState()
  state = createInitialSaveState()
  persistState(state)
  viewMode = 'game'
  goToScene('farmhouse', { skipEntry: false })
}

function closeOverlay() {
  if (overlay?.type === 'sheepPuzzle' || overlay?.type === 'firePuzzle' || overlay?.type === 'riddlePuzzle') {
    stopBgm()
    playSceneMusic(currentSceneId())
  }
  if (overlay?.type === 'sheepPuzzle') {
    stopSheepTimer()
  }
  overlay = null
  render()
}

function advanceDialogue() {
  if (!overlay || overlay.type !== 'dialogue') {
    return
  }

  if (overlay.index < overlay.lines.length - 1) {
    overlay = { ...overlay, index: overlay.index + 1 }
    // Targeted DOM update to avoid flash
    const tray = app.querySelector<HTMLElement>('.dialogue-tray')
    if (tray) {
      const currentLine = overlay.lines[overlay.index]
      const speakerName = currentLine.speaker === '旁白' ? '' : currentLine.speaker
      const finalStep = overlay.index === overlay.lines.length - 1
      const speakerEl = tray.querySelector<HTMLElement>('.dialogue-speaker')
      const lineEl = tray.querySelector<HTMLElement>('.dialogue-line')
      const hintEl = tray.querySelector<HTMLElement>('.dialogue-advance-hint')
      if (speakerEl) {
        speakerEl.textContent = speakerName
        speakerEl.style.display = speakerName ? '' : 'none'
      }
      if (lineEl) {
        lineEl.textContent = currentLine.text
      }
      if (hintEl) {
        hintEl.textContent = finalStep ? '继续' : '点击继续'
      }
    }
    return
  }

  const followUp = overlay.onClose
  overlay = null
  if (followUp?.flags?.length) {
    addFlags(...followUp.flags)
  }

  if (followUp?.goto) {
    goToScene(followUp.goto)
    return
  }

  render()
}

function visibleHotspots(sceneId: SceneId) {
  return sceneDefinitions[sceneId].hotspots.filter((hotspot) => {
    const showable = hotspot.showWhenAll ? hotspot.showWhenAll.every((flag) => hasFlag(flag)) : true
    const hidden = hotspot.hideWhenAll ? hotspot.hideWhenAll.every((flag) => hasFlag(flag)) : false
    return showable && !hidden
  })
}

function isActionDone(action: string) {
  switch (action) {
    case 'gate-clown':
      return hasFlag('clown_talked')
    case 'gate-notices':
      return hasFlag('notices_read')
    case 'gate-guard':
      return hasFlag('guard_spoken')
    case 'portrait-1':
      return hasFlag('portrait_1_seen')
    case 'portrait-2':
      return hasFlag('portrait_2_seen')
    case 'portrait-3':
      return hasFlag('portrait_3_seen')
    case 'portrait-4':
      return hasFlag('portrait_4_seen')
    case 'goto-chapel':
      return hasFlag('road_to_chapel_seen')
    case 'maid-rumor':
      return hasFlag('maid_met')
    case 'study-draft':
      return hasFlag('study_draft')
    case 'study-finance':
      return hasFlag('study_finance')
    case 'study-search':
      return hasFlag('study_letter_search')
    case 'study-letter':
      return hasFlag('study_letter')
    case 'study-chess':
      return hasFlag('study_chess')
    case 'study-report':
      return hasFlag('study_chess')
    case 'study-chronicle':
      return hasFlag('chronicle_read')
    case 'chapel-prayer':
      return hasFlag('prayer_heard')
    case 'chapel-scripture':
      return hasFlag('scriptures_read')
    case 'chapel-relic':
      return hasFlag('relic_trial_done')
    case 'camp-fire':
      return hasFlag('fire_done')
    case 'camp-soldiers':
      return hasFlag('soldiers_heard')
    case 'camp-knight':
      return hasFlag('knight_briefed')
    case 'medical-letters':
      return hasFlag('letters_done')
    case 'medical-wounded':
      return hasFlag('wounded_counted')
    case 'raid-rescue':
      return hasFlag('villagers_saved')
    case 'raid-tax':
      return hasFlag('tax_order_read')
    case 'raid-ration':
      return hasFlag('ration_report_read')
    case 'village-villagers':
      return hasFlag('villagers_heard')
    case 'village-sheep':
      return hasFlag('sheep_saved')
    case 'village-children':
      return hasFlag('children_met')
    default:
      return false
  }
}

function visibleJournalEntries() {
  return journalEntries.filter((entry) => hasFlag(entry.flag))
}

function renderMenu() {
  const saveExists = state.flags.length > 0 || currentSceneId() !== 'farmhouse'
  const currentScene = sceneDefinitions[currentSceneId()]
  const menuBackground = resolveAssetPath(sceneDefinitions.gate.background)
  const progressText = saveExists ? `${escapeHtml(currentScene.chapterTitle)} / ${escapeHtml(currentScene.title)}` : '尚未启程'
  return `
    <section class="menu-shell">
      <div class="menu-stage" style="background-image: url('${menuBackground}');"></div>
      <div class="menu-layout">
        <header class="menu-titleblock">
          <h1>锈甲长歌</h1>
          <p class="menu-tagline">Armor Stained With Sorrow</p>
        </header>
        <div class="menu-options">
          <button class="menu-option primary" data-command="start-game">
            <span class="menu-option-copy">
              <span class="menu-option-label">${saveExists ? '继续旅程' : '开始第一幕'}</span>
              <span class="menu-option-subtitle">${saveExists ? '从当前章节继续' : '进入第一关开场'}</span>
            </span>
          </button>
          <button class="menu-option" data-command="restart-game">
            <span class="menu-option-copy">
              <span class="menu-option-label">从头开始</span>
              <span class="menu-option-subtitle">清空当前进度并重新进入</span>
            </span>
          </button>
        </div>
        <div class="menu-ledger">
          <span class="menu-progress-label">当前进度</span>
          <strong>${progressText}</strong>
        </div>
      </div>
    </section>
  `
}

function renderHotspots(sceneId: SceneId) {
  return visibleHotspots(sceneId)
    .map((hotspot) => {
      const completed = isActionDone(hotspot.action) ? 'done' : ''
      const notePlacement = computeHotspotNotePlacement(hotspot)
      return `
        <button
          class="hotspot ${completed}"
          style="left:${hotspot.x}%; top:${hotspot.y}%; width:${hotspot.w}%; height:${hotspot.h}%;"
          data-command="hotspot"
          data-value="${hotspot.action}"
          aria-label="${escapeHtml(hotspot.label)}"
        >
          <span class="hotspot-core"></span>
          <span class="hotspot-note ${notePlacement.className}">
            <span class="hotspot-label">${escapeHtml(hotspot.label)}</span>
            <span class="hotspot-hint">${escapeHtml(hotspot.hint)}</span>
          </span>
        </button>
      `
    })
    .join('')
}

function renderDialogueOverlay(dialogue: DialogueOverlay) {
  const currentLine = dialogue.lines[dialogue.index]
  const speakerName = currentLine.speaker === '旁白' ? '' : currentLine.speaker
  const finalStep = dialogue.index === dialogue.lines.length - 1
  return `
    <div class="dialogue-tray" data-command="advance-dialogue" aria-label="${finalStep ? '继续剧情' : '继续对白'}">
      <div class="dialogue-copy">
        ${speakerName ? `<strong class="dialogue-speaker">${escapeHtml(speakerName)}</strong>` : ''}
        <p class="dialogue-line">${escapeHtml(currentLine.text)}</p>
      </div>
      <span class="dialogue-advance-hint">${finalStep ? '继续' : '点击继续'}</span>
    </div>
  `
}

function renderJournalOverlay(overlayState: JournalOverlay) {
  const entries = visibleJournalEntries()
  const selected = entries.find((entry) => entry.id === overlayState.selectedId) ?? entries[0]
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('journal-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">线索簿</p>
            <h3>已读条目</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body journal-layout">
          <aside class="journal-sidebar">
            ${
              entries.length
                ? entries
                    .map(
                      (entry) => `
                        <button class="journal-entry ${selected?.id === entry.id ? 'selected' : ''}" data-command="journal-select" data-value="${entry.id}">
                          <strong>${escapeHtml(entry.title)}</strong>
                        </button>
                      `,
                    )
                    .join('')
                : '<p class="journal-empty">暂时还没有记录。真正的线索会随着剧情和调查一点点浮现。</p>'
            }
          </aside>
          <article class="journal-preview">
            ${
              selected
                ? `
                  <h4 class="journal-preview-title">${escapeHtml(selected.title)}</h4>
                  <div class="prose-body">${renderTextBody(selected.body)}</div>
                `
                : '<p class="journal-empty">选中左侧条目后，就可以回看对应线索。</p>'
            }
          </article>
        </div>
      </section>
    </div>
  `
}

function renderNoteOverlay(note: NoteOverlay) {
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('note-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">调查记录</p>
            <h3>${escapeHtml(note.title)}</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body prose-body">${renderTextBody(note.body)}</div>
      </section>
    </div>
  `
}

function renderStudyPuzzle(overlayState: StudyPuzzleOverlay) {
  const selectedLabels = overlayState.moves.map((id) => shuffledStudyMoves.find((option) => option.id === id)?.label ?? id)
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('study-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">残局棋盘</p>
            <h3>以最少步数终局</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body">
          <p class="puzzle-intro">书桌侧边的棋盘压着一份兵力报告。你需要按正确顺序拼出最短终局。</p>
          <div class="token-row">
            ${selectedLabels.length ? selectedLabels.map((label) => `<span class="move-token">${escapeHtml(label)}</span>`).join('') : '<span class="hint-token">尚未落子</span>'}
          </div>
          <div class="choice-grid compact-grid">
            ${shuffledStudyMoves
              .map(
                (option) => `
                  <button class="seal-button ${overlayState.moves.includes(option.id) ? 'selected' : ''}" data-command="study-pick" data-value="${option.id}">
                    ${escapeHtml(option.label)}
                  </button>
                `,
              )
              .join('')}
          </div>
          ${overlayState.feedback ? `<p class="feedback-line">${escapeHtml(overlayState.feedback)}</p>` : ''}
        </div>
        <footer class="panel-footer">
          <button class="seal-button" data-command="study-reset">重排</button>
          <button class="seal-button primary" data-command="study-submit">确认终局</button>
        </footer>
      </section>
    </div>
  `
}

function renderRelicPuzzle(overlayState: RelicPuzzleOverlay) {
  const isTeachings = overlayState.phase === 'teachings'
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('relic-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">圣器的试炼</p>
            <h3>${isTeachings ? '对应教义' : '摆放法阵'}</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body">
          ${
            isTeachings
              ? `
                <div class="teaching-grid">
                  ${teachingRows
                    .map((row) => {
                      const selected = overlayState.teachingSelection[row.slot]
                      return `
                        <section class="teaching-row">
                          <p>${escapeHtml(row.text)}</p>
                          <div class="choice-grid compact-grid">
                            ${shuffledRelicOptions
                              .map(
                                (option) => `
                                  <button class="seal-button ${selected === option.id ? 'selected' : ''}" data-command="relic-pick" data-value="${row.slot}|${option.id}">
                                    ${escapeHtml(option.label)}
                                  </button>
                                `,
                              )
                              .join('')}
                          </div>
                        </section>
                      `
                    })
                    .join('')}
                </div>
              `
              : `
                <div class="teaching-grid">
                  ${altarRows
                    .map((row) => {
                      const selected = overlayState.altarSelection[row.slot]
                      return `
                        <section class="teaching-row">
                          <p>${escapeHtml(row.text)}</p>
                          <div class="choice-grid compact-grid">
                            ${shuffledAltarOptions
                              .map(
                                (option) => `
                                  <button class="seal-button ${selected === option.id ? 'selected' : ''}" data-command="altar-pick" data-value="${row.slot}|${option.id}">
                                    ${escapeHtml(option.label)}
                                  </button>
                                `,
                              )
                              .join('')}
                          </div>
                        </section>
                      `
                    })
                    .join('')}
                </div>
              `
          }
          ${overlayState.feedback ? `<p class="feedback-line">${escapeHtml(overlayState.feedback)}</p>` : ''}
        </div>
        <footer class="panel-footer">
          <button class="seal-button" data-command="relic-reset">重新摆放</button>
          <button class="seal-button primary" data-command="${isTeachings ? 'relic-submit' : 'altar-submit'}">${isTeachings ? '确认对应' : '点亮法阵'}</button>
        </footer>
      </section>
    </div>
  `
}

function renderRiddlePuzzle(overlayState: RiddlePuzzleOverlay) {
  const question = shuffledRiddleChoices[overlayState.step]
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('riddle-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">高塔与舞者</p>
            <h3>谜语 ${overlayState.step + 1} / ${riddleQuestions.length}</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body">
          <p class="puzzle-intro">${escapeHtml(question.prompt)}</p>
          <div class="choice-grid vertical-grid">
            ${question.choices
              .map(
                (choice) => `
                  <button class="seal-button choice-wide" data-command="riddle-answer" data-value="${escapeHtml(choice)}">
                    ${escapeHtml(choice)}
                  </button>
                `,
              )
              .join('')}
          </div>
          ${overlayState.feedback ? `<p class="feedback-line">${escapeHtml(overlayState.feedback)}</p>` : ''}
        </div>
      </section>
    </div>
  `
}

function renderFirePuzzle(overlayState: FirePuzzleOverlay) {
  const flameHue = overlayState.heat < 20 ? 210 : overlayState.heat < 38 ? 30 : overlayState.heat < 76 ? 28 : overlayState.heat < 90 ? 18 : 0
  const flameSat = overlayState.heat < 20 ? 60 : overlayState.heat < 38 ? 90 : 95
  const flameLight = overlayState.heat < 20 ? 55 : overlayState.heat < 38 ? 50 : overlayState.heat < 76 ? 52 : overlayState.heat < 90 ? 62 : 80
  const tempInSweet = overlayState.heat >= 38 && overlayState.heat <= 76
  const airInSweet = overlayState.air >= 34 && overlayState.air <= 72
  const balanced = tempInSweet && airInSweet
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('fire-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">生火</p>
            <h3>把火势养稳</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body fire-layout">
          <div class="fire-illustration ${overlayState.success ? 'stable' : ''}" style="--flame-hue:${flameHue};--flame-sat:${flameSat}%;--flame-light:${flameLight}%;--flame-scale:${(0.38 + overlayState.progress / 130 + overlayState.heat / 240).toFixed(2)};${overlayState.heat > 88 ? '--flame-spark:1;' : ''}">
            <div class="fire-log fire-log-a"></div>
            <div class="fire-log fire-log-b"></div>
            <div class="fire-log fire-log-c"></div>
            <div class="fire-flame"></div>
            <div class="fire-sparks"></div>
            <div class="fire-smoke"></div>
          </div>
          <div class="fire-meters">
            <div class="fire-meter-row">
              <span>火芯温度</span>
              <div class="fire-meter ${tempInSweet ? 'sweet' : overlayState.heat > 76 ? 'hot' : 'cold'}">
                <span style="width:${overlayState.heat}%;"></span>
                <span class="fire-meter-zone" style="left:38%;width:38%;"></span>
              </div>
              <span class="fire-meter-num">${overlayState.heat}</span>
            </div>
            <div class="fire-meter-row">
              <span>鼓风力度</span>
              <div class="fire-meter air ${airInSweet ? 'sweet' : overlayState.air > 72 ? 'hot' : 'cold'}">
                <span style="width:${overlayState.air}%;"></span>
                <span class="fire-meter-zone" style="left:34%;width:38%;"></span>
              </div>
              <span class="fire-meter-num">${overlayState.air}</span>
            </div>
            <div class="fire-meter-row">
              <span>点燃进度</span>
              <div class="fire-meter progress">
                <span style="width:${overlayState.progress}%;"></span>
              </div>
              <span class="fire-meter-num">${overlayState.progress}%</span>
            </div>
          </div>
          <p class="puzzle-intro">${balanced ? '🔥 火势稳定！进度正在快速上涨。' : tempInSweet && !airInSweet ? '💨 温度刚好，但风力需要调整。' : !tempInSweet && airInSweet ? '🌡️ 风力刚好，但温度需要调整。' : '把温度和风力都维持在中段绿色区域，进度才会稳定上涨。'}</p>
          ${overlayState.feedback ? `<p class="feedback-line fire-feedback">${escapeHtml(overlayState.feedback)}</p>` : ''}
          <div class="choice-grid fire-controls">
            <button class="seal-button fire-btn-spark" data-command="fire-spark">🔥 敲击火石</button>
            <button class="seal-button fire-btn-feed" data-command="fire-feed">🌿 添引火绒</button>
            <button class="seal-button fire-btn-fan" data-command="fire-fan">💨 缓缓鼓风</button>
          </div>
        </div>
        <footer class="panel-footer">
          <button class="seal-button" data-command="fire-reset">重新整理木堆</button>
          ${overlayState.success ? '<button class="seal-button primary" data-command="fire-resolve">回到军营</button>' : ''}
        </footer>
      </section>
    </div>
  `
}

function renderLettersPuzzle(overlayState: LettersPuzzleOverlay) {
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('letters-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">医帐中的家书</p>
            <h3>把家书拖到对应的人身边</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body letters-layout">
          <div class="letter-column">
            ${shuffledLetterCards
              .map(
                (letter) => {
                  const assignedSlot = Object.entries(overlayState.assignments).find(([, letterId]) => letterId === letter.id)?.[0]
                  return `
                  <button class="letter-card ${overlayState.selectedLetter === letter.id ? 'selected' : ''} ${assignedSlot ? 'assigned' : ''}" data-command="letter-select" data-value="${letter.id}" data-letter-id="${letter.id}" draggable="true">
                    <strong>${escapeHtml(letter.title)}</strong>
                    <span>${escapeHtml(letter.body)}</span>
                    <em>${assignedSlot ? `已放到 ${escapeHtml(shuffledSoldierSlots.find((soldier) => soldier.id === assignedSlot)?.name ?? assignedSlot)}` : '拖动到右侧遗体位置'}</em>
                  </button>
                `
                },
              )
              .join('')}
          </div>
          <div class="soldier-column">
            ${shuffledSoldierSlots
              .map((soldier) => {
                const assignment = overlayState.assignments[soldier.id]
                const assignedLabel = shuffledLetterCards.find((letter) => letter.id === assignment)?.title ?? '将家书拖拽到此处'
                return `
                  <button class="soldier-slot ${assignment ? 'filled' : ''}" data-command="letter-assign" data-value="${soldier.id}" data-letter-slot="${soldier.id}">
                    <strong>${escapeHtml(soldier.name)}</strong>
                    <span>${escapeHtml(soldier.detail)}</span>
                    <em>${escapeHtml(assignedLabel)}</em>
                  </button>
                `
              })
              .join('')}
          </div>
          <p class="puzzle-intro full-width">把左侧家书拖到右侧对应的遗体位置，点击也可以作为备用操作。</p>
          ${overlayState.feedback ? `<p class="feedback-line full-width">${escapeHtml(overlayState.feedback)}</p>` : ''}
        </div>
        <footer class="panel-footer">
          <button class="seal-button" data-command="letters-reset">清空</button>
          <button class="seal-button primary" data-command="letters-submit">确认归位</button>
        </footer>
      </section>
    </div>
  `
}

const patientFigureSvgs: Record<string, { injured: string; healthy: string }> = {
  shoulder: {
    injured: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="26" r="14" fill="#8c735b"/><ellipse cx="40" cy="60" rx="18" ry="22" fill="#9e8972"/><rect x="18" y="30" width="18" height="12" rx="6" fill="#9e8972"/><rect x="44" y="30" width="18" height="12" rx="6" fill="#a04838"/><path d="M44 36L44 48" stroke="#a04838" stroke-width="3"/></svg>`,
    healthy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="26" r="14" fill="#8c735b"/><ellipse cx="40" cy="60" rx="18" ry="22" fill="#9e8972"/><rect x="18" y="30" width="18" height="12" rx="6" fill="#9e8972"/><rect x="44" y="30" width="18" height="12" rx="6" fill="#9e8972"/></svg>`,
  },
  standing: {
    injured: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="22" r="14" fill="#8c735b"/><rect x="28" y="36" width="24" height="20" rx="8" fill="#9e8972"/><rect x="24" y="54" width="14" height="22" rx="6" fill="#9e8972"/><rect x="42" y="54" width="14" height="22" rx="6" fill="#9e8972"/></svg>`,
    healthy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="22" r="14" fill="#8c735b"/><rect x="28" y="36" width="24" height="20" rx="8" fill="#9e8972"/><rect x="24" y="54" width="14" height="22" rx="6" fill="#9e8972"/><rect x="42" y="54" width="14" height="22" rx="6" fill="#9e8972"/></svg>`,
  },
  leg: {
    injured: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><ellipse cx="40" cy="54" rx="16" ry="18" fill="#9e8972"/><rect x="17" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="47" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="44" y="60" width="12" height="18" rx="4" fill="#a04838"/><rect x="26" y="60" width="12" height="18" rx="4" fill="#9e8972"/></svg>`,
    healthy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><ellipse cx="40" cy="54" rx="16" ry="18" fill="#9e8972"/><rect x="17" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="47" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="26" y="60" width="12" height="18" rx="4" fill="#9e8972"/><rect x="44" y="60" width="12" height="18" rx="4" fill="#9e8972"/></svg>`,
  },
  wrapped: {
    injured: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><rect x="24" y="38" width="32" height="22" rx="10" fill="#d8ceba"/><rect x="20" y="58" width="16" height="20" rx="6" fill="#9e8972"/><rect x="44" y="58" width="16" height="20" rx="6" fill="#9e8972"/></svg>`,
    healthy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><rect x="24" y="38" width="32" height="22" rx="10" fill="#9e8972"/><rect x="20" y="58" width="16" height="20" rx="6" fill="#9e8972"/><rect x="44" y="58" width="16" height="20" rx="6" fill="#9e8972"/></svg>`,
  },
  torso: {
    injured: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><ellipse cx="40" cy="52" rx="16" ry="18" fill="#9e8972"/><rect x="18" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="46" y="30" width="16" height="10" rx="5" fill="#9e8972"/><circle cx="40" cy="48" r="8" fill="#a04838" opacity="0.6"/><rect x="24" y="62" width="12" height="16" rx="4" fill="#9e8972"/><rect x="44" y="62" width="12" height="16" rx="4" fill="#9e8972"/></svg>`,
    healthy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><ellipse cx="40" cy="52" rx="16" ry="18" fill="#9e8972"/><rect x="18" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="46" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="24" y="62" width="12" height="16" rx="4" fill="#9e8972"/><rect x="44" y="62" width="12" height="16" rx="4" fill="#9e8972"/></svg>`,
  },
  carrying: {
    injured: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><ellipse cx="40" cy="54" rx="16" ry="18" fill="#9e8972"/><rect x="52" y="28" width="12" height="18" rx="4" fill="#9e8972"/><rect x="16" y="38" width="12" height="18" rx="4" fill="#9e8972"/><rect x="24" y="62" width="12" height="16" rx="4" fill="#9e8972"/><rect x="44" y="62" width="12" height="16" rx="4" fill="#9e8972"/></svg>`,
    healthy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><ellipse cx="40" cy="54" rx="16" ry="18" fill="#9e8972"/><rect x="52" y="28" width="12" height="18" rx="4" fill="#9e8972"/><rect x="16" y="38" width="12" height="18" rx="4" fill="#9e8972"/><rect x="24" y="62" width="12" height="16" rx="4" fill="#9e8972"/><rect x="44" y="62" width="12" height="16" rx="4" fill="#9e8972"/></svg>`,
  },
  scarred: {
    injured: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><ellipse cx="40" cy="54" rx="16" ry="18" fill="#9e8972"/><rect x="18" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="46" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="24" y="62" width="12" height="16" rx="4" fill="#9e8972"/><rect x="44" y="62" width="12" height="16" rx="4" fill="#9e8972"/><line x1="24" y1="44" x2="56" y2="44" stroke="#a04838" stroke-width="2" opacity="0.5"/></svg>`,
    healthy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f0eadb" rx="12"/><circle cx="40" cy="24" r="14" fill="#8c735b"/><ellipse cx="40" cy="54" rx="16" ry="18" fill="#9e8972"/><rect x="18" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="46" y="30" width="16" height="10" rx="5" fill="#9e8972"/><rect x="24" y="62" width="12" height="16" rx="4" fill="#9e8972"/><rect x="44" y="62" width="12" height="16" rx="4" fill="#9e8972"/></svg>`,
  },
}

function patientFigureSvg(pose: string, injured: boolean) {
  const entry = patientFigureSvgs[pose]
  if (!entry) {
    return patientFigureSvgs.standing.healthy
  }
  return injured ? entry.injured : entry.healthy
}

function renderWoundedPuzzle(overlayState: WoundedPuzzleOverlay) {
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('wounded-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">伤兵登记</p>
            <h3>先登记真正需要抬走的三名伤兵</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body">
          <div class="wounded-grid">
            ${shuffledWoundedPatients
              .map((patient) => {
                const found = overlayState.found.includes(patient.id)
                const wrong = overlayState.wrongIds.includes(patient.id)
                const figSvg = patientFigureSvg(patient.pose, patient.injured)
                return `
                  <button
                    class="wounded-patient ${found ? 'found' : ''} ${wrong ? 'wrong' : ''}"
                    data-command="wounded-pick"
                    data-value="${patient.id}"
                  >
                    <span class="patient-figure">${figSvg}</span>
                    <strong>${escapeHtml(patient.name)}</strong>
                    <span>${escapeHtml(patient.detail)}</span>
                  </button>
                `
              })
              .join('')}
          </div>
          <p class="puzzle-intro">已登记 ${overlayState.found.length} / 3 名真正伤兵。优先挑出有新伤、出血或无法自行站立的人。</p>
          ${overlayState.feedback ? `<p class="feedback-line">${escapeHtml(overlayState.feedback)}</p>` : ''}
        </div>
      </section>
    </div>
  `
}

function renderRescuePuzzle(overlayState: RescuePuzzleOverlay) {
  const lv = rescueLevels[overlayState.level]
  const isVillagerAt = (col: number, row: number) =>
    overlayState.villagers.some((v) => v.x === col && v.y === row)
  const totalLevels = rescueLevels.length
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('rescue-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">搜救村民 第 ${overlayState.level + 1}/${totalLevels} 关</p>
            <h3>推开障碍，救出村民</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body">
          <div class="rescue-board">
            ${Array.from({ length: lv.height }, (_, row) =>
              Array.from({ length: lv.width }, (_, col) => {
                const walkable = isRescueWalkable(col, row, overlayState.level)
                const isGoal = isVillagerAt(col, row)
                const crate = overlayState.crates.some((item) => item.x === col && item.y === row)
                const player = overlayState.player.x === col && overlayState.player.y === row
                return `
                  <div class="rescue-cell ${walkable ? 'floor' : 'wall'} ${isGoal ? 'goal' : ''}">
                    ${crate ? '<span class="rescue-crate"></span>' : ''}
                    ${isGoal ? '<span class="rescue-villager"></span>' : ''}
                    ${player ? '<span class="rescue-player"></span>' : ''}
                  </div>
                `
              }).join(''),
            ).join('')}
          </div>
          <p class="puzzle-intro">使用 <strong>W A S D</strong> 键移动，推开箱子走到村民（金色小人）位置即可过关。共 ${totalLevels} 关。</p>
          ${overlayState.feedback ? `<p class="feedback-line">${escapeHtml(overlayState.feedback)}</p>` : ''}
        </div>
        <footer class="panel-footer">
          <button class="seal-button" data-command="rescue-reset">重试本关</button>
        </footer>
      </section>
    </div>
  `
}

function renderSheepPuzzle(overlayState: SheepPuzzleOverlay) {
  const seconds = Math.ceil(overlayState.remainingMs / 1000)
  const now = Date.now()
  const inCircle = overlayState.sheep.filter((s, i) => sheepIsInCircle(s) || now < overlayState.capturedUntil[i]).length
  const total = overlayState.sheep.length
  return `
    <div class="overlay-scrim">
      <section class="${overlayCardClass('sheep-card')}">
        <header class="panel-header">
          <div>
            <p class="eyebrow">赶羊</p>
            <h3>倒计时结束前把羊都拖回圈里（${inCircle}/${total}）</h3>
          </div>
          <button class="close-button" data-command="close-overlay" aria-label="关闭">×</button>
        </header>
        <div class="panel-body">
          <div class="sheep-field">
            <span class="sheep-pen" style="left:${overlayState.sheep[0]?.homeX ?? 50}%; top:${overlayState.sheep[0]?.homeY ?? 50}%"></span>
            <span class="sheep-circle ${inCircle === total ? 'filled' : ''}" style="left:${overlayState.sheep[0]?.homeX ?? 50}%; top:${overlayState.sheep[0]?.homeY ?? 50}%"></span>
            ${overlayState.sheep
              .map(
                (sheep, i) => {
                  const captured = now < overlayState.capturedUntil[i]
                  return `
                  <button
                    class="sheep-token ${captured ? 'captured' : ''}"
                    style="left:${sheep.x}%; top:${sheep.y}%;"
                    data-sheep-id="${sheep.id}"
                    aria-label="拖动小羊 ${sheep.id}"
                  ></button>
                `
                },
              )
              .join('')}
          </div>
          <div class="stat-row">
            <span>⏱ 剩余 ${seconds} 秒</span>
            <span>羊跑出画面边界就会走丢 | 拖回圈内可困住1秒</span>
          </div>
          <p class="puzzle-intro">羊从牧场中心向外跑。按住并拖动小羊，把它们拖回中心的圆形区域。羊会在圈内停留 1 秒后重新向外跑。倒计时归零时，所有羊都在圈内即为胜利。</p>
          ${overlayState.feedback ? `<p class="feedback-line">${escapeHtml(overlayState.feedback)}</p>` : ''}
          ${overlayState.feedback ? `<div class="panel-footer solo-footer"><button class="seal-button primary" data-command="sheep-resolve">${overlayState.feedback.includes('成功') || overlayState.feedback.includes('回到') ? '回到村口' : '再试一次'}</button></div>` : ''}
        </div>
      </section>
    </div>
  `
}

function renderOverlay() {
  if (!overlay) {
    return ''
  }

  switch (overlay.type) {
    case 'dialogue':
      return renderDialogueOverlay(overlay)
    case 'note':
      return renderNoteOverlay(overlay)
    case 'journal':
      return renderJournalOverlay(overlay)
    case 'studyPuzzle':
      return renderStudyPuzzle(overlay)
    case 'relicPuzzle':
      return renderRelicPuzzle(overlay)
    case 'riddlePuzzle':
      return renderRiddlePuzzle(overlay)
    case 'firePuzzle':
      return renderFirePuzzle(overlay)
    case 'lettersPuzzle':
      return renderLettersPuzzle(overlay)
    case 'woundedPuzzle':
      return renderWoundedPuzzle(overlay)
    case 'rescuePuzzle':
      return renderRescuePuzzle(overlay)
    case 'sheepPuzzle':
      return renderSheepPuzzle(overlay)
  }
}

function renderScenePatches(sceneId: SceneId) {
  switch (sceneId) {
    case 'medical':
      return '<div class="scene-patch medical-ground-cover" aria-hidden="true"></div>'
    default:
      return ''
  }
}

function renderGame(animateStage: boolean) {
  const scene = sceneDefinitions[currentSceneId()]
  const sceneBackground = resolveAssetPath(scene.background)
  const progressChapter = escapeHtml(scene.chapterTitle)
  const progressScene = escapeHtml(scene.title)
  return `
    <section class="game-shell ${scene.palette}" style="--scene-backdrop: url('${sceneBackground}');">
      <div class="scene-shell">
        <div class="scene-stage ${animateStage ? 'scene-stage-enter' : ''}" style="background-image: linear-gradient(180deg, rgba(26, 18, 14, 0.06), rgba(26, 18, 14, 0.34)), url('${sceneBackground}');">
          <header class="scene-hud">
            <div class="scene-progress-card" aria-label="当前进度">
              <span class="scene-progress-label">当前进度</span>
              <strong class="scene-progress-title">${progressChapter}</strong>
              <span class="scene-progress-step">${progressScene}</span>
            </div>
          </header>
          <div class="scene-actions scene-actions-docked">
            <button class="seal-button ghost" data-command="open-journal">线索簿</button>
            <button class="seal-button ghost" data-command="return-menu">主菜单</button>
            <button class="seal-button ghost" data-command="restart-game">重置</button>
          </div>
          ${renderScenePatches(scene.id)}
          <div class="hotspot-layer">${renderHotspots(scene.id)}</div>
          <div id="toast-anchor">${toastMessage ? `<div class="toast-chip">${escapeHtml(toastMessage)}</div>` : ''}</div>
          <div id="overlay-root">${renderOverlay()}</div>
        </div>
      </div>
    </section>
  `
}

function render() {
  if (viewMode === 'menu') {
    app.innerHTML = renderMenu()
    lastRenderedSceneId = null
    lastOverlaySignature = null
    overlayAnimateOnRender = false
    return
  }

  const sceneId = currentSceneId()
  const sceneChanged = lastRenderedSceneId !== sceneId
  const overlaySignature = currentOverlaySignature()
  const overlayTypeChanged = overlaySignature !== lastOverlaySignature

  if (sceneChanged || lastRenderedSceneId === null) {
    // Full DOM replacement for scene transitions
    overlayAnimateOnRender = false
    app.innerHTML = renderGame(true)
    lastRenderedSceneId = sceneId
    lastOverlaySignature = overlaySignature
    return
  }

  // Incremental update — same scene, only overlay / toast / hotspots changed
  overlayAnimateOnRender = false

  // 1. Update overlay
  const overlayRoot = app.querySelector<HTMLElement>('#overlay-root')
  const newOverlayHtml = renderOverlay()

  if (overlayRoot) {
    if (newOverlayHtml) {
      const scrollTop = overlayRoot.querySelector<HTMLElement>('.overlay-card')?.scrollTop ?? 0
      overlayRoot.innerHTML = newOverlayHtml
      if (!overlayTypeChanged) {
        const card = overlayRoot.querySelector<HTMLElement>('.overlay-card')
        if (card) {
          card.scrollTop = scrollTop
        }
      }
    } else {
      overlayRoot.innerHTML = ''
    }
  }

  // 2. Update toast
  const toastAnchor = app.querySelector<HTMLElement>('#toast-anchor')
  if (toastAnchor) {
    toastAnchor.innerHTML = toastMessage ? `<div class="toast-chip">${escapeHtml(toastMessage)}</div>` : ''
  }

  // 3. Update hotspots (flags may have changed visibility)
  const hotspotLayer = app.querySelector<HTMLElement>('.hotspot-layer')
  if (hotspotLayer) {
    hotspotLayer.innerHTML = renderHotspots(sceneId)
  }

  lastOverlaySignature = overlaySignature
}

function openStudyPuzzle() {
  overlay = { type: 'studyPuzzle', moves: [] }
  render()
}

function openRelicPuzzle() {
  overlay = {
    type: 'relicPuzzle',
    phase: 'teachings',
    teachingSelection: {},
    altarSelection: {},
  }
  playSfx('bell')
  render()
}

function openRiddlePuzzle() {
  overlay = { type: 'riddlePuzzle', step: 0 }
  playOverlayMusic('dancer')
  render()
}

function openFirePuzzle() {
  overlay = {
    type: 'firePuzzle',
    heat: 22,
    air: 46,
    progress: 12,
    feedback: '先把火芯养热，再让风和火势一起稳住。',
  }
  playSfx('fireAmbient')
  render()
}

function openLettersPuzzle() {
  overlay = { type: 'lettersPuzzle', assignments: {} }
  render()
}

function openWoundedPuzzle() {
  overlay = { type: 'woundedPuzzle', found: [], wrongIds: [] }
  render()
}

function openRescuePuzzle() {
  const level = 0
  const lv = rescueLevels[level]
  overlay = {
    type: 'rescuePuzzle',
    level,
    player: { ...lv.start },
    crates: lv.crates.map((crate) => ({ ...crate })),
    villagers: lv.villagers.map((v) => ({ ...v })),
    rescued: 0,
  }
  render()
}

function makeSheepActors(): SheepActor[] {
  const homeX = 50
  const homeY = 50
  return [
    { id: 1, x: homeX, y: homeY, homeX, homeY, vx: 1.0, vy: -0.7 },
    { id: 2, x: homeX, y: homeY, homeX, homeY, vx: -0.9, vy: -0.6 },
    { id: 3, x: homeX, y: homeY, homeX, homeY, vx: 0.6, vy: 1.1 },
    { id: 4, x: homeX, y: homeY, homeX, homeY, vx: -1.1, vy: 0.5 },
  ]
}

function openSheepPuzzle() {
  const now = Date.now()
  overlay = {
    type: 'sheepPuzzle',
    remainingMs: 30000,
    sheep: makeSheepActors(),
    capturedUntil: [now, now, now, now],  // all start "captured" so they immediately run
  }
  draggedSheepId = null
  playOverlayMusic('sheepGame')
  startSheepTimer()
  render()
}

function stopSheepTimer() {
  if (sheepTimer) {
    window.clearInterval(sheepTimer)
    sheepTimer = undefined
  }
  draggedSheepId = null
}

function startSheepTimer() {
  stopSheepTimer()
  sheepTimer = window.setInterval(() => {
    if (!overlay || overlay.type !== 'sheepPuzzle') {
      return
    }

    if (overlay.feedback) {
      stopSheepTimer()
      return
    }

    const now = Date.now()
    const nextCapturedUntil = [...overlay.capturedUntil]

    const nextSheep = overlay.sheep.map((sheep, i) => {
      // If being dragged, don't auto-move
      if (draggedSheepId === sheep.id) {
        // Check if dragged into the circle
        if (sheepIsInCircle(sheep) && now >= nextCapturedUntil[i]) {
          nextCapturedUntil[i] = now + 1000  // captured for 1 second
        }
        return sheep
      }

      // If captured (within time window), stay still near home
      if (now < nextCapturedUntil[i]) {
        return { ...sheep, x: sheep.homeX, y: sheep.homeY, vx: 0, vy: 0 }
      }

      // Free sheep — run outward
      let nextVx = sheep.vx + (Math.random() - 0.5) * 0.18
      let nextVy = sheep.vy + (Math.random() - 0.5) * 0.16
      nextVx = clamp(nextVx, -1.4, 1.4)
      nextVy = clamp(nextVy, -1.2, 1.2)

      let nextX = sheep.x + nextVx
      let nextY = sheep.y + nextVy

      if (nextX < 3 || nextX > 97) {
        nextVx *= -1
        nextX = clamp(sheep.x + nextVx, 3, 97)
      }

      if (nextY < 3 || nextY > 93) {
        nextVy *= -1
        nextY = clamp(sheep.y + nextVy, 3, 93)
      }

      return { ...sheep, x: nextX, y: nextY, vx: nextVx, vy: nextVy }
    })

    // Check if any sheep escaped the screen
    const escaped = nextSheep.some((s) => s.x < 5 || s.x > 95 || s.y < 5 || s.y > 90)
    if (escaped) {
      overlay = { ...overlay, sheep: nextSheep, capturedUntil: nextCapturedUntil, feedback: '有羊跑出了牧场范围！' }
      stopSheepTimer()
      render()
      return
    }

    const remainingMs = overlay.remainingMs - 80

    // Countdown ended — check if all sheep are in the circle
    if (remainingMs <= 0) {
      const allInCircle = nextSheep.every((s) => sheepIsInCircle(s))
      if (allInCircle) {
        addFlags('sheep_saved')
        playSfx('puzzleSuccess')
        stopBgm()
        overlay = { ...overlay, sheep: nextSheep, capturedUntil: nextCapturedUntil, remainingMs: 0, feedback: '所有羊都回到了圈里！' }
        stopSheepTimer()
        render()
        return
      } else {
        overlay = { ...overlay, sheep: nextSheep, capturedUntil: nextCapturedUntil, remainingMs: 0, feedback: '时间到了，还有羊没回到圈里。' }
        stopSheepTimer()
        render()
        return
      }
    }

    overlay = { ...overlay, sheep: nextSheep, capturedUntil: nextCapturedUntil, remainingMs }
    render()
  }, 80)
}

function handleAction(action: string) {
  switch (action) {
    case 'goto-gate':
      goToScene('gate')
      return
    case 'gate-clown':
      openDialogue(
        '布告栏旁的小丑',
        [
          { speaker: '小丑', text: '哦……哦……天哪，这群人和疯了一样' },
          { speaker: '主角', text: '先生您没事吧' },
          { speaker: '小丑', text: '啊，没事！哦！让我看看，哈哈哈！一个异乡人！你到这里来做什么？' },
          { speaker: '主角', text: '依照我尊贵的领主的命令来都城帮他办事，事已办完，现在我想在都城多呆一会。' },
          { speaker: '小丑', text: '尊贵的领主的命令~您好像很敬爱他。' },
          { speaker: '主角', text: '当然，他是位值得爱戴的领主，没有他我不可能识字。天知道我多想成为像他一样的骑士。' },
          { speaker: '小丑', text: '那您去看看那里的布告吧，我们英明神武的陛下正是需要人的时候（小丑鼻子变长）。' },
          { speaker: '小丑', text: '对了，听说国王的书房十分有趣。' },
        ],
        { flags: ['clown_talked'] },
      )
      return
    case 'gate-notices':
      addFlags('notices_read')
      openNoteById('notices')
      return
    case 'gate-guard':
      openDialogue(
        '守卫',
        [
          { speaker: '主角', text: '您好，听闻王宫正在招收书记官，我来此应聘。' },
          { speaker: '守卫', text: '跟我来吧' },
        ],
        { flags: ['guard_spoken'], goto: 'audience' },
      )
      return
    case 'goto-corridor':
      goToScene('corridor')
      return
    case 'portrait-1':
      addFlags('portrait_1_seen')
      openNoteById('portrait1')
      return
    case 'portrait-2':
      addFlags('portrait_2_seen')
      openNoteById('portrait2')
      return
    case 'portrait-3':
      addFlags('portrait_3_seen')
      openNoteById('portrait3')
      return
    case 'portrait-4':
      addFlags('portrait_4_seen')
      openNoteById('portrait4')
      return
    case 'goto-chapel':
      goToScene('chapel')
      return
    case 'maid-rumor':
      openSequence('maidRumor')
      return
    case 'goto-study':
      goToScene('study')
      return
    case 'study-draft':
      addFlags('study_draft')
      openNoteById('draft')
      return
    case 'study-finance':
      addFlags('study_finance')
      openNoteById('finance')
      return
    case 'study-search':
      addFlags('study_letter_search')
      showToast('你在桌板背面摸到一角折得很紧的信纸。')
      return
    case 'study-letter':
      addFlags('study_letter')
      openNoteById('secretLetter')
      return
    case 'study-chess':
      if (hasFlag('study_chess')) {
        openNoteById('troopReport')
        return
      }
      openStudyPuzzle()
      return
    case 'study-report':
      openNoteById('troopReport')
      return
    case 'study-chronicle':
      addFlags('chronicle_read')
      openNoteById('chronicle')
      return
    case 'study-enlist':
      if (!canAdvanceFromStudy(state.flags)) {
        showToast('书房里的关键线索还没有看完。')
        return
      }
      addFlags('study_complete')
      goToScene('audience')
      openDialogue(
        '再次面见国王',
        [
          { speaker: '国王', text: '你近日起草一份征兵的敕令，发与各个领主。' },
          { speaker: '主角', text: '是，陛下。请准许我在完成这份工作后，加入国家的军队' },
          { speaker: '国王', text: '我的书记官本可不用应征入伍，当然如果你坚持，我的孩子，我将祝福你。军队也需要书记官。教会将表彰你的英勇，上帝会保佑你平安归来。' },
        ],
      )
      return
    case 'chapel-prayer':
      openSequence('prayer')
      return
    case 'chapel-scripture':
      addFlags('scriptures_read')
      openNoteById('scripture')
      return
    case 'chapel-relic':
      openRelicPuzzle()
      return
    case 'chapel-dancer':
      openRiddlePuzzle()
      return
    case 'camp-fire':
      openFirePuzzle()
      return
    case 'camp-gossip':
      openSequence('campGossip')
      return
    case 'camp-knight':
      openSequence('knightBriefing')
      return
    case 'goto-medical':
      goToScene('medical')
      return
    case 'medical-letters':
      openLettersPuzzle()
      return
    case 'medical-wounded':
      openWoundedPuzzle()
      return
    case 'medical-advance':
      goToScene('formation')
      openSequence('warSpeech')
      return
    case 'goto-raid-village':
      goToScene('raidVillage')
      return
    case 'raid-rescue':
      openRescuePuzzle()
      return
    case 'raid-tax':
      addFlags('tax_order_read')
      openNoteById('taxOrder')
      return
    case 'raid-ration':
      addFlags('ration_report_read')
      openNoteById('rationReport')
      return
    case 'goto-battlefield':
      goToScene('battlefield')
      return
    case 'goto-village':
      goToScene('village')
      return
    case 'village-villagers':
      openSequence('villagerDebate')
      return
    case 'village-sheep':
      openSheepPuzzle()
      return
    case 'village-children':
      openSequence('childrenAnswers')
      return
    case 'village-messenger':
      if (!canFinishEnding(state.flags)) {
        showToast('村里的事还没有处理完。')
        return
      }
      openSequence('armistice')
      return
    default:
      return
  }
}

function handleCommand(command: string, value: string) {
  switch (command) {
    case 'start-game':
      startGame()
      return
    case 'return-menu':
      returnToMenu()
      return
    case 'restart-game':
      resetGame()
      return
    case 'open-journal':
      openJournal()
      return
    case 'journal-select':
      if (!overlay || overlay.type !== 'journal') {
        return
      }
      overlay = { ...overlay, selectedId: value }
      render()
      return
    case 'close-overlay':
      closeOverlay()
      return
    case 'advance-dialogue':
      advanceDialogue()
      return
    case 'hotspot':
      handleAction(value)
      return
    case 'study-pick':
      if (!overlay || overlay.type !== 'studyPuzzle' || overlay.moves.includes(value)) {
        return
      }
      overlay = { ...overlay, moves: [...overlay.moves, value], feedback: undefined }
      render()
      return
    case 'study-reset':
      if (!overlay || overlay.type !== 'studyPuzzle') {
        return
      }
      overlay = { ...overlay, moves: [], feedback: undefined }
      render()
      return
    case 'study-submit':
      if (!overlay || overlay.type !== 'studyPuzzle') {
        return
      }
      if (overlay.moves.join('|') === 'queen|bishop|mate') {
        addFlags('study_chess')
        playSfx('puzzleSuccess')
        openNoteById('troopReport')
        showToast('残局下到终局，棋盘下压着的兵力报告露了出来。')
        return
      }
      overlay = { ...overlay, feedback: '这几步还不足以直接终局。' }
      render()
      return
    case 'relic-pick':
      if (!overlay || overlay.type !== 'relicPuzzle') {
        return
      }
      const [slot, relic] = value.split('|')
      overlay = {
        ...overlay,
        teachingSelection: { ...overlay.teachingSelection, [slot]: relic },
        feedback: undefined,
      }
      render()
      return
    case 'relic-reset':
      if (!overlay || overlay.type !== 'relicPuzzle') {
        return
      }
      overlay = {
        ...overlay,
        teachingSelection: overlay.phase === 'teachings' ? {} : overlay.teachingSelection,
        altarSelection: overlay.phase === 'altar' ? {} : overlay.altarSelection,
        feedback: undefined,
      }
      render()
      return
    case 'relic-submit':
      if (!overlay || overlay.type !== 'relicPuzzle') {
        return
      }
      if (validateRelicTeachings(overlay.teachingSelection)) {
        playSfx('puzzleSuccess')
        overlay = { ...overlay, phase: 'altar', feedback: '圣器亮起微光，祭坛开始响应。' }
        render()
        return
      }
      overlay = { ...overlay, feedback: '教义与圣器的对应不对。石门没有任何反应。' }
      render()
      return
    case 'altar-pick':
      if (!overlay || overlay.type !== 'relicPuzzle') {
        return
      }
      const [direction, creature] = value.split('|')
      overlay = {
        ...overlay,
        altarSelection: { ...overlay.altarSelection, [direction]: creature },
        feedback: undefined,
      }
      render()
      return
    case 'altar-submit':
      if (!overlay || overlay.type !== 'relicPuzzle') {
        return
      }
      if (validateConstellationPlacement(overlay.altarSelection)) {
        addFlags('relic_trial_done')
        playSfx('puzzleSuccess')
        overlay = null
        showToast('法阵连成闭环，通往高塔的试炼已经开启。')
        return
      }
      overlay = { ...overlay, feedback: '方位摆错了，法阵的纹路又一次暗了下去。' }
      render()
      return
    case 'riddle-answer':
      if (!overlay || overlay.type !== 'riddlePuzzle') {
        return
      }
      if (value === shuffledRiddleChoices[overlay.step].correct) {
        if (overlay.step === shuffledRiddleChoices.length - 1) {
          addFlags('riddle_done')
          playSfx('puzzleSuccess')
          stopBgm()
          overlay = null
          openSequence('dancerFarewell')
          return
        }
        overlay = { ...overlay, step: overlay.step + 1, feedback: undefined }
        render()
        return
      }
      overlay = { ...overlay, feedback: '舞者轻轻摇头，示意你再想想。' }
      render()
      return
    case 'fire-spark':
      if (!overlay || overlay.type !== 'firePuzzle' || overlay.success) {
        return
      }
      overlay = resolveFireAction(overlay, 'spark')
      if (overlay.success) {
        addFlags('fire_done')
        playSfx('fireSuccess')
      }
      render()
      return
    case 'fire-feed':
      if (!overlay || overlay.type !== 'firePuzzle' || overlay.success) {
        return
      }
      overlay = resolveFireAction(overlay, 'feed')
      if (overlay.success) {
        addFlags('fire_done')
        playSfx('fireSuccess')
      }
      render()
      return
    case 'fire-fan':
      if (!overlay || overlay.type !== 'firePuzzle' || overlay.success) {
        return
      }
      overlay = resolveFireAction(overlay, 'fan')
      if (overlay.success) {
        addFlags('fire_done')
        playSfx('fireSuccess')
      }
      render()
      return
    case 'fire-reset':
      openFirePuzzle()
      return
    case 'fire-resolve':
      if (!overlay || overlay.type !== 'firePuzzle' || !overlay.success) {
        return
      }
      stopBgm()
      playSceneMusic(currentSceneId())
      overlay = null
      showToast('篝火已经稳住了，士兵终于能围上来取暖。')
      return
    case 'letter-select':
      if (!overlay || overlay.type !== 'lettersPuzzle') {
        return
      }
      overlay = { ...overlay, selectedLetter: value, feedback: undefined }
      render()
      return
    case 'letter-assign':
      if (!overlay || overlay.type !== 'lettersPuzzle' || !overlay.selectedLetter) {
        return
      }
      overlay = {
        ...overlay,
        assignments: { ...overlay.assignments, [value]: overlay.selectedLetter },
        feedback: undefined,
      }
      render()
      return
    case 'letters-reset':
      if (!overlay || overlay.type !== 'lettersPuzzle') {
        return
      }
      overlay = { ...overlay, selectedLetter: undefined, assignments: {}, feedback: undefined }
      render()
      return
    case 'letters-submit':
      if (!overlay || overlay.type !== 'lettersPuzzle') {
        return
      }
      if (validateLetterAssignments(overlay.assignments)) {
        addFlags('letters_done')
        playSfx('puzzleSuccess')
        overlay = null
        showToast('家书终于回到了对应的人手里。')
        return
      }
      overlay = { ...overlay, feedback: '这些家书还没有完全对应上特征。' }
      render()
      return
    case 'wounded-pick':
      if (!overlay || overlay.type !== 'woundedPuzzle') {
        return
      }
      if (overlay.found.includes(value)) {
        return
      }
      const target = shuffledWoundedPatients.find((patient) => patient.id === value)
      if (!target) {
        return
      }
      if (target.injured) {
        const found = [...overlay.found, value]
        if (found.length === 3) {
          addFlags('wounded_counted')
          playSfx('puzzleSuccess')
          overlay = null
          showToast('伤兵人数已经登记清楚。')
          return
        }
        overlay = { ...overlay, found, feedback: '这个士兵确实带着新伤。' }
        render()
        return
      }
      overlay = {
        ...overlay,
        wrongIds: [...new Set([...overlay.wrongIds, value])],
        feedback: '这个人还能站立，伤不在他身上。',
      }
      render()
      return
    case 'rescue-move':
      if (!overlay || overlay.type !== 'rescuePuzzle') {
        return
      }
      const moveMap = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
      } as const
      const step = moveMap[value as keyof typeof moveMap]
      if (!step) {
        return
      }

      const nextX = overlay.player.x + step.x
      const nextY = overlay.player.y + step.y
      if (!isRescueWalkable(nextX, nextY, overlay.level)) {
        overlay = { ...overlay, feedback: '火势和废墟把这边堵死了，得换条路。' }
        render()
        return
      }

      const crateIndex = rescueCrateIndex(overlay.crates, nextX, nextY)
      let crates = overlay.crates
      if (crateIndex >= 0) {
        const pushedX = nextX + step.x
        const pushedY = nextY + step.y
        if (!isRescueWalkable(pushedX, pushedY, overlay.level) || rescueCrateIndex(overlay.crates, pushedX, pushedY) >= 0) {
          overlay = { ...overlay, feedback: '前面的箱子卡住了，推不动。' }
          render()
          return
        }

        crates = overlay.crates.map((crate, index) => (index === crateIndex ? { x: pushedX, y: pushedY } : crate))
      }

      const player = { x: nextX, y: nextY }
      const villagerIndex = overlay.villagers.findIndex((v) => v.x === player.x && v.y === player.y)
      if (villagerIndex >= 0) {
        const remaining = overlay.villagers.filter((_, i) => i !== villagerIndex)
        const rescued = overlay.rescued + 1
        if (remaining.length === 0) {
          const nextLevel = overlay.level + 1
          if (nextLevel >= rescueLevels.length) {
            addFlags('villagers_saved')
            playSfx('puzzleSuccess')
            overlay = null
            showToast(`全部 ${rescueLevels.length} 关完成！共救出 ${rescued} 名村民。`)
            openSequence('rescuedChild')
            return
          }
          const lv = rescueLevels[nextLevel]
          overlay = {
            type: 'rescuePuzzle',
            level: nextLevel,
            player: { ...lv.start },
            crates: lv.crates.map((c) => ({ ...c })),
            villagers: lv.villagers.map((v) => ({ ...v })),
            rescued,
            feedback: `第 ${overlay.level + 1} 关通过！进入第 ${nextLevel + 1} 关。`,
          }
          render()
          return
        }
        overlay = { ...overlay, player, crates, villagers: remaining, rescued, feedback: `救出了第 ${rescued} 名村民！还剩 ${remaining.length} 人。` }
        render()
        return
      }

      overlay = { ...overlay, player, crates, feedback: undefined }
      render()
      return
    case 'rescue-reset':
      openRescuePuzzle()
      return
    case 'sheep-resolve':
      if (!overlay || overlay.type !== 'sheepPuzzle') {
        return
      }
      stopBgm()
      if (overlay.feedback?.includes('成功') || overlay.feedback?.includes('回到')) {
        playSceneMusic(currentSceneId())
        overlay = null
        stopSheepTimer()
        render()
        return
      }
      openSheepPuzzle()
      return
    default:
      return
  }
}

app.addEventListener('click', (event) => {
  const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-command]') : null
  if (!target) {
    return
  }

  const command = target.dataset.command
  if (!command) {
    return
  }

  playClick()
  handleCommand(command, target.dataset.value ?? '')
})

app.addEventListener('dragstart', (event) => {
  const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-letter-id]') : null
  if (!target || !overlay || overlay.type !== 'lettersPuzzle') {
    return
  }

  draggedLetterId = target.dataset.letterId ?? null
  if (event.dataTransfer && draggedLetterId) {
    event.dataTransfer.setData('text/plain', draggedLetterId)
    event.dataTransfer.effectAllowed = 'move'
  }
  target.classList.add('selected')
  setTimeout(() => target.classList.add('assigned'), 0)
})

app.addEventListener('dragover', (event) => {
  const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-letter-slot]') : null
  if (!target || !overlay || overlay.type !== 'lettersPuzzle') {
    return
  }

  event.preventDefault()
  // Highlight all soldier slots, clear previous highlights
  app.querySelectorAll<HTMLElement>('.soldier-slot').forEach((el) => el.classList.remove('drag-over'))
  target.classList.add('drag-over')
})

app.addEventListener('dragleave', (event) => {
  const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-letter-slot]') : null
  if (target) {
    target.classList.remove('drag-over')
  }
})

app.addEventListener('drop', (event) => {
  const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-letter-slot]') : null
  if (!target || !overlay || overlay.type !== 'lettersPuzzle') {
    return
  }

  event.preventDefault()
  target.classList.remove('drag-over')
  const letterId = draggedLetterId ?? event.dataTransfer?.getData('text/plain') ?? ''
  const slotId = target.dataset.letterSlot ?? ''
  if (!letterId || !slotId) {
    return
  }

  overlay = {
    ...overlay,
    selectedLetter: letterId,
    assignments: { ...overlay.assignments, [slotId]: letterId },
    feedback: undefined,
  }
  draggedLetterId = null
  render()
})

app.addEventListener('dragend', () => {
  app.querySelectorAll<HTMLElement>('.letter-card.selected, .soldier-slot.drag-over').forEach((el) => {
    el.classList.remove('selected', 'drag-over')
  })
  draggedLetterId = null
})

window.addEventListener('keydown', (event) => {
  if (!overlay || overlay.type !== 'rescuePuzzle') {
    return
  }

  const keyMap: Record<string, string> = { w: 'up', a: 'left', s: 'down', d: 'right', W: 'up', A: 'left', S: 'down', D: 'right' }
  const direction = keyMap[event.key]
  if (direction) {
    event.preventDefault()
    handleCommand('rescue-move', direction)
  }
})

app.addEventListener('pointerdown', (event) => {
  const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-sheep-id]') : null
  if (!target || !overlay || overlay.type !== 'sheepPuzzle' || overlay.feedback) {
    return
  }

  draggedSheepId = Number(target.dataset.sheepId)
})

window.addEventListener('pointermove', (event) => {
  if (draggedSheepId === null || !overlay || overlay.type !== 'sheepPuzzle' || overlay.feedback) {
    return
  }

  const field = app.querySelector<HTMLElement>('.sheep-field')
  if (!field) {
    return
  }

  const rect = field.getBoundingClientRect()
  const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 12, 88)
  const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 18, 78)

  overlay = {
    ...overlay,
    sheep: overlay.sheep.map((sheep) =>
      sheep.id === draggedSheepId
        ? { ...sheep, x, y, vx: (Math.random() - 0.5) * 1.4, vy: (Math.random() - 0.5) * 1.2 }
        : sheep,
    ),
  }
  render()
})

window.addEventListener('pointerup', () => {
  draggedSheepId = null
})

render()