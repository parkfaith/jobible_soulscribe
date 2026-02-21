"""
전체 명언 수집 파이프라인을 순차 실행합니다.

사용법: cd backend && python -m pipeline.run_pipeline
필요: OPENAI_API_KEY, TURSO_DATABASE_URL, TURSO_AUTH_TOKEN 환경변수
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    print("=" * 60)
    print("SoulScribe 명언 수집 파이프라인")
    print("=" * 60)

    # Step 1: 수집
    print("\n[Step 1/3] Quotable API에서 명언 수집")
    print("-" * 40)
    from pipeline.collect import main as collect_main
    collect_main()

    # Step 2: 번역/분류
    print("\n[Step 2/3] GPT-4o-mini로 번역/분류")
    print("-" * 40)
    from pipeline.enrich import main as enrich_main
    enrich_main()

    # Step 3: DB 시드
    print("\n[Step 3/3] Turso DB에 시드")
    print("-" * 40)
    from pipeline.seed_enriched import main as seed_main
    seed_main()

    print("\n" + "=" * 60)
    print("파이프라인 완료!")
    print("=" * 60)


if __name__ == "__main__":
    main()
