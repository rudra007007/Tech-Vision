from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import hashlib
import secrets
import os

app = Flask(__name__)
CORS(app)

# User data file
USERS_FILE = 'users.json'

# Helper functions for user management
def load_users():
    """Load users from JSON file"""
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_users(users):
    """Save users to JSON file"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    """Generate a random token"""
    return secrets.token_hex(32)

translation_model = None
translation_tokenizer = None

def initialize_translation():
    global translation_model, translation_tokenizer
    try:
        model_name = "ai4bharat/indictrans2-en-indic-1B"
        translation_tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        translation_model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True)
        print("Translation model loaded successfully")
    except Exception as e:
        print(f"Error loading translation model: {e}")
        print("Translation features will be disabled")

initialize_translation()

# Comprehensive scheme database
SCHEMES_DATABASE = {
    "central": [
        {
            "id": "PM-KISAN",
            "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "category": "Agriculture",
            "benefit": "₹6000/year in 3 installments",
            "eligibility": {
                "occupation": ["farmer", "agriculture"],
                "land_size": "any",
                "income": 0,  # No income limit
                "age_min": 18
            },
            "life_events": ["crop_failure", "farming"],
            "documents": ["Aadhaar", "Bank Account", "Land Records"],
            "application_link": "https://pmkisan.gov.in/"
        },
        {
            "id": "PMJAY",
            "name": "Ayushman Bharat (PM-JAY)",
            "category": "Healthcare",
            "benefit": "₹5 lakh health insurance per family",
            "eligibility": {
                "income": 200000,  # Below 2 lakh
                "category": ["general", "obc", "sc", "st"]
            },
            "life_events": ["medical_emergency", "pregnancy", "illness"],
            "documents": ["Aadhaar", "Ration Card", "Income Certificate"],
            "application_link": "https://pmjay.gov.in/"
        },
        {
            "id": "SUKANYA",
            "name": "Sukanya Samriddhi Yojana",
            "category": "Girl Child",
            "benefit": "High-interest savings scheme for girls",
            "eligibility": {
                "gender": "female",
                "age_max": 10,
                "parent_required": True
            },
            "life_events": ["daughter_birth", "education"],
            "documents": ["Birth Certificate", "Parent Aadhaar", "Bank Account"],
            "application_link": "https://www.india.gov.in/sukanya-samriddhi-yojana"
        },
        {
            "id": "PMUY",
            "name": "Pradhan Mantri Ujjwala Yojana",
            "category": "LPG Connection",
            "benefit": "Free LPG connection",
            "eligibility": {
                "gender": "female",
                "category": ["bpl", "obc", "sc", "st"],
                "income": 100000
            },
            "life_events": ["household_needs"],
            "documents": ["Aadhaar", "BPL Card", "Bank Account"],
            "application_link": "https://www.pmuy.gov.in/"
        },
        {
            "id": "PMAY",
            "name": "Pradhan Mantri Awas Yojana",
            "category": "Housing",
            "benefit": "Subsidy on home loan interest",
            "eligibility": {
                "income": 1800000,  # Below 18 lakh
                "own_house": False
            },
            "life_events": ["marriage", "family_growth"],
            "documents": ["Aadhaar", "Income Certificate", "Property Documents"],
            "application_link": "https://pmaymis.gov.in/"
        },
        {
            "id": "MGNREGA",
            "name": "MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)",
            "category": "Employment",
            "benefit": "100 days guaranteed wage employment",
            "eligibility": {
                "location": "rural",
                "age_min": 18,
                "willing_to_work": True
            },
            "life_events": ["job_loss", "unemployment"],
            "documents": ["Job Card", "Bank Account", "Aadhaar"],
            "application_link": "https://nrega.nic.in/"
        },
        {
            "id": "NSS",
            "name": "National Scholarship Scheme",
            "category": "Education",
            "benefit": "Educational scholarship",
            "eligibility": {
                "student": True,
                "income": 250000,
                "age_min": 16,
                "age_max": 25
            },
            "life_events": ["education", "12th_failure", "college_admission"],
            "documents": ["Marksheet", "Income Certificate", "Aadhaar"],
            "application_link": "https://scholarships.gov.in/"
        },
        {
            "id": "PMSBY",
            "name": "Pradhan Mantri Suraksha Bima Yojana",
            "category": "Insurance",
            "benefit": "₹2 lakh accident insurance",
            "eligibility": {
                "age_min": 18,
                "age_max": 70,
                "bank_account": True
            },
            "life_events": ["accident", "disability"],
            "documents": ["Bank Account", "Aadhaar"],
            "application_link": "https://www.india.gov.in/pmsby"
        },
        {
            "id": "PMJDY",
            "name": "Pradhan Mantri Jan Dhan Yojana",
            "category": "Banking",
            "benefit": "Free bank account with insurance coverage",
            "eligibility": {
                "age_min": 10,
                "category": ["general", "obc", "sc", "st"]
            },
            "life_events": ["financial_inclusion"],
            "documents": ["Aadhaar", "Address Proof"],
            "application_link": "https://pmjdy.gov.in/"
        },
        {
            "id": "PMVVY",
            "name": "Pradhan Mantri Vaya Vandana Yojana",
            "category": "Pension",
            "benefit": "Guaranteed pension for senior citizens",
            "eligibility": {
                "age_min": 60,
                "income": 500000
            },
            "life_events": ["retirement", "old_age"],
            "documents": ["Aadhaar", "Age Proof", "Income Certificate"],
            "application_link": "https://www.india.gov.in/pmvvy"
        },
        {
            "id": "PMSBY-AP",
            "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana",
            "category": "Insurance",
            "benefit": "₹2 lakh life insurance at ₹436/year",
            "eligibility": {
                "age_min": 18,
                "age_max": 55,
                "bank_account": True
            },
            "life_events": ["insurance_coverage"],
            "documents": ["Bank Account", "Aadhaar"],
            "application_link": "https://www.india.gov.in/pmjjby"
        },
        {
            "id": "APY",
            "name": "Atal Pension Yojana",
            "category": "Pension",
            "benefit": "Guaranteed pension from ₹1000-5000/month",
            "eligibility": {
                "age_min": 18,
                "age_max": 40,
                "occupation": ["self-employed", "unorganized"]
            },
            "life_events": ["retirement", "old_age"],
            "documents": ["Aadhaar", "Bank Account"],
            "application_link": "https://www.india.gov.in/apy"
        },
        {
            "id": "BHAMASHAH",
            "name": "Bhamashah Yojana",
            "category": "Women Empowerment",
            "benefit": "Direct cash transfer to women for various benefits",
            "eligibility": {
                "gender": "female",
                "age_min": 18,
                "income": 100000
            },
            "life_events": ["women_welfare", "financial_support"],
            "documents": ["Aadhaar", "Marriage Certificate", "Income Certificate"],
            "application_link": "https://www.india.gov.in/bhamashah"
        },
        {
            "id": "PMKVY",
            "name": "Pradhan Mantri Kaushal Vikas Yojana",
            "category": "Skill Development",
            "benefit": "Free skill training and certification",
            "eligibility": {
                "age_min": 15,
                "student": False
            },
            "life_events": ["unemployment", "skill_training"],
            "documents": ["Aadhaar", "10th Marksheet", "Address Proof"],
            "application_link": "https://pmkvyofficial.org/"
        },
        {
            "id": "STARTUP-INDIA",
            "name": "Startup India Scheme",
            "category": "Entrepreneurship",
            "benefit": "Tax benefits, funding, and support for startups",
            "eligibility": {
                "age_min": 18,
                "category": ["general", "obc", "sc", "st"]
            },
            "life_events": ["business_startup"],
            "documents": ["Business Registration", "Aadhaar", "Bank Account"],
            "application_link": "https://www.startupindia.gov.in/"
        },
        {
            "id": "MUDRA",
            "name": "Pradhan Mantri MUDRA Yojana",
            "category": "Business Loans",
            "benefit": "Unsecured loans up to ₹10 lakh for small business",
            "eligibility": {
                "age_min": 21,
                "occupation": ["self-employed", "entrepreneur"]
            },
            "life_events": ["business_startup", "business_expansion"],
            "documents": ["Business Plan", "Aadhaar", "Bank Account"],
            "application_link": "https://www.mudra.org.in/"
        },
        {
            "id": "LPGDIST",
            "name": "LPG Distribution Scheme",
            "category": "Fuel Subsidy",
            "benefit": "Subsidized LPG cylinders",
            "eligibility": {
                "income": 500000
            },
            "life_events": ["household_needs"],
            "documents": ["Aadhaar", "Address Proof", "Income Certificate"],
            "application_link": "https://www.india.gov.in/lpg"
        },
        {
            "id": "RWASS",
            "name": "Rajiv Gandhi Scheme for Adolescent Girls",
            "category": "Girl Child",
            "benefit": "Nutrition and life skill training for girls",
            "eligibility": {
                "gender": "female",
                "age_min": 11,
                "age_max": 18
            },
            "life_events": ["education", "nutrition"],
            "documents": ["Birth Certificate", "School Enrollment", "Aadhaar"],
            "application_link": "https://www.india.gov.in/rgsgag"
        }
    ],
    "state_schemes": {
        "Gujarat": [
            {
                "id": "VAHLI-DIKRI",
                "name": "Vahli Dikri Yojana",
                "category": "Girl Child",
                "benefit": "₹1,10,000 for girl child education & marriage",
                "eligibility": {
                    "gender": "female",
                    "state": "Gujarat",
                    "income": 200000,
                    "age_max": 18
                },
                "life_events": ["daughter_birth", "marriage"],
                "documents": ["Birth Certificate", "Income Certificate", "Domicile"],
                "application_link": "https://esamajkalyan.gujarat.gov.in/"
            },
            {
                "id": "GJ-FARMER",
                "name": "Mukhyamantri Kisan Sahay Yojana",
                "category": "Agriculture",
                "benefit": "Up to ₹20,000 crop insurance",
                "eligibility": {
                    "occupation": ["farmer"],
                    "state": "Gujarat"
                },
                "life_events": ["crop_failure"],
                "documents": ["Land Records", "Aadhaar", "Bank Account"],
                "application_link": "https://ikhedut.gujarat.gov.in/"
            }
        ],
        "Maharashtra": [
            {
                "id": "MH-EDUCATION",
                "name": "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Punarpurti Yojana",
                "category": "Education",
                "benefit": "Education fee reimbursement",
                "eligibility": {
                    "state": "Maharashtra",
                    "category": ["obc", "sc", "st"],
                    "student": True
                },
                "life_events": ["education", "college_admission"],
                "documents": ["Caste Certificate", "Income Certificate", "Admission Receipt"],
                "application_link": "https://mahadbt.maharashtra.gov.in/"
            }
        ],
        "Rajasthan": [
            {
                "id": "RJ-WIDOW",
                "name": "Vidhwa Pension Yojana",
                "category": "Pension",
                "benefit": "₹500-1500/month pension",
                "eligibility": {
                    "marital_status": "widow",
                    "state": "Rajasthan",
                    "age_min": 18
                },
                "life_events": ["spouse_death"],
                "documents": ["Death Certificate", "Aadhaar", "Bank Account"],
                "application_link": "https://rajssp.raj.nic.in/"
            },
            {
                "id": "RJ-EDUCATION",
                "name": "Rajasthan Merit Scholarship Scheme",
                "category": "Education",
                "benefit": "Merit-based scholarships for students",
                "eligibility": {
                    "state": "Rajasthan",
                    "student": True,
                    "income": 300000
                },
                "life_events": ["education", "college_admission"],
                "documents": ["Marksheet", "Income Certificate", "Aadhaar"],
                "application_link": "https://rajasthan.gov.in/education"
            },
            {
                "id": "RJ-ELDERLY",
                "name": "Rajasthan Senior Citizen Scheme",
                "category": "Pension",
                "benefit": "₹750-1500/month pension for elderly",
                "eligibility": {
                    "age_min": 75,
                    "state": "Rajasthan"
                },
                "life_events": ["old_age"],
                "documents": ["Age Proof", "Income Certificate", "Aadhaar"],
                "application_link": "https://rajasthan.gov.in/senior-citizen"
            }
        ],
        "Karnataka": [
            {
                "id": "KA-AKSHARA",
                "name": "Akshara Dasoha Scheme",
                "category": "Education",
                "benefit": "Free textbooks for government school students",
                "eligibility": {
                    "state": "Karnataka",
                    "student": True,
                    "income": 250000
                },
                "life_events": ["education"],
                "documents": ["School ID", "Income Certificate", "Aadhaar"],
                "application_link": "https://karnataka.gov.in/education"
            },
            {
                "id": "KA-INDIRA",
                "name": "Indira Canteen Scheme",
                "category": "Food Security",
                "benefit": "Subsidized food at ₹5 per meal",
                "eligibility": {
                    "state": "Karnataka",
                    "income": 200000
                },
                "life_events": ["food_security"],
                "documents": ["Aadhaar", "Income Certificate"],
                "application_link": "https://karnataka.gov.in/indira-canteen"
            }
        ],
        "Tamil Nadu": [
            {
                "id": "TN-AMMAVIN",
                "name": "Ammavin Marumugathuvam Scheme",
                "category": "Women Empowerment",
                "benefit": "Maternal health benefits and nutrition",
                "eligibility": {
                    "state": "Tamil Nadu",
                    "gender": "female",
                    "income": 300000
                },
                "life_events": ["pregnancy", "child_birth"],
                "documents": ["Pregnancy Certificate", "Aadhaar", "Income Certificate"],
                "application_link": "https://tamilnadu.gov.in/ammavin-marumugathuvam"
            },
            {
                "id": "TN-STUDENT-AID",
                "name": "Tamil Nadu Student Aid Scheme",
                "category": "Education",
                "benefit": "One-time grants for poor students",
                "eligibility": {
                    "state": "Tamil Nadu",
                    "student": True,
                    "income": 150000
                },
                "life_events": ["education"],
                "documents": ["Marksheet", "Income Certificate", "Aadhaar"],
                "application_link": "https://tamilnadu.gov.in/student-aid"
            }
        ],
        "Kerala": [
            {
                "id": "KL-KUDUMBASHREE",
                "name": "Kudumbashree Mission",
                "category": "Women Empowerment",
                "benefit": "Microfinance and livelihood support for women",
                "eligibility": {
                    "state": "Kerala",
                    "gender": "female",
                    "age_min": 18
                },
                "life_events": ["women_welfare", "business_startup"],
                "documents": ["Aadhaar", "Bank Account", "Community Certificate"],
                "application_link": "https://kudumbashree.org/"
            },
            {
                "id": "KL-HEALTHCARE",
                "name": "Karuna Benevolent Fund",
                "category": "Healthcare",
                "benefit": "Healthcare assistance for poor families",
                "eligibility": {
                    "state": "Kerala",
                    "income": 100000
                },
                "life_events": ["medical_emergency"],
                "documents": ["Income Certificate", "Medical Certificate", "Aadhaar"],
                "application_link": "https://kerala.gov.in/karuna-fund"
            }
        ],
        "Bihar": [
            {
                "id": "BR-KANYA-UTTHAN",
                "name": "Kanya Utthan Yojana",
                "category": "Girl Child",
                "benefit": "Cash assistance for girl child education",
                "eligibility": {
                    "state": "Bihar",
                    "gender": "female",
                    "age_max": 18,
                    "income": 300000
                },
                "life_events": ["education", "daughter_birth"],
                "documents": ["Birth Certificate", "School Enrollment", "Income Certificate"],
                "application_link": "https://bihar.gov.in/kanya-utthan"
            },
            {
                "id": "BR-YOUTH-EMPLOYMENT",
                "name": "Bihar Youth Employment Scheme",
                "category": "Employment",
                "benefit": "Job training and placement support",
                "eligibility": {
                    "state": "Bihar",
                    "age_min": 18,
                    "age_max": 35
                },
                "life_events": ["unemployment", "job_training"],
                "documents": ["Aadhaar", "Educational Certificate", "Address Proof"],
                "application_link": "https://bihar.gov.in/employment"
            }
        ],
        "West Bengal": [
            {
                "id": "WB-KRISHAK-BANDHU",
                "name": "Krishak Bandhu Scheme",
                "category": "Agriculture",
                "benefit": "Crop insurance and direct cash transfer",
                "eligibility": {
                    "state": "West Bengal",
                    "occupation": ["farmer"],
                    "income": 500000
                },
                "life_events": ["crop_failure", "farming"],
                "documents": ["Land Records", "Aadhaar", "Farmer Registration"],
                "application_link": "https://wb.gov.in/krishak-bandhu"
            },
            {
                "id": "WB-SWASTHYA-SATHI",
                "name": "Swasthya Sathi Scheme",
                "category": "Healthcare",
                "benefit": "₹3 lakh health insurance for all",
                "eligibility": {
                    "state": "West Bengal",
                    "income": 600000
                },
                "life_events": ["medical_emergency"],
                "documents": ["Aadhaar", "Income Certificate", "Address Proof"],
                "application_link": "https://wb.gov.in/swasthya-sathi"
            }
        ],
        "Punjab": [
            {
                "id": "PB-BHAGAT",
                "name": "Dr. Ambedkar Scheme for Social Integration",
                "category": "Social Security",
                "benefit": "Pension and support for scheduled castes",
                "eligibility": {
                    "state": "Punjab",
                    "category": ["sc"],
                    "age_min": 18
                },
                "life_events": ["old_age", "disability"],
                "documents": ["Caste Certificate", "Aadhaar", "Age Proof"],
                "application_link": "https://punjab.gov.in/social-integration"
            }
        ]
    }
}

# Life event mappings
LIFE_EVENT_MAPPINGS = {
    "job_loss": {
        "keywords": ["unemployment", "lost job", "no work", "job loss"],
        "relevant_schemes": ["MGNREGA", "PMAY", "PMJAY"]
    },
    "daughter_marriage": {
        "keywords": ["daughter marriage", "daughter wedding", "girl marriage"],
        "relevant_schemes": ["SUKANYA", "VAHLI-DIKRI", "PMAY"]
    },
    "12th_failure": {
        "keywords": ["failed 12th", "12th fail", "education", "study"],
        "relevant_schemes": ["NSS", "MH-EDUCATION"]
    },
    "crop_failure": {
        "keywords": ["crop fail", "farming loss", "agriculture problem"],
        "relevant_schemes": ["PM-KISAN", "GJ-FARMER", "MGNREGA"]
    },
    "pregnancy": {
        "keywords": ["pregnant", "expecting baby", "child birth"],
        "relevant_schemes": ["PMJAY", "SUKANYA"]
    },
    "medical_emergency": {
        "keywords": ["medical", "illness", "hospital", "treatment"],
        "relevant_schemes": ["PMJAY", "PMSBY"]
    }
}

def check_eligibility(user_profile, scheme):
    """Check if user is eli
    3gible for a scheme"""
    eligibility = scheme.get("eligibility", {})
    reasons = []
    eligible = True
    
    # Check age
    if "age_min" in eligibility:
        if user_profile.get("age", 0) < eligibility["age_min"]:
            eligible = False
            reasons.append(f"Age must be at least {eligibility['age_min']} years")
    
    if "age_max" in eligibility:
        if user_profile.get("age", 100) > eligibility["age_max"]:
            eligible = False
            reasons.append(f"Age must be below {eligibility['age_max']} years")
    
    # Check income
    if "income" in eligibility and eligibility["income"] > 0:
        if user_profile.get("annual_income", 0) > eligibility["income"]:
            eligible = False
            reasons.append(f"Annual income must be below ₹{eligibility['income']:,}")
    
    # Check gender
    if "gender" in eligibility:
        if user_profile.get("gender", "").lower() != eligibility["gender"]:
            eligible = False
            reasons.append(f"Only available for {eligibility['gender']} applicants")
    
    # Check occupation
    if "occupation" in eligibility:
        user_occupation = user_profile.get("occupation", "").lower()
        if user_occupation not in eligibility["occupation"]:
            eligible = False
            reasons.append(f"Only for {', '.join(eligibility['occupation'])}")
    
    # Check category
    if "category" in eligibility:
        user_category = user_profile.get("category", "").lower()
        if user_category not in eligibility["category"]:
            eligible = False
            reasons.append(f"Only for {', '.join(eligibility['category'])} categories")
    
    # Check state for state schemes
    if "state" in eligibility:
        if user_profile.get("state", "") != eligibility["state"]:
            eligible = False
            reasons.append(f"Only for {eligibility['state']} residents")
    
    if eligible:
        reasons.append("All eligibility criteria met")
    
    return {
        "eligible": eligible,
        "reasons": reasons
    }

def calculate_priority_score(user_profile, scheme, eligibility_result):
    """Calculate priority score for scheme ranking"""
    if not eligibility_result["eligible"]:
        return 0
    
    score = 50  # Base score
    
    # Life event matching
    life_event = user_profile.get("life_event", "").lower()
    scheme_events = [e.lower() for e in scheme.get("life_events", [])]
    
    for event in scheme_events:
        if life_event in event or event in life_event:
            score += 30
            break
    
    # Benefit amount (higher benefit = higher score)
    benefit_text = scheme.get("benefit", "")
    if "₹" in benefit_text:
        score += 10
    if "lakh" in benefit_text.lower():
        score += 15
    
    # Document readiness (fewer documents = higher score)
    doc_count = len(scheme.get("documents", []))
    score += max(0, 20 - (doc_count * 3))
    
    return score

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# Authentication Endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'password', 'phone', 'age', 'gender', 'state']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400
        
        # Load existing users
        users = load_users()
        
        # Check if email already exists
        if any(user['email'] == data['email'] for user in users):
            return jsonify({"success": False, "message": "Email already registered"}), 400
        
        # Create new user
        new_user = {
            "id": str(len(users) + 1),
            "firstName": data['firstName'],
            "lastName": data['lastName'],
            "email": data['email'],
            "password": hash_password(data['password']),
            "phone": data['phone'],
            "age": data['age'],
            "gender": data['gender'],
            "state": data['state'],
            "createdAt": datetime.now().isoformat()
        }
        
        users.append(new_user)
        save_users(users)
        
        return jsonify({
            "success": True,
            "message": "Registration successful"
        }), 201
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400
        
        # Load users
        users = load_users()
        
        # Find user
        user = next((u for u in users if u['email'] == email), None)
        
        if not user:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
        
        # Verify password
        if user['password'] != hash_password(password):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
        
        # Generate token
        token = generate_token()
        
        # Remove password from response
        user_data = {k: v for k, v in user.items() if k != 'password'}
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": user_data,
            "token": token
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/auth/update-profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        data = request.json
        email = data.get('email')
        
        if not email:
            return jsonify({"success": False, "message": "Email is required"}), 400
        
        # Load users
        users = load_users()
        
        # Find user
        user_index = next((i for i, u in enumerate(users) if u['email'] == email), None)
        
        if user_index is None:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        # Update user data
        updatable_fields = ['firstName', 'lastName', 'phone', 'age', 'gender', 'state']
        for field in updatable_fields:
            if field in data:
                users[user_index][field] = data[field]
        
        users[user_index]['updatedAt'] = datetime.now().isoformat()
        
        save_users(users)
        
        # Remove password from response
        user_data = {k: v for k, v in users[user_index].items() if k != 'password'}
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": user_data
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/auth/user/<email>', methods=['GET'])
def get_user(email):
    """Get user by email"""
    try:
        users = load_users()
        user = next((u for u in users if u['email'] == email), None)
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        # Remove password from response
        user_data = {k: v for k, v in user.items() if k != 'password'}
        
        return jsonify({
            "success": True,
            "user": user_data
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/schemes/check-eligibility', methods=['POST'])
def check_eligibility_endpoint():
    """Check eligibility for all schemes based on user profile"""
    try:
        user_profile = request.json
        
        if not user_profile:
            return jsonify({"error": "User profile is required"}), 400
        
        eligible_schemes = []
        ineligible_schemes = []
        
        # Check central schemes
        for scheme in SCHEMES_DATABASE["central"]:
            eligibility_result = check_eligibility(user_profile, scheme)
            priority_score = calculate_priority_score(user_profile, scheme, eligibility_result)
            
            scheme_result = {
                **scheme,
                "eligibility_status": eligibility_result,
                "priority_score": priority_score,
                "scheme_type": "Central Government"
            }
            
            if eligibility_result["eligible"]:
                eligible_schemes.append(scheme_result)
            else:
                ineligible_schemes.append(scheme_result)
        
        # Check state schemes
        user_state = user_profile.get("state", "")
        if user_state in SCHEMES_DATABASE["state_schemes"]:
            for scheme in SCHEMES_DATABASE["state_schemes"][user_state]:
                eligibility_result = check_eligibility(user_profile, scheme)
                priority_score = calculate_priority_score(user_profile, scheme, eligibility_result)
                
                scheme_result = {
                    **scheme,
                    "eligibility_status": eligibility_result,
                    "priority_score": priority_score,
                    "scheme_type": f"{user_state} State Government"
                }
                
                if eligibility_result["eligible"]:
                    eligible_schemes.append(scheme_result)
                else:
                    ineligible_schemes.append(scheme_result)
        
        # Sort eligible schemes by priority
        eligible_schemes.sort(key=lambda x: x["priority_score"], reverse=True)
        
        return jsonify({
            "eligible_count": len(eligible_schemes),
            "ineligible_count": len(ineligible_schemes),
            "eligible_schemes": eligible_schemes,
            "ineligible_schemes": ineligible_schemes,
            "user_profile": user_profile
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schemes/life-event', methods=['POST'])
def get_schemes_by_life_event():
    """Get schemes based on life event"""
    try:
        data = request.json
        life_event = data.get("life_event", "").lower()
        user_profile = data.get("user_profile", {})
        
        # Get all schemes
        all_schemes = SCHEMES_DATABASE["central"].copy()
        
        # Add state schemes
        user_state = user_profile.get("state", "")
        if user_state in SCHEMES_DATABASE["state_schemes"]:
            all_schemes.extend(SCHEMES_DATABASE["state_schemes"][user_state])
        
        # Filter schemes by life event
        relevant_schemes = []
        for scheme in all_schemes:
            scheme_events = [e.lower() for e in scheme.get("life_events", [])]
            if any(life_event in event or event in life_event for event in scheme_events):
                eligibility_result = check_eligibility(user_profile, scheme)
                priority_score = calculate_priority_score(user_profile, scheme, eligibility_result)
                
                relevant_schemes.append({
                    **scheme,
                    "eligibility_status": eligibility_result,
                    "priority_score": priority_score
                })
        
        # Sort by priority
        relevant_schemes.sort(key=lambda x: x["priority_score"], reverse=True)
        
        return jsonify({
            "life_event": life_event,
            "schemes_found": len(relevant_schemes),
            "schemes": relevant_schemes
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/schemes/all', methods=['GET'])
def get_all_schemes():
    """Get all available schemes"""
    all_schemes = {
        "central": SCHEMES_DATABASE["central"],
        "states": SCHEMES_DATABASE["state_schemes"]
    }
    return jsonify(all_schemes)

@app.route('/api/schemes/<scheme_id>', methods=['GET'])
def get_scheme_details(scheme_id):
    """Get details of a specific scheme"""
    # Search in central schemes
    for scheme in SCHEMES_DATABASE["central"]:
        if scheme["id"] == scheme_id:
            return jsonify(scheme)
    
    # Search in state schemes
    for state, schemes in SCHEMES_DATABASE["state_schemes"].items():
        for scheme in schemes:
            if scheme["id"] == scheme_id:
                return jsonify(scheme)
    
    return jsonify({"error": "Scheme not found"}), 404

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """Translate text from English to Indian regional languages"""
    try:
        if translation_model is None:
            return jsonify({"error": "Translation model not loaded"}), 503
        
        data = request.json
        text = data.get('text', '')
        target_lang = data.get('target_lang', 'hin_Deva')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        src_lang = "eng_Latn"
        batch = [f"{src_lang} {text}"]
        
        inputs = translation_tokenizer(
            batch,
            truncation=True,
            padding="longest",
            return_tensors="pt",
            return_attention_mask=True,
        )
        
        with torch.no_grad():
            generated_tokens = translation_model.generate(
                **inputs,
                use_cache=True,
                min_length=0,
                max_length=256,
                num_beams=5,
                num_return_sequences=1,
            )
        
        with translation_tokenizer.as_target_tokenizer():
            generated_tokens = translation_tokenizer.batch_decode(
                generated_tokens.detach().cpu().tolist(),
                skip_special_tokens=True,
                clean_up_tokenization_spaces=True,
            )
        
        translated_text = generated_tokens[0]
        
        return jsonify({
            "original": text,
            "translated": translated_text,
            "source_lang": "English",
            "target_lang": target_lang
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/translate/batch', methods=['POST'])
def translate_batch():
    """Translate multiple texts at once"""
    try:
        if translation_model is None:
            return jsonify({"error": "Translation model not loaded"}), 503
        
        data = request.json
        texts = data.get('texts', [])
        target_lang = data.get('target_lang', 'hin_Deva')
        
        if not texts:
            return jsonify({"error": "No texts provided"}), 400
        
        src_lang = "eng_Latn"
        batch = [f"{src_lang} {text}" for text in texts]
        
        inputs = translation_tokenizer(
            batch,
            truncation=True,
            padding="longest",
            return_tensors="pt",
            return_attention_mask=True,
        )
        
        with torch.no_grad():
            generated_tokens = translation_model.generate(
                **inputs,
                use_cache=True,
                min_length=0,
                max_length=256,
                num_beams=5,
                num_return_sequences=1,
            )
        
        with translation_tokenizer.as_target_tokenizer():
            generated_tokens = translation_tokenizer.batch_decode(
                generated_tokens.detach().cpu().tolist(),
                skip_special_tokens=True,
                clean_up_tokenization_spaces=True,
            )
        
        return jsonify({
            "translations": [
                {"original": orig, "translated": trans}
                for orig, trans in zip(texts, generated_tokens)
            ],
            "source_lang": "English",
            "target_lang": target_lang
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
