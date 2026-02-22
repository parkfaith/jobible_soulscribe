"""
AI 피드백 API 엔드포인트.
필사 완료 후 GPT가 문법 분석, 뉘앙스 해설, 연습 문장을 제공합니다.
동일 문장은 캐시(ai_feedbacks 테이블)에서 즉시 반환합니다.
"""

import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db
from config import settings

logger = logging.getLogger("soulscribe")

router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackRequest(BaseModel):
    sentence_id: int   # 오늘의 명언 인덱스 (1-based, 캐시 키)
    text: str          # 원문 영어 문장


class FeedbackResponse(BaseModel):
    sentence_id: int
    grammar_analysis: str
    nuance_insights: str
    practice_challenge: str
    cached: bool = False


# ── GPT 프롬프트 ──────────────────────────────────────────────────
SYSTEM_PROMPT = """당신은 한국인 영어 학습자를 위한 전문 영어 선생님입니다.
주어진 영어 문장을 분석하여 다음 3가지를 한국어로 설명해주세요.

중요: 각 항목은 번호(①, ②, ③)로 구분하고, 반드시 각 번호 앞에서 줄바꿈(\\n)을 넣어주세요.
첫 번째 항목 앞에는 줄바꿈이 필요 없습니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "grammar_analysis": "① 첫 번째 문법 포인트\\n② 두 번째 문법 포인트\\n③ 세 번째 문법 포인트",
  "nuance_insights": "① 첫 번째 뉘앙스 설명\\n② 두 번째 뉘앙스 설명\\n③ 세 번째 뉘앙스 설명",
  "practice_challenge": "연습: 영어 문장\\n번역: 한국어 번역"
}"""


@router.post("", response_model=FeedbackResponse)
async def get_feedback(payload: FeedbackRequest):
    """
    AI 피드백 반환. 캐시 히트 시 즉시 반환, 미스 시 GPT 호출 후 저장.
    """
    db = get_db()
    try:
        # ── 1. 캐시 확인 ──────────────────────────────────────────────
        cached = db.execute(
            "SELECT grammar_analysis, nuance_insights, practice_challenge "
            "FROM ai_feedbacks WHERE sentence_id = ?",
            [payload.sentence_id],
        ).fetchone()

        if cached:
            logger.info(f"AI 피드백 캐시 히트: sentence_id={payload.sentence_id}")
            return FeedbackResponse(
                sentence_id=payload.sentence_id,
                grammar_analysis=cached[0],
                nuance_insights=cached[1],
                practice_challenge=cached[2],
                cached=True,
            )

        # ── 2. OpenAI API 호출 ────────────────────────────────────────
        if not settings.openai_api_key:
            logger.warning("OPENAI_API_KEY 미설정 — 목업 피드백 반환")
            return _mock_feedback(payload.sentence_id, payload.text)

        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.openai_api_key)

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f'다음 문장을 분석해주세요: "{payload.text}"'},
                ],
                temperature=0.7,
                max_tokens=800,
                response_format={"type": "json_object"},
            )

            raw = response.choices[0].message.content or "{}"
            data = json.loads(raw)

            grammar = data.get("grammar_analysis", "분석을 가져오지 못했습니다.")
            nuance = data.get("nuance_insights", "분석을 가져오지 못했습니다.")
            challenge = data.get("practice_challenge", "연습 문장을 가져오지 못했습니다.")

        except Exception as e:
            logger.error(f"OpenAI API 호출 실패: {e}")
            raise HTTPException(status_code=503, detail="AI 피드백 서비스에 일시적인 오류가 발생했습니다.")

        # ── 3. 캐시 저장 ──────────────────────────────────────────────
        try:
            db.execute(
                "INSERT INTO ai_feedbacks (sentence_id, grammar_analysis, nuance_insights, practice_challenge) "
                "VALUES (?, ?, ?, ?)",
                [payload.sentence_id, grammar, nuance, challenge],
            )
            db.commit()
            logger.info(f"AI 피드백 캐시 저장: sentence_id={payload.sentence_id}")
        except Exception as e:
            logger.warning(f"피드백 캐시 저장 실패 (무시됨): {e}")

        return FeedbackResponse(
            sentence_id=payload.sentence_id,
            grammar_analysis=grammar,
            nuance_insights=nuance,
            practice_challenge=challenge,
            cached=False,
        )
    finally:
        db.close()


def _mock_feedback(sentence_id: int, text: str) -> FeedbackResponse:
    """OPENAI_API_KEY 미설정 시 반환하는 목업 피드백."""
    return FeedbackResponse(
        sentence_id=sentence_id,
        grammar_analysis=(
            "① **전치사구 수식**: 'In the middle of every difficulty'는 "
            "문두에 위치한 전치사구로, 문장 전체를 수식합니다.\n"
            "② **lies**: 3인칭 단수 현재형. 주어 'opportunity'에 동사를 일치시킨 예입니다.\n"
            "③ **every + 단수명사**: 'every difficulty'처럼 every 뒤에는 항상 단수 명사가 옵니다."
        ),
        nuance_insights=(
            "① 아인슈타인의 이 말은 단순한 낙관주의가 아닌, "
            "어려움 **안에(in the middle of)** 기회가 있다는 역설적 통찰을 담고 있습니다.\n"
            "② 'lies'는 물리적 위치뿐 아니라 '내재되어 있다'는 의미로 사용됩니다.\n"
            "③ 영어권에서 도전이나 시련을 말할 때 자주 인용되는 격언입니다."
        ),
        practice_challenge=(
            "연습: In the heart of every challenge lies a lesson.\n"
            "번역: 모든 도전의 중심에 교훈이 담겨 있다."
        ),
        cached=False,
    )
