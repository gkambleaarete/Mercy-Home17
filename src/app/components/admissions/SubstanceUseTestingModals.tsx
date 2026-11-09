import { useState, useEffect, useId } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { EmptyState } from "../ui/empty-state";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Search,
  Bell,
} from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import {
  TEST_PANELS,
  TEST_REASONS,
  TEST_TYPES,
  TYPES_REQUIRING_PANEL,
  isTestPanelDisabled,
  panelsForTestType,
} from "../../lib/substanceTests";
import { CONSTITUENTS } from "../../data/mockConstituents";
import { getDemoUserName } from "../../lib/demoIdentity";

// Types
interface TestResult {
  id: number;
  substance: string;
  result: string;
  level: string;
  units: string;
}

interface PersonNotified {
  id: number;
  name: string;
}

interface TestNotification {
  id: number;
  date: string;
  time: string;
  notifiedBy: string;
  personsNotified: PersonNotified[];
  status: string;
  contactType: string;
  notes: string;
}

interface TestDetail {
  id: number;
  testType: string;
  testPanel: string;
  relatedTest: string;
  refusalDetail: string;
  resultsDate: string;
  resultsTime: string;
  staffAdministering: string;
  testResults: TestResult[];
  notifications?: TestNotification[];
}

interface SubstanceUseTest {
  id: number;
  dateTime: string;
  reason: string;
  newUse: string;
  testDetails: TestDetail[];
  suspectTampering: boolean;
  tamperingComments: string;
  labConsultation: string;
  action: string;
  refrigeratorDate: string;
  pickupDate: string;
  discardDate: string;
  discardReason: string;
}

interface SubstanceUseTestingModalsProps {
  tests: SubstanceUseTest[];
  onUpdateTests: (tests: SubstanceUseTest[]) => void;
  initialEntryOpen: boolean;
  onInitialEntryOpenChange: (open: boolean) => void;
  editingTestId: number | null;
  onEditingTestIdChange: (id: number | null) => void;
  /** Optional. Called on the Test Set's final Save with the complete updated
   *  test, before onUpdateTests. Return false to keep the Test Set open
   *  (e.g. the caller could not persist it). Not called by Cancel. */
  onSaveComplete?: (test: SubstanceUseTest) => boolean | void;
}

// Mock active medications for medical alert demonstration
const ACTIVE_MEDICATIONS = [
  { name: "Adderall XR", substance: "Amphetamines" },
  { name: "Xanax", substance: "Benzodiazepines" },
];

// Test Panel configurations: TEST_PANELS (lib/substanceTests).

