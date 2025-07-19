# ML Models Directory

Place your pickle files here:

1. `adult_autism_model.pkl` - The trained model for adult autism screening
2. `toddler_autism_model.pkl` - The trained model for toddler autism screening

The models should be trained to predict autism based on the questionnaire responses (A1-A10) where:
- Input: Binary features (0/1) representing yes/no responses to 10 questions
- Output: Binary prediction (0 = No autism, 1 = Autism detected)

Make sure the models are compatible with scikit-learn and have a `.predict()` method. 