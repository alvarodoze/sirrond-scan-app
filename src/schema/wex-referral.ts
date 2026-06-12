export type FieldType = "string" | "text" | "date" | "boolean";

export type FieldDef = {
  label: string;
  type: FieldType;
  required?: boolean;
  default?: string;
};

export const WEX_REFERRAL_SCHEMA = {
  school: { label: "School", type: "string", required: true },
  referral_number: { label: "Referral no.", type: "string" },
  placement_period: {
    label: "Placement dates",
    type: "string",
    default: "Year 10: 22nd - 26th June 2026",
  },
  student_name: { label: "Student name", type: "string", required: true },
  date_of_birth: { label: "DOB", type: "date", required: true },
  tutor_group: { label: "Tutor group", type: "string" },
  employer_name_and_address: {
    label: "Employer name and address",
    type: "string",
    required: true,
  },
  contact_name: { label: "Name of contact", type: "string" },
  contact_position: { label: "Position", type: "string" },
  contact_tel: { label: "Tel", type: "string" },
  contact_mobile: { label: "Mobile", type: "string" },
  contact_email: { label: "Email", type: "string" },
  contact_web: { label: "Web", type: "string" },
  main_business: { label: "Main business", type: "string" },
  wex_job_activities: { label: "WEX job title/activities", type: "text" },
  address_confirmed: { label: "Address confirmation", type: "boolean" },
  days_and_hours: { label: "Days and hours", type: "string" },
  dress_code: { label: "Dress code", type: "string" },
  insurance_company: { label: "Insurance company", type: "string" },
  policy_number: { label: "Policy no.", type: "string" },
  policy_expiry_date: { label: "Expiry date", type: "date" },
  public_liability_cover: { label: "Public liability cover", type: "boolean" },
  five_or_more_employees: { label: "5 or more employees", type: "boolean" },
  written_risk_assessments: { label: "Written risk assessments", type: "boolean" },
  employer_signed: { label: "Employer signed", type: "boolean" },
  signatory_position: { label: "Signatory position", type: "string" },
  signatory_print_name: { label: "Signatory print name", type: "string" },
  signatory_date: { label: "Signatory date", type: "date" },
  parent_guardian_name: { label: "Parent/guardian name", type: "string" },
  parent_guardian_signed: { label: "Parent/guardian signed", type: "boolean" },
  parent_guardian_email: { label: "Parent/guardian email", type: "string" },
} as const satisfies Record<string, FieldDef>;

export type WexReferralField = keyof typeof WEX_REFERRAL_SCHEMA;
export type WexReferralData = {
  [K in WexReferralField]: string | boolean | null;
};

export const WEX_REFERRAL_FIELD_KEYS = Object.keys(
  WEX_REFERRAL_SCHEMA
) as WexReferralField[];

export const REQUIRED_FIELDS = WEX_REFERRAL_FIELD_KEYS.filter((k) => {
  const def = WEX_REFERRAL_SCHEMA[k];
  return "required" in def && def.required === true;
});

export const RETENTION_MONTHS = 12;

export const MISTRAL_OCR_PROMPT =
  "Work Experience Referral Request form. Read school name from logo/header top-right (e.g. Clarion). Printed labels with handwritten answers in block capitals. Checkboxes: tick in Yes = true, No or empty = false. Dates as DD/MM/YYYY. null if blank.";

/** JSON Schema for Mistral OCR document_annotation_format */
export function buildMistralJsonSchema() {
  const properties: Record<string, unknown> = {};
  for (const key of WEX_REFERRAL_FIELD_KEYS) {
    const def = WEX_REFERRAL_SCHEMA[key];
    if (def.type === "boolean") {
      properties[key] = { type: ["boolean", "null"] };
    } else {
      properties[key] = { type: ["string", "null"] };
    }
  }
  return {
    type: "object",
    properties,
    additionalProperties: false,
  };
}

export function emptyWexReferralData(): WexReferralData {
  const data = {} as WexReferralData;
  for (const key of WEX_REFERRAL_FIELD_KEYS) {
    const def = WEX_REFERRAL_SCHEMA[key];
    if (def.type === "boolean") {
      data[key] = null;
    } else {
      data[key] = ("default" in def && def.default) ? def.default : null;
    }
  }
  return data;
}

export function isFieldEmpty(value: string | boolean | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "boolean") return false;
  return value.trim() === "";
}
