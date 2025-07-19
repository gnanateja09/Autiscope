from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load the ML models
def load_models():
    try:
        # Load adult model
        with open('models/adult_autism_model.pkl', 'rb') as f:
            adult_model = pickle.load(f)
        
        # Load toddler model
        with open('models/toddler_autism_model.pkl', 'rb') as f:
            toddler_model = pickle.load(f)
        
        return adult_model, toddler_model
    except FileNotFoundError as e:
        print(f"Model file not found: {e}")
        return None, None
    except Exception as e:
        print(f"Error loading models: {e}")
        return None, None

adult_model, toddler_model = load_models()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'models_loaded': adult_model is not None and toddler_model is not None})

@app.route('/predict/adult', methods=['POST'])
def predict_adult():
    try:
        data = request.json
        
        # Extract form responses
        responses = data.get('responses', {})
        
        # Convert responses to feature vector
        # Assuming the model expects binary values (0/1) for yes/no responses
        features = []
        for i in range(1, 11):  # A1 to A10
            key = f'A{i}'
            value = responses.get(key, 'no')
            features.append(1 if value.lower() == 'yes' else 0)
        
        # Make prediction
        if adult_model is None:
            return jsonify({'error': 'Adult model not loaded'}), 500
        
        prediction = adult_model.predict([features])[0]
        probability = adult_model.predict_proba([features])[0] if hasattr(adult_model, 'predict_proba') else None
        
        result = {
            'prediction': 'YES' if prediction == 1 else 'NO',
            'confidence': float(probability[1]) if probability is not None else None,
            'features_used': features
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/toddler', methods=['POST'])
def predict_toddler():
    try:
        data = request.json
        
        # Extract form responses
        responses = data.get('responses', {})
        
        # Convert responses to feature vector
        # Assuming the model expects binary values (0/1) for yes/no responses
        features = []
        for i in range(1, 11):  # A1 to A10
            key = f'A{i}'
            value = responses.get(key, 'no')
            features.append(1 if value.lower() == 'yes' else 0)
        
        # Make prediction
        if toddler_model is None:
            return jsonify({'error': 'Toddler model not loaded'}), 500
        
        prediction = toddler_model.predict([features])[0]
        probability = toddler_model.predict_proba([features])[0] if hasattr(toddler_model, 'predict_proba') else None
        
        result = {
            'prediction': 'YES' if prediction == 1 else 'NO',
            'confidence': float(probability[1]) if probability is not None else None,
            'features_used': features
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port) 