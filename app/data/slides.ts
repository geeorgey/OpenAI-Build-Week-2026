export type Slide = {
  id: string;
  eyebrow: string;
  eyebrowEn: string;
  title: string;
  titleEn: string;
  lead: string;
  leadEn: string;
  points: string[];
  pointsEn: string[];
  theme: string;
  chapter: string;
};

export const slides: Slide[] = [
  {
    id: "manifesto",
    eyebrow: "OPENAI BUILD WEEK 2026 / WORK & PRODUCTIVITY",
    eyebrowEn: "OPENAI BUILD WEEK 2026 / WORK & PRODUCTIVITY",
    title: "プレゼンテーションは、\n新時代へ。\n観るものから、\n参加するものへ。",
    titleEn: "PRESENTATIONS,\nREIMAGINED.\nFROM WATCHING\nTO PARTICIPATING.",
    lead: "QRから参加し、リアクションと対話がスライドに同期する。Codex + GPT-5.6 + ChatGPT Sitesでつくった、参加型プレゼンテーション・メディア。",
    leadEn:
      "Join by QR as reactions and conversations sync to every slide—a participatory presentation medium built with Codex, GPT-5.6, and ChatGPT Sites.",
    points: ["NEW ERA PRESENTATION", "BUILT WITH CHATGPT SITES", "LIVE • VERIFIED • REMEMBERED"],
    pointsEn: ["NEW ERA PRESENTATION", "BUILT WITH CHATGPT SITES", "LIVE • VERIFIED • REMEMBERED"],
    theme: "theme-void",
    chapter: "THE IDEA",
  },
  {
    id: "ai-fatigue",
    eyebrow: "01 / THE AI PRESENTATION FATIGUE",
    eyebrowEn: "01 / THE AI PRESENTATION FATIGUE",
    title: "量産された\nAIプレゼンに、\nもう飽きている。",
    titleEn: "WE’RE TIRED OF\nMASS-PRODUCED\nAI PRESENTATIONS.",
    lead: "PowerPointもGoogle Slidesも、一発生成は簡単になった。ほぼ編集されない構成、同じトーン、予測できる視覚リズムが聞き手の注意を奪う。",
    leadEn:
      "One-shot PowerPoint and Google Slides are easy. Unedited structure, identical tone, and predictable visual rhythm are exhausting the audience.",
    points: ["ONE-SHOT GENERATION", "NO EDITORIAL JUDGMENT", "SAME STORY RHYTHM"],
    pointsEn: ["ONE-SHOT GENERATION", "NO EDITORIAL JUDGMENT", "SAME STORY RHYTHM"],
    theme: "theme-signal",
    chapter: "THE PROBLEM",
  },
  {
    id: "shared-time",
    eyebrow: "02 / THE ANTITHESIS",
    eyebrowEn: "02 / THE ANTITHESIS",
    title: "増やすべきは、\nスライドではない。\n同じ時間だ。",
    titleEn: "DON’T MAKE\nMORE SLIDES.\nMAKE SHARED TIME.",
    lead: "使い捨てのAIスライドではなく、登壇者と参加者がリアルタイムに反応し、対話し、記憶する参加型メディアをつくる。",
    leadEn:
      "Not more disposable AI slides. Build participatory media where speakers and audiences react, converse, and remember together.",
    points: ["PRESENTER", "LIVE MOMENT", "PARTICIPANT", "SHARED MEMORY"],
    pointsEn: ["PRESENTER", "LIVE MOMENT", "PARTICIPANT", "SHARED MEMORY"],
    theme: "theme-shared",
    chapter: "THE IDEA",
  },
  {
    id: "join",
    eyebrow: "03 / ONE QR. FOUR WAYS IN.",
    eyebrowEn: "03 / ONE QR. FOUR WAYS IN.",
    title: "聞くだけ、から。\n参加する、へ。",
    titleEn: "FROM\nWATCHING\nTO JOINING.",
    lead: "参加者はQRから /join へ。摩擦の少なさと、信頼できるアイデンティティを両立する。",
    leadEn:
      "A single QR opens /join. Choose the right balance between instant access and verified identity.",
    points: ["ゲスト参加", "メール認証", "Google 認証", "ChatGPT 認証"],
    pointsEn: ["Guest", "Email verified", "Google verified", "ChatGPT verified"],
    theme: "theme-citrus",
    chapter: "THE EXPERIENCE",
  },
  {
    id: "interaction",
    eyebrow: "04 / REACT IN THE MOMENT",
    eyebrowEn: "04 / REACT IN THE MOMENT",
    title: "感情を、\nそのスライドに\n置いていく。",
    titleEn: "LEAVE THE\nFEELING ON\nTHE SLIDE.",
    lead: "スタンプもコメントも、投稿された瞬間のスライド番号と結びつく。",
    leadEn:
      "Every stamp and comment is anchored to the exact slide that sparked it.",
    points: ["🔥 刺さった", "💡 発見", "👏 共感", "❓ 質問"],
    pointsEn: ["🔥 Resonated", "💡 Insight", "👏 Agree", "❓ Question"],
    theme: "theme-magenta",
    chapter: "THE EXPERIENCE",
  },
  {
    id: "context",
    eyebrow: "05 / THE COMMENT RAIL FIX",
    eyebrowEn: "05 / THE COMMENT RAIL FIX",
    title: "ページが変われば、\n会話もそこへ\n追いつく。",
    titleEn: "WHEN THE SLIDE\nMOVES, THE\nCONVERSATION FOLLOWS.",
    lead: "最後のコメントを表示し続けない。スライド遷移と同時に、該当コメント群へ自動で移動する。",
    leadEn:
      "Never pin the last comment forever. The rail automatically moves to the active slide’s conversation.",
    points: ["slide_id で永続化", "遷移時にフィルター", "該当グループへ自動スクロール"],
    pointsEn: ["Persist by slide_id", "Filter on navigation", "Auto-scroll to the matching group"],
    theme: "theme-grid",
    chapter: "THE EXPERIENCE",
  },
  {
    id: "modes",
    eyebrow: "06 / THE REVEAL",
    eyebrowEn: "06 / THE REVEAL",
    title: "これは、\nスライドではない。\nライブアプリだ。",
    titleEn: "THIS IS NOT\nA DECK.\nIT’S A LIVE APP.",
    lead: "プレゼンをSitesに置いたのではない。1つのSitesプロジェクトに、5つの体験と1つの共有状態を実装した。",
    leadEn:
      "This is not a deck hosted on Sites. It is one Sites project with five experiences connected by one shared state.",
    points: ["PRESENT", "WEB", "JOIN", "MY PAGE", "ADMIN"],
    pointsEn: ["PRESENT", "WEB", "JOIN", "MY PAGE", "ADMIN"],
    theme: "theme-sites-reveal",
    chapter: "THE REVEAL",
  },
  {
    id: "choose-path",
    eyebrow: "07 / THE ROOM CHOOSES THE NEXT PATH",
    eyebrowEn: "07 / THE ROOM CHOOSES THE NEXT PATH",
    title: "次に見るものを、\nこの場で\n決めよう。",
    titleEn: "THE ROOM\nCHOOSES\nWHAT COMES NEXT.",
    lead: "PRESENTでは会場の最多票へ。WEBではあなたが選んだ道へ。どのルートも、体験したあとで共通ストーリーへ戻る。",
    leadEn:
      "In PRESENT, the room’s top vote decides. On WEB, your click chooses the path. Every route rejoins the shared story.",
    points: ["A ライブ運営", "B マイページと記憶", "C マーケティングと関係構築", "D Codex + GPT-5.6 + SitesのBuild"],
    pointsEn: ["A Live operations", "B Personal memory", "C Relationship marketing", "D Codex + GPT-5.6 + Sites build"],
    theme: "theme-choice",
    chapter: "THE PARTICIPATION",
  },
  {
    id: "memory",
    eyebrow: "08 / YOUR PRESENTATION MEMORY",
    eyebrowEn: "08 / YOUR PRESENTATION MEMORY",
    title: "終わったあとに、\n自分の思考と\n再会する。",
    titleEn: "MEET YOUR\nOWN THINKING\nAGAIN.",
    lead: "認証済参加者はマイページで、どこにスタンプを置き、どんなコメントを残したかを時系列で振り返る。",
    leadEn:
      "Verified participants revisit every stamp and comment in a personal, slide-linked timeline.",
    points: ["参加履歴", "スライド別リアクション", "コメント再訪", "次回イベントへの接続"],
    pointsEn: ["Attendance history", "Slide reactions", "Comment recall", "Next-event connection"],
    theme: "theme-paper",
    chapter: "THE PRODUCT",
  },
  {
    id: "admin",
    eyebrow: "09 / CONTROL WITHOUT FRICTION",
    eyebrowEn: "09 / CONTROL WITHOUT FRICTION",
    title: "公開も、信頼も、\nひとつの\nコントロールルームで。",
    titleEn: "ONE CONTROL ROOM\nFOR ACCESS,\nTRUST, AND SAFETY.",
    lead: "/admin は審査用IDとパスワードで保護。主催者とBuild Week公式審査アドレスだけが、公開範囲、コメント、ユーザー、配信を管理する。",
    leadEn:
      "/admin uses allowlisted judge IDs plus a password. The owner and official Build Week reviewers manage access, comments, users, and campaigns.",
    points: ["公開", "パスワード付き限定公開", "非公開", "コメント非表示 / ユーザー管理"],
    pointsEn: ["Public", "Password protected", "Private", "Moderation / user management"],
    theme: "theme-control",
    chapter: "THE PRODUCT",
  },
  {
    id: "marketing",
    eyebrow: "10 / FROM A PRESENTATION TO A RELATIONSHIP",
    eyebrowEn: "10 / FROM A PRESENTATION TO A RELATIONSHIP",
    title: "拍手で終わらず、\n次の会話を\n始める。",
    titleEn: "DON’T END\nAT APPLAUSE.\nSTART THE NEXT LOOP.",
    lead: "従来はリード生成で終わった。Sites上で同意ベースの興味シグナルを捉え、テーマ別にセグメントし、登壇者自身が次の対話を始める。",
    leadEn:
      "Traditional tools stop at lead capture. Sites turns consented interest signals into segments and lets the presenter start the next conversation.",
    points: ["オプトイン", "興味セグメント", "配信予約", "開封・クリック・配信停止"],
    pointsEn: ["Opt-in", "Interest segments", "Scheduled delivery", "Open / click / unsubscribe"],
    theme: "theme-mail",
    chapter: "THE PRODUCT",
  },
  {
    id: "sites",
    eyebrow: "11 / BUILT IN CHATGPT SITES",
    eyebrowEn: "11 / BUILT IN CHATGPT SITES",
    title: "ひとつのアイデアを、\n動くプロダクトへ。",
    titleEn: "ONE IDEA.\nA WORKING\nPRODUCT.",
    lead: "Codex + GPT-5.6 + ChatGPT Sitesで、5つの画面、11本のAPI、8つのD1テーブル、4つの認証経路を1つの体験にした。",
    leadEn:
      "Codex, GPT-5.6, and ChatGPT Sites turned one idea into five surfaces, eleven APIs, eight D1 tables, and four identity paths.",
    points: ["5 SURFACES", "11 API ROUTES", "8 D1 TABLES", "4 IDENTITY PATHS", "1 DEPLOYED PRODUCT"],
    pointsEn: ["5 SURFACES", "11 API ROUTES", "8 D1 TABLES", "4 IDENTITY PATHS", "1 DEPLOYED PRODUCT"],
    theme: "theme-sites",
    chapter: "THE BUILD",
  },
  {
    id: "gpt-image",
    eyebrow: "12 / ONE ACTION. EVERY SCREEN.",
    eyebrowEn: "12 / ONE ACTION. EVERY SCREEN.",
    title: "スライドが変わる。\nデータが残る。\nすべての画面が応える。",
    titleEn: "THE SLIDE CHANGED.\nTHE DATABASE WROTE.\nEVERY SCREEN RESPONDED.",
    lead: "/joinのひとつの反応が共有状態になる。登壇画面は今応え、マイページは記憶し、管理画面は何が重要だったかを学ぶ。",
    leadEn:
      "One action on /join becomes shared state: the stage responds now, My Page remembers, and admin learns what mattered.",
    points: ["/JOIN", "SITES D1", "PRESENT", "MY PAGE", "ADMIN"],
    pointsEn: ["/JOIN", "SITES D1", "PRESENT", "MY PAGE", "ADMIN"],
    theme: "theme-state",
    chapter: "THE PROOF",
  },
  {
    id: "cloudflare",
    eyebrow: "13 / THE BUILD LOOP",
    eyebrowEn: "13 / THE BUILD LOOP",
    title: "アイデアから、\n公開されたプロダクトまで。\nひとつの流れで。",
    titleEn: "FROM IDEA TO\nDEPLOYED PRODUCT.\nIN ONE FLOW.",
    lead: "Codex + GPT-5.6が企画と実装を加速し、GPT Image 2がビジュアルを支え、Sitesがルート、D1、認証、公開を動かす。外部配送が必要なメールだけCloudflareへ渡す。",
    leadEn:
      "Codex and GPT-5.6 accelerate product decisions, GPT Image 2 supports the visual system, and Sites runs routes, D1, auth, and deployment. Cloudflare only delivers the email.",
    points: ["CODEX + GPT-5.6", "GPT IMAGE 2", "CHATGPT SITES", "CLOUDFLARE EMAIL"],
    pointsEn: ["CODEX + GPT-5.6", "GPT IMAGE 2", "CHATGPT SITES", "CLOUDFLARE EMAIL"],
    theme: "theme-cloud",
    chapter: "THE BUILD",
  },
  {
    id: "finale",
    eyebrow: "NEW ERA PRESENTATION / BUILD WEEK 2026",
    eyebrowEn: "NEW ERA PRESENTATION / BUILD WEEK 2026",
    title: "プレゼンできる、\nソフトウェア。\n人が参加して使える、\nプレゼンテーション。",
    titleEn: "SOFTWARE YOU\nCAN PRESENT.\nA PRESENTATION\nPEOPLE CAN USE.",
    lead: "ChatGPT Sitesは、プレゼンのアイデアを、人が入り、変え、記憶し、その先へ続けられるプロダクトにした。",
    leadEn: "ChatGPT Sites turned a presentation idea into a product people can enter, influence, remember, and continue.",
    points: ["SCAN • JOIN • REACT • REMEMBER • RELATE"],
    pointsEn: ["SCAN • JOIN • REACT • REMEMBER • RELATE"],
    theme: "theme-finale",
    chapter: "THE ASK",
  },
];
