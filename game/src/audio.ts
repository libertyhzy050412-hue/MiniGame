import type { SceneId } from './narrativeData'

// ── Audio file paths (relative to public/) ──
const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/`

const bgmMap: Record<string, string> = {
  menu: 'Assassin（游戏标题界面&主菜单背景乐）.mp3',
  gate: 'Folk Round（1.王都背景乐）.mp3',
  audience: 'Inventing Flight（1.进入王宫&与国王对话背景乐）.mp3',
  corridor: 'Enchanted Journey（1.王宫背景乐）.mp3',
  study: 'Think About It（1.国王书房&3.军队营帐发现文件）.mp3',
  chapel: 'Go On Without Me（2.教堂背景乐）.mp3',
  camp: 'Night Vigil（3.营地背景乐）.mp3',
  medical: 'Lonely Mountain（3.士兵家书）.mp3',
  formation: 'The Ice Giants（2.士兵出征）.mp3',
  raidVillage: 'Night Attack（3.战斗）.mp3',
  battlefield: 'Night Attack（3.战斗）.mp3',
  recovery: 'Enchanted Valley（4.村庄背景乐）.mp3',
  village: 'Enchanted Valley（4.村庄背景乐）.mp3',
  ending: 'The Range（4.战斗胜利）.mp3',
}

const sfxMap: Record<string, string> = {
  click: 'mixkit-light-switch-sound-2579（点击音效）.wav',
  fireAmbient: 'mixkit-campfire-night-wind-1736（3.夜风篝火，点火背景音）.wav',
  fireSuccess: 'mixkit-fast-ignition-fire-1349（3.点火成功声）.wav',
  puzzleSuccess: 'mixkit-magical-light-moving-2584（2.通关音效）.wav',
  sword1: 'mixkit-medieval-metal-sword-blade-2766（剑击声1）.wav',
  sword2: 'mixkit-sword-blade-attack-in-medieval-battle-2762（剑击声2）.wav',
  sword3: 'mixkit-sword-blade-lashes-chainmail-armor-2776（剑击声3）.wav',
  battleCrowd: 'mixkit-angry-male-crowd-ambience-458（战场嘶吼声）.wav',
  moaning: 'mixkit-people-moaning-sadly-469（人群呻吟声）.wav',
  horseNeigh: 'mixkit-intense-horse-stallion-neigh-76（马嘶声）.wav',
  horseScared: 'mixkit-scared-horse-neighing-85（受惊马嘶声）.wav',
  marching: 'mixkit-big-army-crowd-marching-461（军队行进声）.wav',
  warHorn: 'mixkit-war-horn-ambience-2785（战斗号角）.wav',
  bell: 'mixkit-shaker-bell-alert-599（2.铃铛音效）.mp3',
  dancer: 'Isolation Waltz（2.舞者舞蹈背景乐）.mp3',
  dancerTalk: 'Horizon Flare（2.与舞者对话背景乐）.mp3',
  childrenTalk: 'Shining Stars（4.与孩子对话）.mp3',
  sheepGame: 'Still Pickin（4.放羊小游戏）.mp3',
  knightSpeech: 'Rulers of Our Lands（3.骑士向士兵讲话）.mp3',
  prayer: 'Rites（2.教皇说话背景音乐）.mp3',
}

// ── State ──
let currentBgm: HTMLAudioElement | null = null
let currentBgmKey: string | null = null
let bgmVolume = 0.42
let sfxVolume = 0.55
let muted = false

function audioPath(filename: string) {
  return `${AUDIO_BASE}${encodeURI(filename)}`
}

function createAudio(src: string, loop: boolean, volume: number): HTMLAudioElement {
  const audio = new Audio(src)
  audio.loop = loop
  audio.volume = muted ? 0 : volume
  audio.preload = 'auto'
  return audio
}

// ── BGM ──
export function playSceneMusic(sceneId: SceneId | 'menu') {
  const filename = bgmMap[sceneId]
  if (!filename) {
    stopBgm()
    return
  }

  const key = sceneId
  if (currentBgmKey === key && currentBgm && !currentBgm.paused) {
    return
  }

  stopBgm()

  const audio = createAudio(audioPath(filename), true, bgmVolume)
  audio.play().catch(() => {
    // Autoplay blocked — user needs to interact first
  })
  currentBgm = audio
  currentBgmKey = key
}

export function playOverlayMusic(key: string) {
  const filename = sfxMap[key]
  if (!filename) return

  stopBgm()

  const audio = createAudio(audioPath(filename), true, bgmVolume)
  audio.play().catch(() => {})
  currentBgm = audio
  currentBgmKey = key
}

export function stopOverlayMusic(sceneId: SceneId) {
  stopBgm()
  currentBgmKey = null
  playSceneMusic(sceneId)
}

export function stopBgm() {
  if (currentBgm) {
    currentBgm.pause()
    currentBgm.currentTime = 0
    currentBgm = null
    currentBgmKey = null
  }
}

// ── SFX ──
export function playSfx(key: string) {
  const filename = sfxMap[key]
  if (!filename) return

  const audio = createAudio(audioPath(filename), false, sfxVolume)
  audio.play().catch(() => {})
  audio.addEventListener('ended', () => {
    audio.remove()
  })
}

export function playClick() {
  playSfx('click')
}

// ── Volume / Mute ──
export function setBgmVolume(volume: number) {
  bgmVolume = Math.max(0, Math.min(1, volume))
  if (currentBgm && !muted) {
    currentBgm.volume = bgmVolume
  }
}

export function setSfxVolume(volume: number) {
  sfxVolume = Math.max(0, Math.min(1, volume))
}

export function toggleMute() {
  muted = !muted
  if (currentBgm) {
    currentBgm.volume = muted ? 0 : bgmVolume
  }
  return muted
}

export function isMuted() {
  return muted
}
