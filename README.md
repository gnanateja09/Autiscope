# Autism Screening Application

A comprehensive web application for autism screening with integrated machine learning models for both adults and toddlers.

## Features

- **Dual Screening Forms**: Separate questionnaires for adults and toddlers
- **ML-Powered Predictions**: Uses trained machine learning models for accurate autism detection
- **Fallback Logic**: Graceful degradation when ML models are unavailable
- **User Authentication**: Secure login and registration system
- **Screening History**: Track and lookup previous screenings
- **Detailed Reports**: Comprehensive reports with radar charts and recommendations
- **Responsive Design**: Modern UI that works on all devices

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── utils/             # Utility functions including ML API calls
│   └── lib/               # Configuration and libraries
├── backend/               # Python Flask backend
│   ├── app.py            # Main Flask application
│   ├── start.py          # Startup script with model validation
│   ├── requirements.txt  # Python dependencies
│   └── models/           # ML model files (pickle files go here)
└── supabase/             # Database configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run setup
```

### 2. Add ML Models

Place your trained pickle files in the `backend/models/` directory:

- `adult_autism_model.pkl` - Model for adult autism screening
- `toddler_autism_model.pkl` - Model for toddler autism screening

**Note**: If models are not provided, the application will use fallback prediction logic based on response counting.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

### 4. Start the Application

```bash
# Start both frontend and backend simultaneously
npm run dev:full

# Or start them separately:
# Frontend only
npm run dev

# Backend only
npm run backend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## ML Model Integration

### Model Requirements

The pickle files should contain scikit-learn compatible models with:

- **Input**: 10 binary features (0/1) representing yes/no responses to questions A1-A10
- **Output**: Binary prediction (0 = No autism, 1 = Autism detected)
- **Methods**: `.predict()` and optionally `.predict_proba()`

### API Endpoints

- `GET /health` - Check ML service health and model availability
- `POST /predict/adult` - Predict autism for adults
- `POST /predict/toddler` - Predict autism for toddlers

### Request Format

```json
{
  "responses": {
    "A1": "yes",
    "A2": "no",
    "A3": "yes",
    "A4": "no",
    "A5": "yes",
    "A6": "no",
    "A7": "yes",
    "A8": "no",
    "A9": "yes",
    "A10": "no"
  }
}
```

### Response Format

```json
{
  "prediction": "YES",
  "confidence": 0.85,
  "features_used": [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
}
```

## Usage

1. **Register/Login**: Create an account or sign in
2. **Select Screening Type**: Choose between adult or toddler screening
3. **Complete Questionnaire**: Answer all 10 questions honestly
4. **Get Prediction**: Receive ML-powered autism prediction with confidence score
5. **Classification** (if positive): Complete additional questions for severity assessment
6. **View Report**: See detailed results with radar charts and recommendations

## Fallback Behavior

If the ML models are unavailable or fail to load:

1. The application will continue to function
2. Predictions will use simple counting logic:
   - **Adults**: 6+ "yes" responses = autism detected
   - **Toddlers**: 3+ "yes" responses = autism detected
3. Users will be notified that fallback logic is being used

## Development

### Adding New Features

1. Frontend changes: Edit files in `src/`
2. Backend changes: Edit files in `backend/`
3. Database changes: Update Supabase schema

### Testing ML Models

```bash
# Test the backend API directly
curl -X POST http://localhost:5000/predict/adult \
  -H "Content-Type: application/json" \
  -d '{"responses":{"A1":"yes","A2":"no","A3":"yes","A4":"no","A5":"yes","A6":"no","A7":"yes","A8":"no","A9":"yes","A10":"no"}}'
```

## Troubleshooting

### Common Issues

1. **Models not loading**: Check that pickle files are in `backend/models/`
2. **API connection errors**: Ensure backend is running on port 5000
3. **CORS errors**: Backend includes CORS configuration for localhost
4. **Python dependencies**: Run `npm run setup` to install requirements

### Logs

- Frontend logs: Check browser console
- Backend logs: Check terminal where `npm run backend` is running

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 