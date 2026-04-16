"""add listing_type, image_url, read_at columns

Revision ID: a1b2c3d4e5f6
Revises: 02e25887d748
Create Date: 2026-04-16
"""
from alembic import op
import sqlalchemy as sa


revision = 'a1b2c3d4e5f6'
down_revision = '02e25887d748'
branch_labels = None
depends_on = None


def _column_exists(table, column):
    """Check if a column exists in a table (SQLite compatible)."""
    bind = op.get_bind()
    result = bind.execute(sa.text(f"PRAGMA table_info({table})"))
    columns = {row[1] for row in result}
    return column in columns


def upgrade():
    # Items table: columns added after initial migration
    if not _column_exists("items", "listing_type"):
        op.add_column("items", sa.Column("listing_type", sa.String(20), nullable=False, server_default="offering"))
    if not _column_exists("items", "image_url"):
        op.add_column("items", sa.Column("image_url", sa.String(500), nullable=True))

    # Messages table: read_at added for read receipts
    if not _column_exists("messages", "read_at"):
        op.add_column("messages", sa.Column("read_at", sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column("messages", "read_at")
    op.drop_column("items", "image_url")
    op.drop_column("items", "listing_type")
