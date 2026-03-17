import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { doctorAPI } from "../services/api";
import {
  User, Phone, MapPin, Activity, AlertTriangle,
  Edit3, Save, X, Loader, Mail, Briefcase, GraduationCap, Clock, Award, FileText, CheckCircle
} from "lucide-react";

const SPECIALIZATIONS = [
  "Cardiologist", "Dermatologist", "Endocrinologist", "Gastroenterologist",
  "Neurologist", "Pediatrician", "Psychiatrist", "Orthopedist", "General Physician"
];

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
        <p className="text-sm font-semibold truncate" style={{ color: value !== null && value !== "" && value !== undefined ? "#0B2545" : "#CBD5E1" }}>
          {value !== null && value !== "" && value !== undefined ? value : "Not provided"}
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
export default function DoctorProfile() {
  const { user } = useAuth();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  // Editable form state
  const [form, setForm] = useState({
    name: "", phone: "", city: "",
    specialization: "", qualifications: "", experienceYears: "",
    consultationFee: "", clinicAddress: "", bio: "", isAcceptingPatients: true
  });

  // Fetch profile
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await doctorAPI.getProfile();
        const data = res.data;
        setProfile(data);
        setForm({
          name:                data.name             || "",
          phone:               data.phone            || "",
          city:                data.city             || "",
          specialization:      data.profile?.specialization || "",
          qualifications:      data.profile?.qualifications || "",
          experienceYears:     data.profile?.experienceYears ? String(data.profile.experienceYears) : "",
          consultationFee:     data.profile?.consultationFee ? String(data.profile.consultationFee) : "",
          clinicAddress:       data.profile?.clinicAddress || "",
          bio:                 data.profile?.bio || "",
          isAcceptingPatients: data.profile?.isAcceptingPatients ?? true,
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
      await doctorAPI.updateProfile({
        name:                form.name             || undefined,
        phone:               form.phone            || undefined,
        city:                form.city             || undefined,
        specialization:      form.specialization   || undefined,
        qualifications:      form.qualifications   || undefined,
        experienceYears:     form.experienceYears  ? parseInt(form.experienceYears) : undefined,
        consultationFee:     form.consultationFee  ? parseInt(form.consultationFee) : undefined,
        clinicAddress:       form.clinicAddress    || undefined,
        bio:                 form.bio              || undefined,
        isAcceptingPatients: form.isAcceptingPatients,
      });
      // Refresh profile data
      const res = await doctorAPI.getProfile();
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
        name:                profile.name             || "",
        phone:               profile.phone            || "",
        city:                profile.city             || "",
        specialization:      profile.profile?.specialization || "",
        qualifications:      profile.profile?.qualifications || "",
        experienceYears:     profile.profile?.experienceYears ? String(profile.profile.experienceYears) : "",
        consultationFee:     profile.profile?.consultationFee ? String(profile.profile.consultationFee) : "",
        clinicAddress:       profile.profile?.clinicAddress || "",
        bio:                 profile.profile?.bio || "",
        isAcceptingPatients: profile.profile?.isAcceptingPatients ?? true,
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

  const initials = (form.name || profile?.name || "D").charAt(0).toUpperCase();
  const completedFields = [
    form.name, form.phone, form.city,
    form.specialization, form.qualifications, form.experienceYears,
    form.consultationFee, form.clinicAddress, form.bio
  ].filter(Boolean).length;
  const completionPct = Math.round((completedFields / 9) * 100);

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
            Doctor Profile
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Manage your professional information and settings
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
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white"
                style={{ background: form.isAcceptingPatients ? "#0DC4A1" : "#E8604C" }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold" style={{ color: "#0B2545" }}>
                Dr. {profile?.name || "Doctor"}
              </h2>
              <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: "#64748b" }}>
                <Briefcase size={13} style={{ color: "#0DC4A1" }} /> {profile?.profile?.specialization || "Specialization not set"}
              </p>
              <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: "#64748b" }}>
                <Mail size={13} style={{ color: "#3B82F6" }} /> {profile?.email}
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
                  <ReadField icon={Award}    label="Accepting Patients"  value={profile?.profile?.isAcceptingPatients ? 'Yes' : 'No'} color={profile?.profile?.isAcceptingPatients ? "#0DC4A1" : "#E8604C"} />
                </div>
              </div>

              {/* Professional Info */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
                  <Activity size={15} style={{ color: "#E8604C" }} /> Professional Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReadField icon={Briefcase}     label="Specialization"     value={profile?.profile?.specialization} color="#8B5CF6" />
                  <ReadField icon={GraduationCap} label="Qualifications"     value={profile?.profile?.qualifications} color="#3B82F6" />
                  <ReadField icon={Clock}         label="Experience (Years)" value={profile?.profile?.experienceYears ? `${profile.profile.experienceYears} years` : null} color="#F59E0B" />
                  <ReadField icon={CheckCircle}   label="Consultation Fee"   value={profile?.profile?.consultationFee ? `₹${profile.profile.consultationFee}` : null} color="#10B981" />
                  <ReadField icon={MapPin}        label="Clinic Address"     value={profile?.profile?.clinicAddress} color="#E8604C" />
                </div>
                {profile?.profile?.bio && (
                  <div className="mt-3 p-4 rounded-2xl"
                    style={{ background: "rgba(240,247,255,0.8)", border: "1px solid rgba(11,37,69,0.06)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} style={{ color: "#0DC4A1" }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Professional Bio</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#0B2545" }}>
                      {profile.profile.bio}
                    </p>
                  </div>
                )}
                {!profile?.profile?.specialization && !profile?.profile?.qualifications && (
                  <div className="text-center py-4 mt-2">
                    <Award size={24} className="mx-auto mb-2" style={{ color: "#CBD5E1" }} />
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      Add your professional details to attract more patients
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
                  <User size={15} style={{ color: "#0DC4A1" }} /> Personal Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <EditField label="Full Name"    value={form.name}    onChange={(v) => setForm(f => ({ ...f, name:  v }))} icon={User}     />
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-[42px] rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(59,130,246,0.1)" }}>
                      <Mail size={14} style={{ color: "#3B82F6" }} />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#64748b" }}>Email (Read Only)</label>
                      <input value={profile?.email || ""} disabled
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{ background: "rgba(11,37,69,0.04)", border: "1px solid rgba(11,37,69,0.06)", color: "#94a3b8", cursor: "not-allowed" }} />
                    </div>
                  </div>
                  <EditField label="Phone Number" value={form.phone}   onChange={(v) => setForm(f => ({ ...f, phone: v }))} icon={Phone}    type="tel" />
                  <EditField label="City"         value={form.city}    onChange={(v) => setForm(f => ({ ...f, city:  v }))} icon={MapPin}   />
                  
                  <div className="flex items-center mt-6 col-span-1 sm:col-span-2 space-x-2">
                     <input type="checkbox" checked={form.isAcceptingPatients} onChange={(e) => setForm(f => ({ ...f, isAcceptingPatients: e.target.checked }))} className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500" />
                     <label className="text-sm font-semibold" style={{ color: "#0B2545" }}>Accepting New Patients</label>
                  </div>
                </div>
              </div>

              {/* Professional Info Card */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(11,37,69,0.08)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#0B2545" }}>
                  <Activity size={15} style={{ color: "#E8604C" }} /> Professional Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <EditSelect label="Specialization"     value={form.specialization}  onChange={(v) => setForm(f => ({ ...f, specialization: v }))} options={SPECIALIZATIONS} icon={Briefcase} />
                  <EditField  label="Qualifications"     value={form.qualifications}  onChange={(v) => setForm(f => ({ ...f, qualifications: v }))} icon={GraduationCap} />
                  <EditField  label="Years of Experience"value={form.experienceYears} onChange={(v) => setForm(f => ({ ...f, experienceYears: v }))} icon={Clock} type="number" />
                  <EditField  label="Consultation Fee (₹)"  value={form.consultationFee} onChange={(v) => setForm(f => ({ ...f, consultationFee: v }))} icon={CheckCircle} type="number" />
                  <EditField  label="Clinic Full Address"value={form.clinicAddress}  onChange={(v) => setForm(f => ({ ...f, clinicAddress: v }))} icon={MapPin} />
                </div>
                <EditTextarea label="Professional Bio"
                  value={form.bio}
                  onChange={(v) => setForm(f => ({ ...f, bio: v }))}
                  placeholder="Tell patients about your background, expertise, and approach to medicine..."
                  icon={FileText} />
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

