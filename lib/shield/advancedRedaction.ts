export interface RedactionResult {
  safeText: string;
  redactionCount: number;
  categoriesTriggered: string[];
}

interface RedactionPattern {
  name: string;
  regex: RegExp;
  placeholder: string;
  category: string;
}

const REDACTION_PATTERNS: RedactionPattern[] = [
  // PII / PHI
  {
    name: "Email",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    placeholder: "[EMAIL_REDACTED]",
    category: "PII"
  },
  {
    name: "Phone",
    regex: /\b(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b/g,
    placeholder: "[PHONE_HIDDEN]",
    category: "PII"
  },
  {
    name: "SSN",
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    placeholder: "[SSN_REDACTED]",
    category: "PII"
  },
  {
    name: "Passport",
    regex: /\b[A-Z]{1,2}\d{6,9}\b/g,
    placeholder: "[PASSPORT_REDACTED]",
    category: "PII"
  },
  {
    name: "Date of Birth",
    regex: /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12][0-9]|3[01])[-/](?:19|20)\d{2}\b/g,
    placeholder: "[DOB_HIDDEN]",
    category: "PHI"
  },
  {
    name: "Medical Record",
    regex: /\b(?:MRN|mrn|medical record)[\s:#]*([A-Z0-9]{6,12})\b/gi,
    placeholder: "[MRN_REDACTED]",
    category: "PHI"
  },
  
  // Financial (PCI)
  {
    name: "Credit Card",
    regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    placeholder: "[CARD_REDACTED]",
    category: "PCI"
  },
  {
    name: "CVV",
    regex: /\b(?:CVV|cvv|CVC|cvc)[\s:#]*(\d{3,4})\b/g,
    placeholder: "[CVV_HIDDEN]",
    category: "PCI"
  },
  {
    name: "IBAN",
    regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g,
    placeholder: "[IBAN_REDACTED]",
    category: "PCI"
  },
  {
    name: "SWIFT",
    regex: /\b[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?\b/g,
    placeholder: "[SWIFT_REDACTED]",
    category: "PCI"
  },
  {
    name: "Bank Account",
    regex: /\b(?:account|acct)[\s:#]*(\d{8,17})\b/gi,
    placeholder: "[ACCOUNT_REDACTED]",
    category: "PCI"
  },
  {
    name: "Salary",
    regex: /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:\s?(?:per year|annually|salary|compensation))?/gi,
    placeholder: "[SALARY_REDACTED]",
    category: "PCI"
  },
  
  // Technical Secrets
  {
    name: "API Key (sk-)",
    regex: /\bsk-[A-Za-z0-9]{32,}\b/g,
    placeholder: "[API_KEY_REDACTED]",
    category: "SECRET"
  },
  {
    name: "AWS Key",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    placeholder: "[AWS_KEY_REDACTED]",
    category: "SECRET"
  },
  {
    name: "JWT Token",
    regex: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\b/g,
    placeholder: "[JWT_REDACTED]",
    category: "SECRET"
  },
  {
    name: "Bearer Token",
    regex: /\bBearer\s+[A-Za-z0-9_-]{20,}\b/gi,
    placeholder: "[BEARER_TOKEN_REDACTED]",
    category: "SECRET"
  },
  {
    name: "SSH Private Key",
    regex: /-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----[\s\S]+?-----END (?:RSA |OPENSSH )?PRIVATE KEY-----/g,
    placeholder: "[SSH_KEY_REDACTED]",
    category: "SECRET"
  },
  {
    name: "Internal IP",
    regex: /\b(?:10\.|192\.168\.|172\.(?:1[6-9]|2[0-9]|3[01])\.)\d{1,3}\.\d{1,3}\b/g,
    placeholder: "[INTERNAL_IP]",
    category: "SECRET"
  },
  {
    name: "Database Connection",
    regex: /\b(?:mongodb|postgresql|mysql|postgres):\/\/[^\s]+/gi,
    placeholder: "[DB_CONNECTION_REDACTED]",
    category: "SECRET"
  },
  
  // Corporate Secrets
  {
    name: "Project Codename",
    regex: /\b(?:Project|Codename|Code name)\s+[A-Z][A-Za-z0-9]+\b/gi,
    placeholder: "[PROJECT_REDACTED]",
    category: "CORPORATE"
  },
  {
    name: "Confidential",
    regex: /\b(?:Confidential|Proprietary|Internal Only|CONFIDENTIAL)\b/gi,
    placeholder: "[CONFIDENTIAL]",
    category: "CORPORATE"
  }
];

export function redactText(
  text: string,
  customBlacklist: string[] = []
): RedactionResult {
  let safeText = text;
  let redactionCount = 0;
  const categoriesTriggered = new Set<string>();
  
  // Apply built-in patterns
  for (const pattern of REDACTION_PATTERNS) {
    const matches = text.match(pattern.regex);
    if (matches && matches.length > 0) {
      safeText = safeText.replace(pattern.regex, pattern.placeholder);
      redactionCount += matches.length;
      categoriesTriggered.add(pattern.category);
    }
  }
  
  // Apply custom blacklist
  if (customBlacklist.length > 0) {
    for (const keyword of customBlacklist) {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        safeText = safeText.replace(regex, "[CORPORATE_SECRET]");
        redactionCount += matches.length;
        categoriesTriggered.add("CORPORATE");
      }
    }
  }
  
  return {
    safeText,
    redactionCount,
    categoriesTriggered: Array.from(categoriesTriggered)
  };
}

export function calculateSecurityScore(redactionCount: number, totalRequests: number): number {
  if (totalRequests === 0) return 100;
  const ratio = redactionCount / totalRequests;
  return Math.min(100, Math.round(ratio * 100));
}