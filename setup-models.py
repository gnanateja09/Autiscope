#!/usr/bin/env python3
"""
Helper script to set up ML models for the autism screening application.
This script will guide you through placing your pickle files in the correct location.
"""

import os
import shutil
from pathlib import Path

def main():
    print("🤖 Autism Screening App - ML Model Setup")
    print("=" * 50)
    
    # Check if models directory exists
    models_dir = Path("backend/models")
    models_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Models directory: {models_dir.absolute()}")
    print()
    
    # Check for existing models
    adult_model = models_dir / "adult_autism_model.pkl"
    toddler_model = models_dir / "toddler_autism_model.pkl"
    
    print("🔍 Checking for existing models...")
    
    if adult_model.exists():
        print(f"✅ Adult model found: {adult_model.name}")
    else:
        print(f"❌ Adult model missing: {adult_model.name}")
    
    if toddler_model.exists():
        print(f"✅ Toddler model found: {toddler_model.name}")
    else:
        print(f"❌ Toddler model missing: {toddler_model.name}")
    
    print()
    
    # Instructions
    print("📋 Instructions:")
    print("1. Place your pickle files in the models directory:")
    print(f"   - {adult_model}")
    print(f"   - {toddler_model}")
    print()
    print("2. Model requirements:")
    print("   - Must be scikit-learn compatible")
    print("   - Should accept 10 binary features (A1-A10)")
    print("   - Should output binary prediction (0/1)")
    print("   - Should have .predict() method")
    print()
    print("3. After placing the files, run:")
    print("   npm run backend")
    print()
    
    # Check current directory for pickle files
    current_dir = Path(".")
    pickle_files = list(current_dir.glob("*.pkl"))
    
    if pickle_files:
        print("🎯 Found pickle files in current directory:")
        for file in pickle_files:
            print(f"   - {file.name}")
        
        print()
        response = input("Would you like to move these files to the models directory? (y/n): ")
        
        if response.lower() in ['y', 'yes']:
            for file in pickle_files:
                if "adult" in file.name.lower():
                    target = adult_model
                elif "toddler" in file.name.lower():
                    target = toddler_model
                else:
                    print(f"⚠️  Skipping {file.name} - unclear if adult or toddler model")
                    continue
                
                try:
                    shutil.copy2(file, target)
                    print(f"✅ Moved {file.name} to {target}")
                except Exception as e:
                    print(f"❌ Error moving {file.name}: {e}")
    
    print()
    print("🚀 Ready to start the application!")
    print("Run 'npm run dev:full' to start both frontend and backend.")

if __name__ == "__main__":
    main() 