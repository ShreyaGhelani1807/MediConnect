const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Core symptom analysis function
const analyzeSymptoms = async (symptomsText, patientAge, patientCity) => {
  const prompt = `You are a medical triage AI assistant for MediConnect, an Indian healthcare platform.

A patient has described their symptoms. Analyze them and return a structured JSON response.

Patient Information:
- Age: ${patientAge || 'Not specified'}
- City: ${patientCity || 'Not specified'}
- Symptoms described: "${symptomsText}"

Analyze the symptoms carefully and return ONLY a valid JSON object with exactly this structure — no markdown, no explanation, just raw JSON:

{
  "symptom_summary": "Brief 1-2 sentence summary of the described symptoms",
  "primary_recommendation": {
    "specialization": "Exact specialization name",
    "confidence": "high or medium or low",
    "reasoning": "2-3 sentences explaining why this specialist is recommended based on the specific symptoms"
  },
  "secondary_recommendation": {
    "specialization": "Exact specialization name or null",
    "reasoning": "1-2 sentences or null"
  },
  "urgency": {
    "level": "routine or soon or urgent or emergency",
    "color": "green or yellow or orange or red",
    "message": "Specific actionable message for the patient"
  },
  "red_flags": ["list of specific concerning symptoms detected, empty array if none"],
  "emergency": {
    "detected": false,
    "message": null
  },
  "pre_consultation": {
    "tell_doctor": ["5 specific things to tell the doctor based on these symptoms"],
    "bring_documents": ["3 specific documents or test reports to bring"],
    "questions_to_ask": ["4 specific questions to ask the doctor"]
  },
  "doctor_search_query": {
    "primary_specialization": "Exact specialization matching primary_recommendation",
    "secondary_specialization": "Exact specialization or null",
    "urgency_filter": "available_today or available_this_week or any"
  }
}

Specialization names must be one of: Cardiologist, Dermatologist, Orthopedist, Neurologist, Gynecologist, Pediatrician, General Physician, Psychiatrist, Ophthalmologist, ENT Specialist.

Urgency rules:
- routine: book within a week, color green
- soon: book within 2-3 days, color yellow
- urgent: book within 24 hours, color orange
- emergency: go to ER immediately, color red

If emergency is detected (severe chest pain, stroke symptoms, severe breathing difficulty, unconsciousness):
- Set emergency.detected to true
- Set emergency.message to clear instructions to call 112 or go to nearest ER
- Set urgency.level to emergency

Return ONLY the JSON. No other text.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 1500,
    response_format: { type: 'json_object' } // forces pure JSON output
  });

  const rawText = response.choices[0].message.content;

  // Strip markdown code fences just in case
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);
  return parsed;
};

// Checklist generation function
const generateChecklist = async (specialization, symptomsText, urgencyLevel) => {
  const prompt = `You are a medical assistant for MediConnect, an Indian healthcare platform.

Generate a detailed pre-consultation checklist for a patient visiting a ${specialization}.

Patient symptoms: "${symptomsText}"
Urgency level: ${urgencyLevel}

Return ONLY a valid JSON object with exactly this structure — no markdown, no explanation:

{
  "tell_doctor": [
    "5 specific, detailed things the patient should tell the ${specialization} about their condition"
  ],
  "bring_documents": [
    "3 specific documents, reports or items to bring for a ${specialization} consultation"
  ],
  "questions_to_ask": [
    "4 specific, useful questions to ask the ${specialization}"
  ],
  "urgency_reminder": "One clear sentence reminding the patient of their urgency level and what it means",
  "preparation_tips": [
    "3 practical tips to prepare for this specific consultation"
  ]
}

Make all items specific to the ${specialization} specialization and the described symptoms. Not generic advice.

Return ONLY the JSON. No other text.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  });

  const rawText = response.choices[0].message.content;

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);
  return parsed;
};

module.exports = { analyzeSymptoms, generateChecklist };