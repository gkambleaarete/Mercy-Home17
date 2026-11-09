import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
} from "@/app/lib/lucide-icons";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { RiskFactorsSection } from "./RiskFactorsSection";
import { BiologicalHistorySection } from "./BiologicalHistorySection";
import { SocialHistorySection } from "./SocialHistorySection";
import { FamilyHistorySection } from "./FamilyHistorySection";
import { ACEsSection } from "./ACEsSection";
import { LegalHistorySection } from "./LegalHistorySection";
import { PhysicalHealthSection } from "./PhysicalHealthSection";
import { MentalHealthSection } from "./MentalHealthSection";
import { MentalStatusExamSection } from "./MentalStatusExamSection";
import { MedicationsHistorySection } from "./MedicationsHistorySection";

type MainSection =
  | "health-medical"
  | "social-family"
  | "risk-legal"
  | "clinical-summary";
type HealthSubSection =
  "biological" | "physical" | "mental" | "mse" | "medications";
type SocialSubSection = "social" | "family" | "aces";
type RiskSubSection = "risk" | "legal";

interface ClinicalAssessmentsViewProps {
  initialMainSection?: MainSection;
  initialSubSection?: string;
  onSectionChange?: (
    mainSection: MainSection,
    subSection?: string,
  ) => void;
}

