import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export function EducationCareerView() {
    // Academic form state
    const [schoolType, setSchoolType] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [academicStand, setAcademicStand] = useState("Good");
    const [grade, setGrade] = useState("Grade 10");
    const [testScore, setTestScore] = useState("85");
    const [youthEnrolled, setYouthEnrolled] = useState("yes");
    const [iep, setIep] = useState("yes");
    const [specialReasons, setSpecialReasons] = useState("No");
    const [needsAdultEd, setNeedsAdultEd] = useState("no");
    const [adultEdNumber, setAdultEdNumber] = useState("200");
    const [notes, setNotes] = useState("");

    return (
        <div className="space-y-6 w-full">
            {/* Horizontal Navigation Tabs */}
            <div 
              className="overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: 'var(--slds-c-card-radius-border)',
                backgroundColor: 'var(--slds-g-color-background-base)'
              }}
            >

                <div className="p-3 sm:p-6">
                    {/* Academic Tab Content */}
                    <div className="space-y-6">
                            {/* School Type Radio Buttons */}
                            <div>
                                <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    School Type
                                </Label>
                                <RadioGroup value={schoolType} onValueChange={setSchoolType}>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="constituent" id="school-constituent" />
                                            <Label htmlFor="school-constituent" className="text-[13px] cursor-pointer">Constituent</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="other" id="school-other" />
                                            <Label htmlFor="school-other" className="text-[13px] cursor-pointer">Other</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Current/Most Recent School */}
                                <div>
                                    <Label htmlFor="schoolName" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Current/Most Recent School
                                    </Label>
                                    <Select value={schoolName} onValueChange={setSchoolName}>
                                        <SelectTrigger 
                                          id="schoolName"
                                          className="text-[13px] rounded"
                                          style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            color: 'var(--slds-g-color-text-default)'
                                          }}
                                        >
                                            <SelectValue placeholder="Select school..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lincoln-high">Lincoln High School</SelectItem>
                                            <SelectItem value="roosevelt-academy">Roosevelt Academy</SelectItem>
                                            <SelectItem value="washington-prep">Washington Prep</SelectItem>
                                            <SelectItem value="jefferson-alternative">Jefferson Alternative School</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Grade */}
                                <div>
                                    <Label htmlFor="grade" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Grade
                                    </Label>
                                    <Select value={grade} onValueChange={setGrade}>
                                        <SelectTrigger 
                                          id="grade"
                                          className="text-[13px] rounded"
                                          style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            color: 'var(--slds-g-color-text-default)'
                                          }}
                                        >
                                            <SelectValue placeholder="Select grade..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Kindergarden">Kindergarden</SelectItem>
                                            <SelectItem value="Grade 1">Grade 1</SelectItem>
                                            <SelectItem value="Grade 2">Grade 2</SelectItem>
                                            <SelectItem value="Grade 3">Grade 3</SelectItem>
                                            <SelectItem value="Grade 4">Grade 4</SelectItem>
                                            <SelectItem value="Grade 5">Grade 5</SelectItem>
                                            <SelectItem value="Grade 6">Grade 6</SelectItem>
                                            <SelectItem value="Grade 7">Grade 7</SelectItem>
                                            <SelectItem value="Grade 8">Grade 8</SelectItem>
                                            <SelectItem value="Grade 9">Grade 9</SelectItem>
                                            <SelectItem value="Grade 10">Grade 10</SelectItem>
                                            <SelectItem value="Grade 11">Grade 11</SelectItem>
                                            <SelectItem value="Grade 12">Grade 12</SelectItem>
                                            <SelectItem value="Post Secondary">Post Secondary</SelectItem>
                                            <SelectItem value="Grade 13">Grade 13</SelectItem>
                                            <SelectItem value="Grade 14">Grade 14</SelectItem>
                                            <SelectItem value="Grade 15">Grade 15</SelectItem>
                                            <SelectItem value="Grade 16">Grade16</SelectItem>
                                            <SelectItem value="Grade 17">Grade 17 (graduate/advanced degree)</SelectItem>
                                            <SelectItem value="Grade 18">Grade 18 (graduate/advanced degree)</SelectItem>
                                            <SelectItem value="Grade 19">Grade 19 (graduate/advanced degree)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Number of schools attended */}
                                <div>
                                    <Label htmlFor="schoolsAttended" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Number of schools attended
                                    </Label>
                                    <Input
                                        id="schoolsAttended"
                                        type="number"
                                        value={testScore}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "" || /^\d+$/.test(val)) {
                                                setTestScore(val);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "." || e.key === "," || e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                                                e.preventDefault();
                                            }
                                        }}
                                        step="1"
                                        min="0"
                                        className="text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            color: 'var(--slds-g-color-text-default)'
                                        }}
                                        placeholder="Enter number"
                                    />
                                </div>

                                {/* GPA */}
                                <div>
                                    <Label htmlFor="gpa" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        GPA
                                    </Label>
                                    <Input
                                        id="gpa"
                                        type="number"
                                        value={academicStand}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                                setAcademicStand(val);
                                            }
                                        }}
                                        onBlur={() => {
                                            if (academicStand && !isNaN(Number(academicStand))) {
                                                setAcademicStand(Number(academicStand).toFixed(2));
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                                                e.preventDefault();
                                            }
                                        }}
                                        step="0.01"
                                        min="0"
                                        className="text-[13px] rounded"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            color: 'var(--slds-g-color-text-default)'
                                        }}
                                        placeholder="Enter GPA (e.g., 3.50)"
                                    />
                                </div>

                                {/* On track to graduate? */}
                                <div>
                                    <Label htmlFor="onTrack" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        On track to graduate?
                                    </Label>
                                    <Select value={youthEnrolled} onValueChange={setYouthEnrolled}>
                                        <SelectTrigger 
                                          id="onTrack"
                                          className="text-[13px] rounded"
                                          style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            color: 'var(--slds-g-color-text-default)'
                                          }}
                                        >
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                            <SelectItem value="not-applicable">Not Applicable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Repeated a grade? */}
                                <div>
                                    <Label htmlFor="repeatedGrade" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Repeated a grade?
                                    </Label>
                                    <Select value={needsAdultEd} onValueChange={setNeedsAdultEd}>
                                        <SelectTrigger 
                                          id="repeatedGrade"
                                          className="text-[13px] rounded"
                                          style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            color: 'var(--slds-g-color-text-default)'
                                          }}
                                        >
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes</SelectItem>
                                            <SelectItem value="no">No</SelectItem>
                                            <SelectItem value="unknown">Unknown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* IEP/504/academic plan status */}
                            <div>
                                <Label htmlFor="iepStatus" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    IEP/504/academic plan status
                                </Label>
                                <Select value={iep} onValueChange={setIep}>
                                    <SelectTrigger 
                                      id="iepStatus"
                                      className="text-[13px] rounded"
                                      style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        color: 'var(--slds-g-color-text-default)'
                                      }}
                                    >
                                        <SelectValue placeholder="Select status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                        <SelectItem value="unknown">Unknown</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Summary */}
                            <div>
                                <Label htmlFor="academicSummary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Summary
                                </Label>
                                <Textarea
                                    id="academicSummary"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="text-[13px] rounded min-h-[150px]"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        color: 'var(--slds-g-color-text-default)'
                                    }}
                                    placeholder="Enter academic summary and notes..."
                                />
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="h-9 px-6 text-[13px] font-medium rounded-full"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-neutral-95)',
                                        color: 'var(--slds-g-color-text-default)',
                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="h-9 px-6 text-[13px] font-medium rounded-full"
                                    style={{
                                        backgroundColor: '#145F33',
                                        color: 'white'
                                    }}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
}