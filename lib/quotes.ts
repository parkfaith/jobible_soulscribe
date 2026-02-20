// 명언 카테고리(Category) 타입
export type QuoteCategory = 'quote' | 'poem' | 'speech' | 'literature';
// 난이도(Difficulty) 타입: 단문 → 중문 → 장문 로드맵
export type QuoteDifficulty = 'short' | 'medium' | 'long';

export interface Quote {
  text: string;
  source: string;
  context: string;
  translation: string;
  category: QuoteCategory;
  difficulty: QuoteDifficulty;
}

export const QUOTES: Quote[] = [
  // ─── 명언 (단문) ───────────────────────────────────────────────
  {
    text: "In the middle of every difficulty lies opportunity.",
    source: "Albert Einstein",
    context: "Physicist & Philosopher",
    translation: "모든 어려움의 한가운데에 기회가 있다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "The only way to do great work is to love what you do.",
    source: "Steve Jobs",
    context: "Stanford Commencement, 2005",
    translation: "위대한 일을 하는 유일한 방법은 당신이 하는 일을 사랑하는 것이다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    source: "Confucius",
    context: "The Analects",
    translation: "멈추지 않는 한, 얼마나 천천히 가는지는 중요하지 않다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "The secret of getting ahead is getting started.",
    source: "Mark Twain",
    context: "Attributed",
    translation: "앞서가는 비결은 시작하는 것이다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    source: "John Lennon",
    context: "Beautiful Boy, 1980",
    translation: "삶이란 다른 계획을 세우느라 바쁜 사이에 일어나는 것이다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "Be the change you wish to see in the world.",
    source: "Mahatma Gandhi",
    context: "Attributed",
    translation: "당신이 세상에서 보고 싶은 변화가 되어라.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "Whether you think you can or think you can't, you're right.",
    source: "Henry Ford",
    context: "Attributed",
    translation: "할 수 있다고 생각하든 할 수 없다고 생각하든, 당신이 옳다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "The unexamined life is not worth living.",
    source: "Socrates",
    context: "Apology, 399 BC",
    translation: "성찰하지 않는 삶은 살 가치가 없다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "Happiness is not something ready-made. It comes from your own actions.",
    source: "Dalai Lama XIV",
    context: "Modern Wisdom",
    translation: "행복은 미리 만들어진 것이 아니다. 그것은 당신 자신의 행동에서 온다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "We accept the love we think we deserve.",
    source: "Stephen Chbosky",
    context: "The Perks of Being a Wallflower, 1999",
    translation: "우리는 우리가 받을 자격이 있다고 생각하는 사랑을 받아들인다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "Not all those who wander are lost.",
    source: "J.R.R. Tolkien",
    context: "The Fellowship of the Ring, 1954",
    translation: "방황하는 자가 모두 길을 잃은 것은 아니다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "Yesterday is history, tomorrow is a mystery, today is a gift. That is why it is called the present.",
    source: "Eleanor Roosevelt",
    context: "Attributed",
    translation: "어제는 역사, 내일은 미스터리, 오늘은 선물이다. 그래서 '현재(present)'라 부른다.",
    category: 'quote',
    difficulty: 'medium'
  },
  // ─── 명언 (중문) ───────────────────────────────────────────────
  {
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    source: "Ralph Waldo Emerson",
    context: "Self-Reliance, 1841",
    translation: "끊임없이 당신을 다른 무언가로 만들려는 세상에서 자기 자신이 되는 것이 가장 위대한 성취다.",
    category: 'quote',
    difficulty: 'medium'
  },
  {
    text: "Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did.",
    source: "Mark Twain",
    context: "Attributed",
    translation: "20년 후 당신은 했던 일보다 하지 않았던 일로 더 실망할 것이다.",
    category: 'quote',
    difficulty: 'medium'
  },
  {
    text: "The cave you fear to enter holds the treasure you seek.",
    source: "Joseph Campbell",
    context: "The Hero with a Thousand Faces, 1949",
    translation: "들어가기 두려운 동굴에 당신이 찾는 보물이 있다.",
    category: 'quote',
    difficulty: 'short'
  },
  {
    text: "It is not the strongest of the species that survives, nor the most intelligent; it is the one most adaptable to change.",
    source: "Charles Darwin",
    context: "On the Origin of Species, 1859",
    translation: "살아남는 것은 가장 강한 종도, 가장 똑똑한 종도 아니다. 변화에 가장 잘 적응하는 종이다.",
    category: 'quote',
    difficulty: 'medium'
  },
  {
    text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.",
    source: "Dr. Seuss",
    context: "Oh, the Places You'll Go!, 1990",
    translation: "당신은 머리에 뇌가 있고, 신발 안에 발이 있다. 당신이 선택하는 어떤 방향으로든 나아갈 수 있다.",
    category: 'quote',
    difficulty: 'medium'
  },
  // ─── 연설문 (중문·장문) ────────────────────────────────────────
  {
    text: "Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.",
    source: "Martin Luther King Jr.",
    context: "Strength to Love, 1963",
    translation: "어둠으로는 어둠을 몰아낼 수 없다. 오직 빛만이 그렇게 할 수 있다. 증오로는 증오를 몰아낼 수 없다. 오직 사랑만이.",
    category: 'speech',
    difficulty: 'medium'
  },
  {
    text: "Ask not what your country can do for you — ask what you can do for your country.",
    source: "John F. Kennedy",
    context: "Inaugural Address, January 20, 1961",
    translation: "나라가 당신을 위해 무엇을 해 줄 수 있는지를 묻지 말고, 당신이 나라를 위해 무엇을 할 수 있는지를 물어라.",
    category: 'speech',
    difficulty: 'medium'
  },
  {
    text: "We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets, we shall never surrender.",
    source: "Winston Churchill",
    context: "Speech to the House of Commons, June 4, 1940",
    translation: "우리는 해변에서 싸울 것이고, 상륙 지점에서 싸울 것이고, 들판과 거리에서 싸울 것이다. 우리는 결코 항복하지 않을 것이다.",
    category: 'speech',
    difficulty: 'long'
  },
  {
    text: "I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.",
    source: "Martin Luther King Jr.",
    context: "I Have a Dream Speech, August 28, 1963",
    translation: "나에게는 꿈이 있습니다. 내 네 아이들이 언젠가 피부색이 아닌 인격의 내용으로 평가받는 나라에서 살게 되는 꿈이.",
    category: 'speech',
    difficulty: 'long'
  },
  // ─── 시 (Poem) ────────────────────────────────────────────────
  {
    text: "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.",
    source: "Robert Frost",
    context: "The Road Not Taken, 1916",
    translation: "숲속에서 두 길이 갈라졌고, 나는 사람이 덜 다닌 길을 택했다. 그리고 그것이 모든 것을 바꿔놓았다.",
    category: 'poem',
    difficulty: 'medium'
  },
  {
    text: "Do not go gentle into that good night. Rage, rage against the dying of the light.",
    source: "Dylan Thomas",
    context: "Do Not Go Gentle into That Good Night, 1951",
    translation: "그 어두운 밤 속으로 순순히 들어가지 마라. 사라져가는 빛에 맞서 분노하고, 또 분노하라.",
    category: 'poem',
    difficulty: 'short'
  },
  {
    text: "Because I could not stop for Death, He kindly stopped for me; The Carriage held but just Ourselves and Immortality.",
    source: "Emily Dickinson",
    context: "Because I could not stop for Death, c. 1863",
    translation: "내가 죽음을 위해 멈출 수 없었기에, 그가 친절히 나를 위해 멈춰주었다. 마차에는 우리 둘과 불멸만이 타고 있었다.",
    category: 'poem',
    difficulty: 'medium'
  },
  {
    text: "Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all.",
    source: "Emily Dickinson",
    context: "Hope is the Thing with Feathers, c. 1861",
    translation: "희망은 깃털 달린 것으로 영혼에 깃들어, 가사 없는 선율을 노래하며, 결코 멈추지 않는다.",
    category: 'poem',
    difficulty: 'medium'
  },
  {
    text: "I am the master of my fate, I am the captain of my soul.",
    source: "William Ernest Henley",
    context: "Invictus, 1875",
    translation: "나는 내 운명의 주인이며, 나는 내 영혼의 선장이다.",
    category: 'poem',
    difficulty: 'short'
  },
  // ─── 문학 (Literature) ────────────────────────────────────────
  {
    text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.",
    source: "Charles Dickens",
    context: "A Tale of Two Cities, 1859",
    translation: "그것은 최고의 시절이었고, 최악의 시절이었으며, 지혜의 시대였고, 어리석음의 시대였다.",
    category: 'literature',
    difficulty: 'medium'
  },
  {
    text: "All animals are equal, but some animals are more equal than others.",
    source: "George Orwell",
    context: "Animal Farm, 1945",
    translation: "모든 동물은 평등하다. 그러나 어떤 동물은 다른 동물보다 더 평등하다.",
    category: 'literature',
    difficulty: 'short'
  },
  {
    text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    source: "Jane Austen",
    context: "Pride and Prejudice, 1813",
    translation: "상당한 재산을 가진 독신 남성은 반드시 아내를 원해야 한다는 것이 보편적으로 인정된 진리다.",
    category: 'literature',
    difficulty: 'medium'
  },
  {
    text: "So we beat on, boats against the current, borne back ceaselessly into the past.",
    source: "F. Scott Fitzgerald",
    context: "The Great Gatsby, 1925",
    translation: "그렇게 우리는 흐름에 거슬러 나아가며, 끊임없이 과거 속으로 떠밀려간다.",
    category: 'literature',
    difficulty: 'short'
  }
];

// 오늘의 명언 반환 (연중 일수 기반으로 매일 다른 명언 제공)
export function getTodayQuote(): Quote {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}

// AI 피드백 캐싱용 오늘의 명언 인덱스 (1-based, sentence_id로 사용)
export function getTodayQuoteIndex(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return (dayOfYear % QUOTES.length) + 1;
}

// 카테고리별 명언 필터링
export function getQuotesByCategory(category: QuoteCategory): Quote[] {
  return QUOTES.filter(q => q.category === category);
}

// 난이도별 명언 필터링
export function getQuotesByDifficulty(difficulty: QuoteDifficulty): Quote[] {
  return QUOTES.filter(q => q.difficulty === difficulty);
}
