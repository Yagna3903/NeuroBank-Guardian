#!/bin/bash

# Simple script to create PRs
declare -a prs=(
    "pr-1-add-comprehensive-.gitignore-for-python-:[1/16] chore: add comprehensive .gitignore for Python and Next.js"
    "pr-2-add-backend-configuration-and-database-c:[2/16] feat: add backend configuration and database connection"
    "pr-3-add-pydantic-data-models:[3/16] feat: add Pydantic data models"
    "pr-4-add-mock-user-and-transaction-data:[4/16] feat: add mock user and transaction data"
    "pr-5-add-repository-layer-for-data-access:[5/16] feat: add repository layer for data access"
    "pr-6-add-embedding-and-transaction-services:[6/16] feat: add embedding and transaction services"
    "pr-7-implement-email-otp-authentication-syste:[7/16] feat: implement email OTP authentication system"
    "pr-8-implement-azure-avatar-and-rag-audio-ser:[8/16] feat: implement Azure Avatar and RAG audio services"
    "pr-9-add-api-controllers-for-avatar-and-trans:[9/16] feat: add API controllers for avatar and transactions"
    "pr-10-add-api-routes-and-main-fastapi-applicat:[10/16] feat: add API routes and main FastAPI application"
    "pr-11-add-frontend-react-components:[11/16] feat: add frontend React components"
    "pr-12-add-frontend-dependencies-and-gitignore:[12/16] chore: add frontend dependencies and gitignore"
    "pr-13-add-next.js-authentication-flow-pages:[13/16] feat: add Next.js authentication flow pages"
    "pr-14-configure-next.js-typescript-and-build-t:[14/16] chore: configure Next.js, TypeScript, and build tools"
    "pr-15-add-frontend-assets-and-documentation:[15/16] chore: add frontend assets and documentation"
    "pr-16-add-environment-variables-example:[16/16] chore: add environment variables example"
)

for pr_info in "${prs[@]}"; do
    IFS=':' read -r branch title <<< "$pr_info"
    pr_num=$(echo "$title" | grep -o '\[[0-9]*/16\]' | tr -d '[]/')
    
    echo "Creating PR for $branch..."
    
    gh pr create \
        --base main \
        --head "$branch" \
        --title "$title" \
        --body "## Part $pr_num of 16

This PR is part of a stacked PR workflow for the NeuroBank-Guardian project.

### What's in this PR
See commit message for details.

### Dependencies
$([ "$pr_num" -eq "1" ] && echo "- None (base PR)" || echo "- Depends on PR #$((pr_num - 1)) being merged first")

### Progress  
- [x] Commit $pr_num/16

---
*This is an atomic PR. Please review and merge PRs in sequential order (1→2→3...→16).*"
done

echo ""
echo "🎉 All PRs created!"
