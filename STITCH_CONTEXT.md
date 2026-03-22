# MediConnect — Stitch Design Context

## Project
MediConnect is a premium Indian healthtech platform. 
Feel: between Practo and Apollo 247. Not a college project. 
A real product. Warm and reassuring for patients, 
professional and data-rich for doctors.

## Colors
Primary teal:     #0DC4A1  — buttons, active states, brand accent
Teal dark:        #09A888  — button hover, gradient partner
Navy:             #0B2545  — sidebar, headings, dark backgrounds
Navy light:       #13356B  — gradient partner for navy
Page background:  #F0F7FF  — every authenticated page
Card background:  rgba(255,255,255,0.75) with backdrop blur
Text primary:     #0B1F3A
Text secondary:   #64748B
Text muted:       #94A3B8
Coral (error):    #E8604C  — urgent, cancel, error states
Amber (warning):  #F4A261  — soon, warning states
Emerald (success):#059669  — confirmed, success, routine
Blue (info):      #3B82F6  — secondary accents
Border:           rgba(0,0,0,0.06)

## Urgency Badge Colors
Routine:   background #ECFDF5, text #059669
Soon:      background #FFFBEB, text #D97706
Urgent:    background #FEF2F0, text #E8604C
Emergency: background #FFF0F0, text #DC2626

## Status Badge Colors
Pending:   background rgba(245,158,11,0.12),  text #D97706
Confirmed: background rgba(13,196,161,0.12),  text #0B9E82
Completed: background rgba(5,150,105,0.12),   text #059669
Cancelled: background rgba(232,96,76,0.12),   text #E8604C

## Card Style (use on every card)
background: rgba(255,255,255,0.75)
backdropFilter: blur(24px)
borderRadius: 16px (small cards) or 20px (large cards)
border: 1px solid rgba(255,255,255,0.9)
boxShadow: 0 8px 32px rgba(11,37,69,0.07)

