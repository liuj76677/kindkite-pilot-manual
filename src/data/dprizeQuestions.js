export const dprizeFirstRoundQuestions = [
  {
    id: 'concept_note',
    section: 'Part 1: Concept Note',
    question: 'How does your new organization or venture idea improve the distribution of your selected intervention?',
    guidelines: `We recommend writing:
    2-3 sentences summarizing the main activities of your new organization. For example, you could walk us through step-by-step how you connect a proven intervention to people in need.
    Bullet points to further explain:
    ● What are the main barriers that currently prevent people from accessing your proven intervention, specific to your pilot region?
    ● How does your distribution model specifically overcome these barriers?
    ● What is the most fundamental part of your new organization that you need to prove will work during this pilot program?`,
    maxLength: 1000,
    context: 'Note: Our team is already familiar with D-Prize challenge topics at a macro level, so there is no need to provide a broad explanation of why this is an important problem to solve. For instance, including large statistics, such as the potential global market size, are not necessary.'
  },
  {
    id: 'expected_impact',
    section: 'Part 1: Concept Note',
    question: 'What is the expected impact of your work?',
    guidelines: `We recommend writing:
    1-2 sentences summarizing your marginal impact (ie, the impact you will make compared to the status quo) at a high level, and at an individual or household level.
    For example, your work might reduce the rates of HIV infections by X% countrywide; and for an individual, could save 7 DALYs (disability adjusted life years, which is a way to measure the cost-effectiveness of a poverty intervention).`,
    maxLength: 500
  },
  {
    id: 'outcome_table',
    section: 'Part 1: Concept Note',
    question: 'What are your expected outcomes over time?',
    guidelines: `Create an outcome table showing:
    - Over the next 3 months, 1 year, and 2 years:
      ● How many proven interventions do you plan to distribute?
      ● How many people will you directly help?
    2-3 sentences summarizing a rough draft of how much money you need for your pilot program, and what the 3-5 major expenses are expected to be.
    1 sentence summarizing your long-term vision for the new organization you will launch.`,
    maxLength: 800,
    requiresTable: true
  },
  {
    id: 'team_info',
    section: 'Part 1: Concept Note',
    question: 'Who is your team?',
    guidelines: `Create a team table that lists:
    ● All of the people on your team; their job titles; their responsibilities
    ● Each person's location during the pilot
    ● Any other professional commitments they have during the pilot
    ● If not local to your operating region, please note any developing country experience and specifically, any time you've spent in the pilot region.`,
    maxLength: 1000,
    requiresTable: true
  },
  {
    id: 'custom_challenge',
    section: 'Part 3: Additional Information',
    question: 'Are you submitting to a Custom Challenge category?',
    guidelines: `If yes:
    ● Provide a URL that links to one website with credible evidence that supports your intervention.
    ● Include 1 additional page to your concept note elaborating on your intervention, and citing evidence that it is proven and in need of greater distribution.
    ● If you do not cite a credible source validating the impact of the poverty solution you plan to distribute, your proposal will be declined.`,
    maxLength: 500,
    isOptional: true
  },
  {
    id: 'existing_organization',
    section: 'Part 3: Additional Information',
    question: 'Has your organization already launched?',
    guidelines: `If yes:
    ● Include a summary of your activities since launching
    ● Include your current budget/income statement in the submission webform`,
    maxLength: 500,
    isOptional: true
  }
];

export const dprizeSubmissionRequirements = {
  conceptNote: {
    maxPages: 2,
    format: 'PDF',
    maxSize: '4MB',
    note: 'We do not read anything submitted that is longer than two pages.'
  },
  resumes: {
    maxPagesPerPerson: 1,
    format: 'PDF',
    maxSize: '4MB',
    note: 'Resumes should highlight the most relevant past leadership roles and accomplishments.'
  },
  language: {
    requirement: 'English',
    note: 'Your English does not need to be perfect to apply, and grammar and vocabulary errors will not be penalized. We only want to understand your idea.'
  },
  submissionUrl: 'www.d-prize.org/submit'
}; 