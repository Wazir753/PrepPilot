"""Initial database schema

Revision ID: 001_initial
Revises:
Create Date: 2026-05-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all PrepPilot tables and enums."""
    op.execute("CREATE TYPE user_roles AS ENUM ('user', 'admin')")
    op.execute("CREATE TYPE subscription_tiers AS ENUM ('free', 'pro', 'enterprise')")
    op.execute("CREATE TYPE interview_difficulties AS ENUM ('easy', 'medium', 'hard')")
    op.execute("CREATE TYPE interview_types AS ENUM ('technical', 'hr', 'behavioral', 'coding')")
    op.execute("CREATE TYPE interview_statuses AS ENUM ('in_progress', 'completed', 'abandoned')")
    op.execute(
        "CREATE TYPE submission_statuses AS ENUM "
        "('pending', 'running', 'success', 'error', 'timeout')"
    )

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("password_hash", sa.String(512), nullable=False),
        sa.Column("role", postgresql.ENUM("user", "admin", name="user_roles", create_type=False), server_default="user"),
        sa.Column("avatar_url", sa.String(512), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("target_role", sa.String(100), nullable=True),
        sa.Column(
            "subscription_tier",
            postgresql.ENUM("free", "pro", "enterprise", name="subscription_tiers", create_type=False),
            server_default="free",
        ),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("is_banned", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "interviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(100), nullable=False),
        sa.Column(
            "difficulty",
            postgresql.ENUM("easy", "medium", "hard", name="interview_difficulties", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "interview_type",
            postgresql.ENUM("technical", "hr", "behavioral", "coding", name="interview_types", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            postgresql.ENUM("in_progress", "completed", "abandoned", name="interview_statuses", create_type=False),
            server_default="in_progress",
        ),
        sa.Column("final_score", sa.Float(), nullable=True),
        sa.Column("technical_score", sa.Float(), nullable=True),
        sa.Column("communication_score", sa.Float(), nullable=True),
        sa.Column("confidence_level", sa.String(20), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("question_count", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "responses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "interview_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("interviews.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("question_number", sa.Integer(), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("answer_text", sa.Text(), nullable=True),
        sa.Column("audio_url", sa.Text(), nullable=True),
        sa.Column("ai_feedback", postgresql.JSONB(), nullable=True),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("technical_score", sa.Float(), nullable=True),
        sa.Column("communication_score", sa.Float(), nullable=True),
        sa.Column("response_time_seconds", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "coding_submissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column(
            "interview_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("interviews.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("problem_title", sa.String(255), nullable=False),
        sa.Column("language", sa.String(50), nullable=False),
        sa.Column("source_code", sa.Text(), nullable=False),
        sa.Column("stdin", sa.Text(), nullable=True),
        sa.Column("stdout", sa.Text(), nullable=True),
        sa.Column("stderr", sa.Text(), nullable=True),
        sa.Column("exit_code", sa.Integer(), nullable=True),
        sa.Column("execution_time_ms", sa.Integer(), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM(
                "pending", "running", "success", "error", "timeout",
                name="submission_statuses", create_type=False
            ),
            server_default="pending",
        ),
        sa.Column("test_results", postgresql.JSONB(), nullable=True),
        sa.Column("ai_evaluation", postgresql.JSONB(), nullable=True),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "emotion_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column(
            "interview_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("interviews.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("dominant_emotion", sa.String(50), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("frame_count", sa.Integer(), server_default="0"),
        sa.Column("emotion_timeline", postgresql.JSONB(), nullable=True),
        sa.Column("summary", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "voice_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column(
            "interview_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("interviews.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("audio_url", sa.String(512), nullable=True),
        sa.Column("duration_seconds", sa.Float(), nullable=True),
        sa.Column("words_per_minute", sa.Float(), nullable=True),
        sa.Column("filler_word_count", sa.Integer(), server_default="0"),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("pitch_stats", postgresql.JSONB(), nullable=True),
        sa.Column("analysis", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    """Drop all tables and enums."""
    op.drop_table("voice_sessions")
    op.drop_table("emotion_sessions")
    op.drop_table("coding_submissions")
    op.drop_table("responses")
    op.drop_table("interviews")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS submission_statuses")
    op.execute("DROP TYPE IF EXISTS interview_statuses")
    op.execute("DROP TYPE IF EXISTS interview_types")
    op.execute("DROP TYPE IF EXISTS interview_difficulties")
    op.execute("DROP TYPE IF EXISTS subscription_tiers")
    op.execute("DROP TYPE IF EXISTS user_roles")
