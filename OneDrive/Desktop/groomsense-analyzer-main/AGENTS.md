<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# GroomSense Ensemble Multi-Agent Architecture Guide

This project is powered by a custom Multi-Agent Generative AI architecture leveraging advanced multi-modal computer vision and specialized prompt design patterns to act as an ensemble grooming consultant.

### 🌟 Active Ensemble Agents:
- **Dr. Skin (Dermatologist Persona)**: Runs computer vision texture analysis to evaluate skin types, pore status, concerns, and environment-adapted hydration recommendations.
- **Alex (Master Hairstylist Persona)**: Detects head posture, facial hair styles, hair conditions, and suggests styling lines or shapes.
- **Vera (Styling Consultant Persona)**: Assesses collar alignments, outfit colors, styling neatness, and posture.

### 🔬 Recruiter-Ready AI/ML Features:
- **Self-Evaluating Confidence Scores**: Performs uncertainty quantification by asking each agent to return a self-reflective confidence score (0-100%) based on target image focus, lighting, and visibility of landmarks.
- **Explainable AI Debug Console**: Slide-out drawer on the frontend showing exact prompt templates sent to Gemini, raw unparsed JSON completions, and metadata rules.
- **Linear Regression Prediction ($y = mx + c$)**: Mathematical score progression trend forecasting modeled in TypeScript that computes slope parameters and plots futuristic dashed projections on the progress chart.
