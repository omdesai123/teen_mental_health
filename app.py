import os
import pickle
import warnings
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify

warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)

# ── Load model once at startup ────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

FEATURE_NAMES = list(model.feature_names_in_)

# Score 1-10: give each bucket a label and colour
SCORE_META = {
    1:  {"label": "Excellent",   "tier": "great",    "colour": "#22c55e"},
    2:  {"label": "Very Good",   "tier": "great",    "colour": "#4ade80"},
    3:  {"label": "Good",        "tier": "good",     "colour": "#86efac"},
    4:  {"label": "Fairly Good", "tier": "good",     "colour": "#fbbf24"},
    5:  {"label": "Moderate",    "tier": "moderate", "colour": "#f97316"},
    6:  {"label": "Concerning",  "tier": "moderate", "colour": "#ef4444"},
    7:  {"label": "High Risk",   "tier": "risk",     "colour": "#dc2626"},
    8:  {"label": "Serious",     "tier": "risk",     "colour": "#b91c1c"},
    9:  {"label": "Severe",      "tier": "critical", "colour": "#991b1b"},
    10: {"label": "Critical",    "tier": "critical", "colour": "#7f1d1d"},
}

RECOMMENDATIONS = {
    "great": [
        "Maintain your healthy digital habits — they're working!",
        "Keep up the balanced sleep schedule and physical activity.",
        "Continue fostering real-world social connections.",
    ],
    "good": [
        "Consider setting daily screen-time limits as a preventive measure.",
        "Aim for 8–9 hours of sleep per night.",
        "Engage in at least 30 minutes of physical activity daily.",
    ],
    "moderate": [
        "Try a digital detox for one hour before bed.",
        "Talk to a trusted adult or school counsellor about how you're feeling.",
        "Join a hobby or club to strengthen offline relationships.",
        "Limit social media to 2 hours per day.",
    ],
    "risk": [
        "Speak with a mental health professional or counsellor promptly.",
        "Implement strict screen-time controls on your devices.",
        "Prioritise sleep hygiene — remove devices from the bedroom.",
        "Build a daily routine that includes exercise and face-to-face interaction.",
    ],
    "critical": [
        "Please reach out to a mental health professional or crisis line immediately.",
        "Involve a trusted adult — a parent, teacher, or counsellor.",
        "Consider a structured digital wellness programme.",
        "Your well-being matters: help is available and things can improve.",
    ],
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)

    # Map incoming JSON → feature order expected by the model
    try:
        row = {
            "age":                      float(data["age"]),
            "gender":                   float(data["gender"]),
            "daily_social_media_hours": float(data["daily_social_media_hours"]),
            "platform_usage":           float(data["platform_usage"]),
            "sleep_hours":              float(data["sleep_hours"]),
            "screen_time_before_sleep": float(data["screen_time_before_sleep"]),
            "academic_performance":     float(data["academic_performance"]),
            "physical_activity":        float(data["physical_activity"]),
            "social_interaction_level": float(data["social_interaction_level"]),
            "anxiety_level":            float(data["anxiety_level"]),
            "addiction_level":          float(data["addiction_level"]),
            "depression_label":         float(data["depression_label"]),
        }
    except (KeyError, ValueError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400

    df = pd.DataFrame([row])[FEATURE_NAMES]
    score = int(model.predict(df)[0])
    proba = model.predict_proba(df)[0]

    meta = SCORE_META[score]
    recs = RECOMMENDATIONS[meta["tier"]]

    # Build probability distribution for all classes
    prob_dist = [
        {"score": int(cls), "prob": round(float(p) * 100, 1)}
        for cls, p in zip(model.classes_, proba)
    ]

    return jsonify({
        "score":       score,
        "label":       meta["label"],
        "colour":      meta["colour"],
        "tier":        meta["tier"],
        "confidence":  round(float(max(proba)) * 100, 1),
        "prob_dist":   prob_dist,
        "recommendations": recs,
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
