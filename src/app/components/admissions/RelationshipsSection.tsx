import { useState, useMemo } from "react";
import { OverflowList } from "../ui/overflow-list";
import { Button } from "../ui/button";
import { Plus, Pencil, Trash2, Save, Search, ChevronDown, ChevronUp, Check, Users, X as XIcon } from "@/app/lib/lucide-icons";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { FieldError, FieldLabel } from "../ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { SearchableSelect } from "../ui/searchable-select";
import { EmptyState } from "../ui/empty-state";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MultiSelect } from "../ui/multi-select";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../../lib/utils";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface Relationship {
    id: string;
    relatedTo: string;
    /** Display name for a relationship added via Add Constituent. */
    relatedToName?: string;
    relationship: string;
    startDate: string;
    endDate: string;
    involvementLevel: string;
    relationshipQuality: string;
    comments: string;
    emergencyContact: boolean;
    legalGuardian: boolean;
    eligibleForPass: boolean;
    adoptedBy?: boolean;
    hasNotes: boolean;
    emergencyContactSortOrder?: number;
    emergencyContactIsPrimary?: boolean;
}

interface Constituent {
    id: string;
    constituentType: string;
    firstName: string;
    lastName: string;
    legalGuardian: boolean;
    eligibleForPass: boolean;
    adoptedBy?: boolean;
    isActiveConstituent?: string;
    startDate: string;
    endDate: string;
    relationship: string;
    active: boolean;
    role?: string;
    roleStartDate?: string;
    hasPrimaryPhone: boolean;
    phone?: string;
    phoneExtension?: string;
    phoneType?: string;
    hasPrimaryEmail: boolean;
    email?: string;
    emailType?: string;
    hasPrimaryAddress: boolean;
    streetAddress?: string;
    addressType?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipPlus4?: string;
}

interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    address: string;
    isPrimary: boolean;
    sortOrder: number;
}

// Mock emergency contacts data
const mockEmergencyContacts: EmergencyContact[] = [
    {
        id: "ec1",
        name: "Shaun Fleming",
        relationship: "Admissions Parent",
        phone: "(408)931-0354",
        address: "1312 Crescent Avenue, Chicago, IL 60647",
        isPrimary: true,
        sortOrder: 1,
    },
    {
        id: "ec2",
        name: "Chicago, IL - Admissions",
        relationship: "Admissions",
        phone: "(773)151-2222",
        address: "1101 West Lawrence Avenue, Chicago, IL 60640",
        isPrimary: false,
        sortOrder: 2,
    },
    {
        id: "ec3",
        name: "PhonePerson",
        relationship: "Admissions",
        phone: "(312)555-0198",
        address: "456 North State Street, Chicago, IL 60654",
        isPrimary: false,
        sortOrder: 3,
    },
];

// "Constituent is the ___ of ..." options in Add Constituent.
const CONSTITUENT_RELATIONSHIP_OPTIONS = [
    "Advocatee", "After School Programs Coordinator", "Asst. Principal", "Attendance Officer",
    "Aunt", "Brother", "Brother-in-law", "Business Associate", "Boyfriend",
    "Career Resources Coordinator", "Admissions Case Manager", "Case Worker",
    "Admissions Clinician", "Mother", "Father", "Parent", "Guardian", "Sibling",
    "Grandparent", "Foster Parent", "Other",
];

const NONE = "__none__";
const INVOLVEMENT_OPTIONS = ["Very Involved", "Somewhat Involved", "Minimal", "Moderate", "Significant", "None", "Deceased"];
// Relationship types: the existing Add Relationship list plus the
// Add Constituent list, so existing rows (e.g. Mother) stay selectable.
const RELATIONSHIP_TYPE_OPTIONS = Array.from(new Set([
    "Admissions Clinician", "Adoptive Brother", "Adoptive Daughter", "Adoptive Father",
    "Adoptive Granddaughter", "Adoptive Grandfather", "Adoptive Grandmother", "Adoptive Grandson",
    "Adoptive Mother", "Adoptive Sister", "Adoptive Son", "Advisee", "Advisor",
    ...CONSTITUENT_RELATIONSHIP_OPTIONS,
])).sort((a, b) => a.localeCompare(b));

const US_STATE_CODES = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS",
    "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC",
    "ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

// Mock data for Related Constituent dropdown
const mockRelatedConstituents = [
    { id: "1135", name: "St. XXXX's High School (1135)" },
    { id: "1138", name: "XXXX Community Academy High School (1138)" },
    { id: "1141", name: "De La Salle Institute (1141)" },
    { id: "1144", name: "Christ the XXXX Jesuit College Preparatory School (1144)" },
    { id: "1145", name: "Chicago Tech Academy (1145)" },
    { id: "1146", name: "XXXX Military Academy (1146)" },
    { id: "1147", name: "Percy XXXX High School (1147)" },
    { id: "1150", name: "XXXX Park Academy/Middle School (1150)" },
    { id: "1154", name: "Queen of the Universe (1154)" },
    { id: "1155", name: "Ridge Academy (1155)" },
    { id: "1156", name: "St. Bede the Venerable (1156)" },
    { id: "1157", name: "St. XXXX (1157)" },
    { id: "1158", name: "XXXX Park Academy/High School (1158)" }
];

// Mock constituent details for pre-filling emergency contacts
const mockConstituentDetails: Record<string, { name: string; phone: string; address: string }> = {
    "1135": { name: "Shaun Fleming", phone: "(408)931-0354", address: "1312 Crescent Avenue, Chicago, IL 60647" },
    "1138": { name: "Maria Gonzalez", phone: "(773)555-0142", address: "2450 West Division Street, Chicago, IL 60622" },
    "1141": { name: "James Patterson", phone: "(312)555-0198", address: "801 South Wabash Avenue, Chicago, IL 60605" },
    "1144": { name: "Linda Chen", phone: "(773)555-0267", address: "3500 South Michigan Avenue, Chicago, IL 60653" },
    "1145": { name: "Robert Williams", phone: "(312)555-0331", address: "1200 West 35th Street, Chicago, IL 60609" },
    "1146": { name: "Patricia Davis", phone: "(773)555-0415", address: "5600 South Cottage Grove Avenue, Chicago, IL 60637" },
    "1147": { name: "Michael Johnson", phone: "(312)555-0489", address: "8150 South Vincennes Avenue, Chicago, IL 60620" },
    "1150": { name: "Jennifer Martinez", phone: "(773)555-0563", address: "4300 North Austin Avenue, Chicago, IL 60634" },
    "1154": { name: "David Brown", phone: "(312)555-0637", address: "7200 South Pulaski Road, Chicago, IL 60629" },
    "1155": { name: "Susan Taylor", phone: "(773)555-0711", address: "6500 North Ridge Boulevard, Chicago, IL 60626" },
    "1156": { name: "Christopher Wilson", phone: "(312)555-0785", address: "8300 South Kedzie Avenue, Chicago, IL 60652" },
    "1157": { name: "Karen Anderson", phone: "(773)555-0859", address: "2900 East 91st Street, Chicago, IL 60617" },
    "1158": { name: "Daniel Thomas", phone: "(312)555-0933", address: "4700 West Irving Park Road, Chicago, IL 60641" },
};

