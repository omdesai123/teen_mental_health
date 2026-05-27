# Teen Mental Wellness Predictor

A full-stack Flask web application that uses a pre-trained Random Forest classifier to predict a teen's mental wellness score (1 = excellent → 10 = critical) based on 12 inputs covering demographics, digital habits, and well-being indicators.

---

## Directory Structure

```
teen_mental_health_app/
├── app.py                  # Flask backend (API + model inference)
├── model.pkl               # Pre-trained Random Forest model
├── requirements.txt
├── templates/
│   └── index.html          # Multi-step HTML form
└── static/
    ├── css/
    │   └── style.css       # Full dark-theme stylesheet
    └── js/
        └── main.js         # Form logic, API call, result rendering
```

---

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the app (make sure model.pkl is in the same folder as app.py)
python app.py
```

Then open **http://localhost:5000** in your browser.

---

## Model Details

| Property        | Value                          |
|-----------------|-------------------------------|
| Algorithm       | Random Forest Classifier       |
| Input features  | 12 (age, gender, sleep, etc.)  |
| Output classes  | 1 – 10 (wellness score)        |
| Framework       | scikit-learn                   |

### Features expected by the model (in order)

| Feature                    | Type   | Range / Values               |
|----------------------------|--------|------------------------------|
| `age`                      | float  | 10 – 19                      |
| `gender`                   | float  | 0 = female, 1 = male, 2 = NB |
| `daily_social_media_hours` | float  | 0 – 16                       |
| `platform_usage`           | float  | 1 – 7 (platform code)        |
| `sleep_hours`              | float  | 3 – 12                       |
| `screen_time_before_sleep` | float  | 0 – 6                        |
| `academic_performance`     | float  | 1 (excellent) – 5 (poor)     |
| `physical_activity`        | float  | hrs / week                   |
| `social_interaction_level` | float  | 1 – 10                       |
| `anxiety_level`            | float  | 1 – 10                       |
| `addiction_level`          | float  | 1 – 10                       |
| `depression_label`         | float  | 1 – 5                        |

---

## API

### `POST /predict`

**Request body (JSON)**
```json
{
  "age": 16,
  "gender": 1,
  "daily_social_media_hours": 5,
  "platform_usage": 2,
  "sleep_hours": 6.5,
  "screen_time_before_sleep": 2,
  "academic_performance": 3,
  "physical_activity": 3,
  "social_interaction_level": 4,
  "anxiety_level": 7,
  "addiction_level": 6,
  "depression_label": 3
}
```

**Response (JSON)**
```json
{
  "score": 7,
  "label": "High Risk",
  "colour": "#dc2626",
  "tier": "risk",
  "confidence": 42.0,
  "prob_dist": [
    {"score": 1, "prob": 1.0}, ...
  ],
  "recommendations": [
    "Speak with a mental health professional or counsellor promptly.",
    ...
  ]
}
```

---

> ⚠️ **Disclaimer** — This tool is for educational purposes only and does not constitute medical advice.
