#!/usr/bin/env python3
import os
import sys
from pathlib import Path

def check_models():
    """Check if the required model files exist."""
    models_dir = Path(__file__).parent / 'models'
    adult_model = models_dir / 'adult_autism_model.pkl'
    toddler_model = models_dir / 'toddler_autism_model.pkl'
    
    missing_models = []
    if not adult_model.exists():
        missing_models.append('adult_autism_model.pkl')
    if not toddler_model.exists():
        missing_models.append('toddler_autism_model.pkl')
    
    if missing_models:
        print("❌ Missing model files:")
        for model in missing_models:
            print(f"   - {model}")
        print(f"\nPlease place the pickle files in the {models_dir} directory.")
        print("The application will still run but will use fallback prediction logic.")
        return False
    
    print("✅ All model files found!")
    return True

if __name__ == '__main__':
    print("🔍 Checking ML models...")
    models_available = check_models()
    
    if models_available:
        print("🚀 Starting Flask server with ML models...")
    else:
        print("⚠️  Starting Flask server with fallback logic...")
    
    # Import and run the Flask app
    from app import app
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port) 