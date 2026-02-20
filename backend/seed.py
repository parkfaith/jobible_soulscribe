"""
daily_sentences 테이블에 초기 명언 데이터를 삽입하는 시드 스크립트.
사용법: python seed.py
"""

from database import get_db, init_db

QUOTES = [
    ("In the middle of every difficulty lies opportunity.", "Albert Einstein", "Physicist & Philosopher", "모든 어려움의 한가운데에 기회가 있다.", "quote", "short"),
    ("The only way to do great work is to love what you do.", "Steve Jobs", "Stanford Commencement, 2005", "위대한 일을 하는 유일한 방법은 당신이 하는 일을 사랑하는 것이다.", "quote", "short"),
    ("It does not matter how slowly you go as long as you do not stop.", "Confucius", "The Analects", "멈추지 않는 한, 얼마나 천천히 가는지는 중요하지 않다.", "quote", "short"),
    ("The secret of getting ahead is getting started.", "Mark Twain", "Attributed", "앞서가는 비결은 시작하는 것이다.", "quote", "short"),
    ("Life is what happens when you're busy making other plans.", "John Lennon", "Beautiful Boy, 1980", "삶이란 다른 계획을 세우느라 바쁜 사이에 일어나는 것이다.", "quote", "short"),
    ("Be the change you wish to see in the world.", "Mahatma Gandhi", "Attributed", "당신이 세상에서 보고 싶은 변화가 되어라.", "quote", "short"),
    ("Whether you think you can or think you can't, you're right.", "Henry Ford", "Attributed", "할 수 있다고 생각하든 할 수 없다고 생각하든, 당신이 옳다.", "quote", "short"),
    ("The unexamined life is not worth living.", "Socrates", "Apology, 399 BC", "성찰하지 않는 삶은 살 가치가 없다.", "quote", "short"),
    ("Happiness is not something ready-made. It comes from your own actions.", "Dalai Lama XIV", "Modern Wisdom", "행복은 미리 만들어진 것이 아니다. 그것은 당신 자신의 행동에서 온다.", "quote", "short"),
    ("We accept the love we think we deserve.", "Stephen Chbosky", "The Perks of Being a Wallflower, 1999", "우리는 우리가 받을 자격이 있다고 생각하는 사랑을 받아들인다.", "quote", "short"),
    ("Not all those who wander are lost.", "J.R.R. Tolkien", "The Fellowship of the Ring, 1954", "방황하는 자가 모두 길을 잃은 것은 아니다.", "quote", "short"),
    ("Yesterday is history, tomorrow is a mystery, today is a gift. That is why it is called the present.", "Eleanor Roosevelt", "Attributed", "어제는 역사, 내일은 미스터리, 오늘은 선물이다. 그래서 '현재(present)'라 부른다.", "quote", "medium"),
    ("To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", "Ralph Waldo Emerson", "Self-Reliance, 1841", "끊임없이 당신을 다른 무언가로 만들려는 세상에서 자기 자신이 되는 것이 가장 위대한 성취다.", "quote", "medium"),
    ("Twenty years from now you will be more disappointed by the things you didn't do than by the ones you did.", "Mark Twain", "Attributed", "20년 후 당신은 했던 일보다 하지 않았던 일로 더 실망할 것이다.", "quote", "medium"),
    ("The cave you fear to enter holds the treasure you seek.", "Joseph Campbell", "The Hero with a Thousand Faces, 1949", "들어가기 두려운 동굴에 당신이 찾는 보물이 있다.", "quote", "short"),
    ("It is not the strongest of the species that survives, nor the most intelligent; it is the one most adaptable to change.", "Charles Darwin", "On the Origin of Species, 1859", "살아남는 것은 가장 강한 종도, 가장 똑똑한 종도 아니다. 변화에 가장 잘 적응하는 종이다.", "quote", "medium"),
    ("You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", "Dr. Seuss", "Oh, the Places You'll Go!, 1990", "당신은 머리에 뇌가 있고, 신발 안에 발이 있다. 당신이 선택하는 어떤 방향으로든 나아갈 수 있다.", "quote", "medium"),
    ("Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.", "Martin Luther King Jr.", "Strength to Love, 1963", "어둠으로는 어둠을 몰아낼 수 없다. 오직 빛만이 그렇게 할 수 있다. 증오로는 증오를 몰아낼 수 없다. 오직 사랑만이.", "speech", "medium"),
    ("Ask not what your country can do for you — ask what you can do for your country.", "John F. Kennedy", "Inaugural Address, January 20, 1961", "나라가 당신을 위해 무엇을 해 줄 수 있는지를 묻지 말고, 당신이 나라를 위해 무엇을 할 수 있는지를 물어라.", "speech", "medium"),
    ("We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets, we shall never surrender.", "Winston Churchill", "Speech to the House of Commons, June 4, 1940", "우리는 해변에서 싸울 것이고, 상륙 지점에서 싸울 것이고, 들판과 거리에서 싸울 것이다. 우리는 결코 항복하지 않을 것이다.", "speech", "long"),
    ("I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.", "Martin Luther King Jr.", "I Have a Dream Speech, August 28, 1963", "나에게는 꿈이 있습니다. 내 네 아이들이 언젠가 피부색이 아닌 인격의 내용으로 평가받는 나라에서 살게 되는 꿈이.", "speech", "long"),
    ("Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.", "Robert Frost", "The Road Not Taken, 1916", "숲속에서 두 길이 갈라졌고, 나는 사람이 덜 다닌 길을 택했다. 그리고 그것이 모든 것을 바꿔놓았다.", "poem", "medium"),
    ("Do not go gentle into that good night. Rage, rage against the dying of the light.", "Dylan Thomas", "Do Not Go Gentle into That Good Night, 1951", "그 어두운 밤 속으로 순순히 들어가지 마라. 사라져가는 빛에 맞서 분노하고, 또 분노하라.", "poem", "short"),
    ("Because I could not stop for Death, He kindly stopped for me; The Carriage held but just Ourselves and Immortality.", "Emily Dickinson", "Because I could not stop for Death, c. 1863", "내가 죽음을 위해 멈출 수 없었기에, 그가 친절히 나를 위해 멈춰주었다. 마차에는 우리 둘과 불멸만이 타고 있었다.", "poem", "medium"),
    ("Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all.", "Emily Dickinson", "Hope is the Thing with Feathers, c. 1861", "희망은 깃털 달린 것으로 영혼에 깃들어, 가사 없는 선율을 노래하며, 결코 멈추지 않는다.", "poem", "medium"),
    ("I am the master of my fate, I am the captain of my soul.", "William Ernest Henley", "Invictus, 1875", "나는 내 운명의 주인이며, 나는 내 영혼의 선장이다.", "poem", "short"),
    ("It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.", "Charles Dickens", "A Tale of Two Cities, 1859", "그것은 최고의 시절이었고, 최악의 시절이었으며, 지혜의 시대였고, 어리석음의 시대였다.", "literature", "medium"),
    ("All animals are equal, but some animals are more equal than others.", "George Orwell", "Animal Farm, 1945", "모든 동물은 평등하다. 그러나 어떤 동물은 다른 동물보다 더 평등하다.", "literature", "short"),
    ("It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", "Jane Austen", "Pride and Prejudice, 1813", "상당한 재산을 가진 독신 남성은 반드시 아내를 원해야 한다는 것이 보편적으로 인정된 진리다.", "literature", "medium"),
    ("So we beat on, boats against the current, borne back ceaselessly into the past.", "F. Scott Fitzgerald", "The Great Gatsby, 1925", "그렇게 우리는 흐름에 거슬러 나아가며, 끊임없이 과거 속으로 떠밀려간다.", "literature", "short"),
]


def seed():
    init_db()
    db = get_db()
    try:
        # 기존 데이터 확인
        count = db.execute("SELECT COUNT(*) FROM daily_sentences").fetchone()[0]
        if count > 0:
            print(f"이미 {count}개의 문장이 존재합니다. 시드를 건너뜁니다.")
            return

        for q in QUOTES:
            db.execute(
                "INSERT INTO daily_sentences (text, source, context, translation, category, difficulty) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                q,
            )
        db.commit()
        print(f"{len(QUOTES)}개의 명언 데이터를 삽입했습니다.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
