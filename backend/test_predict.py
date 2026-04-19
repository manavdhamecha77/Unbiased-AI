import requests
import json

API_BASE = "http://localhost:8000/api/predict"

test_cases = [
    {
        "description": "Likely low income (Young, low education)",
        "payload": {
            "age": 20,
            "workclass": "Private",
            "education": "11th",
            "education_num": 7,
            "marital_status": "Never-married",
            "occupation": "Handlers-cleaners",
            "relationship": "Own-child",
            "race": "Black",
            "sex": "Female",
            "capital_gain": 0,
            "capital_loss": 0,
            "hours_per_week": 20,
            "native_country": "United-States",
            "model_type": "biased"
        }
    },
    {
        "description": "Likely high income (Older, high education, high capital gain)",
        "payload": {
            "age": 45,
            "workclass": "Private",
            "education": "Masters",
            "education_num": 14,
            "marital_status": "Married-civ-spouse",
            "occupation": "Exec-managerial",
            "relationship": "Husband",
            "race": "White",
            "sex": "Male",
            "capital_gain": 10000,
            "capital_loss": 0,
            "hours_per_week": 50,
            "native_country": "United-States",
            "model_type": "biased"
        }
    }
]

for tc in test_cases:
    print(f"\nTesting: {tc['description']}")
    response = requests.post(API_BASE, json=tc['payload'])
    print(f"Status: {response.status_code}")
    print(f"Result: {response.json()}")
