import { useState } from "react";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Edit2, Plus, AlertTriangle, Trash2, X } from "@/app/lib/lucide-icons";
import { VisuallyHidden } from "../ui/visually-hidden";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat";

export function CampusRestrictionsSection() {
    const [campusRestrictions, setCampusRestrictions] = useState([
        {
            id: 1,
            youth: "Aaron Ace",
            type: "Library",
            startDate: "2024-11-15",
            endDate: "2024-12-15",
            implementedBy: "Sarah Johnson",
            campusContact: "Mike Stevens",
            restorativeMeasures: "Complete conflict resolution workshop",
            endedBy: "Sarah Johnson",
            restrictionEndedBy: "Sarah Johnson",
            contactIfYouthRequestsAccess: "Mike Stevens - Library Coordinator",
            // Detail view fields
            restrictionType: "Library",
            reason: "Inappropriate behavior during study sessions",
            additionalDetails: "Student was repeatedly disruptive during quiet study hours and received multiple warnings.",
            implementedDate: "2024-11-15",
            implementedByRole: "Program Director",
            campusLocation: "Main Campus Library",
            notificationSent: "Yes",
            parentNotified: "Yes - 11/15/2024"
        },
        {
            id: 2,
            youth: "Bobby Brown",
            type: "Gym",
            startDate: "2024-12-01",
            endDate: null,
            implementedBy: "David Martinez",
            campusContact: "Tom Bradley",
            restorativeMeasures: "Attend anger management sessions",
            endedBy: null,
            restrictionEndedBy: null,
            contactIfYouthRequestsAccess: "Tom Bradley - Athletic Director",
            restrictionType: "Gym",
            reason: "Physical altercation with peer",
            additionalDetails: "Student was involved in a fight during basketball practice. Both parties have been restricted.",
            implementedDate: "2024-12-01",
            implementedByRole: "Youth Counselor",
            campusLocation: "Athletic Center",
            notificationSent: "Yes",
            parentNotified: "Yes - 12/01/2024"
        },
        {
            id: 3,
            youth: "Charlie Chen",
            type: "Computer Lab",
            startDate: "2024-10-20",
            endDate: "2024-11-20",
            implementedBy: "Jennifer Lee",
            campusContact: "Sarah Kim",
            restorativeMeasures: "Digital citizenship training completed",
            endedBy: "Jennifer Lee",
            restrictionEndedBy: "Jennifer Lee",
            contactIfYouthRequestsAccess: "Sarah Kim - IT Coordinator",
            restrictionType: "Computer Lab",
            reason: "Inappropriate internet usage",
            additionalDetails: "Accessed unauthorized websites during supervised computer time.",
            implementedDate: "2024-10-20",
            implementedByRole: "IT Coordinator",
            campusLocation: "Education Building - Room 205",
            notificationSent: "Yes",
            parentNotified: "Yes - 10/20/2024"
        },
        {
            id: 4,
            youth: "Diana Davis",
            type: "Cafeteria",
            startDate: "2025-01-08",
            endDate: null,
            implementedBy: "Robert Wilson",
            campusContact: "Maria Garcia",
            restorativeMeasures: "Community service in kitchen",
            endedBy: null,
            restrictionEndedBy: null,
            contactIfYouthRequestsAccess: "Maria Garcia - Food Services Manager",
            restrictionType: "Cafeteria",
            reason: "Food waste and disrespectful behavior",
            additionalDetails: "Repeatedly wasted food and was disrespectful to cafeteria staff.",
            implementedDate: "2025-01-08",
            implementedByRole: "Residential Manager",
            campusLocation: "Main Cafeteria",
            notificationSent: "Yes",
            parentNotified: "Yes - 01/08/2025"
        },
        {
            id: 5,
            youth: "Ethan Edwards",
            type: "Recreation Room",
            startDate: "2024-09-10",
            endDate: "2024-10-10",
            implementedBy: "Amanda Foster",
            campusContact: "Kevin Park",
            restorativeMeasures: "Completed peer mediation program",
            endedBy: "Amanda Foster",
            restrictionEndedBy: "Amanda Foster",
            contactIfYouthRequestsAccess: "Kevin Park - Recreation Supervisor",
            restrictionType: "Recreation Room",
            reason: "Vandalism of recreation equipment",
            additionalDetails: "Damaged gaming console and refused to take responsibility initially.",
            implementedDate: "2024-09-10",
            implementedByRole: "Recreation Supervisor",
            campusLocation: "Youth Center - Recreation Wing",
            notificationSent: "Yes",
            parentNotified: "Yes - 09/10/2024"
        },
        {
            id: 6,
            youth: "Fiona Fisher",
            type: "Campus Grounds",
            startDate: "2024-12-20",
            endDate: null,
            implementedBy: "Michael Chang",
            campusContact: "Lisa Anderson",
            restorativeMeasures: "Safety protocol training pending",
            endedBy: null,
            restrictionEndedBy: null,
            contactIfYouthRequestsAccess: "Lisa Anderson - Campus Security",
            restrictionType: "Campus Grounds",
            reason: "Left campus without permission",
            additionalDetails: "Student left campus boundaries during free time without proper authorization.",
            implementedDate: "2024-12-20",
            implementedByRole: "Security Coordinator",
            campusLocation: "All Campus Grounds",
            notificationSent: "Yes",
            parentNotified: "Yes - 12/20/2024"
        },
        {
            id: 7,
            youth: "George Garcia",
            type: "Library",
            startDate: "2025-01-05",
            endDate: null,
            implementedBy: "Patricia Moore",
            campusContact: "Mike Stevens",
            restorativeMeasures: "Behavior contract signed",
            endedBy: null,
            restrictionEndedBy: null,
            contactIfYouthRequestsAccess: "Mike Stevens - Library Coordinator",
            restrictionType: "Library",
            reason: "Loud and disruptive behavior",
            additionalDetails: "Created disturbances affecting other students' ability to study effectively.",
            implementedDate: "2025-01-05",
            implementedByRole: "Academic Advisor",
            campusLocation: "Main Campus Library",
            notificationSent: "Yes",
            parentNotified: "Yes - 01/05/2025"
        },
        {
            id: 8,
            youth: "Hannah Hill",
            type: "Gym",
            startDate: "2024-11-01",
            endDate: "2024-12-01",
            implementedBy: "James Taylor",
            campusContact: "Tom Bradley",
            restorativeMeasures: "Sportsmanship workshop completed",
            endedBy: "James Taylor",
            restrictionEndedBy: "James Taylor",
            contactIfYouthRequestsAccess: "Tom Bradley - Athletic Director",
            restrictionType: "Gym",
            reason: "Unsportsmanlike conduct",
            additionalDetails: "Displayed poor sportsmanship and aggressive behavior during team sports.",
            implementedDate: "2024-11-01",
            implementedByRole: "Athletics Director",
            campusLocation: "Athletic Center",
            notificationSent: "Yes",
            parentNotified: "Yes - 11/01/2024"
        },
        {
            id: 9,
            youth: "Isaac Irving",
            type: "Computer Lab",
            startDate: "2025-01-10",
            endDate: null,
            implementedBy: "Samantha White",
            campusContact: "Sarah Kim",
            restorativeMeasures: "Technology agreement review in progress",
            endedBy: null,
            restrictionEndedBy: null,
            contactIfYouthRequestsAccess: "Sarah Kim - IT Coordinator",
            restrictionType: "Computer Lab",
            reason: "Attempted to bypass security software",
            additionalDetails: "Made multiple attempts to circumvent internet filtering and monitoring systems.",
            implementedDate: "2025-01-10",
            implementedByRole: "IT Security Specialist",
            campusLocation: "Education Building - Room 205",
            notificationSent: "Yes",
            parentNotified: "Yes - 01/10/2025"
        },
        {
            id: 10,
            youth: "Julia Jackson",
            type: "Cafeteria",
            startDate: "2024-08-15",
            endDate: "2024-09-15",
            implementedBy: "Daniel Brown",
            campusContact: "Maria Garcia",
            restorativeMeasures: "Completed nutrition education program",
            endedBy: "Daniel Brown",
            restrictionEndedBy: "Daniel Brown",
            contactIfYouthRequestsAccess: "Maria Garcia - Food Services Manager",
            restrictionType: "Cafeteria",
            reason: "Repeated table manners violations",
            additionalDetails: "Consistently failed to follow cafeteria rules and etiquette guidelines.",
            implementedDate: "2024-08-15",
            implementedByRole: "Behavioral Specialist",
            campusLocation: "Main Cafeteria",
            notificationSent: "Yes",
            parentNotified: "Yes - 08/15/2024"
        }
    ]);
    
    const [showRestrictionDialog, setShowRestrictionDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedRestriction, setSelectedRestriction] = useState<any>(null);
    const [editingRestrictionId, setEditingRestrictionId] = useState<number | null>(null);
    const [restrictionForm, setRestrictionForm] = useState({
        type: "",
        startDate: "",
        endDate: "",
        reason: "",
        implementedBy: "",
        campusContact: "",
        restorativeMeasures: "",
        restrictionEndedBy: "",
        contactIfYouthRequestsAccess: ""
    });

    const handleAddRestriction = () => {
        setEditingRestrictionId(null);
        setRestrictionForm({
            type: "",
            startDate: "",
            endDate: "",
            reason: "",
            implementedBy: "",
            campusContact: "",
            restorativeMeasures: "",
            restrictionEndedBy: "",
            contactIfYouthRequestsAccess: ""
        });
        setShowRestrictionDialog(true);
    };

    const handleEditRestriction = (restriction: any) => {
        setEditingRestrictionId(restriction.id);
        setRestrictionForm({
            type: restriction.type,
            startDate: restriction.startDate,
            endDate: restriction.endDate || "",
            reason: restriction.reason,
            implementedBy: restriction.implementedBy,
            campusContact: restriction.campusContact,
            restorativeMeasures: restriction.restorativeMeasures,
            restrictionEndedBy: restriction.restrictionEndedBy,
            contactIfYouthRequestsAccess: restriction.contactIfYouthRequestsAccess
        });
        setShowRestrictionDialog(true);
    };

    const handleSaveRestriction = () => {
        if (editingRestrictionId) {
            setCampusRestrictions(campusRestrictions.map(r => 
                r.id === editingRestrictionId 
                    ? { ...r, ...restrictionForm }
                    : r
            ));
        } else {
            const newRestriction = {
                id: Math.max(...campusRestrictions.map(r => r.id), 0) + 1,
                ...restrictionForm,
                youth: "New Youth",
                endedBy: null
            };
            setCampusRestrictions([...campusRestrictions, newRestriction]);
        }
        setShowRestrictionDialog(false);
    };

    const handleDeleteRestriction = (id: number) => {
        setCampusRestrictions(campusRestrictions.filter(r => r.id !== id));
    };

    const handleRowClick = (restriction: any) => {
        setSelectedRestriction(restriction);
        setShowDetailDialog(true);
    };

    return (
        <div className="p-6 max-w-6xl">
            <div 
                className="overflow-hidden"
                style={{
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    borderRadius: 'var(--slds-c-card-radius-border)',
                    backgroundColor: 'var(--slds-g-color-background-base)'
                }}
            >
                <div 
                    className="px-4 py-3 flex items-center justify-between"
                    style={{
                        borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                        backgroundColor: 'var(--slds-g-color-background-alt)'
                    }}
                >
                    <h3 className="text-[13px] font-semibold text-[#080707]">Campus Restrictions</h3>
                    <Button
                        onClick={handleAddRestriction}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Restriction
                    </Button>
                </div>
                <div className="p-4">
                        {campusRestrictions.length === 0 ? (
                            <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                                <p className="text-[13px]">No active campus restrictions</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                        <TableHeader>
                                            <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    Youth
                                                </TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    Type
                                                </TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    Start Date
                                                </TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    End Date
                                                </TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    Implemented By
                                                </TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    Campus Contact
                                                </TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    Restorative Measures
                                                </TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    Ended By
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {campusRestrictions.map((restriction, index) => (
                                                <TableRow 
                                                    key={restriction.id}
                                                    onClick={() => handleRowClick(restriction)}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    style={{ 
                                                        borderBottom: index < campusRestrictions.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                                    }}
                                                >
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                        {restriction.youth}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                        {restriction.type}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                        {formatMdy(new Date(restriction.startDate))}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                        {restriction.endDate ? formatMdy(new Date(restriction.endDate)) : '—'}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                        {restriction.implementedBy}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                        {restriction.campusContact || '—'}
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[200px]">
                                                        <div className="line-clamp-1">{restriction.restorativeMeasures || '—'}</div>
                                                    </TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                        {restriction.endedBy || '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                            </div>
                        )}

                        {/* Detail View Dialog */}
                        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader className="relative">
                                    <DialogTitle className="text-[18px] font-semibold">Campus Restriction Details</DialogTitle>
                                    <DialogDescription className="text-[14px] text-[#525252]">
                                        View complete information about this campus restriction.
                                    </DialogDescription>
                                </DialogHeader>
                                {selectedRestriction && (
                                    <div className="py-4">
                                        {/* Primary Information - Matches Table Columns */}
                                        <div className="mb-6">
                                            <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                                Restriction Details
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Youth</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.youth}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Type</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.type}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Start Date</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">
                                                        {formatMdy(new Date(selectedRestriction.startDate))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">End Date</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">
                                                        {selectedRestriction.endDate ? formatMdy(new Date(selectedRestriction.endDate)) : 'Ongoing'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Implemented By</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.implementedBy}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Campus Contact</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.campusContact || '—'}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Ended By</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.endedBy || '—'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Restorative Measures */}
                                        <div className="mb-6">
                                            <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                                Restorative Measures
                                            </h3>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Required Actions</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.restorativeMeasures || '—'}</div>
                                            </div>
                                        </div>

                                        {/* Additional Information */}
                                        <div className="mb-6">
                                            <h3 className="text-[14px] font-semibold mb-3 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                                                Additional Information
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Campus Location</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.campusLocation || '—'}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Implementation Date</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">
                                                        {selectedRestriction.implementedDate ? formatMdy(new Date(selectedRestriction.implementedDate)) : '—'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Implemented By Role</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.implementedByRole || '—'}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Contact if Youth Requests Access</Label>
                                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.contactIfYouthRequestsAccess || '—'}</div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Reason</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.reason || '—'}</div>
                                            </div>
                                            <div>
                                                <Label className="text-[11px] font-semibold text-[#706e6b]">Additional Details</Label>
                                                <div className="text-[13px] mt-1 text-[#080707]">{selectedRestriction.additionalDetails || '—'}</div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            <Button
                                                onClick={() => setShowDetailDialog(false)}
                                                className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                style={{
                                                    backgroundColor: '#145F33',
                                                    color: 'white'
                                                }}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Add/Edit Restriction Dialog */}
                        <Dialog open={showRestrictionDialog} onOpenChange={setShowRestrictionDialog}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-[18px] font-semibold">
                                        {editingRestrictionId ? 'Edit Campus Restriction' : 'Add Campus Restriction'}
                                    </DialogTitle>
                                    <DialogDescription className="text-[14px] text-[#525252]">
                                        {editingRestrictionId ? 'Update the details of the existing campus restriction.' : 'Add a new campus restriction for the youth.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    {/* Restriction Type */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Restriction Type *</Label>
                                        <Select
                                            value={restrictionForm.type}
                                            onValueChange={(value) => setRestrictionForm({...restrictionForm, type: value})}
                                        >
                                            <SelectTrigger className="h-9 text-[13px]">
                                                <SelectValue placeholder="Select restriction type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Library">Library</SelectItem>
                                                <SelectItem value="Gym">Gym</SelectItem>
                                                <SelectItem value="Computer Lab">Computer Lab</SelectItem>
                                                <SelectItem value="Cafeteria">Cafeteria</SelectItem>
                                                <SelectItem value="Recreation Room">Recreation Room</SelectItem>
                                                <SelectItem value="Campus Grounds">Campus Grounds</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Date Range */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold text-[#080707]">Start Date *</Label>
                                            <DateInput
value={isoToMdy(restrictionForm.startDate)}
                                                onChange={(v) => ((e) => setRestrictionForm({...restrictionForm, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                className="h-9 text-[13px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[11px] font-semibold text-[#080707]">End Date</Label>
                                            <DateInput
value={isoToMdy(restrictionForm.endDate)}
                                                onChange={(v) => ((e) => setRestrictionForm({...restrictionForm, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                className="h-9 text-[13px]"
                                                placeholder="Leave blank for ongoing"
                                            />
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Restriction Reason *</Label>
                                        <Textarea
                                            value={restrictionForm.reason}
                                            onChange={(e) => setRestrictionForm({...restrictionForm, reason: e.target.value})}
                                            className="min-h-[80px] text-[13px] resize-none"
                                            placeholder="Describe the reason for this restriction..."
                                        />
                                    </div>

                                    {/* Implemented By */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Implemented By *</Label>
                                        <Select
                                            value={restrictionForm.implementedBy}
                                            onValueChange={(value) => setRestrictionForm({...restrictionForm, implementedBy: value})}
                                        >
                                            <SelectTrigger className="h-9 text-[13px]">
                                                <SelectValue placeholder="Select staff member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                                                <SelectItem value="David Martinez">David Martinez</SelectItem>
                                                <SelectItem value="Jennifer Lee">Jennifer Lee</SelectItem>
                                                <SelectItem value="Robert Wilson">Robert Wilson</SelectItem>
                                                <SelectItem value="Amanda Foster">Amanda Foster</SelectItem>
                                                <SelectItem value="Michael Chang">Michael Chang</SelectItem>
                                                <SelectItem value="Patricia Moore">Patricia Moore</SelectItem>
                                                <SelectItem value="James Taylor">James Taylor</SelectItem>
                                                <SelectItem value="Samantha White">Samantha White</SelectItem>
                                                <SelectItem value="Daniel Brown">Daniel Brown</SelectItem>
                                                <SelectItem value="Lisa Anderson">Lisa Anderson</SelectItem>
                                                <SelectItem value="Kevin Park">Kevin Park</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Campus Restriction Ended By */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Campus Restriction Ended By</Label>
                                        <Select
                                            value={restrictionForm.restrictionEndedBy}
                                            onValueChange={(value) => setRestrictionForm({...restrictionForm, restrictionEndedBy: value})}
                                        >
                                            <SelectTrigger className="h-9 text-[13px]">
                                                <SelectValue placeholder="Select staff member (if restriction ended)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                                                <SelectItem value="David Martinez">David Martinez</SelectItem>
                                                <SelectItem value="Jennifer Lee">Jennifer Lee</SelectItem>
                                                <SelectItem value="Robert Wilson">Robert Wilson</SelectItem>
                                                <SelectItem value="Amanda Foster">Amanda Foster</SelectItem>
                                                <SelectItem value="Michael Chang">Michael Chang</SelectItem>
                                                <SelectItem value="Patricia Moore">Patricia Moore</SelectItem>
                                                <SelectItem value="James Taylor">James Taylor</SelectItem>
                                                <SelectItem value="Samantha White">Samantha White</SelectItem>
                                                <SelectItem value="Daniel Brown">Daniel Brown</SelectItem>
                                                <SelectItem value="Lisa Anderson">Lisa Anderson</SelectItem>
                                                <SelectItem value="Kevin Park">Kevin Park</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Campus Contact */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#706e6b]">Campus Contact</Label>
                                        <Input
                                            value={restrictionForm.campusContact}
                                            onChange={(e) => setRestrictionForm({...restrictionForm, campusContact: e.target.value})}
                                            className="h-9 text-[13px]"
                                            placeholder="Contact person for access requests"
                                        />
                                    </div>

                                    {/* Contact if youth requests access to Mercy Home Campus */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Contact if youth requests access to Mercy Home Campus</Label>
                                        <Input
                                            value={restrictionForm.contactIfYouthRequestsAccess}
                                            onChange={(e) => setRestrictionForm({...restrictionForm, contactIfYouthRequestsAccess: e.target.value})}
                                            className="h-9 text-[13px]"
                                            placeholder="e.g., Mike Stevens - Library Coordinator"
                                        />
                                    </div>

                                    {/* Restorative Measures */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-[#080707]">Restorative Measures</Label>
                                        <Textarea
                                            value={restrictionForm.restorativeMeasures}
                                            onChange={(e) => setRestrictionForm({...restrictionForm, restorativeMeasures: e.target.value})}
                                            className="min-h-[80px] text-[13px] resize-none"
                                            placeholder="Steps to restore privileges..."
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                        <Button
                                            onClick={() => setShowRestrictionDialog(false)}
                                            className="h-9 px-4 rounded-full text-[13px] font-medium"
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: '#706e6b',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveRestriction}
                                            disabled={!restrictionForm.type || !restrictionForm.startDate || !restrictionForm.reason || !restrictionForm.implementedBy}
                                            className="h-9 px-4 rounded-full text-[13px] font-medium"
                                            style={{
                                                backgroundColor: '#145F33',
                                                color: 'white',
                                                opacity: (!restrictionForm.type || !restrictionForm.startDate || !restrictionForm.reason || !restrictionForm.implementedBy) ? 0.5 : 1
                                            }}
                                        >
                                            {editingRestrictionId ? 'Update Restriction' : 'Add Restriction'}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                </div>
            </div>
        </div>
    );
}