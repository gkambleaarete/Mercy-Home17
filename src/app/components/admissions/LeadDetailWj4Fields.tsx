import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Upload } from "@/app/lib/lucide-icons";

interface LeadDetailWj4FieldsProps {
  testingFormData: any;
  wj4FormData: any;
  wj4FormErrors: any;
  wj4GradeFormData: any;
  wj4GradeFormErrors: any;
  setWj4FormData: any;
  setWj4GradeFormData: any;
  handleWj4AgeEquivalencyChange: any;
  handleWj4GradeEquivalencyChange: any;
  handleWj4GradePercentileChange: any;
  handleWj4GradeRPIChange: any;
  handleWj4PercentileChange: any;
  handleWj4RPIChange: any;
}

export function LeadDetailWj4Fields({
  testingFormData,
  wj4FormData,
  wj4FormErrors,
  wj4GradeFormData,
  wj4GradeFormErrors,
  setWj4FormData,
  setWj4GradeFormData,
  handleWj4AgeEquivalencyChange,
  handleWj4GradeEquivalencyChange,
  handleWj4GradePercentileChange,
  handleWj4GradeRPIChange,
  handleWj4PercentileChange,
  handleWj4RPIChange,
}: LeadDetailWj4FieldsProps) {
  return (
    <>
      {/* WJ-4-Specific Fields — shown only when WJ-4 is selected */}
      {testingFormData.test === "WJ-4" && (
        <div className="space-y-6">
          {/* WJ-4 Data Grid Header */}
          <div>
            <h3
              className="text-[13px] font-semibold mb-4 uppercase"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              WJ-4 Assessment Data
            </h3>

            {/* Grid: 4 rows x 3 columns */}
            <div className="space-y-6">
              {/* Row 1: Broad Achievement */}
              <div>
                <h4
                  className="text-[12px] font-semibold mb-3 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Broad Achievement
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="wj4-ba-ae"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Age Equivalency
                    </Label>
                    <Input
                      id="wj4-ba-ae"
                      type="text"
                      value={wj4FormData.broadAchievementAE}
                      onChange={(e) =>
                        handleWj4AgeEquivalencyChange(
                          "broadAchievementAE",
                          e.target.value,
                        )
                      }
                      placeholder="Years-Months (e.g., 12-06)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadAchievementAE ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadAchievementAE && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadAchievementAE}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4-ba-rpi"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      RPI
                    </Label>
                    <Input
                      id="wj4-ba-rpi"
                      type="text"
                      value={wj4FormData.broadAchievementRPI}
                      onChange={(e) =>
                        handleWj4RPIChange(
                          "broadAchievementRPI",
                          e.target.value,
                        )
                      }
                      placeholder="Value/90 (e.g., 85/90)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadAchievementRPI ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadAchievementRPI && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadAchievementRPI}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4-ba-percentile"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Percentile
                    </Label>
                    <Input
                      id="wj4-ba-percentile"
                      type="text"
                      value={
                        wj4FormData.broadAchievementPercentile
                      }
                      onChange={(e) =>
                        handleWj4PercentileChange(
                          "broadAchievementPercentile",
                          e.target.value,
                        )
                      }
                      placeholder="0.01 - 100.00"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadAchievementPercentile ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadAchievementPercentile && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {
                          wj4FormErrors.broadAchievementPercentile
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Broad Reading */}
              <div>
                <h4
                  className="text-[12px] font-semibold mb-3 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Broad Reading
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="wj4-br-ae"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Age Equivalency
                    </Label>
                    <Input
                      id="wj4-br-ae"
                      type="text"
                      value={wj4FormData.broadReadingAE}
                      onChange={(e) =>
                        handleWj4AgeEquivalencyChange(
                          "broadReadingAE",
                          e.target.value,
                        )
                      }
                      placeholder="Years-Months (e.g., 12-06)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadReadingAE ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadReadingAE && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadReadingAE}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4-br-rpi"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      RPI
                    </Label>
                    <Input
                      id="wj4-br-rpi"
                      type="text"
                      value={wj4FormData.broadReadingRPI}
                      onChange={(e) =>
                        handleWj4RPIChange(
                          "broadReadingRPI",
                          e.target.value,
                        )
                      }
                      placeholder="Value/90 (e.g., 85/90)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadReadingRPI ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadReadingRPI && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadReadingRPI}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4-br-percentile"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Percentile
                    </Label>
                    <Input
                      id="wj4-br-percentile"
                      type="text"
                      value={wj4FormData.broadReadingPercentile}
                      onChange={(e) =>
                        handleWj4PercentileChange(
                          "broadReadingPercentile",
                          e.target.value,
                        )
                      }
                      placeholder="0.01 - 100.00"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadReadingPercentile ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadReadingPercentile && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadReadingPercentile}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Broad Math */}
              <div>
                <h4
                  className="text-[12px] font-semibold mb-3 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Broad Math
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="wj4-bm-ae"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Age Equivalency
                    </Label>
                    <Input
                      id="wj4-bm-ae"
                      type="text"
                      value={wj4FormData.broadMathAE}
                      onChange={(e) =>
                        handleWj4AgeEquivalencyChange(
                          "broadMathAE",
                          e.target.value,
                        )
                      }
                      placeholder="Years-Months (e.g., 12-06)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadMathAE ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadMathAE && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadMathAE}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4-bm-rpi"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      RPI
                    </Label>
                    <Input
                      id="wj4-bm-rpi"
                      type="text"
                      value={wj4FormData.broadMathRPI}
                      onChange={(e) =>
                        handleWj4RPIChange(
                          "broadMathRPI",
                          e.target.value,
                        )
                      }
                      placeholder="Value/90 (e.g., 85/90)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadMathRPI ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadMathRPI && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadMathRPI}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4-bm-percentile"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Percentile
                    </Label>
                    <Input
                      id="wj4-bm-percentile"
                      type="text"
                      value={wj4FormData.broadMathPercentile}
                      onChange={(e) =>
                        handleWj4PercentileChange(
                          "broadMathPercentile",
                          e.target.value,
                        )
                      }
                      placeholder="0.01 - 100.00"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadMathPercentile ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadMathPercentile && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadMathPercentile}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 4: Broad Written Language */}
              <div>
                <h4
                  className="text-[12px] font-semibold mb-3 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Broad Written Language
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="wj4-bwl-ae"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Age Equivalency
                    </Label>
                    <Input
                      id="wj4-bwl-ae"
                      type="text"
                      value={wj4FormData.broadWrittenLanguageAE}
                      onChange={(e) =>
                        handleWj4AgeEquivalencyChange(
                          "broadWrittenLanguageAE",
                          e.target.value,
                        )
                      }
                      placeholder="Years-Months (e.g., 12-06)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadWrittenLanguageAE ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadWrittenLanguageAE && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadWrittenLanguageAE}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4-bwl-rpi"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      RPI
                    </Label>
                    <Input
                      id="wj4-bwl-rpi"
                      type="text"
                      value={
                        wj4FormData.broadWrittenLanguageRPI
                      }
                      onChange={(e) =>
                        handleWj4RPIChange(
                          "broadWrittenLanguageRPI",
                          e.target.value,
                        )
                      }
                      placeholder="Value/90 (e.g., 85/90)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadWrittenLanguageRPI ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadWrittenLanguageRPI && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4FormErrors.broadWrittenLanguageRPI}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4-bwl-percentile"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Percentile
                    </Label>
                    <Input
                      id="wj4-bwl-percentile"
                      type="text"
                      value={
                        wj4FormData.broadWrittenLanguagePercentile
                      }
                      onChange={(e) =>
                        handleWj4PercentileChange(
                          "broadWrittenLanguagePercentile",
                          e.target.value,
                        )
                      }
                      placeholder="0.01 - 100.00"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4FormErrors.broadWrittenLanguagePercentile ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4FormErrors.broadWrittenLanguagePercentile && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {
                          wj4FormErrors.broadWrittenLanguagePercentile
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commentary */}
          <div>
            <Label
              htmlFor="wj4-commentary"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Commentary
            </Label>
            <Textarea
              id="wj4-commentary"
              value={wj4FormData.commentary}
              onChange={(e) =>
                setWj4FormData((prev) => ({
                  ...prev,
                  commentary: e.target.value,
                }))
              }
              placeholder="Enter any additional notes or commentary..."
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
            />
          </div>

          {/* Document Upload */}
          <div>
            <Label
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Document
            </Label>
            <div
              className="border-2 border-dashed rounded p-6 text-center"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <Upload
                className="mx-auto h-8 w-8 mb-2"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <p
                className="text-[13px] mb-2"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Drag and drop test report here, or click to
                browse
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-8 px-4 rounded-full text-[12px]"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                Choose File
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* WJ-4 (Grade)-Specific Fields — shown only when WJ-4 (Grade) is selected */}
      {testingFormData.test === "WJ-4 (Grade)" && (
        <div className="space-y-6">
          {/* WJ-4 (Grade) Data Grid Header */}
          <div>
            <h3
              className="text-[13px] font-semibold mb-4 uppercase"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              WJ-4 (Grade) Assessment Data
            </h3>

            {/* Grid: 4 rows x 3 columns */}
            <div className="space-y-6">
              {/* Row 1: Broad Achievement */}
              <div>
                <h4
                  className="text-[12px] font-semibold mb-3 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Broad Achievement
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="wj4g-ba-ge"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Grade Equivalency
                    </Label>
                    <Input
                      id="wj4g-ba-ge"
                      type="text"
                      value={
                        wj4GradeFormData.broadAchievementGE
                      }
                      onChange={(e) =>
                        handleWj4GradeEquivalencyChange(
                          "broadAchievementGE",
                          e.target.value,
                        )
                      }
                      placeholder="0 - 17.9"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadAchievementGE ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadAchievementGE && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4GradeFormErrors.broadAchievementGE}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4g-ba-rpi"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      RPI
                    </Label>
                    <Input
                      id="wj4g-ba-rpi"
                      type="text"
                      value={
                        wj4GradeFormData.broadAchievementRPI
                      }
                      onChange={(e) =>
                        handleWj4GradeRPIChange(
                          "broadAchievementRPI",
                          e.target.value,
                        )
                      }
                      placeholder="Value/90 (e.g., 85/90)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadAchievementRPI ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadAchievementRPI && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4GradeFormErrors.broadAchievementRPI}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4g-ba-percentile"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Percentile
                    </Label>
                    <Input
                      id="wj4g-ba-percentile"
                      type="text"
                      value={
                        wj4GradeFormData.broadAchievementPercentile
                      }
                      onChange={(e) =>
                        handleWj4GradePercentileChange(
                          "broadAchievementPercentile",
                          e.target.value,
                        )
                      }
                      placeholder="0.01 - 100.00"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadAchievementPercentile ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadAchievementPercentile && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {
                          wj4GradeFormErrors.broadAchievementPercentile
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div
                className="border-t"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              />

              {/* Row 2: Broad Reading */}
              <div>
                <h4
                  className="text-[12px] font-semibold mb-3 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Broad Reading
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="wj4g-br-ge"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Grade Equivalency
                    </Label>
                    <Input
                      id="wj4g-br-ge"
                      type="text"
                      value={wj4GradeFormData.broadReadingGE}
                      onChange={(e) =>
                        handleWj4GradeEquivalencyChange(
                          "broadReadingGE",
                          e.target.value,
                        )
                      }
                      placeholder="0 - 17.9"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadReadingGE ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadReadingGE && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4GradeFormErrors.broadReadingGE}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4g-br-rpi"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      RPI
                    </Label>
                    <Input
                      id="wj4g-br-rpi"
                      type="text"
                      value={wj4GradeFormData.broadReadingRPI}
                      onChange={(e) =>
                        handleWj4GradeRPIChange(
                          "broadReadingRPI",
                          e.target.value,
                        )
                      }
                      placeholder="Value/90 (e.g., 85/90)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadReadingRPI ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadReadingRPI && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4GradeFormErrors.broadReadingRPI}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4g-br-percentile"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Percentile
                    </Label>
                    <Input
                      id="wj4g-br-percentile"
                      type="text"
                      value={
                        wj4GradeFormData.broadReadingPercentile
                      }
                      onChange={(e) =>
                        handleWj4GradePercentileChange(
                          "broadReadingPercentile",
                          e.target.value,
                        )
                      }
                      placeholder="0.01 - 100.00"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadReadingPercentile ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadReadingPercentile && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {
                          wj4GradeFormErrors.broadReadingPercentile
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div
                className="border-t"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              />

              {/* Row 3: Broad Math */}
              <div>
                <h4
                  className="text-[12px] font-semibold mb-3 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Broad Math
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="wj4g-bm-ge"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Grade Equivalency
                    </Label>
                    <Input
                      id="wj4g-bm-ge"
                      type="text"
                      value={wj4GradeFormData.broadMathGE}
                      onChange={(e) =>
                        handleWj4GradeEquivalencyChange(
                          "broadMathGE",
                          e.target.value,
                        )
                      }
                      placeholder="0 - 17.9"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadMathGE ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadMathGE && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4GradeFormErrors.broadMathGE}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4g-bm-rpi"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      RPI
                    </Label>
                    <Input
                      id="wj4g-bm-rpi"
                      type="text"
                      value={wj4GradeFormData.broadMathRPI}
                      onChange={(e) =>
                        handleWj4GradeRPIChange(
                          "broadMathRPI",
                          e.target.value,
                        )
                      }
                      placeholder="Value/90 (e.g., 85/90)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadMathRPI ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadMathRPI && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4GradeFormErrors.broadMathRPI}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4g-bm-percentile"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Percentile
                    </Label>
                    <Input
                      id="wj4g-bm-percentile"
                      type="text"
                      value={
                        wj4GradeFormData.broadMathPercentile
                      }
                      onChange={(e) =>
                        handleWj4GradePercentileChange(
                          "broadMathPercentile",
                          e.target.value,
                        )
                      }
                      placeholder="0.01 - 100.00"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadMathPercentile ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadMathPercentile && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {wj4GradeFormErrors.broadMathPercentile}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div
                className="border-t"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                }}
              />

              {/* Row 4: Broad Written Language */}
              <div>
                <h4
                  className="text-[12px] font-semibold mb-3 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Broad Written Language
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="wj4g-bwl-ge"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Grade Equivalency
                    </Label>
                    <Input
                      id="wj4g-bwl-ge"
                      type="text"
                      value={
                        wj4GradeFormData.broadWrittenLanguageGE
                      }
                      onChange={(e) =>
                        handleWj4GradeEquivalencyChange(
                          "broadWrittenLanguageGE",
                          e.target.value,
                        )
                      }
                      placeholder="0 - 17.9"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadWrittenLanguageGE ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadWrittenLanguageGE && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {
                          wj4GradeFormErrors.broadWrittenLanguageGE
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4g-bwl-rpi"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      RPI
                    </Label>
                    <Input
                      id="wj4g-bwl-rpi"
                      type="text"
                      value={
                        wj4GradeFormData.broadWrittenLanguageRPI
                      }
                      onChange={(e) =>
                        handleWj4GradeRPIChange(
                          "broadWrittenLanguageRPI",
                          e.target.value,
                        )
                      }
                      placeholder="Value/90 (e.g., 85/90)"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadWrittenLanguageRPI ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadWrittenLanguageRPI && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {
                          wj4GradeFormErrors.broadWrittenLanguageRPI
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="wj4g-bwl-percentile"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Percentile
                    </Label>
                    <Input
                      id="wj4g-bwl-percentile"
                      type="text"
                      value={
                        wj4GradeFormData.broadWrittenLanguagePercentile
                      }
                      onChange={(e) =>
                        handleWj4GradePercentileChange(
                          "broadWrittenLanguagePercentile",
                          e.target.value,
                        )
                      }
                      placeholder="0.01 - 100.00"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border: `1px solid ${wj4GradeFormErrors.broadWrittenLanguagePercentile ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                    {wj4GradeFormErrors.broadWrittenLanguagePercentile && (
                      <p className="text-[12px] text-red-600 mt-1">
                        {
                          wj4GradeFormErrors.broadWrittenLanguagePercentile
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commentary */}
          <div>
            <Label
              htmlFor="wj4g-commentary"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Commentary
            </Label>
            <Textarea
              id="wj4g-commentary"
              value={wj4GradeFormData.commentary}
              onChange={(e) =>
                setWj4GradeFormData((prev) => ({
                  ...prev,
                  commentary: e.target.value,
                }))
              }
              placeholder="Enter any additional notes or commentary..."
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
            />
          </div>

          {/* Document Upload */}
          <div>
            <Label
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Document
            </Label>
            <div
              className="border-2 border-dashed rounded p-6 text-center"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-alt)",
              }}
            >
              <Upload
                className="mx-auto h-8 w-8 mb-2"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              />
              <p
                className="text-[13px] mb-2"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Drag and drop test report here, or click to
                browse
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-8 px-4 rounded-full text-[12px]"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                Choose File
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}