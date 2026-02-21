"""
수집된 명언에 GPT-4o-mini로 한글 번역, 카테고리, context를 추가합니다.
배치 처리: 10개씩 묶어서 1회 API 호출.

사용법: cd backend && python -m pipeline.enrich
필요: OPENAI_API_KEY 환경변수
"""

import json
import os
import time
from pathlib import Path
from openai import OpenAI

DATA_DIR = Path(__file__).parent.parent / "data"
INPUT_FILE = DATA_DIR / "raw_quotes.json"
OUTPUT_FILE = DATA_DIR / "enriched_quotes.json"
FAILED_FILE = DATA_DIR / "failed_quotes.json"

BATCH_SIZE = 10


def classify_difficulty(text: str) -> str:
    """문자 길이 기반 난이도 분류 (LLM 불필요)."""
    length = len(text)
    if length <= 80:
        return "short"
    elif length <= 150:
        return "medium"
    else:
        return "long"


SYSTEM_PROMPT = """당신은 영문 명언 큐레이터이자 한국어 번역 전문가입니다.
주어진 영어 명언 목록에 대해 각각 아래 정보를 생성해주세요.

**반드시 JSON 객체로 응답하세요.** "results" 키 아래에 배열을 넣고,
입력과 동일한 순서, 동일한 개수로 반환합니다.

각 항목의 형식:
{
  "index": 0,
  "translation": "자연스러운 한국어 번역 (직역보다는 의역, 원문의 핵심 의미 보존)",
  "category": "quote | poem | speech | literature 중 하나",
  "context": "저자의 대표 저서, 연설문, 직업 등 한 줄 설명 (영어로)"
}

카테고리 분류 기준:
- quote: 일반적인 명언, 격언, 경구 (대부분의 명언이 여기에 해당)
- poem: 시에서 발췌한 구절 (저자가 시인이고 출처가 시 작품인 경우)
- speech: 연설문에서 발췌한 구절 (정치 연설, 졸업 연설 등)
- literature: 소설, 희곡 등 문학 작품에서 발췌한 구절

context 작성 기준:
- 해당 명언의 출처가 특정 작품이면: "작품명, 연도" (예: "The Great Gatsby, 1925")
- 연설문이면: "연설명, 날짜" (예: "Inaugural Address, January 20, 1961")
- 출처가 불분명하면: 저자의 직업/분야 (예: "Physicist & Philosopher")
- "Attributed"는 최후의 수단으로만 사용"""


def build_user_prompt(batch: list) -> str:
    """배치의 명언들을 사용자 프롬프트로 변환합니다."""
    lines = []
    for i, q in enumerate(batch):
        lines.append(f'[{i}] "{q["text"]}" — {q["author"]}')
        if q.get("tags"):
            lines.append(f'    Tags: {", ".join(q["tags"])}')
    return "\n".join(lines)


def enrich_batch(client: OpenAI, batch: list) -> list:
    """10개 명언을 1회 GPT 호출로 처리합니다."""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(batch)},
        ],
        temperature=0.3,
        max_tokens=3000,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"
    data = json.loads(raw)

    # GPT가 {"results": [...]} 형태로 반환
    items = data.get("results", data.get("items", []))
    if isinstance(data, list):
        items = data

    enriched = []
    for i, q in enumerate(batch):
        gpt_item = items[i] if i < len(items) else {}

        category = gpt_item.get("category", "quote")
        if category not in ("quote", "poem", "speech", "literature"):
            category = "quote"

        enriched.append({
            "text": q["text"],
            "source": q["author"],
            "context": gpt_item.get("context", "Attributed"),
            "translation": gpt_item.get("translation", ""),
            "category": category,
            "difficulty": classify_difficulty(q["text"]),
        })

    return enriched


def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("오류: OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        print("  export OPENAI_API_KEY=sk-...")
        return

    if not INPUT_FILE.exists():
        print(f"오류: {INPUT_FILE}이 존재하지 않습니다.")
        print("  먼저 python -m pipeline.collect 을 실행하세요.")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        quotes = json.load(f)

    print(f"{len(quotes)}개 명언 로드됨. 배치 크기: {BATCH_SIZE}")

    client = OpenAI(api_key=api_key)
    enriched_all = []
    failed_all = []

    # 이미 처리된 결과가 있으면 이어서 처리 (재시작 지원)
    start_idx = 0
    if OUTPUT_FILE.exists():
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            enriched_all = json.load(f)
        start_idx = len(enriched_all)
        print(f"기존 {start_idx}개 결과 로드됨. 이어서 처리합니다.")

    total_batches = (len(quotes) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(start_idx, len(quotes), BATCH_SIZE):
        batch = quotes[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1

        print(f"배치 {batch_num}/{total_batches} 처리 중... ({len(batch)}개)")

        try:
            result = enrich_batch(client, batch)
            enriched_all.extend(result)

            # 매 배치마다 중간 저장
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(enriched_all, f, ensure_ascii=False, indent=2)

            print(f"  완료 (누적 {len(enriched_all)}개)")

        except Exception as e:
            print(f"  배치 {batch_num} 실패: {e}")
            failed_all.extend(batch)
            with open(FAILED_FILE, "w", encoding="utf-8") as f:
                json.dump(failed_all, f, ensure_ascii=False, indent=2)

        time.sleep(2)  # rate limit 방지

    print(f"\n완료: {len(enriched_all)}개 처리됨, {len(failed_all)}개 실패")
    print(f"결과: {OUTPUT_FILE}")
    if failed_all:
        print(f"실패: {FAILED_FILE}")


if __name__ == "__main__":
    main()