export function ClinicalAssessmentsView({
  initialMainSection = "health-medical",
  initialSubSection = "biological",
  onSectionChange,
}: ClinicalAssessmentsViewProps = {}) {
  const [activeMainSection, setActiveMainSection] =
    useState<MainSection>(initialMainSection);
  const [activeHealthSubSection, setActiveHealthSubSection] =
    useState<HealthSubSection>(
      initialMainSection === "health-medical" &&
        initialSubSection
        ? (initialSubSection as HealthSubSection)
        : "biological",
    );
  const [activeSocialSubSection, setActiveSocialSubSection] =
    useState<SocialSubSection>(
      initialMainSection === "social-family" &&
        initialSubSection
        ? (initialSubSection as SocialSubSection)
        : "social",
    );
  const [activeRiskSubSection, setActiveRiskSubSection] =
    useState<RiskSubSection>(
      initialMainSection === "risk-legal" && initialSubSection
        ? (initialSubSection as RiskSubSection)
        : "risk",
    );
  // Clinical Summary - Long Range Placement Plan States
  const [longRangePlacementPlan, setLongRangePlacementPlan] =
    useState("");
  const [placementPlanDetails, setPlacementPlanDetails] =
    useState("");

  // Treatment Recommendations State
  const [
    residentialCareRecommendation,
    setResidentialCareRecommendation,
  ] = useState("");
  const [whyResidentialCare, setWhyResidentialCare] =
    useState("");
  const [individualTreatment, setIndividualTreatment] =
    useState("");
  const [familyTreatment, setFamilyTreatment] = useState("");
  const [milieuTreatment, setMilieuTreatment] = useState("");

  // Diagnosis Dialog state
  const [diagnosisDialogOpen, setDiagnosisDialogOpen] =
    useState(false);
  const [diagnosisSearchText, setDiagnosisSearchText] =
    useState("");
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<
    string[]
  >([]);
  const [editingDiagnosisId, setEditingDiagnosisId] = useState<
    number | null
  >(null);
  const [addedDiagnoses, setAddedDiagnoses] = useState([
    {
      id: 1,
      code: "F41.1",
      name: "Generalized Anxiety Disorder",
      source: "Dr. Sarah Johnson, Community Mental Health",
      preliminary: true,
    },
    {
      id: 2,
      code: "F33.1",
      name: "Major Depressive Disorder, Recurrent, Moderate",
      source: "Northwestern Memorial Hospital",
      preliminary: true,
    },
    {
      id: 3,
      code: "Z62.820",
      name: "Parent-Child Relational Problem",
      source: "Admissions Assessment",
      preliminary: false,
    },
  ]);

  // Comprehensive DSM Diagnosis List
  const dsmDiagnoses = [
    { code: "F41.1", name: "Generalized Anxiety Disorder" },
    { code: "F41.0", name: "Panic Disorder" },
    {
      code: "F40.10",
      name: "Social Anxiety Disorder (Social Phobia)",
    },
    { code: "F43.10", name: "Post-Traumatic Stress Disorder" },
    { code: "F42.2", name: "Obsessive-Compulsive Disorder" },
    {
      code: "F33.1",
      name: "Major Depressive Disorder, Recurrent, Moderate",
    },
    {
      code: "F33.0",
      name: "Major Depressive Disorder, Recurrent, Mild",
    },
    {
      code: "F33.2",
      name: "Major Depressive Disorder, Recurrent, Severe",
    },
    {
      code: "F32.1",
      name: "Major Depressive Disorder, Single Episode, Moderate",
    },
    { code: "F31.81", name: "Bipolar II Disorder" },
    { code: "F31.9", name: "Bipolar I Disorder" },
    {
      code: "F34.1",
      name: "Persistent Depressive Disorder (Dysthymia)",
    },
    {
      code: "F90.2",
      name: "Attention-Deficit/Hyperactivity Disorder, Combined Presentation",
    },
    {
      code: "F90.0",
      name: "Attention-Deficit/Hyperactivity Disorder, Predominantly Inattentive Presentation",
    },
    {
      code: "F90.1",
      name: "Attention-Deficit/Hyperactivity Disorder, Predominantly Hyperactive-Impulsive Presentation",
    },
    {
      code: "F91.1",
      name: "Conduct Disorder, Childhood-Onset Type",
    },
    {
      code: "F91.2",
      name: "Conduct Disorder, Adolescent-Onset Type",
    },
    { code: "F91.3", name: "Oppositional Defiant Disorder" },
    { code: "F84.0", name: "Autism Spectrum Disorder" },
    { code: "F80.9", name: "Language Disorder" },
    {
      code: "F81.0",
      name: "Specific Learning Disorder with Impairment in Reading",
    },
    {
      code: "F81.2",
      name: "Specific Learning Disorder with Impairment in Mathematics",
    },
    {
      code: "F81.81",
      name: "Specific Learning Disorder with Impairment in Written Expression",
    },
    {
      code: "F50.01",
      name: "Anorexia Nervosa, Restricting Type",
    },
    {
      code: "F50.02",
      name: "Anorexia Nervosa, Binge-Eating/Purging Type",
    },
    { code: "F50.2", name: "Bulimia Nervosa" },
    { code: "F50.81", name: "Binge-Eating Disorder" },
    { code: "F10.20", name: "Alcohol Use Disorder, Moderate" },
    { code: "F12.20", name: "Cannabis Use Disorder, Moderate" },
    {
      code: "F15.20",
      name: "Stimulant Use Disorder, Moderate",
    },
    { code: "F14.20", name: "Cocaine Use Disorder, Moderate" },
    { code: "F11.20", name: "Opioid Use Disorder, Moderate" },
    { code: "F60.3", name: "Borderline Personality Disorder" },
    { code: "F60.4", name: "Histrionic Personality Disorder" },
    {
      code: "F60.81",
      name: "Narcissistic Personality Disorder",
    },
    { code: "F60.0", name: "Paranoid Personality Disorder" },
    { code: "F60.1", name: "Schizoid Personality Disorder" },
    { code: "F20.9", name: "Schizophrenia" },
    {
      code: "F25.0",
      name: "Schizoaffective Disorder, Bipolar Type",
    },
    {
      code: "F25.1",
      name: "Schizoaffective Disorder, Depressive Type",
    },
    { code: "F22", name: "Delusional Disorder" },
    { code: "F44.81", name: "Dissociative Identity Disorder" },
    { code: "F63.81", name: "Intermittent Explosive Disorder" },
    { code: "F51.01", name: "Insomnia Disorder" },
    { code: "F51.11", name: "Hypersomnolence Disorder" },
    {
      code: "F64.1",
      name: "Gender Dysphoria in Adolescents and Adults",
    },
    {
      code: "Z62.820",
      name: "Parent-Child Relational Problem",
    },
    {
      code: "Z63.0",
      name: "Relationship Distress with Spouse or Intimate Partner",
    },
    { code: "Z65.4", name: "Victim of Crime" },
    { code: "Z60.2", name: "Problems Related to Living Alone" },
    {
      code: "Z62.898",
      name: "Child or Adolescent Antisocial Behavior",
    },
  ];

  // Filter diagnoses based on search
  const filteredDiagnoses =
    diagnosisSearchText.trim() === ""
      ? dsmDiagnoses
      : dsmDiagnoses.filter(
          (d) =>
            d.code
              .toLowerCase()
              .includes(diagnosisSearchText.toLowerCase()) ||
            d.name
              .toLowerCase()
              .includes(diagnosisSearchText.toLowerCase()),
        );

  // Handlers
  const handleOpenDiagnosisDialog = () => {
    setDiagnosisDialogOpen(true);
    setDiagnosisSearchText("");
    setSelectedDiagnoses([]);
    setEditingDiagnosisId(null);
  };

  const handleCloseDiagnosisDialog = () => {
    setDiagnosisDialogOpen(false);
    setDiagnosisSearchText("");
    setSelectedDiagnoses([]);
    setEditingDiagnosisId(null);
  };

  const handleEditDiagnosis = (id: number) => {
    const diagnosis = addedDiagnoses.find((d) => d.id === id);
    if (diagnosis) {
      setEditingDiagnosisId(id);
      setSelectedDiagnoses([diagnosis.code]);
      setDiagnosisSearchText("");
      setDiagnosisDialogOpen(true);
    }
  };

  const handleToggleDiagnosis = (code: string) => {
    // In edit mode, only allow single selection
    if (editingDiagnosisId !== null) {
      setSelectedDiagnoses([code]);
    } else {
      // In add mode, allow multiple selections
      setSelectedDiagnoses((prev) =>
        prev.includes(code)
          ? prev.filter((c) => c !== code)
          : [...prev, code],
      );
    }
  };

  const handleApplyDiagnoses = () => {
    if (editingDiagnosisId !== null) {
      // Edit mode: update existing diagnosis code only, preserve other fields
      const selectedCode = selectedDiagnoses[0];
      const diagnosis = dsmDiagnoses.find(
        (d) => d.code === selectedCode,
      );
      if (diagnosis) {
        setAddedDiagnoses((prev) =>
          prev.map((d) =>
            d.id === editingDiagnosisId
              ? {
                  ...d,
                  code: diagnosis.code,
                  name: diagnosis.name,
                }
              : d,
          ),
        );
      }
    } else {
      // Add mode: add new diagnoses with default values
      const newDiagnoses = selectedDiagnoses.map((code) => {
        const diagnosis = dsmDiagnoses.find(
          (d) => d.code === code,
        );
        return {
          id: Date.now() + Math.random(),
          code: diagnosis?.code || "",
          name: diagnosis?.name || "",
          source: "Admissions Assessment",
          preliminary: true,
        };
      });
      setAddedDiagnoses((prev) => [...prev, ...newDiagnoses]);
    }
    handleCloseDiagnosisDialog();
  };

  const handleDeleteDiagnosis = (id: number) => {
    setAddedDiagnoses((prev) =>
      prev.filter((d) => d.id !== id),
    );
  };

  const handleClearSearch = () => {
    setDiagnosisSearchText("");
  };

  // Sync state with props when they change (for sidebar navigation)
  useEffect(() => {
    if (initialMainSection) {
      setActiveMainSection(initialMainSection);
    }
  }, [initialMainSection]);

  useEffect(() => {
    if (initialSubSection) {
      if (initialMainSection === "health-medical") {
        setActiveHealthSubSection(
          initialSubSection as HealthSubSection,
        );
      } else if (initialMainSection === "social-family") {
        setActiveSocialSubSection(
          initialSubSection as SocialSubSection,
        );
      } else if (initialMainSection === "risk-legal") {
        setActiveRiskSubSection(
          initialSubSection as RiskSubSection,
        );
      }
    }
  }, [initialSubSection, initialMainSection]);

  const handleMainSectionChange = (
    section: MainSection,
    subSection?: string,
  ) => {
    setActiveMainSection(section);
    if (onSectionChange) {
      onSectionChange(section, subSection);
    }
  };

  const handleHealthSubSectionChange = (
    subSection: HealthSubSection,
  ) => {
    setActiveHealthSubSection(subSection);
    if (onSectionChange) {
      onSectionChange("health-medical", subSection);
    }
  };

  const handleSocialSubSectionChange = (
    subSection: SocialSubSection,
  ) => {
    setActiveSocialSubSection(subSection);
    if (onSectionChange) {
      onSectionChange("social-family", subSection);
    }
  };

  const handleRiskSubSectionChange = (
    subSection: RiskSubSection,
  ) => {
    setActiveRiskSubSection(subSection);
    if (onSectionChange) {
      onSectionChange("risk-legal", subSection);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Navigation removed - now in left sidebar */}

      {/* Health & Medical History Section with Sub-Tabs */}
      {activeMainSection === "health-medical" && (
        <div
          className="overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
        >
          {/* Nested Sub-Tabs for Health & Medical */}
          <div
            className="flex overflow-x-auto overflow-y-hidden border-b"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <button
              onClick={() =>
                handleHealthSubSectionChange("biological")
              }
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeHealthSubSection === "biological"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeHealthSubSection === "biological"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Biological History
            </button>
            <button
              onClick={() =>
                handleHealthSubSectionChange("physical")
              }
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeHealthSubSection === "physical"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeHealthSubSection === "physical"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Physical Health History
            </button>
            <button
              onClick={() =>
                handleHealthSubSectionChange("mental")
              }
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeHealthSubSection === "mental"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeHealthSubSection === "mental"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Mental Health History
            </button>
            <button
              onClick={() =>
                handleHealthSubSectionChange("mse")
              }
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeHealthSubSection === "mse"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeHealthSubSection === "mse"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Mental Status Exam
            </button>
            <button
              onClick={() =>
                handleHealthSubSectionChange("medications")
              }
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeHealthSubSection === "medications"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeHealthSubSection === "medications"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Medications History
            </button>
          </div>
          <div className="p-3 sm:p-6">
            {activeHealthSubSection === "biological" && (
              <BiologicalHistorySection />
            )}
            {activeHealthSubSection === "physical" && (
              <PhysicalHealthSection />
            )}
            {activeHealthSubSection === "mental" && (
              <MentalHealthSection />
            )}
            {activeHealthSubSection === "mse" && (
              <MentalStatusExamSection />
            )}
            {activeHealthSubSection === "medications" && (
              <MedicationsHistorySection />
            )}
          </div>
        </div>
      )}

      {/* Social & Family Section with Sub-Tabs */}
      {activeMainSection === "social-family" && (
        <div
          className="overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
        >
          {/* Nested Sub-Tabs */}
          <div
            className="flex overflow-x-auto overflow-y-hidden border-b"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <button
              onClick={() =>
                handleSocialSubSectionChange("social")
              }
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeSocialSubSection === "social"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeSocialSubSection === "social"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Social History
            </button>
            <button
              onClick={() =>
                handleSocialSubSectionChange("family")
              }
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeSocialSubSection === "family"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeSocialSubSection === "family"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Family History & Functioning
            </button>
            <button
              onClick={() =>
                handleSocialSubSectionChange("aces")
              }
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeSocialSubSection === "aces"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeSocialSubSection === "aces"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              ACEs
            </button>
          </div>
          <div className="p-3 sm:p-6">
            {activeSocialSubSection === "social" && (
              <SocialHistorySection />
            )}
            {activeSocialSubSection === "family" && (
              <div>
                <FamilyHistorySection />
                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    variant="outline"
                    className="h-9 px-6 text-[13px] font-medium rounded-full"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-neutral-95)",
                      color: "var(--slds-g-color-text-default)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-9 px-6 text-[13px] font-medium rounded-full"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
            {activeSocialSubSection === "aces" && (
              <ACEsSection />
            )}
          </div>
        </div>
      )}

      {/* Risk & Legal Section with Sub-Tabs */}
      {activeMainSection === "risk-legal" && (
        <div
          className="overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
        >
          {/* Nested Sub-Tabs */}
          <div
            className="flex overflow-x-auto overflow-y-hidden border-b"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-alt)",
            }}
          >
            <button
              onClick={() => handleRiskSubSectionChange("risk")}
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeRiskSubSection === "risk"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeRiskSubSection === "risk"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Risk Factors
            </button>
            <button
              onClick={() =>
                handleRiskSubSectionChange("legal")
              }
              className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                activeRiskSubSection === "legal"
                  ? "text-[#145F33]"
                  : "text-[#706e6b] hover:text-[#080707]"
              }`}
              style={
                activeRiskSubSection === "legal"
                  ? {
                      borderBottom: "3px solid #145F33",
                      marginBottom: "-1px",
                    }
                  : {}
              }
            >
              Legal History
            </button>
          </div>
          <div className="p-3 sm:p-6">
            {activeRiskSubSection === "risk" && (
              <RiskFactorsSection />
            )}
            {activeRiskSubSection === "legal" && (
              <div>
                <LegalHistorySection />
                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    variant="outline"
                    className="h-9 px-6 text-[13px] font-medium rounded-full"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-neutral-95)",
                      color: "var(--slds-g-color-text-default)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-9 px-6 text-[13px] font-medium rounded-full"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clinical Summary Section (Standalone) */}
      {activeMainSection === "clinical-summary" && (
        <div
          className="overflow-hidden"
          style={{
            border:
              "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "var(--slds-c-card-radius-border)",
            backgroundColor:
              "var(--slds-g-color-background-base)",
          }}
        >
          <div className="p-3 sm:p-6">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3
                  className="text-[13px] font-semibold mb-1"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Initial Positive Transition Plan Discussion
                </h3>
                <p
                  className="text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Complete this form to document the initial
                  transition planning discussion
                </p>
              </div>

              {/* Long Range Placement Plan */}
              <div>
                <Label
                  htmlFor="placement-plan"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Long Range Placement Plan
                </Label>
                <Select
                  value={longRangePlacementPlan}
                  onValueChange={(value) => {
                    setLongRangePlacementPlan(value);
                    if (!value) {
                      setPlacementPlanDetails("");
                    }
                  }}
                >
                  <SelectTrigger
                    id="placement-plan"
                    className="text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Select placement plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independence">
                      Independence
                    </SelectItem>
                    <SelectItem value="parent-guardian">
                      Parent/Guardian
                    </SelectItem>
                    <SelectItem value="other-family-member">
                      Other Family Member
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Long Range Placement Plan Details - Conditional */}
              {longRangePlacementPlan && (
                <div>
                  <Label
                    htmlFor="placement-plan-details"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Placement Plan Details
                  </Label>
                  <Textarea
                    id="placement-plan-details"
                    value={placementPlanDetails}
                    onChange={(e) =>
                      setPlacementPlanDetails(e.target.value)
                    }
                    className="text-[13px] rounded min-h-[100px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                    placeholder="Enter additional details about the placement plan..."
                  />
                </div>
              )}

              {/* Youth PTP Statement */}
              <div>
                <Label
                  htmlFor="youth-ptp-statement"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Youth PTP Statement
                </Label>
                <Textarea
                  id="youth-ptp-statement"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                  placeholder="Enter the youth's statement about their transition plan..."
                />
              </div>

              {/* Youth Time Estimate */}
              <div>
                <Label
                  htmlFor="youth-time-estimate"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  How long does youth believe it will take to
                  accomplish the PTP?
                </Label>
                <Select>
                  <SelectTrigger
                    id="youth-time-estimate"
                    className="text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Select time estimate..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3-months">
                      1-3 Months
                    </SelectItem>
                    <SelectItem value="4-6-months">
                      4-6 Months
                    </SelectItem>
                    <SelectItem value="7-9-months">
                      7-9 Months
                    </SelectItem>
                    <SelectItem value="10-12-months">
                      10-12 Months
                    </SelectItem>
                    <SelectItem value="greater-than-one-year">
                      Greater Than One Year
                    </SelectItem>
                    <SelectItem value="unsure">
                      Unsure
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Caregiver PTP Statement */}
              <div>
                <Label
                  htmlFor="caregiver-ptp-statement"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Caregiver PTP Statement
                </Label>
                <Textarea
                  id="caregiver-ptp-statement"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                  placeholder="Enter the caregiver's statement about the transition plan..."
                />
              </div>

              {/* Caregiver Time Estimate */}
              <div>
                <Label
                  htmlFor="caregiver-time-estimate"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  How long does caregiver believe it will take
                  to accomplish the PTP?
                </Label>
                <Select>
                  <SelectTrigger
                    id="caregiver-time-estimate"
                    className="text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Select time estimate..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-3-months">
                      1-3 Months
                    </SelectItem>
                    <SelectItem value="3-6-months">
                      3-6 Months
                    </SelectItem>
                    <SelectItem value="6-12-months">
                      6-12 Months
                    </SelectItem>
                    <SelectItem value="12-18-months">
                      12-18 Months
                    </SelectItem>
                    <SelectItem value="18-24-months">
                      18-24 Months
                    </SelectItem>
                    <SelectItem value="2-years-plus">
                      2+ Years
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* What will be hardest */}
              <div>
                <Label
                  htmlFor="hardest-part"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  What does caregiver think will be hardest for
                  youth about coming to Mercy Home?
                </Label>
                <Textarea
                  id="hardest-part"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                  placeholder="Describe the anticipated challenges..."
                />
              </div>

              {/* What will be most enjoyable */}
              <div>
                <Label
                  htmlFor="enjoyable-part"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  What does caregiver think youth will enjoy
                  most about coming to Mercy Home?
                </Label>
                <Textarea
                  id="enjoyable-part"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                  placeholder="Describe the positive aspects and opportunities..."
                />
              </div>

              {/* Clinical Impressions Section */}
              <div
                className="pt-6 mt-6"
                style={{
                  borderTop:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <h4
                  className="text-[14px] font-semibold mb-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Clinical Impressions
                </h4>

                {/* Youth's motivation and willingness for change */}
                <div className="mb-4">
                  <Label
                    htmlFor="youth-motivation"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Youth's motivation and willingness for
                    change:
                  </Label>
                  <Select>
                    <SelectTrigger
                      id="youth-motivation"
                      className="text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-motivated">
                        Very Motivated
                      </SelectItem>
                      <SelectItem value="motivated">
                        Motivated
                      </SelectItem>
                      <SelectItem value="somewhat-motivated">
                        Somewhat Motivated
                      </SelectItem>
                      <SelectItem value="minimally-motivated">
                        Minimally Motivated
                      </SelectItem>
                      <SelectItem value="not-motivated">
                        Not Motivated
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Parent/Guardian's motivation and willingness for change */}
                <div className="mb-4">
                  <Label
                    htmlFor="parent-motivation"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Parent/Guardian's motivation and willingness
                    for change:
                  </Label>
                  <Select>
                    <SelectTrigger
                      id="parent-motivation"
                      className="text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <SelectValue placeholder="Please Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-motivated">
                        Very Motivated
                      </SelectItem>
                      <SelectItem value="motivated">
                        Motivated
                      </SelectItem>
                      <SelectItem value="somewhat-motivated">
                        Somewhat Motivated
                      </SelectItem>
                      <SelectItem value="minimally-motivated">
                        Minimally Motivated
                      </SelectItem>
                      <SelectItem value="not-motivated">
                        Not Motivated
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clinical Impressions textarea */}
                <div>
                  <Label
                    htmlFor="clinical-impressions"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Clinical Impressions:
                  </Label>
                  <Textarea
                    id="clinical-impressions"
                    className="text-[13px] rounded min-h-[150px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                    placeholder="Enter clinical impressions..."
                  />
                </div>
              </div>

              {/* Admissions Provisional Diagnosis Section */}
              <div
                className="pt-6 mt-6"
                style={{
                  borderTop:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <h4
                  className="text-[14px] font-semibold mb-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Admissions Provisional Diagnosis
                </h4>

                {/* Diagnoses subsection */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label
                      className="text-[12px] font-semibold uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Diagnoses ({addedDiagnoses.length})
                    </Label>
                    <Button
                      size="sm"
                      onClick={handleOpenDiagnosisDialog}
                      className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Diagnosis
                    </Button>
                  </div>

                  {/* DSM Code Table */}
                  <div
                    className="rounded overflow-hidden"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <th
                            className="text-left px-3 py-2 text-[11px] font-semibold uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            DSM Code & Diagnosis
                          </th>
                          <th
                            className="text-left px-3 py-2 text-[11px] font-semibold uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Source
                          </th>
                          <th
                            className="text-left px-3 py-2 text-[11px] font-semibold uppercase"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Preliminary
                          </th>
                          <th
                            className="text-left px-3 py-2 text-[11px] font-semibold uppercase w-20"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {addedDiagnoses.map(
                          (diagnosis, index) => {
                            return (
                              <tr
                                key={diagnosis.id}
                                style={{
                                  borderBottom:
                                    index <
                                    addedDiagnoses.length - 1
                                      ? "1px solid var(--slds-g-color-border-base-1)"
                                      : "none",
                                }}
                              >
                                <td
                                  className="px-3 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  <div>
                                    <span className="font-medium">
                                      {diagnosis.code}
                                    </span>
                                    <span className="mx-2">
                                      —
                                    </span>
                                    <span>
                                      {diagnosis.name}
                                    </span>
                                  </div>
                                </td>
                                <td
                                  className="px-3 py-3"
                                  style={{
                                    color:
                                      "var(--slds-g-color-text-default)",
                                  }}
                                >
                                  {diagnosis.source || "—"}
                                </td>
                                <td className="px-3 py-3">
                                  {diagnosis.preliminary ? (
                                    <Badge className="bg-[#145F33] bg-opacity-10 text-[#145F33] border border-[#145F33] border-opacity-30 rounded-sm">
                                      Preliminary
                                    </Badge>
                                  ) : (
                                    <span
                                      style={{
                                        color:
                                          "var(--slds-g-color-text-weak)",
                                      }}
                                    >
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        handleEditDiagnosis(
                                          diagnosis.id,
                                        )
                                      }
                                      className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                      title="Edit"
                                    >
                                      <Pencil
                                        className="h-3.5 w-3.5"
                                        style={{
                                          color:
                                            "var(--slds-g-color-text-weak)",
                                        }}
                                      />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteDiagnosis(
                                          diagnosis.id,
                                        )
                                      }
                                      className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Details textarea */}
                <div>
                  <Label
                    htmlFor="diagnosis-details"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Details:
                  </Label>
                  <Textarea
                    id="diagnosis-details"
                    className="text-[13px] rounded min-h-[150px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                    placeholder="Enter diagnosis details..."
                  />
                </div>
              </div>

              {/* Treatment Recommendations Section */}
              <div
                className="pt-6 mt-6"
                style={{
                  borderTop:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <h4
                  className="text-[14px] font-semibold mb-4"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Treatment Recommendations
                </h4>

                <div>
                  <Label
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Do you recommend this youth for Residential
                    Care at Mercy Home?
                  </Label>
                  <RadioGroup
                    className="gap-2"
                    value={residentialCareRecommendation}
                    onValueChange={
                      setResidentialCareRecommendation
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="yes"
                        id="residential-yes"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      />
                      <Label
                        htmlFor="residential-yes"
                        className="text-[13px] font-normal cursor-pointer"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="no"
                        id="residential-no"
                        style={{
                          borderColor:
                            "var(--slds-g-color-border-base-1)",
                        }}
                      />
                      <Label
                        htmlFor="residential-no"
                        className="text-[13px] font-normal cursor-pointer"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Conditional fields when "Yes" is selected */}
                {residentialCareRecommendation === "yes" && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label
                        htmlFor="why-residential"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Why Clinician feels Residential Care is
                        appropriate for this youth:
                      </Label>
                      <Textarea
                        id="why-residential"
                        value={whyResidentialCare}
                        onChange={(e) =>
                          setWhyResidentialCare(e.target.value)
                        }
                        className="text-[13px] rounded min-h-[100px]"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                        placeholder="Enter explanation..."
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="individual-treatment"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Individual:
                      </Label>
                      <Textarea
                        id="individual-treatment"
                        value={individualTreatment}
                        onChange={(e) =>
                          setIndividualTreatment(e.target.value)
                        }
                        className="text-[13px] rounded min-h-[100px]"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                        placeholder="Enter individual treatment details..."
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="family-treatment"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Family:
                      </Label>
                      <Textarea
                        id="family-treatment"
                        value={familyTreatment}
                        onChange={(e) =>
                          setFamilyTreatment(e.target.value)
                        }
                        className="text-[13px] rounded min-h-[100px]"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                        placeholder="Enter family treatment details..."
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="milieu-treatment"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Milieu:
                      </Label>
                      <Textarea
                        id="milieu-treatment"
                        value={milieuTreatment}
                        onChange={(e) =>
                          setMilieuTreatment(e.target.value)
                        }
                        className="text-[13px] rounded min-h-[100px]"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                        placeholder="Enter milieu treatment details..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  className="h-9 px-6 text-[13px] font-medium rounded-full"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-neutral-95)",
                    color: "var(--slds-g-color-text-default)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="h-9 px-6 text-[13px] font-medium rounded-full"
                  style={{
                    backgroundColor: "#145F33",
                    color: "white",
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Selection Dialog */}
      <Dialog
        open={diagnosisDialogOpen}
        onOpenChange={setDiagnosisDialogOpen}
      >
        <DialogContent size="xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editingDiagnosisId !== null
                ? "Edit Diagnosis"
                : "Add Diagnosis"}
            </DialogTitle>
            <DialogDescription>
              {editingDiagnosisId !== null
                ? "Select a new diagnosis to replace the current one."
                : "Search and select diagnoses from the DSM library to add to the patient's record."}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4 bg-white">
            {/* Search Section */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#706e6b]" />
                <Input
                  value={diagnosisSearchText}
                  onChange={(e) =>
                    setDiagnosisSearchText(e.target.value)
                  }
                  placeholder="Search by DSM code or diagnosis name..."
                  className="pl-9 h-9 text-[13px] rounded border-[#dddbda]"
                />
              </div>
              <Button
                onClick={() =>
                  setDiagnosisSearchText(diagnosisSearchText)
                }
                className="h-9 px-4 text-[13px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              >
                Find
              </Button>
              <Button
                onClick={handleClearSearch}
                variant="outline"
                className="h-9 px-4 text-[13px] rounded-full border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
              >
                Clear
              </Button>
            </div>

            {/* Scrollable Diagnosis Table */}
            <div className="flex-1 overflow-auto rounded border border-[#dddbda]">
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 bg-[#fafaf9]">
                  <tr>
                    <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase w-12 border-b border-[#dddbda] text-[#706e6b]">
                      Select
                    </th>
                    <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase border-b border-[#dddbda] text-[#706e6b]">
                      DSM Code & Diagnosis
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDiagnoses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-8 text-center text-[13px] text-[#706e6b]"
                      >
                        No diagnoses found matching your search
                      </td>
                    </tr>
                  ) : (
                    filteredDiagnoses.map(
                      (diagnosis, index) => (
                        <tr
                          key={diagnosis.code}
                          className="hover:bg-[#f3f2f2] cursor-pointer border-b border-[#dddbda] last:border-b-0"
                          onClick={() =>
                            handleToggleDiagnosis(
                              diagnosis.code,
                            )
                          }
                        >
                          <td className="px-3 py-3">
                            <Checkbox
                              checked={selectedDiagnoses.includes(
                                diagnosis.code,
                              )}
                              onCheckedChange={() =>
                                handleToggleDiagnosis(
                                  diagnosis.code,
                                )
                              }
                            />
                          </td>
                          <td className="px-3 py-3">
                            <div>
                              <span className="font-medium text-[#080707]">
                                {diagnosis.code}
                              </span>
                              <span className="mx-2 text-[#706e6b]">
                                —
                              </span>
                              <span className="text-[#3e3e3c]">
                                {diagnosis.name}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ),
                    )
                  )}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="gap-2 flex items-center justify-between">
            <div className="text-[13px] text-[#706e6b]">
              {editingDiagnosisId !== null
                ? "1 diagnosis selected"
                : `${selectedDiagnoses.length} diagnosis${selectedDiagnoses.length !== 1 ? "es" : ""} selected`}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCloseDiagnosisDialog}
                className="h-9 px-4 text-[13px] rounded-full border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyDiagnoses}
                disabled={selectedDiagnoses.length === 0}
                className="h-9 px-4 text-[13px] rounded-full shadow-none"
                style={{
                  backgroundColor:
                    selectedDiagnoses.length > 0
                      ? "#145F33"
                      : "#dddbda",
                  color:
                    selectedDiagnoses.length > 0
                      ? "white"
                      : "#706e6b",
                  cursor:
                    selectedDiagnoses.length > 0
                      ? "pointer"
                      : "not-allowed",
                  opacity:
                    selectedDiagnoses.length > 0 ? 1 : 0.6,
                }}
              >
                {editingDiagnosisId !== null
                  ? "Update"
                  : "Apply"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}