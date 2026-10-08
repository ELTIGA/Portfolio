/** Invented, generic teaching vignettes for the demo. Not exam material and not medical advice. */

export type OptionId = "A" | "B" | "C" | "D" | "E";
export type Confidence = "guessing" | "unsure" | "confident";

export interface Option {
  id: OptionId;
  text: string;
  /** Why this option is right (for the correct one) or why it is less appropriate. */
  why: string;
}

export interface Question {
  id: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  stem: string;
  facts: string[];
  prompt: string;
  options: Option[];
  correct: OptionId;
  quick: string;
  deep: string[];
  hook: string;
}

export const questions: Question[] = [
  {
    id: "q-cardio-1",
    topic: "Cardiology",
    difficulty: "Medium",
    stem: "A 62-year-old man presents with 40 minutes of central chest pain and sweating. He looks pale and clammy. Lung fields are clear on auscultation and the jugular venous pressure is raised. The ECG shows ST elevation in leads II, III and aVF.",
    facts: ["BP 82/50 mmHg", "HR 54/min", "SpO2 96% on air", "Lungs clear"],
    prompt: "Which of the following is the most appropriate treatment for his hypotension?",
    options: [
      { id: "A", text: "Sublingual glyceryl trinitrate", why: "Nitrates reduce preload and can cause profound hypotension in right ventricular involvement." },
      { id: "B", text: "Intravenous 0.9% sodium chloride bolus", why: "Right ventricular infarction is preload dependent, so cautious fluid boluses with reassessment support cardiac output." },
      { id: "C", text: "Intravenous furosemide", why: "A diuretic lowers preload further. His lungs are clear, so there is no pulmonary oedema to treat." },
      { id: "D", text: "Intravenous morphine", why: "Opioids can lower blood pressure through venodilation and are not a treatment for hypotension." },
      { id: "E", text: "Intravenous metoprolol", why: "Beta-blockers are avoided in hypotension and bradycardia, and in acute right ventricular failure." },
    ],
    correct: "B",
    quick:
      "Inferior ST elevation with hypotension, raised JVP and clear lungs suggests right ventricular involvement. The failing right ventricle depends on filling pressure, so cautious intravenous fluid is the right first move while reperfusion is arranged.",
    deep: [
      "The right coronary artery usually supplies both the inferior wall and much of the right ventricle. When the right ventricle stops pumping well, less blood reaches the left side of the heart, so blood pressure falls even though the lungs stay clear.",
      "Treatment is guided by that physiology: small fluid boluses with reassessment after each, and avoidance of anything that reduces preload (nitrates, diuretics, large doses of opioids). Urgent reperfusion remains the definitive treatment, and a right-sided ECG can confirm right ventricular involvement.",
      "Differentials for hypotension with chest pain include tension pneumothorax, tamponade and aortic dissection. Clear lungs, raised JVP and an inferior pattern on the ECG point away from the first and make the rest less likely here.",
    ],
    hook: "Low BP, high JVP, clear lungs after an inferior STEMI: fill the right heart. Fluids yes, nitrates no.",
  },
  {
    id: "q-abg-1",
    topic: "ABG interpretation",
    difficulty: "Medium",
    stem: "A 24-year-old woman with type 1 diabetes presents with two days of vomiting and abdominal pain. She is drowsy with deep, rapid breathing. Capillary glucose is 28 mmol/L and ketones are strongly positive.",
    facts: ["pH 7.18", "PaCO2 22 mmHg", "HCO3 8 mmol/L", "Na 134, Cl 98 mmol/L"],
    prompt: "Which of the following best describes her acid-base disturbance?",
    options: [
      { id: "A", text: "Respiratory acidosis with metabolic compensation", why: "The PaCO2 is low, not high, so the primary problem is not hypoventilation." },
      { id: "B", text: "Respiratory alkalosis with metabolic compensation", why: "The pH is acidaemic. A primary respiratory alkalosis would give a raised pH." },
      { id: "C", text: "Metabolic acidosis with appropriate respiratory compensation", why: "Low pH with low bicarbonate is a metabolic acidosis. The expected PaCO2 is about 20 (plus or minus 2) and hers is 22, so compensation is appropriate." },
      { id: "D", text: "Metabolic alkalosis with respiratory compensation", why: "Bicarbonate is low and pH is low, the opposite of a metabolic alkalosis." },
      { id: "E", text: "Mixed metabolic and respiratory acidosis", why: "A superimposed respiratory acidosis would show a PaCO2 higher than expected. Hers is within the expected range." },
    ],
    correct: "C",
    quick:
      "The pH is low and the bicarbonate is low, so the primary disorder is a metabolic acidosis. The anion gap (134 - 98 - 8 = 28) is high, consistent with ketoacidosis, and the low PaCO2 is the lungs compensating appropriately.",
    deep: [
      "Work through the gas in order: pH tells you acidaemia or alkalaemia, then ask whether the CO2 or the bicarbonate explains it. Here the bicarbonate fell, so the process is metabolic.",
      "Winter's formula estimates the expected PaCO2 in a metabolic acidosis: 1.5 x HCO3 + 8, plus or minus 2. For a bicarbonate of 8 that is 20 (18 to 22). A PaCO2 of 22 sits inside the range, so there is no second respiratory disorder.",
      "A raised anion gap points to added acid such as ketones or lactate. Deep, rapid (Kussmaul) breathing is the clinical sign of that respiratory compensation.",
    ],
    hook: "Low pH, low bicarbonate: metabolic acidosis. Then check the PaCO2 against Winter's: 1.5 x HCO3 + 8, plus or minus 2.",
  },
  {
    id: "q-resp-1",
    topic: "Respiratory",
    difficulty: "Easy",
    stem: "A 28-year-old man is brought in after a motorcycle collision with severe right-sided chest pain and worsening breathlessness. He is anxious and struggling to speak. The trachea is deviated to the left, the right chest is hyperresonant with absent breath sounds, and his neck veins are distended.",
    facts: ["BP 78/50 mmHg", "HR 134/min", "RR 36/min", "SpO2 85% on oxygen"],
    prompt: "Which of the following is the most appropriate immediate step?",
    options: [
      { id: "A", text: "Obtain a portable chest X-ray first", why: "Imaging delays treatment of a life-threatening condition that is diagnosed clinically." },
      { id: "B", text: "Immediate decompression of the right chest", why: "This is a clinical diagnosis of tension pneumothorax with obstructive shock. Decompress first, then place a chest drain." },
      { id: "C", text: "CT scan of the chest", why: "He is too unstable to leave the resuscitation area, and a scan would not change the immediate step." },
      { id: "D", text: "Large-volume intravenous fluid bolus alone", why: "Fluid does not relieve the obstruction to venous return and delays the definitive action." },
      { id: "E", text: "Intubation and positive-pressure ventilation", why: "Positive pressure can worsen a tension pneumothorax before it has been decompressed." },
    ],
    correct: "B",
    quick:
      "Hypotension, tracheal deviation, a hyperresonant chest with absent breath sounds and distended neck veins after chest trauma is a tension pneumothorax. It is diagnosed clinically and treated immediately by decompression, followed by a chest drain.",
    deep: [
      "Air trapped under pressure in the pleural space pushes the mediastinum across and kinks the great veins, so venous return and cardiac output fall. That is why this is a cause of obstructive shock.",
      "Waiting for an X-ray costs minutes that the patient does not have. After decompression, confirm with imaging and insert a formal chest drain, then continue the primary survey.",
      "A simple pneumothorax, haemothorax and cardiac tamponade can also cause shock after trauma, but tracheal deviation with a hyperresonant chest and absent breath sounds is the distinguishing combination.",
    ],
    hook: "Tension pneumothorax is a clinical diagnosis: decompress first, image later.",
  },
  {
    id: "q-ethics-1",
    topic: "Ethics",
    difficulty: "Medium",
    stem: "A 68-year-old woman is admitted with community-acquired pneumonia. After a full discussion of the risks she tells you she wants to go home today and decline intravenous antibiotics. She correctly repeats the information back, explains that she wishes to be at home with her family, and understands that her illness could worsen. Her daughter asks you to keep her in hospital.",
    facts: ["Alert and orientated", "No history of cognitive impairment", "SpO2 94% on air"],
    prompt: "Which of the following is the most appropriate next step?",
    options: [
      { id: "A", text: "Keep her in hospital under an involuntary order", why: "Involuntary treatment needs a specific legal basis. A refusal by a person with capacity is not one." },
      { id: "B", text: "Ask her daughter to consent on her behalf", why: "A relative cannot consent for an adult who has capacity. The patient decides." },
      { id: "C", text: "Document her capacity and informed refusal, discuss safer alternatives and arrange follow-up", why: "She shows understanding, retention and reasoning. Respect her choice, offer options such as oral antibiotics and review, give return advice and document it." },
      { id: "D", text: "Discharge her without further discussion", why: "Respecting her refusal still requires safety-netting, alternatives and follow-up." },
      { id: "E", text: "Give sedation so antibiotics can be started", why: "Treating a capable adult against her wishes is assault and is never appropriate here." },
    ],
    correct: "C",
    quick:
      "She demonstrates decision-making capacity: she understands the information, retains it, weighs it against her own values and communicates a choice. A capable adult may refuse treatment, so respect the decision, offer alternatives, give clear return advice and document the conversation.",
    deep: [
      "Capacity is decision-specific and is assessed, not assumed to be absent because a choice seems unwise. An unwise decision on its own does not show a lack of capacity.",
      "Respecting autonomy does not mean ending the conversation. Explore her reasons, offer a compromise such as oral antibiotics and early review, and explain which symptoms should prompt her to come back. With her consent, involve her daughter.",
      "Record the capacity assessment, the information given, the alternatives offered and the plan, so that the reasoning is clear to the next clinician.",
    ],
    hook: "Capacity present, refusal respected, safety net given, and write it all down.",
  },
  {
    id: "q-renal-1",
    topic: "Renal and electrolytes",
    difficulty: "Medium",
    stem: "A 58-year-old man with chronic kidney disease who missed dialysis last week presents with weakness and palpitations. The ECG shows tall peaked T waves and a widened QRS complex. A venous blood gas reports a potassium of 7.1 mmol/L.",
    facts: ["BP 126/78 mmHg", "HR 48/min", "Potassium 7.1 mmol/L"],
    prompt: "Which of the following is the most appropriate first treatment?",
    options: [
      { id: "A", text: "Intravenous insulin with glucose", why: "This shifts potassium into cells and is important, but it does not protect the heart from arrhythmia in the first minutes." },
      { id: "B", text: "Intravenous calcium gluconate", why: "Calcium stabilises the cardiac membrane within minutes and is given first when there are ECG changes." },
      { id: "C", text: "Nebulised salbutamol", why: "A useful adjunct for shifting potassium, but it does not stabilise the myocardium and is not the first step." },
      { id: "D", text: "Oral calcium polystyrene sulfonate", why: "This removes potassium too slowly to help an unstable rhythm." },
      { id: "E", text: "Urgent haemodialysis alone", why: "He will probably need it, but it takes time to arrange and should not delay membrane stabilisation." },
    ],
    correct: "B",
    quick:
      "Hyperkalaemia with ECG changes is an emergency. Intravenous calcium comes first because it protects the heart's conduction system, then insulin with glucose and salbutamol shift potassium into cells, and finally potassium is removed from the body.",
    deep: [
      "Think of it as three steps: protect the heart, shift the potassium, remove the potassium. Calcium acts within minutes but wears off in under an hour, so the other steps must follow and the ECG should be repeated.",
      "Insulin with glucose lowers serum potassium by driving it into cells, with glucose monitoring for hypoglycaemia. Salbutamol adds to the shift. Removal depends on the cause and includes dialysis for this patient.",
      "Look for the trigger as well: missed dialysis, medications that raise potassium, and acute kidney injury.",
    ],
    hook: "Stabilise, shift, remove: calcium, then insulin-glucose and salbutamol, then dialysis.",
  },
];

