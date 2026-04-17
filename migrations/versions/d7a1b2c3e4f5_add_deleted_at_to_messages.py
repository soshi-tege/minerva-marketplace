"""add deleted_at to messages

Revision ID: d7a1b2c3e4f5
Revises: a114181ffc69
Create Date: 2026-04-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'd7a1b2c3e4f5'
down_revision = 'a114181ffc69'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('messages', sa.Column('deleted_at', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('messages', 'deleted_at')
