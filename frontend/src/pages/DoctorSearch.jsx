import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search, MapPin, Stethoscope, Star, Clock,
  ChevronDown, Filter, IndianRupee, X, Award
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const SPECIALIZATIONS = [
  "General Physician","Cardiologist","Dermatologist","Pediatrician",
  "Orthopedic","Neurologist","Gynecologist","Psychiatrist",
  "ENT Specialist","Ophthalmologist","Dentist","Urologist",
  "Endocrinologist","Pulmonologist","Oncologist"
];

const CITIES = [
  "Mumbai","Delhi","Bangalore","Hyderabad","Chennai",
  "Kolkata","Pune","Ahmedabad","Jaipur","Surat",
  "Lucknow","Kanpur","Nagpur","Indore","Bhopal"
];

const DoctorCardSkeleton = () => (
  <div className="rounded-2xl p-6 animate-pulse" style={{
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(11,37,69,0.08)"
  }}>
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-slate-200 rounded-full w-16" />
          <div className="h-5 bg-slate-200 rounded-full w-20" />
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 flex justify-between items-center border-t border-slate-100">
      <div className="h-3 bg-slate-200 rounded w-1/4" />
      <div className="h-8 bg-slate-200 rounded-xl w-24" />
    </div>
  </div>
);

const DoctorCard = ({ doctor, index, onViewProfile }) => {
  const rating = doctor.averageRating || 0;
  const reviewCount = doctor.reviewCount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -5, boxShadow: "0 24px 48px rgba(11,37,69,0.12)" }}
      className="rounded-2xl p-6 cursor-pointer"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(11,37,69,0.08)",
        transition: "box-shadow 0.3s ease"
      }}
      onClick={() => onViewProfile(doctor.id)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
            style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}>
            {doctor.name?.charAt(0)?.toUpperCase() || "D"}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
            style={{ background: "#0DC4A1" }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-base truncate" style={{ color: "#0B2545" }}>
                Dr. {doctor.name}
              </h3>
              <p className="text-sm font-semibold" style={{ color: "#0DC4A1" }}>
                {doctor.specialization}
              </p>
            </div>
            {rating > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-lg"
                style={{ background: "rgba(245,158,11,0.1)" }}>
                <Star size={11} fill="#F59E0B" color="#F59E0B" />
                <span className="text-xs font-bold" style={{ color: "#0B2545" }}>
                  {rating.toFixed(1)}
                </span>
                {reviewCount > 0 && (
                  <span className="text-xs" style={{ color: "#94a3b8" }}>({reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {doctor.city && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(11,37,69,0.06)", color: "#64748b" }}>
                <MapPin size={9} />{doctor.city}
              </span>
            )}
            {doctor.experience && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(11,37,69,0.06)", color: "#64748b" }}>
                <Award size={9} />{doctor.experience} yrs exp
              </span>
            )}
            {doctor.consultationFee && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "rgba(232,96,76,0.07)", color: "#E8604C" }}>
                <IndianRupee size={9} />₹{doctor.consultationFee}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(11,37,69,0.06)" }}>
        <p className="text-xs truncate max-w-[140px]" style={{ color: "#94a3b8" }}>
          {doctor.qualifications || "MBBS"}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
          onClick={(e) => { e.stopPropagation(); onViewProfile(doctor.id); }}
        >
          View Profile
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function DoctorSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const token = localStorage.getItem("mediconnect_token");
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedSpecialization) params.append("specialization", selectedSpecialization);
      if (selectedCity) params.append("city", selectedCity);

      const res = await axios.get(`${API_BASE}/doctors/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setDoctors((data.doctors || data || []).map((doc) => ({
        ...doc,
        experience: doc.experience ?? doc.experienceYears,
        reviewCount: doc.reviewCount ?? doc.totalReviews,
      })));
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSpecialization, selectedCity]);

  // Load all doctors on mount
  useEffect(() => { fetchDoctors(); }, []); // eslint-disable-line

  // Debounced re-fetch on filter change
  useEffect(() => {
    if (!hasSearched) return;
    const timer = setTimeout(() => fetchDoctors(), 450);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSpecialization, selectedCity]); // eslint-disable-line

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialization("");
    setSelectedCity("");
  };

  const activeFiltersCount = [searchQuery, selectedSpecialization, selectedCity].filter(Boolean).length;

  return (
    <div className="min-h-screen p-6" style={{ background: "#F0F7FF" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #0DC4A1, transparent)", top: "5%", right: "8%" }}
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #0B2545, transparent)", bottom: "15%", left: "3%" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto" style={{ zIndex: 1 }}>
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#0B2545", fontFamily: "Inter, sans-serif" }}>
            Find a Doctor
          </h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Search from verified specialists across India
          </p>
        </motion.div>

        {/* Search Bar Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4 mb-4 flex flex-col md:flex-row gap-3"
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(11,37,69,0.08)"
          }}
        >
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDoctors()}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "rgba(240,247,255,0.9)",
                border: "1px solid rgba(11,37,69,0.1)",
                color: "#0B2545",
                fontFamily: "Inter, sans-serif"
              }}
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{
              background: activeFiltersCount > 0 ? "linear-gradient(135deg, #0DC4A1, #0B2545)" : "rgba(11,37,69,0.06)",
              color: activeFiltersCount > 0 ? "white" : "#0B2545",
            }}
          >
            <Filter size={15} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-xs font-bold flex items-center justify-center"
                style={{ color: "#0B2545" }}>
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown size={14}
              style={{ transform: showFilters ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
          </motion.button>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchDoctors}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
          >
            Search
          </motion.button>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="rounded-2xl p-5 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(11,37,69,0.08)"
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold mb-2 block uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                    Specialization
                  </label>
                  <div className="relative">
                    <Stethoscope size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                    <select
                      value={selectedSpecialization}
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none appearance-none"
                      style={{
                        background: "rgba(240,247,255,0.9)",
                        border: "1px solid rgba(11,37,69,0.1)",
                        color: "#0B2545"
                      }}
                    >
                      <option value="">All Specializations</option>
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold mb-2 block uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                    City
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none appearance-none"
                      style={{
                        background: "rgba(240,247,255,0.9)",
                        border: "1px solid rgba(11,37,69,0.1)",
                        color: "#0B2545"
                      }}
                    >
                      <option value="">All Cities</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ color: "#E8604C", background: "rgba(232,96,76,0.08)" }}
                  >
                    <X size={12} /> Clear All Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        {hasSearched && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
            <p className="text-sm" style={{ color: "#64748b" }}>
              {doctors.length > 0 ? (
                <><span className="font-semibold" style={{ color: "#0B2545" }}>{doctors.length}</span> doctor{doctors.length !== 1 ? "s" : ""} found</>
              ) : (
                "No doctors found"
              )}
            </p>
          </motion.div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <DoctorCardSkeleton key={i} />)}
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doctor, index) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                index={index}
                onViewProfile={(id) => navigate(`/doctors/${id}`)}
              />
            ))}
          </div>
        ) : hasSearched ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(24px)" }}
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#0B2545" }}>No doctors found</h3>
            <p className="text-sm mb-5" style={{ color: "#64748b" }}>Try adjusting your search or removing filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #0DC4A1, #0B2545)" }}
            >
              Clear Filters
            </button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}