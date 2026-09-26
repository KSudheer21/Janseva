const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runE2ETest() {
  console.log('========================================================');
  console.log(' JanSeva End-to-End Complaint Lifecycle Automated Test ');
  console.log('========================================================');

  // STEP 1: Citizen Login (Mobile OTP)
  console.log('\n[1/10] Requesting Citizen OTP for mobile 9876543210...');
  const otpReqRes = await fetch(`${BASE_URL}/auth/citizen/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: '9876543210' })
  }).then((r) => r.json());
  assert.strictEqual(otpReqRes.success, true, 'OTP request should succeed');
  console.log('✓ Citizen OTP requested successfully. Demo OTP:', otpReqRes.demoOtp);

  console.log('\n[2/10] Verifying Citizen OTP...');
  const otpVerifyRes = await fetch(`${BASE_URL}/auth/citizen/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: '9876543210', otp: '123456', name: 'K. Venkateswara Rao', language: 'te' })
  }).then((r) => r.json());
  assert.strictEqual(otpVerifyRes.success, true, 'OTP verify should succeed');
  const citizenToken = otpVerifyRes.token;
  assert(citizenToken, 'Citizen JWT token must be returned');
  console.log('✓ Citizen authenticated successfully. Token length:', citizenToken.length);

  // STEP 2: Citizen Priority Suggestion
  console.log('\n[3/10] Testing Smart Priority Suggestion for description...');
  const priorityRes = await fetch(`${BASE_URL}/complaints/suggest-priority`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Drainage',
      description: 'Severe sewage overflow danger near school gate'
    })
  }).then((r) => r.json());
  assert.strictEqual(priorityRes.success, true);
  console.log('✓ Suggested priority:', priorityRes.priority, '| Reason:', priorityRes.reason);

  // STEP 3: Citizen Submits New Complaint
  console.log('\n[4/10] Citizen submitting a new complaint...');
  const newComplaintPayload = {
    description: 'రహదారి పక్కన డ్రైనేజీ మ్యాన్‌హోల్ మూత విరిగిపోయి ప్రమాదకరంగా ఉంది. తక్షణమే సరిచేయగలరు.',
    category: 'Drainage',
    priority: 'High',
    language: 'te',
    latitude: 17.4082,
    longitude: 78.5521,
    village: 'Ramanthapur',
    mandal: 'Uppal',
    district: 'Medchal-Malkajgiri',
    exactAddress: 'Near Amberpet Bridge, Ramanthapur Main Road'
  };

  const submitRes = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${citizenToken}`
    },
    body: JSON.stringify(newComplaintPayload)
  }).then((r) => r.json());

  assert.strictEqual(submitRes.success, true, 'Submission should succeed');
  const createdId = submitRes.complaintId;
  assert(createdId && createdId.startsWith('JS-'), 'Complaint ID must start with JS-');
  assert.strictEqual(submitRes.complaint.status, 'SUBMITTED');
  console.log(`✓ Complaint created successfully with ID: ${createdId}, Status: SUBMITTED`);

  // STEP 4: Citizen views My Complaints
  console.log('\n[5/10] Citizen fetching My Complaints...');
  const myComplaintsRes = await fetch(`${BASE_URL}/complaints/my`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  }).then((r) => r.json());
  assert.strictEqual(myComplaintsRes.success, true);
  const found = myComplaintsRes.complaints.find((c) => c.complaintId === createdId);
  assert(found, 'Created complaint must be present in citizen list');
  console.log(`✓ Complaint ${createdId} verified in citizen list. Total citizen complaints: ${myComplaintsRes.count}`);

  // STEP 5: Officer Login
  console.log('\n[6/10] Officer Login (ID: OFF001, Pass: 1234)...');
  const officerLoginRes = await fetch(`${BASE_URL}/auth/officer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ officerId: 'OFF001', password: '1234' })
  }).then((r) => r.json());
  assert.strictEqual(officerLoginRes.success, true);
  const officerToken = officerLoginRes.token;
  console.log('✓ Officer authenticated successfully as:', officerLoginRes.user.name);

  // STEP 6: Officer Dashboard Real Counts
  console.log('\n[7/10] Officer retrieving Dashboard metrics...');
  const dashRes = await fetch(`${BASE_URL}/complaints/officer/dashboard`, {
    headers: { Authorization: `Bearer ${officerToken}` }
  }).then((r) => r.json());
  assert.strictEqual(dashRes.success, true);
  console.log('✓ Live Dashboard Metrics:', dashRes.stats);

  // STEP 7: Officer Assigns Complaint to Self
  console.log(`\n[8/10] Officer assigning ${createdId} to self...`);
  const assignRes = await fetch(`${BASE_URL}/complaints/officer/${createdId}/assign`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${officerToken}` }
  }).then((r) => r.json());
  assert.strictEqual(assignRes.success, true);
  assert.strictEqual(assignRes.complaint.status, 'ASSIGNED');
  console.log(`✓ Complaint assigned. Status: ${assignRes.complaint.status}, Officer: ${assignRes.complaint.assignedOfficerName}`);

  // STEP 8: Officer Starts Work
  console.log(`\n[9/10] Officer starting work on ${createdId}...`);
  const startWorkRes = await fetch(`${BASE_URL}/complaints/officer/${createdId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${officerToken}`
    },
    body: JSON.stringify({ status: 'IN PROGRESS', note: 'Field crew arrived with replacement manhole cover.' })
  }).then((r) => r.json());
  assert.strictEqual(startWorkRes.success, true);
  assert.strictEqual(startWorkRes.complaint.status, 'IN PROGRESS');
  console.log(`✓ Work started. Status: ${startWorkRes.complaint.status}`);

  // STEP 9: Officer Marks Completed with Proof
  console.log(`\n[10/10] Officer completing ${createdId} with proof...`);
  const completeRes = await fetch(`${BASE_URL}/complaints/officer/${createdId}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${officerToken}`
    },
    body: JSON.stringify({
      resolutionNote: 'New heavy-duty SFRC manhole cover installed and concrete ring secured. Verified safe for traffic.',
      completionPhotoDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="%2310b981"/><text x="300" y="200" font-size="24" fill="white" text-anchor="middle">Manhole Cover Fixed</text></svg>'
    })
  }).then((r) => r.json());
  assert.strictEqual(completeRes.success, true);
  assert.strictEqual(completeRes.complaint.status, 'COMPLETED');
  console.log(`✓ Problem marked COMPLETED. Resolution note recorded.`);

  // VERIFICATION: Citizen opens complaint and sees COMPLETED with full timeline
  const finalCheck = await fetch(`${BASE_URL}/complaints/my/${createdId}`, {
    headers: { Authorization: `Bearer ${citizenToken}` }
  }).then((r) => r.json());
  assert.strictEqual(finalCheck.success, true);
  assert.strictEqual(finalCheck.complaint.status, 'COMPLETED');
  assert(finalCheck.complaint.timeline.length >= 4, 'Timeline should have 4 milestones');
  console.log('\n========================================================');
  console.log(' ALL 10 END-TO-END STEPS PASSED WITH 100% INTEGRITY!   ');
  console.log(` Timeline Milestones (${finalCheck.complaint.timeline.length}):`);
  finalCheck.complaint.timeline.forEach((item, i) => {
    console.log(`   ${i + 1}. [${item.status}] ${item.title} - ${item.description}`);
  });
  console.log('========================================================');
}

runE2ETest().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