export const topicSeed: Record<string, { attempted: number; correct: number }> = {
  Cardiology: { attempted: 50, correct: 29 },
  "ABG interpretation": { attempted: 35, correct: 17 },
  Respiratory: { attempted: 60, correct: 37 },
  "Renal and electrolytes": { attempted: 28, correct: 19 },
  Ethics: { attempted: 40, correct: 32 },
  Paediatrics: { attempted: 44, correct: 33 },
};

export interface PokerCard {
  id: string;
  text: string;
  kind: "strong" | "supportive" | "misleading";
  note: string;
}

export interface PokerRound {
  diagnosis: string;
  prompt: string;
  cards: PokerCard[];
}

export const pokerRounds: PokerRound[] = [
  {
    diagnosis: "Pulmonary embolism",
    prompt: "Pick the four cards that best build the case.",
    cards: [
      { id: "pe1", text: "Sudden pleuritic chest pain", kind: "strong", note: "Classic presentation, though not specific on its own." },
      { id: "pe2", text: "Unilateral calf swelling and tenderness", kind: "strong", note: "Suggests a source deep vein thrombosis." },
      { id: "pe3", text: "CT pulmonary angiogram: filling defect in a pulmonary artery", kind: "strong", note: "Confirmatory imaging finding." },
      { id: "pe4", text: "Recent long-haul flight", kind: "supportive", note: "A risk factor, so it raises the pre-test probability." },
      { id: "pe5", text: "Sinus tachycardia and SpO2 90% on air", kind: "supportive", note: "Common but non-specific. Compatible with many causes." },
      { id: "pe6", text: "Fever, productive cough, focal crackles", kind: "misleading", note: "Points toward pneumonia." },
      { id: "pe7", text: "Tearing chest pain radiating to the back", kind: "misleading", note: "Points toward aortic dissection." },
      { id: "pe8", text: "Diffuse wheeze with prolonged expiration", kind: "misleading", note: "Points toward asthma or COPD." },
    ],
  },
  {
    diagnosis: "Diabetic ketoacidosis",
    prompt: "Pick the four cards that best build the case.",
    cards: [
      { id: "dk1", text: "Deep, rapid (Kussmaul) breathing", kind: "strong", note: "Respiratory compensation for the metabolic acidosis." },
      { id: "dk2", text: "Glucose 28 mmol/L with strongly positive ketones", kind: "strong", note: "Hyperglycaemia plus ketonaemia is central." },
      { id: "dk3", text: "Venous pH 7.15 with low bicarbonate", kind: "strong", note: "Confirms acidosis with a metabolic cause." },
      { id: "dk4", text: "Two days of thirst, polyuria and vomiting", kind: "supportive", note: "Typical lead-up, though non-specific." },
      { id: "dk5", text: "Abdominal pain and dry mucous membranes", kind: "supportive", note: "Common features, shared with other conditions." },
      { id: "dk6", text: "Slow, shallow breathing with pinpoint pupils", kind: "misleading", note: "Points toward opioid toxicity." },
      { id: "dk7", text: "Sweating and tremor with glucose 2.1 mmol/L", kind: "misleading", note: "Points toward hypoglycaemia." },
      { id: "dk8", text: "Sudden facial droop and speech difficulty", kind: "misleading", note: "Points toward stroke." },
    ],
  },
];
