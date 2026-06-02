import { generatedSceneArt } from './generatedSceneArt'

export type SceneId =
  | 'farmhouse'
  | 'gate'
  | 'audience'
  | 'corridor'
  | 'study'
  | 'chapel'
  | 'camp'
  | 'medical'
  | 'formation'
  | 'raidVillage'
  | 'battlefield'
  | 'recovery'
  | 'village'
  | 'ending'

export type SequenceId =
  | 'farmhouseIntro'
  | 'audienceIntro'
  | 'maidRumor'
  | 'roadToChapel'
  | 'prayer'
  | 'campGossip'
  | 'knightBriefing'
  | 'warSpeech'
  | 'raidIntro'
  | 'rescuedChild'
  | 'battlefieldFall'
  | 'recoveryIntro'
  | 'villagerDebate'
  | 'childrenAnswers'
  | 'armistice'
  | 'dancerFarewell'
  | 'endingReflection'

export interface DialogueLine {
  speaker: string
  text: string
  portrait?: string
}

export interface SequenceDefinition {
  id: SequenceId
  title: string
  lines: DialogueLine[]
  completionFlag?: string
  unlockFlags?: string[]
  goto?: SceneId
}

export interface HotspotDefinition {
  id: string
  label: string
  hint: string
  icon?: string
  x: number
  y: number
  w: number
  h: number
  action: string
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
  palette: 'warm' | 'dark'
  entrySequence?: SequenceId
  entryFlag?: string
  hotspots: HotspotDefinition[]
}

export interface NoteDefinition {
  title: string
  body: string
}

export const sceneOrder: SceneId[] = [
  'farmhouse',
  'gate',
  'audience',
  'corridor',
  'study',
  'chapel',
  'camp',
  'medical',
  'formation',
  'raidVillage',
  'battlefield',
  'recovery',
  'village',
  'ending',
]

export const chapterTitles = [
  '第一关 书房的秘密',
  '第二关 圣器的试炼',
  '第三关 战争的代价',
  '第四关 战争的终结',
] as const

