"use client";

import { useState } from "react";
import { User, Briefcase, GraduationCap, DollarSign, Clock } from "lucide-react";

const WORKCLASS_OPTIONS = ["Private", "Self-emp", "Gov", "Other"];
const EDUCATION_OPTIONS = ["Bachelors", "College", "HS-grad", "Masters", "Doctorate"];
const OCCUPATION_OPTIONS = ["Exec", "Prof", "Sales", "Tech", "Service", "Other"];
const RACE_OPTIONS = ["White", "Black", "Asian", "Other"];
const SEX_OPTIONS = ["Male", "Female"];

interface PredictionFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  loading: boolean;
}

interface InputFieldProps {
  label: string;
  field: string;
  type?: string;
  options?: string[];
  sensitive?: boolean;
  icon?: React.ComponentType<{ size: number; className?: string }>;
  formData: Record<string, unknown>;
  onChange: (field: string, value: string | number) => void;
}

const InputField = ({ label, field, type = "text", options, sensitive, icon: Icon, formData, onChange }: InputFieldProps) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon size={10} className="text-accent/50" />}
      {label}
      {sensitive && <span className="ml-auto text-[7px] bg-danger/10 text-danger px-1 rounded">SENSITIVE</span>}
    </label>
    {options ? (
      <select
        value={String(formData[field] ?? "")}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full bg-sidebar/50 border border-white/5 rounded-lg px-2 py-2 text-[11px] text-foreground focus:outline-none focus:border-accent/50 transition-all cursor-pointer appearance-none"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input
        type={type}
        value={String(formData[field] ?? "")}
        onChange={(e) => onChange(field, type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
        className="w-full bg-sidebar/50 border border-white/5 rounded-lg px-2 py-2 text-[11px] text-foreground focus:outline-none focus:border-accent/50 transition-all"
      />
    )}
  </div>
);

export default function PredictionForm({ onSubmit, loading }: PredictionFormProps) {
  const [formData, setFormData] = useState({
    age: 35,
    workclass: "Private",
    education: "Bachelors",
    education_num: 13,
    marital_status: "Married-civ-spouse",
    occupation: "Exec-managerial",
    relationship: "Husband",
    race: "White",
    sex: "Male",
    capital_gain: 0,
    capital_loss: 0,
    hours_per_week: 40,
    native_country: "United-States",
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Age" field="age" type="number" icon={User} formData={formData} onChange={handleChange} />
        <InputField label="Hours/Wk" field="hours_per_week" type="number" icon={Clock} formData={formData} onChange={handleChange} />
        
        <div className="col-span-2 grid grid-cols-2 gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
           <InputField label="Race" field="race" options={RACE_OPTIONS} sensitive formData={formData} onChange={handleChange} />
           <InputField label="Sex" field="sex" options={SEX_OPTIONS} sensitive formData={formData} onChange={handleChange} />
        </div>

        <InputField label="Education" field="education" options={EDUCATION_OPTIONS} icon={GraduationCap} formData={formData} onChange={handleChange} />
        <InputField label="Edu Rank" field="education_num" type="number" formData={formData} onChange={handleChange} />
        
        <InputField label="Occupation" field="occupation" options={OCCUPATION_OPTIONS} icon={Briefcase} formData={formData} onChange={handleChange} />
        <InputField label="Workclass" field="workclass" options={WORKCLASS_OPTIONS} formData={formData} onChange={handleChange} />
        
        <InputField label="Cap Gain" field="capital_gain" type="number" icon={DollarSign} formData={formData} onChange={handleChange} />
        <InputField label="Cap Loss" field="capital_loss" type="number" formData={formData} onChange={handleChange} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-accent text-white font-bold text-xs hover:brightness-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : "COMPUTE PREDICTION"}
      </button>
    </form>
  );
}


