const mongoose = require('mongoose');
const Citizen = require('../models/Citizen');
const Officer = require('../models/Officer');
const Complaint = require('../models/Complaint');
const Counter = require('../models/Counter');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// High quality clean SVG placeholders for offline sample data
const roadBeforeSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23475569"/><rect y="220" width="600" height="180" fill="%231e293b"/><line x1="0" y1="310" x2="600" y2="310" stroke="%23facc15" stroke-width="6" stroke-dasharray="25,20"/><path d="M220 280 Q250 250 290 285 T360 275 T420 300 Q380 340 310 335 Z" fill="%230f172a"/><path d="M120 320 Q140 300 170 325 T210 330 Z" fill="%230f172a"/><rect x="20" y="20" width="220" height="40" rx="8" fill="%23dc2626"/><text x="130" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">REPORTED POTHOLE</text><text x="300" y="375" font-family="sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle">Damaged Main Road - Severe Hazard</text></svg>`;

const roadAfterSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%2338bdf8"/><rect y="220" width="600" height="180" fill="%23334155"/><line x1="0" y1="310" x2="600" y2="310" stroke="%23ffffff" stroke-width="8" stroke-dasharray="30,20"/><rect y="270" width="600" height="60" fill="%231e293b" opacity="0.6"/><rect x="20" y="20" width="220" height="40" rx="8" fill="%2316a34a"/><text x="130" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">REPAIRED / RESOLVED</text><text x="300" y="375" font-family="sans-serif" font-size="14" fill="%23e2e8f0" text-anchor="middle">Fresh Bitumen Asphalt Layer Installed</text></svg>`;

const streetLightSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23090d16"/><line x1="300" y1="100" x2="300" y2="400" stroke="%2364748b" stroke-width="16"/><path d="M300 120 C320 80 380 70 410 90" stroke="%2364748b" stroke-width="12" fill="none"/><polygon points="390,90 430,90 420,115 400,115" fill="%2394a3b8"/><circle cx="410" cy="115" r="8" fill="%23334155"/><rect x="20" y="20" width="240" height="40" rx="8" fill="%23ea580c"/><text x="140" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">STREET LIGHT OUTAGE</text><text x="300" y="360" font-family="sans-serif" font-size="14" fill="%2394a3b8" text-anchor="middle">Dark Street Pole #42 - Non Functional</text></svg>`;

const streetLightAfterSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230f172a"/><circle cx="410" cy="120" r="180" fill="%23fef08a" opacity="0.25"/><line x1="300" y1="100" x2="300" y2="400" stroke="%2364748b" stroke-width="16"/><path d="M300 120 C320 80 380 70 410 90" stroke="%2364748b" stroke-width="12" fill="none"/><polygon points="390,90 430,90 420,115 400,115" fill="%23e2e8f0"/><circle cx="410" cy="118" r="14" fill="%23fde047"/><rect x="20" y="20" width="240" height="40" rx="8" fill="%2316a34a"/><text x="140" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">NEW LED INSTALLED</text><text x="300" y="360" font-family="sans-serif" font-size="14" fill="%23fef08a" text-anchor="middle">Luminary Replaced &amp; Fully Operational</text></svg>`;

const garbageSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%2364748b"/><rect y="260" width="600" height="140" fill="%23475569"/><rect x="180" y="160" width="140" height="140" rx="12" fill="%2315803d"/><rect x="160" y="145" width="180" height="20" rx="6" fill="%23166534"/><path d="M320 280 Q360 220 440 250 T520 290 Q480 320 400 310 Z" fill="%23e2e8f0"/><path d="M350 250 Q390 230 420 260 Z" fill="%23f59e0b"/><rect x="20" y="20" width="240" height="40" rx="8" fill="%23ea580c"/><text x="140" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">GARBAGE ACCUMULATION</text><text x="300" y="370" font-family="sans-serif" font-size="14" fill="%23ffffff" text-anchor="middle">Overflowing Dumpster in Market Area</text></svg>`;

const waterSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%2364748b"/><line x1="0" y1="280" x2="600" y2="280" stroke="%233b82f6" stroke-width="20"/><path d="M280 270 Q300 210 320 270" stroke="%2360a5fa" stroke-width="8" fill="none"/><circle cx="300" cy="210" r="15" fill="%2393c5fd"/><rect x="20" y="20" width="220" height="40" rx="8" fill="%23dc2626"/><text x="130" y="45" font-family="sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">WATER LEAKAGE</text><text x="300" y="350" font-family="sans-serif" font-size="14" fill="%23ffffff" text-anchor="middle">Main Supply Pipe Burst on 5th Cross</text></svg>`;

