import { generatedSceneArt } from './generatedSceneArt'

export type SceneId =
  | 'farmhouse'
  | 'palaceGate'
  | 'audienceHall'
  | 'study'
  | 'church'
  | 'campFire'
  | 'medicalTent'
  | 'raidVillage'
  | 'aftermath'
  | 'ending'

export interface HotspotDefinition {
  id: string
  label: string
  hint: string
  x: number
  y: number
  w: number
  h: number
  showWhenAll?: string[]
  hideWhenAll?: string[]
}

export interface SceneDefinition {
  id: SceneId
  chapter: number
  chapterTitle: string
  title: string
  subtitle: string
  objective: string
  ambience: string
  background: string
  hotspots: HotspotDefinition[]
}

export const sceneDefinitions: Record<SceneId, SceneDefinition> = {
  farmhouse: {
    id: 'farmhouse',
    chapter: 1,
    chapterTitle: '第一关 书房的秘密',
    title: '离家',
    subtitle: '泥泞农舍前的送别',
    objective: '与父母道别，带着荞麦饼启程。',
    ambience: '田野沉静，离家的热望与不安同时涌来。',
    background: '/art/act1/farmhouse.png',
    hotspots: [
      { id: 'farewell', label: '父母', hint: '听完离别嘱托。', x: 33, y: 48, w: 22, h: 28 },
      { id: 'leaveFarm', label: '启程', hint: '离开农舍，前往都城。', x: 72, y: 54, w: 18, h: 22, showWhenAll: ['farewell_complete'] },
    ],
  },
  palaceGate: {
    id: 'palaceGate',
    chapter: 1,
    chapterTitle: '第一关 书房的秘密',
    title: '王宫门口',
    subtitle: '布告栏前挤满了人群',
    objective: '和小丑对话，查看布告，再向守卫表明来意。',
    ambience: '白金色的王宫外，人们被税赋与征兵的消息裹挟。',
    background: '/art/act1/palace-gate.png',
    hotspots: [
      { id: 'clown', label: '小丑', hint: '听听这个古怪的引路人怎么说。', x: 11, y: 42, w: 18, h: 34 },
      { id: 'notices', label: '布告栏', hint: '阅读影响都城的三份关键布告。', x: 44, y: 28, w: 18, h: 42 },
      { id: 'guard', label: '守卫', hint: '布告看完后，向王宫守卫应聘。', x: 74, y: 42, w: 16, h: 34 },
    ],
  },
  audienceHall: {
    id: 'audienceHall',
    chapter: 1,
    chapterTitle: '第一关 书房的秘密',
    title: '接见',
    subtitle: '王座高踞，红毯笔直延伸',
    objective: '接受国王安排，随后前往书房。',
    ambience: '庄严的殿堂掩不住财政拮据与战争阴影。',
    background: generatedSceneArt.audienceHall,
    hotspots: [
      { id: 'king', label: '国王', hint: '听取新的任命。', x: 39, y: 18, w: 23, h: 54 },
      { id: 'toStudy', label: '前往书房', hint: '穿过回廊，进入二楼书房。', x: 74, y: 30, w: 15, h: 42, showWhenAll: ['audience_complete'] },
    ],
  },
  study: {
    id: 'study',
    chapter: 1,
    chapterTitle: '第一关 书房的秘密',
    title: '书房调查',
    subtitle: '文书、账册和暗藏的秘密同时浮现',
    objective: '调查征兵、财政、密信与棋局，确认战争真相。',
    ambience: '木桌与书册堆满整间屋子，真相藏在秩序的缝隙里。',
    background: '/art/act1/study.png',
    hotspots: [
      { id: 'draft', label: '征兵起草书', hint: '查看新的征兵命令。', x: 22, y: 56, w: 18, h: 18 },
      { id: 'finance', label: '财政报告', hint: '核对国库收入与支出。', x: 42, y: 56, w: 18, h: 18 },
      { id: 'secretLetter', label: '桌底密信', hint: '双击桌底发现敌国勒索。', x: 60, y: 63, w: 16, h: 14 },
      { id: 'chess', label: '残局棋盘', hint: '以最小代价终局，换取兵力报告。', x: 74, y: 54, w: 15, h: 18 },
      { id: 'chronicle', label: '王室历书', hint: '阅读王冠与王权的历史。', x: 11, y: 30, w: 14, h: 26 },
      { id: 'enlist', label: '决定从军', hint: '线索已足够，是时候做出选择。', x: 80, y: 10, w: 14, h: 14, showWhenAll: ['study_draft', 'study_finance', 'study_letter', 'study_chess'] },
    ],
  },
  church: {
    id: 'church',
    chapter: 2,
    chapterTitle: '第二关 圣器的试炼',
    title: '教堂与高塔',
    subtitle: '祷告、经文与圣器试炼交织',
    objective: '听祷告，完成圣器与法阵试炼，再面对舞者的三道谜语。',
    ambience: '宗教仪式把征战包装成荣光与天命。',
    background: '/art/act2/church.png',
    hotspots: [
      { id: 'prayer', label: '祷告', hint: '聆听教皇的战前祷告。', x: 39, y: 27, w: 20, h: 26 },
      { id: 'scriptures', label: '藏经室', hint: '翻开经书，寻找四件圣器的线索。', x: 14, y: 40, w: 24, h: 28 },
      { id: 'relicTrial', label: '圣器试炼', hint: '将圣器与教义、方位正确对应。', x: 61, y: 38, w: 16, h: 24, showWhenAll: ['scriptures_read'] },
      { id: 'dancer', label: '舞者', hint: '试炼完成后，面对舞者的谜语。', x: 79, y: 32, w: 14, h: 36, showWhenAll: ['relic_trial_done'] },
      { id: 'toCamp', label: '奔赴军营', hint: '启程前往前线。', x: 82, y: 76, w: 12, h: 12, showWhenAll: ['riddle_done'] },
    ],
  },
  campFire: {
    id: 'campFire',
    chapter: 3,
    chapterTitle: '第三关 战争的代价',
    title: '寒夜军营',
    subtitle: '暮色落在湿木堆与疲惫士兵身上',
    objective: '先把篝火点燃，再接受骑士的命令。',
    ambience: '补给匮乏、疾病蔓延，前线的苦相已经藏不住。',
    background: '/art/act3/camp.png',
    hotspots: [
      { id: 'fire', label: '生火', hint: '长按助燃，别太久也别太短。', x: 40, y: 56, w: 18, h: 18 },
      { id: 'knight', label: '骑士', hint: '点燃篝火后，听取新的命令。', x: 69, y: 30, w: 18, h: 42, showWhenAll: ['fire_done'] },
      { id: 'toMedical', label: '前往医帐', hint: '登记阵亡者与伤兵。', x: 82, y: 76, w: 12, h: 12, showWhenAll: ['knight_briefed'] },
    ],
  },
  medicalTent: {
    id: 'medicalTent',
    chapter: 3,
    chapterTitle: '第三关 战争的代价',
    title: '医帐',
    subtitle: '家书与伤员被迫挤在同一处',
    objective: '整理家书、记录伤兵，再继续前进。',
    ambience: '每一份遗物都在证明战争从不只属于将领。',
    background: '/art/act3/medical.png',
    hotspots: [
      { id: 'casualtyLetters', label: '家书', hint: '把三封家书归还给对应的阵亡者。', x: 28, y: 30, w: 32, h: 40 },
      { id: 'woundedList', label: '伤亡记录', hint: '登记伤兵与药物短缺。', x: 68, y: 42, w: 20, h: 28 },
      { id: 'toRaid', label: '战火中的村庄', hint: '离开医帐，进入战后掠夺现场。', x: 82, y: 76, w: 12, h: 12, showWhenAll: ['letters_done', 'wounded_counted'] },
    ],
  },
  raidVillage: {
    id: 'raidVillage',
    chapter: 3,
    chapterTitle: '第三关 战争的代价',
    title: '火中的村庄',
    subtitle: '劫掠发生时，税单与功劳簿同时落地',
    objective: '救下躲藏的村民，再理解这场战争如何榨干平民。',
    ambience: '官方的胜利宣讲，与眼前的人间灾难完全相反。',
    background: generatedSceneArt.burningVillage,
    hotspots: [
      { id: 'hideVillagers', label: '搜救村民', hint: '在燃烧的村中找到三处藏身点。', x: 20, y: 48, w: 26, h: 28 },
      { id: 'taxOrder', label: '战时税令', hint: '阅读前线军费如何转嫁给全民。', x: 60, y: 48, w: 15, h: 18 },
      { id: 'rationReport', label: '军粮军饷', hint: '核对前线账目与军心。', x: 76, y: 54, w: 15, h: 18 },
      { id: 'toAftermath', label: '昏迷与苏醒', hint: '主角负伤后，被村民带回。', x: 82, y: 76, w: 12, h: 12, showWhenAll: ['villagers_saved', 'tax_order_read', 'ration_report_read'] },
    ],
  },
  aftermath: {
    id: 'aftermath',
    chapter: 4,
    chapterTitle: '第四关 战争的终结',
    title: '停战前夕的村庄',
    subtitle: '平民对战争的解释与王宫完全不同',
    objective: '与村民交谈，帮忙赶羊，听孩子们给出另一组答案。',
    ambience: '真正的和平只存在于普通人的劳动与吃饭之间。',
    background: generatedSceneArt.quietVillage,
    hotspots: [
      { id: 'villagers', label: '村民争论', hint: '听见三种不同的战争立场。', x: 8, y: 40, w: 26, h: 28 },
      { id: 'sheep', label: '赶羊', hint: '别让小羊跑出羊圈。', x: 46, y: 50, w: 22, h: 24 },
      { id: 'children', label: '孩子们', hint: '他们会给出与舞者不同的谜语答案。', x: 70, y: 42, w: 18, h: 28 },
      { id: 'messenger', label: '送信者', hint: '完成村中的互动后，听见停战消息。', x: 82, y: 22, w: 12, h: 20, showWhenAll: ['villagers_heard', 'sheep_saved', 'children_met'] },
    ],
  },
  ending: {
    id: 'ending',
    chapter: 4,
    chapterTitle: '第四关 战争的终结',
    title: '停战之后',
    subtitle: '所谓胜利并没有冲淡代价',
    objective: '查看首版结局总结，返回主菜单继续测试。',
    ambience: '孩子们想要的是熏肉与星辰，平民想要的是不再征税。',
    background: generatedSceneArt.quietVillage,
    hotspots: [],
  },
}

export const chapterTitles = [
  '第一关 书房的秘密',
  '第二关 圣器的试炼',
  '第三关 战争的代价',
  '第四关 战争的终结',
] as const