export const sceneDefinitions: Record<SceneId, SceneDefinition> = {
  farmhouse: {
    id: 'farmhouse',
    chapter: 1,
    chapterTitle: chapterTitles[0],
    title: '离家',
    subtitle: '低矮农舍前的送别',
    objective: '听完父母的叮嘱，然后启程前往都城。',
    ambience: '泥泞土地和破旧篱笆提醒着主角，他渴望离开，也渴望回来时带回更好的生活。',
    background: '/art/act1/farmhouse.png',
    palette: 'warm',
    entrySequence: 'farmhouseIntro',
    entryFlag: 'farmhouse_seen',
    hotspots: [
      { id: 'leave-home', label: '启程', hint: '带着嘱托离开农舍。', x: 74, y: 50, w: 14, h: 24, action: 'goto-gate', showWhenAll: ['farmhouse_seen'] },
    ],
  },
  gate: {
    id: 'gate',
    chapter: 1,
    chapterTitle: chapterTitles[0],
    title: '王宫门口',
    subtitle: '布告栏前的人群几乎堵住了通道',
    objective: '先和小丑交谈，再查看布告，最后向守卫应聘。',
    ambience: '光亮的城门下，布告和人群把税赋、异端清查与征募推到每个人面前。',
    background: '/art/act1/palace-gate.png',
    palette: 'warm',
    hotspots: [
      { id: 'gate-clown', label: '小丑', hint: '这个古怪的引路人似乎什么都知道一点。', icon: '丑', x: 13, y: 73, w: 16, h: 18, action: 'gate-clown' },
      { id: 'gate-notices', label: '布告栏', hint: '阅读都城里最重要的五份布告。', icon: '告', x: 67, y: 54, w: 16, h: 28, action: 'gate-notices' },
      { id: 'gate-guard', label: '守卫', hint: '看完布告后，向守卫表明来意。', icon: '卫', x: 45, y: 58, w: 14, h: 26, action: 'gate-guard', showWhenAll: ['notices_read'] },
    ],
  },
  audience: {
    id: 'audience',
    chapter: 1,
    chapterTitle: chapterTitles[0],
    title: '谒见国王',
    subtitle: '王座和穹顶把人压得更渺小',
    objective: '听完任命，前往二楼走廊与书房。',
    ambience: '君王的庄严和对新书记官的淡然口气，把宫廷权力与距离感一起压到眼前。',
    background: '/art/act1/audience.png',
    palette: 'warm',
    entrySequence: 'audienceIntro',
    entryFlag: 'audience_complete',
    hotspots: [
      { id: 'to-corridor', label: '去二楼', hint: '穿过楼梯与长廊，去书房整理文件。', icon: '阶', x: 0, y: 56, w: 18, h: 28, action: 'goto-corridor', showWhenAll: ['audience_complete'], hideWhenAll: ['study_complete'] },
      { id: 'to-chapel', label: '离开王宫', hint: '再次面见国王后，前往教堂等待出征祷告。', icon: '路', x: 0, y: 56, w: 18, h: 28, action: 'goto-chapel', showWhenAll: ['study_complete'] },
    ],
  },
  corridor: {
    id: 'corridor',
    chapter: 1,
    chapterTitle: chapterTitles[0],
    title: '二楼走廊',
    subtitle: '画像、栏杆和沉默的脚步都在盯着来者',
    objective: '查看画像，然后进入书房。',
    ambience: '长廊里最不安的不是寂静，而是每一张肖像都像在审视主角。',
    background: '/art/act1/louti.png',
    palette: 'warm',
    hotspots: [
      { id: 'portrait-1', label: '画像一', hint: '“剑与勇气”的国王。', icon: '画', x: 4, y: 24, w: 18, h: 33, action: 'portrait-1' },
      { id: 'portrait-2', label: '画像二', hint: '“十字架与秩序”的国王。', icon: '画', x: 29, y: 4, w: 17, h: 34, action: 'portrait-2' },
      { id: 'portrait-3', label: '画像三', hint: '“安定与尘土”的国王。', icon: '画', x: 53, y: 23, w: 16, h: 31, action: 'portrait-3' },
      { id: 'portrait-4', label: '画像四', hint: '“王权荣耀”的国王。', icon: '画', x: 81, y: 5, w: 14, h: 27, action: 'portrait-4' },
      { id: 'study-door', label: '书房门', hint: '门就在走廊右前方。', icon: '门', x: 69, y: 14, w: 18, h: 38, action: 'goto-study' },
    ],
  },
  study: {
    id: 'study',
    chapter: 1,
    chapterTitle: chapterTitles[0],
    title: '书房调查',
    subtitle: '棋局、财政、密信与征兵文书同时压上桌面',
    objective: '调查四个关键线索，确认国王发动战争的真实处境。',
    ambience: '桌面的秩序越整齐，底下藏着的秘密就越让人不安。',
    background: '/art/act1/study.png',
    palette: 'warm',
    hotspots: [
      { id: 'study-draft', label: '征兵起草书', hint: '桌面中央那份新写的征召敕令。', icon: '令', x: 51, y: 58, w: 14, h: 12, action: 'study-draft' },
      { id: 'study-finance', label: '财政报告', hint: '桌上右侧的一沓报告。', icon: '账', x: 69, y: 53, w: 14, h: 15, action: 'study-finance' },
      { id: 'study-search', label: '搜寻桌底', hint: '先探到桌板底部，再确认那里到底藏了什么。', icon: '寻', x: 54, y: 73, w: 20, h: 13, action: 'study-search', hideWhenAll: ['study_letter_search'] },
      { id: 'study-letter', label: '桌底密信', hint: '桌板背面压着一封折得很紧的密信。', icon: '信', x: 55, y: 74, w: 18, h: 12, action: 'study-letter', showWhenAll: ['study_letter_search'] },
      { id: 'study-chess', label: '残局棋盘', hint: '走出最少步数的终局，换取兵力报告。', icon: '棋', x: 11, y: 54, w: 16, h: 16, action: 'study-chess', hideWhenAll: ['study_chess'] },
      { id: 'study-report', label: '兵力报告', hint: '残局完成后，棋盘下压着的报告已经露了出来。', icon: '报', x: 11, y: 54, w: 16, h: 16, action: 'study-report', showWhenAll: ['study_chess'] },
      { id: 'study-chronicle', label: '历书', hint: '书架上有一本被故意倒放的王室历书。', icon: '书', x: 4, y: 16, w: 14, h: 24, action: 'study-chronicle' },
      { id: 'study-enlist', label: '面见国王', hint: '线索已足够，是时候做出选择。', icon: '王', x: 85, y: 12, w: 10, h: 20, action: 'study-enlist', showWhenAll: ['study_draft', 'study_finance', 'study_letter', 'study_chess'] },
    ],
  },
  chapel: {
    id: 'chapel',
    chapter: 2,
    chapterTitle: chapterTitles[1],
    title: '教堂与高塔',
    subtitle: '祷告、经书、圣器与舞者试炼在同一处交织',
    objective: '先听祷告，再完成经书、圣器和舞者的三重试炼。',
    ambience: '战争在这里被包裹成神圣仪式，连好奇心都像一种罪。',
    background: '/art/act2/church.png',
    palette: 'warm',
    entrySequence: 'roadToChapel',
    entryFlag: 'road_to_chapel_seen',
    hotspots: [
      { id: 'chapel-prayer', label: '祷告', hint: '站在教堂正门前，听教皇为战争祷告。', icon: '祷', x: 40, y: 34, w: 18, h: 32, action: 'chapel-prayer' },
      { id: 'chapel-scripture', label: '藏经室', hint: '从侧门潜入，翻开《民数记》。', icon: '经', x: 8, y: 36, w: 16, h: 26, action: 'chapel-scripture', showWhenAll: ['prayer_heard'] },
      { id: 'chapel-relic', label: '圣器试炼', hint: '把四件圣器与教义一一对应。', icon: '圣', x: 64, y: 38, w: 14, h: 22, action: 'chapel-relic', showWhenAll: ['scriptures_read'] },
      { id: 'chapel-dancer', label: '舞者与高塔', hint: '完成试炼后，面对舞者的谜语。', icon: '舞', x: 80, y: 25, w: 12, h: 34, action: 'chapel-dancer', showWhenAll: ['relic_trial_done'] },
    ],
  },
  camp: {
    id: 'camp',
    chapter: 3,
    chapterTitle: chapterTitles[2],
    title: '寒夜军营',
    subtitle: '潮木、饥饿与疲惫士兵围着一堆难以点燃的火',
    objective: '先把火生起来，再去听骑士布置医帐差事。',
    ambience: '战前的荣光叙事消失了，留下来的只有湿木头、烟和咳嗽。',
    background: '/art/act3/camp.png',
    palette: 'dark',
    hotspots: [
      { id: 'camp-fire', label: '木堆', hint: '按文档要求完成生火小游戏。', icon: '火', x: 40, y: 64, w: 18, h: 16, action: 'camp-fire' },
      { id: 'camp-soldiers', label: '士兵', hint: '火点着后，听他们聊补给和粮食。', icon: '兵', x: 31, y: 54, w: 22, h: 18, action: 'camp-gossip', showWhenAll: ['fire_done'] },
      { id: 'camp-knight', label: '骑士', hint: '接受去医帐记录阵亡者的命令。', icon: '骑', x: 56, y: 40, w: 16, h: 28, action: 'camp-knight', showWhenAll: ['fire_done'] },
      { id: 'camp-medical', label: '去医帐', hint: '点好篝火并领到命令后继续前进。', icon: '帐', x: 84, y: 24, w: 12, h: 28, action: 'goto-medical', showWhenAll: ['knight_briefed'] },
    ],
  },
  medical: {
    id: 'medical',
    chapter: 3,
    chapterTitle: chapterTitles[2],
    title: '医帐',
    subtitle: '家书被弄混，伤员挤在狭窄的棚子里',
    objective: '先把家书归位，再找出真正的伤兵，最后继续前进。',
    ambience: '兵员统计和伤口之间没有缓冲，文件和尸体只隔着几步。',
    background: '/art/act3/medical.png',
    palette: 'dark',
    hotspots: [
      { id: 'medical-letters', label: '家书', hint: '按遗体特征归还三封家书。', icon: '信', x: 18, y: 34, w: 26, h: 40, action: 'medical-letters' },
      { id: 'medical-wounded', label: '伤兵登记', hint: '在拥挤的人堆里找出真正受伤的人。', icon: '伤', x: 59, y: 36, w: 24, h: 34, action: 'medical-wounded' },
      { id: 'medical-advance', label: '列阵出发', hint: '医帐事务处理完后，去听骑士的战前动员。', icon: '旗', x: 82, y: 72, w: 12, h: 12, action: 'medical-advance', showWhenAll: ['letters_done', 'wounded_counted'] },
    ],
  },
  formation: {
    id: 'formation',
    chapter: 3,
    chapterTitle: chapterTitles[2],
    title: '列阵出发',
    subtitle: '盔甲与祷词在长列中一同前压',
    objective: '跟上整队前行的军伍，继续向前。',
    ambience: '从口号到脚步，只剩下一种整齐到让人窒息的推进。',
    background: '/art/act3/7-07.png',
    palette: 'dark',
    hotspots: [
      { id: 'formation-advance', label: '继续前进', hint: '越过队列，走向即将被焚毁的村庄。', icon: '进', x: 44, y: 62, w: 16, h: 22, action: 'goto-raid-village' },
    ],
  },
  raidVillage: {
    id: 'raidVillage',
    chapter: 3,
    chapterTitle: chapterTitles[2],
    title: '火中的村庄',
    subtitle: '哭喊、劫掠和税单一起落在地上',
    objective: '先救下躲藏的村民，再读懂税令与军饷文书，最后进入战场。',
    ambience: '士兵口中的“酬劳”和眼前平民的灾难，终于再也无法被同一句话遮住。',
    background: generatedSceneArt.burningVillage,
    palette: 'dark',
    entrySequence: 'raidIntro',
    entryFlag: 'raid_intro_seen',
    hotspots: [
      { id: 'raid-rescue', label: '藏身点', hint: '在农舍、草垛和马车附近救出村民。', icon: '救', x: 16, y: 48, w: 18, h: 22, action: 'raid-rescue' },
      { id: 'raid-tax', label: '战时税令', hint: '送走孩子后，捡起那张纳税布告。', icon: '税', x: 58, y: 49, w: 12, h: 18, action: 'raid-tax', showWhenAll: ['villagers_saved'] },
      { id: 'raid-ration', label: '军饷文书', hint: '回到骑士营帐后，查看账目。', icon: '饷', x: 72, y: 54, w: 14, h: 16, action: 'raid-ration', showWhenAll: ['villagers_saved'] },
      { id: 'raid-battlefield', label: '战场', hint: '当村民、税令和军饷三件事都看清后，进入最后的战场。', icon: '战', x: 83, y: 16, w: 12, h: 20, action: 'goto-battlefield', showWhenAll: ['villagers_saved', 'tax_order_read', 'ration_report_read'] },
    ],
  },
  battlefield: {
    id: 'battlefield',
    chapter: 3,
    chapterTitle: chapterTitles[2],
    title: '失序战场',
    subtitle: '号角、蹄声和昏暗天光同时朝主角压来',
    objective: '见证这一章的崩塌。',
    ambience: '所有宏大叙述在这里都只剩下混乱、负伤和失去意识前的一瞥。',
    background: generatedSceneArt.battlefield,
    palette: 'dark',
    entrySequence: 'battlefieldFall',
    entryFlag: 'battlefield_seen',
    hotspots: [],
  },
  recovery: {
    id: 'recovery',
    chapter: 4,
    chapterTitle: chapterTitles[3],
    title: '苏醒',
    subtitle: '农舍里的火光比战场上的火更像活着',
    objective: '听完农妇的话，走出农舍，去村里看看。',
    ambience: '这里没有口号，只有把伤员从田野拖回家的普通人。',
    background: generatedSceneArt.recoveryRoom,
    palette: 'warm',
    entrySequence: 'recoveryIntro',
    entryFlag: 'recovery_seen',
    hotspots: [
      { id: 'recovery-leave', label: '去村里', hint: '离开农舍，去村里走走。', icon: '路', x: 78, y: 36, w: 14, h: 36, action: 'goto-village', showWhenAll: ['recovery_seen'] },
    ],
  },
  village: {
    id: 'village',
    chapter: 4,
    chapterTitle: chapterTitles[3],
    title: '停战前夕的村庄',
    subtitle: '和平在这里不是口号，而是能否好好过日子',
    objective: '听村民争论、帮忙赶羊、听孩子们回答谜语，再等送信者带来消息。',
    ambience: '村里每一个答案都比教堂和王宫的答案更接近生活。',
    background: generatedSceneArt.quietVillage,
    palette: 'warm',
    hotspots: [
      { id: 'village-villagers', label: '村民', hint: '听听他们对战争的不同看法。', icon: '民', x: 12, y: 48, w: 20, h: 24, action: 'village-villagers' },
      { id: 'village-sheep', label: '羊圈', hint: '帮农妇把惊扰的小羊都赶回去。', icon: '羊', x: 70, y: 48, w: 20, h: 24, action: 'village-sheep' },
      { id: 'village-children', label: '孩子们', hint: '他们会给出另一套谜语答案。', icon: '童', x: 42, y: 44, w: 18, h: 28, action: 'village-children' },
      { id: 'village-messenger', label: '送信者', hint: '完成村中的互动后，等待停战消息。', icon: '信', x: 80, y: 20, w: 12, h: 24, action: 'village-messenger', showWhenAll: ['villagers_heard', 'sheep_saved', 'children_met'] },
    ],
  },
  ending: {
    id: 'ending',
    chapter: 4,
    chapterTitle: chapterTitles[3],
    title: '战争之后',
    subtitle: '胜利没有替普通人擦掉代价',
    objective: '读完尾声，回到主菜单或重新开始。',
    ambience: '真正留下来的不是战报，而是熏肉、耕犁、星辰和活下去的愿望。',
    background: generatedSceneArt.quietVillage,
    palette: 'warm',
    entrySequence: 'endingReflection',
    entryFlag: 'ending_seen',
    hotspots: [],
  },
}

