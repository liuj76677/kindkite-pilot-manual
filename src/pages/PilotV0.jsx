import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import PilotGrantCard from '../components/PilotGrantCard';

const PilotV0 = () => {
  const { organizationId } = useParams();
  const location = useLocation();
  const isDirectAccess = location.state?.direct;

  // This would typically come from an API, but for v0 we'll hardcode it
  const organizationGrants = {
    'tembo-education': {
      name: 'Tembo Education',
      description: 'A for-profit social enterprise (educational services company) focused on early childhood education via mobile technology. As a for-profit, Tembo should target grants and competitions open to social enterprises or companies with a charitable mission (not restricted to 501(c)(3) nonprofits).',
      grants: [
        {
          id: 'd-prize',
          name: 'D-Prize – Distribution of Proven Interventions',
          funder: 'D-Prize Foundation',
          match: 'D-Prize funds new ventures that scale proven poverty solutions. Tembo\'s SMS/WhatsApp early childhood curriculum can be framed as scaling a proven education intervention to low-income families. This aligns with D-Prize\'s focus on distributing services that improve lives in underserved regions. Tembo could propose launching in a new country or region to reach more children in poverty.',
          eligibility: 'Open worldwide to for-profit or nonprofit entrepreneurs. Tembo\'s global experience gives it an edge, though D-Prize often favors newer startups.',
          funding: 'Up to $20,000 in grant funding to launch pilot (equity-free)',
          deadline: 'May 18, 2025 (early deadline); June 29, 2025 (final)',
          effort: 'Light',
          steps: [
            'Fill out the online concept note form addressing the specific D-Prize challenge category',
            'If invited to Stage 2, submit a full proposal (~10 pages)',
            'Finalists pitch to judges'
          ],
          link: 'https://drive.google.com/file/d/1-InjmHFt2WNmkg5TbvxR53KRW56EoAIC/view'
        },
        {
          id: 'roddenberry',
          name: 'Roddenberry Foundation Catalyst Fund',
          funder: 'Roddenberry Foundation',
          match: 'The Catalyst Fund provides seed grants for early-stage, innovative ideas with social impact. Tembo\'s model of educating children via parents\' mobile phones is an innovative approach to early childhood education, matching Catalyst\'s preference for bold, unconventional ideas. This grant could fund development of new curriculum content or tech enhancements for Tembo\'s platform.',
          eligibility: 'Open to for-profits, nonprofits, or individuals worldwide with a charitable purpose',
          funding: '$2,500 to $15,000 for one year (equity-free)',
          deadline: 'Rolling – no fixed deadline',
          effort: 'Light',
          steps: [
            'Submit via the Catalyst Fund\'s online portal',
            'Create an account and fill in the proposal questions in English',
            'Highlight innovation and potential impact (number of children/parents reached)'
          ],
          link: 'https://apply.roddenberryfoundation.org/app/main/register/096B3E8FC7C03D844F7922C7FA2EF64695300ED49329FA653523A0DB38C26E85'
        },
        {
          id: 'drk',
          name: 'Draper Richards Kaplan Foundation (DRK) – Venture Philanthropy Fellowship',
          funder: 'DRK Foundation',
          match: 'DRK is a prestigious foundation that invests in early-stage social enterprises tackling big problems. They provide not just funding but mentoring and network support. Tembo\'s goal to educate 100 million children is bold and scalable, fitting DRK\'s focus on organizations with potential for exponential impact. DRK could be transformational for Tembo, helping it scale globally.',
          eligibility: 'Both nonprofits and mission-driven for-profits (including C-corp or B-corp structures). Looking for full-time founding teams with proven concept and early traction.',
          funding: 'Up to $300,000 over 3 years (typically $100K/year) plus mentorship',
          deadline: 'Rolling – year-round submissions',
          effort: 'Moderate',
          steps: [
            'Complete the "Submit an Application" form with basic info and short prompts',
            'Attach pitch deck or 2-3 page summary covering mission, model, team, and plans',
            'If selected, proceed with due diligence, interviews, and full proposal'
          ],
          link: 'https://www.drkfoundation.org/apply-for-funding/submit-an-application/'
        }
      ]
    }
    // Add other organizations here
  };

  // If no organizationId is provided and not direct access, show the landing page
  if (!organizationId && !isDirectAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#442e1c] mb-4">
              Pilot Organizations
            </h1>
            <p className="text-lg text-[#5e4633] max-w-3xl mx-auto">
              Select your organization to view your personalized grant opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(organizationGrants).map(([id, org]) => (
              <Link
                key={id}
                to={`/pilot/${id}`}
                className="block p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all transform hover:scale-105 border border-[#f2e4d5]"
              >
                <h2 className="text-xl font-semibold text-[#442e1c] mb-2">
                  {org.name}
                </h2>
                <p className="text-sm text-[#5e4633]">
                  {org.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const organization = organizationGrants[organizationId];

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#442e1c]">Organization not found</h1>
            {!isDirectAccess && (
              <Link to="/pilot" className="text-[#3d6b44] hover:underline mt-4 inline-block">
                ← Back to Organizations
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isDirectAccess && (
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-[#5e4633] hover:text-[#442e1c]">Home</Link>
              </li>
              <li>
                <span className="text-[#5e4633] mx-2">›</span>
              </li>
              <li>
                <Link to="/pilot" className="text-[#5e4633] hover:text-[#442e1c]">Pilot Organizations</Link>
              </li>
              <li>
                <span className="text-[#5e4633] mx-2">›</span>
              </li>
              <li>
                <span className="text-[#442e1c] font-medium">{organization.name}</span>
              </li>
            </ol>
          </nav>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#442e1c] mb-4">
            Grant Opportunities for {organization.name}
          </h1>
          <p className="text-lg text-[#5e4633] max-w-3xl mx-auto">
            {organization.description}
          </p>
        </div>

        <div className="grid gap-8">
          {organization.grants.map((grant) => (
            <PilotGrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PilotV0; 