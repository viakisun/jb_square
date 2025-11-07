#!/bin/bash

# ========================================
# EC2 Disk Cleanup Script
# ========================================
# This script safely cleans up unnecessary files on EC2
# Always run check-disk-usage.sh first to see what will be removed
#
# Usage:
#   bash cleanup-disk.sh --dry-run      # Preview only (default)
#   bash cleanup-disk.sh --auto         # Auto cleanup safe items
#   bash cleanup-disk.sh --interactive  # Confirm each item

set -e

# ========================================
# Configuration
# ========================================
MODE="${1:---dry-run}"
JB_SQUARE_DIR="/home/ec2-user/jb_square"
BACKUP_DIR="/home/ec2-user/backups"
LOG_RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================================
# Helper Functions
# ========================================

log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

confirm() {
  if [ "$MODE" = "--auto" ]; then
    return 0
  elif [ "$MODE" = "--interactive" ]; then
    read -p "$(echo -e ${YELLOW}\"$1 (y/N): \"${NC})" -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
  else
    # dry-run mode
    return 1
  fi
}

execute_or_preview() {
  local description="$1"
  local command="$2"

  if [ "$MODE" = "--dry-run" ]; then
    log_warning "[DRY-RUN] Would execute: $description"
    log_info "Command: $command"
  else
    log_info "Executing: $description"
    eval "$command" && log_success "Done: $description" || log_error "Failed: $description"
  fi
}

# ========================================
# Main Script
# ========================================

echo "========================================"
echo "🧹 EC2 Disk Cleanup Script"
echo "========================================"
echo "Mode: $MODE"
echo "Started at: $(date)"
echo ""

if [ "$MODE" = "--dry-run" ]; then
  log_warning "Running in DRY-RUN mode - no changes will be made"
  log_info "Use --auto for automatic cleanup or --interactive for confirmation"
  echo ""
fi

# ========================================
# 1. Docker Cleanup
# ========================================
echo "========================================"
echo "🐳 Docker Cleanup"
echo "========================================"

# 1.1 Remove dangling images
DANGLING_COUNT=$(docker images -f "dangling=true" -q | wc -l)
if [ "$DANGLING_COUNT" -gt 0 ]; then
  log_info "Found $DANGLING_COUNT dangling images"
  if confirm "Remove dangling images?"; then
    execute_or_preview "Remove dangling images" "docker image prune -f"
  fi
else
  log_success "No dangling images found"
fi
echo ""

# 1.2 Remove unused ECR images (except *-latest)
log_info "Checking for unused ECR images..."
RUNNING_IMAGES=$(docker ps --format "{{.Image}}" | sort -u)
UNUSED_IMAGES=()

while IFS= read -r line; do
  img=$(echo "$line" | awk '{print $1}')
  id=$(echo "$line" | awk '{print $2}')

  if ! echo "$RUNNING_IMAGES" | grep -q "$id"; then
    if [[ ! "$img" =~ -latest$ ]]; then
      UNUSED_IMAGES+=("$img")
    fi
  fi
done < <(docker images --filter "reference=711678334703.dkr.ecr.ap-northeast-2.amazonaws.com/jb-square" --format "{{.Repository}}:{{.Tag}} {{.ID}}")

