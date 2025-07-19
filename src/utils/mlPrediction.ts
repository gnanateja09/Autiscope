const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface PredictionResponse {
  prediction: 'YES' | 'NO';
  confidence?: number;
  features_used: number[];
}

export interface PredictionRequest {
  responses: {
    A1: string;
    A2: string;
    A3: string;
    A4: string;
    A5: string;
    A6: string;
    A7: string;
    A8: string;
    A9: string;
    A10: string;
  };
}

export const predictAdultAutism = async (responses: PredictionRequest['responses']): Promise<PredictionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/adult`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ responses }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling adult prediction API:', error);
    throw error;
  }
};

export const predictToddlerAutism = async (responses: PredictionRequest['responses']): Promise<PredictionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict/toddler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ responses }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling toddler prediction API:', error);
    throw error;
  }
};

export const checkMLServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.models_loaded === true;
  } catch (error) {
    console.error('Error checking ML service health:', error);
    return false;
  }
}; 