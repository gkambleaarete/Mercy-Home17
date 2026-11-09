import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Edit2, Save, Plus, X, Check, AlertCircle, Calendar, User, Phone, Home, Users, FileText, Link, AlertTriangle, Pill, Target, Briefcase, Stethoscope, ChevronDown, ChevronUp, Trash2 } from "@/app/lib/lucide-icons";
import { DocumentsSection } from "./DocumentsSection";
import { CampusRestrictionsSection } from "./CampusRestrictionsSection";
import { CPIHoldsSection } from "./CPIHoldsSection";
import { cn } from "../../lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso } from "../../lib/dateFormat";

interface ProfileContentRendererProps {
    activeDropdownItem: string;
    activeHorizontalTab: string;
    setActiveHorizontalTab: (tab: string) => void;
}

interface Language {
    id: string;
    language: string;
    proficiency: string;
}

export function ProfileContentRenderer({ activeDropdownItem, activeHorizontalTab, setActiveHorizontalTab }: ProfileContentRendererProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [pronounsExpanded, setPronounsExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    
    // Notes state management
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [noteFormData, setNoteFormData] = useState({
        date: localTodayIso(),
        time: new Date().toTimeString().slice(0, 5),
        classification: 'general',
        subject: '',
        content: '',
        noteType: 'case-note',
        timeline: 'current',
        noteFor: 'aaron-ace',
        recordingForm: '',
        primaryKey: '',
        noteOwner: 'current-user'
    });
    
    const [notes, setNotes] = useState([
        {
            id: '1',
            date: '01/10/2025',
            time: '2:30 PM',
            subject: 'Weekly Progress Review',
            classification: 'general',
            noteType: 'Case Note',
            owner: 'Sarah Johnson',
            content: 'Aaron showed positive engagement in group therapy sessions this week. He participated actively in discussions and demonstrated improved communication skills with peers. Continues to show progress in managing emotional responses.',
            timeline: 'current',
            noteFor: 'Aaron Ace',
            recordingForm: 'standard',
            primaryKey: 'NOTE-001'
        },
        {
            id: '2',
            date: '01/08/2025',
            time: '10:00 AM',
            subject: 'Family Contact Log',
            classification: 'therapeutic',
            noteType: 'Contact Log',
            owner: 'Mike Davis',
            content: 'Spoke with aunt Sandy regarding upcoming family visit scheduled for this weekend. She confirmed availability and expressed excitement about seeing Aaron. Discussed visit guidelines and expectations.',
            timeline: 'current',
            noteFor: 'Aaron Ace',
            recordingForm: 'standard',
            primaryKey: 'NOTE-002'
        },
        {
            id: '3',
            date: '01/05/2025',
            time: '4:15 PM',
            subject: 'Behavioral Observation',
            classification: 'behavioral',
            noteType: 'Progress Note',
            owner: 'Jennifer Lee',
            content: 'Demonstrated improved coping strategies during stressful situation in classroom today. Used breathing techniques learned in therapy. Teacher reported positive interaction with classmates during group project.',
            timeline: 'current',
            noteFor: 'Aaron Ace',
            recordingForm: 'detailed',
            primaryKey: 'NOTE-003'
        }
    ]);
    
    // Form state for Demographics
    const [formData, setFormData] = useState({
        prefix: "",
        firstName: "Aaron",
        middleName: "",
        lastName: "Ace",
        suffix: "",
        preferredName: "",
        ssn: "",
        pronounSelection: "he-him",
        otherPronoun: "",
        sex: "Male",
        dateOfBirth: "01/15/2010",
        gender: "Male",
        maritalStatus: "",
        religion: "",
        ethnicity: "",
        deceased: false
    });

    const [languages, setLanguages] = useState<Language[]>([
        { id: "1", language: "English", proficiency: "Native" }
    ]);

    const [isAddingLanguage, setIsAddingLanguage] = useState(false);
    const [newLanguage, setNewLanguage] = useState({ language: "", proficiency: "" });

    const handleAddLanguage = () => {
        if (newLanguage.language && newLanguage.proficiency) {
            setLanguages([...languages, { id: Date.now().toString(), ...newLanguage }]);
            setNewLanguage({ language: "", proficiency: "" });
            setIsAddingLanguage(false);
        }
    };

    const handleRemoveLanguage = (id: string) => {
        setLanguages(languages.filter(lang => lang.id !== id));
    };

    // Notes handlers
    const handleNewNote = () => {
        setSelectedNoteId(null);
        setNoteFormData({
            date: localTodayIso(),
            time: new Date().toTimeString().slice(0, 5),
            classification: 'general',
            subject: '',
            content: '',
            noteType: 'case-note',
            timeline: 'current',
            noteFor: 'aaron-ace',
            recordingForm: '',
            primaryKey: '',
            noteOwner: 'current-user'
        });
        setShowNoteForm(true);
    };

    const handleNoteRowClick = (noteId: string) => {
        const note = notes.find(n => n.id === noteId);
        if (note) {
            setSelectedNoteId(noteId);
            setNoteFormData({
                date: note.date.split('/').reverse().join('-'),
                time: note.time,
                classification: note.classification,
                subject: note.subject,
                content: note.content,
                noteType: note.noteType.toLowerCase().replace(' ', '-'),
                timeline: note.timeline,
                noteFor: note.noteFor.toLowerCase().replace(' ', '-'),
                recordingForm: note.recordingForm,
                primaryKey: note.primaryKey,
                noteOwner: note.owner.toLowerCase().replace(' ', '-')
            });
            setShowNoteForm(true);
        }
    };

    const handleSaveNote = () => {
        const formattedDate = formatMdy(new Date(noteFormData.date));
        
        const formattedTime = new Date(`2000-01-01T${noteFormData.time}`).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });

        const classificationLabels: Record<string, string> = {
            'general': 'general',
            'medical': 'medical',
            'behavioral': 'behavioral',
            'educational': 'educational',
            'therapeutic': 'therapeutic'
        };

        const noteTypeLabels: Record<string, string> = {
            'case-note': 'Case Note',
            'progress-note': 'Progress Note',
            'incident-report': 'Incident Report',
            'contact-log': 'Contact Log'
        };

        if (selectedNoteId) {
            // Update existing note
            setNotes(notes.map(note => 
                note.id === selectedNoteId 
                    ? {
                        ...note,
                        date: formattedDate,
                        time: formattedTime,
                        subject: noteFormData.subject,
                        classification: classificationLabels[noteFormData.classification] || noteFormData.classification,
                        noteType: noteTypeLabels[noteFormData.noteType] || noteFormData.noteType,
                        content: noteFormData.content,
                        timeline: noteFormData.timeline,
                        noteFor: 'Aaron Ace',
                        recordingForm: noteFormData.recordingForm,
                        owner: 'Current User'
                    }
                    : note
            ));
        } else {
            // Add new note
            const newNote = {
                id: Date.now().toString(),
                date: formattedDate,
                time: formattedTime,
                subject: noteFormData.subject,
                classification: classificationLabels[noteFormData.classification] || noteFormData.classification,
                noteType: noteTypeLabels[noteFormData.noteType] || noteFormData.noteType,
                owner: 'Current User',
                content: noteFormData.content,
                timeline: noteFormData.timeline,
                noteFor: 'Aaron Ace',
                recordingForm: noteFormData.recordingForm,
                primaryKey: `NOTE-${String(notes.length + 1).padStart(3, '0')}`
            };
            setNotes([newNote, ...notes]);
        }
        
        setShowNoteForm(false);
        setSelectedNoteId(null);
    };

    const handleCancelNote = () => {
        setShowNoteForm(false);
        setSelectedNoteId(null);
    };

    const handleDeleteNote = () => {
        if (selectedNoteId) {
            setNotes(notes.filter(note => note.id !== selectedNoteId));
        }
        setShowNoteForm(false);
        setSelectedNoteId(null);
    };

    const handleNoteFormChange = (field: string, value: string) => {
        setNoteFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getClassificationBadgeStyle = (classification: string) => {
        const styles: Record<string, { bg: string, color: string, border: string }> = {
            'general': { bg: 'rgba(33, 150, 243, 0.1)', color: '#2196f3', border: 'rgba(33, 150, 243, 0.3)' },
            'medical': { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336', border: 'rgba(244, 67, 54, 0.3)' },
            'behavioral': { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', border: 'rgba(255, 152, 0, 0.3)' },
            'educational': { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0', border: 'rgba(156, 39, 176, 0.3)' },
            'therapeutic': { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: 'rgba(76, 175, 80, 0.3)' }
        };
        return styles[classification.toLowerCase()] || styles['general'];
    };

    // Roles state management
    const [roles, setRoles] = useState([
        { id: "1", role: "Student", startDate: "09/01/2024", endDate: "", details: "Active enrollment" }
    ]);

    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRole, setNewRole] = useState({ role: "", startDate: "", endDate: "", details: "" });

    const handleAddRole = () => {
        if (newRole.role && newRole.startDate) {
            setRoles([...roles, { id: Date.now().toString(), ...newRole }]);
            setNewRole({ role: "", startDate: "", endDate: "", details: "" });
            setIsAddingRole(false);
        }
    };

    const handleRemoveRole = (id: string) => {
        setRoles(roles.filter(role => role.id !== id));
    };

    // Program Enrollment state management
    const [programEnrollments, setProgramEnrollments] = useState([
        { id: "1", program: "Bernardin", moveInDate: "8/4/2025", moveOutDate: "", stayNumber: "" }
    ]);

    const [isEditingEnrollment, setIsEditingEnrollment] = useState(false);
    const [isAddingEnrollment, setIsAddingEnrollment] = useState(false);
    const [newEnrollment, setNewEnrollment] = useState({ program: "", moveInDate: "", moveOutDate: "", stayNumber: "" });

    const handleAddEnrollment = () => {
        if (newEnrollment.program && newEnrollment.moveInDate) {
            setProgramEnrollments([...programEnrollments, { id: Date.now().toString(), ...newEnrollment }]);
            setNewEnrollment({ program: "", moveInDate: "", moveOutDate: "", stayNumber: "" });
            setIsAddingEnrollment(false);
        }
    };

    const handleRemoveEnrollment = (id: string) => {
        setProgramEnrollments(programEnrollments.filter(enrollment => enrollment.id !== id));
    };

    // Relationships state management
    const [relationships, setRelationships] = useState([
        { 
            id: "1", 
            relationship: "Sandy Ace - Aunt", 
            startDate: "01/15/2020", 
            endDate: "", 
            contactVisitation: "Weekly visits", 
            primaryPhone: "(555) 123-4567", 
            emergencyContact: true, 
            legalGuardian: false, 
            eligibleFor: "Family visits", 
            notes: "Primary contact" 
        },
        { 
            id: "2", 
            relationship: "Shelly Belair - Therapist", 
            startDate: "03/10/2023", 
            endDate: "", 
            contactVisitation: "Bi-weekly sessions", 
            primaryPhone: "(555) 987-6543", 
            emergencyContact: false, 
            legalGuardian: false, 
            eligibleFor: "Therapy sessions", 
            notes: "Licensed therapist" 
        },
        { 
            id: "3", 
            relationship: "Larry Mac - Advocate", 
            startDate: "09/01/2024", 
            endDate: "", 
            contactVisitation: "As needed", 
            primaryPhone: "(555) 456-7890", 
            emergencyContact: false, 
            legalGuardian: false, 
            eligibleFor: "Advocacy support", 
            notes: "Court appointed" 
        }
    ]);

    const [isEditingRelationship, setIsEditingRelationship] = useState(false);
    const [isAddingRelationship, setIsAddingRelationship] = useState(false);
    const [newRelationship, setNewRelationship] = useState({ 
        relationship: "", 
        startDate: "", 
        endDate: "", 
        contactVisitation: "", 
        primaryPhone: "", 
        emergencyContact: false, 
        legalGuardian: false, 
        eligibleFor: "", 
        notes: "" 
    });
    const [relationshipSearchValue, setRelationshipSearchValue] = useState("");
    
    // Ref for new relationship UX improvements
    const newRelationshipRowRef = useRef<HTMLTableRowElement>(null);
    
    // Auto-scroll when adding new relationship
    useEffect(() => {
        if (isAddingRelationship && newRelationshipRowRef.current) {
            // Scroll the row into view
            setTimeout(() => {
                newRelationshipRowRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 100);
        }
    }, [isAddingRelationship]);

    const handleAddRelationship = () => {
        if (newRelationship.relationship && newRelationship.startDate) {
            setRelationships([...relationships, { id: Date.now().toString(), ...newRelationship }]);
            setNewRelationship({ 
                relationship: "", 
                startDate: "", 
                endDate: "", 
                contactVisitation: "", 
                primaryPhone: "", 
                emergencyContact: false, 
                legalGuardian: false, 
                eligibleFor: "", 
                notes: "" 
            });
            setIsAddingRelationship(false);
        }
    };

    const handleRemoveRelationship = (id: string) => {
        setRelationships(relationships.filter(rel => rel.id !== id));
    };

    // Connections state management
    const [connections, setConnections] = useState([
        { 
            id: "CN-001", 
            startDateTime: "01/15/2025 10:00 AM", 
            endDateTime: "01/15/2025 11:00 AM", 
            connection: "Individual Session", 
            attended: true, 
            participants: "Aaron Ace, Sarah Johnson", 
            programs: "Bernardin", 
            homeVisit: false 
        },
        { 
            id: "CN-002", 
            startDateTime: "01/10/2025 2:00 PM", 
            endDateTime: "01/10/2025 3:30 PM", 
            connection: "Family Therapy", 
            attended: true, 
            participants: "Aaron Ace, Sandy Ace, Dr. Smith", 
            programs: "Bernardin", 
            homeVisit: false 
        },
        { 
            id: "CN-003", 
            startDateTime: "01/05/2025 9:00 AM", 
            endDateTime: "01/05/2025 10:00 AM", 
            connection: "Home Visit", 
            attended: true, 
            participants: "Aaron Ace, Case Manager", 
            programs: "Bernardin", 
            homeVisit: true 
        }
    ]);

    const [isEditingConnection, setIsEditingConnection] = useState(false);
    const [isAddingConnection, setIsAddingConnection] = useState(false);
    const [newConnection, setNewConnection] = useState({ 
        startDateTime: "", 
        endDateTime: "", 
        connection: "", 
        attended: false, 
        participants: "", 
        programs: "", 
        homeVisit: false 
    });
    const [connectionSearchValue, setConnectionSearchValue] = useState("");
    const [connectionFilters, setConnectionFilters] = useState({
        startDate: "",
        endDate: "",
        participant: "",
        connection: "",
        program: "",
        departments: "",
        homeVisitOnly: false
    });
    const [showConnectionFilters, setShowConnectionFilters] = useState(false);
    
    // Ref for new connection UX improvements
    const newConnectionRowRef = useRef<HTMLTableRowElement>(null);
    
    // Auto-scroll when adding new connection
    useEffect(() => {
        if (isAddingConnection && newConnectionRowRef.current) {
            // Scroll the row into view
            setTimeout(() => {
                newConnectionRowRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 100);
        }
    }, [isAddingConnection]);

    const handleAddConnection = () => {
        if (newConnection.startDateTime && newConnection.connection) {
            const newId = `CN-${String(connections.length + 1).padStart(3, '0')}`;
            setConnections([...connections, { id: newId, ...newConnection }]);
            setNewConnection({ 
                startDateTime: "", 
                endDateTime: "", 
                connection: "", 
                attended: false, 
                participants: "", 
                programs: "", 
                homeVisit: false 
            });
            setIsAddingConnection(false);
        }
    };

    const handleRemoveConnection = (id: string) => {
        setConnections(connections.filter(conn => conn.id !== id));
    };

    // Documents state management
    const [documents, setDocuments] = useState([
        { id: "1", name: "Birth Certificate", reference: "BC-2010-001", date: "01/15/2010", expiration: "—", notes: true, renewable: false, status: "received" },
        { id: "2", name: "Social Security Card", reference: "SSC-2010-045", date: "02/20/2010", expiration: "—", notes: false, renewable: false, status: "pending" },
        { id: "3", name: "Immunization Records", reference: "IMM-2024-789", date: "08/10/2024", expiration: "08/10/2025", notes: true, renewable: true, status: "received" },
        { id: "4", name: "Medical Records", reference: "MED-2025-123", date: "01/05/2025", expiration: "—", notes: true, renewable: false, status: "documented" },
        { id: "5", name: "School Records", reference: "SCH-2024-456", date: "09/01/2024", expiration: "—", notes: false, renewable: false, status: "received" },
        { id: "6", name: "Court Order", reference: "CRT-2024-901", date: "12/15/2024", expiration: "12/15/2025", notes: true, renewable: true, status: "pending" },
        { id: "7", name: "Insurance Card", reference: "INS-2025-234", date: "01/01/2025", expiration: "12/31/2025", notes: false, renewable: true, status: "received" },
        { id: "8", name: "Photo ID", reference: "ID-2024-567", date: "06/15/2024", expiration: "06/15/2029", notes: false, renewable: true, status: "documented" }
    ]);

    const handleMarkAsReceived = (id: string) => {
        setDocuments(documents.map(doc => 
            doc.id === id ? { ...doc, status: "received" } : doc
        ));
    };

    const handleMarkAsDocumented = (id: string) => {
        setDocuments(documents.map(doc => 
            doc.id === id ? { ...doc, status: "documented" } : doc
        ));
    };

    const handleToggleNotes = (id: string) => {
        setDocuments(documents.map(doc => 
            doc.id === id ? { ...doc, notes: !doc.notes } : doc
        ));
    };

    const handleToggleRenewable = (id: string) => {
        setDocuments(documents.map(doc => 
            doc.id === id ? { ...doc, renewable: !doc.renewable } : doc
        ));
    };

    // Horizontal Tab Navigation Component
    const HorizontalTabNav = ({ tabs, activeTab, onTabChange }: { tabs: Array<{ id: string; label: string; icon?: any }>, activeTab: string, onTabChange: (id: string) => void }) => (
        <div className="bg-white rounded-lg shadow-sm mb-6">
            <nav className="flex items-center gap-6 border-b min-w-max rounded-lg" style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'white' }}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                onTabChange(tab.id);
                                setIsEditing(false);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-[13px] font-semibold whitespace-nowrap relative transition-colors",
                                activeTab === tab.id && "rounded-t-lg"
                            )}
                            style={{
                                color: activeTab === tab.id ? 'var(--color-brand-primary)' : 'var(--slds-g-color-text-default)',
                                borderBottom: activeTab === tab.id ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                                marginBottom: '-1px'
                            }}
                        >
                            {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );

    // Profile Overview Content - ENTERPRISE PROFESSIONAL UI
    if (activeDropdownItem === "profile-overview") {
        return (
            <div className="p-6 space-y-6 max-w-6xl">
                {/* BASIC INFORMATION SECTION */}
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
                        <h3 className="text-[13px] font-semibold text-[#080707]">Basic Information</h3>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsEditing(!isEditing)} 
                            className="h-7 rounded-full text-[11px] shadow-none"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                color: 'var(--color-brand-primary)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)';
                            }}
                        >
                            {isEditing ? <><Save className="h-3 w-3 mr-1" />Save</> : <><Edit2 className="h-3 w-3 mr-1" />Edit</>}
                        </Button>
                    </div>
                    <div className="p-4 space-y-6">
                        {/* Name Subsection */}
                        <div>
                            <h4 className="text-[12px] font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Name</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* First Name */}
                                <div>
                                    <Label htmlFor="firstName" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        First Name <span className="text-red-600">*</span>
                                    </Label>
                                    <Input 
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        placeholder="Enter first name"
                                        className="h-8 text-[13px]"
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Middle Initial */}
                                <div>
                                    <Label htmlFor="middleName" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Middle Initial
                                    </Label>
                                    <Input 
                                        id="middleName"
                                        value={formData.middleName}
                                        onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                                        placeholder="MI"
                                        maxLength={1}
                                        className="h-8 text-[13px]"
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <Label htmlFor="lastName" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Last Name <span className="text-red-600">*</span>
                                    </Label>
                                    <Input 
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        placeholder="Enter last name"
                                        className="h-8 text-[13px]"
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Suffix */}
                                <div>
                                    <Label htmlFor="suffix" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Suffix
                                    </Label>
                                    <Select value={formData.suffix} onValueChange={(val) => setFormData({...formData, suffix: val})} disabled={!isEditing}>
                                        <SelectTrigger id="suffix" className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="jr">Jr.</SelectItem>
                                            <SelectItem value="sr">Sr.</SelectItem>
                                            <SelectItem value="ii">II</SelectItem>
                                            <SelectItem value="iii">III</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Preferred Name */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                    <Label htmlFor="preferredName" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Preferred Name
                                    </Label>
                                    <Input 
                                        id="preferredName"
                                        value={formData.preferredName}
                                        onChange={(e) => setFormData({...formData, preferredName: e.target.value})}
                                        placeholder="Enter preferred name"
                                        className="h-8 text-[13px]"
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Demographics & Identity Subsection */}
                        <div>
                            <h4 className="text-[12px] font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>Demographics & Identity</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Row 1 */}
                                <div>
                                    <Label htmlFor="sex" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Sex
                                    </Label>
                                    <Select value={formData.sex} onValueChange={(val) => setFormData({...formData, sex: val})} disabled={!isEditing}>
                                        <SelectTrigger id="sex" className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="ethnicity" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Race
                                    </Label>
                                    <Select value={formData.ethnicity} onValueChange={(val) => setFormData({...formData, ethnicity: val})} disabled={!isEditing}>
                                        <SelectTrigger id="ethnicity" className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select race" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Asian">Asian</SelectItem>
                                            <SelectItem value="Black or African American">Black or African American</SelectItem>
                                            <SelectItem value="Hispanic or Latino">Hispanic or Latino</SelectItem>
                                            <SelectItem value="Native American">Native American</SelectItem>
                                            <SelectItem value="White">White</SelectItem>
                                            <SelectItem value="Two or More Races">Two or More Races</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="dob" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Date of Birth
                                    </Label>
                                    <DateInput 
                                        id="dob"
