export const testOrganization = {
  id: 'test-org-1',
  name: 'Solar Solutions Kenya',
  mission: 'To provide affordable solar lamps to rural communities in Kenya, improving access to clean energy and reducing reliance on harmful kerosene lamps.',
  focusAreas: ['Energy', 'Poverty Alleviation', 'Rural Development'],
  size: 'Startup',
  location: 'Nairobi, Kenya',
  team: [
    {
      name: 'John Doe',
      title: 'Founder & CEO',
      responsibilities: 'Overall strategy, fundraising, and partnerships',
      location: 'Nairobi, Kenya',
      otherCommitments: 'None - Full time',
      developingCountryExperience: '5 years in Kenya, 2 years in Tanzania'
    },
    {
      name: 'Jane Smith',
      title: 'Operations Director',
      responsibilities: 'Supply chain, logistics, and field operations',
      location: 'Nairobi, Kenya',
      otherCommitments: 'Part-time consulting (10 hours/week)',
      developingCountryExperience: '3 years in Kenya'
    }
  ],
  pilotRegion: 'Western Kenya',
  targetBeneficiaries: 'Rural households without reliable electricity access',
  currentBarriers: [
    'High upfront cost of solar lamps',
    'Limited access to financing options',
    'Lack of awareness about solar technology benefits'
  ],
  distributionModel: 'Microfinance partnerships with local savings groups',
  pilotBudget: {
    total: 15000,
    majorExpenses: [
      'Initial inventory of solar lamps',
      'Field staff salaries',
      'Training and community engagement',
      'Transportation and logistics',
      'Marketing and awareness campaigns'
    ]
  },
  expectedImpact: {
    countrywide: 'Reduce kerosene usage by 40% in target communities',
    individual: 'Save households $5-10 per month on energy costs',
    environmental: 'Reduce CO2 emissions by 2 tons per household annually'
  },
  outcomes: {
    '3_months': {
      interventions: 100,
      peopleHelped: 100
    },
    '1_year': {
      interventions: 500,
      peopleHelped: 500
    },
    '2_years': {
      interventions: 2000,
      peopleHelped: 2000
    }
  }
};

export const testGrantApplication = {
  grantId: 'd-prize',
  challenge: 'Solar Lamp Challenge',
  intervention: 'Pico solar lamps',
  targetRegion: 'Western Kenya',
  evidence: {
    url: 'https://www.lightingglobal.org/impact/',
    description: 'Lighting Global impact studies show that solar lamps improve household income and children\'s study time'
  }
}; 