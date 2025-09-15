#!/usr/bin/env python3
import sys
import os
sys.path.append('src')

# Test the import and basic functionality
try:
    from src.ai_modules.agents.career_gap_agent import run_gap_analysis
    print("✅ Import successful!")
    
    # Test with sample data
    sample_resume = {
        "skills": ["Python", "Java", "React"],
        "projects": [
            {"name": "Web App", "description": "Built with React and Python", "technologies": "React, Python, Flask"}
        ],
        "work_experience": [
            {"position": "Developer", "description": "Worked on Python applications"}
        ]
    }
    
    sample_job = {
        "technical_skills": ["Python", "JavaScript", "C++", "Data Structures"]
    }
    
    print("🧪 Testing analysis...")
    result = run_gap_analysis(sample_resume, sample_job, user_id=1)
    print("✅ Analysis completed!")
    print(f"Status: {result.get('status')}")
    print(f"Analysis keys: {list(result.get('analysis', {}).keys())}")
    
    if result.get('status') == 'success':
        analysis = result.get('analysis', {})
        skills_to_improve = analysis.get('skillsToImprove', [])
        print(f"Skills to improve count: {len(skills_to_improve)}")
        for skill in skills_to_improve[:2]:  # Show first 2
            print(f"  - {skill.get('name')}: {skill.get('current')}% → {skill.get('target')}%")
    else:
        print(f"❌ Analysis failed: {result}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