async function seedComplaints() {
  console.log('[JanSeva DB] Seeding initial realistic demo complaints...');

  // Ensure Demo Officer
  let officer = await Officer.findOne({ officerId: 'OFF001' });
  if (!officer) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1234', salt);
    officer = await Officer.create({
      officerId: 'OFF001',
      name: 'Sri Rajesh Sharma',
      passwordHash: hashedPassword,
      department: 'Municipal Administration & Public Works',
      designation: 'Ward Municipal Nodal Officer',
      phone: '+91 98765 43210',
      email: 'officer.rajesh@janseva.gov.in'
    });
  }

  // Ensure Demo Citizens
  let citizen1 = await Citizen.findOne({ mobile: '9876543210' });
  if (!citizen1) {
    citizen1 = await Citizen.create({
      name: 'K. Venkateswara Rao',
      mobile: '9876543210',
      language: 'te',
      address: 'Plot 42, Gayatri Nagar, Uppal, Hyderabad'
    });
  }

  let citizen2 = await Citizen.findOne({ mobile: '9123456780' });
  if (!citizen2) {
    citizen2 = await Citizen.create({
      name: 'Anjali Sharma',
      mobile: '9123456780',
      language: 'hi',
      address: 'Sector 4, BHEL Township, Sangareddy'
    });
  }

  let citizen3 = await Citizen.findOne({ mobile: '9988776655' });
  if (!citizen3) {
    citizen3 = await Citizen.create({
      name: 'Suresh Kumar Reddy',
      mobile: '9988776655',
      language: 'en',
      address: 'Main Road, Shamshabad, Rangareddy'
    });
  }

  // Counter
  await Counter.findByIdAndUpdate(
    { _id: 'complaintId_2026' },
    { $set: { seq: 5 } },
    { upsert: true }
  );

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const sampleComplaints = [
    {
      complaintId: 'JS-2026-000001',
      citizenId: citizen1._id,
      citizenName: citizen1.name,
      mobile: citizen1.mobile,
      description: 'ఉప్పల్ ప్రధాన రహదారిపై తీవ్రమైన గుంతలు ఉన్నాయి. వర్షం నీటితో నిండి బైకర్లు పడిపోతున్నారు. తక్షణ మరమ్మతు చేయవలసిందిగా కోరుతున్నాను.',
      language: 'te',
      category: 'Roads',
      priority: 'High',
      photoUrl: roadBeforeSvg,
      location: {
        latitude: 17.4018,
        longitude: 78.5602,
        exactAddress: 'Near Uppal Metro Pillar 942, Inner Ring Road',
        village: 'Uppal Kalan',
        mandal: 'Uppal',
        district: 'Medchal-Malkajgiri'
      },
      status: 'COMPLETED',
      assignedOfficerId: officer._id,
      assignedOfficerCode: officer.officerId,
      assignedOfficerName: officer.name,
      assignedAt: twoDaysAgo,
      startedAt: new Date(twoDaysAgo.getTime() + 2 * 3600000),
      completedAt: oneDayAgo,
      completionPhotoUrl: roadAfterSvg,
      resolutionNote: 'Road maintenance crew dispatched with premix cold bitumen. Potholes completely filled, compacted, and leveled. Road opened for smooth traffic.',
      timeline: [
        {
          status: 'SUBMITTED',
          title: 'Complaint Registered',
          timestamp: twoDaysAgo,
          description: 'Citizen submitted grievance with geotagged photo.',
          performedBy: 'Citizen (' + citizen1.name + ')'
        },
        {
          status: 'ASSIGNED',
          title: 'Assigned to Nodal Officer',
          timestamp: new Date(twoDaysAgo.getTime() + 1800000),
          description: `Grievance assigned to ${officer.name} (${officer.department}).`,
          performedBy: officer.name
        },
        {
          status: 'IN PROGRESS',
          title: 'Field Team Dispatched',
          timestamp: new Date(twoDaysAgo.getTime() + 2 * 3600000),
          description: 'Road repair team on site with bitumen material.',
          performedBy: officer.name
        },
        {
          status: 'COMPLETED',
          title: 'Pothole Fixed & Verified',
          timestamp: oneDayAgo,
          description: 'Bitumen work finished. Before/After proof verified by officer.',
          performedBy: officer.name
        }
      ],
      createdAt: twoDaysAgo,
      updatedAt: oneDayAgo
    },
    {
      complaintId: 'JS-2026-000002',
      citizenId: citizen2._id,
      citizenName: citizen2.name,
      mobile: citizen2.mobile,
      description: 'गली नंबर 5 में पिछले चार दिनों से स्ट्रीट लाइट खराब है। रात में बहुत अंधेरा रहता है और महिलाओं व बच्चों को आने-जाने में परेशानी हो रही है।',
      language: 'hi',
      category: 'Street Lights',
      priority: 'High',
      photoUrl: streetLightSvg,
      location: {
        latitude: 17.5102,
        longitude: 78.2891,
        exactAddress: 'Pole #14, Street 5, Near Community Hall, BHEL Township',
        village: 'Ramachandrapuram',
        mandal: 'RC Puram',
        district: 'Sangareddy'
      },
      status: 'IN PROGRESS',
      assignedOfficerId: officer._id,
      assignedOfficerCode: officer.officerId,
      assignedOfficerName: officer.name,
      assignedAt: oneDayAgo,
      startedAt: threeHoursAgo,
      timeline: [
        {
          status: 'SUBMITTED',
          title: 'Complaint Registered',
          timestamp: oneDayAgo,
          description: 'Grievance submitted by citizen with GPS location.',
          performedBy: 'Citizen (' + citizen2.name + ')'
        },
        {
          status: 'ASSIGNED',
          title: 'Assigned to Electrical Wing',
          timestamp: new Date(oneDayAgo.getTime() + 3600000),
          description: `Assigned to ${officer.name}`,
          performedBy: officer.name
        },
        {
          status: 'IN PROGRESS',
          title: 'Lineman Inspection in Progress',
          timestamp: threeHoursAgo,
          description: 'Lineman replacing faulty LED driver and checking feeder circuit.',
          performedBy: officer.name
        }
      ],
      createdAt: oneDayAgo,
      updatedAt: threeHoursAgo
    },
    {
      complaintId: 'JS-2026-000003',
      citizenId: citizen3._id,
      citizenName: citizen3.name,
      mobile: citizen3.mobile,
      description: 'Commercial vegetable waste dumped near government primary school gate. Stray dogs gathering, causing foul smell and unhygienic condition.',
      language: 'en',
      category: 'Garbage',
      priority: 'High',
      photoUrl: garbageSvg,
      location: {
        latitude: 17.2514,
        longitude: 78.4312,
        exactAddress: 'Opposite Zilla Parishad High School, Main Bazar',
        village: 'Shamshabad',
        mandal: 'Shamshabad',
        district: 'Rangareddy'
      },
      status: 'ASSIGNED',
      assignedOfficerId: officer._id,
      assignedOfficerCode: officer.officerId,
      assignedOfficerName: officer.name,
      assignedAt: oneHourAgo,
      timeline: [
        {
          status: 'SUBMITTED',
          title: 'Complaint Registered',
          timestamp: threeHoursAgo,
          description: 'Grievance recorded with location coordinates.',
          performedBy: 'Citizen (' + citizen3.name + ')'
        },
        {
          status: 'ASSIGNED',
          title: 'Assigned to Sanitation Wing',
          timestamp: oneHourAgo,
          description: 'Sanitation supervisor alerted for garbage truck pickup.',
          performedBy: officer.name
        }
      ],
      createdAt: threeHoursAgo,
      updatedAt: oneHourAgo
    },
    {
      complaintId: 'JS-2026-000004',
      citizenId: citizen1._id,
      citizenName: citizen1.name,
      mobile: citizen1.mobile,
      description: 'తాగునీటి పైపులైన్ పగిలి రోడ్డుపై వేల లీటర్ల తాగునీరు వృథా అవుతోంది. కాలనీకి నీటి సరఫరా ఆగిపోయింది.',
      language: 'te',
      category: 'Water',
      priority: 'High',
      photoUrl: waterSvg,
      location: {
        latitude: 17.4082,
        longitude: 78.5521,
        exactAddress: 'H.No 3-12/A, Ramanthapur Main Road',
        village: 'Ramanthapur',
        mandal: 'Uppal',
        district: 'Medchal-Malkajgiri'
      },
      status: 'SUBMITTED',
      timeline: [
        {
          status: 'SUBMITTED',
          title: 'Complaint Registered',
          timestamp: oneHourAgo,
          description: 'Drinking water pipeline damage reported by citizen.',
          performedBy: 'Citizen (' + citizen1.name + ')'
        }
      ],
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo
    },
    {
      complaintId: 'JS-2026-000005',
      citizenId: citizen3._id,
      citizenName: citizen3.name,
      mobile: citizen3.mobile,
      description: 'Drainage chamber overflowing into residential walkway. Foul odor and health hazard.',
      language: 'en',
      category: 'Drainage',
      priority: 'Moderate',
      location: {
        latitude: 17.2625,
        longitude: 78.4198,
        exactAddress: 'Lane 2, Teachers Colony',
        village: 'Shamshabad',
        mandal: 'Shamshabad',
        district: 'Rangareddy'
      },
      status: 'SUBMITTED',
      timeline: [
        {
          status: 'SUBMITTED',
          title: 'Complaint Registered',
          timestamp: new Date(now.getTime() - 20 * 60 * 1000),
          description: 'Citizen reported overflowing drainage chamber.',
          performedBy: 'Citizen (' + citizen3.name + ')'
        }
      ],
      createdAt: new Date(now.getTime() - 20 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 20 * 60 * 1000)
    }
  ];

  await Complaint.insertMany(sampleComplaints);
  console.log(`[JanSeva DB] Seeded ${sampleComplaints.length} sample complaints successfully.`);

  // Create initial notification for citizen1
  await Notification.create({
    recipientType: 'citizen',
    citizenId: citizen1._id,
    complaintId: 'JS-2026-000001',
    title: 'Complaint Completed',
    message: 'Your complaint JS-2026-000001 has been completed by Sri Rajesh Sharma. View before/after photos.',
    status: 'COMPLETED'
  });
}

module.exports = { seedComplaints };
