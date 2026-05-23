"""OpenAI integration with full interview prompts as constants."""

import json
import logging
from typing import Any, Optional

from openai import AsyncOpenAI

from app.core.config import settings
from app.core.exceptions import ServiceUnavailableError

logger = logging.getLogger(__name__)

QUESTION_GENERATION_PROMPTS: dict[str, str] = {
    "technical": """You are an expert technical interviewer for the role of {role}.
Generate ONE interview question at {difficulty} difficulty level.
The question should test relevant technical knowledge, problem-solving, and depth.
Return JSON only: {{"question_text": "...", "category": "...", "expected_topics": ["..."]}}""",
    "hr": """You are an HR interviewer assessing cultural fit and soft skills for {role}.
Generate ONE behavioral/HR question at {difficulty} difficulty.
Focus on teamwork, conflict resolution, motivation, or career goals.
Return JSON only: {{"question_text": "...", "category": "...", "expected_topics": ["..."]}}""",
    "behavioral": """You are conducting a behavioral interview for {role} using the STAR method.
Generate ONE situational question at {difficulty} difficulty about past experience.
Return JSON only: {{"question_text": "...", "category": "...", "expected_topics": ["..."]}}""",
    "coding": """You are a coding interview proctor for {role}.
Generate ONE coding problem at {difficulty} difficulty with clear requirements.
Include constraints and examples if applicable.
Return JSON only: {{"question_text": "...", "category": "algorithms|data_structures|system_design", "expected_topics": ["..."]}}""",
}

EVALUATION_PROMPT = """You are an expert interview evaluator for the role of {role} at {difficulty} difficulty.

Question: {question_text}

Candidate Answer: {answer_text}

Evaluate the answer on:
1. Technical accuracy and depth (0-100)
2. Communication clarity (0-100)
3. Overall score (0-100)

Provide constructive feedback with strengths, improvements, and a hiring signal.

Return JSON only:
{{
  "technical_score": 0-100,
  "communication_score": 0-100,
  "score": 0-100,
  "feedback": {{
    "strengths": ["..."],
    "improvements": ["..."],
    "summary": "..."
  }},
  "hiring_signal": "strong_yes|yes|neutral|no|strong_no"
}}"""

ROADMAP_PROMPT = """You are a career coach creating a personalized interview preparation roadmap.

Target Role: {target_role}
Current Skills: {current_skills}
Weak Areas: {weak_areas}

Create a structured 4-week learning roadmap with weekly goals, resources, and practice exercises.
Return JSON only:
{{
  "weeks": [
    {{
      "week": 1,
      "theme": "...",
      "goals": ["..."],
      "resources": ["..."],
      "practice": ["..."]
    }}
  ],
  "priority_skills": ["..."],
  "estimated_hours_per_week": 10
}}"""

CODE_EVALUATION_PROMPT = """You are a senior engineer reviewing code in a technical interview.

Problem: {problem_description}

Language: {language}

Submitted Code:
```
{source_code}
```

Test Results: {test_results}

Evaluate correctness, efficiency, style, and edge case handling.
Return JSON only:
{{
  "score": 0-100,
  "correctness": 0-100,
  "efficiency": 0-100,
  "style": 0-100,
  "feedback": {{
    "strengths": ["..."],
    "issues": ["..."],
    "suggestions": ["..."]
  }},
  "verdict": "pass|partial|fail"
}}"""

HIRING_RECOMMENDATION_PROMPT = """You are a hiring manager making a data-driven recommendation.

Role: {role}

Interview Performance Summary:
{performance_summary}

Based on scores, consistency, technical vs communication balance, and trends,
provide a hiring recommendation.

Return JSON only:
{{
  "recommendation": "hire|no_hire|maybe",
  "confidence": 0-100,
  "rationale": "...",
  "strengths": ["..."],
  "concerns": ["..."],
  "next_steps": ["..."]
}}"""


class AIService:
    """Wrapper around OpenAI for interview AI features."""

    def __init__(self) -> None:
        self._client: Optional[AsyncOpenAI] = None

    @property
    def client(self) -> AsyncOpenAI:
        """Lazy-init OpenAI client."""
        if self._client is None:
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    async def _chat_json(self, system: str, user: str) -> dict[str, Any]:
        """Call chat completion and parse JSON response."""
        try:
            response = await self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            content = response.choices[0].message.content or "{}"
            return json.loads(content)
        except Exception as exc:
            logger.exception("OpenAI request failed: %s", exc)
            raise ServiceUnavailableError("AI service unavailable") from exc

    async def generate_question(
        self,
        role: str,
        interview_type: str,
        difficulty: str,
        question_number: int = 1,
    ) -> dict[str, Any]:
        """Generate the next interview question."""
        template = QUESTION_GENERATION_PROMPTS.get(
            interview_type, QUESTION_GENERATION_PROMPTS["technical"]
        )
        prompt = template.format(role=role, difficulty=difficulty)
        system = "You are PrepPilot AI. Always respond with valid JSON only."
        user = f"{prompt}\n\nQuestion number: {question_number}"
        result = await self._chat_json(system, user)
        result.setdefault("question_text", "Tell me about a challenging project you worked on.")
        result.setdefault("category", interview_type)
        return result

    async def evaluate_answer(
        self,
        role: str,
        difficulty: str,
        question_text: str,
        answer_text: str,
    ) -> dict[str, Any]:
        """Evaluate a candidate's answer."""
        user = EVALUATION_PROMPT.format(
            role=role,
            difficulty=difficulty,
            question_text=question_text,
            answer_text=answer_text,
        )
        system = "You are PrepPilot AI evaluator. Respond with valid JSON only."
        return await self._chat_json(system, user)

    async def generate_roadmap(
        self,
        target_role: str,
        current_skills: list[str],
        weak_areas: list[str],
    ) -> dict[str, Any]:
        """Generate personalized learning roadmap."""
        user = ROADMAP_PROMPT.format(
            target_role=target_role,
            current_skills=", ".join(current_skills) or "Not specified",
            weak_areas=", ".join(weak_areas) or "Not specified",
        )
        system = "You are PrepPilot career coach. Respond with valid JSON only."
        return await self._chat_json(system, user)

    async def evaluate_code(
        self,
        problem_description: str,
        language: str,
        source_code: str,
        test_results: str = "Not run",
    ) -> dict[str, Any]:
        """AI evaluation of submitted code."""
        user = CODE_EVALUATION_PROMPT.format(
            problem_description=problem_description,
            language=language,
            source_code=source_code,
            test_results=test_results,
        )
        system = "You are PrepPilot code reviewer. Respond with valid JSON only."
        return await self._chat_json(system, user)

    async def hiring_recommendation(
        self, role: str, performance_summary: str
    ) -> dict[str, Any]:
        """Generate hiring recommendation from performance data."""
        user = HIRING_RECOMMENDATION_PROMPT.format(
            role=role,
            performance_summary=performance_summary,
        )
        system = "You are PrepPilot hiring advisor. Respond with valid JSON only."
        return await self._chat_json(system, user)


ai_service = AIService()
