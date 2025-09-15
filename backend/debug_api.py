#!/usr/bin/env python3
import sys
import os
import json
sys.path.append('src')

from flask import Flask
from src.routes.api_routes import api_bp

app = Flask(__name__)
app.register_blueprint(api_bp, url_prefix='/api')

# Test if the routes are registered correctly
print("🔍 Checking registered routes:")
for rule in app.url_map.iter_rules():
    if 'analysis' in rule.rule:
        print(f"  - {rule.rule} [{', '.join(rule.methods)}]")

print("\n🧪 Testing import:")
try:
    from src.ai_modules.agents.career_gap_agent import run_gap_analysis
    print("✅ career_gap_agent import successful!")
except Exception as e:
    print(f"❌ career_gap_agent import failed: {e}")

print("\n🔍 Checking if prompt file exists:")
from pathlib import Path
prompt_path = Path("src/ai_modules/prompts/gap_analysis_prompt.txt")
if prompt_path.exists():
    print("✅ Prompt file exists!")
    with open(prompt_path, 'r') as f:
        content = f.read()
        print(f"  - File size: {len(content)} characters")
        if "technology transfers" in content.lower():
            print("  - ✅ Technology transfer improvements found!")
        else:
            print("  - ❌ Technology transfer improvements missing!")
else:
    print(f"❌ Prompt file missing at: {prompt_path}")
