"""
enriched_quotes.json을 Turso DB daily_sentences 테이블에 삽입합니다.
기존 30개 명언은 유지하고, 새로운 명언만 추가합니다.

사용법: cd backend && python -m pipeline.seed_enriched
필요: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN 환경변수
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from database import get_db, init_db

DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "enriched_quotes.json"

VALID_CATEGORIES = {"quote", "poem", "speech", "literature"}
VALID_DIFFICULTIES = {"short", "medium", "long"}


def validate_entry(entry: dict) -> bool:
    """시드 전 각 항목을 검증합니다."""
    if not entry.get("text") or len(entry["text"].strip()) < 10:
        return False
    if not entry.get("translation"):
        return False
    if entry.get("category") not in VALID_CATEGORIES:
        return False
    if entry.get("difficulty") not in VALID_DIFFICULTIES:
        return False
    return True


def main():
    if not INPUT_FILE.exists():
        print(f"오류: {INPUT_FILE}이 존재하지 않습니다.")
        print("  먼저 python -m pipeline.enrich 를 실행하세요.")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        quotes = json.load(f)

    print(f"{len(quotes)}개 명언 로드됨")

    init_db()
    db = get_db()

    try:
        # 기존 데이터의 text를 가져와서 중복 방지
        existing_rows = db.execute("SELECT text FROM daily_sentences").fetchall()
        existing_texts = {row[0] for row in existing_rows}
        print(f"DB에 기존 {len(existing_texts)}개 명언 존재")

        inserted = 0
        skipped_dup = 0
        skipped_invalid = 0

        for q in quotes:
            if not validate_entry(q):
                skipped_invalid += 1
                continue

            if q["text"].strip() in existing_texts:
                skipped_dup += 1
                continue

            db.execute(
                "INSERT INTO daily_sentences (text, source, context, translation, category, difficulty) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (
                    q["text"],
                    q.get("source", ""),
                    q.get("context", ""),
                    q["translation"],
                    q["category"],
                    q["difficulty"],
                ),
            )
            existing_texts.add(q["text"].strip())
            inserted += 1

        db.commit()

        total = db.execute("SELECT COUNT(*) FROM daily_sentences").fetchone()[0]
        print(f"\n결과:")
        print(f"  삽입: {inserted}개")
        print(f"  중복 스킵: {skipped_dup}개")
        print(f"  검증 실패: {skipped_invalid}개")
        print(f"  DB 총 명언: {total}개")

    finally:
        db.close()


if __name__ == "__main__":
    main()
