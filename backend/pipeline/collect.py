"""
Quotable API에서 영문 명언을 수집합니다.
폴백: API 다운 시 quotable-io/data GitHub raw JSON 사용.

사용법: cd backend && python -m pipeline.collect
"""

import json
import time
import sys
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

DATA_DIR = Path(__file__).parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "raw_quotes.json"

QUOTABLE_BASE = "https://api.quotable.io"
GITHUB_FALLBACK = "https://raw.githubusercontent.com/quotable-io/data/master/data/quotes.json"


def load_existing_texts() -> set:
    """seed.py에서 기존 명언 텍스트를 로드합니다."""
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from seed import QUOTES
    return {q[0] for q in QUOTES}


def fetch_page(page: int, limit: int = 150, min_length: int = 20, max_length: int = 300) -> dict:
    """Quotable API 한 페이지를 요청합니다."""
    url = (
        f"{QUOTABLE_BASE}/quotes"
        f"?limit={limit}&page={page}"
        f"&minLength={min_length}&maxLength={max_length}"
        f"&sortBy=dateAdded&order=desc"
    )
    req = Request(url, headers={"User-Agent": "SoulScribe/1.0"})
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_from_quotable(target_count: int = 600) -> list:
    """Quotable API에서 페이지네이션으로 명언을 수집합니다."""
    quotes = []
    page = 1

    while len(quotes) < target_count:
        try:
            print(f"  페이지 {page} 요청 중...")
            data = fetch_page(page)
            results = data.get("results", [])

            if not results:
                break

            for q in results:
                quotes.append({
                    "quotable_id": q["_id"],
                    "text": q["content"],
                    "author": q["author"],
                    "tags": q.get("tags", []),
                    "length": q.get("length", len(q["content"])),
                })

            print(f"  페이지 {page}: {len(results)}개 수집 (총 {len(quotes)}개)")

            if page >= data.get("totalPages", 1):
                break

            page += 1
            time.sleep(0.5)  # rate limit 준수

        except HTTPError as e:
            if e.code == 429:
                print("  Rate limited, 60초 대기...")
                time.sleep(60)
                continue
            print(f"  HTTP 오류 {e.code}: {e.reason}")
            break
        except (URLError, TimeoutError) as e:
            print(f"  네트워크 오류: {e}")
            break

    return quotes


def fetch_from_github_fallback() -> list:
    """Quotable API 다운 시 GitHub 원본 데이터에서 수집합니다."""
    print("  GitHub 폴백에서 데이터 다운로드 중...")
    req = Request(GITHUB_FALLBACK, headers={"User-Agent": "SoulScribe/1.0"})
    with urlopen(req, timeout=60) as resp:
        raw_data = json.loads(resp.read().decode("utf-8"))

    quotes = []
    for q in raw_data:
        text = q.get("content", "")
        if 20 <= len(text) <= 300:
            quotes.append({
                "quotable_id": q.get("_id", ""),
                "text": text,
                "author": q.get("author", ""),
                "tags": q.get("tags", []),
                "length": len(text),
            })

    return quotes


def deduplicate(quotes: list, existing: set) -> list:
    """기존 30개와 중복 제거 + 자체 중복 제거."""
    seen = set(existing)
    unique = []
    for q in quotes:
        normalized = q["text"].strip()
        if normalized not in seen:
            seen.add(normalized)
            unique.append(q)
    return unique


def main():
    DATA_DIR.mkdir(exist_ok=True)
    existing = load_existing_texts()
    print(f"기존 명언 {len(existing)}개 로드됨 (중복 방지)")

    # Quotable API 시도
    print("\nQuotable API에서 수집 시작...")
    try:
        quotes = fetch_from_quotable()
        if len(quotes) < 50:
            raise ValueError(f"수집 결과가 너무 적음: {len(quotes)}개")
    except Exception as e:
        print(f"Quotable API 실패: {e}")
        print("GitHub 폴백으로 전환...")
        quotes = fetch_from_github_fallback()

    print(f"\n수집 완료: {len(quotes)}개")

    # 중복 제거
    unique = deduplicate(quotes, existing)
    print(f"중복 제거 후: {len(unique)}개")

    # 500개로 제한
    final = unique[:500]

    # 저장
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(final, f, ensure_ascii=False, indent=2)

    print(f"\n{len(final)}개 명언을 {OUTPUT_FILE}에 저장했습니다.")


if __name__ == "__main__":
    main()
