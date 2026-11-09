import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface LeadDetailNeedsDialogProps {
  needsDialogOpen: any;
  setNeedsDialogOpen: any;
  editingNeedsIndex: any;
  currentNeedsSection: any;
  needsFormData: any;
  setNeedsFormData: any;
  handleRemoveNeeds: any;
  handleApplyNeeds: any;
}

export function LeadDetailNeedsDialog({ needsDialogOpen, setNeedsDialogOpen, editingNeedsIndex, currentNeedsSection, needsFormData, setNeedsFormData, handleRemoveNeeds, handleApplyNeeds }: LeadDetailNeedsDialogProps) {
  return (
    <Dialog open={needsDialogOpen} onOpenChange={setNeedsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[8px] bg-white border border-[#dddbda]" aria-describedby={undefined}>
            <DialogHeader className="border-b border-[#dddbda] pb-4">
                <DialogTitle className="text-[16px] font-bold text-[#080707]">
                    {editingNeedsIndex !== null ? 'Edit' : 'Add'} {currentNeedsSection === 'education' ? 'Education Assessment' : 'Need'}
                </DialogTitle>
                <DialogDescription className="text-[13px] text-[#706e6b]">
                    {editingNeedsIndex !== null ? 'Update the details below.' : 'Enter the details below.'}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
                {currentNeedsSection === 'education' ? (
                    <div className="space-y-4 px-6">
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Grade at Release</Label>
                            <DateInput
value={isoToMdy(needsFormData.gradeAtRelease)}
                              onChange={(v) => ((e) => setNeedsFormData({...needsFormData, gradeAtRelease: e.target.value}))({ target: { value: mdyToIso(v) } })}
                              className="h-9 text-[13px] border-[#dddbda]"
                              placeholder="MM/DD/YYYY"
                            />
                        </div>
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Level Event</Label>
                            <Input
                              value={needsFormData.levelEvent}
                              onChange={(e) => setNeedsFormData({...needsFormData, levelEvent: e.target.value})}
                              className="h-9 text-[13px] border-[#dddbda]"
                              placeholder="e.g., Assessment - Ongoing"
                            />
                        </div>
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Activity</Label>
                            <Input
                              value={needsFormData.activity}
                              onChange={(e) => setNeedsFormData({...needsFormData, activity: e.target.value})}
                              className="h-9 text-[13px] border-[#dddbda]"
                              placeholder="e.g., Group Member"
                            />
                        </div>
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Comment</Label>
                            <Textarea
                              value={needsFormData.comment}
                              onChange={(e) => setNeedsFormData({...needsFormData, comment: e.target.value})}
                              className="min-h-[80px] text-[13px] border-[#dddbda]"
                              placeholder="Enter comment"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 px-6">
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Assessment</Label>
                            <Select value={needsFormData.assessment} onValueChange={(value) => setNeedsFormData({...needsFormData, assessment: value})}>
                                <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                                    <SelectValue placeholder="Select assessment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Depression">Depression</SelectItem>
                                    <SelectItem value="Anxiety">Anxiety</SelectItem>
                                    <SelectItem value="Anger">Anger</SelectItem>
                                    <SelectItem value="Trauma">Trauma</SelectItem>
                                    <SelectItem value="Self-Esteem">Self-Esteem</SelectItem>
                                    <SelectItem value="Social Skills">Social Skills</SelectItem>
                                    <SelectItem value="Impulse Control">Impulse Control</SelectItem>
                                    <SelectItem value="Assessment - Ongoing">Assessment - Ongoing</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Description</Label>
                            <Input
                              value={needsFormData.description}
                              onChange={(e) => setNeedsFormData({...needsFormData, description: e.target.value})}
                              className="h-9 text-[13px] border-[#dddbda]"
                              placeholder="e.g., Ongoing, Group Member"
                            />
                        </div>
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Level</Label>
                            <Select value={needsFormData.level} onValueChange={(value) => setNeedsFormData({...needsFormData, level: value})}>
                                <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Assistance">Assistance</SelectItem>
                                    <SelectItem value="Support">Support</SelectItem>
                                    <SelectItem value="Intervention">Intervention</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Occurrences</Label>
                            <Input
                              value={needsFormData.occurrences}
                              onChange={(e) => setNeedsFormData({...needsFormData, occurrences: e.target.value})}
                              className="h-9 text-[13px] border-[#dddbda]"
                              placeholder="e.g., -, 3 times/week"
                            />
                        </div>
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Needs</Label>
                            <Select value={needsFormData.needs} onValueChange={(value) => setNeedsFormData({...needsFormData, needs: value})}>
                                <SelectTrigger className="h-9 text-[13px] border-[#dddbda]">
                                    <SelectValue placeholder="Select needs level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Minor">Minor</SelectItem>
                                    <SelectItem value="Moderate">Moderate</SelectItem>
                                    <SelectItem value="Major">Major</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block">Goals</Label>
                            <Textarea
                              value={needsFormData.goals}
                              onChange={(e) => setNeedsFormData({...needsFormData, goals: e.target.value})}
                              className="min-h-[100px] text-[13px] border-[#dddbda]"
                              placeholder="Enter goals..."
                            />
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter className="border-t border-[#dddbda] pt-4 px-6">
                {editingNeedsIndex !== null && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentNeedsSection) {
                            handleRemoveNeeds(currentNeedsSection, editingNeedsIndex);
                            setNeedsDialogOpen(false);
                        }
                      }}
                      className="h-9 rounded-full text-[13px] border-[#c23934] text-[#c23934] hover:bg-[#fef5f4] shadow-none"
                    >
                        Remove
                    </Button>
                )}
                <div className="flex-1"></div>
                <Button
                  variant="outline"
                  onClick={() => setNeedsDialogOpen(false)}
                  className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
                >
                    Cancel
                </Button>
                <Button
                  className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
                  onClick={handleApplyNeeds}
                >
                    Apply
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