export const sequenceDefinitions: Record<SequenceId, SequenceDefinition> = {
  farmhouseIntro: {
    id: 'farmhouseIntro',
    title: '送别',
    completionFlag: 'farmhouse_seen',
    lines: [
      { speaker: '母亲', text: '亲爱的，带上这些荞麦饼，路上要照顾好自己。' },
      { speaker: '父亲', text: '老爷这次让你办事是对你的信任，我的孩子，我想等你回来就可以留在老爷身边做事了。' },
      { speaker: '主角', text: '哦，老爷和我倒是都觉得在都城多待一会也挺好' },
      { speaker: '母亲', text: '没有老爷，哪里有我们。愿上帝永远保佑他。' },
      { speaker: '主角', text: '放心吧，我想等我下次回来，我们家的栅栏就可以重新修缮一下了。' },
    ],
  },
  audienceIntro: {
    id: 'audienceIntro',
    title: '任命',
    completionFlag: 'audience_complete',
    lines: [
      { speaker: '国王', text: '年轻人，希望你能热爱这份工作，王宫内的工作并不像你庄园里的工作。' },
      { speaker: '主角', text: '当然陛下，我会珍惜这个工作机会的，往后我必谨言慎行，妥善处置分内事务。' },
      { speaker: '国王', text: '即日起，你便入宫廷供职，执掌文书。' },
      { speaker: '主角', text: '谢陛下擢用。' },
      { speaker: '国王', text: '书房在王宫二楼，你先去将文件整理一下吧。' },
    ],
  },
  maidRumor: {
    id: 'maidRumor',
    title: '女仆的传闻',
    completionFlag: 'maid_met',
    lines: [
      { speaker: '主角', text: '您好，请问您认识**吗？' },
      { speaker: '女仆', text: '我就是……不过您有什么事吗，有的话请您快点，我现在还有很多工作要做……' },
      { speaker: '主角', text: '不是我，是您的哥哥，他已经许久没有见到您，十分地担心，希望您照顾好自己，可以的话向家里寄个消息。' },
      { speaker: '女仆', text: '哦，天哪，我最近真是忙晕了头。' },
      { speaker: '女仆', text: '谢谢您，我会的，您要是再见到他可以向他报个平安。您是新来的书记官？' },
      { speaker: '主角', text: '是的' },
      { speaker: '女仆', text: '真数不清你是第几个了，陛下总是疑神疑鬼，但我听说上个书记官离开是因为看见了国王将一封信藏在了书桌底下。' },
      { speaker: '女仆', text: '哦，我真该走了。最近下人似乎总惹陛下生气，宫里的女仆越来越少了，现在我一个人要做好几个人的活！' },
      { speaker: '女仆', text: '祝您好运！' },
      { speaker: '主角', text: '谢谢，也祝您好运。' },
    ],
  },
  roadToChapel: {
    id: 'roadToChapel',
    title: '再次相遇',
    completionFlag: 'road_to_chapel_seen',
    lines: [
      { speaker: '小丑', text: '哦，年轻人，我们又见面了~你这是又要去哪？' },
      { speaker: '主角', text: '很高兴再次遇见你先生，我即将加入我们神圣的军队，去创造明日的伟业。帮陛下整理文件时，我看见我的军队有……名士兵，陛下又新拨了……英镑作为军饷。' },
      { speaker: '主角', text: '教皇今日将在教堂为我们的出征祷告，我们必将凯旋！' },
      { speaker: '小丑', text: '真是恭喜你年轻人！' },
      { speaker: '小丑', text: '愿上帝能够保佑你！希望我们再次见面时您已经达成心中所想。' },
      { speaker: '小丑', text: '不过我听闻教堂后院的阁楼上住着一位高尚的舞者，她舞动之时铃声清越。我想她应该不会拒绝一位年轻英雄的诚挚拜访。' },
      { speaker: '主角', text: '谢谢您先生，再会。' },
    ],
  },
  prayer: {
    id: 'prayer',
    title: '战前祷告',
    completionFlag: 'prayer_heard',
    lines: [
      { speaker: '教皇', text: '全能至善的天父，执掌万国权柄、裁定世间攻守，护佑信众子民。' },
      { speaker: '教皇', text: '今日，汝麾下忠贞将士，披甲执戈，辞别故土，为守护疆土、庇护信民、捍卫正教大义奔赴疆场。' },
      { speaker: '教皇', text: '吾以圣座之名虔诚祈告：愿主圣光庇佑此行将士，涤荡其身罪孽，坚定其心信仰。' },
      { speaker: '教皇', text: '赐他们行路安稳，渡川越岭无有险阻；赐他们身姿坚毅，临阵对敌无所畏惧；赐他们心智清明，攻守进退皆合正道。' },
      { speaker: '教皇', text: '愿主的仁慈与荣光，常伴军旅左右，亘古不息。' },
      { speaker: '教皇', text: '以圣父、圣子、圣灵之名，阿门。' },
    ],
  },
  campGossip: {
    id: 'campGossip',
    title: '火堆边',
    completionFlag: 'soldiers_heard',
    lines: [
      { speaker: '士兵1', text: '总算是把火给生起来了。' },
      { speaker: '士兵2', text: '咳咳，这烟真是呛死我了。' },
      { speaker: '士兵1', text: '这该死的天气，木头都是潮的。' },
      { speaker: '士兵3', text: '何止木头，我听说连送来的粮食都有一大半发了霉，没发现最近发给我们的食物越来越少了吗？' },
      { speaker: '士兵2', text: '不要担心，马上就要攻打下一个村庄了' },
    ],
  },
  knightBriefing: {
    id: 'knightBriefing',
    title: '命令',
    completionFlag: 'knight_briefed',
    lines: [
      { speaker: '骑士', text: '你来了，我的孩子，初到军营这几天还习惯吗？' },
      { speaker: '主角', text: '……谢谢您费心，还算习惯。' },
      { speaker: '骑士', text: '近来伤寒频发，医帐又多了不少人，去记录一下阵亡的士兵吧。' },
      { speaker: '主角', text: '是，大人' },
    ],
  },
  warSpeech: {
    id: 'warSpeech',
    title: '战前动员',
    completionFlag: 'speech_heard',
    lines: [
      { speaker: '骑士', text: '今日，是神圣的一日。' },
      { speaker: '骑士', text: '但凡今日浴血、坚守阵前之人，必将被永世铭记。有幸活过今日的将士，往后岁岁年年，每逢此节，必昂首挺胸、引以为傲。' },
      { speaker: '骑士', text: '他日安坐乡里、宴请邻里之时，他必将卷起衣袖，展露身上的战伤，向世人诉说自己在今日的功勋。' },
      { speaker: '骑士', text: '纵使岁月老去、记忆斑驳，他此生最难忘的，仍是今日之战、今日同袍。' },
      { speaker: '骑士', text: '那些安居故土、未曾赴战的人，终将自认卑微，悔恨自己错失今日的荣光。往后每逢这个日子，他们便会心生愧赧，自觉不配称为男人。' },
      { speaker: '骑士', text: '从今日起，直至世界终结，世人永远不会遗忘这一天。' },
      { speaker: '骑士', text: '我们寥寥数人，何其有幸，我们是并肩一体的兄弟之师。' },
      { speaker: '骑士', text: '今日与我浴血并肩者，皆是我的手足兄弟；无论出身贵贱、无论门第高低，自此一战，皆与我同荣同尊。' },
      { speaker: '骑士', text: '此刻在家中安然度日的绅士，日后必将悔恨，为何不曾站在这片沙场，与我们一同铸就传奇。' },
      { speaker: '骑士', text: '举起兵刃，奋勇向前！' },
      { speaker: '骑士', text: '记住，你们来自古老而神圣的国家；你们的父母、妻子和孩子正在那里等待你们；我们必须凯旋而归。' },
      { speaker: '骑士', text: '为国家、为国王、为荣光！' },
    ],
  },
  raidIntro: {
    id: 'raidIntro',
    title: '掠夺',
    completionFlag: 'raid_intro_seen',
    lines: [
      { speaker: '士兵1', text: '这些都拿上！我们常年浴血厮杀，命悬一线，总要' },
      { speaker: '士兵2', text: '这些人安居乡土，坐拥物产，我们拿取些许，不过是讨要本该属于自己的酬劳。' },
      { speaker: '旁白', text: '……（主角发现骑士默许了这些行为）' },
    ],
  },
  rescuedChild: {
    id: 'rescuedChild',
    title: '孩子',
    completionFlag: 'child_saved',
    lines: [
      { speaker: '旁白', text: '孩子给主角指了一条小路。' },
      { speaker: '旁白', text: '在此过程中，主角捡到一张村中有关纳税的告示。' },
    ],
  },
  battlefieldFall: {
    id: 'battlefieldFall',
    title: '崩塌',
    completionFlag: 'battlefield_seen',
    goto: 'recovery',
    lines: [
      { speaker: '画外音', text: '号角声' },
      { speaker: '某个士兵', text: '敌军突袭了！' },
      { speaker: '旁白', text: '混乱的马蹄声，嘶吼声。' },
      { speaker: '士兵们', text: '以全能的上帝、圣乔治之名，拔旗前进，圣乔治保佑我们！' },
      { speaker: '旁白', text: '敌军反攻，主角在战场上负伤，在晕过去前仿佛又看见了舞者殿中哀悼的天使。' },
    ],
  },
  recoveryIntro: {
    id: 'recoveryIntro',
    title: '苏醒',
    completionFlag: 'recovery_seen',
    lines: [
      { speaker: '农妇A', text: '哦，谢天谢地您终于醒了。' },
      { speaker: '主角', text: '我这是……' },
      { speaker: '农妇B', text: '孩子们在村外田野间发现了您，您当时看上去马上就要断气了。' },
      { speaker: '主角', text: '真是太感谢你们了。' },
      { speaker: '农妇A', text: '没事的，现在还没有军队的消息，您现在这里休整一段时间吧，村庄的风景非常美丽，您可以四处看看，对您养伤或许有好处。' },
    ],
  },
  villagerDebate: {
    id: 'villagerDebate',
    title: '路边争论',
    completionFlag: 'villagers_heard',
    lines: [
      { speaker: 'A', text: '战争再不结束，我就要吃不上饭了。' },
      { speaker: 'B', text: '上帝啊，我今年的收成已经上交近七成了。' },
      { speaker: 'C', text: '你们俩这是说的什么话？这是国王的圣战、是骑士的荣耀！打赢了，我们的领地就会扩大，敌人就不敢再犯！等大军凯旋，国王定会赏赐土地、减免赋税，到时候我们就能过上好日子！' },
      { speaker: 'A', text: '呵，我只看见自家的麦子被军马踩烂，看见邻居家的儿子被抓去当兵，尸骨都没带回来，看见家家户户掏空家底缴税填战事的窟窿。' },
      { speaker: 'C', text: '可若是败了，敌军会烧村劫掠，我们会死得更惨！唯有奋勇作战，打赢一切敌人，才能永绝后患！等战争结束，一切都会好起来的。' },
      { speaker: 'B', text: '我只盼这场荒唐的仗能早点打完。' },
      { speaker: 'A', text: '仗总有一天会打完的，希望那个时候老爷能减免我们的赋税。' },
      { speaker: 'C', text: '……' },
      { speaker: 'B', text: '希望吧……' },
    ],
  },
  childrenAnswers: {
    id: 'childrenAnswers',
    title: '孩子们的答案',
    completionFlag: 'children_met',
    lines: [
      { speaker: '小孩A', text: '抱歉先生，我们没注意到您，您的伤没事吧。' },
      { speaker: '主角', text: '没事，你认识我。' },
      { speaker: '小孩B', text: '当然，就是我们在田野上发现你的。' },
      { speaker: '主角', text: '战斗刚刚结束，你们去田野上做什么？' },
      { speaker: '小孩C', text: '寻找像您这样的伤员先生，我们现在已经是娴熟的老手了。' },
      { speaker: '小孩B', text: '大人的眼睛总是没有我们看得远。' },
      { speaker: '主角', text: '是吗，你们还做什么？' },
      { speaker: '小孩A', text: '帮忙向军队运送物资先生，偶尔还会在山头侦察敌情。' },
      { speaker: '主角', text: '……你们吃过山上的浆果吗？' },
      { speaker: '小孩A', text: '当然！灌丛里的浆果，我们饿了常常吃它。' },
      { speaker: '主角', text: '那田里的耕犁呢，你们见过吗？' },
      { speaker: '小孩B', text: '见过！春天的时候耕犁翻开泥土，整片田地都是新土的味道。' },
      { speaker: '主角', text: '晚上呢，你们看到过什么？' },
      { speaker: '小孩C', text: '头顶的星辰呀，比都城的所有灯火都亮。' },
      { speaker: '主角', text: '……' },
      { speaker: '小孩A', text: '先生你怎么了？' },
      { speaker: '主角', text: '没什么。只是在都城的时候，有人问过我同样的问题，但他们的答案和你们的完全不同。' },
      { speaker: '主角', text: '她说是苹果、是长剑、是金币。而你们说……是浆果、是耕犁、是星辰。' },
      { speaker: '小孩B', text: '那谁答对了？' },
      { speaker: '主角', text: '……你们都答对了。只是对的东西不一样。' },
    ],
  },
  dancerFarewell: {
    id: 'dancerFarewell',
    title: '舞者的送别',
    goto: 'camp',
    lines: [
      { speaker: '舞者', text: '看来你已经看过藏经室里的故事了。' },
      { speaker: '主角', text: '是的。' },
      { speaker: '舞者', text: '看来这次的战斗十分有信心。' },
      { speaker: '主角', text: '我相信这次的战斗是正义的，上帝将站在我们这边，我们的士兵会像三百勇士一般大破敌军。' },
      { speaker: '舞者', text: '……那祝你好运，我的孩子。' },
    ],
  },
  armistice: {
    id: 'armistice',
    title: '停战消息',
    completionFlag: 'ending_unlocked',
    goto: 'ending',
    lines: [
      { speaker: '送信者', text: '敌国投降了，敌国投降了！' },
      { speaker: '村民', text: '和约是怎么说的？' },
      { speaker: '送信者', text: '他们承认了，全然承认上帝为天地唯一正统、万权之主，要彻底弃绝一切异端虚妄、悖逆私念，归顺正统王权与教廷圣统。' },
      { speaker: '村民', text: '哦，谁在意这个了。他们赔款多少？' },
      { speaker: '送信者', text: '并没有赔款，他们向国王割让了两国交界的一个城，并献上了圣物。' },
      { speaker: '村民', text: '什么圣物。' },
      { speaker: '送信者', text: '……一个襁褓' },
      { speaker: '村民A', text: '哦，上帝啊，听闻那个城已经连续三年遭遇虫灾，需要其他城池的援助了。' },
      { speaker: '村民B', text: '别这么想亲爱的，这总比继续打仗要好的多。' },
      { speaker: '小孩A', text: '战争结束了！' },
      { speaker: '小孩B', text: '啊，妈妈，明天的炖菜里可以加点熏肉吗？' },
    ],
  },
  endingReflection: {
    id: 'endingReflection',
    title: '尾声',
    completionFlag: 'ending_seen',
    lines: [
      { speaker: '村民A', text: '哦，上帝啊，听闻那个城已经连续三年遭遇虫灾，需要其他城池的援助了。' },
      { speaker: '村民B', text: '别这么想亲爱的，这总比继续打仗要好的多。' },
      { speaker: '小孩A', text: '战争结束了！' },
      { speaker: '小孩B', text: '啊，妈妈，明天的炖菜里可以加点熏肉吗？' },
    ],
  },
}

