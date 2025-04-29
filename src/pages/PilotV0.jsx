import React from 'react';
import { useParams } from 'react-router-dom';
import GrantCard from '../components/GrantCard';

const PilotV0 = () => {
  const { organizationId } = useParams();

  // This would typically come from an API, but for v0 we'll hardcode it
  const organizationGrants = {
    'tembo-education': {
      name: 'Tembo Education',
      description: 'A for-profit social enterprise focused on early childhood education via mobile technology.',
      grants: [
        {
          id: 'd-prize',
          name: 'D-Prize – Distribution of Proven Interventions',
          funder: 'D-Prize Foundation',
          match: 'D-Prize funds new ventures that scale proven poverty solutions. Tembo\'s SMS/WhatsApp early childhood curriculum can be framed as scaling a proven education intervention to low-income families.',
          eligibility: 'Open worldwide to for-profit or nonprofit entrepreneurs',
          funding: 'Up to $20,000',
          deadline: 'May 18, 2025 (early deadline); June 29, 2025 (final)',
          effort: 'Light',
          steps: [
            'Fill out the online concept note form',
            'If selected, submit a full proposal (~10 pages)',
            'Finalists pitch to judges'
          ],
          link: 'https://drive.google.com/file/d/1-InjmHFt2WNmkg5TbvxR53KRW56EoAIC/view'
        },
        {
          id: 'roddenberry',
          name: 'Roddenberry Foundation Catalyst Fund',
          funder: 'Roddenberry Foundation',
          match: 'The Catalyst Fund provides seed grants for early-stage, innovative ideas with social impact. Tembo\'s model of educating children via parents\' mobile phones is an innovative approach to early childhood education.',
          eligibility: 'Open to for-profits, nonprofits, or individuals worldwide',
          funding: '$2,500 to $15,000',
          deadline: 'Rolling',
          effort: 'Light',
          steps: [
            'Submit via the Catalyst Fund\'s online portal',
            'Create an account and fill in the proposal questions',
            'Highlight innovation and potential impact'
          ],
          link: 'https://apply.roddenberryfoundation.org/app/main/register/096B3E8FC7C03D844F7922C7FA2EF64695300ED49329FA653523A0DB38C26E85'
        },
        {
          id: 'drk',
          name: 'Draper Richards Kaplan Foundation (DRK) – Venture Philanthropy Fellowship',
          funder: 'DRK Foundation',
          match: 'DRK invests in early-stage social enterprises tackling big problems. They provide not just funding but mentoring and network support. Tembo\'s goal to educate 100 million children is bold and scalable.',
          eligibility: 'Both nonprofits and mission-driven for-profits',
          funding: 'Up to $300,000 over 3 years',
          deadline: 'Rolling',
          effort: 'Moderate',
          steps: [
            'Complete the "Submit an Application" form',
            'Attach pitch deck or 2-3 page summary',
            'If selected, proceed to full proposal and interviews'
          ],
          link: 'https://www.drkfoundation.org/apply/'
        }
      ]
    }
    // Add other organizations here
  };

  const organization = organizationGrants[organizationId];

  if (!organization) {
    return <div>Organization not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Grant Opportunities for {organization.name}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {organization.description}
        </p>
      </div>

      <div className="grid gap-8">
        {organization.grants.map((grant) => (
          <GrantCard key={grant.id} grant={grant} />
        ))}
      </div>
    </div>
  );
};

export default PilotV0; 