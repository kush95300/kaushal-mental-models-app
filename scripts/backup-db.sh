#!/bin/bash

# Backup Script for Mental Models App
# Usage: ./scripts/backup-db.sh [label]

DB_PATH="./prisma/dev.db"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LABEL=${1:-"auto"}

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}_${LABEL}.db"

# Perform backup
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_FILE"
    echo "✅ Database backup created: $BACKUP_FILE"

    # Optional: Keep only last 10 backups
    ls -dt "$BACKUP_DIR"/* | tail -n +11 | xargs -I {} rm -- {}
else
    echo "❌ Database file not found at $DB_PATH"
    exit 1
fi
