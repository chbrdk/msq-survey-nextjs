// Manifest configuration - ported from survey-manifest.json
export const manifest = {
  version: "1.0.0",
  metadata: {
    name: "MSQ Workflow Documentation Survey",
    description: "Structured interview system for documenting marketing agency workflows",
    language: "en",
    ai_model: "gpt-4",
    created_at: "2025-10-10",
    updated_at: "2025-10-10"
  },
  validation_rules: {
    agencies: {
      type: "enum" as const,
      strict: true,
      values: ["MSQ", "UDG", "MMT", "26DX", "SPACESHP", "THE GATE"],
      error_message: "I don't have that agency in my system. Could you confirm which of these agencies you work for: MSQ, UDG, MMT, 26DX, SPACESHP, or THE GATE?"
    },
    departments: {
      type: "enum" as const,
      strict: false,
      values: [
        "Creative & Design",
        "Content & Strategy",
        "Account Management",
        "Paid Media & Performance",
        "SEO & Organic Growth",
        "Analytics & Insights",
        "Project/Delivery Management",
        "Business Development",
        "Operations & Admin",
        "Finance",
        "HR & People",
        "Technology & Development",
        "UX/UI Design",
        "Engineering/Development"
      ]
    },
    job_levels: {
      type: "enum" as const,
      strict: true,
      values: [
        "Junior (0-2 years experience)",
        "Mid-level (2-5 years experience)",
        "Senior (5+ years experience)",
        "Lead/Supervisor",
        "Manager/Director",
        "VP/Senior Leadership",
        "C-Suite/Partner"
      ]
    },
    time_in_role: {
      type: "enum" as const,
      strict: true,
      values: [
        "Less than 6 months",
        "6 months - 1 year",
        "1-2 years",
        "2+ years"
      ]
    },
    work_focus: {
      type: "enum" as const,
      strict: true,
      values: [
        "Individual contributor (hands-on execution)",
        "Team management + some execution",
        "Primarily management/oversight",
        "Client-facing/relationship management",
        "Cross-functional/strategic"
      ]
    },
    billability_categories: {
      type: "items" as const,
      values: [
        {
          label: "Billable to clients",
          key: "billable",
          description: "Direct client project work"
        },
        {
          label: "Non-billable but client-related",
          key: "non_billable_client",
          description: "Client communication, planning, etc."
        },
        {
          label: "Internal operations/admin",
          key: "internal_ops",
          description: "Meetings, admin tasks, etc."
        },
        {
          label: "Business development",
          key: "business_dev",
          description: "Pitches, proposals, networking"
        }
      ]
    },
    workflow_phases: {
      type: "items" as const,
      values: [
        {
          label: "PROJECT INITIATION & SETUP",
          value: "initiation",
          description: "Scoping, pricing, contracts, project setup"
        },
        {
          label: "DISCOVERY & PLANNING",
          value: "discovery",
          description: "Requirements, strategy, design discovery"
        },
        {
          label: "DELIVERY & EXECUTION",
          value: "delivery",
          description: "Development, design, testing, infrastructure"
        },
        {
          label: "CLIENT DELIVERY & GOVERNANCE",
          value: "governance",
          description: "Sprint demos, status updates, client comms"
        },
        {
          label: "PROJECT CLOSURE",
          value: "closure",
          description: "Final delivery, handover, retrospectives"
        }
      ]
    },
    ai_usage_options: {
      type: "items" as const,
      values: [
        { label: "Yes, actively using AI tools", value: "active" },
        { label: "Sometimes/experimenting", value: "experimental" },
        { label: "No, not using AI", value: "no" }
      ]
    },
    collaboration_friction_options: {
      type: "items" as const,
      values: [
        { label: "Different tools across teams", value: "tool_differences" },
        { label: "Communication gaps", value: "communication" },
        { label: "Process misalignment", value: "process" },
        { label: "No major friction", value: "none" }
      ]
    },
    automation_wishes: {
      type: "items" as const,
      values: [
        { label: "Reporting & documentation", value: "reporting" },
        { label: "Data entry & migration", value: "data_entry" },
        { label: "Status updates & communication", value: "status_updates" },
        { label: "Design handoffs", value: "design_handoff" },
        { label: "Testing & QA", value: "testing" },
        { label: "Client feedback collection", value: "feedback" },
        { label: "Resource planning", value: "resource_planning" },
        { label: "Other", value: "other" }
      ]
    }
  },
  activity_definitions: {
    initiation: [
      { activity: "Initial client brief review", typical_roles: ["Account Manager", "Project Manager"] },
      { activity: "Scope definition & requirements gathering", typical_roles: ["Project Manager", "Technical Lead"] },
      { activity: "Pricing & estimation", typical_roles: ["Project Manager", "Finance"] },
      { activity: "Contract negotiation & setup", typical_roles: ["Account Manager", "Legal"] },
      { activity: "Project kickoff & team allocation", typical_roles: ["Project Manager", "Resource Manager"] },
      { activity: "Financial setup & budget planning", typical_roles: ["Finance", "Project Manager"] }
    ],
    discovery: [
      { activity: "Requirements workshops & stakeholder interviews", typical_roles: ["UX Designer", "Business Analyst"] },
      { activity: "User research & testing", typical_roles: ["UX Researcher", "UX Designer"] },
      { activity: "Design discovery & conceptual design", typical_roles: ["UX Designer", "UI Designer"] },
      { activity: "Technical discovery & architecture planning", typical_roles: ["Technical Lead", "Architect"] },
      { activity: "Strategy definition & roadmap planning", typical_roles: ["Strategist", "Product Owner"] },
      { activity: "Content strategy & IA planning", typical_roles: ["Content Strategist", "Information Architect"] }
    ],
    delivery: [
      { activity: "Visual design & design system creation", typical_roles: ["UI Designer", "Design Lead"] },
      { activity: "Frontend development", typical_roles: ["Frontend Developer", "Full Stack Developer"] },
      { activity: "Backend development & API integration", typical_roles: ["Backend Developer", "Full Stack Developer"] },
      { activity: "Content creation & migration", typical_roles: ["Content Manager", "Copywriter"] },
      { activity: "Testing & QA", typical_roles: ["QA Tester", "Developer"] },
      { activity: "Infrastructure setup & DevOps", typical_roles: ["DevOps Engineer", "Technical Lead"] },
      { activity: "Backlog management & sprint planning", typical_roles: ["Project Manager", "Scrum Master"] }
    ],
    governance: [
      { activity: "Sprint demos & client presentations", typical_roles: ["Project Manager", "Technical Lead"] },
      { activity: "Status reporting & documentation", typical_roles: ["Project Manager", "Account Manager"] },
      { activity: "Client communication & relationship management", typical_roles: ["Account Manager", "Project Manager"] },
      { activity: "Financial reporting & budget tracking", typical_roles: ["Finance", "Project Manager"] },
      { activity: "Risk & issue management", typical_roles: ["Project Manager", "Technical Lead"] },
      { activity: "Change request management", typical_roles: ["Project Manager", "Account Manager"] }
    ],
    closure: [
      { activity: "Final delivery & sign-off", typical_roles: ["Project Manager", "Account Manager"] },
      { activity: "Documentation & handover", typical_roles: ["Developer", "Project Manager"] },
      { activity: "Retrospectives & lessons learned", typical_roles: ["Project Manager", "Team"] },
      { activity: "Case study creation", typical_roles: ["Marketing", "Account Manager"] },
      { activity: "Account planning & upsell opportunities", typical_roles: ["Account Manager", "Business Development"] }
    ]
  }
} as const;

export type Manifest = typeof manifest;

