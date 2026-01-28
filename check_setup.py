#!/usr/bin/env python3
"""
Startup script to check if all dependencies are installed
and the translation model can be loaded
"""

import sys

print("="*60)
print("SevaSahayak - Checking Dependencies")
print("="*60)

required_packages = [
    ('flask', 'Flask'),
    ('flask_cors', 'Flask-CORS'),
    ('torch', 'PyTorch'),
    ('transformers', 'Transformers'),
    ('sentencepiece', 'SentencePiece'),
    ('IndicTransToolkit', 'IndicTransToolkit')
]

print("\n1. Checking installed packages...")
missing = []
for module, name in required_packages:
    try:
        __import__(module)
        print(f"   ✓ {name}")
    except ImportError:
        print(f"   ✗ {name} - NOT INSTALLED")
        missing.append(name)

if missing:
    print(f"\n❌ Missing packages: {', '.join(missing)}")
    print("\nInstall them with:")
    print("pip install -r requirements.txt")
    sys.exit(1)

print("\n2. Testing translation model loading...")
print("   (This may take a few minutes on first run - downloading ~2GB model)\n")

try:
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    from IndicTransToolkit import IndicProcessor
    
    print("   Loading model: ai4bharat/indictrans2-en-indic-1B")
    model_name = "ai4bharat/indictrans2-en-indic-1B"
    
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    print("   ✓ Tokenizer loaded")
    
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True)
    print("   ✓ Model loaded")
    
    ip = IndicProcessor(inference=True)
    print("   ✓ Processor initialized")
    
    print("\n3. Testing a quick translation...")
    import torch
    
    test_text = "Hello, welcome to SevaSahayak"
    src_lang = "eng_Latn"
    tgt_lang = "hin_Deva"
    
    batch = ip.preprocess_batch([test_text], src_lang=src_lang, tgt_lang=tgt_lang)
    inputs = tokenizer(batch, truncation=True, padding="longest", return_tensors="pt", return_attention_mask=True)
    
    with torch.no_grad():
        generated_tokens = model.generate(**inputs, use_cache=True, min_length=0, max_length=256, num_beams=5, num_return_sequences=1)
    
    with tokenizer.as_target_tokenizer():
        generated_tokens = tokenizer.batch_decode(generated_tokens.detach().cpu().tolist(), skip_special_tokens=True, clean_up_tokenization_spaces=True)
    
    translations = ip.postprocess_batch(generated_tokens, lang=tgt_lang)
    
    print(f"   Original: {test_text}")
    print(f"   Translation: {translations[0]}")
    print("   ✓ Translation working!")
    
except Exception as e:
    print(f"\n❌ Error loading model: {e}")
    print("\nPossible solutions:")
    print("1. Check your internet connection (for first-time download)")
    print("2. Ensure you have ~2GB free disk space")
    print("3. Try running: pip install --upgrade transformers")
    sys.exit(1)

print("\n" + "="*60)
print("✅ All checks passed! You're ready to go!")
print("="*60)
print("\nStart the application with:")
print("  python app.py")
print("\nThen open:")
print("  - Main app: index.html")
print("  - Translation demo: translation_demo.html")
print("="*60 + "\n")