export function SubstanceUseTestingModals({
  tests,
  onUpdateTests,
  initialEntryOpen,
  onInitialEntryOpenChange,
  editingTestId,
  onEditingTestIdChange,
  onSaveComplete,
}: SubstanceUseTestingModalsProps) {
  // Each dialog's description is linked explicitly: the shared
  // DialogContent does not associate one on its own. The id sits on an
  // inner span so DialogDescription keeps Radix's own id (Radix checks for
  // it and would otherwise warn).
  const descriptionIdBase = useId();
  const descriptionId = (dialog: string) =>
    `${descriptionIdBase}-${dialog}-description`;
  // Initial Entry Form State
  const [initialFormData, setInitialFormData] = useState({
    date: "",
    time: "",
    reason: "",
    otherReason: "",
  });

  // Test Set Screen State
  const [testSetOpen, setTestSetOpen] = useState(false);
  const [testSetData, setTestSetData] = useState({
    newUse: "Pending",
  });

  // Test Details Screen State
  const [testDetailsOpen, setTestDetailsOpen] = useState(false);
  const [editingTestDetailId, setEditingTestDetailId] =
    useState<number | null>(null);
  const [testDetailFormData, setTestDetailFormData] = useState<
    Partial<TestDetail>
  >({
    testType: "",
    testPanel: "",
    relatedTest: "",
    refusalDetail: "",
    resultsDate: "",
    resultsTime: "",
    staffAdministering: "",
    testResults: [],
  });
  const [previousTestType, setPreviousTestType] = useState("");

  // Test Details Tab State (Results / Notification)
  const [testDetailsTab, setTestDetailsTab] = useState<
    "results" | "notification"
  >("results");

  // Test Results Grid State
  const [testResultsGridOpen, setTestResultsGridOpen] =
    useState(false);
  const [testResultsGridMode, setTestResultsGridMode] =
    useState<"add" | "modify" | "modifyAll">("add");
  const [editingTestResultId, setEditingTestResultId] =
    useState<number | null>(null);
  const [testResultFormData, setTestResultFormData] = useState({
    substance: "",
    result: "Negative",
    level: "",
    units: "",
  });

  // Modify All Test Results State
  const [modifyAllRows, setModifyAllRows] = useState<
    TestResult[]
  >([]);

  // Notification Dialog State
  const [notificationDialogOpen, setNotificationDialogOpen] =
    useState(false);
  const [editingNotificationId, setEditingNotificationId] =
    useState<number | null>(null);
  const [notificationFormData, setNotificationFormData] =
    useState<{
      date: string;
      time: string;
      notifiedBy: string;
      personsNotified: PersonNotified[];
      status: string;
      contactType: string;
      notes: string;
    }>({
      date: "",
      time: "",
      notifiedBy: getDemoUserName(),
      personsNotified: [],
      status: "",
      contactType: "",
      notes: "",
    });

  // Persons Notified Selection Dialog State
  const [personsNotifiedOpen, setPersonsNotifiedOpen] =
    useState(false);
  const [
    personsNotifiedSearchInput,
    setPersonsNotifiedSearchInput,
  ] = useState("");
  const [
    personsNotifiedSearchApplied,
    setPersonsNotifiedSearchApplied,
  ] = useState("");
  const [personsNotifiedSelected, setPersonsNotifiedSelected] =
    useState<PersonNotified[]>([]);

  // Additional Details State
  const [additionalDetails, setAdditionalDetails] = useState({
    suspectTampering: false,
    tamperingComments: "",
    labConsultation: "",
    action: "",
    refrigeratorDate: "",
    pickupDate: "",
    discardDate: "",
    discardReason: "",
  });

  // Current test details working array
  const [currentTestDetails, setCurrentTestDetails] = useState<
    TestDetail[]
  >([]);

  // Get current test being edited
  const currentTest = editingTestId
    ? tests.find((t) => t.id === editingTestId)
    : null;

  // Initialize form when editing
  useEffect(() => {
    if (editingTestId && currentTest) {
      // Parse date/time from display format
      const [datePart, timePart] =
        currentTest.dateTime.split(", ");
      const dateParts = datePart.split("/");
      const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`;

      const timeMatch = timePart.match(/(\d+):(\d+)\s*(AM|PM)/);
      let formattedTime = "";
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        const ampm = timeMatch[3];
        if (ampm === "PM" && hours !== 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}`;
      }

      setInitialFormData({
        date: formattedDate,
        time: formattedTime,
        reason: currentTest.reason,
        otherReason: "",
      });

      setTestSetData({
        newUse: currentTest.newUse || "Pending",
      });

      setCurrentTestDetails(currentTest.testDetails || []);

      setAdditionalDetails({
        suspectTampering: currentTest.suspectTampering || false,
        tamperingComments: currentTest.tamperingComments || "",
        labConsultation: currentTest.labConsultation || "",
        action: currentTest.action || "",
        refrigeratorDate: currentTest.refrigeratorDate || "",
        pickupDate: currentTest.pickupDate || "",
        discardDate: currentTest.discardDate || "",
        discardReason: currentTest.discardReason || "",
      });
    }
  }, [editingTestId]);

  // Handle Save Initial Entry - advances to Test Set Screen
  const handleSaveInitialEntry = () => {
    // Validate required fields
    if (
      !initialFormData.date ||
      !initialFormData.time ||
      !initialFormData.reason
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      initialFormData.reason === "Other" &&
      !initialFormData.otherReason.trim()
    ) {
      toast.error("Please specify the other reason");
      return;
    }

    // Convert date/time to display format
    const dateParts = initialFormData.date.split("-");
    const displayDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

    const timeParts = initialFormData.time.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayTime = `${displayHours}:${minutes} ${ampm}`;

    const dateTime = `${displayDate}, ${displayTime}`;
    const displayReason =
      initialFormData.reason === "Other"
        ? initialFormData.otherReason
        : initialFormData.reason;

    if (editingTestId) {
      // Update existing test
      onUpdateTests(
        tests.map((t) =>
          t.id === editingTestId
            ? { ...t, dateTime, reason: displayReason }
            : t,
        ),
      );
    } else {
      // Create new test
      const newId = Math.max(...tests.map((t) => t.id), 0) + 1;
      onUpdateTests([
        ...tests,
        {
          id: newId,
          dateTime,
          reason: displayReason,
          newUse: "Pending",
          testDetails: [],
          suspectTampering: false,
          tamperingComments: "",
          labConsultation: "",
          action: "",
          refrigeratorDate: "",
          pickupDate: "",
          discardDate: "",
          discardReason: "",
        },
      ]);
      onEditingTestIdChange(newId);
      setCurrentTestDetails([]);
    }

    // Determine if "New Use" field should be shown
    const shouldShowNewUse =
      [
        "Program Random Test",
        "Treatment Plan",
        "Suspicion of Use",
        "Self-Disclosure",
        "Disclosure From Other",
        "Other",
      ].includes(initialFormData.reason) ||
      initialFormData.reason === "Other";

    // Close initial entry, open test set screen
    onInitialEntryOpenChange(false);
    setTestSetOpen(true);
  };

  // Handle Save Test Set - closes the test set screen
  const handleSaveTestSet = () => {
    if (!editingTestId) return;

    // Validate New Use if required
    const currentTestData = tests.find(
      (t) => t.id === editingTestId,
    );
    const shouldShowNewUse =
      currentTestData &&
      [
        "Program Random Test",
        "Treatment Plan",
        "Suspicion of Use",
        "Self-Disclosure",
        "Disclosure From Other",
      ].some((r) => currentTestData.reason.includes(r));

    if (
      shouldShowNewUse &&
      testSetData.newUse === "Pending" &&
      currentTestDetails.length > 0
    ) {
      const hasResults = currentTestDetails.some(
        (td) => td.testResults && td.testResults.length > 0,
      );
      if (hasResults) {
        toast.error(
          "Please update 'Results Indicate New Use' before saving",
        );
        return;
      }
    }

    // Update test with all data
    const savedTests = tests.map((t) =>
      t.id === editingTestId
        ? {
            ...t,
            newUse: testSetData.newUse,
            testDetails: currentTestDetails,
            ...additionalDetails,
          }
        : t,
    );
    const savedTest = savedTests.find(
      (t) => t.id === editingTestId,
    );
    if (
      onSaveComplete &&
      savedTest &&
      onSaveComplete(savedTest) === false
    )
      return;
    onUpdateTests(savedTests);

    toast.success("Test saved successfully");

    // Reset and close
    setTestSetOpen(false);
    onEditingTestIdChange(null);
    setInitialFormData({
      date: "",
      time: "",
      reason: "",
      otherReason: "",
    });
    setTestSetData({ newUse: "Pending" });
    setCurrentTestDetails([]);
    setAdditionalDetails({
      suspectTampering: false,
      tamperingComments: "",
      labConsultation: "",
      action: "",
      refrigeratorDate: "",
      pickupDate: "",
      discardDate: "",
      discardReason: "",
    });
  };

  // Handle Add Test Detail - opens Test Details Screen
  const handleAddTestDetail = () => {
    const now = new Date();
    const currentUser = getDemoUserName(); // In production, get from auth context

    setTestDetailFormData({
      testType: "",
      testPanel: "",
      relatedTest: "",
      refusalDetail: "",
      resultsDate: "",
      resultsTime: "",
      staffAdministering: currentUser,
      testResults: [],
      notifications: [],
    });
    setEditingTestDetailId(null);
    setPreviousTestType("");
    setTestDetailsTab("results");
    setTestDetailsOpen(true);
  };

  // Handle Modify Test Detail
  const handleModifyTestDetail = (testDetail: TestDetail) => {
    setTestDetailFormData({
      ...testDetail,
      notifications: testDetail.notifications || [],
    });
    setEditingTestDetailId(testDetail.id);
    setPreviousTestType(testDetail.testType);
    setTestDetailsTab("results");
    setTestDetailsOpen(true);
  };

  // Handle Test Type Change with Warning
  const handleTestTypeChange = (newType: string) => {
    if (
      previousTestType &&
      previousTestType !== newType &&
      testDetailFormData.testResults &&
      testDetailFormData.testResults.length > 0
    ) {
      if (
        window.confirm(
          "Changing the Test Type selection will clear all data entered in Test Results below. Do you want to continue?",
        )
      ) {
        setTestDetailFormData({
          ...testDetailFormData,
          testType: newType,
          testPanel: "",
          testResults: [],
        });
        setPreviousTestType(newType);
      }
    } else {
      setTestDetailFormData({
        ...testDetailFormData,
        testType: newType,
        testPanel: "",
      });
      setPreviousTestType(newType);
    }
  };

  // Handle Test Panel Change - auto-populate test results
  const handleTestPanelChange = (panel: string) => {
    const panelConfig = TEST_PANELS[panel];
    if (panelConfig) {
      const autoResults: TestResult[] =
        panelConfig.substances.map((substance, index) => ({
          id: Date.now() + index,
          substance,
          result: "Negative",
          level: "",
          units: "",
        }));
      setTestDetailFormData({
        ...testDetailFormData,
        testPanel: panel,
        testResults: autoResults,
      });
    } else {
      setTestDetailFormData({
        ...testDetailFormData,
        testPanel: panel,
      });
    }
  };

  // Get available test panels based on test type
  const getAvailableTestPanels = (): string[] =>
    // Rerun Test offers panels from previous tests in this test set
    panelsForTestType(
      testDetailFormData.testType,
      currentTestDetails
        .filter((td) => td.id !== editingTestDetailId)
        .map((td) => td.testPanel),
    );

  // Get medical alerts for selected panel
  const getMedicalAlerts = (): string[] => {
    if (!testDetailFormData.testPanel) return [];

    const panelConfig =
      TEST_PANELS[testDetailFormData.testPanel];
    if (!panelConfig) return [];

    return ACTIVE_MEDICATIONS.filter((med) =>
      panelConfig.substances.includes(med.substance),
    ).map(
      (med) =>
        `${med.name} may interfere with ${med.substance} test results`,
    );
  };

  // Handle Save Test Detail
  const handleSaveTestDetail = () => {
    // Validate required fields
    if (!testDetailFormData.testType) {
      toast.error("Test Type is required");
      return;
    }

    const testType = testDetailFormData.testType;

    // Validate Test Panel for types that require it
    if (TYPES_REQUIRING_PANEL.includes(testType)) {
      if (!testDetailFormData.testPanel) {
        toast.error(
          "Test Panel is required for this test type",
        );
        return;
      }
    }

    // Validate conditional fields
    if (
      testType === "Rerun Test" &&
      !testDetailFormData.relatedTest
    ) {
      toast.error("Related Test is required for Rerun Test");
      return;
    }

    if (
      testType === "Refused Test" &&
      !testDetailFormData.refusalDetail
    ) {
      toast.error(
        "Refusal Detail is required for Refused Test",
      );
      return;
    }

    if (editingTestDetailId) {
      // Update existing test detail
      setCurrentTestDetails(
        currentTestDetails.map((td) =>
          td.id === editingTestDetailId
            ? {
                ...(testDetailFormData as TestDetail),
                id: editingTestDetailId,
              }
            : td,
        ),
      );
      toast.success("Test detail updated");
    } else {
      // Add new test detail
      const newId =
        Math.max(...currentTestDetails.map((td) => td.id), 0) +
        1;
      setCurrentTestDetails([
        ...currentTestDetails,
        {
          ...(testDetailFormData as TestDetail),
          id: newId,
        },
      ]);
      toast.success("Test detail added");
    }

    setTestDetailsOpen(false);
    setEditingTestDetailId(null);
    setPreviousTestType("");
  };

  // Handle Delete Test Detail
  const handleDeleteTestDetail = (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this test?",
      )
    ) {
      setCurrentTestDetails(
        currentTestDetails.filter((td) => td.id !== id),
      );
      toast.success("Test detail deleted");
    }
  };

  // Test Results Grid Handlers
  const handleAddTestResult = () => {
    setTestResultFormData({
      substance: "",
      result: "Negative",
      level: "",
      units: "",
    });
    setEditingTestResultId(null);
    setTestResultsGridMode("add");
    setTestResultsGridOpen(true);
  };

  const handleModifyTestResult = (result: TestResult) => {
    setTestResultFormData(result);
    setEditingTestResultId(result.id);
    setTestResultsGridMode("modify");
    setTestResultsGridOpen(true);
  };

  const handleSaveTestResult = () => {
    if (!testResultFormData.substance) {
      toast.error("Substance is required");
      return;
    }

    if (
      testResultFormData.result === "Positive" &&
      !testResultFormData.level
    ) {
      toast.error("Level is required for positive results");
      return;
    }

    if (
      testResultFormData.result === "Positive" &&
      testResultFormData.level &&
      !testResultFormData.units
    ) {
      toast.error("Units are required when level is specified");
      return;
    }

    const currentResults = testDetailFormData.testResults || [];

    if (editingTestResultId) {
      // Update existing
      setTestDetailFormData({
        ...testDetailFormData,
        testResults: currentResults.map((r) =>
          r.id === editingTestResultId
            ? { ...testResultFormData, id: editingTestResultId }
            : r,
        ),
      });
    } else {
      // Add new
      const newId =
        Math.max(...currentResults.map((r) => r.id), 0) + 1;
      setTestDetailFormData({
        ...testDetailFormData,
        testResults: [
          ...currentResults,
          { ...testResultFormData, id: newId },
        ],
      });
    }

    setTestResultsGridOpen(false);
  };

  const handleRemoveTestResult = (id: number) => {
    setTestDetailFormData({
      ...testDetailFormData,
      testResults: (
        testDetailFormData.testResults || []
      ).filter((r) => r.id !== id),
    });
    setTestResultsGridOpen(false);
  };

  // Handle Open Modify All - opens bulk-edit submodal for all current Test Results
  const handleOpenModifyAll = () => {
    setModifyAllRows(testDetailFormData.testResults || []);
    setTestResultsGridMode("modifyAll");
    setTestResultsGridOpen(true);
  };

  const updateModifyAllRow = (
    id: number,
    updates: Partial<TestResult>,
  ) => {
    setModifyAllRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  };

  const handleApplyModifyAll = () => {
    for (const row of modifyAllRows) {
      if (row.result === "Positive" && !row.level) {
        toast.error(
          `Level is required for ${row.substance} (Positive result)`,
        );
        return;
      }
      if (
        row.result === "Positive" &&
        row.level &&
        !row.units
      ) {
        toast.error(
          `Unit of Measure is required for ${row.substance}`,
        );
        return;
      }
    }
    setTestDetailFormData({
      ...testDetailFormData,
      testResults: modifyAllRows,
    });
    toast.success("Test results updated");
    setTestResultsGridOpen(false);
  };

  // Notification Handlers
  const handleOpenAddNotification = () => {
    setNotificationFormData({
      date: "",
      time: "",
      notifiedBy: getDemoUserName(),
      personsNotified: [],
      status: "",
      contactType: "",
      notes: "",
    });
    setEditingNotificationId(null);
    setNotificationDialogOpen(true);
  };

  const handleOpenModifyNotification = (
    notification: TestNotification,
  ) => {
    setNotificationFormData({
      date: notification.date,
      time: notification.time,
      notifiedBy: notification.notifiedBy,
      personsNotified: notification.personsNotified,
      status: notification.status,
      contactType: notification.contactType,
      notes: notification.notes,
    });
    setEditingNotificationId(notification.id);
    setNotificationDialogOpen(true);
  };

  const handleSaveNotification = () => {
    if (
      !notificationFormData.date ||
      !notificationFormData.time ||
      !notificationFormData.notifiedBy.trim() ||
      notificationFormData.personsNotified.length === 0 ||
      !notificationFormData.status ||
      !notificationFormData.contactType
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const currentNotifications =
      testDetailFormData.notifications || [];

    if (editingNotificationId) {
      setTestDetailFormData({
        ...testDetailFormData,
        notifications: currentNotifications.map((n) =>
          n.id === editingNotificationId
            ? {
                ...notificationFormData,
                id: editingNotificationId,
              }
            : n,
        ),
      });
      toast.success("Notification updated");
    } else {
      const newId =
        Math.max(...currentNotifications.map((n) => n.id), 0) +
        1;
      setTestDetailFormData({
        ...testDetailFormData,
        notifications: [
          ...currentNotifications,
          { ...notificationFormData, id: newId },
        ],
      });
      toast.success("Notification added");
    }

    setNotificationDialogOpen(false);
    setEditingNotificationId(null);
  };

  // Persons Notified Selection Handlers
  const handleOpenPersonsNotified = () => {
    setPersonsNotifiedSelected(
      notificationFormData.personsNotified,
    );
    setPersonsNotifiedSearchInput("");
    setPersonsNotifiedSearchApplied("");
    setPersonsNotifiedOpen(true);
  };

  const togglePersonNotified = (constituent: {
    id: number;
    name: string;
  }) => {
    setPersonsNotifiedSelected((prev) =>
      prev.some((p) => p.id === constituent.id)
        ? prev.filter((p) => p.id !== constituent.id)
        : [
            ...prev,
            { id: constituent.id, name: constituent.name },
          ],
    );
  };

  const handleFindPersonsNotified = () => {
    setPersonsNotifiedSearchApplied(
      personsNotifiedSearchInput.trim(),
    );
  };

  const handleClearPersonsNotified = () => {
    setPersonsNotifiedSearchInput("");
    setPersonsNotifiedSearchApplied("");
  };

  const handleApplyPersonsNotified = () => {
    if (personsNotifiedSelected.length === 0) {
      toast.error("Please select at least one constituent");
      return;
    }
    setNotificationFormData({
      ...notificationFormData,
      personsNotified: personsNotifiedSelected,
    });
    setPersonsNotifiedOpen(false);
  };

  const activeConstituents = CONSTITUENTS.filter(
    (c) => c.status === "Active",
  );
  const filteredConstituents = personsNotifiedSearchApplied
    ? activeConstituents.filter((c) =>
        c.name
          .toLowerCase()
          .includes(personsNotifiedSearchApplied.toLowerCase()),
      )
    : activeConstituents;

  // Validate dates for Additional Details
  const validateRefrigeratorDate = (date: string): boolean => {
    if (!date) return true;
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected <= today;
  };

  const validatePickupDate = (date: string): boolean => {
    if (!date || !additionalDetails.refrigeratorDate)
      return true;
    const selected = new Date(date);
    const refrigerator = new Date(
      additionalDetails.refrigeratorDate,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= refrigerator && selected <= today;
  };

  const validateDiscardDate = (date: string): boolean => {
    if (!date) return true;
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected <= today;
  };

  // Calculate if New Use field should be shown
  const shouldShowNewUseField = () => {
    if (!currentTest) return false;
    return [
      "Program Random Test",
      "Treatment Plan",
      "Suspicion of Use",
      "Self-Disclosure",
      "Disclosure From Other",
    ].some((r) => currentTest.reason.includes(r));
  };

  // Check if New Use should be editable
  const isNewUseEditable = () => {
    return currentTestDetails.some(
      (td) => td.testResults && td.testResults.length > 0,
    );
  };

  return (
    <>
      {/* Initial Entry Modal */}
      <Dialog
        open={initialEntryOpen}
        onOpenChange={onInitialEntryOpenChange}
      >
        <DialogContent
          size="md"
          aria-describedby={descriptionId("initial-entry")}
        >
          <DialogHeader>
            <DialogTitle>
              {editingTestId
                ? "Edit Test - Initial Entry"
                : "New Test - Initial Entry"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              <span id={descriptionId("initial-entry")}>
                Enter the sample date, time and reason for this
                substance test.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="sample-date"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Sample Date{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <DateInput
                  id="sample-date"
                  value={isoToMdy(initialFormData.date)}
                  onChange={(v) =>
                    ((e) =>
                      setInitialFormData({
                        ...initialFormData,
                        date: e.target.value,
                      }))({ target: { value: mdyToIso(v) } })
                  }
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="sample-time"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Sample Time{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="sample-time"
                  type="time"
                  value={initialFormData.time}
                  onChange={(e) =>
                    setInitialFormData({
                      ...initialFormData,
                      time: e.target.value,
                    })
                  }
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="test-reason"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Test Reason{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Select
                value={initialFormData.reason}
                onValueChange={(value) =>
                  setInitialFormData({
                    ...initialFormData,
                    reason: value,
                  })
                }
              >
                <SelectTrigger
                  id="test-reason"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  <SelectValue placeholder="Select test reason..." />
                </SelectTrigger>
                <SelectContent>
                  {TEST_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {initialFormData.reason === "Other" && (
              <div>
                <Label
                  htmlFor="other-reason"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Other Reason{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="other-reason"
                  type="text"
                  value={initialFormData.otherReason}
                  onChange={(e) =>
                    setInitialFormData({
                      ...initialFormData,
                      otherReason: e.target.value,
                    })
                  }
                  placeholder="Please specify..."
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
            )}
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => onInitialEntryOpenChange(false)}
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
              onClick={handleSaveInitialEntry}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save and Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Set Screen */}
      <Dialog
        open={testSetOpen}
        onOpenChange={(open) => {
          if (!open) {
            setTestSetOpen(false);
            onEditingTestIdChange(null);
          }
        }}
      >
        <DialogContent
          size="xl"
          aria-describedby={descriptionId("test-set")}
        >
          <DialogHeader>
            <DialogTitle>Test Set</DialogTitle>
            <DialogDescription className="sr-only">
              <span id={descriptionId("test-set")}>
                Review this test set's tests, record whether
                results indicate new use, and save.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-6 bg-white">
            {/* New Use Indicator (conditional) */}
            {shouldShowNewUseField() && (
              <div
                className="p-4 rounded-lg"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Label
                      htmlFor="new-use-indicator"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Results Indicate New Use{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select
                      value={testSetData.newUse}
                      onValueChange={(value) =>
                        setTestSetData({
                          ...testSetData,
                          newUse: value,
                        })
                      }
                      disabled={!isNewUseEditable()}
                    >
                      <SelectTrigger
                        id="new-use-indicator"
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">
                          Pending
                        </SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                    {!isNewUseEditable() && (
                      <p
                        className="text-[11px] mt-1"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Non-editable until test results are
                        recorded
                      </p>
                    )}
                  </div>
                  {testSetData.newUse === "Yes" && (
                    <div
                      className="flex-1 p-3 rounded"
                      style={{
                        backgroundColor: "#fef3cd",
                        border: "1px solid #f5d87a",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#856404]" />
                        <span className="text-[13px] font-medium text-[#856404]">
                          New Use Requires Incident Report
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          toast.info(
                            "Opening Incident Report creation...",
                          )
                        }
                        className="mt-2 text-[13px] text-[#145F33] hover:underline font-medium"
                      >
                        Create Incident Report →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tests List View */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <h4 className="text-[13px] font-semibold text-[#080707]">
                  Tests
                </h4>
                <Button
                  onClick={handleAddTestDetail}
                  className="h-7 px-3 rounded-full text-[12px]"
                  style={{
                    backgroundColor: "#145F33",
                    color: "white",
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table
                  className="w-full text-[13px]"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Type
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Test Panel
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Results Date
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Results
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[12px] font-semibold w-20"
                        style={{
                          color:
                            "var(--slds-g-color-text-default)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTestDetails.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-weak)",
                          }}
                        >
                          No tests added yet
                        </td>
                      </tr>
                    ) : (
                      currentTestDetails.map((td, index) => {
                        // Calculate results summary
                        let resultsSummary = "";
                        if (
                          td.testResults &&
                          td.testResults.length > 0
                        ) {
                          const positiveResults =
                            td.testResults.filter(
                              (r) => r.result === "Positive",
                            );
                          if (positiveResults.length > 0) {
                            resultsSummary = positiveResults
                              .map((r) => {
                                const levelUnit =
                                  r.level && r.units
                                    ? ` - ${r.level} ${r.units}`
                                    : "";
                                return `${r.substance} (${r.result})${levelUnit}`;
                              })
                              .join("; ");
                          } else {
                            resultsSummary = "[All Negative]";
                          }
                        }

                        return (
                          <tr
                            key={td.id}
                            className="hover:bg-gray-50/50 transition-colors"
                            style={{
                              borderBottom:
                                index <
                                currentTestDetails.length - 1
                                  ? "1px solid var(--slds-g-color-border-base-1)"
                                  : "none",
                            }}
                          >
                            <td
                              className="px-4 py-2"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {td.testType}
                            </td>
                            <td
                              className="px-4 py-2"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {td.testPanel || "—"}
                            </td>
                            <td
                              className="px-4 py-2"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {td.resultsDate
                                ? `${td.resultsDate}${td.resultsTime ? " " + td.resultsTime : ""}`
                                : "—"}
                            </td>
                            <td
                              className="px-4 py-2"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {resultsSummary
                                ? resultsSummary.length > 60
                                  ? `${resultsSummary.substring(0, 60)}...`
                                  : resultsSummary
                                : "—"}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    handleModifyTestDetail(td)
                                  }
                                  className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                  title="Modify"
                                >
                                  <Pencil
                                    className="h-3 w-3"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Details Section */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{
                  borderBottom:
                    "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <h4 className="text-[13px] font-semibold text-[#080707]">
                  Additional Details
                </h4>
              </div>
              <div className="p-4 space-y-4">
                {/* Suspect Tampering */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="suspect-tampering"
                    checked={additionalDetails.suspectTampering}
                    onCheckedChange={(checked) =>
                      setAdditionalDetails({
                        ...additionalDetails,
                        suspectTampering: checked as boolean,
                      })
                    }
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="suspect-tampering"
                      className="text-[13px] font-medium cursor-pointer"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      Suspect Tampering
                    </Label>
                  </div>
                </div>

                {additionalDetails.suspectTampering && (
                  <div>
                    <Label
                      htmlFor="tampering-comments"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Comments{" "}
                      <span className="text-red-600">*</span>
                    </Label>
                    <Textarea
                      id="tampering-comments"
                      value={
                        additionalDetails.tamperingComments
                      }
                      onChange={(e) =>
                        setAdditionalDetails({
                          ...additionalDetails,
                          tamperingComments: e.target.value,
                        })
                      }
                      className="min-h-[80px] text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    />
                  </div>
                )}

                {/* Consultation with Lab */}
                <div>
                  <Label
                    htmlFor="lab-consultation"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Consultation with Lab
                  </Label>
                  <Textarea
                    id="lab-consultation"
                    value={additionalDetails.labConsultation}
                    onChange={(e) =>
                      setAdditionalDetails({
                        ...additionalDetails,
                        labConsultation: e.target.value,
                      })
                    }
                    className="min-h-[80px] text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  />
                </div>

                {/* Action (conditional - only if any test is Instant Test) */}
                {currentTestDetails.some(
                  (td) => td.testType === "Instant Test",
                ) && (
                  <div>
                    <Label
                      htmlFor="action"
                      className="block text-[12px] font-semibold mb-1.5 uppercase"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Action
                    </Label>
                    <Select
                      value={additionalDetails.action}
                      onValueChange={(value) =>
                        setAdditionalDetails({
                          ...additionalDetails,
                          action: value,
                        })
                      }
                    >
                      <SelectTrigger
                        id="action"
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      >
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sent to Lab">
                          Sent to Lab
                        </SelectItem>
                        <SelectItem value="Discard">
                          Discard
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sent to Lab conditional fields */}
                {additionalDetails.action === "Sent to Lab" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="refrigerator-date"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Refrigerator Date{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <DateInput
                        id="refrigerator-date"
                        value={isoToMdy(
                          additionalDetails.refrigeratorDate,
                        )}
                        onChange={(v) =>
                          ((e) => {
                            if (
                              validateRefrigeratorDate(
                                e.target.value,
                              )
                            ) {
                              setAdditionalDetails({
                                ...additionalDetails,
                                refrigeratorDate:
                                  e.target.value,
                              });
                            } else {
                              toast.error(
                                "Refrigerator date cannot be in the future",
                              );
                            }
                          })({ target: { value: mdyToIso(v) } })
                        }
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="pickup-date"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Pickup Date{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <DateInput
                        id="pickup-date"
                        value={isoToMdy(
                          additionalDetails.pickupDate,
                        )}
                        onChange={(v) =>
                          ((e) => {
                            if (
                              validatePickupDate(e.target.value)
                            ) {
                              setAdditionalDetails({
                                ...additionalDetails,
                                pickupDate: e.target.value,
                              });
                            } else {
                              toast.error(
                                "Pickup date must be between Refrigerator date and today",
                              );
                            }
                          })({ target: { value: mdyToIso(v) } })
                        }
                        disabled={
                          !additionalDetails.refrigeratorDate
                        }
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Discard conditional fields */}
                {additionalDetails.action === "Discard" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="discard-date"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Discard Date{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <DateInput
                        id="discard-date"
                        value={isoToMdy(
                          additionalDetails.discardDate,
                        )}
                        onChange={(v) =>
                          ((e) => {
                            if (
                              validateDiscardDate(
                                e.target.value,
                              )
                            ) {
                              setAdditionalDetails({
                                ...additionalDetails,
                                discardDate: e.target.value,
                              });
                            } else {
                              toast.error(
                                "Discard date cannot be in the future",
                              );
                            }
                          })({ target: { value: mdyToIso(v) } })
                        }
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="discard-reason"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Discard Reason{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Textarea
                        id="discard-reason"
                        value={additionalDetails.discardReason}
                        onChange={(e) =>
                          setAdditionalDetails({
                            ...additionalDetails,
                            discardReason: e.target.value,
                          })
                        }
                        className="min-h-[36px] text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setTestSetOpen(false);
                onEditingTestIdChange(null);
              }}
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
              onClick={handleSaveTestSet}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Details Screen */}
      <Dialog
        open={testDetailsOpen}
        onOpenChange={(open) => {
          if (!open) {
            setTestDetailsOpen(false);
            setEditingTestDetailId(null);
            setPreviousTestType("");
            setTestDetailsTab("results");
          }
        }}
      >
        <DialogContent
          size="xl"
          aria-describedby={descriptionId("test-details")}
        >
          <DialogHeader>
            <DialogTitle>
              {editingTestDetailId
                ? "Modify Test Details"
                : "Add Test Details"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              <span id={descriptionId("test-details")}>
                Enter the test type, panel and results for this
                test.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="bg-white">
            <Tabs
              value={testDetailsTab}
              onValueChange={(v) =>
                setTestDetailsTab(
                  v as "results" | "notification",
                )
              }
            >
              <TabsList
                variant="underline"
                separated
                className="gap-6"
              >
                <TabsTrigger
                  value="results"
                  variant="underline"
                  size="sm"
                >
                  Results
                </TabsTrigger>
                <TabsTrigger
                  value="notification"
                  variant="underline"
                  size="sm"
                >
                  Notification
                </TabsTrigger>
              </TabsList>
              <TabsContent value="results">
                <div className="space-y-6 py-4">
                  {/* Test Type and Panel */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="test-type"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Test Type{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={
                          testDetailFormData.testType || ""
                        }
                        onValueChange={handleTestTypeChange}
                      >
                        <SelectTrigger
                          id="test-type"
                          className="h-9 text-[13px] rounded"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          <SelectValue placeholder="Select test type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {TEST_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="test-panel"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Test Panel
                      </Label>
                      <Select
                        value={
                          testDetailFormData.testPanel || ""
                        }
                        onValueChange={handleTestPanelChange}
                        disabled={isTestPanelDisabled(
                          testDetailFormData.testType,
                        )}
                      >
                        <SelectTrigger
                          id="test-panel"
                          className="h-9 text-[13px] rounded"
                          style={{
                            backgroundColor:
                              testDetailFormData.testType ===
                              "Lab Test"
                                ? "#f3f2f2"
                                : "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          <SelectValue
                            placeholder={
                              testDetailFormData.testType ===
                              "Lab Test"
                                ? "N/A"
                                : "Select test panel..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableTestPanels().map(
                            (panel) => (
                              <SelectItem
                                key={panel}
                                value={panel}
                              >
                                {panel}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Conditional Fields */}
                  {testDetailFormData.testType ===
                    "Rerun Test" && (
                    <div>
                      <Label
                        htmlFor="related-test"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Related Test{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={
                          testDetailFormData.relatedTest || ""
                        }
                        onValueChange={(value) =>
                          setTestDetailFormData({
                            ...testDetailFormData,
                            relatedTest: value,
                          })
                        }
                        disabled={
                          currentTestDetails.filter(
                            (td) =>
                              td.id !== editingTestDetailId,
                          ).length === 0
                        }
                      >
                        <SelectTrigger
                          id="related-test"
                          className="h-9 text-[13px] rounded"
                          style={{
                            backgroundColor:
                              currentTestDetails.filter(
                                (td) =>
                                  td.id !== editingTestDetailId,
                              ).length === 0
                                ? "#f3f2f2"
                                : "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          <SelectValue
                            placeholder={
                              currentTestDetails.filter(
                                (td) =>
                                  td.id !== editingTestDetailId,
                              ).length === 0
                                ? "No previous tests available"
                                : "Select related test..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {currentTestDetails
                            .filter(
                              (td) =>
                                td.id !== editingTestDetailId,
                            )
                            .map((td) => (
                              <SelectItem
                                key={td.id}
                                value={td.id.toString()}
                              >
                                {td.testType} - {td.testPanel}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {testDetailFormData.testType ===
                    "Refused Test" && (
                    <div>
                      <Label
                        htmlFor="refusal-detail"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Refusal Detail
                      </Label>
                      <Textarea
                        id="refusal-detail"
                        value={
                          testDetailFormData.refusalDetail || ""
                        }
                        onChange={(e) =>
                          setTestDetailFormData({
                            ...testDetailFormData,
                            refusalDetail: e.target.value,
                          })
                        }
                        className="min-h-[80px] text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>
                  )}

                  {/* Results Date/Time and Staff */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="results-date"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Results Date
                      </Label>
                      <DateInput
                        id="results-date"
                        value={isoToMdy(
                          testDetailFormData.resultsDate || "",
                        )}
                        onChange={(v) =>
                          ((e) =>
                            setTestDetailFormData({
                              ...testDetailFormData,
                              resultsDate: e.target.value,
                            }))({
                            target: { value: mdyToIso(v) },
                          })
                        }
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="results-time"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Results Time
                      </Label>
                      <Input
                        id="results-time"
                        type="time"
                        value={
                          testDetailFormData.resultsTime || ""
                        }
                        onChange={(e) =>
                          setTestDetailFormData({
                            ...testDetailFormData,
                            resultsTime: e.target.value,
                          })
                        }
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="staff-administering"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Staff Administering Test
                      </Label>
                      <Input
                        id="staff-administering"
                        type="text"
                        value={
                          testDetailFormData.staffAdministering ||
                          ""
                        }
                        onChange={(e) =>
                          setTestDetailFormData({
                            ...testDetailFormData,
                            staffAdministering: e.target.value,
                          })
                        }
                        placeholder="Search staff..."
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Medical Alerts */}
                  {getMedicalAlerts().length > 0 && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: "#fee",
                        border: "2px solid #c23934",
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-[#c23934] flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-[13px] font-semibold text-[#c23934] mb-2">
                            Constituent has medical alert(s):
                          </h5>
                          <ul className="space-y-1">
                            {getMedicalAlerts().map(
                              (alert, index) => (
                                <li
                                  key={index}
                                  className="text-[12px] text-[#c23934]"
                                >
                                  • {alert}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test Results Grid */}
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <div
                      className="px-4 py-3 flex items-center justify-between"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <h4 className="text-[13px] font-semibold text-[#080707]">
                        Test Results
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddTestResult}
                          className="h-7 px-3 rounded-full text-[12px]"
                          style={{
                            backgroundColor: "#145F33",
                            color: "white",
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                        {testDetailFormData.testResults &&
                          testDetailFormData.testResults
                            .length > 0 && (
                            <Button
                              onClick={handleOpenModifyAll}
                              className="h-7 px-3 rounded-full text-[12px]"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                color:
                                  "var(--slds-g-color-text-default)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Modify All
                            </Button>
                          )}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table
                        className="w-full text-[13px]"
                        style={{ borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                            }}
                          >
                            <th
                              className="px-4 py-2 text-left text-[12px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Drug
                            </th>
                            <th
                              className="px-4 py-2 text-left text-[12px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Result
                            </th>
                            <th
                              className="px-4 py-2 text-left text-[12px] font-semibold"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Level
                            </th>
                            <th
                              className="px-4 py-2 text-left text-[12px] font-semibold w-16"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {!testDetailFormData.testResults ||
                          testDetailFormData.testResults
                            .length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-6 text-center text-[13px]"
                                style={{
                                  color:
                                    "var(--slds-g-color-text-weak)",
                                }}
                              >
                                No test results added yet
                              </td>
                            </tr>
                          ) : (
                            testDetailFormData.testResults.map(
                              (result, index) => (
                                <tr
                                  key={result.id}
                                  className="hover:bg-gray-50/50 transition-colors"
                                  style={{
                                    borderBottom:
                                      index <
                                      testDetailFormData
                                        .testResults!.length -
                                        1
                                        ? "1px solid var(--slds-g-color-border-base-1)"
                                        : "none",
                                  }}
                                >
                                  <td
                                    className="px-4 py-2"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {result.substance}
                                  </td>
                                  <td className="px-4 py-2">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${result.result === "Positive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                                    >
                                      {result.result}
                                    </span>
                                  </td>
                                  <td
                                    className="px-4 py-2"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-default)",
                                    }}
                                  >
                                    {result.level &&
                                    result.units
                                      ? `${result.level} ${result.units}`
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() =>
                                          handleModifyTestResult(
                                            result,
                                          )
                                        }
                                        className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                        title="Modify"
                                      >
                                        <Pencil
                                          className="h-3 w-3"
                                          style={{
                                            color:
                                              "var(--slds-g-color-text-weak)",
                                          }}
                                        />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ),
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="notification">
                <div className="space-y-4 py-4">
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <div
                      className="px-4 py-3 flex items-center justify-between"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <h4 className="text-[13px] font-semibold text-[#080707]">
                        Notifications
                      </h4>
                      <Button
                        onClick={handleOpenAddNotification}
                        className="h-7 px-3 rounded-full text-[12px]"
                        style={{
                          backgroundColor: "#145F33",
                          color: "white",
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    {(testDetailFormData.notifications || [])
                      .length === 0 ? (
                      <EmptyState
                        icon={Bell}
                        title="No notifications recorded"
                        description="Add a notification to record contact with persons regarding this test."
                        className="py-8"
                      />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow hoverable={false}>
                            <TableHead>Date Notified</TableHead>
                            <TableHead>Names</TableHead>
                            <TableHead>Notified By</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="w-16">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(
                            testDetailFormData.notifications ||
                            []
                          ).map((n) => (
                            <TableRow key={n.id}>
                              <TableCell
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {n.date
                                  ? isoToMdy(n.date)
                                  : "—"}
                                {n.time ? ` ${n.time}` : ""}
                              </TableCell>
                              <TableCell
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {n.personsNotified
                                  .map((p) => p.name)
                                  .join(", ") || "—"}
                              </TableCell>
                              <TableCell
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {n.notifiedBy}
                              </TableCell>
                              <TableCell
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {n.status}
                              </TableCell>
                              <TableCell
                                style={{
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                {n.contactType}
                              </TableCell>
                              <TableCell>
                                <button
                                  onClick={() =>
                                    handleOpenModifyNotification(
                                      n,
                                    )
                                  }
                                  className="p-1 hover:bg-[#f3f3f3] rounded transition-colors"
                                  title="Modify"
                                >
                                  <Pencil
                                    className="h-3 w-3"
                                    style={{
                                      color:
                                        "var(--slds-g-color-text-weak)",
                                    }}
                                  />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setTestDetailsOpen(false);
                setEditingTestDetailId(null);
                setPreviousTestType("");
                setTestDetailsTab("results");
              }}
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
              onClick={handleSaveTestDetail}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              {editingTestDetailId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Add/Modify Dialog */}
      <Dialog
        open={notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
      >
        <DialogContent
          size="lg"
          aria-describedby={descriptionId("notification")}
        >
          <DialogHeader>
            <DialogTitle>
              {editingNotificationId
                ? "Modify Notification"
                : "Add Notification"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              <span id={descriptionId("notification")}>
                Record who was notified about this test, when
                and how.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="notification-date"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Notification Date{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <DateInput
                  id="notification-date"
                  value={isoToMdy(notificationFormData.date)}
                  onChange={(v) =>
                    setNotificationFormData({
                      ...notificationFormData,
                      date: mdyToIso(v),
                    })
                  }
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="notification-time"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Notification Time{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="notification-time"
                  type="time"
                  value={notificationFormData.time}
                  onChange={(e) =>
                    setNotificationFormData({
                      ...notificationFormData,
                      time: e.target.value,
                    })
                  }
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="notified-by"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Notified By{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="notified-by"
                  type="text"
                  value={notificationFormData.notifiedBy}
                  onChange={(e) =>
                    setNotificationFormData({
                      ...notificationFormData,
                      notifiedBy: e.target.value,
                    })
                  }
                  placeholder="Search staff..."
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
              <div>
                <Label
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Persons Notified{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-9 px-3 flex items-center text-[13px] rounded truncate"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: notificationFormData
                        .personsNotified.length
                        ? "var(--slds-g-color-text-default)"
                        : "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {notificationFormData.personsNotified
                      .length > 0
                      ? notificationFormData.personsNotified
                          .map((p) => p.name)
                          .join(", ")
                      : "No constituents selected"}
                  </div>
                  <Button
                    onClick={handleOpenPersonsNotified}
                    className="h-9 px-4 rounded-full text-[12px] shrink-0"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-neutral-95)",
                      color: "var(--slds-g-color-text-default)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="notification-status"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Status <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={notificationFormData.status}
                  onValueChange={(value) =>
                    setNotificationFormData({
                      ...notificationFormData,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger
                    id="notification-status"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Complete">
                      Complete
                    </SelectItem>
                    <SelectItem value="Incomplete">
                      Incomplete
                    </SelectItem>
                    <SelectItem value="Pending">
                      Pending
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="notification-contact-type"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Contact Type{" "}
                  <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={notificationFormData.contactType}
                  onValueChange={(value) =>
                    setNotificationFormData({
                      ...notificationFormData,
                      contactType: value,
                    })
                  }
                >
                  <SelectTrigger
                    id="notification-contact-type"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                      border:
                        "1px solid var(--slds-g-color-border-base-1)",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    <SelectValue placeholder="Select contact type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="In-Person">
                      In-Person
                    </SelectItem>
                    <SelectItem value="Letter Mailed">
                      Letter Mailed
                    </SelectItem>
                    <SelectItem value="Phone Call">
                      Phone Call
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label
                htmlFor="notification-notes"
                className="block text-[12px] font-semibold mb-1.5 uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Notes
              </Label>
              <Textarea
                id="notification-notes"
                value={notificationFormData.notes}
                onChange={(e) =>
                  setNotificationFormData({
                    ...notificationFormData,
                    notes: e.target.value,
                  })
                }
                className="min-h-[80px] text-[13px] rounded"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setNotificationDialogOpen(false)}
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
              onClick={handleSaveNotification}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              {editingNotificationId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Persons Notified Selection Dialog */}
      <Dialog
        open={personsNotifiedOpen}
        onOpenChange={setPersonsNotifiedOpen}
      >
        <DialogContent
          size="lg"
          aria-describedby={descriptionId("persons-notified")}
        >
          <DialogHeader>
            <DialogTitle>Persons Notified</DialogTitle>
            <DialogDescription className="sr-only">
              <span id={descriptionId("persons-notified")}>
                Select the people who were notified about this
                test.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label
                  htmlFor="persons-notified-search"
                  className="block text-[12px] font-semibold mb-1.5 uppercase"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Search
                </Label>
                <Input
                  id="persons-notified-search"
                  type="text"
                  value={personsNotifiedSearchInput}
                  onChange={(e) =>
                    setPersonsNotifiedSearchInput(
                      e.target.value,
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFindPersonsNotified();
                    }
                  }}
                  placeholder="Search constituents..."
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                    border:
                      "1px solid var(--slds-g-color-border-base-1)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                />
              </div>
              <Button
                onClick={handleFindPersonsNotified}
                className="h-9 px-4 rounded-full text-[12px]"
                style={{
                  backgroundColor: "#145F33",
                  color: "white",
                }}
              >
                <Search className="w-3 h-3 mr-1" />
                Find
              </Button>
              <Button
                onClick={handleClearPersonsNotified}
                className="h-9 px-4 rounded-full text-[12px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-neutral-95)",
                  color: "var(--slds-g-color-text-default)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                Clear
              </Button>
            </div>

            <div
              className="rounded-lg overflow-hidden"
              style={{
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow hoverable={false}>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Program</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConstituents.length === 0 ? (
                      <TableRow hoverable={false}>
                        <TableCell
                          colSpan={3}
                          tone="muted"
                          className="text-center"
                        >
                          No active constituents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredConstituents.map((c) => {
                        const isSelected =
                          personsNotifiedSelected.some(
                            (p) => p.id === c.id,
                          );
                        return (
                          <TableRow
                            key={c.id}
                            className="cursor-pointer"
                            style={
                              isSelected
                                ? {
                                    backgroundColor:
                                      "var(--slds-g-color-background-alt)",
                                  }
                                : undefined
                            }
                            onClick={() =>
                              togglePersonNotified(c)
                            }
                          >
                            <TableCell
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  togglePersonNotified(c)
                                }
                              />
                            </TableCell>
                            <TableCell
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {c.name}
                            </TableCell>
                            <TableCell
                              style={{
                                color:
                                  "var(--slds-g-color-text-weak)",
                              }}
                            >
                              {c.program}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <p
              className="text-[12px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {personsNotifiedSelected.length} constituent
              {personsNotifiedSelected.length === 1
                ? ""
                : "s"}{" "}
              selected
            </p>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setPersonsNotifiedOpen(false)}
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
              onClick={handleApplyPersonsNotified}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Result Add/Modify Dialog */}
      <Dialog
        open={testResultsGridOpen}
        onOpenChange={setTestResultsGridOpen}
      >
        <DialogContent
          size={
            testResultsGridMode === "modifyAll" ? "lg" : "md"
          }
          aria-describedby={descriptionId("test-results")}
        >
          <DialogHeader>
            <DialogTitle>
              {testResultsGridMode === "add"
                ? "Add Test Result"
                : testResultsGridMode === "modify"
                  ? "Modify Test Result"
                  : "Modify All Test Results"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              <span id={descriptionId("test-results")}>
                Enter the substance, result, level and units for
                this test.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4 bg-white">
            {testResultsGridMode !== "modifyAll" ? (
              <>
                <div>
                  <Label
                    htmlFor="substance"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Substance{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={testResultFormData.substance}
                    onValueChange={(value) =>
                      setTestResultFormData({
                        ...testResultFormData,
                        substance: value,
                      })
                    }
                  >
                    <SelectTrigger
                      id="substance"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <SelectValue placeholder="Select substance..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alcohol (Ethanol)">
                        Alcohol (Ethanol)
                      </SelectItem>
                      <SelectItem value="Alcohol (Instant)">
                        Alcohol (Instant)
                      </SelectItem>
                      <SelectItem value="Alcohol (Lab)">
                        Alcohol (Lab)
                      </SelectItem>
                      <SelectItem value="Amphetamines">
                        Amphetamines
                      </SelectItem>
                      <SelectItem value="Benzodiazepines">
                        Benzodiazepines
                      </SelectItem>
                      <SelectItem value="Cocaine">
                        Cocaine
                      </SelectItem>
                      <SelectItem value="Designer Stimulants - Premium">
                        Designer Stimulants - Premium
                      </SelectItem>
                      <SelectItem value="Dextromethorphan">
                        Dextromethorphan
                      </SelectItem>
                      <SelectItem value="Ethyl Glucuronide (EtG)">
                        Ethyl Glucuronide (EtG)
                      </SelectItem>
                      <SelectItem value="Ethyl Glucuronide (EtG)/Ethyl Sulfate">
                        Ethyl Glucuronide (EtG)/Ethyl Sulfate
                      </SelectItem>
                      <SelectItem value="Fentanyl">
                        Fentanyl
                      </SelectItem>
                      <SelectItem value="Lysergic Acid Diethylamide (LSD)">
                        Lysergic Acid Diethylamide (LSD)
                      </SelectItem>
                      <SelectItem value="Opiates">
                        Opiates
                      </SelectItem>
                      <SelectItem value="Oxycodone/Oxymorphane">
                        Oxycodone/Oxymorphane
                      </SelectItem>
                      <SelectItem value="Phencyclidine (PCP)">
                        Phencyclidine (PCP)
                      </SelectItem>
                      <SelectItem value="Selective Serotonin Reuptake Inhibitors (SSRIs)">
                        Selective Serotonin Reuptake Inhibitors
                        (SSRIs)
                      </SelectItem>
                      <SelectItem value="THC Ratio">
                        THC Ratio
                      </SelectItem>
                      <SelectItem value="THC/Cannabinoids">
                        THC/Cannabinoids
                      </SelectItem>
                      <SelectItem value="Other">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="result"
                    className="block text-[12px] font-semibold mb-1.5 uppercase"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Result{" "}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={testResultFormData.result}
                    onValueChange={(value) =>
                      setTestResultFormData({
                        ...testResultFormData,
                        result: value,
                      })
                    }
                  >
                    <SelectTrigger
                      id="result"
                      className="h-9 text-[13px] rounded"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                        border:
                          "1px solid var(--slds-g-color-border-base-1)",
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Positive">
                        Positive
                      </SelectItem>
                      <SelectItem value="Negative">
                        Negative
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {testResultFormData.result === "Positive" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="level"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Level{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="level"
                        type="text"
                        value={testResultFormData.level}
                        onChange={(e) =>
                          setTestResultFormData({
                            ...testResultFormData,
                            level: e.target.value,
                          })
                        }
                        placeholder="Enter level"
                        className="h-9 text-[13px] rounded"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border:
                            "1px solid var(--slds-g-color-border-base-1)",
                          color:
                            "var(--slds-g-color-text-default)",
                        }}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="units"
                        className="block text-[12px] font-semibold mb-1.5 uppercase"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        Unit of Measure{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        value={testResultFormData.units}
                        onValueChange={(value) =>
                          setTestResultFormData({
                            ...testResultFormData,
                            units: value,
                          })
                        }
                      >
                        <SelectTrigger
                          id="units"
                          className="h-9 text-[13px] rounded"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          <SelectValue placeholder="Select units..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ng/mL">
                            ng/mL
                          </SelectItem>
                          <SelectItem value="gm/dL">
                            gm/dL
                          </SelectItem>
                          <SelectItem value="pg/mL">
                            pg/mL
                          </SelectItem>
                          <SelectItem value="mcg/mL">
                            mcg/mL
                          </SelectItem>
                          <SelectItem value="mg/dL">
                            mg/dL
                          </SelectItem>
                          <SelectItem value="ng/ng Creat">
                            ng/ng Creat
                          </SelectItem>
                          <SelectItem value="BAC">
                            BAC
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <Table>
                  <TableHeader>
                    <TableRow hoverable={false}>
                      <TableHead>Drug</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Unit of Measure</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modifyAllRows.map((row) => (
                      <TableRow key={row.id} hoverable={false}>
                        <TableCell
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                          }}
                        >
                          {row.substance}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.result}
                            onValueChange={(value) =>
                              updateModifyAllRow(row.id, {
                                result: value,
                                ...(value === "Negative"
                                  ? { level: "", units: "" }
                                  : {}),
                              })
                            }
                          >
                            <SelectTrigger
                              className="h-8 text-[12px] rounded w-28"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Positive">
                                Positive
                              </SelectItem>
                              <SelectItem value="Negative">
                                Negative
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {row.result === "Positive" ? (
                            <Input
                              value={row.level}
                              onChange={(e) =>
                                updateModifyAllRow(row.id, {
                                  level: e.target.value,
                                })
                              }
                              placeholder="Level"
                              className="h-8 text-[12px] rounded w-24"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                border:
                                  "1px solid var(--slds-g-color-border-base-1)",
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            />
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
                        </TableCell>
                        <TableCell>
                          {row.result === "Positive" ? (
                            <Select
                              value={row.units}
                              onValueChange={(value) =>
                                updateModifyAllRow(row.id, {
                                  units: value,
                                })
                              }
                            >
                              <SelectTrigger
                                className="h-8 text-[12px] rounded w-32"
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-base)",
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                  color:
                                    "var(--slds-g-color-text-default)",
                                }}
                              >
                                <SelectValue placeholder="Select units..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ng/mL">
                                  ng/mL
                                </SelectItem>
                                <SelectItem value="gm/dL">
                                  gm/dL
                                </SelectItem>
                                <SelectItem value="pg/mL">
                                  pg/mL
                                </SelectItem>
                                <SelectItem value="mcg/mL">
                                  mcg/mL
                                </SelectItem>
                                <SelectItem value="mg/dL">
                                  mg/dL
                                </SelectItem>
                                <SelectItem value="ng/ng Creat">
                                  ng/ng Creat
                                </SelectItem>
                                <SelectItem value="BAC">
                                  BAC
                                </SelectItem>
                              </SelectContent>
                            </Select>
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setTestResultsGridOpen(false)}
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
            {testResultsGridMode === "modify" &&
              editingTestResultId && (
                <Button
                  onClick={() =>
                    handleRemoveTestResult(editingTestResultId)
                  }
                  className="h-9 px-6 text-[13px] font-medium rounded-full"
                  style={{
                    backgroundColor: "#c23934",
                    color: "white",
                  }}
                >
                  Remove
                </Button>
              )}
            <Button
              onClick={
                testResultsGridMode === "modifyAll"
                  ? handleApplyModifyAll
                  : handleSaveTestResult
              }
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}