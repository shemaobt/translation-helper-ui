export type AgentId =
  | 'storyteller'
  | 'conversation'
  | 'oral'
  | 'health'
  | 'backtrans';

export interface Agent {
  id: AgentId;
  name: string;
  icon: string;
  short: string;
  description: string;
  starters: string[];
}

export const AGENTS: Agent[] = [
  {
    id: 'storyteller',
    name: 'Storyteller',
    icon: 'book-open',
    short: 'A story to illuminate the concept',
    description:
      'What Bible concept do you want to translate? I can tell you a story to help you understand it better.',
    starters: [
      'Tell me the story of the Good Samaritan',
      'Story of Joseph for an oral audience',
      'How would you tell the Prodigal Son?',
    ],
  },
  {
    id: 'conversation',
    name: 'Conversation Partner',
    icon: 'messages-square',
    short: 'Talk through it in plain dialogue',
    description:
      'Want to explore a Bible concept? I can explain it or talk it through with you.',
    starters: [
      'What does "grace" mean in Ephesians 2?',
      'Help me understand the parable of the sower',
      "Walk me through Paul's argument in Romans 8",
    ],
  },
  {
    id: 'oral',
    name: 'Oral Performer',
    icon: 'mic-vocal',
    short: 'Say it in clear, natural oral language',
    description:
      'Struggling to understand a Bible passage? I can say it in clear, natural oral language.',
    starters: [
      'Say Matthew 5:1–12 in clear spoken language',
      'Read John 3:16 the way an elder would say it',
      'Speak Psalm 23 as comfort',
    ],
  },
  {
    id: 'health',
    name: 'OBT Project Health Assessor',
    icon: 'activity',
    short: 'Guided quarterly project review',
    description:
      "How's your project going? I can help you evaluate it through a guided conversation. Recommended quarterly.",
    starters: [
      'Start a quarterly health check',
      'Where are we losing momentum?',
      'Review our last consultant check',
    ],
  },
  {
    id: 'backtrans',
    name: 'Back Translation Checker',
    icon: 'git-compare',
    short: 'Compare back-translation against source',
    description:
      'Need to check your translation? I can compare your back translation with the source text and point out possible issues.',
    starters: [
      'Check this back-translation of John 3:16',
      'Compare Tikuna draft of Genesis 1',
      'Find places I drifted from the source',
    ],
  },
];

export const AGENT_BY_ID: Record<AgentId, Agent> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<AgentId, Agent>;

export const ROLE_OPTIONS = [
  'Mother tongue translator',
  'Facilitator',
  'Translation advisor',
  'Consultant / mentor',
  'Administrator',
  'Other',
];
