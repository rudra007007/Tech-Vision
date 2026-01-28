#!/usr/bin/env python3
"""
Quick test for IndicTrans2 translation functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_translation():
    """Test the translation endpoint"""
    print("\n" + "="*60)
    print("Testing IndicTrans2 Translation")
    print("="*60)
    
    print("\n1. Testing English to Hindi translation...")
    try:
        response = requests.post(
            f"{BASE_URL}/translate",
            json={
                "text": "Pradhan Mantri Kisan Samman Nidhi",
                "target_lang": "hin_Deva"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Original: {data['original']}")
            print(f"   Translated: {data['translated']}")
            print("   ✓ Single translation works!")
        else:
            print(f"   ✗ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n2. Testing batch translation to Gujarati...")
    try:
        response = requests.post(
            f"{BASE_URL}/translate/batch",
            json={
                "texts": [
                    "Agricultural Scheme",
                    "Health Insurance for families",
                    "Education Scholarship"
                ],
                "target_lang": "guj_Gujr"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("   Translations:")
            for item in data['translations']:
                print(f"   • {item['original']} → {item['translated']}")
            print("   ✓ Batch translation works!")
        else:
            print(f"   ✗ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n3. Testing Tamil translation...")
    try:
        response = requests.post(
            f"{BASE_URL}/translate",
            json={
                "text": "Government welfare schemes for citizens",
                "target_lang": "tam_Taml"
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Original: {data['original']}")
            print(f"   Translated: {data['translated']}")
            print("   ✓ Tamil translation works!")
        else:
            print(f"   ✗ Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "="*60)
    print("Translation Test Complete!")
    print("="*60)
    print("\nNOTE: If you get connection errors, make sure the backend")
    print("is running with: python app.py")
    print("\nFirst run may take time as the model is downloaded (~2GB)")
    print("="*60 + "\n")

if __name__ == "__main__":
    print("\n⚠️  Make sure the backend is running on http://localhost:5000")
    print("Start it with: python app.py\n")
    
    input("Press Enter to start tests...")
    test_translation()