export const noteDefinitions: Record<string, NoteDefinition> = {
  notices: {
    title: '布告栏',
    body: `布告一：
奉都城主教之命，联合都城市政当局执行，通告都城全体教民、市民：
为修缮都城主教堂、供养教区教士、接济教堂贫苦教民，凡都城内有收入者均需缴纳年收入的十分之一。
本次征收自本月十日起，至本月三十日止，教民可前往各教区分教堂缴纳，非教民可前往市政厅指定征税点缴纳，不得拖延、隐匿收入、拒绝缴纳。逾期未缴者将被限制在都城内经商、务工；凡虚报收入、逃避宗教税者，罚款三倍，情节严重者，通报教会及王室，予以相应惩戒。
严禁任何人煽动民众拒绝缴纳宗教税，凡造谣、煽动者，杖责二十，流放城外，终身不得进入都城。
神圣纪年1290年

布告二：
奉教皇训谕、都城主教之命，联合都城市政当局、异端裁判所执行，通告都城全体教民、市民及驻城人员：
近日都城内发现异教踪迹，部分恶徒背弃天主教教义，私传异端邪说，诋毁教皇与教会蛊惑民众背离信仰，扰乱都城秩序，已触怒上帝与王室权威。为肃清异端、捍卫正统信仰，特下令在都城内全面清查异教徒，通告如下：
一、凡信奉异教、私传异端邪说、藏匿异教典籍者，限三日内主动前往异端裁判所或各教区分教堂自首，坦白罪行、交出异教典籍，可从轻发落，杖责十下，罚银币三枚。
二、凡知情不报、包庇异教徒、为异教徒提供居所或藏匿异教典籍者，与异教徒同罪，杖责二十，没收全部财产，流放城外。
三、凡举报异教徒行踪、揭发异教活动者，赏银币十五枚。
四、严禁任何民众围观、议论异教相关事宜，不得传播异教言论，违者罚铜币五枚，屡教不改者，杖责十，情节严重者按包庇异教论处。
望全体民众敬畏上帝、坚守正统信仰，主动配合清查，共同肃清异端，守护都城安宁，若有违背，必遭上帝谴责与世俗严惩。
神圣纪年1290年

布告三：
本年度都城日常赋税调整如下，自本月起执行：
一是粮食税，凡在都城内售卖粮食、储存粮食者，每石粮食缴铜币三枚，由市场管理处代为征收；
二是房屋税，都城内所有房屋（含商铺、住宅、作坊），按房屋大小缴纳，小型住宅缴铜币三枚，商铺、大型住宅缴银币两枚；
三是入市税，凡从城外进入都城售卖货物、务工者，每人缴铜币两枚。
凡新增商铺、作坊，需在开业前到市政厅登记，缴纳登记税银币一枚，方可开业；凡停业、迁离都城者，需到市政厅注销，结清所有赋税，否则将被列入都城黑名单，终身不得再进入都城。
神圣纪年1289年

（本年度都城日常赋税调整如下，自本月起执行：
一是粮食税，凡在都城内售卖粮食、储存粮食者，每石粮食缴铜币两枚，由市场管理处代为征收；
二是房屋税，都城内所有房屋（含商铺、住宅、作坊），按房屋大小缴纳，小型住宅缴铜币两枚，商铺、大型住宅缴银币一枚；
三是入市税，凡从城外进入都城售卖货物、务工者，每人缴铜币一枚。
凡新增商铺、作坊，需在开业前到市政厅登记，缴纳登记税银币一枚，方可开业；凡停业、迁离都城者，需到市政厅注销，结清所有赋税，否则将被列入都城黑名单，终身不得再进入都城。
神圣纪年1285年）
【隐藏在布告三下面，发现可达成一个成就】

布告四：
今王室需招收书记官，特面向都城内招揽年满十六至二十五岁，身强力壮、无残疾、无犯罪记录，能识文断字、诵读公文，品行端正、忠诚守信，愿终身侍奉国王、恪守王室规矩，教民优先录用。
严禁虚报条件、伪造身份证明，凡识字造假、伪装健壮者，一经查实，杖责十五下，罚银币三枚，列入都城黑名单，终身不得被王室录用。
望都城有志青年，踊跃报名。
神圣纪年1290年

布告五：
本月十五日为“神命休战”起始日，至本月二十日止，期间禁止都城内一切私战、斗殴，驻守都城的骑士不得率军劫掠平民、焚毁街巷，违者将受上帝谴责，亦会被王室追责、剥夺骑士身份。
神圣纪年1288年`,
  },
  draft: {
    title: '征兵起草书',
    body: `奉国王之命，由都城市政当局通告都城全体骑士、自由民、手工业者及底层帮工：
今已至关键之时，国王下令征召年满十六至六十岁、身强力壮之男子，凡驻城骑士者，需自带铠甲、战马，于本月二十日在都城广场集合，随国王军队出征；凡自由民、手工业者、底层帮工，自愿参军者，可免除三年都城所有赋税，战死沙场者，其家人可获得王室庇护，免缴赋税五年，且可在都城内获得一块份地。
凡逃避征召、隐匿不出者，将被剥夺自由身，逐出都城，其土地、财产予以没收；若有虚报年龄、假装残疾者，杖责二十，罚银币五枚，终身不得在都城内务工、经商。`,
  },
  finance: {
    title: '财政报告',
    body: `本年度实收岁入明细
常年平稳年度全境常规岁入均值：30100 英镑
本年度全境实际到库岁入：20820 英镑
分项实收明细如下：
1. 各郡领地包税、直属王室领地农产贡金：9200 英镑
2. 市镇通行关税、市集规费、商贸抽成：5120 英镑
3. 贵族免役税、封地承袭金、教会年度贡赋：4500 英镑
4. 矿山产出、林地租税、司法罚金等杂项收入：2000 英镑
年度法定刚性固定支出
本项支出为国本刚需，依王国旧法与戍边规制，不可减免、不可拖欠。本年度刚性总支出：33900 英镑
分项支出明细如下：
1. 边境戍军粮饷、兵员补给、军械修缮与驻防津贴：25000 英镑
2. 全境城堡、边防工事、官道港埠修缮维护：5300 英镑
3. 地方治安官、法庭官吏、国库在岗职员固定薪俸：3600 英镑
年度财政核算结果
本年度实收岁入：17820 英镑
本年度法定刚性支出：33900 英镑
本年度最终财政赤字：16080 英镑
国库往年结余已连续两年填补赤字，现存库存公帑已不足以支撑换季补给与临时应急事务，王国财政已陷入紧张困局。

往年宫廷年度专项开支：4200 英镑
本年度核定宫廷最大拨付额度：2000 英镑
节流执行条例：
1. 王室大型宴飨、庆典仪式、仪仗添置、外邦礼节馈赠全数停支；
2. 王室织物、珍宝摆件、装饰器物、非刚需采买全面终止；
3. 宫廷灯火、薪炭、食材、日用耗材统一定额，削减七成供给；
4. 宫廷闲散侍从、临时杂役、冗余文职全数停薪，暂停一切新增岗位招募；
5. 宫廷新增文书誊录、账目核对、卷宗归档等公务，统一由在岗及新任王室书记官承接，不再新增薪俸支出。
王室财政署 谨呈`,
  },
  secretLetter: {
    title: '桌底密信',
    body: `致西邻在位君主：
列国君权正统，皆凭血脉世系、教廷授命而立，此为不可僭越之古法。
吾手握你王室绝密旧证。（世人皆认你为正统嗣君，实则你先君宫闱私生子，伪承大统、欺瞒教廷与朝野。）【烧毁模糊部分】
（你本伪统，无天命法理。）【烧毁模糊部分】若吾将旧卷、人证递交教廷，教皇必颁绝罚令，废你神授王权。你境封臣皆可背弃效忠、举兵清逆。
吾隐忍不发，非惧你国力，实为予你保位安邦之机。今立私约自本年起，你每岁秋末，遣无名密使赴边境秘地交割三千五百英镑黄金，数额时限恒定，不得迟误、短缺、克扣分毫。
你若如约纳贡，吾将封存所有秘证，永保你王位安稳、正统虚名。
你若推诿、敷衍或暗藏异心，吾即刻公示你秘闻、上奏教廷、通告列国与封臣。届时你众叛亲离、国破位失，皆是自取其咎。
祸福自取，望你慎行。
无印密书，不见官文，唯以秘证为凭`,
  },
  troopReport: {
    title: '兵力报告',
    body: `现下王国无足额野战主力，全境可调度正规戍军总计一千八百七十人，为立国以来兵力最寡之时。
今依王国古制计划征召郡区自由民、佃户民兵，本轮征兵预计征召总额六千人。待本次征兵全数完成、兵员整编到位后，王国全境在册总兵力可达七千八百余人。届时王国武备充盈、兵甲充足，军备实力将大幅提升。
新增兵员皆经严格甄选、统一操练，短时间内即可形成有效战力。全军建制规整、兵源充足、排布严密，足以震慑邻邦、稳固社稷，护佑王国疆域安稳、百姓安居。
王国军政官 谨呈`,
  },
  chronicle: {
    title: '王室历书',
    body: `第一代： 
王冕呈三瓣之形，饰纹极简，未见珠宝镶嵌。衣袍红灰相间，肩披披风，身侧佩剑，英气外露。其人须发浓密，目光坚毅，显勇武之君。盖常年征伐，以战为业，故冠服尚简，唯佩剑不离身。

第二代： 
王冕素朴，仅饰三枚圆石与十字，无繁复雕镂。衣袍形制简古，色彩素净，未见华彩。其人面相庄肃，气度沉凝。盖重功业而轻仪饰，冠服不求其华，而威德自著。

第三代： 
王冕形制规整，呈锯齿状，通体金黄，无额外装饰。衣袍为暖橙色调，有层次分明的镶边，较前二者略见讲究。其人面容沉毅，目光沉稳，显治世之君气象。盖国力渐盛，仪制初备，故冠服虽不尚繁奢，已有王朝之仪。

第四代：
王冕雕镂繁复，饰以叶纹、圆钻，工艺精巧，金光璀璨。衣袍为深蓝色，镶金边，领口内白外蓝，层次分明，极尽华美。其人发色浅金，面如雕塑，显盛世君主之容。盖王权鼎盛，国库充盈，故冠服极尽奢丽，彰显威仪。`,
  },
  portrait1: {
    title: '画像一',
    body: '“剑与勇气，便是我王冠上最耀眼的宝石。”',
  },
  portrait2: {
    title: '画像二',
    body: '“我冠上只有十字架，心中却装着帝国的秩序。”',
  },
  portrait3: {
    title: '画像三',
    body: '“当天下安定，我的衣冠也终于不必再沾满尘土。”',
  },
  portrait4: {
    title: '画像四',
    body: '“王冠上的每一道花纹，都写着王权的荣耀与力量。”',
  },
  scripture: {
    title: '《民数记》与圣器线索',
    body: `主角翻开《民书记》，上面记载着米甸讨伐战的经过

……
25:2 因为摩押女子叫百姓来，一同给她们的神献祭，百姓就吃她们的祭物，跪拜她们的神。25:3 以色列人与巴力毗珥连合，耶和华的怒气就向以色列发作。
25:4 耶和华吩咐摩西说：“将百姓中所有的族长在我面前对着日头悬挂，使我向以色列人所发的怒气可以消了。”
25:5 于是摩西吩咐以色列的审判官说：“凡属你们的人，有与巴力毗珥连合的，你们各人要把他们杀了。”
25:6 以色列人正哭泣的时候，有以色列人中的一个人，当着摩西和全会众的眼前，带了一个米甸女子到他弟兄那里去。
25:7 祭司亚伦的孙子、以利亚撒的儿子非尼哈看见了，就从会众中站起来，手里拿着枪，25:8 跟随那以色列人进帐棚，将二人，就是以色列人和那女子，由腹中刺透。这样，瘟疫就止住了。
25:9 那时遭瘟疫死的，有二万四千人。
……
31:1 耶和华吩咐摩西说：
31:2 “你要在米甸人身上报以色列人的仇，后来要归到你列祖（原文作 “本民”）那里。”
31:3 摩西吩咐百姓说：“要从你们中间叫人带兵器出去攻击米甸，好在米甸人身上为耶和华报仇。
31:4 从以色列众支派中，每支派要打发一千人去打仗。”
31:5 于是从以色列千万人中，每支派交出一千人，共一万二千人，带着兵器预备打仗。
31:6 摩西就打发每支派的一千人去打仗，并打发祭司以利亚撒的儿子非尼哈同去，非尼哈手里拿着圣所的器皿和吹大声的号筒。
31:7 他们就照耶和华所吩咐摩西的，与米甸人打仗，杀了所有的男丁。
31:8 在所杀的人中，杀了米甸的五王，就是以未、利金、苏珥、户珥、利巴，又用刀杀了比珥的儿子巴兰。
31:9 以色列人掳了米甸人的妇女、孩子，并将他们的牲畜、羊群和所有的财物都夺了来，当作掳物，
31:10 又用火焚烧他们所住的城邑和所有的营寨，
31:11 把一切所夺的、所掳的，连人带牲畜都带了去，
31:12 将掳物和所夺的牲畜、财物，都带到摩押平原、约旦河边、耶利哥对面，交给摩西和祭司以利亚撒，并以色列的全会众。
31:13 摩西和祭司以利亚撒，并会众一切的首领，都出到营外迎接他们。
……
31:19 你们要在营外驻扎七日；凡杀了人的，或是摸了被杀的，你们和你们掳来的人口，都要在第三日和第七日洁净自己。
31:20 也要洁净一切衣服、皮子做的物件、山羊毛织的物件、木器。
31:21 祭司以利亚撒对打仗回来的兵丁说：“耶和华所吩咐摩西律法中的条例乃是这样：
31:22 金、银、铜、铁、锡、铅，
31:23 凡能见火的，必过火就洁净，然而还要用水洁净；凡不能见火的，必过水洗。
31:24 第七日，你们要洗衣服，就洁净了，然后可以进营。”
……
31:50 我们就把各人所得的金器，就是臂环、手镯、打印的戒指、耳环、手钏，都送来为耶和华的供物，好在耶和华面前为我们赎罪。”
31:51 摩西和祭司以利亚撒就收了他们的金子，都是打成的器皿。
31:52 千夫长、百夫长所献给耶和华的金子，共有一万六千七百五十舍客勒。
31:53 各兵丁都为自己夺了财物。
31:54 摩西和祭司以利亚撒将金子带到会幕里，作为以色列人在耶和华面前的纪念。`,
  },
  taxOrder: {
    title: '战时助役税令',
    body: `今全境军队共7800人出征，为捍卫国土正统、守护疆土安宁，全军将士戍边浴血、往来征伐。军旅粮草、甲胄兵器、军饷薪俸、伤卒抚恤，所需浩大，国库开支日繁。为续战事、固守军威，特颁战时助役税令，共需缴纳税款60000余镑，全境臣民一体遵行。
值此战乱之秋，国事为重。凡境内臣民，皆赖王土庇护、律法安身，故当共担国难、共济军需。此番征税，专为补给前线军旅，不供王室奢靡私用，全境官吏不得私吞克扣、额外摊派，违者严惩不贷。
兹定纳税规制，阖境遵照施行：
其一，凡保有土地、持有动产、营生立业之自由民、农户、行会商户，须缴纳本年度动产什一税，即个人租息、粮产、可动财物的十分之一，尽数上缴村镇税官。
其二，乡间庶民以粮代税，缴纳秋收谷物、腌肉粗布；市镇商户以银币完税，足额上缴国库派驻官吏。
其三，所有税物、税银须于三十日内尽数清缴，由地方郡守、教区执事、税官三方核验登记，造册归档，以备王室核查。
凡按时完税者，记录在册，享太平之年赋税优免之权；凡拖延、隐匿、拒缴、瞒报财物者，以抗役论罪，罚没财物、拘禁惩戒，绝不宽宥。
兵戈未息，家国一体。民出赋税以养兵，兵执干戈以卫民。待战事平息、疆土安定，王室必减赋休民，令四方安生、百业复苏。
特此布告，晓谕全境，人人知悉，即刻遵行。`,
  },
  rationReport: {
    title: '军饷与建制文书',
    body: `本次在册官兵、征召民兵、随军辅役合计458人.
其中阵亡官兵：6人
重伤人员：13 人 
轻伤人员：37 人
连日行军交战，士卒疲敝，军械略有损耗。阵亡者已就地收敛安葬，重伤人员安排辅役护送前往后方修道院与临时医帐救治。全军建制完整，军心尚稳，可遵令继续执行驻防、巡防或进军指令。

圣历秋日，奉王室财务官令，依规核发本季军饷。
本次共发军饷3000英镑，本次军饷全数由王室国库拨付，无拖欠、无截留、无官吏私扣。凡军中士卒，不论征召、常备、步卒弓手，一律按规分发。
本队统领已当众点验钱粮，全数收讫。全军将士领受无误，账目属实，特此立文存档，以备核查。
签收：前线军团统领
监发：王室财政官、教区执事`,
  },
}