// Relationship types for emergency contacts matching Add Relationship dialog
const EMERGENCY_CONTACT_RELATIONSHIP_TYPES = [
    "Admissions Clinician",
    "Adoptive Brother",
    "Adoptive Daughter",
    "Adoptive Father",
    "Adoptive Granddaughter",
    "Adoptive Grandfather",
    "Adoptive Grandmother",
    "Adoptive Grandson",
    "Adoptive Mother",
    "Adoptive Sister",
    "Adoptive Son",
    "Advisee",
    "Advisor",
    "Aunt",
    "Brother",
    "Case Worker",
    "Cousin",
    "Father",
    "Foster Parent",
    "Grandfather",
    "Grandmother",
    "Grandparent",
    "Guardian",
    "Mother",
    "Other",
    "Sibling",
    "Sister",
    "Uncle",
];

export function RelationshipsSection({
    subjectName = "Alex Doe",
    showEmergencyContacts = true,
    relationshipOptions,
    relationshipStaffNames,
    relationshipColumnLabel = "RELATIONSHIP",
    memberOptions,
}: {
    /** Community Care: replace the Relationship select with a Member
     *  multi-select (shown first in the dialog). */
    memberOptions?: string[];
    /** Header for the Relationship column (Community Care uses "MEMBER"). */
    relationshipColumnLabel?: string;
    /** Optional: staff name per relationship type; the Relationship cell
     *  then reads "Name (Relationship)" (Community Care). */
    relationshipStaffNames?: Record<string, string>;
    /** Overrides the relationship list (dialog options and sample rows),
     *  e.g. Community Care staff roles. */
    relationshipOptions?: string[];
    /** Hide the Emergency Contacts card (e.g. Community Care). */
    showEmergencyContacts?: boolean;
    /** Person whose relationships these are ("... of {subjectName}"). The
     *  default keeps the existing Admissions sample name. */
    subjectName?: string;
} = {}) {
    // Community Care (memberOptions): white header, dark bold labels.
    const ccHead = memberOptions
        ? "!bg-white !text-[#080707] font-semibold !border-b border-[var(--slds-g-color-border-base-1)]"
        : "";
    // Relationships State
    const [relationships, setRelationships] = useState<Relationship[]>([
        {
            id: "1",
            relatedTo: "1135",
            relationship: relationshipOptions?.[0] ?? "Mother",
            startDate: "2023-01-01",
            endDate: "",
            involvementLevel: "Very Involved",
            relationshipQuality: "Excellent",
            comments: "Strong maternal bond, consistent communication",
            emergencyContact: true,
            legalGuardian: true,
            eligibleForPass: true,
            hasNotes: true,
            emergencyContactSortOrder: 1,
            emergencyContactIsPrimary: true
        },
        {
            id: "2",
            relatedTo: "1138",
            relationship: relationshipOptions?.[3] ?? relationshipOptions?.[1] ?? "Foster Parent",
            startDate: "2023-06-15",
            endDate: "",
            involvementLevel: "Somewhat Involved",
            relationshipQuality: "Good",
            comments: "",
            emergencyContact: true,
            legalGuardian: false,
            eligibleForPass: false,
            hasNotes: false,
            emergencyContactSortOrder: 2,
            emergencyContactIsPrimary: false
        }
    ]);
    const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
    const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);
    const [relationshipFormData, setRelationshipFormData] = useState<Partial<Relationship>>({});
    const [showRelationshipNotes, setShowRelationshipNotes] = useState<string | null>(null);

    // Constituent State
    const [isConstituentDialogOpen, setIsConstituentDialogOpen] = useState(false);
    const [constituentFormData, setConstituentFormData] = useState<Partial<Constituent>>({});

    // Search State
    const [relationshipsSearchTerm, setRelationshipsSearchTerm] = useState("");

    // Emergency Contacts State (for popup inline editing only)
    const [isEmergencyContactDialogOpen, setIsEmergencyContactDialogOpen] = useState(false);
    const [inlineEditingECId, setInlineEditingECId] = useState<string | null>(null);
    const [isAddingInlineEC, setIsAddingInlineEC] = useState(false);
    const [inlineECEditData, setInlineECEditData] = useState<{
        name: string;
        relationship: string;
        phone: string;
        address: string;
    }>({ name: "", relationship: "", phone: "", address: "" });
    const [inlineECAddData, setInlineECAddData] = useState<{
        name: string;
        relationship: string;
        phone: string;
        address: string;
    }>({ name: "", relationship: "", phone: "", address: "" });

    // Standalone Emergency Contacts State (for the main section, not popup)
    const [inlineEditingECIdStandalone, setInlineEditingECIdStandalone] = useState<string | null>(null);
    const [isAddingInlineECStandalone, setIsAddingInlineECStandalone] = useState(false);
    const [inlineECEditDataStandalone, setInlineECEditDataStandalone] = useState<{
        name: string;
        relationship: string;
        phone: string;
        address: string;
    }>({ name: "", relationship: "", phone: "", address: "" });
    const [inlineECAddDataStandalone, setInlineECAddDataStandalone] = useState<{
        sortOrder?: number;
        relationship: string;
    }>({ relationship: "" });

    // Confirmation Dialog State for Emergency Contact Deletion
    const [isDeleteECConfirmOpen, setIsDeleteECConfirmOpen] = useState(false);
    const [deletingECId, setDeletingECId] = useState<string | null>(null);

    // Selection Dialog State for Adding Emergency Contact from Existing Relationships
    const [isSelectRelationshipDialogOpen, setIsSelectRelationshipDialogOpen] = useState(false);
    const [selectedRelationshipForEC, setSelectedRelationshipForEC] = useState<string>("");

    // Primary Conflict Resolution State
    const [isPrimaryConflictDialogOpen, setIsPrimaryConflictDialogOpen] = useState(false);
    const [newPrimaryId, setNewPrimaryId] = useState<string | null>(null);

    // Compute Emergency Contacts from Relationships
    const emergencyContacts: EmergencyContact[] = useMemo(() => {
        return relationships
            .filter(rel => rel.emergencyContact)
            .map(rel => {
                const constituent = mockConstituentDetails[rel.relatedTo];
                return {
                    id: rel.id,
                    name: constituent?.name || "Unknown",
                    relationship: rel.relationship,
                    phone: constituent?.phone || "",
                    address: constituent?.address || "",
                    isPrimary: rel.emergencyContactIsPrimary || false,
                    sortOrder: rel.emergencyContactSortOrder || 999
                };
            })
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }, [relationships]);

    // Compute available relationships that can be added as emergency contacts
    const availableRelationshipsForEC = useMemo(() => {
        return relationships
            .filter(rel => !rel.emergencyContact)
            .map(rel => {
                const constituent = mockConstituentDetails[rel.relatedTo];
                const constituentInfo = mockRelatedConstituents.find(c => c.id === rel.relatedTo);
                return {
                    id: rel.id,
                    name: constituent?.name || constituentInfo?.name || "Unknown",
                    relationship: rel.relationship,
                    phone: constituent?.phone || "",
                    address: constituent?.address || ""
                };
            });
    }, [relationships]);

    // Compute the next available constituent for inline add
    const nextAvailableConstituent = useMemo(() => {
        const constituents = Object.entries(mockConstituentDetails).map(([id, details]) => ({ id, ...details }));
        const usedConstituentIds = relationships.filter(r => r.emergencyContact).map(r => r.relatedTo);
        const available = constituents.find(c => !usedConstituentIds.includes(c.id));
        return available || constituents[0];
    }, [relationships]);

    // Relationship Handlers
    const [relationshipErrors, setRelationshipErrors] = useState<Record<string, string>>({});
    const setRelationshipField = (key: string, value: unknown) => {
        setRelationshipFormData((d) => ({ ...d, [key]: value }));
        setRelationshipErrors((e) => {
            if (!e[key]) return e;
            const { [key]: _removed, ...rest } = e;
            return rest;
        });
    };
    // Related-to choices: sample constituents plus anyone added via Add Constituent.
    const relatedToOptions = [
        ...mockRelatedConstituents.map((c) => ({ value: c.id, label: c.name })),
        ...relationships
            .filter((r) => r.relatedToName && !mockRelatedConstituents.some((c) => c.id === r.relatedTo))
            .map((r) => ({ value: r.relatedTo, label: r.relatedToName as string })),
    ];

    const handleAddRelationship = () => {
        const t = new Date();
        const today = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
        setEditingRelationship(null);
        setRelationshipFormData({ emergencyContact: false, startDate: today });
        setRelationshipErrors({});
        setIsRelationshipDialogOpen(true);
    };

    const handleEditRelationship = (relationship: Relationship) => {
        setEditingRelationship(relationship);
        setRelationshipFormData(relationship);
        setRelationshipErrors({});
        setIsRelationshipDialogOpen(true);
    };

    const handleSaveRelationship = () => {
        const errors: Record<string, string> = {};
        if (!relationshipFormData.relatedTo) errors.relatedTo = "Select who this relationship is with.";
        if (!relationshipFormData.relationship) errors.relationship = "Select a relationship.";
        if (!relationshipFormData.startDate) errors.startDate = "Enter a start date.";
        setRelationshipErrors(errors);
        if (Object.keys(errors).length) return;

        if (editingRelationship) {
            setRelationships(relationships.map(r => 
                r.id === editingRelationship.id 
                    ? { ...editingRelationship, ...relationshipFormData } as Relationship
                    : r
            ));

        } else {
            // Calculate next sort order if this is an emergency contact
            let sortOrder: number | undefined;
            let isPrimary = false;
            
            if (relationshipFormData.emergencyContact) {
                const maxSortOrder = emergencyContacts.length > 0
                    ? Math.max(...emergencyContacts.map(ec => ec.sortOrder))
                    : 0;
                sortOrder = maxSortOrder + 1;
                isPrimary = emergencyContacts.length === 0; // First one becomes primary
            }

            const newRelationship: Relationship = {
                id: Date.now().toString(),
                relatedTo: relationshipFormData.relatedTo || "",
                relationship: relationshipFormData.relationship || "",
                startDate: relationshipFormData.startDate || "",
                endDate: relationshipFormData.endDate || "",
                involvementLevel: relationshipFormData.involvementLevel || "",
                relationshipQuality: relationshipFormData.relationshipQuality || "",
                comments: relationshipFormData.comments || "",
                emergencyContact: relationshipFormData.emergencyContact || false,
                emergencyContactSortOrder: sortOrder,
                emergencyContactIsPrimary: isPrimary,
                legalGuardian: relationshipFormData.legalGuardian || false,
                eligibleForPass: relationshipFormData.eligibleForPass || false,
                hasNotes: relationshipFormData.hasNotes || false
            };
            setRelationships([...relationships, newRelationship]);

        }
        setIsRelationshipDialogOpen(false);
        setRelationshipFormData({});
    };

    const handleDeleteRelationship = (id: string) => {
        setRelationships(relationships.filter(r => r.id !== id));

    };

    // Constituent Handlers
    const [constituentErrors, setConstituentErrors] = useState<Record<string, string>>({});
    const setConstituentField = (key: string, value: unknown) => {
        setConstituentFormData((d) => ({ ...d, [key]: value }));
        setConstituentErrors((e) => {
            if (!e[key]) return e;
            const { [key]: _removed, ...rest } = e;
            return rest;
        });
    };

    const handleAddConstituent = () => {
        const t = new Date();
        const today = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
        setConstituentFormData({ constituentType: "Individual", startDate: today, isActiveConstituent: "No" } as Partial<Constituent>);
        setConstituentErrors({});
        setIsConstituentDialogOpen(true);
    };

    const handleSaveConstituent = () => {
        const d = constituentFormData as Partial<Constituent> & { isActiveConstituent?: string };
        const errors: Record<string, string> = {};
        if (!d.constituentType) errors.constituentType = "Select a constituent type.";
        if (!d.firstName?.trim()) errors.firstName = "Enter a first name.";
        if (!d.lastName?.trim()) errors.lastName = "Enter a last name.";
        if (!d.startDate) errors.startDate = "Enter a start date.";
        if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) errors.email = "Enter a valid email address.";
        setConstituentErrors(errors);
        if (Object.keys(errors).length) return;

        // Add the new constituent to the Relationships table.
        const id = `new-${Date.now()}`;
        const name = `${d.firstName!.trim()} ${d.lastName!.trim()}`;
        setRelationships((rs) => [
            ...rs,
            {
                id,
                relatedTo: id,
                relatedToName: name,
                relationship: d.relationship || "",
                startDate: d.startDate || "",
                endDate: d.endDate || "",
                involvementLevel: "",
                relationshipQuality: "",
                comments: "",
                emergencyContact: false,
                legalGuardian: !!d.legalGuardian,
                eligibleForPass: !!d.eligibleForPass,
                hasNotes: false,
            } as Relationship,
        ]);
        setIsConstituentDialogOpen(false);
        setConstituentFormData({});
    };

    // Emergency Contact Handlers
    const handleAddEmergencyContact = () => {
        if (isAddingInlineEC || inlineEditingECId) return;
        const selectedId = relationshipFormData.relatedTo || "";
        const details = mockConstituentDetails[selectedId];
        // If a constituent is selected and found in lookup, use it; otherwise fall back to first available entry
        const fallbackDetails = Object.values(mockConstituentDetails)[0];
        const resolvedDetails = details || fallbackDetails;
        setInlineECAddData({
            name: resolvedDetails?.name || "",
            relationship: "",
            phone: resolvedDetails?.phone || "",
            address: resolvedDetails?.address || "",
        });
        setIsAddingInlineEC(true);
    };

    const handleEditEmergencyContact = (contact: EmergencyContact) => {
        if (isAddingInlineEC || inlineEditingECId) return;
        setInlineECEditData({
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            address: contact.address,
        });
        setInlineEditingECId(contact.id);
    };

    const handleSaveInlineECEdit = () => {
        if (!inlineECEditData.relationship) {
            return;
        }
        // Update the relationship's relationship type
        setRelationships(relationships.map(rel =>
            rel.id === inlineEditingECId
                ? { ...rel, relationship: inlineECEditData.relationship }
                : rel
        ));
        setInlineEditingECId(null);
    };

    const handleCancelInlineECEdit = () => {
        setInlineEditingECId(null);
    };

    const handleSaveInlineECAdd = () => {
        if (!inlineECAddData.relationship) {
            return;
        }
        // This is for adding emergency contacts within the popup - not implemented yet
        // For now, just close the inline add
        setIsAddingInlineEC(false);
        setInlineECAddData({ name: "", relationship: "", phone: "", address: "" });
    };

    const handleCancelInlineECAdd = () => {
        setIsAddingInlineEC(false);
        setInlineECAddData({ name: "", relationship: "", phone: "", address: "" });
    };

    const handleDeleteEmergencyContact = (id: string) => {
        // Check if this is the Primary contact
        const contactToDelete = relationships.find(rel => rel.id === id);
        const isPrimary = contactToDelete?.emergencyContactIsPrimary;
        
        // Show confirmation dialog
        setDeletingECId(id);
        setIsDeleteECConfirmOpen(true);
    };

    const handleConfirmDeleteEmergencyContact = () => {
        if (deletingECId) {
            const contactToDelete = relationships.find(rel => rel.id === deletingECId);
            const isPrimary = contactToDelete?.emergencyContactIsPrimary;
            
            // If deleting primary, auto-assign next contact as primary
            setRelationships(prevRelationships => {
                const updatedRelationships = prevRelationships.map(rel =>
                    rel.id === deletingECId
                        ? { ...rel, emergencyContact: false, emergencyContactSortOrder: undefined, emergencyContactIsPrimary: undefined }
                        : rel
                );
                
                // If we deleted the primary, find the next emergency contact and make it primary
                if (isPrimary) {
                    const remainingECs = updatedRelationships
                        .filter(rel => rel.emergencyContact)
                        .sort((a, b) => (a.emergencyContactSortOrder || 999) - (b.emergencyContactSortOrder || 999));
                    
                    if (remainingECs.length > 0) {
                        const nextPrimaryId = remainingECs[0].id;
                        return updatedRelationships.map(rel =>
                            rel.id === nextPrimaryId
                                ? { ...rel, emergencyContactIsPrimary: true }
                                : rel
                        );
                    }
                }
                
                return updatedRelationships;
            });
        }
        // Close dialog and reset
        setIsDeleteECConfirmOpen(false);
        setDeletingECId(null);
    };

    const handleCancelDeleteEmergencyContact = () => {
        setIsDeleteECConfirmOpen(false);
        setDeletingECId(null);
    };

    const handleSetPrimaryContact = (id: string) => {
        // Check if there's already a primary contact
        const currentPrimary = relationships.find(rel => rel.emergencyContact && rel.emergencyContactIsPrimary);
        
        if (currentPrimary && currentPrimary.id !== id) {
            // Show conflict dialog
            setNewPrimaryId(id);
            setIsPrimaryConflictDialogOpen(true);
        } else {
            // No conflict, proceed with setting primary
            setRelationships(relationships.map(rel => {
                if (rel.emergencyContact) {
                    return {
                        ...rel,
                        emergencyContactIsPrimary: rel.id === id
                    };
                }
                return rel;
            }));
        }
    };

    const handleConfirmPrimaryChange = () => {
        if (!newPrimaryId) return;

        // Find the current primary and the new primary contacts
        const currentPrimary = relationships.find(rel => rel.emergencyContact && rel.emergencyContactIsPrimary);
        const newPrimary = relationships.find(rel => rel.id === newPrimaryId);

        // Update primary status and swap sort orders
        setRelationships(relationships.map(rel => {
            if (rel.emergencyContact) {
                if (rel.id === newPrimaryId) {
                    // New primary gets the old primary's sort order (or 1 if no current primary)
                    return {
                        ...rel,
                        emergencyContactIsPrimary: true,
                        emergencyContactSortOrder: currentPrimary?.emergencyContactSortOrder || 1
                    };
                } else if (rel.id === currentPrimary?.id) {
                    // Old primary gets the new primary's sort order
                    return {
                        ...rel,
                        emergencyContactIsPrimary: false,
                        emergencyContactSortOrder: newPrimary?.emergencyContactSortOrder || 2
                    };
                } else {
                    // Remove primary status from all others
                    return {
                        ...rel,
                        emergencyContactIsPrimary: false
                    };
                }
            }
            return rel;
        }));

        // Close dialog and reset
        setIsPrimaryConflictDialogOpen(false);
        setNewPrimaryId(null);
    };

    const handleSortOrderChange = (contactId: string, newOrder: number) => {
        const contact = emergencyContacts.find(ec => ec.id === contactId);
        
        if (!contact) return;

        // Primary should never reach here (dropdown is disabled), but safety check
        if (contact.isPrimary && newOrder !== 1) {
            return;
        }

        // Check if sort order already exists
        const existingContact = emergencyContacts.find(ec => ec.sortOrder === newOrder && ec.id !== contactId);
        
        if (existingContact) {
            // Automatically swap positions
            setRelationships(relationships.map(rel => {
                if (rel.id === contactId) {
                    return { ...rel, emergencyContactSortOrder: newOrder };
                }
                if (rel.id === existingContact.id) {
                    return { ...rel, emergencyContactSortOrder: contact.sortOrder };
                }
                return rel;
            }));
        } else {
            // No conflict, update sort order
            setRelationships(relationships.map(rel =>
                rel.id === contactId
                    ? { ...rel, emergencyContactSortOrder: newOrder }
                    : rel
            ));
        }
    };

    // Standalone Emergency Contacts Handlers
    const handleAddEmergencyContactStandalone = () => {
        // Open selection dialog to choose from existing relationships
        setSelectedRelationshipForEC("");
        setIsSelectRelationshipDialogOpen(true);
    };

    const handleSelectRelationshipForEC = () => {
        if (!selectedRelationshipForEC) return;

        // Calculate next sort order
        const maxSortOrder = emergencyContacts.length > 0
            ? Math.max(...emergencyContacts.map(ec => ec.sortOrder))
            : 0;
        const nextSortOrder = maxSortOrder + 1;

        // Mark the selected relationship as an emergency contact
        setRelationships(relationships.map(rel =>
            rel.id === selectedRelationshipForEC
                ? {
                    ...rel,
                    emergencyContact: true,
                    emergencyContactSortOrder: nextSortOrder,
                    emergencyContactIsPrimary: emergencyContacts.length === 0 // First one becomes primary
                }
                : rel
        ));

        // Close dialog and reset
        setIsSelectRelationshipDialogOpen(false);
        setSelectedRelationshipForEC("");
    };

    const handleCreateNewRelationshipFromEC = () => {
        // Close the selection dialog
        setIsSelectRelationshipDialogOpen(false);
        // Open the add relationship dialog
        setEditingRelationship(null);
        const t = new Date();
        const today = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
        setRelationshipFormData({ emergencyContact: true, startDate: today }); // Pre-check emergency contact
        setRelationshipErrors({});
        setIsRelationshipDialogOpen(true);
    };

    const handleRemoveEmergencyContact = (id: string) => {
        // This is the new "Remove" logic that checks Primary guard
        const contactToRemove = relationships.find(rel => rel.id === id);
        const isPrimary = contactToRemove?.emergencyContactIsPrimary;
        
        // Show confirmation dialog with Primary guard logic
        setDeletingECId(id);
        setIsDeleteECConfirmOpen(true);
    };

    const handleEditEmergencyContactStandalone = (contact: EmergencyContact) => {
        // No longer used - fields are read-only
        // Keeping for backwards compatibility but it does nothing
        return;
    };

    const handleSaveInlineECEditStandalone = () => {
        // No longer used - removed inline editing
        return;
    };

    const handleCancelInlineECEditStandalone = () => {
        setInlineEditingECIdStandalone(null);
    };

    const handleSaveInlineECAddStandalone = () => {
        // No longer used - using selection dialog instead
        return;
    };

    const handleCancelInlineECAddStandalone = () => {
        setIsAddingInlineECStandalone(false);
        setInlineECAddDataStandalone({ relationship: "" });
    };

    // Filter relationships based on search term
    const filteredRelationships = relationships.filter(relationship => {
        if (!relationshipsSearchTerm) return true;
        const search = relationshipsSearchTerm.toLowerCase();
        const relatedConstituent = mockRelatedConstituents.find(c => c.id === relationship.relatedTo);
        return (
            relationship.relationship.toLowerCase().includes(search) ||
            (relatedConstituent?.name || relationship.relatedToName || "").toLowerCase().includes(search) ||
            relationship.startDate.toLowerCase().includes(search) ||
            relationship.endDate.toLowerCase().includes(search)
        );
    });



    return (
        <div className="space-y-6 max-w-full">
            {/* Relationships Card */}
            <Card variant="section">
                <CardHeader size="sm" separated className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle size="sm">Relationships</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10" style={{ color: "var(--slds-g-color-text-weak)" }} />
                            <Input
                                aria-label="Search relationships"
                                placeholder="Search..."
                                surface="base"
                                value={relationshipsSearchTerm}
                                onChange={(e) => setRelationshipsSearchTerm(e.target.value)}
                                className="h-8 pl-9 text-[13px]"
                            />
                        </div>
                        <Button size="sm" onClick={handleAddConstituent}>
                            <Plus aria-hidden="true" />
                            Add Constituent
                        </Button>
                        <Button size="sm" onClick={handleAddRelationship}>
                            <Plus aria-hidden="true" />
                            Add Relationship
                        </Button>
                    </div>
                </CardHeader>
                {filteredRelationships.length === 0 ? (
                    <div className="p-4">
                        <EmptyState
                            icon={Search}
                            title={relationshipsSearchTerm ? "No relationships match your search" : "No relationships recorded yet"}
                            className="py-6"
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table style={{ minWidth: "820px" }}>
                            <TableHeader>
                                <TableRow>
                                    <TableHead variant="slds" size="md" className={ccHead}>RELATED TO</TableHead>
                                    <TableHead variant="slds" size="md" className={ccHead}>{relationshipColumnLabel}</TableHead>
                                    <TableHead variant="slds" size="md" className={`${ccHead} whitespace-normal`}>START DATE</TableHead>
                                    <TableHead variant="slds" size="md" className={`${ccHead} whitespace-normal`}>END DATE</TableHead>
                                    <TableHead variant="slds" size="md" className={ccHead}>INVOLVEMENT</TableHead>
                                    <TableHead variant="slds" size="md" className={`${ccHead} text-center whitespace-normal w-[110px]`}>EMERGENCY CONTACT</TableHead>
                                    <TableHead variant="slds" size="md" className={`${ccHead} text-center whitespace-normal w-[110px]`}>LEGAL GUARDIAN</TableHead>
                                    <TableHead variant="slds" size="md" className={`${ccHead} text-center whitespace-normal w-[110px]`}>ELIGIBLE FOR PASS</TableHead>
                                    <TableHead variant="slds" size="md" className={`${ccHead} text-center`}>ACTIONS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRelationships.map((relationship) => {
                                    const relatedConstituent = mockRelatedConstituents.find(c => c.id === relationship.relatedTo);
                                    const name = relatedConstituent?.name || relationship.relatedToName || "\u2014";
                                    const flag = (checked: boolean, label: string) => (
                                        <Checkbox checked={checked} disabled aria-label={`${label}: ${checked ? "Yes" : "No"}`} />
                                    );
                                    return (
                                        <TableRow key={relationship.id}>
                                            <TableCell className="px-4 font-medium whitespace-normal min-w-[180px]" style={{ color: "var(--color-link-blue)" }}>{name}</TableCell>
                                            <TableCell className="px-4">
                                                {memberOptions ? (
                                                    <OverflowList
                                                        maxVisible={1}
                                                        label="Members"
                                                        items={(relationship.relationship
                                                            ? relationshipStaffNames?.[relationship.relationship]
                                                                ? `${relationshipStaffNames[relationship.relationship]} (${relationship.relationship})`
                                                                : relationship.relationship
                                                            : "").split(", ").filter(Boolean)}
                                                    />
                                                ) : relationship.relationship
                                                    ? relationshipStaffNames?.[relationship.relationship]
                                                        ? `${relationshipStaffNames[relationship.relationship]} (${relationship.relationship})`
                                                        : relationship.relationship
                                                    : "\u2014"}
                                            </TableCell>
                                            <TableCell className="px-4 whitespace-nowrap">{isoToMdy(relationship.startDate) || relationship.startDate || "\u2014"}</TableCell>
                                            <TableCell className="px-4 whitespace-nowrap">{relationship.endDate ? (isoToMdy(relationship.endDate) || relationship.endDate) : "\u2014"}</TableCell>
                                            <TableCell className="px-4 whitespace-normal">{relationship.involvementLevel || "\u2014"}</TableCell>
                                            <TableCell className="px-4 text-center">{flag(relationship.emergencyContact, "Emergency contact")}</TableCell>
                                            <TableCell className="px-4 text-center">{flag(relationship.legalGuardian, "Legal guardian")}</TableCell>
                                            <TableCell className="px-4 text-center">{flag(relationship.eligibleForPass, "Eligible for pass")}</TableCell>
                                            <TableCell className="px-4 text-center">
                                                <Button variant="ghost" size="icon-xs" aria-label={`Edit relationship with ${name}`} title="Edit" onClick={() => handleEditRelationship(relationship)}>
                                                    <Pencil aria-hidden="true" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>

            {/* Emergency Contacts Card */}
            {showEmergencyContacts && (
            <Card variant="section">
                <CardHeader size="sm" separated className="flex items-center justify-between gap-2">
                    <CardTitle size="sm">Emergency Contacts</CardTitle>
                    <Button size="sm" onClick={handleAddEmergencyContactStandalone}>
                        <Plus aria-hidden="true" />
                        Add
                    </Button>
                </CardHeader>
                {emergencyContacts.length === 0 ? (
                    <div className="p-4">
                        <EmptyState
                            icon={Plus}
                            title="No emergency contacts added"
                            description='Click "Add" to select from existing relationships.'
                            className="py-6"
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table style={{ minWidth: "900px" }}>
                            <TableHeader>
                                <TableRow>
                                    <TableHead variant="slds" size="md" className="w-[15%]">SORT ORDER</TableHead>
                                    <TableHead variant="slds" size="md" className="w-[18%]">NAME</TableHead>
                                    <TableHead variant="slds" size="md" className="w-[15%]">RELATIONSHIP</TableHead>
                                    <TableHead variant="slds" size="md" className="w-[14%]">PHONE</TableHead>
                                    <TableHead variant="slds" size="md" className="w-[25%]">ADDRESS</TableHead>
                                    <TableHead variant="slds" size="md" className="w-[13%] text-right">ACTIONS</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...emergencyContacts].sort((a, b) => {
                                    if (a.isPrimary) return -1;
                                    if (b.isPrimary) return 1;
                                    return a.sortOrder - b.sortOrder;
                                }).map((contact) => (
                                    <TableRow key={contact.id}>
                                        <TableCell className="px-4">
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={String(contact.sortOrder)}
                                                    onValueChange={(value) => handleSortOrderChange(contact.id, parseInt(value))}
                                                    disabled={contact.isPrimary}
                                                >
                                                    <SelectTrigger surface="base" size="sm" className="w-16" aria-label={`Sort order for ${contact.name}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {contact.isPrimary ? (
                                                            <SelectItem value="1">1</SelectItem>
                                                        ) : (
                                                            Array.from({ length: emergencyContacts.length }, (_, i) => i + 1)
                                                                .filter(pos => pos !== 1)
                                                                .map(pos => <SelectItem key={pos} value={String(pos)}>{pos}</SelectItem>)
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {contact.isPrimary && <Badge variant="success">Primary</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 font-medium truncate" title={contact.name} style={{ color: "var(--color-link-blue)" }}>{contact.name}</TableCell>
                                        <TableCell className="px-4 truncate" title={contact.relationship}>{contact.relationship}</TableCell>
                                        <TableCell className="px-4 whitespace-nowrap">{contact.phone}</TableCell>
                                        <TableCell className="px-4 truncate" title={contact.address}>{contact.address}</TableCell>
                                        <TableCell className="px-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {!contact.isPrimary && (
                                                    <Button variant="link" size="sm" className="h-auto px-1" onClick={() => handleSetPrimaryContact(contact.id)}>
                                                        Set Primary
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    aria-label={`Remove ${contact.name} from emergency contacts`}
                                                    title="Remove from emergency contacts"
                                                    onClick={() => handleRemoveEmergencyContact(contact.id)}
                                                    className="text-[var(--slds-g-color-error-base-40,#c23934)] hover:text-[#c23934]"
                                                >
                                                    <XIcon aria-hidden="true" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>
            )}

            {/* Relationship Dialog (design-system sized Dialog + fields) */}
            <Dialog open={isRelationshipDialogOpen} onOpenChange={setIsRelationshipDialogOpen}>
                <DialogContent size="lg">
                    <DialogHeader>
                        <DialogTitle>{editingRelationship ? "Edit Relationship" : "Add Relationship"}</DialogTitle>
                        <DialogDescription>
                            {editingRelationship ? "Update the relationship details below." : "Enter the relationship details below."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogBody className="space-y-5 max-h-[65vh] overflow-y-auto">
                        <div className="space-y-1.5">
                            <FieldLabel required htmlFor="ar-related" error={!!relationshipErrors.relatedTo}>Related to</FieldLabel>
                            <SearchableSelect
                                id="ar-related"
                                value={relationshipFormData.relatedTo || ""}
                                onValueChange={(v) => setRelationshipField("relatedTo", v)}
                                options={relatedToOptions}
                                placeholder="Search constituent..."
                                searchPlaceholder="Search constituent..."
                                emptyMessage="No constituents found."
                            />
                            {relationshipErrors.relatedTo && <FieldError>{relationshipErrors.relatedTo}</FieldError>}
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel required htmlFor="ar-relationship" error={!!relationshipErrors.relationship}>Relationship</FieldLabel>
                            <Select value={relationshipFormData.relationship || ""} onValueChange={(v) => setRelationshipField("relationship", v)}>
                                <SelectTrigger id="ar-relationship" surface="base" aria-invalid={!!relationshipErrors.relationship || undefined}>
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[260px]">
                                    {(relationshipOptions ?? RELATIONSHIP_TYPE_OPTIONS).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {relationshipErrors.relationship && <FieldError>{relationshipErrors.relationship}</FieldError>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <FieldLabel required htmlFor="ar-start" error={!!relationshipErrors.startDate}>Start Date</FieldLabel>
                                <DateInput id="ar-start" value={isoToMdy(relationshipFormData.startDate || "")} onChange={(v) => setRelationshipField("startDate", mdyToIso(v))} aria-invalid={!!relationshipErrors.startDate} />
                                {relationshipErrors.startDate && <FieldError>{relationshipErrors.startDate}</FieldError>}
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="ar-end">End Date</FieldLabel>
                                <DateInput id="ar-end" value={isoToMdy(relationshipFormData.endDate || "")} onChange={(v) => setRelationshipField("endDate", mdyToIso(v))} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="ar-involvement">{`How involved is the constituent with ${subjectName}?`}</FieldLabel>
                            <Select value={relationshipFormData.involvementLevel || NONE} onValueChange={(v) => setRelationshipField("involvementLevel", v === NONE ? "" : v)}>
                                <SelectTrigger id="ar-involvement" surface="base"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>--None--</SelectItem>
                                    {INVOLVEMENT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="ar-quality">Quality of Relationship</FieldLabel>
                            <Select value={relationshipFormData.relationshipQuality || NONE} onValueChange={(v) => setRelationshipField("relationshipQuality", v === NONE ? "" : v)}>
                                <SelectTrigger id="ar-quality" surface="base"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>--None--</SelectItem>
                                    {["Positive", "Negative", "Enmeshed", "Turbulent", "Distant"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="ar-comments">Comments and other Relationship details</FieldLabel>
                            <Textarea id="ar-comments" rows={3} value={relationshipFormData.comments || ""} onChange={(e) => setRelationshipField("comments", e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            {([
                                ["adoptedBy", "Adopted By"],
                                ["legalGuardian", "Legal Guardian"],
                                ["eligibleForPass", "Eligible for Pass"],
                            ] as const).map(([key, label]) => (
                                <label key={key} htmlFor={`ar-${key}`} className="flex items-center gap-2 text-[13px] cursor-pointer">
                                    <Checkbox id={`ar-${key}`} checked={!!(relationshipFormData as Record<string, unknown>)[key]} onCheckedChange={(c) => setRelationshipField(key, !!c)} />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRelationshipDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveRelationship}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Relationship Notes Dialog */}
            <Dialog open={!!showRelationshipNotes} onOpenChange={() => setShowRelationshipNotes(null)}>
                <DialogContent className="sm:max-w-xl" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Relationship Notes</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            {relationships.find(r => r.id === showRelationshipNotes)?.comments || "No notes available."}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRelationshipNotes(null)}
                            className="rounded-full text-[13px]"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Constituent Dialog (design-system sized Dialog + fields) */}
            <Dialog open={isConstituentDialogOpen} onOpenChange={setIsConstituentDialogOpen}>
                <DialogContent size="lg">
                    <DialogHeader>
                        <DialogTitle>Add Constituent</DialogTitle>
                        <DialogDescription>Enter the constituent details below.</DialogDescription>
                    </DialogHeader>
                    <DialogBody className="space-y-5 max-h-[65vh] overflow-y-auto">
                        <div className="space-y-1.5">
                            <FieldLabel required htmlFor="ac-type" error={!!constituentErrors.constituentType}>Constituent Type</FieldLabel>
                            <Select value={constituentFormData.constituentType || ""} onValueChange={(v) => setConstituentField("constituentType", v)}>
                                <SelectTrigger id="ac-type" surface="base" aria-invalid={!!constituentErrors.constituentType || undefined}>
                                    <SelectValue placeholder="Please Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Individual">Individual</SelectItem>
                                    <SelectItem value="Organization">Organization</SelectItem>
                                </SelectContent>
                            </Select>
                            {constituentErrors.constituentType && <FieldError>{constituentErrors.constituentType}</FieldError>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <FieldLabel required htmlFor="ac-first" error={!!constituentErrors.firstName}>First Name</FieldLabel>
                                <Input id="ac-first" surface="base" placeholder="Enter first name" value={constituentFormData.firstName || ""} onChange={(e) => setConstituentField("firstName", e.target.value)} aria-invalid={!!constituentErrors.firstName || undefined} />
                                {constituentErrors.firstName && <FieldError>{constituentErrors.firstName}</FieldError>}
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel required htmlFor="ac-last" error={!!constituentErrors.lastName}>Last Name</FieldLabel>
                                <Input id="ac-last" surface="base" placeholder="Enter last name" value={constituentFormData.lastName || ""} onChange={(e) => setConstituentField("lastName", e.target.value)} aria-invalid={!!constituentErrors.lastName || undefined} />
                                {constituentErrors.lastName && <FieldError>{constituentErrors.lastName}</FieldError>}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[13px]" style={{ color: "var(--slds-g-color-text-default)" }}>
                            <span id="ac-rel-label">Constituent is the</span>
                            <div className="w-[220px]">
                                <Select value={constituentFormData.relationship || ""} onValueChange={(v) => setConstituentField("relationship", v)}>
                                    <SelectTrigger surface="base" aria-labelledby="ac-rel-label ac-rel-of">
                                        <SelectValue placeholder="Please Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(relationshipOptions ?? CONSTITUENT_RELATIONSHIP_OPTIONS).map((o) => (
                                            <SelectItem key={o} value={o}>{o}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <span id="ac-rel-of">
                                of <span className="font-medium" style={{ color: "var(--color-brand-primary)" }}>{subjectName}</span>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {([
                                ["adoptedBy", "Adopted By"],
                                ["legalGuardian", "Legal Guardian"],
                                ["eligibleForPass", "Eligible For Pass"],
                            ] as const).map(([key, label]) => (
                                <label key={key} htmlFor={`ac-${key}`} className="flex items-center gap-2 text-[13px] cursor-pointer">
                                    <Checkbox id={`ac-${key}`} checked={!!constituentFormData[key]} onCheckedChange={(c) => setConstituentField(key, !!c)} />
                                    {label}
                                </label>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <FieldLabel required htmlFor="ac-start" error={!!constituentErrors.startDate}>Start Date</FieldLabel>
                                <DateInput id="ac-start" value={isoToMdy(constituentFormData.startDate || "")} onChange={(v) => setConstituentField("startDate", mdyToIso(v))} aria-invalid={!!constituentErrors.startDate} />
                                {constituentErrors.startDate && <FieldError>{constituentErrors.startDate}</FieldError>}
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="ac-end">End Date</FieldLabel>
                                <DateInput id="ac-end" value={isoToMdy(constituentFormData.endDate || "")} onChange={(v) => setConstituentField("endDate", mdyToIso(v))} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="ac-active">Is this an active constituent?</FieldLabel>
                            <Select value={constituentFormData.isActiveConstituent || "No"} onValueChange={(v) => setConstituentField("isActiveConstituent", v)}>
                                <SelectTrigger id="ac-active" surface="base"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Card variant="section">
                            <CardHeader size="sm" separated>
                                <CardTitle size="sm">Phone Info</CardTitle>
                            </CardHeader>
                            <CardContent size="sm" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="ac-phone">Phone</FieldLabel>
                                    <Input id="ac-phone" surface="base" placeholder="(xxx) xxx-xxxx" value={constituentFormData.phone || ""} onChange={(e) => setConstituentField("phone", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="ac-ext">Extension</FieldLabel>
                                    <Input id="ac-ext" surface="base" placeholder="Enter extension" value={constituentFormData.phoneExtension || ""} onChange={(e) => setConstituentField("phoneExtension", e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="ac-phone-type">Phone Type</FieldLabel>
                                <Select value={constituentFormData.phoneType || ""} onValueChange={(v) => setConstituentField("phoneType", v)}>
                                    <SelectTrigger id="ac-phone-type" surface="base"><SelectValue placeholder="Please Select" /></SelectTrigger>
                                    <SelectContent>
                                        {["Mobile", "Home", "Work", "Other"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            </CardContent>
                        </Card>

                        <Card variant="section">
                            <CardHeader size="sm" separated>
                                <CardTitle size="sm">Email Info</CardTitle>
                            </CardHeader>
                            <CardContent size="sm" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="ac-email" error={!!constituentErrors.email}>Email</FieldLabel>
                                    <Input id="ac-email" type="email" surface="base" placeholder="Enter email" value={constituentFormData.email || ""} onChange={(e) => setConstituentField("email", e.target.value)} aria-invalid={!!constituentErrors.email || undefined} />
                                    {constituentErrors.email && <FieldError>{constituentErrors.email}</FieldError>}
                                </div>
                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="ac-email-type">Email Type</FieldLabel>
                                    <Select value={constituentFormData.emailType || ""} onValueChange={(v) => setConstituentField("emailType", v)}>
                                        <SelectTrigger id="ac-email-type" surface="base"><SelectValue placeholder="Please Select" /></SelectTrigger>
                                        <SelectContent>
                                            {["Personal", "Work", "Other"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            </CardContent>
                        </Card>

                        <Card variant="section">
                            <CardHeader size="sm" separated>
                                <CardTitle size="sm">Address Info</CardTitle>
                            </CardHeader>
                            <CardContent size="sm" className="space-y-4">
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="ac-street">Street Address</FieldLabel>
                                <Input id="ac-street" surface="base" placeholder="Enter Street Address" value={constituentFormData.streetAddress || ""} onChange={(e) => setConstituentField("streetAddress", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="ac-line2">Address Line 2</FieldLabel>
                                <Input id="ac-line2" surface="base" placeholder="Apartment, suite, etc." value={constituentFormData.addressLine2 || ""} onChange={(e) => setConstituentField("addressLine2", e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="ac-city">City</FieldLabel>
                                    <Input id="ac-city" surface="base" placeholder="Enter City" value={constituentFormData.city || ""} onChange={(e) => setConstituentField("city", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="ac-state">State</FieldLabel>
                                    <Select value={constituentFormData.state || ""} onValueChange={(v) => setConstituentField("state", v)}>
                                        <SelectTrigger id="ac-state" surface="base"><SelectValue placeholder="Select an Option" /></SelectTrigger>
                                        <SelectContent className="max-h-[260px]">
                                            {US_STATE_CODES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="ac-zip">Zip Code</FieldLabel>
                                    <Input id="ac-zip" surface="base" placeholder="Enter Zip" value={constituentFormData.zipCode || ""} onChange={(e) => setConstituentField("zipCode", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <FieldLabel htmlFor="ac-zip4">Zip +4</FieldLabel>
                                    <Input id="ac-zip4" surface="base" placeholder="Enter Zip plus4" value={constituentFormData.zipPlus4 || ""} onChange={(e) => setConstituentField("zipPlus4", e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="ac-addr-type">Address Type</FieldLabel>
                                <Select value={constituentFormData.addressType || ""} onValueChange={(v) => setConstituentField("addressType", v)}>
                                    <SelectTrigger id="ac-addr-type" surface="base"><SelectValue placeholder="Select an Option" /></SelectTrigger>
                                    <SelectContent>
                                        {["Home", "Work", "Mailing", "Other"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            </CardContent>
                        </Card>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConstituentDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveConstituent}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Emergency Contact Confirmation Dialog */}
            <Dialog open={isDeleteECConfirmOpen} onOpenChange={setIsDeleteECConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    {(() => {
                        const contactToDelete = relationships.find(rel => rel.id === deletingECId);
                        const isPrimary = contactToDelete?.emergencyContactIsPrimary;
                        const remainingECs = emergencyContacts.filter(ec => ec.id !== deletingECId);
                        const nextPrimary = remainingECs.length > 0 ? remainingECs[0] : null;

                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-[15px] font-semibold">
                                        {isPrimary ? 'Remove Primary Emergency Contact' : 'Remove Emergency Contact'}
                                    </DialogTitle>
                                    <DialogDescription className="text-[13px] text-[#3e3e3c]">
                                        {isPrimary ? (
                                            <>
                                                This is the <strong>Primary Emergency Contact</strong>. 
                                                {nextPrimary ? (
                                                    <>
                                                        {' '}If you proceed, <strong>{nextPrimary.name}</strong> will automatically become the new Primary Emergency Contact.
                                                    </>
                                                ) : (
                                                    ' This is the last emergency contact.'
                                                )}
                                            </>
                                        ) : (
                                            'Are you sure you want to remove this person from the Emergency Contact list?'
                                        )}
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelDeleteEmergencyContact}
                                        className="rounded-full text-[13px]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleConfirmDeleteEmergencyContact}
                                        className="rounded-full text-[13px] text-white hover:bg-[#c23934]/90"
                                        style={{ backgroundColor: '#c23934' }}
                                    >
                                        Remove
                                    </Button>
                                </DialogFooter>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Select Relationship for Emergency Contact Dialog (design-system sized Dialog) */}
            <Dialog
                open={isSelectRelationshipDialogOpen}
                onOpenChange={(open) => {
                    setIsSelectRelationshipDialogOpen(open);
                    if (!open) setSelectedRelationshipForEC("");
                }}
            >
                <DialogContent size="md">
                    <DialogHeader>
                        <DialogTitle>Add Emergency Contact</DialogTitle>
                        <DialogDescription>Select an existing relationship to add as an emergency contact.</DialogDescription>
                    </DialogHeader>
                    <DialogBody className="space-y-4">
                        {availableRelationshipsForEC.length > 0 ? (
                            <>
                                <div className="space-y-1.5">
                                    <FieldLabel required htmlFor="select-relationship">Select Relationship</FieldLabel>
                                    <Select value={selectedRelationshipForEC} onValueChange={setSelectedRelationshipForEC}>
                                        <SelectTrigger id="select-relationship" surface="base">
                                            <SelectValue placeholder="--Select a relationship--" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRelationshipsForEC.map((rel) => (
                                                <SelectItem key={rel.id} value={rel.id}>
                                                    {rel.name}{rel.relationship ? ` · ${rel.relationship}` : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="pt-4 border-t border-border space-y-2">
                                    <p className="text-[13px]" style={{ color: "var(--slds-g-color-text-weak)" }}>
                                        Don't see the person you're looking for?
                                    </p>
                                    <Button variant="outline-primary" size="sm" onClick={handleCreateNewRelationshipFromEC}>
                                        <Plus aria-hidden="true" />
                                        Create New Relationship
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-4">
                                <EmptyState
                                    icon={Users}
                                    title="No relationships available"
                                    description="All existing relationships are already added as emergency contacts."
                                />
                                {/* EmptyState does not render its own action, so the button sits below it. */}
                                <Button onClick={handleCreateNewRelationshipFromEC}>
                                    <Plus aria-hidden="true" />
                                    Create New Relationship
                                </Button>
                            </div>
                        )}
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsSelectRelationshipDialogOpen(false);
                                setSelectedRelationshipForEC("");
                            }}
                        >
                            Cancel
                        </Button>
                        {availableRelationshipsForEC.length > 0 && (
                            <Button onClick={handleSelectRelationshipForEC} disabled={!selectedRelationshipForEC}>
                                Add Emergency Contact
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Primary Conflict Dialog */}
            <Dialog open={isPrimaryConflictDialogOpen} onOpenChange={setIsPrimaryConflictDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    {(() => {
                        const currentPrimary = relationships.find(rel => rel.emergencyContact && rel.emergencyContactIsPrimary);
                        const newPrimary = relationships.find(rel => rel.id === newPrimaryId);
                        const currentPrimaryContact = emergencyContacts.find(ec => ec.id === currentPrimary?.id);
                        const newPrimaryContact = emergencyContacts.find(ec => ec.id === newPrimaryId);

                        return (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-[15px] font-semibold">Change Primary Emergency Contact?</DialogTitle>
                                    <DialogDescription className="text-[13px] text-[#3e3e3c]">
                                        <strong>{currentPrimaryContact?.name}</strong> is currently set as the Primary Emergency Contact.
                                        {' '}Would you like to change it to <strong>{newPrimaryContact?.name}</strong>?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsPrimaryConflictDialogOpen(false);
                                            setNewPrimaryId(null);
                                        }}
                                        className="rounded-full text-[13px]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleConfirmPrimaryChange}
                                        className="rounded-full text-[13px]"
                                        style={{ backgroundColor: '#145F33' }}
                                    >
                                        Change Primary
                                    </Button>
                                </DialogFooter>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