## Buttons
Primary:   gradient(135deg, #0DC4A1, #09A888), white text, 
           borderRadius 12px, fontWeight 700,
           boxShadow: 0 4px 16px rgba(13,196,161,0.3)
Secondary: transparent, border 1.5px solid rgba(0,0,0,0.12),
           color #64748B, borderRadius 12px, fontWeight 600
Danger:    gradient(135deg, #E8604C, #c94a38), white text

## Typography
Font family: Inter (Google Fonts)
Headings: fontWeight 900, negative letterSpacing (-1px to -2.5px)
Body: fontWeight 400-500, lineHeight 1.6-1.8
Labels: fontWeight 700-800, fontSize 11-12px, 
        uppercase, letterSpacing 0.05em

## Layout
The sidebar is already handled by the Layout component.
Generate only the main content area — not the sidebar or topbar.
Main content has padding: 32px and background: #F0F7FF.

## Component Rules
- Glassmorphism cards on sky blue background
- Subtle Framer Motion entry animations on all cards
- Skeleton loaders when data is loading
- All icons from Lucide React
- Mobile responsive — works at 375px and 1280px
```

---

Now paste this into Antigravity:
```
I am building MediConnect — an AI-powered doctor discovery and 
appointment management platform for Indian patients.

I have a STITCH_CONTEXT.md file in my project root with the 
complete design system, colors, card styles, and typography rules.

I need you to use Stitch to generate ALL the following pages and 
components one by one. After Stitch generates each one, you will:
1. Save it into the correct file path in my project
2. Replace any hardcoded colors with the exact values from 
   STITCH_CONTEXT.md
3. Wire it to the real backend API using the existing patterns 
   in src/services/api.js and src/pages/PatientDashboard.jsx
4. Add skeleton loaders, Framer Motion animations, and 
   react-hot-toast error handling
5. Register new pages in src/App.jsx with correct route guards
6. Tell me when each page is done and show me what you built

Read these files before starting so you understand existing 
patterns: src/App.jsx, src/services/api.js, 
src/components/Layout.jsx, src/pages/PatientDashboard.jsx,
src/pages/Login.jsx, src/pages/SymptomAnalysis.jsx

Also read the audit report I have uploaded. It contains confirmed 
bugs that must be fixed first before any new pages are built.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — FIX BUGS FIRST (no Stitch needed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fix these in order before touching any new pages:

BUG 1 — src/services/api.js
Move adminApi axios instance declaration to ABOVE the adminAPI 
object. No logic changes — reorder only.

BUG 2 — src/App.jsx  
Remove showSignout and logout from the Placeholder component. 
They are not defined in that scope and throw ReferenceError.
Placeholder should only show the page title and "Coming soon".

BUG 3 — src/pages/SymptomAnalysis.jsx
Fix these wrong field paths (backend returns aiAnalysis not analysis):
  result.analysis?.urgency_level 
    → result.aiAnalysis?.urgency?.level
  result.analysis?.recommended_specialist 
    → result.aiAnalysis?.primary_recommendation?.specialization
  result.analysis?.confidence_score 
    → result.aiAnalysis?.primary_recommendation?.confidence
  result.analysis?.reasoning 
    → result.aiAnalysis?.primary_recommendation?.reasoning
  result.emergencyMessage 
    → result.aiAnalysis?.emergency?.message
  result.analysis?.red_flags 
    → result.aiAnalysis?.red_flags
  doc.user?.name in DoctorCard 
    → doc.name  (backend sends flat doctor objects, no nested user)

BUG 4 — src/components/Layout.jsx
Add Analytics nav link to DOCTOR_NAV array:
{ label: 'Analytics', icon: BarChart2, path: '/doctor/analytics' }
Import BarChart2 from lucide-react.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — NEW API FUNCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to src/services/api.js after fixing BUG 1:

export const chatAPI = {
  sendMessage: (data) => api.post('/ai/chat', data),
}

export const prescriptionAPI = {
  create: (appointmentId, data) => 
    api.post('/prescriptions/appointments/' + appointmentId, data),
  getByAppointment: (appointmentId) => 
    api.get('/prescriptions/appointments/' + appointmentId),
  getAllForPatient: () => 
    api.get('/prescriptions/patient/all'),
}

Also add to existing authAPI object:
  forgotPassword: (data) => api.post('/auth/forgot-password', data),

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — BUILD PAGES USING STITCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build in this exact order. Each page depends on the previous 
bugs being fixed first.

For each page: use Stitch with STITCH_CONTEXT.md to generate 
the visual layout, then wire it to the backend yourself.

─────────────────────────────────────────
PAGE 1 — ForgotPassword.jsx
─────────────────────────────────────────
Path: src/pages/ForgotPassword.jsx
Route: /forgot-password — GuestRoute in App.jsx
Also add "Forgot password?" link to Login.jsx below sign-in button.

Stitch prompt to use:
"Using STITCH_CONTEXT.md design system, generate a Forgot Password 
page for MediConnect. Two-panel layout matching Login.jsx exactly — 
left dark navy panel with MediConnect branding, right panel with 
glassmorphism card. Right card has: email input field, 
'Send Temporary Password' button (primary teal gradient), 
success state showing mail icon and 'Check your inbox' message, 
error state in coral. Single page, clean, minimal."

Backend: POST /api/auth/forgot-password — body: { email }
Always returns 200 with generic message. Show that message as 
success regardless of response — never reveal if email exists.

─────────────────────────────────────────
PAGE 2 — PatientProfile.jsx
─────────────────────────────────────────
Path: src/pages/PatientProfile.jsx
Route: /profile — ProtectedRoute role="patient" — uses Layout

Stitch prompt to use:
"Using STITCH_CONTEXT.md, generate a Patient Profile page for 
MediConnect. Sky background, Layout sidebar already exists so 
generate main content only. Contains: circular profile photo 
with change button, Personal Details section (name, phone, city), 
Health Profile section (age, gender dropdown, blood group dropdown), 
Medical History textarea, Emergency Contact field. Each section 
has its own teal Save button. Glassmorphism cards, Inter font, 
professional healthtech feel."

Backend:
  Load: GET /api/patient/profile
  Save: PUT /api/patient/profile — any subset of fields

─────────────────────────────────────────
PAGE 3 — DoctorProfile.jsx
─────────────────────────────────────────
Path: src/pages/doctor/DoctorProfile.jsx
Route: /doctor/profile — ProtectedRoute role="doctor" — uses Layout

Stitch prompt to use:
"Using STITCH_CONTEXT.md, generate a Doctor Profile Management page 
for MediConnect. Main content area only (sidebar exists). Sections: 
profile photo upload, Personal Details (name, phone, city), 
Professional Details (specialization dropdown, qualifications, 
experience years, consultation fee in INR, clinic address, bio 
textarea), Accepting Patients toggle switch (green = accepting, 
coral = not accepting), Change Password section (new password + 
confirm). Teal save buttons per section. Doctor portal feel — 
professional and data-rich."

Specialization options: General Physician, Cardiologist, 
Dermatologist, Neurologist, Orthopedist, Pediatrician, 
Gynecologist, Psychiatrist, Ophthalmologist, ENT Specialist

Backend:
  Load: GET /api/doctor/profile
  Save: PUT /api/doctor/profile

─────────────────────────────────────────
PAGE 4 — DoctorDashboard.jsx
─────────────────────────────────────────
Path: src/pages/doctor/DoctorDashboard.jsx
Route: /doctor/dashboard — ProtectedRoute role="doctor" — uses Layout

Stitch prompt to use:
"Using STITCH_CONTEXT.md, generate a Doctor Dashboard page for 
MediConnect. Main content area only. Contains: greeting header 
with doctor name and today's date. Three stat cards in a row: 
Today's Appointments (teal icon), Pending (amber icon), 
Completed Today (emerald icon). Section heading Today's Queue 
with appointment count badge. Appointment cards each showing: 
time slot prominently in large text, patient name + age + gender, 
AI symptom summary text in a subtle inset box, urgency badge 
(colored per level), status badge, Mark Complete button (teal), 
Add Prescription button (navy outline). Empty state when no 
appointments. Doctor portal — professional command center feel."

Backend:
  Load: GET /api/doctor/appointments/today
  Returns: { appointments: [{ id, appointmentDate, status, 
    reasonForVisit, aiSymptomAnalysis, 
    timeSlot: { startTime, endTime },
    patient: { id, name, age, gender, phone } }] }
  
  Mark Complete: PUT /api/appointments/:id/status
    body: { status: 'completed' }

  Add Prescription modal fields:
    medicines array (dynamic — Add Medicine button adds row with: 
      name, dosage, frequency, duration, instructions)
    notes textarea
    reminderTimes checkboxes: 
      '08:00' Morning, '13:00' Afternoon, '20:00' Evening
  Submit: POST /api/prescriptions/appointments/:appointmentId
    body: { medicines, notes, reminderTimes }

─────────────────────────────────────────
PAGE 5 — DoctorAppointments.jsx
─────────────────────────────────────────
Path: src/pages/doctor/DoctorAppointments.jsx
Route: /doctor/appointments — ProtectedRoute role="doctor" — uses Layout

Stitch prompt to use:
"Using STITCH_CONTEXT.md, generate a Doctor All Appointments page 
for MediConnect. Main content area only. Status filter tabs: 
All, Pending, Confirmed, Completed, Cancelled. Each tab shows 
count badge. Appointment cards with: patient name + age, 
appointment date and time, status badge, urgency badge if present, 
AI symptom summary preview. Click card to expand full details 
including doctor notes and prescription status. 
Professional data-rich doctor portal feel."

Backend:
  Load: GET /api/doctor/appointments/all
  Filter tabs in frontend — not backend query params

─────────────────────────────────────────
PAGE 6 — PatientAppointments.jsx
─────────────────────────────────────────
Path: src/pages/PatientAppointments.jsx
Route: /appointments — ProtectedRoute role="patient" — uses Layout

Stitch prompt to use:
"Using STITCH_CONTEXT.md, generate a My Appointments page for 
MediConnect patient portal. Two tab pills: Upcoming and Past. 
Upcoming = pending or confirmed status. Past = completed or 
cancelled. Each appointment card shows: doctor avatar circle 
with first letter in navy gradient, doctor name + specialization, 
date formatted as 15 Jan 2026, time slot, status badge, 
urgency badge if not routine, consultation fee in INR. 
Upcoming cards have Cancel button (coral outline). 
Completed cards have Rate Doctor button (amber) and 
View Prescription button (teal). Empty state with icon and 
Start Symptom Analysis button. Warm reassuring patient portal feel."

Backend:
  Load: GET /api/patient/appointments
  Cancel: PUT /api/appointments/:id/status  body: { status:'cancelled' }
  Rate: POST /api/appointments/:id/rating  body: { rating, review }
  Prescription: GET /api/prescriptions/appointments/:id
    Show inline expanded card below appointment when fetched.
    If 404: show 'No prescription added yet'
    If found: show medicines list, dosage, frequency, notes,
    and per-medicine taken/not-taken status from medicineLog
    (check medicineLog for entry where date = today and taken = true)

─────────────────────────────────────────
PAGE 7 — DoctorProfilePage.jsx (PUBLIC)
─────────────────────────────────────────
Path: src/pages/DoctorProfilePage.jsx
Route: /doctors/:id — NO auth required — NO Layout wrapper

Stitch prompt to use:
"Using STITCH_CONTEXT.md, generate a public Doctor Profile page 
for MediConnect. No sidebar. Full page with navbar-style header 
with MediConnect logo and Back button. Left column: large profile 
photo placeholder, doctor name in large bold text, specialization, 
qualifications, star rating with number and review count, 
experience years, consultation fee in INR, city, clinic address, 
bio paragraph, Accepting Patients green badge. Right column: 
Book Appointment section with horizontal scrollable date pills 
for next 7 days, time slot grid below selected date (available 
slots teal, booked slots grey disabled), Confirm Booking teal 
button appears when slot selected. Below left column: 
Patient Reviews section with review cards showing star rating, 
review text, patient name initial avatar, date."

Backend:
  Load profile: GET /api/doctors/:id
    Returns: { id, name, specialization, qualifications, 
      experienceYears, consultationFee, city, clinicAddress, 
      bio, profilePhoto, averageRating, totalReviews, 
      isAcceptingPatients, timeSlots, 
      reviews: [{ rating, review, createdAt, patientName }] }
  
  Load slots: GET /api/doctors/:id/slots?date=YYYY-MM-DD
    Returns: { availableSlots: [{ id, startTime, endTime, isBooked }] }
    Call this every time user selects a different date
  
  Book: POST /api/appointments/book
    body: { doctorId, appointmentDate, timeSlotId, 
            reasonForVisit, aiSymptomAnalysis }
    Pass aiSymptomAnalysis from navigation state if patient 
    arrived here from symptom analysis results
    On success: navigate to /appointments with success toast

─────────────────────────────────────────
PAGE 8 — SymptomAnalysis.jsx UPGRADE
─────────────────────────────────────────
Path: src/pages/SymptomAnalysis.jsx — MODIFY existing file
(BUG 3 field path fixes must already be done before this)

Stitch prompt to use:
"Using STITCH_CONTEXT.md, generate a multi-turn AI chat interface 
for MediConnect symptom analysis. Main content area only 
(Layout sidebar exists). Top section: chat bubble area, 
min-height 360px, scrollable. AI bubbles left-aligned, 
navy background rgba(11,37,69,0.9), white text, 
borderRadius 4px 18px 18px 18px, labeled MediAssist above 
in muted small text. Patient bubbles right-aligned, 
teal gradient background, white text, 
borderRadius 18px 4px 18px 18px. Typing indicator: three 
bouncing teal dots shown while waiting. Bottom: fixed input bar 
with text input and teal Send button. Below chat: result section 
that appears after analysis — urgency badge (color coded), 
specialist recommendation card in navy with confidence bar, 
red flags list in coral, pre-consultation checklist in three 
columns. Below result: matched doctor cards in a grid. 
Warm reassuring AI assistant feel."

First message shown immediately on load (do not send to backend):
{ role: 'assistant', content: 'Hi! I am MediAssist. 
  Please describe your symptoms and I will help you 
  find the right doctor.' }

Send handler logic:
  const userMessage = { role: 'user', content: inputText }
  const updatedMessages = [...messages, userMessage]
  setMessages(updatedMessages)
  setInputText('')
  
  Send to backend — EXCLUDE the initial greeting:
  const toSend = updatedMessages.filter(
    (m, i) => !(i === 0 && m.role === 'assistant')
  )
  
  const { data } = await chatAPI.sendMessage({ messages: toSend })
  
  If data.type === 'question':
    Add { role: 'assistant', content: data.text } to messages
  
  If data.type === 'result':
    Add result message to chat:
      isEmergency → '🚨 Emergency detected. Call 112 immediately.'
      normal      → 'I have enough information. Here is my analysis.'
    Set result state: data.aiAnalysis
    Set doctors state: data.doctors
    Set isEmergency state: data.isEmergency
    Smooth scroll to result section

Emergency state: hide doctor cards, show full-width red alert 
  with 🚨 icon and data.aiAnalysis.emergency.message

─────────────────────────────────────────
PAGE 9 — DoctorAnalytics.jsx
─────────────────────────────────────────
Path: src/pages/doctor/DoctorAnalytics.jsx
Route: /doctor/analytics — ProtectedRoute role="doctor" — uses Layout

Stitch prompt to use:
"Using STITCH_CONTEXT.md, generate a Doctor Analytics Dashboard 
for MediConnect. Main content area only. Three stat cards: 
This Month's Patients (teal), Average Rating with star icon 
(amber), Total Reviews (navy). Two Recharts chart cards side 
by side: Monthly Appointment Volume as BarChart with teal bars, 
Peak Hours as LineChart with blue line. Below charts: 
Top Reasons for Visits section showing reason tags as pills 
(white background, gray border, gray text, rounded). 
Data-rich professional doctor portal feel."

Backend:
  Load: GET /api/doctor/analytics
  Returns: { thisMonthPatients, averageRating, totalReviews,
    monthlyVolume: { 'YYYY-MM': count, ... },
    peakHours: { 'HH': count, ... },
    topReasons: string[] }

  Convert for Recharts:
    monthlyVolume → Object.entries(data.monthlyVolume).map(
      ([month, count]) => ({ 
        month: format(new Date(month+'-01'), 'MMM yy'), 
        count 
      })
    )
    peakHours → Object.entries(data.peakHours).map(
      ([hour, count]) => ({ 
        hour: hour + ':00', 
        count 
      })
    )

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AFTER ALL PAGES ARE BUILT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When all pages are complete:

1. Run the full patient journey end to end and verify:
   Register → /symptoms chat → book doctor → 
   /appointments → view prescription

2. Run the full doctor journey end to end and verify:
   Login → /doctor/dashboard → mark complete → 
   add prescription → /doctor/analytics

3. Fix any runtime errors before telling me you are done.

4. Tell me the final list of what was built, what was 
   modified, and any issues that need attention.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Begin with Phase 1 bug fixes. Do not start Page 1 until 
all 4 bugs are fixed and confirmed working.
Complete one task fully before starting the next.