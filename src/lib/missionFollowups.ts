/**
 * Mission Follow-up Questions — Dynamic per mission type
 * Asked after the user picks a Mission Mode in onboarding
 */

export interface FollowUpQuestion {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "select";
  options?: string[];
}

export const MISSION_FOLLOWUPS: Record<string, FollowUpQuestion[]> = {
  job: [
    { id: "company", label: "Where do you work?", placeholder: "e.g. Google, TCS, a startup...", type: "text" },
    { id: "role", label: "What's your role?", placeholder: "e.g. Product Manager, Developer...", type: "text" },
    { id: "experience", label: "Years of experience?", placeholder: "", type: "select", options: ["< 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"] },
    { id: "goal", label: "What do you want to automate?", placeholder: "e.g. reports, customer support...", type: "text" },
  ],
  future: [
    { id: "concern", label: "What worries you most about AI?", placeholder: "e.g. job replacement, keeping up...", type: "text" },
    { id: "timeline", label: "How soon do you want to be ready?", placeholder: "", type: "select", options: ["This month", "3 months", "6 months", "1 year"] },
  ],
  skill: [
    { id: "current_skill", label: "Current tech skill level?", placeholder: "", type: "select", options: ["No coding", "Basic coding", "Intermediate", "Advanced", "Expert"] },
    { id: "focus", label: "What do you want to master?", placeholder: "e.g. LangChain, RAG, multi-agent...", type: "text" },
    { id: "hours", label: "Hours per week to learn?", placeholder: "", type: "select", options: ["1-2 hours", "3-5 hours", "5-10 hours", "10+ hours"] },
  ],
  earn: [
    { id: "income_goal", label: "Monthly income goal from AI?", placeholder: "e.g. ₹50K, $5K...", type: "text" },
    { id: "model", label: "Preferred business model?", placeholder: "", type: "select", options: ["Freelancing", "Agency", "SaaS product", "Consulting", "Not sure yet"] },
    { id: "investment", label: "Budget to invest?", placeholder: "", type: "select", options: ["₹0 (free tools only)", "< ₹5K/month", "₹5K-20K/month", "₹20K+/month"] },
  ],
  build: [
    { id: "project_idea", label: "What do you want to build?", placeholder: "e.g. a chatbot, automation tool...", type: "text" },
    { id: "tech_stack", label: "Preferred tech stack?", placeholder: "e.g. Python, JavaScript, no-code...", type: "text" },
    { id: "deadline", label: "When do you want to ship?", placeholder: "", type: "select", options: ["This week", "This month", "3 months", "No rush"] },
  ],
  easier: [
    { id: "pain_point", label: "What takes too much time daily?", placeholder: "e.g. emails, research, scheduling...", type: "text" },
    { id: "tools", label: "Tools you use daily?", placeholder: "e.g. Gmail, Notion, Slack, Excel...", type: "text" },
  ],
  explore: [
    { id: "curiosity", label: "What got you curious about AI?", placeholder: "e.g. saw a demo, friend told me...", type: "text" },
  ],
  impress: [
    { id: "audience", label: "Who do you want to impress?", placeholder: "e.g. boss, clients, colleagues...", type: "text" },
    { id: "context", label: "In what setting?", placeholder: "", type: "select", options: ["Meetings", "Presentations", "Social media", "Networking", "Interviews"] },
  ],
  interview: [
    { id: "target_company", label: "Target companies?", placeholder: "e.g. Google, Meta, any startup...", type: "text" },
    { id: "target_role", label: "Target role?", placeholder: "e.g. AI Engineer, ML Ops, PM...", type: "text" },
    { id: "timeline", label: "Interview timeline?", placeholder: "", type: "select", options: ["< 1 month", "1-3 months", "3-6 months", "Just preparing"] },
  ],
  switch: [
    { id: "current_field", label: "Current field?", placeholder: "e.g. finance, marketing, teaching...", type: "text" },
    { id: "target_field", label: "Want to switch to?", placeholder: "e.g. AI engineering, product, data...", type: "text" },
    { id: "blockers", label: "Biggest blocker?", placeholder: "e.g. no coding skills, no portfolio...", type: "text" },
  ],
  curiosity: [
    { id: "topic", label: "What fascinates you most?", placeholder: "e.g. how LLMs think, AI art...", type: "text" },
  ],
  academic: [
    { id: "subject", label: "Your research area?", placeholder: "e.g. NLP, computer vision, HCI...", type: "text" },
    { id: "purpose", label: "For what?", placeholder: "", type: "select", options: ["Thesis/dissertation", "Research paper", "Course project", "Personal research"] },
  ],
  startup: [
    { id: "idea", label: "Startup idea (if any)?", placeholder: "e.g. AI customer support for SMBs...", type: "text" },
    { id: "stage", label: "Current stage?", placeholder: "", type: "select", options: ["Just an idea", "Building MVP", "Have users", "Raising funds"] },
    { id: "cofounder", label: "Do you have a team?", placeholder: "", type: "select", options: ["Solo founder", "Have a co-founder", "Small team", "Looking for team"] },
  ],
  hackathon: [
    { id: "event", label: "Which hackathon?", placeholder: "e.g. ETHGlobal, company internal...", type: "text" },
    { id: "timeline", label: "When is it?", placeholder: "", type: "select", options: ["This week!", "2-4 weeks", "1-2 months", "Just want to be ready"] },
  ],
  teach: [
    { id: "audience", label: "Who will you teach?", placeholder: "e.g. college students, colleagues...", type: "text" },
    { id: "format", label: "Teaching format?", placeholder: "", type: "select", options: ["1-on-1", "Classroom", "Workshop", "Online course", "Content/blog"] },
  ],
  audit: [
    { id: "domain", label: "Which domain?", placeholder: "e.g. healthcare, finance, legal...", type: "text" },
    { id: "concern", label: "Main concern?", placeholder: "", type: "select", options: ["Safety/alignment", "Compliance/regulation", "Bias/fairness", "Cost/efficiency", "All of the above"] },
  ],
};

/** Personal details field configs */
export const AGE_RANGES = ["Under 13", "13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
export const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
export const EDUCATION_LEVELS = [
  "Still in school", "High school", "Diploma / Certificate", 
  "Bachelor's degree", "Master's degree", "PhD / Doctorate", "Self-taught / No formal"
];
export const EXPERIENCE_LEVELS = ["Student / No work exp", "< 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
