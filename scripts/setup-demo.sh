#!/bin/bash
set -e

# ==============================================================================
# NormWise SIH Demo Setup Shell Script (Phase 22 Section 5)
# ==============================================================================

echo "=================================================================="
echo "        NormWise - SIH Demonstration One-Command Setup           "
echo "=================================================================="

# Check for node
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    exit 1
fi

# Run JavaScript setup runner
node scripts/setup-demo.js
