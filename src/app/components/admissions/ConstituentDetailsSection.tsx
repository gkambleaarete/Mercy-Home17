import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  CommunityCareSection,
  discardCommunityCareNotes,
  saveCommunityCareNotes,
} from "./CommunityCareSection";
import { Pencil, Trash2, Plus } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import { HouseholdDetailsSection } from "./HouseholdDetailsSection";
import {
  getBirthName,
  saveBirthName,
  type BirthNameOwner,
} from "../../data/birthNameStore";

// Types
interface Address {
  id: string;
  addressName: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  country: string;
  type: string;
  status: string;
  isPrimary: boolean;
  moveIn?: string;
  moveOut?: string;
}

interface Email {
  id: string;
  emailAddress: string;
  type: string;
  status: string;
  isPrimary: boolean;
  doNotTieToAddress: string;
}

interface Phone {
  id: string;
  phoneName: string;
  number: string;
  extension: string;
  type: string;
  status: string;
  isDefault: boolean;
  tieToAddress: string;
}

interface Website {
  id: string;
  webAddress: string;
  type: string;
  status: string;
  description: string;
  isPrimary: boolean;
}

interface ConstituentRole {
  id: string;
  role: string;
  startDate: string;
  endDate: string;
  details: string;
}

interface Attribute {
  id: string;
  type: string;
  preference: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<
    string,
    { bg: string; border: string; color: string }
  > = {
    Active: {
      bg: "#e6f4ea",
      border: "#a8d5b8",
      color: "#145f33",
    },
    Inactive: {
      bg: "#f3f2f2",
      border: "#c9c7c5",
      color: "#706e6b",
    },
    "Good Website": {
      bg: "#e0f2fe",
      border: "#7dd3fc",
      color: "#005ea2",
    },
  };
  const s = styles[status] ?? {
    bg: "#f3f2f2",
    border: "#c9c7c5",
    color: "#706e6b",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "20px",
        padding: "0 8px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

export function ConstituentDetailsSection({
  constituentId,
  birthNameOwner,
}: {
  /** Constituent ID; when set, the shared Community Care subsection renders. */
  constituentId?: string;
  /** Owner of Birth Name / Maiden Name (US 20161). Set for Admissions and
   *  Constituent Youth profiles only; undefined hides the field. */
  birthNameOwner?: BirthNameOwner;
} = {}) {
  // Contact Preference state
  const [contactPreference, setContactPreference] =
    useState("");

  // Name and basic info state
  const [prefix, setPrefix] = useState("");
  const [firstName, setFirstName] = useState("Marcus");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("Johnson");
  const [suffix, setSuffix] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [savedBirthName, setSavedBirthName] = useState(() =>
    birthNameOwner ? getBirthName(birthNameOwner) : "",
  );
  const [birthName, setBirthName] = useState(savedBirthName);
  const [sex, setSex] = useState("");
  const [race, setRace] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [religion, setReligion] = useState("Christian");

  // Professional Pronouns
  const [pronouns, setPronouns] = useState({
    heHimHis: false,
    sheHerHers: false,
    theyThemTheirs: false,
    zeZirZirs: false,
  });

  // Demographic info
  const [preferredPronouns, setPreferredPronouns] =
    useState("They/Them");
  const [deceased, setDeceased] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      addressName: "123 Main Street",
      addressLine2: "Apt 4B",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      neighborhood: "Downtown",
      country: "United States",
      type: "Home",
      status: "Active",
      isPrimary: true,
    },
    {
      id: "2",
      addressName: "456 Oak Avenue",
      addressLine2: "Unit 202",
      city: "Evanston",
      state: "IL",
      zipCode: "60202",
      neighborhood: "Central",
      country: "United States",
      type: "Other",
      status: "Inactive",
      isPrimary: false,
    },
  ]);
  const [addressDialogOpen, setAddressDialogOpen] =
    useState(false);
  const [editingAddress, setEditingAddress] =
    useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<
    Partial<Address>
  >({
    addressName: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    neighborhood: "",
    country: "",
    type: "Home",
    status: "Active",
    isPrimary: false,
    moveIn: "",
    moveOut: "",
  });

  // Emails
  const [emails, setEmails] = useState<Email[]>([
    {
      id: "1",
      emailAddress: "constituent@example.com",
      type: "Personal",
      status: "Active",
      isPrimary: true,
      doNotTieToAddress: "Do Not Tie to Address",
    },
    {
      id: "2",
      emailAddress: "work.email@company.com",
      type: "Work",
      status: "Active",
      isPrimary: false,
      doNotTieToAddress: "1",
    },
  ]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [editingEmail, setEditingEmail] =
    useState<Email | null>(null);
  const [emailForm, setEmailForm] = useState<Partial<Email>>({
    emailAddress: "",
    type: "Personal",
    status: "Active",
    isPrimary: false,
    doNotTieToAddress: "Do Not Tie to Address",
  });

  // Phones
  const [phones, setPhones] = useState<Phone[]>([
    {
      id: "1",
      phoneName: "Primary Cell",
      number: "(312) 555-1234",
      extension: "",
      type: "Mobile",
      status: "Active",
      isDefault: true,
      tieToAddress: "Do Not Tie to Address",
    },
    {
      id: "2",
      phoneName: "Home Phone",
      number: "(773) 555-5678",
      extension: "123",
      type: "Home",
      status: "Active",
      isDefault: false,
      tieToAddress: "1",
    },
  ]);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [editingPhone, setEditingPhone] =
    useState<Phone | null>(null);
  const [phoneForm, setPhoneForm] = useState<Partial<Phone>>({
    phoneName: "",
    number: "",
    extension: "",
    type: "Mobile",
    status: "Active",
    isDefault: false,
    tieToAddress: "Do Not Tie to Address",
  });

  // Websites
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: "1",
      webAddress: "https://www.mercyhome.org",
      type: "Business",
      status: "Good Website",
      description: "Main organization website",
      isPrimary: true,
    },
    {
      id: "2",
      webAddress: "https://www.facebook.com/MercyHomeChicago",
      type: "Facebook",
      status: "Good Website",
      description: "Official Facebook page",
      isPrimary: false,
    },
  ]);
  const [websiteDialogOpen, setWebsiteDialogOpen] =
    useState(false);
  const [editingWebsite, setEditingWebsite] =
    useState<Website | null>(null);
  const [websiteForm, setWebsiteForm] = useState<
    Partial<Website>
  >({
    webAddress: "",
    type: "Portal",
    status: "Good Website",
    description: "",
    isPrimary: false,
  });

  // Constituent Roles
  const [roles, setRoles] = useState<ConstituentRole[]>([
    {
      id: "1",
      role: "MHSG Staff",
      startDate: "01/15/2024",
      endDate: "-",
      details: "Case Manager for residential program",
    },
    {
      id: "2",
      role: "Youth",
      startDate: "03/20/2023",
      endDate: "09/30/2023",
      details: "Participant in transitional living program",
    },
    {
      id: "3",
      role: "Community Care Housing",
      startDate: "06/01/2023",
      endDate: "12/31/2023",
      details: "Housing support coordinator",
    },
  ]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] =
    useState<ConstituentRole | null>(null);
  const [roleForm, setRoleForm] = useState<
    Partial<ConstituentRole>
  >({
    role: "",
    startDate: "",
    endDate: "",
    details: "",
  });

  // Attributes
  const [attributes, setAttributes] = useState<Attribute[]>([
    {
      id: "1",
      type: "Language",
      preference: "Spanish",
    },
    {
      id: "2",
      type: "Dietary",
      preference: "Vegetarian",
    },
    {
      id: "3",
      type: "Communication",
      preference: "Text preferred",
    },
  ]);
  const [attributeDialogOpen, setAttributeDialogOpen] =
    useState(false);
  const [editingAttribute, setEditingAttribute] =
    useState<Attribute | null>(null);
  const [attributeForm, setAttributeForm] = useState<
    Partial<Attribute>
  >({
    type: "",
    preference: "",
  });

  // Address handlers
  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      addressName: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      neighborhood: "",
      country: "",
      type: "Home",
      status: "Active",
      isPrimary: false,
      moveIn: "",
      moveOut: "",
    });
    setAddressDialogOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setAddressDialogOpen(true);
  };

  const handleSaveAddress = () => {
    if (!addressForm.addressName) {
      toast.error("Address name is required");
      return;
    }

    if (editingAddress) {
      setAddresses(
        addresses.map((a) =>
          a.id === editingAddress.id
            ? ({
                ...addressForm,
                id: editingAddress.id,
              } as Address)
            : a,
        ),
      );
      toast.success("Address updated successfully");
    } else {
      const newAddress: Address = {
        ...addressForm,
        id: Date.now().toString(),
      } as Address;
      setAddresses([...addresses, newAddress]);
      toast.success("Address added successfully");
    }
    setAddressDialogOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.success("Address deleted successfully");
  };

  // Email handlers
  const handleAddEmail = () => {
    setEditingEmail(null);
    setEmailForm({
      emailAddress: "",
      type: "Personal",
      status: "Active",
      isPrimary: false,
      doNotTieToAddress: "Do Not Tie to Address",
    });
    setEmailDialogOpen(true);
  };

  const handleEditEmail = (email: Email) => {
    setEditingEmail(email);
    setEmailForm(email);
    setEmailDialogOpen(true);
  };

  const handleSaveEmail = () => {
    if (!emailForm.emailAddress) {
      toast.error("Email address is required");
      return;
    }

    if (editingEmail) {
      setEmails(
        emails.map((e) =>
          e.id === editingEmail.id
            ? ({ ...emailForm, id: editingEmail.id } as Email)
            : e,
        ),
      );
      toast.success("Email updated successfully");
    } else {
      const newEmail: Email = {
        ...emailForm,
        id: Date.now().toString(),
      } as Email;
      setEmails([...emails, newEmail]);
      toast.success("Email added successfully");
    }
    setEmailDialogOpen(false);
  };

  const handleDeleteEmail = (id: string) => {
    setEmails(emails.filter((e) => e.id !== id));
    toast.success("Email deleted successfully");
  };

  // Phone handlers
  const handleAddPhone = () => {
    setEditingPhone(null);
    setPhoneForm({
      number: "",
      type: "Mobile",
      status: "Active",
      isDefault: false,
      tieToAddress: "Do Not Tie to Address",
    });
    setPhoneDialogOpen(true);
  };

  const handleEditPhone = (phone: Phone) => {
    setEditingPhone(phone);
    setPhoneForm(phone);
    setPhoneDialogOpen(true);
  };

  const handleSavePhone = () => {
    if (!phoneForm.number) {
      toast.error("Phone number is required");
      return;
    }

    if (editingPhone) {
      setPhones(
        phones.map((p) =>
          p.id === editingPhone.id
            ? ({ ...phoneForm, id: editingPhone.id } as Phone)
            : p,
        ),
      );
      toast.success("Phone updated successfully");
    } else {
      const newPhone: Phone = {
        ...phoneForm,
        id: Date.now().toString(),
      } as Phone;
      setPhones([...phones, newPhone]);
      toast.success("Phone added successfully");
    }
    setPhoneDialogOpen(false);
  };

  const handleDeletePhone = (id: string) => {
    setPhones(phones.filter((p) => p.id !== id));
    toast.success("Phone deleted successfully");
  };

  // Helper function to get address display name
  const getAddressDisplayName = (addressId: string) => {
    if (addressId === "Do Not Tie to Address") {
      return "Do Not Tie to Address";
    }
    const address = addresses.find((a) => a.id === addressId);
    if (address) {
      return `${address.addressName} - ${address.city}, ${address.state} ${address.zipCode}`;
    }
    return "Do Not Tie to Address";
  };

  // Website handlers
  const handleAddWebsite = () => {
    setEditingWebsite(null);
    setWebsiteForm({
      webAddress: "",
      type: "Portal",
      status: "Good Website",
      description: "",
      isPrimary: false,
    });
    setWebsiteDialogOpen(true);
  };

  const handleEditWebsite = (website: Website) => {
    setEditingWebsite(website);
    setWebsiteForm(website);
    setWebsiteDialogOpen(true);
  };

  const handleSaveWebsite = () => {
    if (!websiteForm.webAddress) {
      toast.error("Web address is required");
      return;
    }

    if (editingWebsite) {
      setWebsites(
        websites.map((w) =>
          w.id === editingWebsite.id
            ? ({
                ...websiteForm,
                id: editingWebsite.id,
              } as Website)
            : w,
        ),
      );
      toast.success("Website updated successfully");
    } else {
      const newWebsite: Website = {
        ...websiteForm,
        id: Date.now().toString(),
      } as Website;
      setWebsites([...websites, newWebsite]);
      toast.success("Website added successfully");
    }
    setWebsiteDialogOpen(false);
  };

  const handleDeleteWebsite = (id: string) => {
    setWebsites(websites.filter((w) => w.id !== id));
    toast.success("Website deleted successfully");
  };

  // Role handlers
  const handleAddRole = () => {
    setEditingRole(null);
    setRoleForm({
      role: "",
      startDate: "",
      endDate: "",
      details: "",
    });
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: ConstituentRole) => {
    setEditingRole(role);
    setRoleForm(role);
    setRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleForm.role) {
      toast.error("Role name is required");
      return;
    }

    if (editingRole) {
      setRoles(
        roles.map((r) =>
          r.id === editingRole.id
            ? ({
                ...roleForm,
                id: editingRole.id,
              } as ConstituentRole)
            : r,
        ),
      );
      toast.success("Role updated successfully");
    } else {
      const newRole: ConstituentRole = {
        ...roleForm,
        id: Date.now().toString(),
      } as ConstituentRole;
      setRoles([...roles, newRole]);
      toast.success("Role added successfully");
    }
    setRoleDialogOpen(false);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
    toast.success("Role deleted successfully");
  };

  // Attribute handlers
  const handleAddAttribute = () => {
    setEditingAttribute(null);
    setAttributeForm({
      type: "",
      preference: "",
    });
    setAttributeDialogOpen(true);
  };

  const handleEditAttribute = (attribute: Attribute) => {
    setEditingAttribute(attribute);
    setAttributeForm(attribute);
    setAttributeDialogOpen(true);
  };

  const handleSaveAttribute = () => {
    if (!attributeForm.type) {
      toast.error("Attribute type is required");
      return;
    }

    if (editingAttribute) {
      setAttributes(
        attributes.map((a) =>
          a.id === editingAttribute.id
            ? ({
                ...attributeForm,
                id: editingAttribute.id,
              } as Attribute)
            : a,
        ),
      );
      toast.success("Attribute updated successfully");
    } else {
      const newAttribute: Attribute = {
        ...attributeForm,
        id: Date.now().toString(),
      } as Attribute;
      setAttributes([...attributes, newAttribute]);
      toast.success("Attribute added successfully");
    }
    setAttributeDialogOpen(false);
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes(attributes.filter((a) => a.id !== id));
    toast.success("Attribute deleted successfully");
  };

  return (
    <div className="space-y-6 w-full">
      {/* CONSOLIDATED: Basic Information Section */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
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
          <h3 className="text-[13px] font-semibold text-[#080707]">
            Basic Information
          </h3>
        </div>
        <div className="p-4 space-y-6">
          {/* Name Fields */}
          <div>
            <h4
              className="text-[12px] font-semibold mb-3"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Name
            </h4>
            <div className="space-y-4">
              {/* Row 1: Prefix, First Name, Middle Initial, Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-2">
                  <Label
                    htmlFor="prefix"
                    className="text-[11px] font-medium mb-1.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    PREFIX
                  </Label>
                  <Select
                    value={prefix}
                    onValueChange={setPrefix}
                  >
                    <SelectTrigger
                      className="h-8 text-[13px] slds-theme_default"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Miss">Miss</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Rev.">Rev.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-4">
                  <Label
                    htmlFor="firstName"
                    className="text-[11px] font-medium mb-1.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    FIRST NAME
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    className="h-8 text-[13px]"
                    placeholder="Enter first name"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label
                    htmlFor="middleName"
                    className="text-[11px] font-medium mb-1.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    MIDDLE INITIAL
                  </Label>
                  <Input
                    id="middleName"
                    value={middleName}
                    onChange={(e) =>
                      setMiddleName(e.target.value)
                    }
                    className="h-8 text-[13px]"
                    placeholder="MI"
                    maxLength={1}
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
                <div className="lg:col-span-4">
                  <Label
                    htmlFor="lastName"
                    className="text-[11px] font-medium mb-1.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    LAST NAME
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    className="h-8 text-[13px]"
                    placeholder="Enter last name"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
              </div>
              {/* Row 2: Suffix, Preferred Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-2">
                  <Label
                    htmlFor="suffix"
                    className="text-[11px] font-medium mb-1.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    SUFFIX
                  </Label>
                  <Select
                    value={suffix}
                    onValueChange={setSuffix}
                  >
                    <SelectTrigger
                      className="h-8 text-[13px]"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jr.">Jr.</SelectItem>
                      <SelectItem value="Sr.">Sr.</SelectItem>
                      <SelectItem value="II">II</SelectItem>
                      <SelectItem value="III">III</SelectItem>
                      <SelectItem value="IV">IV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-4">
                  <Label
                    htmlFor="preferredName"
                    className="text-[11px] font-medium mb-1.5"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    PREFERRED NAME
                  </Label>
                  <Input
                    id="preferredName"
                    value={preferredName}
                    onChange={(e) =>
                      setPreferredName(e.target.value)
                    }
                    className="h-8 text-[13px]"
                    placeholder="Enter preferred name"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  />
                </div>
                {birthNameOwner && (
                  <div className="lg:col-span-4">
                    <Label
                      htmlFor="birthName"
                      className="text-[11px] font-medium mb-1.5"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      BIRTH NAME / MAIDEN NAME
                    </Label>
                    <Input
                      id="birthName"
                      value={birthName}
                      onChange={(e) => setBirthName(e.target.value)}
                      className="h-8 text-[13px]"
                      placeholder="Enter birth name / maiden name"
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-base)",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Demographics & Identity - Grid Layout */}
          <div>
            <h4
              className="text-[12px] font-semibold mb-3"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Demographics & Identity
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="sex"
                  className="text-[11px] font-medium mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  SEX
                </Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger
                    className="h-8 text-[13px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">
                      Female
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="race"
                  className="text-[11px] font-medium mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  ETHNICITY
                </Label>
                <Select value={race} onValueChange={setRace}>
                  <SelectTrigger
                    className="h-8 text-[13px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue placeholder="Select ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Hispanic/Latino">
                      Hispanic/Latino
                    </SelectItem>
                    <SelectItem value="Asian/Pacific Islander">
                      Asian/Pacific Islander
                    </SelectItem>
                    <SelectItem value="Native American">
                      Native American
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="African">
                      African
                    </SelectItem>
                    <SelectItem value="Unknown">
                      Unknown
                    </SelectItem>
                    <SelectItem value="African American">
                      African American
                    </SelectItem>
                    <SelectItem value="Belizian">
                      Belizian
                    </SelectItem>
                    <SelectItem value="Haitian">
                      Haitian
                    </SelectItem>
                    <SelectItem value="Jamaican">
                      Jamaican
                    </SelectItem>
                    <SelectItem value="Middle Eastern">
                      Middle Eastern
                    </SelectItem>
                    <SelectItem value="Multiracial">
                      Multiracial
                    </SelectItem>
                    <SelectItem value="Black">Black</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="dateOfBirth"
                  className="text-[11px] font-medium mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  DATE OF BIRTH
                </Label>
                <Input
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) =>
                    setDateOfBirth(e.target.value)
                  }
                  placeholder="MM/DD/YYYY"
                  className="h-8 text-[13px]"
                  style={{
                    borderColor:
                      "var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-base)",
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="maritalStatus"
                  className="text-[11px] font-medium mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  MARITAL STATUS
                </Label>
                <Select
                  value={maritalStatus}
                  onValueChange={setMaritalStatus}
                >
                  <SelectTrigger
                    className="h-8 text-[13px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">
                      Single
                    </SelectItem>
                    <SelectItem value="Married">
                      Married
                    </SelectItem>
                    <SelectItem value="Divorced">
                      Divorced
                    </SelectItem>
                    <SelectItem value="Widowed">
                      Widowed
                    </SelectItem>
                    <SelectItem value="Separated">
                      Separated
                    </SelectItem>
                    <SelectItem value="Domestic Partnership">
                      Domestic Partnership
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="religion"
                  className="text-[11px] font-medium mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  RELIGION
                </Label>
                <Select
                  value={religion}
                  onValueChange={setReligion}
                >
                  <SelectTrigger
                    className="h-8 text-[13px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Christian">
                      Christian
                    </SelectItem>
                    <SelectItem value="Catholic">
                      Catholic
                    </SelectItem>
                    <SelectItem value="Muslim">
                      Muslim
                    </SelectItem>
                    <SelectItem value="Jewish">
                      Jewish
                    </SelectItem>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Buddhist">
                      Buddhist
                    </SelectItem>
                    <SelectItem value="Atheist">
                      Atheist
                    </SelectItem>
                    <SelectItem value="Agnostic">
                      Agnostic
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="preferredPronouns"
                  className="text-[11px] font-medium mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  PREFERRED PRONOUNS
                </Label>
                <Select
                  value={preferredPronouns}
                  onValueChange={setPreferredPronouns}
                >
                  <SelectTrigger
                    className="h-8 text-[13px]"
                    style={{
                      backgroundColor:
                        "var(--slds-g-color-background-base)",
                    }}
                  >
                    <SelectValue placeholder="Select pronouns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="He/Him">
                      He/Him
                    </SelectItem>
                    <SelectItem value="She/Her">
                      She/Her
                    </SelectItem>
                    <SelectItem value="They/Them">
                      They/Them
                    </SelectItem>
                    <SelectItem value="He/They">
                      He/They
                    </SelectItem>
                    <SelectItem value="She/They">
                      She/They
                    </SelectItem>
                    <SelectItem value="Ze/Zir">
                      Ze/Zir
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="deceased"
                  className="text-[11px] font-medium mb-1.5"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  STATUS
                </Label>
                <div className="flex items-center h-8">
                  <Checkbox
                    id="deceased"
                    checked={deceased}
                    onCheckedChange={setDeceased}
                    className="mr-2"
                  />
                  <Label
                    htmlFor="deceased"
                    className="text-[13px] font-normal cursor-pointer"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    DECEASED
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
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
          <h3 className="text-[13px] font-semibold text-[#080707]">
            Constituent Addresses
          </h3>
          <button
            className="px-2 py-1 bg-transparent font-medium flex items-center gap-1.5 bh-outlined-primary"
            onClick={handleAddAddress}
            style={{
              color: "var(--color-brand-primary)",
              border: "1.5px solid var(--color-brand-primary)",
              borderRadius: "9999px",
              fontSize: "var(--slds-g-font-size-3)",
            }}
          >
            <Plus className="h-3 w-auto" /> New
          </button>
        </div>
        <div className="overflow-x-auto">
          {addresses.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    ADDRESS
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    ADDRESS LINE 2/UNIT
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    CITY
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    STATE
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    ZIP
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    NEIGHBORHOOD
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    COUNTRY
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    TYPE
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    STATUS
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    IS PRIMARY
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((address) => (
                  <tr key={address.id}>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {address.addressName}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {address.addressLine2}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {address.city}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {address.state}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {address.zipCode}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {address.neighborhood}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {address.country}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {address.type}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <StatusBadge status={address.status} />
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {address.isPrimary ? "Yes" : "No"}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleEditAddress(address)
                          }
                          className={`flex items-center justify-center bg-transparent bh-ghost-neutral`}
                          style={{
                            width: 33,
                            height: 33,
                            borderRadius: "9999px",
                            color:
                              "var(--slds-g-color-text-default)",
                            border: "none",
                          }}
                        >
                          <Pencil className="h-4 w-4 text-[2px]" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAddress(address.id)
                          }
                          className={`flex items-center justify-center bg-transparent bh-ghost-destructive`}
                          style={{
                            width: 33,
                            height: 33,
                            borderRadius: "9999px",
                            color: "var(--destructive)",
                            border: "none",
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-[10px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-[13px] text-[#706e6b]">
              No addresses added
            </div>
          )}
        </div>
      </div>

      {/* Contact Preference */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
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
          <h3 className="text-[13px] font-semibold text-[#080707]">
            Contact Preference
          </h3>
        </div>
        <div className="p-4">
          <div
            className="space-y-1.5"
            style={{ maxWidth: "360px" }}
          >
            <Label
              htmlFor="contactPreference"
              className="slds-form-label"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              CONTACT PREFERENCE
            </Label>
            <Select
              value={contactPreference}
              onValueChange={setContactPreference}
            >
              <SelectTrigger
                id="contactPreference"
                className="h-9 slds-text-4"
                style={{
                  borderColor:
                    "var(--slds-g-color-border-base-1)",
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                }}
              >
                <SelectValue placeholder="Select Preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="no-preference"
                  className="slds-text-4"
                >
                  No Preference
                </SelectItem>
                <SelectItem
                  value="phone"
                  className="slds-text-4"
                >
                  Phone Preferred
                </SelectItem>
                <SelectItem
                  value="email"
                  className="slds-text-4"
                >
                  Email Preferred
                </SelectItem>
                <SelectItem
                  value="mail"
                  className="slds-text-4"
                >
                  Mail Preferred
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* CONSOLIDATED: Contact Information (Emails + Phones) */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
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
          <h3 className="text-[13px] font-semibold text-[#080707]">
            Contact Information
          </h3>
        </div>

        <div className="p-4 space-y-6">
          {/* Emails Sub-section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4
                className="text-[12px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Email Addresses
              </h4>
              <button
                className="px-2 py-1 bg-transparent font-medium flex items-center gap-1.5 bh-outlined-primary"
                onClick={handleAddEmail}
                style={{
                  color: "var(--color-brand-primary)",
                  border:
                    "1.5px solid var(--color-brand-primary)",
                  borderRadius: "9999px",
                  fontSize: "var(--slds-g-font-size-3)",
                }}
              >
                <Plus className="h-3 w-auto" /> Add Email
              </button>
            </div>
            <div className="overflow-x-auto">
              {emails.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        EMAIL ADDRESS
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        TYPE
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        STATUS
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        IS PRIMARY
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        DO NOT TIE TO ADDRESS
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((email) => (
                      <tr key={email.id}>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {email.emailAddress}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {email.type}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <StatusBadge status={email.status} />
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {email.isPrimary ? "Yes" : "No"}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {email.doNotTieToAddress
                            ? "Yes"
                            : "No"}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEditEmail(email)
                              }
                              className={`flex items-center justify-center bg-transparent bh-ghost-neutral`}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "9999px",
                                color:
                                  "var(--slds-g-color-text-default)",
                                border: "none",
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteEmail(email.id)
                              }
                              className={`flex items-center justify-center bg-transparent bh-ghost-destructive`}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "9999px",
                                color: "var(--destructive)",
                                border: "none",
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-[13px] text-[#706e6b]">
                  No emails added
                </div>
              )}
            </div>
          </div>

          {/* Phones Sub-section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4
                className="text-[12px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Phone Numbers
              </h4>
              <button
                className="px-2 py-1 bg-transparent font-medium flex items-center gap-1.5 bh-outlined-primary"
                onClick={handleAddPhone}
                style={{
                  color: "var(--color-brand-primary)",
                  border:
                    "1.5px solid var(--color-brand-primary)",
                  borderRadius: "9999px",
                  fontSize: "var(--slds-g-font-size-3)",
                }}
              >
                <Plus className="h-3 w-auto" /> Add Phone
              </button>
            </div>
            <div className="overflow-x-auto">
              {phones.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        PHONE NAME
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        NUMBER
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        EXTENSION
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        TYPE
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        STATUS
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        IS PRIMARY
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        TIE TO ADDRESS
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {phones.map((phone) => (
                      <tr key={phone.id}>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {phone.phoneName}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {phone.number}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {phone.extension || "-"}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {phone.type}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <StatusBadge status={phone.status} />
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {phone.isDefault ? "Yes" : "No"}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {getAddressDisplayName(
                            phone.tieToAddress,
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEditPhone(phone)
                              }
                              className={`flex items-center justify-center bg-transparent bh-ghost-neutral`}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "9999px",
                                color:
                                  "var(--slds-g-color-text-default)",
                                border: "none",
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeletePhone(phone.id)
                              }
                              className={`flex items-center justify-center bg-transparent bh-ghost-destructive`}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "9999px",
                                color: "var(--destructive)",
                                border: "none",
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-[13px] text-[#706e6b]">
                  No phones added
                </div>
              )}
            </div>
          </div>

          {/* Websites Sub-section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4
                className="text-[12px] font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Websites
              </h4>
              <button
                className="px-2 py-1 bg-transparent font-medium flex items-center gap-1.5 bh-outlined-primary"
                onClick={handleAddWebsite}
                style={{
                  color: "var(--color-brand-primary)",
                  border:
                    "1.5px solid var(--color-brand-primary)",
                  borderRadius: "9999px",
                  fontSize: "var(--slds-g-font-size-3)",
                }}
              >
                <Plus className="h-3 w-auto" /> Add Website
              </button>
            </div>
            <div className="overflow-x-auto">
              {websites.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-background-alt)",
                      }}
                    >
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        PRIMARY
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        WEBSITE
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        DESCRIPTION
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        TYPE
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        Status
                      </th>
                      <th
                        className="px-4 py-2 text-left text-[11px] font-semibold"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {websites.map((website) => (
                      <tr key={website.id}>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {website.isPrimary ? "Yes" : "No"}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <a
                            href={website.webAddress}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {website.webAddress}
                          </a>
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {website.description || "-"}
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            color:
                              "var(--slds-g-color-text-default)",
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          {website.type}
                        </td>
                        <td
                          className="px-4 py-3"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <StatusBadge
                            status={website.status}
                          />
                        </td>
                        <td
                          className="px-4 py-3 text-[13px]"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEditWebsite(website)
                              }
                              className={`flex items-center justify-center bg-transparent bh-ghost-neutral`}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "9999px",
                                color:
                                  "var(--slds-g-color-text-default)",
                                border: "none",
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteWebsite(website.id)
                              }
                              className={`flex items-center justify-center bg-transparent bh-ghost-destructive`}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "9999px",
                                color: "var(--destructive)",
                                border: "none",
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-[13px] text-[#706e6b]">
                  No websites added
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
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
          <h3 className="text-[13px] font-semibold text-[#080707]">
            Attributes
          </h3>
        </div>
        <div className="p-8 text-center text-[13px] text-[#706e6b]">
          Work in progress
        </div>
      </div>

      {/* Constituent Roles Section */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
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
          <h3 className="text-[13px] font-semibold text-[#080707]">
            Roles
          </h3>
          <button
            className="px-2 py-1 bg-transparent font-medium flex items-center gap-1.5 bh-outlined-primary"
            onClick={handleAddRole}
            style={{
              color: "var(--color-brand-primary)",
              border: "1.5px solid var(--color-brand-primary)",
              borderRadius: "9999px",
              fontSize: "var(--slds-g-font-size-3)",
            }}
          >
            <Plus className="h-3 w-auto" /> New
          </button>
        </div>
        <div className="overflow-x-auto">
          {roles.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    ROLE
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    START DATE
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    END DATE
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    DETAILS
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {role.role}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {role.startDate}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {role.endDate}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {role.details}
                    </td>
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className={`flex items-center justify-center bg-transparent bh-ghost-neutral`}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "9999px",
                            color:
                              "var(--slds-g-color-text-default)",
                            border: "none",
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRole(role.id)
                          }
                          className={`flex items-center justify-center bg-transparent bh-ghost-destructive`}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "9999px",
                            color: "var(--destructive)",
                            border: "none",
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-[13px] text-[#706e6b]">
              No roles added
            </div>
          )}
        </div>
      </div>

      {/* Household Details Section */}
      <HouseholdDetailsSection />

      {/* Address Dialog */}
      <Dialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Update the address information."
                : "Add a new address to the constituent's profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="addressName">Address *</Label>
              <Input
                id="addressName"
                value={addressForm.addressName || ""}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    addressName: e.target.value,
                  })
                }
                placeholder="e.g., 123 Main St"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addressLine2">
                Address line 2/Unit
              </Label>
              <Input
                id="addressLine2"
                value={addressForm.addressLine2 || ""}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    addressLine2: e.target.value,
                  })
                }
                placeholder="e.g., Apt 4B"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={addressForm.city || ""}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    city: e.target.value,
                  })
                }
                placeholder="e.g., Chicago"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={addressForm.state || ""}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    state: e.target.value,
                  })
                }
                placeholder="e.g., IL"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={addressForm.zipCode || ""}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    zipCode: e.target.value,
                  })
                }
                placeholder="e.g., 60601"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input
                id="neighborhood"
                value={addressForm.neighborhood || ""}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    neighborhood: e.target.value,
                  })
                }
                placeholder="e.g., Downtown"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={addressForm.country || ""}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    country: e.target.value,
                  })
                }
                placeholder="e.g., United States"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addressType">TYPE</Label>
              <Select
                value={addressForm.type}
                onValueChange={(value) =>
                  setAddressForm({
                    ...addressForm,
                    type: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addressStatus">Status</Label>
              <Select
                value={addressForm.status}
                onValueChange={(value) =>
                  setAddressForm({
                    ...addressForm,
                    status: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={addressForm.isPrimary}
                onCheckedChange={(checked) =>
                  setAddressForm({
                    ...addressForm,
                    isPrimary: checked as boolean,
                  })
                }
              />
              <Label
                htmlFor="isPrimary"
                className="cursor-pointer"
              >
                IS PRIMARY ADDRESS
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddressDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAddress}
              className="rounded-full"
              style={{ backgroundColor: "#145F33" }}
            >
              {editingAddress ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEmail ? "Edit Email" : "Add Email"}
            </DialogTitle>
            <DialogDescription>
              {editingEmail
                ? "Update the email information."
                : "Add a new email address to the constituent's profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="emailAddress">
                EMAIL ADDRESS *
              </Label>
              <Input
                id="emailAddress"
                type="email"
                value={emailForm.emailAddress || ""}
                onChange={(e) =>
                  setEmailForm({
                    ...emailForm,
                    emailAddress: e.target.value,
                  })
                }
                placeholder="email@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emailType">TYPE</Label>
              <Select
                value={emailForm.type}
                onValueChange={(value) =>
                  setEmailForm({ ...emailForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal">
                    Personal
                  </SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emailStatus">Status</Label>
              <Select
                value={emailForm.status}
                onValueChange={(value) =>
                  setEmailForm({ ...emailForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={emailForm.isPrimary}
                onCheckedChange={(checked) =>
                  setEmailForm({
                    ...emailForm,
                    isPrimary: checked as boolean,
                  })
                }
              />
              <Label
                htmlFor="isPrimary"
                className="cursor-pointer"
              >
                IS PRIMARY EMAIL
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tieToAddress">
                TIE TO ADDRESS
              </Label>
              <Select
                value={
                  emailForm.doNotTieToAddress ||
                  "Do Not Tie to Address"
                }
                onValueChange={(value) =>
                  setEmailForm({
                    ...emailForm,
                    doNotTieToAddress: value,
                  })
                }
              >
                <SelectTrigger id="tieToAddress">
                  <SelectValue placeholder="Select address..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Do Not Tie to Address">
                    Do Not Tie to Address
                  </SelectItem>
                  <SelectItem value="1">
                    123 Main Street, Apt 4B - Chicago, IL 60601
                  </SelectItem>
                  <SelectItem value="2">
                    456 Oak Avenue, Unit 202 - Evanston, IL
                    60202
                  </SelectItem>
                  <SelectItem value="3">
                    789 Elm Street - Oak Park, IL 60302
                  </SelectItem>
                  <SelectItem value="4">
                    321 Pine Road, Suite 100 - Naperville, IL
                    60540
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEmail}
              className="rounded-full"
              style={{ backgroundColor: "#145F33" }}
            >
              {editingEmail ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phone Dialog */}
      <Dialog
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPhone ? "Edit Phone" : "Add Phone"}
            </DialogTitle>
            <DialogDescription>
              {editingPhone
                ? "Update the phone information."
                : "Add a new phone number to the constituent's profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phoneName">PHONE NAME</Label>
              <Input
                id="phoneName"
                type="text"
                value={phoneForm.phoneName || ""}
                onChange={(e) =>
                  setPhoneForm({
                    ...phoneForm,
                    phoneName: e.target.value,
                  })
                }
                placeholder="e.g. Primary Cell, Home Phone"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">
                PHONE NUMBER *
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneForm.number || ""}
                onChange={(e) =>
                  setPhoneForm({
                    ...phoneForm,
                    number: e.target.value,
                  })
                }
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="extension">EXTENSION</Label>
              <Input
                id="extension"
                type="text"
                value={phoneForm.extension || ""}
                onChange={(e) =>
                  setPhoneForm({
                    ...phoneForm,
                    extension: e.target.value,
                  })
                }
                placeholder="e.g. 123"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneType">TYPE</Label>
              <Select
                value={phoneForm.type}
                onValueChange={(value) =>
                  setPhoneForm({ ...phoneForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneStatus">STATUS</Label>
              <Select
                value={phoneForm.status}
                onValueChange={(value) =>
                  setPhoneForm({ ...phoneForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={phoneForm.isDefault}
                onCheckedChange={(checked) =>
                  setPhoneForm({
                    ...phoneForm,
                    isDefault: checked as boolean,
                  })
                }
              />
              <Label
                htmlFor="isDefault"
                className="cursor-pointer"
              >
                IS PRIMARY PHONE
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneTieToAddress">
                Tie to Address
              </Label>
              <Select
                value={
                  phoneForm.tieToAddress ||
                  "Do Not Tie to Address"
                }
                onValueChange={(value) =>
                  setPhoneForm({
                    ...phoneForm,
                    tieToAddress: value,
                  })
                }
              >
                <SelectTrigger id="phoneTieToAddress">
                  <SelectValue placeholder="Select address..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Do Not Tie to Address">
                    Do Not Tie to Address
                  </SelectItem>
                  <SelectItem value="1">
                    123 Main Street, Apt 4B - Chicago, IL 60601
                  </SelectItem>
                  <SelectItem value="2">
                    456 Oak Avenue, Unit 202 - Evanston, IL
                    60202
                  </SelectItem>
                  <SelectItem value="3">
                    789 Elm Street - Oak Park, IL 60302
                  </SelectItem>
                  <SelectItem value="4">
                    321 Pine Road, Suite 100 - Naperville, IL
                    60540
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPhoneDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePhone}
              className="rounded-full"
              style={{ backgroundColor: "#145F33" }}
            >
              {editingPhone ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Website Dialog */}
      <Dialog
        open={websiteDialogOpen}
        onOpenChange={setWebsiteDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingWebsite ? "Edit Website" : "Add Website"}
            </DialogTitle>
            <DialogDescription>
              {editingWebsite
                ? "Update the website information."
                : "Add a new website to the constituent's profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="websiteType">
                  WEBSITE TYPE:
                </Label>
                <Select
                  value={websiteForm.type}
                  onValueChange={(value) =>
                    setWebsiteForm({
                      ...websiteForm,
                      type: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Portal">
                      Portal
                    </SelectItem>
                    <SelectItem value="School">
                      School
                    </SelectItem>
                    <SelectItem value="Business">
                      Business
                    </SelectItem>
                    <SelectItem value="Personal">
                      Personal
                    </SelectItem>
                    <SelectItem value="Appointment">
                      Appointment
                    </SelectItem>
                    <SelectItem value="Facebook">
                      Facebook
                    </SelectItem>
                    <SelectItem value="Twitter">
                      Twitter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="websiteStatus">
                  WEBSITE STATUS:
                </Label>
                <Select
                  value={websiteForm.status}
                  onValueChange={(value) =>
                    setWebsiteForm({
                      ...websiteForm,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good Website">
                      Good Website
                    </SelectItem>
                    <SelectItem value="Bad Website">
                      Bad Website
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="webAddress">WEB ADDRESS:</Label>
              <Input
                id="webAddress"
                type="url"
                value={websiteForm.webAddress || ""}
                onChange={(e) =>
                  setWebsiteForm({
                    ...websiteForm,
                    webAddress: e.target.value,
                  })
                }
                placeholder="http://www"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="websiteDescription">
                DESCRIPTION:
              </Label>
              <Input
                id="websiteDescription"
                type="text"
                value={websiteForm.description || ""}
                onChange={(e) =>
                  setWebsiteForm({
                    ...websiteForm,
                    description: e.target.value,
                  })
                }
                placeholder=""
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimaryWebsite"
                checked={websiteForm.isPrimary}
                onCheckedChange={(checked) =>
                  setWebsiteForm({
                    ...websiteForm,
                    isPrimary: checked as boolean,
                  })
                }
              />
              <Label
                htmlFor="isPrimaryWebsite"
                className="cursor-pointer"
              >
                PRIMARY WEBSITE:
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWebsiteDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveWebsite}
              className="rounded-full"
              style={{ backgroundColor: "#145F33" }}
            >
              {editingWebsite ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Add Role"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update the role information."
                : "Add a new role to the constituent's profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="roleName"
                className="text-[11px] font-medium"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                ROLE <span className="text-red-600">*</span>
              </Label>
              <Select
                value={roleForm.role || ""}
                onValueChange={(value) =>
                  setRoleForm({ ...roleForm, role: value })
                }
              >
                <SelectTrigger
                  id="roleName"
                  className="h-8 text-[13px]"
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff Role Code">
                    Staff Role Code
                  </SelectItem>
                  <SelectItem value="Advisor">
                    Advisor
                  </SelectItem>
                  <SelectItem value="Case Manager">
                    Case Manager
                  </SelectItem>
                  <SelectItem value="Clinician">
                    Clinician
                  </SelectItem>
                  <SelectItem value="Community Care Employment">
                    Community Care Employment
                  </SelectItem>
                  <SelectItem value="Community Care Employment Connections & Supports Member">
                    Community Care Employment Connections &
                    Supports Member
                  </SelectItem>
                  <SelectItem value="Community Care Scholar">
                    Community Care Scholar
                  </SelectItem>
                  <SelectItem value="Community Care Staff">
                    Community Care Staff
                  </SelectItem>
                  <SelectItem value="Community Care Therapy">
                    Community Care Therapy
                  </SelectItem>
                  <SelectItem value="Community Care-Care Management">
                    Community Care-Care Management
                  </SelectItem>
                  <SelectItem value="Contractor">
                    Contractor
                  </SelectItem>
                  <SelectItem value="Coordinator">
                    Coordinator
                  </SelectItem>
                  <SelectItem value="Director">
                    Director
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="startDate"
                  className="text-[11px] font-medium"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  START DATE
                </Label>
                <Input
                  id="startDate"
                  value={roleForm.startDate || ""}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      startDate: e.target.value,
                    })
                  }
                  placeholder="MM/DD/YYYY"
                  className="h-8 text-[13px]"
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="endDate"
                  className="text-[11px] font-medium"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  END DATE
                </Label>
                <Input
                  id="endDate"
                  value={roleForm.endDate || ""}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      endDate: e.target.value,
                    })
                  }
                  placeholder="MM/DD/YYYY or -"
                  className="h-8 text-[13px]"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="details"
                className="text-[11px] font-medium"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                DETAILS
              </Label>
              <Input
                id="details"
                value={roleForm.details || ""}
                onChange={(e) =>
                  setRoleForm({
                    ...roleForm,
                    details: e.target.value,
                  })
                }
                placeholder="Enter role details"
                className="h-8 text-[13px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              className="rounded-full"
              style={{ backgroundColor: "#145F33" }}
            >
              {editingRole ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attribute Dialog */}
      <Dialog
        open={attributeDialogOpen}
        onOpenChange={setAttributeDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAttribute
                ? "Edit Attribute"
                : "Add Attribute"}
            </DialogTitle>
            <DialogDescription>
              {editingAttribute
                ? "Update the attribute information."
                : "Add a new attribute to the constituent's profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="attributeType">Type *</Label>
              <Input
                id="attributeType"
                value={attributeForm.type || ""}
                onChange={(e) =>
                  setAttributeForm({
                    ...attributeForm,
                    type: e.target.value,
                  })
                }
                placeholder="e.g., Language, Dietary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preference">PREFERENCE</Label>
              <Input
                id="preference"
                value={attributeForm.preference || ""}
                onChange={(e) =>
                  setAttributeForm({
                    ...attributeForm,
                    preference: e.target.value,
                  })
                }
                placeholder="Enter preference value"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAttributeDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAttribute}
              className="rounded-full"
              style={{ backgroundColor: "#145F33" }}
            >
              {editingAttribute ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {constituentId && (
        <div className="mt-6">
          <CommunityCareSection
            key={constituentId}
            constituentId={constituentId}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-4">
        <Button
          variant="outline"
          className="rounded-full px-6 h-9 text-[13px] font-medium"
          style={{ backgroundColor: "#ffffff" }}
          onClick={() => {
            if (constituentId)
              discardCommunityCareNotes(constituentId);
            setBirthName(savedBirthName);
            toast.info("Changes cancelled");
          }}
        >
          Cancel
        </Button>
        <Button
          className="rounded-full px-6 h-9 text-[13px] font-medium"
          style={{ backgroundColor: "#145F33" }}
          onClick={() => {
            if (birthNameOwner && birthName !== savedBirthName) {
              if (!saveBirthName(birthNameOwner, birthName)) {
                toast.error(
                  "Birth Name / Maiden Name could not be saved.",
                  {
                    description:
                      "Browser storage is unavailable. Your changes are still on the form — try again.",
                  },
                );
                return;
              }
              const next = birthName.trim();
              setSavedBirthName(next);
              setBirthName(next);
            }
            if (constituentId)
              saveCommunityCareNotes(constituentId);
            toast.success(
              "Constituent details saved successfully",
            );
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}