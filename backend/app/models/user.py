import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID, ENUM
from app.models.base import Base

class User(Base):
    """User model representing platform candidates and admins."""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(512), nullable=False)
    role = Column(ENUM('user', 'admin', name='user_roles'), default='user')
    avatar_url = Column(String(512), nullable=True)
    bio = Column(Text, nullable=True)
    target_role = Column(String(100), nullable=True)
    subscription_tier = Column(ENUM('free', 'pro', 'enterprise', name='subscription_tiers'), default='free')
    is_active = Column(Boolean, default=True)
    is_banned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
