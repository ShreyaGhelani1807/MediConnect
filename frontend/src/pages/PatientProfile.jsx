import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { patientAPI } from "../services/api";
import {
  User, Phone, MapPin, Calendar, Activity, AlertTriangle,
  Edit3, Save, X, Loader, Mail, Heart, Droplets, FileText
} from "lucide-react";

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const GENDERS = ["Male","Female","Other","Prefer not to say"];

// ── Field components ───────────────────────────────────────────────────────────
function ReadField({ icon: Icon, label, value, color = "#0DC4A1" }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl"
      style={{ background: "rgba(240,247,255,0.8)", border: "1px solid rgba(11,37,69,0.06)" }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#94a3b8" }}>
          {label}
        </p>
        <p className="text-sm font-semibold truncate" style={{ color: value ? "#0B2545" : "#CBD5E1" }}>
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, type = "text", icon: Icon }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "#64748b" }}>
        {Icon && <Icon size={12} style={{ color: "#0DC4A1" }} />}
        {label}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: "rgba(240,247,255,0.9)", border: "1px solid rgba(11,37,69,0.1)",
          color: "#0B2545", fontFamily: "Inter, sans-serif"
        }} />
    </div>
  );
}

function EditSelect({ label, value, onChange, options, icon: Icon }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "#64748b" }}>
        {Icon && <Icon size={12} style={{ color: "#0DC4A1" }} />}
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
        style={{
          background: "rgba(240,247,255,0.9)", border: "1px solid rgba(11,37,69,0.1)",
          color: "#0B2545", fontFamily: "Inter, sans-serif"
        }}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function EditTextarea({ label, value, onChange, placeholder, icon: Icon }) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "#64748b" }}>
        {Icon && <Icon size={12} style={{ color: "#0DC4A1" }} />}
        {label}
      </label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
        style={{
          background: "rgba(240,247,255,0.9)", border: "1px solid rgba(11,37,69,0.1)",
          color: "#0B2545", fontFamily: "Inter, sans-serif"
        }} />
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function PatientProfile() {
  const { user, login } = useAuth();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  // Editable form state
  const [form, setForm] = useState({
    name: "", phone: "", city: "",
    age: "", gender: "", bloodGroup: "",
    medicalHistory: "", emergencyContact: "",
  });

  // Fetch profile
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await patientAPI.getProfile();
        const data = res.data;
        setProfile(data);
        setForm({
          name:             data.name             || "",
          phone:            data.phone            || "",
          city:             data.city             || "",
          age:              data.profile?.age     ? String(data.profile.age) : "",
          gender:           data.profile?.gender  || "",
          bloodGroup:       data.profile?.bloodGroup || "",
          medicalHistory:   data.profile?.medicalHistory || "",
          emergencyContact: data.profile?.emergencyContact || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await patientAPI.updateProfile({
        name:             form.name             || undefined,
        phone:            form.phone            || undefined,
        city:             form.city             || undefined,
        age:              form.age              ? parseInt(form.age) : undefined,
        gender:           form.gender           || undefined,
        bloodGroup:       form.bloodGroup       || undefined,
        medicalHistory:   form.medicalHistory   || undefined,
        emergencyContact: form.emergencyContact || undefined,
      });
      // Refresh profile data
      const res = await patientAPI.getProfile();
      setProfile(res.data);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        name:             profile.name             || "",
        phone:            profile.phone            || "",
        city:             profile.city             || "",
        age:              profile.profile?.age     ? String(profile.profile.age) : "",
        gender:           profile.profile?.gender  || "",
        bloodGroup:       profile.profile?.bloodGroup || "",
        medicalHistory:   profile.profile?.medicalHistory || "",
        emergencyContact: profile.profile?.emergencyContact || "",
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0F7FF" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full"
          style={{ border: "3px solid rgba(13,196,161,0.2)", borderTopColor: "#0DC4A1" }} />
      </div>
    );
  }

  const initials = (form.name || profile?.name || "P").charAt(0).toUpperCase();
  const completedFields = [
    form.name, form.phone, form.city,
    form.age, form.gender, form.bloodGroup,
    form.medicalHistory, form.emergencyContact,
  ].filter(Boolean).length;
  const completionPct = Math.round((completedFields / 8) * 100);

  return (
    <div className="min-h-screen p-6" style={{ background: "#F0F7FF" }}>
      {/* BG orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #0DC4A1, transparent)", top: "5%", right: "8%" }} />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #0B2545, transparent)", bottom: "15%", left: "3%" }} />
      </div>

      <div className="relative max-w-3xl mx-auto" style={{ zIndex: 1 }}>

        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "#0B2545", fontFamily: "Inter, sans-serif" }}>
            My Profile
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Manage your personal and medical information
          </p>
        </motion.div>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 mb-5"
          style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
          <div className="flex items-start gap-5 flex-wrap">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl"
                style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
                style={{ background: "#0DC4A1" }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold" style={{ color: "#0B2545" }}>
                {profile?.name || "Patient"}
              </h2>
              <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: "#64748b" }}>
                <Mail size={13} style={{ color: "#0DC4A1" }} /> {profile?.email}
              </p>
              {profile?.city && (
                <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: "#64748b" }}>
                  <MapPin size={13} style={{ color: "#0DC4A1" }} /> {profile.city}
                </p>
              )}

              {/* Profile completion bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "#64748b" }}>Profile completion</span>
                  <span className="text-xs font-bold" style={{ color: "#0DC4A1" }}>{completionPct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(11,37,69,0.08)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }} />
                </div>
              </div>
            </div>

            {/* Edit / Save buttons */}
            <div className="flex items-start gap-2 flex-shrink-0">
              {!editing ? (
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)", color: "white" }}>
                  <Edit3 size={14} /> Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(232,96,76,0.1)", color: "#E8604C" }}>
                    <X size={14} /> Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)", opacity: saving ? 0.8 : 1 }}>
                    {saving ? <Loader size={13} className="animate-spin" /> : <Save size={13} />}
                    {saving ? "Saving…" : "Save Changes"}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content: View or Edit */}
        <AnimatePresence mode="wait">
          {!editing ? (
            /* ── VIEW MODE ── */
            <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
              className="space-y-5">

              {/* Personal Info */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
                  <User size={15} style={{ color: "#0DC4A1" }} /> Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReadField icon={User}     label="Full Name"  value={profile?.name}  />
                  <ReadField icon={Mail}     label="Email"      value={profile?.email} color="#3B82F6" />
                  <ReadField icon={Phone}    label="Phone"      value={profile?.phone} />
                  <ReadField icon={MapPin}   label="City"       value={profile?.city}  />
                  <ReadField icon={Calendar} label="Age"        value={profile?.profile?.age ? `${profile.profile.age} years` : null} color="#E8604C" />
                  <ReadField icon={User}     label="Gender"     value={profile?.profile?.gender} color="#8B5CF6" />
                </div>
              </div>

              {/* Medical Info */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
                  <Activity size={15} style={{ color: "#E8604C" }} /> Medical Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReadField icon={Droplets}      label="Blood Group"       value={profile?.profile?.bloodGroup} color="#E8604C" />
                  <ReadField icon={AlertTriangle} label="Emergency Contact" value={profile?.profile?.emergencyContact} color="#F59E0B" />
                </div>
                {profile?.profile?.medicalHistory && (
                  <div className="mt-3 p-4 rounded-2xl"
                    style={{ background: "rgba(240,247,255,0.8)", border: "1px solid rgba(11,37,69,0.06)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} style={{ color: "#0DC4A1" }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Medical History</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#0B2545" }}>
                      {profile.profile.medicalHistory}
                    </p>
                  </div>
                )}
                {!profile?.profile?.medicalHistory && !profile?.profile?.bloodGroup && !profile?.profile?.emergencyContact && (
                  <div className="text-center py-4 mt-2">
                    <Heart size={24} className="mx-auto mb-2" style={{ color: "#CBD5E1" }} />
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      Add your medical info to help doctors provide better care
                    </p>
                    <button onClick={() => setEditing(true)}
                      className="mt-2 text-xs font-semibold underline" style={{ color: "#0DC4A1" }}>
                      Add now →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

          ) : (
            /* ── EDIT MODE ── */
            <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
              className="space-y-5">

              {/* Personal Info Card */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
                  <User size={15} style={{ color: "#0DC4A1" }} /> Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EditField label="Full Name"    value={form.name}    onChange={(v) => setForm(f => ({ ...f, name:  v }))} icon={User}     />
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-[42px] rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(59,130,246,0.1)" }}>
                      <Mail size={14} style={{ color: "#3B82F6" }} />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Email</label>
                      <input value={profile?.email || ""} disabled
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{ background: "rgba(11,37,69,0.04)", border: "1px solid rgba(11,37,69,0.06)", color: "#94a3b8", cursor: "not-allowed" }} />
                    </div>
                  </div>
                  <EditField label="Phone Number" value={form.phone}   onChange={(v) => setForm(f => ({ ...f, phone: v }))} icon={Phone}    type="tel" />
                  <EditField label="City"         value={form.city}    onChange={(v) => setForm(f => ({ ...f, city:  v }))} icon={MapPin}   />
                  <EditField label="Age"          value={form.age}     onChange={(v) => setForm(f => ({ ...f, age:   v }))} icon={Calendar} type="number" />
                  <EditSelect label="Gender"      value={form.gender}  onChange={(v) => setForm(f => ({ ...f, gender: v }))} options={GENDERS} icon={User} />
                </div>
              </div>

              {/* Medical Info Card */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
                  <Activity size={15} style={{ color: "#E8604C" }} /> Medical Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <EditSelect label="Blood Group"       value={form.bloodGroup}       onChange={(v) => setForm(f => ({ ...f, bloodGroup: v }))}       options={BLOOD_GROUPS} icon={Droplets} />
                  <EditField  label="Emergency Contact" value={form.emergencyContact} onChange={(v) => setForm(f => ({ ...f, emergencyContact: v }))} icon={AlertTriangle} type="tel" />
                </div>
                <EditTextarea label="Medical History / Allergies / Existing Conditions"
                  value={form.medicalHistory}
                  onChange={(v) => setForm(f => ({ ...f, medicalHistory: v }))}
                  placeholder="e.g. Diabetic, allergic to penicillin, hypertension..."
                  icon={FileText} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}