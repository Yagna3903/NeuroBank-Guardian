#!/bin/bash

# Script to create 16 individual PRs for each commit
# Each PR will contain all commits up to that point

# Commit hashes and messages (from oldest to newest)
declare -a commits=(
    "6a22482:chore: add comprehensive .gitignore for Python and Next.js"
    "5e69964:feat: add backend configuration and database connection"
    "2a0cf94:feat: add Pydantic data models"
    "447318b:feat: add mock user and transaction data"
    "b4a162d:feat: add repository layer for data access"
    "8b8d8f0:feat: add embedding and transaction services"
    "edf371d:feat: implement email OTP authentication system"
    "063aaf5:feat: implement Azure Avatar and RAG audio services"
    "0146ca6:feat: add API controllers for avatar and transactions"
    "808e204:feat: add API routes and main FastAPI application"
    "b6f501d:feat: add frontend React components"
    "70ce7e2:chore: add frontend dependencies and gitignore"
    "2c0a9bb:feat: add Next.js authentication flow pages"
    "72a2baf:chore: configure Next.js, TypeScript, and build tools"
    "a37110b:chore: add frontend assets and documentation"
    "be382e9:chore: add environment variables example"
)

# Create branches and push them
for i in "${!commits[@]}"; do
    IFS=':' read -r hash message <<< "${commits[$i]}"
    branch_num=$((i + 1))
    branch_name="pr-$branch_num-$(echo "$message" | sed 's/^[a-z]*: //' | sed 's/ /-/g' | tr '[:upper:]' '[:lower:]' | cut -c1-40)"
    
    echo "Creating branch: $branch_name (commit: $hash)"
    
    # Create branch from that commit
    git branch "$branch_name" "$hash"
    
    # Push the branch
    git push -u origin "$branch_name"
done

echo ""
echo "✅ All 16 branches created and pushed!"
echo ""
echo "Now creating PRs using GitHub CLI..."
echo ""

# Create PRs using GitHub CLI
for i in "${!commits[@]}"; do
    IFS=':' read -r hash message <<< "${commits[$i]}"
    branch_num=$((i + 1))
    branch_name="pr-$branch_num-$(echo "$message" | sed 's/^[a-z]*: //' | sed 's/ /-/g' | tr '[:upper:]' '[:lower:]' | cut -c1-40)"
    
    # Extract commit type and description
    commit_type=$(echo "$message" | cut -d':' -f1)
    commit_desc=$(echo "$message" | cut -d':' -f2- | sed 's/^ //')
    
    # Create PR title
    pr_title="[$branch_num/16] $message"
    
    # Create PR body
    pr_body="## Part $branch_num of 16

$commit_desc

### Changes in this PR
$(git log --oneline $hash^..$hash)

### Dependencies
"
    
    if [ $i -eq 0 ]; then
        pr_body+="- None (base PR)"
    else
        prev_branch_num=$((branch_num - 1))
        pr_body+="- Depends on PR #$prev_branch_num being merged first"
    fi
    
    pr_body+="

### Progress
- [x] Commit $branch_num/$((${#commits[@]}))

---
*This is an atomic PR as part of a stacked PR workflow. Please review and merge PRs in sequential order.*"
    
    echo "Creating PR for: $branch_name"
    gh pr create \
        --base main \
        --head "$branch_name" \
        --title "$pr_title" \
        --body "$pr_body"
done

echo ""
echo "🎉 All 16 PRs created successfully!"
