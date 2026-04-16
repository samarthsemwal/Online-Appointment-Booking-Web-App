import sys
import pandas as pd
import joblib
import json

def predict(input_data_list):
    try:
        # Load the saved artifacts
        model = joblib.load('heart_model.pkl')
        scaler = joblib.load('scaler.pkl')
        model_columns = joblib.load('model_columns.pkl')

        # Feature columns in the order they were processed originally
        features = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        
        # Create a DataFrame from the input
        # Note: We keep the types as they should be before get_dummies.
        # Everything passed from cli will be string, so we convert them to numeric.
        input_data = [float(x) for x in input_data_list]
        df = pd.DataFrame([input_data], columns=features)

        # Scale continuous features
        cols_to_scale = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
        df[cols_to_scale] = scaler.transform(df[cols_to_scale])

        # Define categorical features manually since we know the dataset
        categorical_val = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal']

        # Dummify
        df = pd.get_dummies(df, columns=categorical_val)

        # Align the columns with the training columns
        # This adds missing dummy columns with 0 and removes extra ones
        df = df.reindex(columns=model_columns, fill_value=0)

        # Predict
        prediction = model.predict(df)
        
        # Return result as JSON
        result = {
            "prediction": int(prediction[0])
        }
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {"error": str(e)}
        print(json.dumps(error_result))

if __name__ == '__main__':
    # Node.js will call this with space-separated arguments
    if len(sys.argv) == 14:
        # sys.argv[0] is script name
        predict(sys.argv[1:])
    else:
        print(json.dumps({"error": f"Invalid number of arguments. Expected 13, got {len(sys.argv)-1}"}))
