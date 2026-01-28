#!/usr/bin/env python3
"""
Test script for SevaSahayak Backend
Run this to verify backend is working correctly
"""

import json
import time
from multiprocessing import Process
from datetime import datetime

import requests
from app import app

# Backend URL
BASE_URL = "http://localhost:5000/api"


def _run_server():
    """Run Flask app without reloader so it stays in one process."""
    app.run(debug=False, use_reloader=False, host="0.0.0.0", port=5000)


def ensure_server_running():
    """Start backend locally if it is not already running."""
    try:
        requests.get(f"{BASE_URL}/health", timeout=1)
        return None  # Server is already up
    except Exception:
        process = Process(target=_run_server, daemon=True)
        process.start()

        # Wait for server to become available
        for _ in range(20):
            try:
                requests.get(f"{BASE_URL}/health", timeout=1)
                return process
            except Exception:
                time.sleep(0.2)

        # If we reach here, server did not start
        process.terminate()
        raise RuntimeError("Backend server failed to start on port 5000")

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def test_health_check():
    """Test health check endpoint"""
    print_header("TEST 1: Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is healthy!")
            print(f"   Status: {data.get('status')}")
            print(f"   Time: {data.get('timestamp')}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Is it running on port 5000?")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_eligibility_check():
    """Test eligibility checking"""
    print_header("TEST 2: Eligibility Check")
    
    test_profile = {
        "age": 30,
        "gender": "male",
        "annual_income": 150000,
        "state": "Gujarat",
        "occupation": "farmer",
        "category": "general",
        "life_event": "crop_failure"
    }
    
    print("Testing with profile:")
    print(json.dumps(test_profile, indent=2))
    print()
    
    try:
        response = requests.post(
            f"{BASE_URL}/schemes/check-eligibility",
            json=test_profile,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Eligibility check successful!")
            print(f"   Eligible schemes: {data.get('eligible_count')}")
            print(f"   Ineligible schemes: {data.get('ineligible_count')}")
            
            if data.get('eligible_schemes'):
                print("\n   Top eligible schemes:")
                for i, scheme in enumerate(data['eligible_schemes'][:3], 1):
                    print(f"   {i}. {scheme['name']}")
                    print(f"      Benefit: {scheme['benefit']}")
                    print(f"      Priority: {scheme.get('priority_score', 0)}")
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_get_all_schemes():
    """Test getting all schemes"""
    print_header("TEST 3: Get All Schemes")
    
    try:
        response = requests.get(f"{BASE_URL}/schemes/all", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            central_count = len(data.get('central', []))
            state_count = sum(len(schemes) for schemes in data.get('states', {}).values())
            
            print("✅ Retrieved all schemes successfully!")
            print(f"   Central schemes: {central_count}")
            print(f"   State schemes: {state_count}")
            print(f"   Total schemes: {central_count + state_count}")
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_life_event_mapping():
    """Test life event based scheme recommendation"""
    print_header("TEST 4: Life Event Mapping")
    
    test_data = {
        "life_event": "crop_failure",
        "user_profile": {
            "age": 35,
            "state": "Gujarat",
            "occupation": "farmer",
            "annual_income": 100000
        }
    }
    
    print("Testing life event: crop_failure")
    print()
    
    try:
        response = requests.post(
            f"{BASE_URL}/schemes/life-event",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f" Life event mapping successful!")
            print(f"   Schemes found: {data.get('schemes_found')}")
            
            if data.get('schemes'):
                print("\n   Relevant schemes:")
                for i, scheme in enumerate(data['schemes'][:3], 1):
                    print(f"   {i}. {scheme['name']}")
                    eligible = scheme.get('eligibility_status', {}).get('eligible', False)
                    status = "✓ Eligible" if eligible else "✗ Not Eligible"
                    print(f"      Status: {status}")
            return True
        else:
            print(f" Request failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f" Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n")
    print("🇮🇳 SevaSahayak Backend Test Suite")
    print("Testing backend functionality...")
    print()

    server_proc = ensure_server_running()
    
    # Run tests
    results = []
    results.append(("Health Check", test_health_check()))
    
    if results[0][1]:  # Only continue if health check passed
        results.append(("Eligibility Check", test_eligibility_check()))
        results.append(("Get All Schemes", test_get_all_schemes()))
        results.append(("Life Event Mapping", test_life_event_mapping()))
    
    # Print summary
    print_header("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n All tests passed! Backend is working perfectly!")
    else:
        print("\n⚠️ Some tests failed. Check the output above for details.")

    if server_proc is not None:
        server_proc.terminate()
        server_proc.join(timeout=2)
    
    print()

if __name__ == "__main__":
    main()
