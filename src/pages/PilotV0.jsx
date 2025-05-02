import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import PilotGrantCard from '../components/PilotGrantCard';
import PropTypes from 'prop-types';
import { submitFeedback } from '../services/analytics';

const PageFeedback = ({ organization }) => {
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState({
    isHelpful: null,
    planToApply: [],
    otherFeedback: '',
    submitted: false,
    isSubmitting: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFeedback(prev => ({ ...prev, isSubmitting: true }));
      
      const success = await submitFeedback({
        grantId: 'page_feedback',
        organizationName: organization.name,
        reaction: JSON.stringify({
          isHelpful: feedback.isHelpful,
          planToApply: feedback.planToApply,
          otherFeedback: feedback.otherFeedback
        })
      });
      
      if (success) {
        setFeedback(prev => ({ ...prev, submitted: true }));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setFeedback(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (feedback.submitted) {
    return (
      <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center mt-8">
        <p className="font-medium">Thank you for your feedback!</p>
        <p className="text-sm mt-1">We'll be in touch as we roll out new AI-powered features to support your grant applications.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-[#f2e4d5] pt-8">
      {!showForm ? (
        <div className="text-center">
          <p className="text-[#5e4633] mb-4">
            We're building an AI-powered platform to further support your grant applications. 
            Your feedback will help shape our development!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mx-auto block px-6 py-3 bg-[#3d6b44] text-white rounded-xl text-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Share Your Thoughts
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white/90 rounded-xl p-6 shadow-md border border-[#f2e4d5]">
          <h3 className="text-lg font-semibold text-[#442e1c] mb-2">Quick Feedback</h3>
          <p className="text-sm text-[#5e4633] mb-6">Your input will help us improve KindKite as we develop more features to support your grant applications.</p>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-[#442e1c] mb-3">Is learning about these grant opportunities helpful on its own?</p>
              <div className="flex space-x-4">
                {['Yes, very helpful', 'Somewhat helpful', 'Not really helpful'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="isHelpful"
                      value={option}
                      checked={feedback.isHelpful === option}
                      onChange={(e) => setFeedback(prev => ({ ...prev, isHelpful: e.target.value }))}
                      className="text-[#3d6b44] focus:ring-[#3d6b44]"
                      disabled={feedback.isSubmitting}
                    />
                    <span className="ml-2 text-sm text-[#5e4633]">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[#442e1c] mb-3">Which grants are you considering applying to?</p>
              <div className="space-y-2">
                {organization.grants.map(grant => (
                  <label key={grant.id} className="flex items-start">
                    <input
                      type="checkbox"
                      value={grant.id}
                      checked={feedback.planToApply.includes(grant.id)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFeedback(prev => ({
                          ...prev,
                          planToApply: e.target.checked 
                            ? [...prev.planToApply, value]
                            : prev.planToApply.filter(id => id !== value)
                        }));
                      }}
                      className="mt-1 text-[#3d6b44] focus:ring-[#3d6b44]"
                      disabled={feedback.isSubmitting}
                    />
                    <span className="ml-2 text-sm text-[#5e4633]">{grant.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[#442e1c] mb-2">Any other feedback about these recommendations?</p>
              <textarea
                value={feedback.otherFeedback}
                onChange={(e) => setFeedback(prev => ({ ...prev, otherFeedback: e.target.value }))}
                placeholder="What would make these recommendations more useful? What other support would help with your grant applications?"
                className="w-full px-3 py-2 border border-[#f2e4d5] rounded-lg text-sm text-[#5e4633] placeholder-[#5e4633]/50 focus:ring-[#3d6b44] focus:border-[#3d6b44]"
                rows="3"
                disabled={feedback.isSubmitting}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-[#5e4633] hover:text-[#442e1c] transition-colors text-sm"
              disabled={feedback.isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={feedback.isSubmitting}
              className={`px-6 py-2 bg-[#3d6b44] text-white rounded-lg text-sm font-medium transition-all ${
                feedback.isSubmitting 
                  ? 'opacity-75 cursor-not-allowed'
                  : 'hover:bg-opacity-90'
              }`}
            >
              {feedback.isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const PilotV0 = () => {
  const { organizationId } = useParams();
  const location = useLocation();
  
  // Check for direct access via state or query parameter
  const searchParams = new URLSearchParams(location.search);
  const isDirectAccess = location.state?.direct || searchParams.get('direct') === 'true';

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
          effort: 'Application Effort: Light',
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
          effort: 'Application Effort: Light',
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
          effort: 'Application Effort: Moderate',
          steps: [
            'Complete the "Submit an Application" form with basic info and short prompts',
            'Attach pitch deck or 2-3 page summary covering mission, model, team, and plans',
            'If selected, proceed with due diligence, interviews, and full proposal'
          ],
          link: 'https://www.drkfoundation.org/apply-for-funding/submit-an-application/'
        }
      ]
    },
    'two-moons-health': {
      name: 'Two Moons Health',
      description: 'A for-profit social enterprise (Delaware C-corp) focused on women\'s hormonal health through natural, science-backed solutions. Founded by a doctor and a lawyer in NYC, Two Moons offers the first-ever seed cycling capsule (patent pending) to support PMS, PMDD, perimenopause, hormonal acne, and cycle irregularities. The company combines ancient wisdom with modern science to create all-organic, plant-based supplements designed to sync with the menstrual cycle\'s phases.',
      grants: [
        {
          id: 'cartier-womens-initiative',
          name: 'Cartier Women\'s Initiative',
          funder: 'Cartier International (Cartier Philanthropy)',
          match: 'Two Moons Health perfectly aligns with Cartier\'s mission of supporting women-led impact ventures that leverage business for social good. As a women-founded company addressing critical women\'s health needs through innovative, science-backed solutions, Two Moons represents the type of social enterprise Cartier seeks to support.',
          eligibility: 'Open to women-run, for-profit businesses worldwide with strong social or environmental impact missions. Two Moons qualifies as a women-led impact venture in the health and wellness space.',
          funding: 'Up to US$100,000 for 1st place (with second and third place awards of $60,000 and $30,000) in each regional or thematic category. All fellows also get access to mentorship, networking, and INSEAD courses.',
          deadline: 'June 24, 2025 (2pm CEST) for the 2025 cohort',
          effort: 'Application Effort: Medium',
          steps: [
            'Complete the online application form',
            'Submit business plan and impact metrics',
            'If selected, participate in regional finals',
            'Finalists pitch to judges'
          ],
          link: 'https://www.cartierwomensinitiative.com/'
        },
        {
          id: 'amber-grant',
          name: 'Amber Grant (WomensNet)',
          funder: 'WomensNet (Amber Grant Foundation)',
          match: 'Two Moons Health fits perfectly within the Amber Grant\'s scope as a woman-owned wellness venture. The company\'s focus on women\'s health and empowerment aligns well with the grant\'s mission of supporting women entrepreneurs.',
          eligibility: 'Open to women-owned small businesses in the U.S. The application is simple and qualifies you for all monthly and category-specific grants over the next 12 months.',
          funding: '$10,000 awarded monthly, with winners becoming eligible for an additional $25,000 year-end Amber Grant',
          deadline: 'Rolling monthly applications',
          effort: 'Application Effort: Light',
          steps: [
            'Complete the short online application form',
            'Application remains active for 12 months',
            'Automatic consideration for monthly and category-specific grants'
          ],
          link: 'https://ambergrantsforwomen.com/'
        },
        {
          id: 'big-idea-grant',
          name: 'Big Idea Grant by YippityDoo',
          funder: 'YippityDoo',
          match: 'Two Moons Health\'s innovative approach to women\'s wellness through seed cycling capsules aligns well with this grant\'s focus on supporting innovative women entrepreneurs.',
          eligibility: 'Open to women entrepreneurs across the U.S., including New York',
          funding: '$1,000 monthly',
          deadline: 'Rolling monthly applications',
          effort: 'Application Effort: Light',
          steps: [
            'Submit brief explanation of business idea',
            'Describe importance and fund utilization',
            'Complete simple application form'
          ],
          link: 'https://yippitydoo.com/'
        },
        {
          id: 'ifundwomen',
          name: 'IFundWomen Universal Grant Application',
          funder: 'IFundWomen (IFW)',
          match: 'Two Moons Health\'s mission of empowering women through better hormonal health aligns perfectly with IFW\'s focus on supporting women-led businesses. The company\'s innovative approach to women\'s wellness makes it a strong candidate for various grant opportunities.',
          eligibility: 'Open to women-led businesses in the U.S.',
          funding: 'Varies; past grants have ranged from $5,000 to $25,000',
          deadline: 'Ongoing; submit once to be considered for multiple opportunities',
          effort: 'Application Effort: Light',
          steps: [
            'Complete the Universal Grant Application',
            'Get matched with relevant grant opportunities',
            'Access coaching and networking resources'
          ],
          link: 'https://ifundwomen.com/'
        }
      ]
    },
    'viva-la-vida': {
      name: 'Viva La Vida',
      description: 'A global nonprofit organization building cross-cultural connections and solidarity through collaborative art projects. Founded by Xiaoning Lyu, Viva La Vida focuses on fostering mental well-being and resilience among marginalized communities (children, refugees, women, LGBTQ+) while amplifying underrepresented voices through art-based advocacy and exhibitions. The organization partners with global institutions including the UN, NGOs, and corporations to advance social impact.',
      grants: [
        {
          id: 'unesco-ifcd',
          name: 'UNESCO International Fund for Cultural Diversity (IFCD)',
          funder: 'UNESCO',
          match: 'IFCD supports innovative arts and culture projects that empower underserved communities and foster cross-cultural connections, perfectly aligning with VLV\'s mission. As an organization registered in multiple countries including China (a developing country party to the 2005 Convention), VLV qualifies as an international NGO applicant. The organization\'s track record of UN exhibitions and art programs for refugees/children strengthens the application.',
          eligibility: 'Open to NGOs and international NGOs. Projects must benefit developing-country communities and drive sustainable change in cultural industries.',
          funding: 'Up to US$100,000 for 12-24 month projects',
          deadline: 'May 21, 2025',
          effort: 'Application Effort: Moderate',
          steps: [
            'Develop detailed project proposal focusing on structural impacts',
            'Engage with National Commissions for UNESCO in registration countries',
            'Complete online platform application with results framework',
            'Obtain endorsement from national UNESCO commissions'
          ],
          link: 'https://www.unesco.org/creativity/sites/default/files/medias/fichiers/2025/03/16_IFCD_call_2025_en_0.pdf?hub=11'
        },
        {
          id: 'nea-gap',
          name: 'NEA Grants for Arts Projects (GAP)',
          funder: 'National Endowment for the Arts',
          match: 'The NEA\'s principal grant program aligns perfectly with Viva La Vida\'s focus on arts for mental health, resilience, and community impact. The organization\'s innovative approach to integrating arts with social well-being initiatives and cross-cultural engagement makes it a strong candidate.',
          eligibility: 'U.S. 501(c)(3) nonprofits with at least 3 years of arts programming. Projects can involve international partners but applicant must be U.S.-based.',
          funding: '$10,000 to $100,000 (1:1 non-federal match required)',
          deadline: 'July 10, 2025 (Part 1); July 22, 2025 (Part 2)',
          effort: 'Application Effort: Medium',
          steps: [
            'Submit Part 1 application via Grants.gov by July 10, 2025',
            'Complete Part 2 application by July 22, 2025',
            'Prepare detailed project budget with matching funds',
            'Document track record of arts programming'
          ],
          link: 'https://www.arts.gov/grants/grants-for-arts-projects'
        },
        {
          id: 'drk-foundation',
          name: 'Draper Richards Kaplan Foundation Support',
          funder: 'DRK Foundation',
          match: 'DRK\'s venture philanthropy approach is ideal for Viva La Vida\'s innovative art-for-social-impact model. The foundation\'s focus on scaling early-stage, high-impact organizations aligns with VLV\'s goals of expanding its cross-cultural healing and advocacy work.',
          eligibility: 'Early-stage nonprofits (1-3 years old or at critical growth point) with strong leadership and scalable social impact model. Open to registered nonprofits in any country.',
          funding: 'Approximately $300,000 over 3 years (~$100,000/year)',
          deadline: 'Rolling (year-round submissions)',
          effort: 'Application Effort: Medium',
          steps: [
            'Submit executive summary for initial consideration',
            'If selected, participate in due diligence process',
            'Present scalable impact model to DRK team',
            'Develop detailed growth and implementation plan'
          ],
          link: 'https://www.drkfoundation.org/apply-for-funding/'
        },
        {
          id: 'ned-democracy',
          name: 'National Endowment for Democracy (NED) – Global Democracy Grants',
          funder: 'National Endowment for Democracy',
          match: 'NED\'s focus on empowering marginalized communities and promoting human rights through civic engagement perfectly aligns with Viva La Vida\'s art-as-advocacy initiatives. The organization\'s work in using art to raise awareness of refugee issues, LGBTQ+ rights, and other social justice causes in challenging environments makes it an ideal candidate.',
          eligibility: 'Non-governmental organizations worldwide, including civil society groups and cultural organizations in over 100 countries. VLV can apply via its local NGO entities in eligible countries for projects that tie into democratic values or human rights.',
          funding: 'Around $50,000 per grant on average (for a 12-month project). Grants are typically for one year but can be renewed.',
          deadline: 'Quarterly cycles (June 2025 and October 2025 remaining for 2025)',
          effort: 'Application Effort: Medium',
          steps: [
            'Identify specific project tying art to democratic values/human rights',
            'Submit proposal through NED\'s grant portal',
            'Wait for quarterly board review',
            'If approved, implement 12-month project plan'
          ],
          link: 'https://www.ned.org/apply-for-grant/'
        }
      ]
    },
    'prima-vault': {
      name: 'Prima Vault',
      description: 'Prima Vault is a purpose-driven luxury resale platform that curates and sells authenticated, pre-loved designer goods. Our mission is to redefine what luxury means combining timeless fashion with social impact. We believe in elevating both style and purpose by making high-end pieces more accessible while giving back to underrepresented communities.',
      grants: [
        {
          id: 'amber-grant',
          name: 'Amber Grant – WomensNet',
          funder: 'WomensNet',
          match: 'Perfect for Prima Vault\'s pre-launch stage with no minimum business age or revenue required. The grant prioritizes women with inspiring ideas and missions, aligning well with Prima Vault\'s purpose-driven venture.',
          eligibility: 'Open to women-owned businesses in the U.S.',
          funding: '$10,000 awarded monthly, with winners eligible for $25,000 year-end grant',
          deadline: 'Rolling (monthly)',
          effort: 'Application Effort: Light',
          steps: [
            'Complete simple online application',
            'Share your business story and vision',
            'Explain planned use of funds'
          ],
          link: 'https://ambergrantsforwomen.com/'
        },
        {
          id: 'ifundwomen',
          name: 'IFundWomen Universal Grant Application',
          funder: 'IFundWomen/Honeycomb',
          match: 'One application opens doors to multiple grant opportunities. Ideal for Prima Vault\'s small founding team, saving time while accessing grants supporting women, tech innovation, and sustainability initiatives.',
          eligibility: 'Women-owned businesses in the U.S.',
          funding: 'Varies by opportunity ($5,000-$25,000)',
          deadline: 'Ongoing',
          effort: 'Application Effort: Light',
          steps: [
            'Complete Universal Grant Application',
            'Get matched with relevant opportunities',
            'Access coaching and resources'
          ],
          link: 'https://ifundwomen.com/'
        },
        {
          id: 'boundless-futures',
          name: 'Boundless Futures Foundation Grants (EmpowHer Grants)',
          funder: 'Boundless Futures Foundation',
          match: 'Prima Vault\'s circular economy model and sustainability focus align perfectly with the Foundation\'s mission. The program specifically supports women-led ventures with strong social impact, matching Prima Vault\'s purpose-driven ethos.',
          eligibility: 'Women-led businesses with social/environmental impact',
          funding: 'Up to $25,000',
          deadline: 'Quarterly',
          effort: 'Application Effort: Moderate',
          steps: [
            'Submit detailed project proposal',
            'Demonstrate social impact metrics',
            'Present sustainability model'
          ],
          link: 'https://boundlessfutures.org/'
        },
        {
          id: 'wfn-pitch',
          name: 'Women Founders Network Fast Pitch Competition',
          funder: 'Women Founders Network',
          match: 'Perfect for Prima Vault\'s pre-launch stage and women-led team. Offers not just funding but also mentorship and investor connections. The competition\'s focus on early-stage companies creates a level playing field.',
          eligibility: 'Female founders, early-stage (under $750K raised)',
          funding: '$25,000 first place grant',
          deadline: 'May 31, 2025',
          effort: 'Application Effort: Moderate',
          steps: [
            'Submit initial application',
            'If selected, prepare pitch deck',
            'Present to investor panel'
          ],
          link: 'https://womenfoundersnetwork.com/'
        },
        {
          id: 'black-ambition',
          name: 'Black Ambition Prize Competition',
          funder: 'Black Ambition (Pharrell Williams)',
          match: 'If Prima Vault\'s founders identify as Black or Latinx, this competition offers transformative funding and exposure. The program\'s focus on tech innovation and social impact aligns perfectly with Prima Vault\'s mission.',
          eligibility: 'Black and Latinx founders',
          funding: 'Up to $1 million (non-dilutive)',
          deadline: 'June 2025',
          effort: 'Application Effort: High',
          steps: [
            'Submit comprehensive application',
            'If selected, join accelerator program',
            'Pitch to final judging panel'
          ],
          link: 'https://blackambitionprize.com/'
        }
      ]
    },
    'jote': {
      name: 'Journal of Trial and Error',
      description: 'The Journal of Trial and Error (JOTE) is a Netherlands-based non-profit organization that aims to make public the lessons of struggles in research. The organization\'s Center of Trial and Error provides a space for independent reflection on academic practice and stimulates students and early career researchers to disrupt existing scholarly infrastructures. JOTE believes that trial and error is fundamental to learning and discovery, focusing on publishing answers to the question "what went wrong?" in scientific practice.',
      grants: [
        {
          id: 'wtgrant-research',
          name: 'Research Grants on Improving the Use of Research Evidence',
          funder: 'William T. Grant Foundation (USA)',
          match: 'This program funds rigorous studies on how research evidence is generated, interpreted, and used—especially in youth-serving systems. JOTE\'s focus on publishing failed research, methodological flaws, and peer reviews aligns deeply with this goal. The foundation welcomes international applicants, provided the work has implications for U.S. practice.',
          eligibility: 'Open to international applicants. Partnership with U.S.-based researchers or youth-focused nonprofits recommended.',
          funding: 'Up to $500,000 USD over 2–4 years (typical range: $100,000–$400,000)',
          deadline: 'Letters of Inquiry expected August 2025; full proposals by February 2026',
          effort: 'Application Effort: High',
          steps: [
            'Submit Letter of Inquiry (LOI)',
            'If invited, prepare full proposal',
            'Partner with U.S.-based researchers',
            'Demonstrate relevance to U.S. policy systems'
          ],
          link: 'https://wtgrantfoundation.org/funding/research-grants-on-improving-use-of-research-evidence'
        },
        {
          id: 'oscars-open-science',
          name: 'OSCARS 2nd Open Call for Open Science Projects',
          funder: 'European Commission via OSCARS Project (Horizon Europe)',
          match: 'This grant funds open science services that promote FAIR data, transparency, and collaboration. As a nonprofit with ANBI status and a clear open science mission, JOTE is an ideal applicant. The call prioritizes cross-border collaboration and institutional change—core aspects of JOTE\'s mission.',
          eligibility: 'Open to universities, research institutes, SMEs, non-profits in Europe. Cross-border and cross-domain cooperation prioritized.',
          funding: '€100,000–€250,000 per project for 12-24 months',
          deadline: 'May 14, 2025, 17:00 CEST',
          effort: 'Application Effort: Medium',
          steps: [
            'Outline specific project advancing open science',
            'Describe objectives, methodology, and expected outcomes',
            'Partner with university or open science community in another EU country',
            'Emphasize integration with European Open Science Cloud'
          ],
          link: 'https://oscars-project.eu'
        },
        {
          id: 'amazon-think-big',
          name: 'Amazon Research Awards – "Think Big" Track',
          funder: 'Amazon Science/AWS',
          match: 'Amazon\'s "Think Big" program supports bold, unconventional research across all disciplines. JOTE could propose a project investigating the effects of publishing failure narratives on scientific behavior, trust, or innovation, or develop an experimental publishing system for real-time, transparent peer review.',
          eligibility: 'Open to faculty at accredited institutions or permanent researchers at NGOs with nonprofit status internationally',
          funding: 'Up to $100,000 USD in unrestricted funds, plus ~$70,000 in AWS credits and training support',
          deadline: 'May 7, 2025 (11:59 PM Pacific Time)',
          effort: 'Application Effort: Light',
          steps: [
            'Submit concise research proposal (3 pages)',
            'Highlight fundamental challenge addressed',
            'Outline bold and paradigm-challenging idea',
            'Detail potential impact and fund usage'
          ],
          link: 'https://amazon.science'
        },
        {
          id: 'cost-action',
          name: 'COST Action Open Call',
          funder: 'COST Association (EU Framework Programme)',
          match: 'COST funds European research networks built around novel, interdisciplinary topics – perfect for JOTE\'s mission. The network could convene scholars across disciplines to share methods, hold training sessions, and push institutional change in academic publishing and research transparency.',
          eligibility: 'Requires at least seven proposers from COST member states. Netherlands-based organizations eligible.',
          funding: '€135,000–€150,000 per year for up to 4 years (for networking, workshops, training schools)',
          deadline: 'October 21, 2025 at 12:00 noon CEST',
          effort: 'Application Effort: Medium',
          steps: [
            'Assemble core group of researchers/institutions',
            'Submit 15-page proposal with objectives and work plan',
            'Detail network composition and expected impact',
            'Plan networking activities and training events'
          ],
          link: 'https://www.cost.eu/how-to-apply/'
        }
      ]
    },
    'taylor-institute': {
      name: 'Taylor Leadership Institute at UNF',
      description: 'The Taylor Leadership Institute at the University of North Florida operates C.A.M.P. Osprey (Collegiate Achievement Mentoring Program), an innovative leadership mentoring program that connects UNF student leaders with middle and high school students from rural and underserved communities. The program has expanded to serve five counties in Northeast Florida (Duval, Putnam, Flagler, St. Johns and Clay) and three additional cities through virtual mentoring (Miami, Dallas and Raleigh). With demonstrated success in improving student attendance (27%) and academic achievement (11% GPA gain), C.A.M.P. Osprey focuses on college and career readiness, leadership development, and life skills through hands-on experiences, workshops, and one-on-one mentorship.',
      grants: [
        {
          id: 'jim-moran',
          name: 'Jim Moran Foundation Education Grants',
          funder: 'Jim Moran Foundation',
          match: 'As a Florida-based funder focused on education in Duval County, the Jim Moran Foundation is perfectly aligned with C.A.M.P. Osprey\'s geographic focus and mission. The program\'s proven impact on student attendance (+27%) and academic achievement (+11% GPA), combined with strong school-university partnerships, makes it an ideal candidate for the foundation\'s education grants.',
          eligibility: 'Open to 501(c)(3) organizations and public educational institutions operating in Duval County, Florida. C.A.M.P. Osprey can apply through the UNF Foundation.',
          funding: '$20,000 – $350,000+ with possibility of multi-year support',
          deadline: 'Rolling LOI, reviewed quarterly',
          effort: 'Application Effort: Medium',
          steps: [
            'Submit Letter of Intent (LOI)',
            'Document program impact metrics',
            'Highlight local partnerships',
            'Detail expansion plans within service area'
          ],
          link: 'https://jimmoranfoundation.org/grant/guidelines/'
        },
        {
          id: 'honda-foundation',
          name: 'American Honda Foundation – Youth Education Grants',
          funder: 'American Honda Foundation',
          match: 'The foundation\'s focus on STEM, literacy, leadership, and career readiness aligns perfectly with C.A.M.P. Osprey\'s comprehensive approach to student development. Their history of supporting university-K12 partnerships and emphasis on measurable outcomes matches well with the program\'s demonstrated impact.',
          eligibility: 'Open to 501(c)(3) organizations and public educational institutions. UNF can apply directly or through the UNF Foundation.',
          funding: '$20,000 – $75,000',
          deadline: 'August 1, 2025 (next upcoming quarterly cycle)',
          effort: 'Application Effort: Medium',
          steps: [
            'Complete online application',
            'Provide detailed program metrics',
            'Submit letters of support from partner schools',
            'Outline curriculum and mentorship components'
          ],
          link: 'https://csr.honda.com/longform-content/honda-corporate-funding/'
        },
        {
          id: 'state-farm',
          name: 'State Farm Companies Foundation – Good Neighbor Citizenship Grants',
          funder: 'State Farm Companies Foundation',
          match: 'C.A.M.P. Osprey\'s focus on improving K-12 student outcomes and expanding access to higher education aligns perfectly with State Farm\'s education and community development priorities. The program\'s track record of serving high-need communities in Northeast Florida makes it an especially strong candidate.',
          eligibility: 'Available to 501(c)(3) nonprofits and public educational institutions. UNF or the UNF Foundation is eligible.',
          funding: '$10,000 – $50,000+ depending on scope and region',
          deadline: 'Rolling – apply early in the year for best consideration',
          effort: 'Application Effort: Light',
          steps: [
            'Submit initial application through CyberGrants portal',
            'Document community impact and needs assessment',
            'Provide program evaluation data',
            'Detail sustainability plan'
          ],
          link: 'https://www.cybergrants.com/pls/cybergrants/quiz.display_question?x_gm_id=4214&x_quiz_id=9970&x_order_by=1'
        }
      ]
    },
    'planet-abled': {
      name: 'Planet Abled',
      description: 'Planet Abled is a globally recognized travel brand promoting inclusive tourism for persons with disabilities and the elderly. Operating in India and Austria, the organization takes an intersectional approach to breaking down barriers in the global tourism industry. Since 2016, Planet Abled has been the only tourism company designing inclusive tours for both disabled and non-disabled people to travel together, while also providing consulting services to help tourism businesses become more accessible. Through the Planet Abled India Foundation, their non-profit arm, they focus on advocacy, DEI projects, and promoting travel experiences for disabled people facing financial hardship.',
      grants: [
        {
          id: 'cei-cooperation',
          name: 'CEI Cooperation Fund – Call for Proposals 2025',
          funder: 'Central European Initiative (CEI)',
          match: 'Through its Austrian registration, Planet Abled is perfectly positioned for this fund that supports regional cooperation and sustainable development. Their innovative approach to inclusive tourism and track record of building accessibility frameworks aligns perfectly with CEI\'s goals. The organization could propose capacity-building programs or inclusive tourism workshops across CEI member countries.',
          eligibility: 'Open to organizations registered in CEI member states, which includes Austria. Planet Abled qualifies through its Austrian registration.',
          funding: 'Up to €100,000',
          deadline: 'June 9, 2025',
          effort: 'Application Effort: Medium',
          steps: [
            'Submit proposal via CEI\'s online portal',
            'Detail regional cooperation components',
            'Outline sustainable development impact',
            'Provide implementation timeline'
          ],
          link: 'https://www.cei.int/calls-for-proposals'
        },
        {
          id: 'azim-premji',
          name: 'Azim Premji Foundation Grants',
          funder: 'Azim Premji Foundation',
          match: 'Planet Abled\'s work in India directly supports the Foundation\'s goals of advancing equity and inclusion. Their innovative model for improving accessibility in travel and tourism enhances livelihood opportunities for people with disabilities, aligning perfectly with the Foundation\'s focus on social equity and systemic change.',
          eligibility: 'Open to organizations working in India. Planet Abled qualifies through its Indian registration and operations.',
          funding: 'Variable based on project scope and impact',
          deadline: 'Rolling applications',
          effort: 'Application Effort: Medium',
          steps: [
            'Submit online proposal through Foundation portal',
            'Document social impact metrics',
            'Outline scaling strategy',
            'Detail sustainability plan'
          ],
          link: 'https://azimpremjifoundation.org/apply-for-a-grant/'
        },
        {
          id: 'sst-tourism',
          name: 'Swiss Foundation for Solidarity in Tourism (SST) Grants',
          funder: 'Swiss Foundation for Solidarity in Tourism',
          match: 'SST\'s focus on sustainable tourism development in the Global South perfectly matches Planet Abled\'s mission to make Indian tourism inclusive. Their community-led approach to building accessible tourism infrastructure and awareness campaigns strongly aligns with SST\'s goals. The relatively straightforward application process also makes this an efficient funding opportunity.',
          eligibility: 'Open to tourism projects contributing to sustainable development in the Global South',
          funding: 'CHF 5,000 to CHF 25,000',
          deadline: 'Rolling applications',
          effort: 'Application Effort: Light',
          steps: [
            'Submit concise email application',
            'Outline project sustainability',
            'Detail community impact',
            'Provide budget breakdown'
          ],
          link: 'https://www.sstfoundation.org/de/'
        }
      ]
    }
  };

  // If direct access, only show organization view
  if (isDirectAccess) {
    const organization = organizationGrants[organizationId];
    
    if (!organization) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-[#442e1c]">Organization not found</h1>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <PilotGrantCard 
                key={grant.id} 
                grant={grant} 
                organizationName={organization.name}
              />
            ))}
          </div>

          <PageFeedback organization={organization} />
        </div>
      </div>
    );
  }

  // Regular access with navigation - only shown if not direct access
  if (!organizationId) {
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
            <Link to="/pilot" className="text-[#3d6b44] hover:underline mt-4 inline-block">
              ← Back to Organizations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <PilotGrantCard 
              key={grant.id} 
              grant={grant} 
              organizationName={organization.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

PageFeedback.propTypes = {
  organization: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default PilotV0; 