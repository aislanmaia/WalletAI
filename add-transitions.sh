#!/bin/bash

# Script para adicionar PageTransition a todas as páginas

# Pages to update
PAGES=(
  "src/pages/transactions.tsx"
  "src/pages/reports.tsx"
  "src/pages/goals.tsx"
  "src/pages/profile.tsx"
)

echo "Adding PageTransition to pages..."

for page in "${PAGES[@]}"; do
  echo "Processing $page..."
  
  # Add import if not exists
  if ! grep -q "PageTransition" "$page"; then
    # Add import after other imports
    sed -i "/^import.*from/a import { PageTransition } from '@/components/PageTransition';" "$page" 2>/dev/null || true
  fi
done

echo "Done! Please manually wrap return content with <PageTransition>...</PageTransition>"
