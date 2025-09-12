#!/usr/bin/env python3
"""
Test script to verify API endpoints and TiDB Cloud integration
"""

import requests
import json

BASE_URL = "http://localhost:5001/api"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_user_registration():
    """Test user registration"""
    print("\n🔍 Testing user registration...")
    try:
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "firstName": "Test",
            "lastName": "User"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 201
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_user_login():
    """Test user login"""
    print("\n🔍 Testing user login...")
    try:
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {result}")
        
        if response.status_code == 200 and 'sessionToken' in result:
            return result['sessionToken']
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_get_current_user(session_token):
    """Test getting current user"""
    print("\n🔍 Testing get current user...")
    try:
        headers = {"Authorization": f"Bearer {session_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_create_ai_suggestion(session_token):
    """Test creating AI suggestion"""
    print("\n🔍 Testing AI suggestion creation...")
    try:
        headers = {"Authorization": f"Bearer {session_token}"}
        suggestion_data = {
            "suggestionType": "skill_gap",
            "title": "Learn Python",
            "content": "Consider learning Python to improve your programming skills",
            "priority": "high"
        }
        response = requests.post(f"{BASE_URL}/ai-suggestions", json=suggestion_data, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 201
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_ai_suggestions(session_token):
    """Test getting AI suggestions"""
    print("\n🔍 Testing get AI suggestions...")
    try:
        headers = {"Authorization": f"Bearer {session_token}"}
        response = requests.get(f"{BASE_URL}/ai-suggestions", headers=headers)
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {result}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting API and TiDB Cloud Integration Tests")
    print("=" * 50)
    
    # Test 1: Health check
    if not test_health():
        print("❌ Health check failed")
        return
    
    # Test 2: User registration
    if not test_user_registration():
        print("❌ User registration failed")
        return
    
    # Test 3: User login
    session_token = test_user_login()
    if not session_token:
        print("❌ User login failed")
        return
    
    # Test 4: Get current user
    if not test_get_current_user(session_token):
        print("❌ Get current user failed")
        return
    
    # Test 5: Create AI suggestion
    if not test_create_ai_suggestion(session_token):
        print("❌ Create AI suggestion failed")
        return
    
    # Test 6: Get AI suggestions
    if not test_get_ai_suggestions(session_token):
        print("❌ Get AI suggestions failed")
        return
    
    print("\n" + "=" * 50)
    print("✅ All tests passed! TiDB Cloud integration is working correctly!")
    print("🎉 Your Resume Tracker application is successfully connected to TiDB Cloud!")

if __name__ == "__main__":
    main()
