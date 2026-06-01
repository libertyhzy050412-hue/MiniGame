const svgToDataUri = (svg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`

export const generatedSceneArt = {
  audienceHall: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="#eee0c4"/>
      <rect y="640" width="1600" height="260" fill="#d0a15f"/>
      <rect x="0" y="0" width="1600" height="80" fill="#b78653"/>
      <rect x="200" y="120" width="180" height="460" rx="80" fill="#d9b88a"/>
      <rect x="470" y="120" width="180" height="460" rx="80" fill="#d9b88a"/>
      <rect x="950" y="120" width="180" height="460" rx="80" fill="#d9b88a"/>
      <rect x="1220" y="120" width="180" height="460" rx="80" fill="#d9b88a"/>
      <rect x="700" y="180" width="200" height="520" fill="#9f2f2a"/>
      <path d="M700 180L800 70L900 180Z" fill="#c79a58"/>
      <rect x="625" y="620" width="350" height="120" fill="#6f3b26"/>
      <rect x="740" y="470" width="120" height="170" rx="16" fill="#b78653"/>
      <rect x="768" y="390" width="64" height="120" rx="16" fill="#6f3b26"/>
      <rect x="730" y="415" width="24" height="110" rx="12" fill="#6f3b26"/>
      <rect x="846" y="415" width="24" height="110" rx="12" fill="#6f3b26"/>
      <path d="M80 900L800 520L1520 900Z" fill="#5b382c" opacity="0.58"/>
      <circle cx="800" cy="250" r="64" fill="#d8c17a"/>
      <rect x="765" y="210" width="70" height="24" fill="#7c5634"/>
      <rect x="775" y="180" width="14" height="48" fill="#7c5634"/>
      <rect x="812" y="180" width="14" height="48" fill="#7c5634"/>
      <path d="M100 120L200 260L300 120Z" fill="#8d2930"/>
      <path d="M1300 120L1400 260L1500 120Z" fill="#8d2930"/>
    </svg>
  `),
  burningVillage: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="burnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2d2529"/>
          <stop offset="55%" stop-color="#71443a"/>
          <stop offset="100%" stop-color="#ba6c3b"/>
        </linearGradient>
        <linearGradient id="burnGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5e4538"/>
          <stop offset="100%" stop-color="#2c211d"/>
        </linearGradient>
        <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffd48a" stop-opacity="0.95"/>
          <stop offset="42%" stop-color="#ff9547" stop-opacity="0.78"/>
          <stop offset="100%" stop-color="#ff9547" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#burnSky)"/>
      <ellipse cx="840" cy="228" rx="420" ry="118" fill="#ffb66d" opacity="0.22"/>
      <path d="M0 286C194 208 332 346 500 290C674 232 788 360 954 316C1168 260 1340 184 1600 236V0H0Z" fill="#55363a" opacity="0.88"/>
      <path d="M0 366C218 318 404 248 608 308C774 358 938 430 1140 390C1330 352 1458 282 1600 302V598H0Z" fill="#6f4739" opacity="0.72"/>
      <rect y="560" width="1600" height="340" fill="url(#burnGround)"/>
      <path d="M0 690C194 632 368 600 544 640C746 686 904 770 1114 736C1296 706 1438 630 1600 612V900H0Z" fill="#3a2a24"/>
      <path d="M0 776C220 720 422 706 640 770C842 830 1048 838 1268 796C1408 770 1506 738 1600 712V900H0Z" fill="#241a18"/>

      <g opacity="0.26" fill="#1f1816">
        <path d="M212 416L248 192L292 416Z"/>
        <path d="M344 426L382 164L426 426Z"/>
        <path d="M1164 404L1210 154L1256 404Z"/>
        <path d="M1322 422L1364 190L1408 422Z"/>
        <path d="M726 438L770 208L814 438Z"/>
      </g>

      <g fill="#2a1d1b" opacity="0.72">
        <ellipse cx="236" cy="232" rx="116" ry="138"/>
        <ellipse cx="304" cy="176" rx="86" ry="110"/>
        <ellipse cx="812" cy="194" rx="124" ry="148"/>
        <ellipse cx="1230" cy="204" rx="138" ry="160"/>
        <ellipse cx="1358" cy="150" rx="94" ry="122"/>
      </g>

      <g>
        <rect x="118" y="430" width="270" height="238" fill="#6d4030"/>
        <polygon points="86,440 252,268 426,440" fill="#3a231f"/>
        <rect x="170" y="514" width="58" height="154" fill="#3b251f"/>
        <rect x="280" y="516" width="42" height="84" fill="#241918"/>
        <path d="M150 430L208 378L240 430Z" fill="#261917"/>
        <path d="M258 430L314 368L352 430Z" fill="#261917"/>
      </g>

      <g>
        <rect x="666" y="452" width="276" height="216" fill="#663e2f"/>
        <polygon points="632,468 804,302 974,468" fill="#341f1d"/>
        <rect x="772" y="532" width="56" height="136" fill="#2c1d1a"/>
        <rect x="700" y="506" width="48" height="92" fill="#291c1a"/>
        <rect x="864" y="500" width="44" height="84" fill="#291c1a"/>
      </g>

      <g>
        <rect x="1108" y="408" width="316" height="260" fill="#704332"/>
        <polygon points="1068,422 1264,226 1462,422" fill="#392320"/>
        <rect x="1170" y="516" width="70" height="152" fill="#2f201c"/>
        <rect x="1292" y="512" width="52" height="94" fill="#271b19"/>
      </g>

      <g opacity="0.86">
        <ellipse cx="248" cy="618" rx="128" ry="96" fill="url(#fireGlow)"/>
        <ellipse cx="804" cy="626" rx="134" ry="104" fill="url(#fireGlow)"/>
        <ellipse cx="1288" cy="630" rx="156" ry="116" fill="url(#fireGlow)"/>
      </g>

      <g fill="#ff8a36">
        <path d="M194 694C230 612 286 590 336 532C314 620 352 632 340 710C330 780 250 790 194 694Z"/>
        <path d="M248 718C270 650 312 632 350 588C338 658 366 668 358 724C350 780 294 792 248 718Z" fill="#ffb767"/>
        <path d="M724 714C762 622 814 604 864 544C842 630 876 646 866 724C856 794 772 802 724 714Z"/>
        <path d="M778 742C806 672 844 652 876 610C866 676 894 686 886 742C878 786 828 798 778 742Z" fill="#ffb767"/>
        <path d="M1196 716C1236 618 1302 600 1358 536C1330 634 1370 650 1358 730C1348 804 1258 814 1196 716Z"/>
        <path d="M1264 748C1288 678 1332 660 1368 612C1358 682 1384 692 1378 746C1370 792 1324 806 1264 748Z" fill="#ffb767"/>
      </g>

      <g fill="#2d221f">
        <rect x="538" y="660" width="124" height="30" rx="8" transform="rotate(-12 538 660)"/>
        <rect x="940" y="692" width="136" height="26" rx="8" transform="rotate(10 940 692)"/>
        <rect x="106" y="734" width="188" height="22" rx="11"/>
        <rect x="1268" y="742" width="210" height="24" rx="12"/>
        <rect x="352" y="724" width="74" height="82" rx="12" fill="#4a3127"/>
        <rect x="1162" y="716" width="86" height="96" rx="14" fill="#4a3127"/>
      </g>

      <g fill="#1f1715" opacity="0.74">
        <path d="M468 694C486 668 500 654 514 650C520 676 514 700 496 722Z"/>
        <path d="M1008 704C1026 676 1042 660 1060 654C1066 684 1056 708 1034 730Z"/>
        <path d="M1450 684C1464 662 1478 648 1494 642C1498 668 1492 694 1474 712Z"/>
      </g>

      <g fill="#1a1210" opacity="0.82">
        <circle cx="540" cy="560" r="8"/>
        <circle cx="560" cy="548" r="6"/>
        <circle cx="520" cy="572" r="7"/>
        <rect x="530" y="536" width="16" height="34" rx="8"/>
        <rect x="514" y="548" width="10" height="18" rx="4"/>
        <rect x="546" y="546" width="10" height="18" rx="4"/>
        <rect x="530" y="524" width="14" height="14" rx="7"/>
      </g>

      <g fill="#1a1210" opacity="0.78">
        <circle cx="1080" cy="540" r="8"/>
        <circle cx="1100" cy="526" r="6"/>
        <rect x="1070" y="510" width="16" height="38" rx="8"/>
        <rect x="1054" y="524" width="10" height="18" rx="4"/>
        <rect x="1086" y="522" width="10" height="18" rx="4"/>
        <rect x="1070" y="498" width="14" height="14" rx="7"/>
        <line x1="1092" y1="520" x2="1130" y2="480" stroke="#1a1210" stroke-width="3" stroke-linecap="round"/>
      </g>

      <g fill="#ecc88c" opacity="0.48">
        <path d="M600 480L608 462L616 480Z"/>
        <path d="M960 510L968 492L976 510Z"/>
        <path d="M1340 460L1348 442L1356 460Z"/>
      </g>

      <g fill="#e8945c" opacity="0.64">
        <circle cx="580" cy="440" r="3"/>
        <circle cx="610" cy="418" r="2.5"/>
        <circle cx="596" cy="454" r="2"/>
        <circle cx="920" cy="450" r="3"/>
        <circle cx="950" cy="428" r="2"/>
        <circle cx="940" cy="464" r="2.5"/>
        <circle cx="1320" cy="410" r="3"/>
        <circle cx="1348" cy="390" r="2.5"/>
        <circle cx="1335" cy="434" r="2"/>
        <circle cx="630" cy="398" r="2"/>
        <circle cx="970" cy="406" r="2"/>
      </g>

      <rect x="0" y="0" width="1600" height="900" fill="#120d0d" opacity="0.18"/>
    </svg>
  `),
  quietVillage: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="#efe0c6"/>
      <rect y="590" width="1600" height="310" fill="#c9b378"/>
      <path d="M0 0H1600V260C1460 300 1290 260 1160 280C960 310 890 180 700 210C500 238 380 350 0 300Z" fill="#f1ca7b"/>
      <path d="M0 320C230 240 420 200 610 258C760 304 880 362 1120 316C1300 282 1450 232 1600 260V590H0Z" fill="#b68b62"/>
      <path d="M0 380C200 340 320 300 510 362C720 430 1000 420 1180 366C1350 316 1470 290 1600 314V590H0Z" fill="#8b5b39"/>
      <rect x="160" y="380" width="360" height="250" fill="#f7d28a"/>
      <polygon points="120,390 340,220 560,390" fill="#b37a46"/>
      <rect x="740" y="420" width="320" height="200" fill="#d8b17a"/>
      <polygon points="700,430 900,280 1100,430" fill="#a56f43"/>
      <rect x="1160" y="465" width="220" height="140" fill="#7f6849"/>
      <rect x="1190" y="490" width="160" height="90" rx="20" fill="#d7d7d7"/>
      <circle cx="1268" cy="532" r="30" fill="#efefef"/>
      <circle cx="1236" cy="548" r="34" fill="#efefef"/>
      <circle cx="1298" cy="550" r="30" fill="#efefef"/>
      <circle cx="260" cy="490" r="56" fill="#718154"/>
      <circle cx="960" cy="360" r="54" fill="#718154"/>
      <circle cx="1420" cy="520" r="64" fill="#718154"/>
      <circle cx="1460" cy="560" r="50" fill="#4d6422"/>
      <circle cx="1422" cy="560" r="50" fill="#475a22"/>
      <circle cx="282" cy="516" r="46" fill="#4d6422"/>
      <path d="M0 840C240 700 500 730 760 840C1020 950 1320 900 1600 820V900H0Z" fill="#a46b3d"/>
    </svg>
  `),
  battlefield: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="#1f1d22"/>
      <rect y="580" width="1600" height="320" fill="#352f2f"/>
      <path d="M0 0H1600V180C1420 210 1310 140 1110 170C860 208 820 300 600 280C360 258 230 178 0 230Z" fill="#4d3c48"/>
      <path d="M0 90C210 50 360 120 550 100C760 76 900 16 1090 42C1290 70 1450 130 1600 96V0H0Z" fill="#b06d5f"/>
      <path d="M0 650C170 610 320 560 470 598C610 634 700 710 860 690C1060 666 1170 560 1360 570C1452 576 1520 610 1600 632V900H0Z" fill="#473d34"/>
      <path d="M300 580L360 320L420 580Z" fill="#5c5148"/>
      <path d="M470 560L530 290L590 560Z" fill="#5c5148"/>
      <path d="M1100 570L1160 280L1220 570Z" fill="#5c5148"/>
      <path d="M1250 590L1310 360L1370 590Z" fill="#5c5148"/>
      <rect x="260" y="535" width="180" height="18" rx="9" fill="#1e1a1d" opacity="0.7"/>
      <rect x="1140" y="548" width="190" height="18" rx="9" fill="#1e1a1d" opacity="0.7"/>
      <path d="M768 610C742 520 772 434 850 390C938 342 1048 378 1100 454C1148 526 1148 648 1120 732C1082 718 1062 684 1022 664C964 632 886 650 848 706C822 742 812 782 808 842H688V706C686 670 664 642 626 620C582 596 520 590 474 608C432 624 412 652 380 674C344 620 348 526 398 454C460 362 612 326 706 408C774 468 790 540 768 610Z" fill="#d5c6ac" opacity="0.82"/>
      <path d="M800 580L742 702H858Z" fill="#2a2528"/>
      <circle cx="755" cy="490" r="20" fill="#d5c6ac" opacity="0.82"/>
      <circle cx="845" cy="490" r="20" fill="#d5c6ac" opacity="0.82"/>
      <path d="M725 812C744 760 770 740 800 740C830 740 856 760 875 812" stroke="#d5c6ac" stroke-width="18" stroke-linecap="round" opacity="0.82" fill="none"/>
      <path d="M0 0" fill="none"/>
    </svg>
  `),
  recoveryRoom: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <rect width="1600" height="900" fill="#f0e3c8"/>
      <rect y="640" width="1600" height="260" fill="#cda15f"/>
      <rect x="0" y="0" width="1600" height="140" fill="#8c5c39"/>
      <rect x="102" y="210" width="336" height="470" fill="#d7b684"/>
      <rect x="132" y="240" width="276" height="410" fill="#7d5235"/>
      <rect x="170" y="280" width="36" height="270" fill="#3a2419"/>
      <rect x="230" y="290" width="36" height="260" fill="#6c4a27"/>
      <rect x="290" y="284" width="36" height="266" fill="#8b6530"/>
      <rect x="350" y="300" width="36" height="250" fill="#495b28"/>
      <rect x="1080" y="200" width="280" height="420" fill="#cf934b"/>
      <rect x="1118" y="230" width="204" height="360" fill="#f3b965"/>
      <rect x="1215" y="230" width="16" height="360" fill="#7a4b31"/>
      <rect x="1118" y="400" width="204" height="16" fill="#7a4b31"/>
      <rect x="610" y="520" width="460" height="180" fill="#6d4633"/>
      <rect x="650" y="490" width="370" height="140" fill="#b8926a"/>
      <rect x="676" y="514" width="318" height="88" rx="26" fill="#efece1"/>
      <rect x="958" y="460" width="80" height="90" fill="#915132"/>
      <rect x="940" y="548" width="116" height="26" fill="#6d4633"/>
      <circle cx="998" cy="440" r="34" fill="#f6c46c"/>
      <path d="M998 356L1014 424H982Z" fill="#f6c46c"/>
      <rect x="982" y="424" width="32" height="40" rx="12" fill="#f1d29b"/>
      <ellipse cx="730" cy="622" rx="118" ry="28" fill="#d8d1c2" opacity="0.84"/>
      <ellipse cx="780" cy="628" rx="148" ry="36" fill="#f4efe4"/>
      <circle cx="1180" cy="340" r="16" fill="#ffd36a" opacity="0.84"/>
      <circle cx="1268" cy="340" r="16" fill="#ffd36a" opacity="0.84"/>
      <circle cx="1224" cy="300" r="16" fill="#ffd36a" opacity="0.84"/>
    </svg>
  `),
} as const