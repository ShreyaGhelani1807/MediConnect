# MediConnect Build Checklist

## Phase 1 — Bug Fixes
- [x] **Task 1** — Fix parseInt() on MongoDB IDs in [appointmentController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/appointmentController.js)
- [x] **Task 2** — Fix parseInt() on MongoDB ID in [doctorController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/doctorController.js)
- [x] **Task 3** — Fix adminApi declaration order in [services/api.js](file:///d:/Projects/MediConnect/MediConnect/frontend/src/services/api.js)
- [x] **Task 4** — Fix Placeholder undefined variables in [App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx)
- [x] **Task 5** — Fix SymptomAnalysis.jsx field path mismatches

## Phase 2 — Schema Changes
- [x] **Task 6** — Add Prescription model to [prisma/schema.prisma](file:///d:/Projects/MediConnect/MediConnect/backend/prisma/schema.prisma)

## Phase 3 — New Backend Features
- [x] **Task 7** — Prescription controller (add + get endpoints)
- [x] **Task 8** — Prescription routes + register in server.js
- [x] **Task 9** — Mark-as-taken public GET endpoint
- [x] **Task 10** — Medicine reminder cron job (node-cron)
- [x] **Task 11** — Forgot password endpoint + email
- [x] **Task 12** — Multi-turn AI chat endpoint (POST /api/ai/chat)

## Phase 4 — Frontend Placeholder Pages
- [ ] **Task 13** — `PatientAppointments.jsx`
- [ ] **Task 14** — `PatientProfile.jsx`
- [ ] **Task 15** — `DoctorDashboard.jsx`
- [ ] **Task 16** — `DoctorAppointments.jsx`
- [ ] **Task 17** — `DoctorProfile.jsx`
- [ ] **Task 18** — `DoctorProfilePage.jsx` (public) + booking flow
- [ ] **Task 19** — `DoctorAnalytics.jsx` + sidebar Analytics link

## Phase 5 — New Frontend Features
- [ ] **Task 20** — Replace SymptomAnalysis with multi-turn chat UI
- [ ] **Task 21** — Prescription card in PatientAppointments
- [ ] **Task 22** — Add Prescription modal in DoctorDashboard
- [ ] **Task 23** — `ForgotPassword.jsx` page + Login.jsx link
- [x] **Task 24** — Add `prescriptionAPI` + `aiAPI.chat` to api.js
