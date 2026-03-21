# MediConnect Codebase Audit

> Based on reading every file in the project. No guessing.

---

## SECTION 1 — VERIFICATION OF CLAIMED COMPLETED FEATURES

### ✅ CONFIRMED COMPLETE & CORRECT

| Feature | Notes |
|---|---|
| Patient + Doctor registration & login ([authController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/authController.js)) | Fully implemented. Correct bcrypt, JWT, role handling. |
| JWT middleware — [protect](file:///d:/Projects/MediConnect/MediConnect/backend/middleware/authMiddleware.js#3-24) + [restrictTo](file:///d:/Projects/MediConnect/MediConnect/backend/middleware/authMiddleware.js#25-35) | Correct. Always stringifies userId for MongoDB. |
| Admin login, stats, doctor approval/rejection with email | Fully implemented in [routes/admin.js](file:///d:/Projects/MediConnect/MediConnect/backend/routes/admin.js). |
| Doctor profile + slots management ([doctorController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/doctorController.js)) | get/update profile, get/update slots — all complete. |
| Patient profile management ([patientController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/patientController.js)) | get/update profile, get appointments — complete. |
| Public doctor search + profile + slots ([doctorsController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/doctorsController.js)) | Complete. Correctly uses plain string IDs — **no parseInt**. |
| Appointment booking + status update + rating ([appointmentController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/appointmentController.js)) | Logic is correct **but see BUG 1 below**. |
| Groq AI symptom analysis — single turn | Correctly implemented with Groq SDK's `llama-3.3-70b-versatile`. |
| Groq AI checklist generation | Correctly implemented. |
| Nodemailer approval + rejection emails | Fully implemented with HTML templates. |
| Landing page | Complete. |
| Login page with role toggle + pending/rejected states | Complete. |
| 3-step registration with base64 degree upload | Complete. |
| Patient dashboard with appointments list | Complete and correct. |
| AI symptom analysis — single text box | Complete, but see **FLAG** below. |
| Admin login, dashboard, approve/reject queue | All three admin pages exist and are complete. |
| Dual axios instances + AuthContext + AdminContext | Complete, but see **BUG 2 below**. |
| Collapsible sidebar Layout with patient + doctor nav | Correctly implemented. |
| Route guards (GuestRoute, ProtectedRoute, AdminRoute) | All present and correct in [App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx). |

---

### ⚠️ FLAGGED ISSUES IN "COMPLETED" FEATURES

#### BUG 1 — Critical: `parseInt()` on MongoDB ObjectId strings
**File:** [controllers/appointmentController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/appointmentController.js)  
**Lines:** 32, 46, 47, 65, 66, 85, 87 (booking) + 130, 203 (status/rating)

```js
// Line 32
where: { id: parseInt(doctorId) }       // ❌ parseInt("507f1f77...") = NaN

// Line 46-47
id: parseInt(timeSlotId),
doctorId: parseInt(doctorId),           // ❌ same problem

// Lines 65-66 (duplicate check)
doctorId: parseInt(doctorId),
timeSlotId: parseInt(timeSlotId),       // ❌

// Lines 85, 87 (create)
doctorId: parseInt(doctorId),
timeSlotId: parseInt(timeSlotId),       // ❌

// Line 130 (updateAppointmentStatus)
const appointmentId = parseInt(req.params.id);  // ❌

// Line 203 (rateAppointment)
const appointmentId = parseInt(req.params.id);  // ❌
```

**Effect:** Every appointment book, status update, and rating call will fail with Prisma errors because NaN is passed as an ID.  
**Also note:** [doctorController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/doctorController.js) line 238 has `parseInt(req.params.id)` in [getPatientById](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/doctorController.js#234-271) — same bug.

---

#### BUG 2 — `adminAPI` declared before `adminApi` axios instance
**File:** [frontend/src/services/api.js](file:///d:/Projects/MediConnect/MediConnect/frontend/src/services/api.js) — lines 79–87 (adminAPI object) before lines 89–112 (adminApi instance)

Works due to JavaScript hoisting of `const` but only accidentally — `const` is in the TDZ until line 89, so if import order ever changes this will throw `ReferenceError`. Fix: move `adminApi` axios instance declaration above `adminAPI` object.

---

#### BUG 3 — [Placeholder](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx#54-73) component references undefined variables
**File:** [frontend/src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) — lines 61–68

```jsx
{showSignout && (   // ❌ showSignout is not defined anywhere
  <button onClick={logout}> // ❌ logout is not defined in this scope
```

[Placeholder](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx#54-73) is a plain function component with no props or context, so `showSignout` and [logout](file:///d:/Projects/MediConnect/MediConnect/frontend/src/context/AuthContext.jsx#38-43) will throw `ReferenceError` at runtime when any placeholder route is visited.

---

#### FLAG — [SymptomAnalysis.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/SymptomAnalysis.jsx) accesses wrong response field paths
**File:** [frontend/src/pages/SymptomAnalysis.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/SymptomAnalysis.jsx)

The backend returns `{ aiAnalysis, doctors, isEmergency }` but the frontend accesses:
- `result.analysis?.urgency_level` (line 153) — wrong, should be `result.aiAnalysis?.urgency?.level`
- `result.analysis?.recommended_specialist` (line 281) — field doesn't exist in AI JSON
- `result.analysis?.confidence_score` (line 306) — field doesn't exist in AI JSON
- `result.analysis?.reasoning` (line 284) — field path wrong
- `result.emergencyMessage` (line 238) — should be `result.aiAnalysis?.emergency?.message`
- `result.analysis?.red_flags` (line 249, 293) — should be `result.aiAnalysis?.red_flags`
- [DoctorCard](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/SymptomAnalysis.jsx#81-125) accesses `doc.user?.name` (line 88, 91) but backend formats doctors with `doc.name` directly (no nested `user` in formatted response from [aiController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/aiController.js) lines 91-104)

**Effect:** The result phase renders mostly blank/undefined values. Doctor name shows undefined.

---

#### FLAG — [aiController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/aiController.js) comment says "Claude API"
**File:** [backend/controllers/aiController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/aiController.js) — lines 26, 29  
Comment says "Calling Claude API" but code correctly uses Groq. Minor documentation bug only.

---

#### FLAG — [AdminDoctors.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/admin/AdminDoctors.jsx) exists but is NOT imported or routed in [App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx)
**File:** [frontend/src/pages/admin/AdminDoctors.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/admin/AdminDoctors.jsx) exists (17 KB) but [App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) only imports `AdminLogin` and `AdminDashboard`. There is no route for [AdminDoctors.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/admin/AdminDoctors.jsx). It is dead code unless [AdminDashboard.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/admin/AdminDashboard.jsx) navigates to it internally (need to verify).

---

#### FLAG — Doctor nav in [Layout.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/components/Layout.jsx) missing Analytics link
`DOCTOR_NAV` array (lines 25–29) has: Dashboard, Appointments, Profile.  
There is no `/doctor/analytics` nav link, so `DoctorAnalytics.jsx` (to be built) has no sidebar entry.

---

## SECTION 2 — COMPLETE ORDERED TASK LIST

### Phase 1: Bug Fixes (must be done first — they break existing features)

| # | Task | Type | Files to Modify | Depends On | Complexity |
|---|---|---|---|---|---|
| 1 | Fix parseInt() on appointment IDs | BUG_FIX | [controllers/appointmentController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/appointmentController.js) | — | LOW |
| 2 | Fix parseInt() on patient ID in doctorController | BUG_FIX | [controllers/doctorController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/doctorController.js) | — | LOW |
| 3 | Fix adminApi declaration order | BUG_FIX | [frontend/src/services/api.js](file:///d:/Projects/MediConnect/MediConnect/frontend/src/services/api.js) | — | LOW |
| 4 | Fix Placeholder component undefined variables | BUG_FIX | [frontend/src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) | — | LOW |
| 5 | Fix SymptomAnalysis.jsx field path mismatches | BUG_FIX | [frontend/src/pages/SymptomAnalysis.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/SymptomAnalysis.jsx) | — | MEDIUM |

---

### Phase 2: Schema Changes (block all prescription features)

| # | Task | Type | Files to Create/Modify | Depends On | Complexity |
|---|---|---|---|---|---|
| 6 | Add Prescription model to Prisma schema | SCHEMA_CHANGE | [backend/prisma/schema.prisma](file:///d:/Projects/MediConnect/MediConnect/backend/prisma/schema.prisma) | — | MEDIUM |

**Prescription model fields:**
- [id](file:///d:/Projects/MediConnect/MediConnect/frontend/src/context/AuthContext.jsx#6-50) (ObjectId), `appointmentId` (unique), `doctorId`, `patientId`
- `medicines` (Json — array of `{name, dosage, frequency, duration, instructions}`)
- `notes` (String?)
- `reminderTimes` (String[] — array of HH:MM)
- `medicineLog` (Json — array of `{token, medicineName, date, taken, expiresAt}`)
- `createdAt` (DateTime)

---

### Phase 3: New Backend Features

| # | Task | Type | Files to Create/Modify | Depends On | Complexity |
|---|---|---|---|---|---|
| 7 | Prescription controller (add + get) | NEW_BACKEND | `controllers/prescriptionController.js` [NEW] | Task 6 | MEDIUM |
| 8 | Prescription routes | NEW_BACKEND | `routes/prescriptions.js` [NEW], [server.js](file:///d:/Projects/MediConnect/MediConnect/backend/server.js) | Task 7 | LOW |
| 9 | Mark-as-taken endpoint (public GET) | NEW_BACKEND | `controllers/prescriptionController.js` | Task 6 | MEDIUM |
| 10 | Medicine reminder cron job | NEW_BACKEND | `services/reminderCron.js` [NEW], [server.js](file:///d:/Projects/MediConnect/MediConnect/backend/server.js), [services/emailService.js](file:///d:/Projects/MediConnect/MediConnect/backend/services/emailService.js) | Task 6 | HIGH |
| 11 | Forgot password endpoint | NEW_BACKEND | [controllers/authController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/authController.js), [routes/auth.js](file:///d:/Projects/MediConnect/MediConnect/backend/routes/auth.js), [services/emailService.js](file:///d:/Projects/MediConnect/MediConnect/backend/services/emailService.js) | — | MEDIUM |
| 12 | Multi-turn AI chat endpoint (`POST /api/ai/chat`) | NEW_BACKEND | [controllers/aiController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/aiController.js), [services/aiService.js](file:///d:/Projects/MediConnect/MediConnect/backend/services/aiService.js), [routes/ai.js](file:///d:/Projects/MediConnect/MediConnect/backend/routes/ai.js) | — | HIGH |

---

### Phase 4: New Frontend Pages — Placeholder Replacements

| # | Task | Type | Files to Create/Modify | Depends On | Complexity |
|---|---|---|---|---|---|
| 13 | `PatientAppointments.jsx` | NEW_FRONTEND | `src/pages/PatientAppointments.jsx` [NEW], [src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) | Task 1 | MEDIUM |
| 14 | `PatientProfile.jsx` | NEW_FRONTEND | `src/pages/PatientProfile.jsx` [NEW], [src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) | — | MEDIUM |
| 15 | `DoctorDashboard.jsx` | NEW_FRONTEND | `src/pages/DoctorDashboard.jsx` [NEW], [src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) | Task 1 | MEDIUM |
| 16 | `DoctorAppointments.jsx` | NEW_FRONTEND | `src/pages/DoctorAppointments.jsx` [NEW], [src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) | Task 1 | MEDIUM |
| 17 | `DoctorProfile.jsx` | NEW_FRONTEND | `src/pages/DoctorProfile.jsx` [NEW], [src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) | — | MEDIUM |
| 18 | `DoctorProfilePage.jsx` (public) + booking flow | NEW_FRONTEND | `src/pages/DoctorProfilePage.jsx` [NEW], [src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) | Task 1 | HIGH |
| 19 | `DoctorAnalytics.jsx` + sidebar link | NEW_FRONTEND | `src/pages/DoctorAnalytics.jsx` [NEW], [src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx), [src/components/Layout.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/components/Layout.jsx) | — | MEDIUM |

---

### Phase 5: New Frontend Features

| # | Task | Type | Files to Create/Modify | Depends On | Complexity |
|---|---|---|---|---|---|
| 20 | Replace SymptomAnalysis with multi-turn chat UI | NEW_FRONTEND | [src/pages/SymptomAnalysis.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/SymptomAnalysis.jsx) | Task 5, Task 12 | HIGH |
| 21 | Prescription card in PatientAppointments | NEW_FRONTEND | `src/pages/PatientAppointments.jsx` | Tasks 8, 13 | MEDIUM |
| 22 | Add Prescription modal in DoctorDashboard | NEW_FRONTEND | `src/pages/DoctorDashboard.jsx` | Tasks 8, 15 | MEDIUM |
| 23 | `ForgotPassword.jsx` page + login link | NEW_FRONTEND | `src/pages/ForgotPassword.jsx` [NEW], [src/pages/Login.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/pages/Login.jsx), [src/App.jsx](file:///d:/Projects/MediConnect/MediConnect/frontend/src/App.jsx) | Task 11 | LOW |
| 24 | Add `prescriptionAPI` and `aiAPI.chat` to api.js | NEW_FRONTEND | [src/services/api.js](file:///d:/Projects/MediConnect/MediConnect/frontend/src/services/api.js) | Tasks 8, 12 | LOW |

---

## SECTION 3 — DEPENDENCY MAP

```
Tasks 1,2,3,4 ────────────────────────┐
                                       ▼
Task 5 (SymptomAnalysis field fix) ────► Task 20 (multi-turn UI)
                                           ▲
                              Task 12 (chat endpoint)

Task 6 (Prescription schema)
  ├──► Task 7 (prescriptionController)
  │      └──► Task 8 (prescription routes)
  │              ├──► Task 9 (mark-as-taken endpoint)
  │              ├──► Task 10 (reminder cron)
  │              ├──► Task 21 (prescription card in patient page)  ◄── Task 13
  │              └──► Task 22 (prescription modal in doctor dash)  ◄── Task 15
  └──► Task 24 (prescriptionAPI in api.js) ◄── (also needs Task 12 for aiAPI.chat)

Task 11 (forgot-password backend) ──► Task 23 (ForgotPassword.jsx)

Task 1 (parseInt fix) ─────────────┬──► Task 13 (PatientAppointments)
                                   ├──► Task 15 (DoctorDashboard)
                                   ├──► Task 16 (DoctorAppointments)
                                   └──► Task 18 (DoctorProfilePage booking)

Tasks 14, 17, 18, 19 ─── no blocking backend deps (APIs exist)
```

---

## SECTION 4 — WHAT TO BUILD FIRST

**Task 1 — Fix `parseInt()` on MongoDB ObjectId strings in [appointmentController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/appointmentController.js)**

This is the highest-priority bug because it silently breaks every appointment booking, every status update, and every rating submission in the entire application. It affects 9 call sites across [appointmentController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/appointmentController.js) and 1 in [doctorController.js](file:///d:/Projects/MediConnect/MediConnect/backend/controllers/doctorController.js). All other appointment-related frontend pages depend on these endpoints working correctly.

I am ready to build it when you say **"go"**.
