"use client";

import { useState } from "react";

const WORKCLASS_OPTIONS = [
  "Private", "Self-emp-not-inc", "Self-emp-inc", "Federal-gov",
  "Local-gov", "State-gov", "Without-pay", "Never-worked",
];
const EDUCATION_OPTIONS = [
  "Bachelors", "Some-college", "11th", "HS-grad", "Prof-school",
  "Assoc-acdm", "Assoc-voc", "9th", "7th-8th", "12th",
  "Masters", "1st-4th", "10th", "Doctorate", "5th-6th", "Preschool",
];
const MARITAL_OPTIONS = [
  "Married-civ-spouse", "Divorced", "Never-married",
  "Separated", "Widowed", "Married-spouse-absent", "Married-AF-spouse",
];
const OCCUPATION_OPTIONS = [
  "Tech-support", "Craft-repair", "Other-service", "Sales",
  "Exec-managerial", "Prof-specialty", "Handlers-cleaners",
  "Machine-op-inspct", "Adm-clerical", "Farming-fishing",
  "Transport-moving", "Priv-house-serv", "Protective-serv", "Armed-Forces",
];
const RELATIONSHIP_OPTIONS = [
  "Wife", "Own-child", "Husband", "Not-in-family", "Other-relative", "Unmarried",
];
const RACE_OPTIONS = ["White", "Asian-Pac-Islander", "Amer-Indian-Eskimo", "Other", "Black"];
const SEX_OPTIONS = ["Male", "Female"];

interface PredictionFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  loading: boolean;
}

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

  const SelectField = ({ label, field, options, sensitive }: {
    label: string; field: string; options: string[]; sensitive?: boolean;
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted flex items-center gap-1.5">
        {label}
        {sensitive && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger font-bold">
            SENSITIVE
          </span>
        )}
      </label>
      <select
        value={formData[field as keyof typeof formData]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-background border border-card-border text-sm text-foreground focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  const NumberField = ({ label, field, min, max }: {
    label: string; field: string; min: number; max: number;
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      <input
        type="number"
        value={formData[field as keyof typeof formData]}
        onChange={(e) => handleChange(field, parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        className="w-full px-3 py-2 rounded-lg bg-background border border-card-border text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
        Applicant Data
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <NumberField label="Age" field="age" min={17} max={90} />
        <SelectField label="Workclass" field="workclass" options={WORKCLASS_OPTIONS} />
        <SelectField label="Education" field="education" options={EDUCATION_OPTIONS} />
        <NumberField label="Education Rank" field="education_num" min={1} max={16} />
        <SelectField label="Marital Status" field="marital_status" options={MARITAL_OPTIONS} />
        <SelectField label="Occupation" field="occupation" options={OCCUPATION_OPTIONS} />
        <SelectField label="Relationship" field="relationship" options={RELATIONSHIP_OPTIONS} />
        <SelectField label="Race" field="race" options={RACE_OPTIONS} sensitive />
        <SelectField label="Sex" field="sex" options={SEX_OPTIONS} sensitive />
        <NumberField label="Capital Gain" field="capital_gain" min={0} max={99999} />
        <NumberField label="Capital Loss" field="capital_loss" min={0} max={9999} />
        <NumberField label="Hours/Week" field="hours_per_week" min={1} max={99} />
      </div>

      <button
        id="predict-btn"
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm bg-accent text-white hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          "Run Prediction"
        )}
      </button>
    </form>
  );
}