if [ ${#UNUSED_IMAGES[@]} -gt 0 ]; then
  log_info "Found ${#UNUSED_IMAGES[@]} unused ECR images"
  for img in "${UNUSED_IMAGES[@]}"; do
    echo "  - $img"
  done

  if confirm "Remove these unused images?"; then
    for img in "${UNUSED_IMAGES[@]}"; do
      execute_or_preview "Remove image $img" "docker rmi \"$img\" 2>/dev/null || true"
    done
  fi
else
  log_success "No unused ECR images found"
fi
echo ""

# 1.3 Remove stopped containers
STOPPED_COUNT=$(docker ps -a -f "status=exited" -q | wc -l)
if [ "$STOPPED_COUNT" -gt 0 ]; then
  log_info "Found $STOPPED_COUNT stopped containers"
  if confirm "Remove stopped containers?"; then
    execute_or_preview "Remove stopped containers" "docker container prune -f"
  fi
else
  log_success "No stopped containers found"
fi
echo ""

# 1.4 Remove unused networks
log_info "Checking for unused networks..."
if confirm "Remove unused Docker networks?"; then
  execute_or_preview "Remove unused networks" "docker network prune -f"
fi
echo ""

# 1.5 Remove unused volumes (careful!)
UNUSED_VOLUMES=$(docker volume ls -qf dangling=true | wc -l)
if [ "$UNUSED_VOLUMES" -gt 0 ]; then
  log_warning "Found $UNUSED_VOLUMES unused volumes"
  if confirm "Remove unused volumes? (This may delete data!)"; then
    execute_or_preview "Remove unused volumes" "docker volume prune -f"
  fi
else
  log_success "No unused volumes found"
fi
echo ""

# ========================================
# 2. Unnecessary Files on EC2
# ========================================
echo "========================================"
echo "📄 Unnecessary Files Cleanup"
echo "========================================"

# 2.1 Remove Dockerfiles (not needed for ECR deployment)
for dockerfile in backend/Dockerfile frontend-main/Dockerfile frontend-admin/Dockerfile; do
  FULL_PATH="$JB_SQUARE_DIR/$dockerfile"
  if [ -f "$FULL_PATH" ]; then
    log_warning "Found unnecessary $dockerfile"
    if confirm "Remove $dockerfile? (ECR deployment doesn't need it)"; then
      execute_or_preview "Remove $dockerfile" "rm -f \"$FULL_PATH\""
    fi
  fi
done
echo ""

# 2.2 Remove deprecated scripts
for script in deploy.sh test-build.sh setup-ec2.sh setup-ssl.sh setup-github-secrets.sh enable-https.sh; do
  SCRIPT_PATH="$JB_SQUARE_DIR/scripts/$script"
  if [ -f "$SCRIPT_PATH" ]; then
    log_warning "Found deprecated script: $script"
    if confirm "Remove deprecated $script?"; then
      execute_or_preview "Remove $script" "rm -f \"$SCRIPT_PATH\""
    fi
  fi
done
echo ""

# ========================================
# 3. Previous Projects Cleanup
# ========================================
echo "========================================"
echo "🗂️  Previous Projects Cleanup"
echo "========================================"

for dir in jb2-backoffice jb2_rev2 jb2_wireframe viatable_v2 _deprecated jbio-hub; do
  DIR_PATH="/home/ec2-user/$dir"
  if [ -d "$DIR_PATH" ]; then
    SIZE=$(du -sh "$DIR_PATH" 2>/dev/null | cut -f1)
    log_warning "Found previous project: $dir ($SIZE)"
    if confirm "Remove $dir directory?"; then
      execute_or_preview "Remove $dir" "rm -rf \"$DIR_PATH\""
    fi
  fi
done
echo ""

# ========================================
# 4. Old Backup Files
# ========================================
echo "========================================"
echo "💾 Old Backup Files Cleanup"
echo "========================================"

if [ -d "$BACKUP_DIR" ]; then
  OLD_BACKUPS=$(find "$BACKUP_DIR" -type f -mtime +$LOG_RETENTION_DAYS 2>/dev/null | wc -l)
  if [ "$OLD_BACKUPS" -gt 0 ]; then
    log_info "Found $OLD_BACKUPS backup files older than $LOG_RETENTION_DAYS days"
    if confirm "Remove old backup files?"; then
      execute_or_preview "Remove old backups" "find \"$BACKUP_DIR\" -type f -mtime +$LOG_RETENTION_DAYS -delete"
    fi
  else
    log_success "No old backup files found"
  fi
else
  log_info "Backup directory does not exist"
fi
echo ""

# ========================================
# 5. System Logs Cleanup
# ========================================
echo "========================================"
echo "📝 System Logs Cleanup"
echo "========================================"

# 5.1 journalctl logs
JOURNAL_SIZE=$(journalctl --disk-usage 2>/dev/null | grep -oP '\d+\.\d+[MG]' | head -1)
log_info "Current journalctl size: $JOURNAL_SIZE"
if confirm "Clean journalctl logs older than ${LOG_RETENTION_DAYS} days?"; then
  execute_or_preview "Clean journalctl logs" "sudo journalctl --vacuum-time=${LOG_RETENTION_DAYS}d"
fi
echo ""

# 5.2 Docker container logs
log_info "Docker container logs are managed by Docker's log rotation"
echo ""

# ========================================
# 6. Cache Cleanup
# ========================================
echo "========================================"
echo "💾 Cache Cleanup"
echo "========================================"

# 6.1 APT cache
if [ -d /var/cache/apt/archives ]; then
  APT_SIZE=$(sudo du -sh /var/cache/apt/archives 2>/dev/null | cut -f1)
  log_info "APT cache size: $APT_SIZE"
  if confirm "Clean APT cache?"; then
    execute_or_preview "Clean APT cache" "sudo apt-get clean"
  fi
fi
echo ""

# 6.2 Docker build cache
DOCKER_CACHE=$(docker system df | grep "Build Cache" | awk '{print $4}')
log_info "Docker build cache: $DOCKER_CACHE"
if confirm "Clean Docker build cache?"; then
  execute_or_preview "Clean Docker build cache" "docker builder prune -af"
fi
echo ""

# 6.3 Pip cache
if [ -d ~/.cache/pip ]; then
  PIP_SIZE=$(du -sh ~/.cache/pip 2>/dev/null | cut -f1)
  log_info "Pip cache size: $PIP_SIZE"
  if confirm "Clean Pip cache?"; then
    execute_or_preview "Clean Pip cache" "rm -rf ~/.cache/pip"
  fi
fi
echo ""

# 6.4 NPM cache
if [ -d ~/.npm ]; then
  NPM_SIZE=$(du -sh ~/.npm 2>/dev/null | cut -f1)
  log_info "NPM cache size: $NPM_SIZE"
  if confirm "Clean NPM cache?"; then
    execute_or_preview "Clean NPM cache" "rm -rf ~/.npm"
  fi
fi
echo ""

# ========================================
# Summary
# ========================================
echo "========================================"
echo "📋 Cleanup Summary"
echo "========================================"

if [ "$MODE" = "--dry-run" ]; then
  log_warning "DRY-RUN completed - no changes were made"
  log_info "Run with --auto or --interactive to perform actual cleanup"
else
  log_success "Cleanup completed!"
  log_info "Running disk usage check..."
  echo ""
  df -h | grep -E "Filesystem|/$"
  echo ""
  docker system df
fi

echo ""
echo "========================================"
echo "✅ Script Complete"
echo "========================================"
echo "Finished at: $(date)"
