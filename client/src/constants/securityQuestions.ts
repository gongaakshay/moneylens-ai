export const SECURITY_QUESTIONS = [
  "What city were you born in?",
  "What was your first pet's name?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite movie?",
  "What street did you grow up on?",
  "What was your childhood nickname?",
  "What is your favorite book?",
] as const;

export type SecurityQuestion = (typeof SECURITY_QUESTIONS)[number];

