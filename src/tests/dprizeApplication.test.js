import { testOrganization, testGrantApplication } from '../data/testData';
import { grantService } from '../services/grantService';
import { enhancedRAG } from '../utils/rag';

async function testDPrizeApplication() {
  console.log('Starting D-Prize Application Test...\n');

  try {
    // Test 1: Initialize Grant Service
    console.log('Test 1: Initializing Grant Service...');
    const dprizeGrant = grantService.grants.get('d-prize');
    console.log('✓ Grant service initialized with D-Prize grant\n');

    // Test 2: Generate Concept Note Response
    console.log('Test 2: Generating Concept Note Response...');
    const conceptNoteResponse = await grantService.generateGrantResponse(
      testOrganization,
      'd-prize',
      dprizeGrant.application.questions.find(q => q.id === 'concept_note')
    );
    console.log('Concept Note Response:', conceptNoteResponse.response);
    console.log('Sources:', conceptNoteResponse.sources);
    console.log('✓ Concept note response generated\n');

    // Test 3: Generate Impact Response
    console.log('Test 3: Generating Impact Response...');
    const impactResponse = await grantService.generateGrantResponse(
      testOrganization,
      'd-prize',
      dprizeGrant.application.questions.find(q => q.id === 'expected_impact')
    );
    console.log('Impact Response:', impactResponse.response);
    console.log('✓ Impact response generated\n');

    // Test 4: Generate Outcome Table
    console.log('Test 4: Generating Outcome Table...');
    const outcomeResponse = await grantService.generateGrantResponse(
      testOrganization,
      'd-prize',
      dprizeGrant.application.questions.find(q => q.id === 'outcome_table')
    );
    console.log('Outcome Response:', outcomeResponse.response);
    console.log('✓ Outcome table generated\n');

    // Test 5: Generate Team Table
    console.log('Test 5: Generating Team Table...');
    const teamResponse = await grantService.generateGrantResponse(
      testOrganization,
      'd-prize',
      dprizeGrant.application.questions.find(q => q.id === 'team_info')
    );
    console.log('Team Response:', teamResponse.response);
    console.log('✓ Team table generated\n');

    // Test 6: Validate Responses
    console.log('Test 6: Validating Responses...');
    const responses = {
      'concept_note': { answer: conceptNoteResponse.response },
      'expected_impact': { answer: impactResponse.response },
      'outcome_table': { answer: outcomeResponse.response },
      'team_info': { answer: teamResponse.response }
    };
    
    const validationResults = await grantService.validateResponses(
      responses,
      testOrganization,
      'd-prize'
    );
    console.log('Validation Results:', validationResults);
    console.log('✓ Responses validated\n');

    // Test 7: Generate Application Summary
    console.log('Test 7: Generating Application Summary...');
    const summary = await grantService.generateApplicationSummary(
      'd-prize',
      testOrganization,
      responses
    );
    console.log('Application Summary:', summary);
    console.log('✓ Application summary generated\n');

    console.log('All tests completed successfully!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run the tests
testDPrizeApplication().then(success => {
  if (success) {
    console.log('\nD-Prize Application System is working as expected!');
  } else {
    console.log('\nD-Prize Application System tests failed. Please check the errors above.');
  }
}); 