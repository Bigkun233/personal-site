#!/usr/bin/env bash
# scripts/deploy-gh-pages.sh —— 构建并把 dist/ 发布到 gh-pages 分支（GitHub Pages 用）
# 用法：./scripts/deploy-gh-pages.sh [remote]
#   remote 默认 origin（git@github.com:Bigkun233/personal-site.git）
# 前置：仓库已存在；GitHub 仓库 Settings → Pages → Source 选 "Deploy from a branch" → gh-pages / (root)
set -euo pipefail

REMOTE="${1:-origin}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "▶ 1/4 构建"
pnpm build

echo "▶ 2/4 准备 gh-pages 工作区"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# 保留 CNAME（自定义域名）与 .nojekyll
if git show-ref --quiet "refs/heads/gh-pages"; then
  git worktree remove --force "$WORK" 2>/dev/null || true
  git worktree add --force -B gh-pages "$WORK" gh-pages >/dev/null
else
  git worktree add --force -B gh-pages "$WORK" >/dev/null 2>&1 || {
    git worktree add --force --detach "$WORK" >/dev/null
    git -C "$WORK" checkout --orphan gh-pages
  }
fi

echo "▶ 3/4 同步 dist → gh-pages"
# 清空工作区（保留 .git）
find "$WORK" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. "$WORK"/
touch "$WORK/.nojekyll"   # 跳过 Jekyll 处理，保证以 _ 开头的资源可访问

git -C "$WORK" add -A
if git -C "$WORK" diff --cached --quiet; then
  echo "   （内容无变化，跳过提交）"
else
  git -C "$WORK" -c user.name="OpenClaw Deploy" -c user.email="deploy@openclaw.local" \
    commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S') 构建产物"
fi

echo "▶ 4/4 推送 gh-pages → $REMOTE"
git -C "$WORK" push --force "$REMOTE" gh-pages

git worktree remove --force "$WORK" 2>/dev/null || true
echo "✅ 完成。首次需在 GitHub 仓库 Settings → Pages 里把 Source 设为 gh-pages 分支"