value={isoToMdy(formData.dateOfBirth)}
                                        onChange={(v) => ((e) => setFormData({...formData, dateOfBirth: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                        className="h-8 text-[13px]"
                                        disabled={!isEditing}
                                    />
                                </div>

                                {/* Row 2 */}
                                <div>
                                    <Label htmlFor="ssn" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        SSN
                                    </Label>
                                    <Input 
                                        id="ssn"
                                        type="password"
                                        value={formData.ssn}
                                        onChange={(e) => setFormData({...formData, ssn: e.target.value})}
                                        placeholder="XXX-XX-XXXX"
                                        className="h-8 text-[13px]"
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="gender" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Gender
                                    </Label>
                                    <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})} disabled={!isEditing}>
                                        <SelectTrigger id="gender" className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Non-binary">Non-binary</SelectItem>
                                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="maritalStatus" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Marital Status
                                    </Label>
                                    <Select value={formData.maritalStatus} onValueChange={(val) => setFormData({...formData, maritalStatus: val})} disabled={!isEditing}>
                                        <SelectTrigger id="maritalStatus" className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Single">Single</SelectItem>
                                            <SelectItem value="Married">Married</SelectItem>
                                            <SelectItem value="Divorced">Divorced</SelectItem>
                                            <SelectItem value="Widowed">Widowed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 3 */}
                                <div>
                                    <Label htmlFor="pronouns" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Pronouns
                                    </Label>
                                    <Select value={formData.pronounSelection} onValueChange={(val) => setFormData({...formData, pronounSelection: val})} disabled={!isEditing}>
                                        <SelectTrigger id="pronouns" className="h-8 text-[13px]">
                                            <SelectValue placeholder="Select pronouns" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="he-him">He/Him/His</SelectItem>
                                            <SelectItem value="she-her">She/Her/Hers</SelectItem>
                                            <SelectItem value="they-them">They/Them/Theirs</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="religion" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                        Religion
                                    </Label>
                                    <Input 
                                        id="religion"
                                        value={formData.religion}
                                        onChange={(e) => setFormData({...formData, religion: e.target.value})}
                                        placeholder="Enter religion"
                                        className="h-8 text-[13px]"
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div>
                                    <Label className="text-[11px] font-medium mb-1.5 block invisible">Deceased</Label>
                                    <div className="flex items-center h-8">
                                        <Checkbox
                                            id="deceased"
                                            checked={formData.deceased}
                                            onCheckedChange={(checked) => setFormData({...formData, deceased: checked as boolean})}
                                            disabled={!isEditing}
                                            className="h-4 w-4"
                                        />
                                        <Label 
                                            htmlFor="deceased" 
                                            className={cn(
                                                "text-[13px] font-normal ml-2 cursor-pointer",
                                                !isEditing && "cursor-default"
                                            )}
                                            style={{ color: 'var(--slds-g-color-text-default)' }}
                                        >
                                            Deceased
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Other Pronoun field (conditional) */}
                            {formData.pronounSelection === "other" && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <Label htmlFor="otherPronoun" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Other Pronoun
                                        </Label>
                                        <Input 
                                            id="otherPronoun"
                                            value={formData.otherPronoun}
                                            onChange={(e) => setFormData({...formData, otherPronoun: e.target.value})}
                                            placeholder="Enter preferred pronouns"
                                            className="h-8 text-[13px]"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* LANGUAGES SECTION */}
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
                        <h3 className="text-[13px] font-semibold text-[#080707]">Languages ({languages.length})</h3>
                        {isEditing && !isAddingLanguage && (
                            <Button
                                size="sm"
                                onClick={() => setIsAddingLanguage(true)}
                                className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                            </Button>
                        )}
                    </div>
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Language</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Proficiency</th>
                                        {isEditing && <th className="px-3 py-2 text-left font-semibold w-20" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {languages.map((lang, index) => (
                                        <tr key={lang.id} style={{ borderBottom: index < languages.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{lang.language}</td>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{lang.proficiency}</td>
                                            {isEditing && (
                                                <td className="px-3 py-3">
                                                    <button
                                                        onClick={() => handleRemoveLanguage(lang.id)}
                                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    
                                    {isAddingLanguage && (
                                        <tr style={{ borderTop: languages.length > 0 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                            <td className="px-3 py-3">
                                                <Input
                                                    value={newLanguage.language}
                                                    onChange={(e) => setNewLanguage({...newLanguage, language: e.target.value})}
                                                    placeholder="Enter language"
                                                    className="h-8 text-[13px]"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <Select 
                                                    value={newLanguage.proficiency} 
                                                    onValueChange={(val) => setNewLanguage({...newLanguage, proficiency: val})}
                                                >
                                                    <SelectTrigger className="h-8 text-[13px]">
                                                        <SelectValue placeholder="Select proficiency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Native">Native</SelectItem>
                                                        <SelectItem value="Fluent">Fluent</SelectItem>
                                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                        <SelectItem value="Basic">Basic</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={handleAddLanguage}
                                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                        title="Save"
                                                    >
                                                        <Check className="h-3.5 w-3.5" style={{ color: 'var(--color-brand-primary)' }} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingLanguage(false);
                                                            setNewLanguage({ language: "", proficiency: "" });
                                                        }}
                                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X className="h-3.5 w-3.5 text-[#c23934]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* HOUSEHOLD DETAILS SECTION */}
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
                        <h3 className="text-[13px] font-semibold text-[#080707]">Household Details</h3>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsEditing(!isEditing)} 
                            className="h-7 rounded-full text-[11px] shadow-none"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                color: 'var(--color-brand-primary)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)';
                            }}
                        >
                            {isEditing ? <><Save className="h-3 w-3 mr-1" />Save</> : <><Edit2 className="h-3 w-3 mr-1" />Edit</>}
                        </Button>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="householdIncome" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Household Income
                                </Label>
                                <Input 
                                    id="householdIncome"
                                    defaultValue="$45,000"
                                    placeholder="Enter household income"
                                    className="h-8 text-[13px]"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="householdSize" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Household Size
                                </Label>
                                <Input 
                                    id="householdSize"
                                    type="number"
                                    defaultValue="4"
                                    placeholder="Enter household size"
                                    className="h-8 text-[13px]"
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROLES SECTION */}
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
                        <h3 className="text-[13px] font-semibold text-[#080707]">Roles ({roles.length})</h3>
                        <div className="flex gap-2">
                            {isEditing && !isAddingRole && (
                                <Button
                                    size="sm"
                                    onClick={() => setIsAddingRole(true)}
                                    className="h-7 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsEditing(!isEditing)} 
                                className="h-7 rounded-full text-[11px] shadow-none"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    color: 'var(--color-brand-primary)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)';
                                }}
                            >
                                {isEditing ? <><Save className="h-3 w-3 mr-1" />Save</> : <><Edit2 className="h-3 w-3 mr-1" />Modify</>}
                            </Button>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Role</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Start Date</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>End Date</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Details</th>
                                        {isEditing && <th className="px-3 py-2 text-left font-semibold w-20" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role, index) => (
                                        <tr key={role.id} style={{ borderBottom: index < roles.length - 1 || isAddingRole ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{role.role}</td>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{role.startDate}</td>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{role.endDate || '—'}</td>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{role.details}</td>
                                            {isEditing && (
                                                <td className="px-3 py-3">
                                                    <button
                                                        onClick={() => handleRemoveRole(role.id)}
                                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    
                                    {isAddingRole && (
                                        <tr>
                                            <td className="px-3 py-3">
                                                <Input
                                                    value={newRole.role}
                                                    onChange={(e) => setNewRole({...newRole, role: e.target.value})}
                                                    placeholder="Enter role"
                                                    className="h-8 text-[13px]"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <DateInput
value={isoToMdy(newRole.startDate)}
                                                    onChange={(v) => ((e) => setNewRole({...newRole, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                    className="h-8 text-[13px]"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <DateInput
value={isoToMdy(newRole.endDate)}
                                                    onChange={(v) => ((e) => setNewRole({...newRole, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                    placeholder="Optional"
                                                    className="h-8 text-[13px]"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <Input
                                                    value={newRole.details}
                                                    onChange={(e) => setNewRole({...newRole, details: e.target.value})}
                                                    placeholder="Enter details"
                                                    className="h-8 text-[13px]"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={handleAddRole}
                                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                        title="Save"
                                                    >
                                                        <Check className="h-3.5 w-3.5" style={{ color: 'var(--color-brand-primary)' }} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingRole(false);
                                                            setNewRole({ role: "", startDate: "", endDate: "", details: "" });
                                                        }}
                                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X className="h-3.5 w-3.5 text-[#c23934]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Program Enrollment Content
    if (activeDropdownItem === "program-enrollment") {
        return (
            <div className="p-6 space-y-6 max-w-6xl">
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
                        <h3 className="text-[13px] font-semibold text-[#080707]">Program Enrollment ({programEnrollments.length})</h3>
                        <div className="flex gap-2">
                            {isEditingEnrollment && !isAddingEnrollment && (
                                <Button 
                                    size="sm" 
                                    onClick={() => setIsAddingEnrollment(true)}
                                    className="h-7 rounded-full text-[11px] bg-[#145F33] hover:bg-[#0f4a26] text-white"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsEditingEnrollment(!isEditingEnrollment)}
                                className="h-7 rounded-full text-[11px] shadow-none"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    color: 'var(--color-brand-primary)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-row-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--slds-g-color-background-base)';
                                }}
                            >
                                {isEditingEnrollment ? <><Save className="h-3 w-3 mr-1" />Save</> : <><Edit2 className="h-3 w-3 mr-1" />Modify</>}
                            </Button>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Program</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Move In Date</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Move Out Date</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Stay Number</th>
                                        {isEditingEnrollment && <th className="px-3 py-2 text-left font-semibold w-20" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {programEnrollments.map((enrollment, index) => (
                                        <tr key={enrollment.id} style={{ borderBottom: index < programEnrollments.length - 1 || isAddingEnrollment ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{enrollment.program}</td>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{enrollment.moveInDate}</td>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{enrollment.moveOutDate || '—'}</td>
                                            <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{enrollment.stayNumber || '—'}</td>
                                            {isEditingEnrollment && (
                                                <td className="px-3 py-3">
                                                    <button
                                                        onClick={() => handleRemoveEnrollment(enrollment.id)}
                                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    
                                    {isAddingEnrollment && (
                                        <tr>
                                            <td className="px-3 py-3">
                                                <Input
                                                    value={newEnrollment.program}
                                                    onChange={(e) => setNewEnrollment({...newEnrollment, program: e.target.value})}
                                                    placeholder="Enter program name"
                                                    className="h-8 text-[13px]"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <DateInput
value={isoToMdy(newEnrollment.moveInDate)}
                                                    onChange={(v) => ((e) => setNewEnrollment({...newEnrollment, moveInDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                    className="h-8 text-[13px]"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <DateInput
value={isoToMdy(newEnrollment.moveOutDate)}
                                                    onChange={(v) => ((e) => setNewEnrollment({...newEnrollment, moveOutDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                    placeholder="Optional"
                                                    className="h-8 text-[13px]"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <Input
                                                    value={newEnrollment.stayNumber}
                                                    onChange={(e) => setNewEnrollment({...newEnrollment, stayNumber: e.target.value})}
                                                    placeholder="Enter stay number"
                                                    className="h-8 text-[13px]"
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={handleAddEnrollment}
                                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                        title="Save"
                                                    >
                                                        <Check className="h-3.5 w-3.5" style={{ color: 'var(--color-brand-primary)' }} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingEnrollment(false);
                                                            setNewEnrollment({ program: "", moveInDate: "", moveOutDate: "", stayNumber: "" });
                                                        }}
                                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X className="h-3.5 w-3.5 text-[#c23934]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Admissions Content (with horizontal tabs)
    if (activeDropdownItem === "admissions") {
        // Mock case management data
        const caseManagementData = [
            {
                id: "CM-2025-001",
                date: "01/15/2025",
                caseManager: "Sarah Johnson",
                status: "Active",
                lastStatusDate: "01/15/2025"
            },
            {
                id: "CM-2024-087",
                date: "11/20/2024",
                caseManager: "Michael Torres",
                status: "Closed",
                lastStatusDate: "12/31/2024"
            },
            {
                id: "CM-2024-052",
                date: "08/04/2024",
                caseManager: "Jennifer Martinez",
                status: "Closed",
                lastStatusDate: "11/19/2024"
            }
        ];

        const filteredData = searchValue 
            ? caseManagementData.filter(item => 
                item.id.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.caseManager.toLowerCase().includes(searchValue.toLowerCase()) ||
                item.status.toLowerCase().includes(searchValue.toLowerCase())
              )
            : caseManagementData;

        return (
            <div className="p-6 space-y-6 max-w-6xl">
                {/* Search Section */}
                <div 
                    className="overflow-hidden"
                    style={{
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        borderRadius: 'var(--slds-c-card-radius-border)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                >
                    <div 
                        className="px-4 py-3"
                        style={{
                            borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                        }}
                    >
                        <h3 className="text-[13px] font-semibold text-[#080707]">Search Case Management</h3>
                    </div>
                    <div className="p-4">
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <Label htmlFor="searchCases" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    Search
                                </Label>
                                <Input 
                                    id="searchCases"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder="Search by ID, Case Manager, or Status"
                                    className="h-8 text-[13px]"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    className="h-8 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                                >
                                    Find
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSearchValue("")}
                                    className="h-8 rounded-full text-[11px] shadow-none"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        color: 'var(--slds-g-color-text-default)'
                                    }}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Case Management Table */}
                <div 
                    className="overflow-hidden"
                    style={{
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        borderRadius: 'var(--slds-c-card-radius-border)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                >
                    <div 
                        className="px-4 py-3"
                        style={{
                            borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                            backgroundColor: 'var(--slds-g-color-background-alt)'
                        }}
                    >
                        <h3 className="text-[13px] font-semibold text-[#080707]">Case Management Records</h3>
                    </div>
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>ID</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Date</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Case Manager</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Status</th>
                                        <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Last Status Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((record, index) => (
                                            <tr key={record.id} style={{ borderBottom: index < filteredData.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    <button className="text-[#145F33] hover:underline">
                                                        {record.id}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{record.date}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{record.caseManager}</td>
                                                <td className="px-3 py-3">
                                                    <Badge 
                                                        className="text-[10px] font-medium px-2 py-0.5" 
                                                        style={{ 
                                                            backgroundColor: record.status === "Active" ? '#4caf50' : '#9e9e9e', 
                                                            color: 'white' 
                                                        }}
                                                    >
                                                        {record.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{record.lastStatusDate}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-3 py-6 text-center" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                No case management records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Relationships & Connections (with horizontal tabs)
    if (activeDropdownItem === "relationships-connections") {
        const tabs = [
            { id: "relationships", label: "Relationships", icon: Users },
            { id: "connections", label: "Connections", icon: Link }
        ];

        return (
            <div className="p-6">
                <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                
                {/* RELATIONSHIPS TAB */}
                {activeHorizontalTab === "relationships" && (
                    <div className="space-y-4">
                        {/* Header with Actions and Search */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Button 
                                    size="sm" 
                                    onClick={() => setIsAddingRelationship(true)}
                                    className="h-8 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white"
                                    disabled={isAddingRelationship}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    New Relationship
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setIsEditingRelationship(!isEditingRelationship)}
                                    className="h-8 rounded-full text-[13px]"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: isEditingRelationship ? 'var(--slds-g-color-background-alt)' : 'var(--slds-g-color-background-base)',
                                        color: 'var(--color-brand-primary)'
                                    }}
                                >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    {isEditingRelationship ? "Done Editing" : "Edit"}
                                </Button>
                            </div>
                            
                            <div className="relative max-w-md flex-1">
                                <Input 
                                    placeholder="Search relationships by name, type, or phone..."
                                    value={relationshipSearchValue}
                                    onChange={(e) => setRelationshipSearchValue(e.target.value)}
                                    className="h-8 text-[13px] pr-8"
                                />
                                {relationshipSearchValue && (
                                    <button
                                        onClick={() => setRelationshipSearchValue("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--slds-g-color-background-alt)] rounded transition-colors"
                                        title="Clear search"
                                    >
                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div 
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-[13px]">
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Relationship</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Start Date</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>End Date</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Contact/Visitation</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Primary Phone</th>
                                            <th className="px-3 py-2 text-center font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Emergency Contact</th>
                                            <th className="px-3 py-2 text-center font-semibold w-32" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Legal Guardian</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Eligible For</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Notes</th>
                                            {isEditingRelationship && <th className="px-3 py-2 text-left font-semibold w-20" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relationships.map((rel, index) => (
                                            <tr key={rel.id} style={{ borderBottom: index < relationships.length - 1 || isAddingRelationship ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rel.relationship}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rel.startDate}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rel.endDate || '—'}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rel.contactVisitation}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rel.primaryPhone}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <Checkbox checked={rel.emergencyContact} disabled={!isEditingRelationship} />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <Checkbox checked={rel.legalGuardian} disabled={!isEditingRelationship} />
                                                </td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rel.eligibleFor}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{rel.notes}</td>
                                                {isEditingRelationship && (
                                                    <td className="px-3 py-3">
                                                        <button
                                                            onClick={() => handleRemoveRelationship(rel.id)}
                                                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        
                                        {isAddingRelationship && (
                                            <tr ref={newRelationshipRowRef}>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        autoFocus
                                                        value={newRelationship.relationship}
                                                        onChange={(e) => setNewRelationship({...newRelationship, relationship: e.target.value})}
                                                        placeholder="Name - Type"
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <DateInput
value={isoToMdy(newRelationship.startDate)}
                                                        onChange={(v) => ((e) => setNewRelationship({...newRelationship, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <DateInput
value={isoToMdy(newRelationship.endDate)}
                                                        onChange={(v) => ((e) => setNewRelationship({...newRelationship, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                        placeholder="Optional"
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        value={newRelationship.contactVisitation}
                                                        onChange={(e) => setNewRelationship({...newRelationship, contactVisitation: e.target.value})}
                                                        placeholder="Contact/Visitation"
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        value={newRelationship.primaryPhone}
                                                        onChange={(e) => setNewRelationship({...newRelationship, primaryPhone: e.target.value})}
                                                        placeholder="Phone"
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <Checkbox 
                                                        checked={newRelationship.emergencyContact}
                                                        onCheckedChange={(checked) => setNewRelationship({...newRelationship, emergencyContact: checked as boolean})}
                                                    />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <Checkbox 
                                                        checked={newRelationship.legalGuardian}
                                                        onCheckedChange={(checked) => setNewRelationship({...newRelationship, legalGuardian: checked as boolean})}
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        value={newRelationship.eligibleFor}
                                                        onChange={(e) => setNewRelationship({...newRelationship, eligibleFor: e.target.value})}
                                                        placeholder="Eligible For"
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        value={newRelationship.notes}
                                                        onChange={(e) => setNewRelationship({...newRelationship, notes: e.target.value})}
                                                        placeholder="Notes"
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={handleAddRelationship}
                                                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                            title="Save"
                                                        >
                                                            <Check className="h-3.5 w-3.5" style={{ color: 'var(--color-brand-primary)' }} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsAddingRelationship(false);
                                                                setNewRelationship({ 
                                                                    relationship: "", 
                                                                    startDate: "", 
                                                                    endDate: "", 
                                                                    contactVisitation: "", 
                                                                    primaryPhone: "", 
                                                                    emergencyContact: false, 
                                                                    legalGuardian: false, 
                                                                    eligibleFor: "", 
                                                                    notes: "" 
                                                                });
                                                            }}
                                                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X className="h-3.5 w-3.5 text-[#c23934]" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONNECTIONS TAB */}
                {activeHorizontalTab === "connections" && (
                    <div className="space-y-4">
                        {/* Header with Actions, Filters Toggle, and Search */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Button 
                                    size="sm" 
                                    onClick={() => setIsAddingConnection(true)}
                                    className="h-8 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white"
                                    disabled={isAddingConnection}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    New Connection
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setIsEditingConnection(!isEditingConnection)}
                                    className="h-8 rounded-full text-[13px]"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: isEditingConnection ? 'var(--slds-g-color-background-alt)' : 'var(--slds-g-color-background-base)',
                                        color: 'var(--color-brand-primary)'
                                    }}
                                >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    {isEditingConnection ? "Done Editing" : "Edit"}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setShowConnectionFilters(!showConnectionFilters)}
                                    className="h-8 rounded-full text-[13px]"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: showConnectionFilters ? 'var(--slds-g-color-background-alt)' : 'var(--slds-g-color-background-base)',
                                        color: 'var(--slds-g-color-text-default)'
                                    }}
                                >
                                    {showConnectionFilters ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                                    Filters
                                </Button>
                            </div>
                            
                            <div className="relative max-w-md flex-1">
                                <Input 
                                    placeholder="Search connections by ID, type, or participant..."
                                    value={connectionSearchValue}
                                    onChange={(e) => setConnectionSearchValue(e.target.value)}
                                    className="h-8 text-[13px] pr-8"
                                />
                                {connectionSearchValue && (
                                    <button
                                        onClick={() => setConnectionSearchValue("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--slds-g-color-background-alt)] rounded transition-colors"
                                        title="Clear search"
                                    >
                                        <X className="h-3.5 w-3.5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Collapsible Filter Section */}
                        {showConnectionFilters && (
                            <div 
                                className="p-4"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    borderRadius: 'var(--slds-c-card-radius-border)',
                                    backgroundColor: 'var(--slds-g-color-background-alt)'
                                }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <Label htmlFor="filterStartDate" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Start Date
                                        </Label>
                                        <DateInput 
                                            id="filterStartDate"
value={isoToMdy(connectionFilters.startDate)}
                                            onChange={(v) => ((e) => setConnectionFilters({...connectionFilters, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                            className="h-8 text-[13px]"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="filterEndDate" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            End Date
                                        </Label>
                                        <DateInput 
                                            id="filterEndDate"
value={isoToMdy(connectionFilters.endDate)}
                                            onChange={(v) => ((e) => setConnectionFilters({...connectionFilters, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                            className="h-8 text-[13px]"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="filterConnection" className="text-[11px] font-medium mb-1.5 block" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                            Connection Type
                                        </Label>
                                        <Select value={connectionFilters.connection} onValueChange={(value) => setConnectionFilters({...connectionFilters, connection: value})}>
                                            <SelectTrigger className="h-8 text-[13px]">
                                                <SelectValue placeholder="All types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="individual">Individual Session</SelectItem>
                                                <SelectItem value="family">Family Therapy</SelectItem>
                                                <SelectItem value="home">Home Visit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox 
                                            checked={connectionFilters.homeVisitOnly}
                                            onCheckedChange={(checked) => setConnectionFilters({...connectionFilters, homeVisitOnly: checked as boolean})}
                                        />
                                        <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Home Visits Only</span>
                                    </label>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setConnectionFilters({
                                            startDate: "",
                                            endDate: "",
                                            participant: "",
                                            connection: "",
                                            program: "",
                                            departments: "",
                                            homeVisitOnly: false
                                        })}
                                        className="h-7 rounded-full text-[11px] ml-auto"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            color: 'var(--slds-g-color-text-default)'
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <div 
                            className="overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-[13px]">
                                    <thead>
                                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>ID</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Start Date & Time</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>End Date & Time</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Connection</th>
                                            <th className="px-3 py-2 text-center font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Attended</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Participants</th>
                                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Program(s)</th>
                                            <th className="px-3 py-2 text-center font-semibold w-24" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Home Visit</th>
                                            {isEditingConnection && <th className="px-3 py-2 text-left font-semibold w-20" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {connections.map((conn, index) => (
                                            <tr key={conn.id} style={{ borderBottom: index < connections.length - 1 || isAddingConnection ? '1px solid var(--slds-g-color-border-base-1)' : 'none' }}>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.id}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.startDateTime}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.endDateTime}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.connection}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <Checkbox checked={conn.attended} disabled={!isEditingConnection} />
                                                </td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.participants}</td>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>{conn.programs}</td>
                                                <td className="px-3 py-3 text-center">
                                                    <Checkbox checked={conn.homeVisit} disabled={!isEditingConnection} />
                                                </td>
                                                {isEditingConnection && (
                                                    <td className="px-3 py-3">
                                                        <button
                                                            onClick={() => handleRemoveConnection(conn.id)}
                                                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        
                                        {isAddingConnection && (
                                            <tr ref={newConnectionRowRef}>
                                                <td className="px-3 py-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>Auto</td>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        autoFocus
                                                        type="datetime-local"
                                                        value={newConnection.startDateTime}
                                                        onChange={(e) => setNewConnection({...newConnection, startDateTime: e.target.value})}
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        type="datetime-local"
                                                        value={newConnection.endDateTime}
                                                        onChange={(e) => setNewConnection({...newConnection, endDateTime: e.target.value})}
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        value={newConnection.connection}
                                                        onChange={(e) => setNewConnection({...newConnection, connection: e.target.value})}
                                                        placeholder="Connection type"
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <Checkbox 
                                                        checked={newConnection.attended}
                                                        onCheckedChange={(checked) => setNewConnection({...newConnection, attended: checked as boolean})}
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        value={newConnection.participants}
                                                        onChange={(e) => setNewConnection({...newConnection, participants: e.target.value})}
                                                        placeholder="Participants"
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Input
                                                        value={newConnection.programs}
                                                        onChange={(e) => setNewConnection({...newConnection, programs: e.target.value})}
                                                        placeholder="Program(s)"
                                                        className="h-8 text-[13px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <Checkbox 
                                                        checked={newConnection.homeVisit}
                                                        onCheckedChange={(checked) => setNewConnection({...newConnection, homeVisit: checked as boolean})}
                                                    />
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={handleAddConnection}
                                                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                            title="Save"
                                                        >
                                                            <Check className="h-3.5 w-3.5" style={{ color: 'var(--color-brand-primary)' }} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsAddingConnection(false);
                                                                setNewConnection({ 
                                                                    startDateTime: "", 
                                                                    endDateTime: "", 
                                                                    connection: "", 
                                                                    attended: false, 
                                                                    participants: "", 
                                                                    programs: "", 
                                                                    homeVisit: false 
                                                                });
                                                            }}
                                                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X className="h-3.5 w-3.5 text-[#c23934]" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Documents & Notes (with horizontal tabs)
    if (activeDropdownItem === "documents-notes") {
        const tabs = [
            { id: "documents", label: "Documents", icon: FileText },
            { id: "notes", label: "Notes", icon: FileText }
        ];

        return (
            <div className="p-6">
                <HorizontalTabNav tabs={tabs} activeTab={activeHorizontalTab} onTabChange={setActiveHorizontalTab} />
                
                {/* DOCUMENTS TAB */}
                {activeHorizontalTab === "documents" && (
                    <DocumentsSection
                        documents={documents}
                        onMarkAsReceived={handleMarkAsReceived}
                        onMarkAsDocumented={handleMarkAsDocumented}
                        onToggleNotes={handleToggleNotes}
                        onToggleRenewable={handleToggleRenewable}
                    />
                )}

                {/* NOTES TAB */}
                {activeHorizontalTab === "notes" && (
                    <div className="space-y-4">
                            {/* Header with New Note Button */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-[16px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Notes
                                </h2>
                                <Button 
                                    onClick={handleNewNote}
                                    className="h-9 rounded-full text-[12px] font-medium px-5 flex items-center gap-2"
                                    style={{
                                        backgroundColor: 'var(--color-brand-primary)',
                                        color: 'white',
                                        border: 'none'
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    New Note
                                </Button>
                            </div>

                            {/* TABLE VIEW - Always visible */}
                            <div 
                                className="overflow-hidden rounded-lg shadow-sm"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                }}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                            <TableHead className="text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Date</TableHead>
                                            <TableHead className="text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Time</TableHead>
                                            <TableHead className="text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Subject</TableHead>
                                            <TableHead className="text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Classification</TableHead>
                                            <TableHead className="text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Note Type</TableHead>
                                            <TableHead className="text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Owner</TableHead>
                                            <TableHead className="text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>Timeline</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {notes.map((note) => {
                                            const badgeStyle = getClassificationBadgeStyle(note.classification);
                                            return (
                                                <TableRow 
                                                    key={note.id}
                                                    onClick={() => handleNoteRowClick(note.id)}
                                                    className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                                                    style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
                                                >
                                                    <TableCell className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {note.date}
                                                    </TableCell>
                                                    <TableCell className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {note.time}
                                                    </TableCell>
                                                    <TableCell className="text-[13px] font-medium" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {note.subject}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            className="text-[10px] px-2 py-0 h-5 capitalize"
                                                            style={{ 
                                                                backgroundColor: badgeStyle.bg,
                                                                color: badgeStyle.color,
                                                                border: `1px solid ${badgeStyle.border}`
                                                            }}
                                                        >
                                                            {note.classification}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {note.noteType}
                                                    </TableCell>
                                                    <TableCell className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {note.owner}
                                                    </TableCell>
                                                    <TableCell className="text-[13px] capitalize" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        {note.timeline}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* MODAL DIALOG FOR NOTE FORM */}
                            <Dialog open={showNoteForm} onOpenChange={setShowNoteForm}>
                                <DialogContent 
                                    className="max-w-4xl max-h-[90vh] overflow-y-auto"
                                    aria-describedby={undefined}
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                    }}
                                >
                                    <DialogHeader>
                                        <DialogTitle className="text-[18px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            {selectedNoteId ? 'Edit Note' : 'New Note'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    
                                    {/* FORM VIEW */}
                                    <div className="space-y-6">
                                        {/* Essential Information Section */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="noteDate" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Date <span className="text-red-600">*</span>
                                                    </Label>
                                                    <DateInput 
                                                        id="noteDate"
value={isoToMdy(noteFormData.date)}
                                                        onChange={(v) => ((e) => handleNoteFormChange('date', e.target.value))({ target: { value: mdyToIso(v) } })}
                                                        className="h-9 text-[13px]"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <Label htmlFor="noteTime" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Time <span className="text-red-600">*</span>
                                                    </Label>
                                                    <Input 
                                                        id="noteTime"
                                                        type="time"
                                                        value={noteFormData.time}
                                                        onChange={(e) => handleNoteFormChange('time', e.target.value)}
                                                        className="h-9 text-[13px]"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="classification" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Classification <span className="text-red-600">*</span>
                                                    </Label>
                                                    <Select 
                                                        value={noteFormData.classification}
                                                        onValueChange={(value) => handleNoteFormChange('classification', value)}
                                                    >
                                                        <SelectTrigger 
                                                            id="classification"
                                                            className="h-9 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="general">General</SelectItem>
                                                            <SelectItem value="medical">Medical</SelectItem>
                                                            <SelectItem value="behavioral">Behavioral</SelectItem>
                                                            <SelectItem value="educational">Educational</SelectItem>
                                                            <SelectItem value="therapeutic">Therapeutic</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div>
                                                    <Label htmlFor="noteType" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Note Type
                                                    </Label>
                                                    <Select 
                                                        value={noteFormData.noteType}
                                                        onValueChange={(value) => handleNoteFormChange('noteType', value)}
                                                    >
                                                        <SelectTrigger 
                                                            id="noteType"
                                                            className="h-9 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="case-note">Case Note</SelectItem>
                                                            <SelectItem value="progress-note">Progress Note</SelectItem>
                                                            <SelectItem value="incident-report">Incident Report</SelectItem>
                                                            <SelectItem value="contact-log">Contact Log</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <Label htmlFor="subject" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    Subject <span className="text-red-600">*</span>
                                                </Label>
                                                <Input 
                                                    id="subject"
                                                    placeholder="Enter subject"
                                                    value={noteFormData.subject}
                                                    onChange={(e) => handleNoteFormChange('subject', e.target.value)}
                                                    className="h-9 text-[13px]"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="noteContent" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                    Note <span className="text-red-600">*</span>
                                                </Label>
                                                <Textarea 
                                                    id="noteContent"
                                                    placeholder="Enter note details..."
                                                    value={noteFormData.content}
                                                    onChange={(e) => handleNoteFormChange('content', e.target.value)}
                                                    className="min-h-[100px] text-[13px] resize-y"
                                                    style={{
                                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}></div>

                                        {/* Additional Details Section */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="timeline" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Timeline
                                                    </Label>
                                                    <Select 
                                                        value={noteFormData.timeline}
                                                        onValueChange={(value) => handleNoteFormChange('timeline', value)}
                                                    >
                                                        <SelectTrigger 
                                                            id="timeline"
                                                            className="h-9 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="current">Current</SelectItem>
                                                            <SelectItem value="historical">Historical</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div>
                                                    <Label htmlFor="noteFor" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Note For
                                                    </Label>
                                                    <Select 
                                                        value={noteFormData.noteFor}
                                                        onValueChange={(value) => handleNoteFormChange('noteFor', value)}
                                                    >
                                                        <SelectTrigger 
                                                            id="noteFor"
                                                            className="h-9 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="aaron-ace">Aaron Ace</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="noteOwner" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Note Owner
                                                    </Label>
                                                    <Select 
                                                        value={noteFormData.noteOwner}
                                                        onValueChange={(value) => handleNoteFormChange('noteOwner', value)}
                                                    >
                                                        <SelectTrigger 
                                                            id="noteOwner"
                                                            className="h-9 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="current-user">Current User</SelectItem>
                                                            <SelectItem value="case-manager">Case Manager</SelectItem>
                                                            <SelectItem value="supervisor">Supervisor</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                <div>
                                                    <Label htmlFor="recordingForm" className="text-[11px] font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                        Recording Form
                                                    </Label>
                                                    <Select 
                                                        value={noteFormData.recordingForm}
                                                        onValueChange={(value) => handleNoteFormChange('recordingForm', value)}
                                                    >
                                                        <SelectTrigger 
                                                            id="recordingForm"
                                                            className="h-9 text-[13px]"
                                                            style={{
                                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                                            }}
                                                        >
                                                            <SelectValue placeholder="Select form" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="standard">Standard Form</SelectItem>
                                                            <SelectItem value="detailed">Detailed Form</SelectItem>
                                                            <SelectItem value="brief">Brief Form</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}></div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-end gap-3">
                                            {selectedNoteId && (
                                                <Button 
                                                    onClick={handleDeleteNote}
                                                    variant="outline"
                                                    className="h-9 rounded-full text-[12px] font-medium px-5 mr-auto"
                                                    style={{
                                                        border: '1px solid #f44336',
                                                        backgroundColor: 'transparent',
                                                        color: '#f44336'
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                            <Button 
                                                onClick={handleCancelNote}
                                                variant="outline"
                                                className="h-9 rounded-full text-[12px] font-medium px-5"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    color: 'var(--slds-g-color-text-default)'
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                onClick={handleSaveNote}
                                                variant="outline"
                                                className="h-9 rounded-full text-[12px] font-medium px-5"
                                                style={{
                                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                                    color: 'var(--slds-g-color-text-default)'
                                                }}
                                            >
                                                Save
                                            </Button>
                                            <Button 
                                                onClick={handleSaveNote}
                                                className="h-9 rounded-full text-[12px] font-medium px-5"
                                                style={{
                                                    backgroundColor: 'var(--color-brand-primary)',
                                                    color: 'white',
                                                    border: 'none'
                                                }}
                                            >
                                                Save & Close
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                    </div>
                )}
            </div>
        );
    }

    // Campus Restrictions
    if (activeDropdownItem === "campus-restrictions") {
        return <CampusRestrictionsSection />;
    }

    // Eligibility
    if (activeDropdownItem === "eligibility") {
        return <CPIHoldsSection />;
    }

    return <div className="p-6">Content not yet implemented for: {activeDropdownItem}</div>;
}