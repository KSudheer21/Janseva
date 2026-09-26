require('dotenv').config();
const { supabase } = require('../config/supabase');

async function seedSupabase() {
  console.log('[Supabase Seed] Seeding sample data into Supabase...');

  // 1. Seed Citizens
  const citizensData = [
    {
      name: 'K. Venkateswara Rao',
      mobile: '9876543210',
      language: 'te',
      address: 'Plot 42, Gayatri Nagar, Uppal, Hyderabad'
    },
    {
      name: 'Anjali Sharma',
      mobile: '9123456780',
      language: 'hi',
      address: 'Sector 4, BHEL Township, Sangareddy'
    },
    {
      name: 'P. Sai Kumar',
      mobile: '9440123456',
      language: 'en',
      address: 'Main Bazaar Road, Nizamabad'
    }
  ];

  const { data: insertedCitizens, error: citErr } = await supabase
    .from('citizens')
    .upsert(citizensData, { onConflict: 'mobile' })
    .select();

  if (citErr) console.warn('Citizen seed error:', citErr.message);
  else console.log(`[Supabase Seed] Upserted ${insertedCitizens?.length || citizensData.length} citizens.`);

  // 2. Seed Complaints
  const complaintsData = [
    {
      complaint_id: 'JS-2026-0001',
      citizen_name: 'K. Venkateswara Rao',
      mobile: '9876543210',
      description: 'Dangerous deep pothole on main road causing severe traffic choke and skidding hazards for two-wheelers.',
      language: 'te',
      category: 'Roads',
      priority: 'High',
      photo_url: '',
      latitude: 17.4012,
      longitude: 78.5602,
      exact_address: 'Opposite State Bank, Uppal Main Road',
      village: 'Uppal',
      mandal: 'Uppal',
      district: 'Medchal-Malkajgiri',
      status: 'ASSIGNED',
      assigned_officer_code: 'OFF001',
      assigned_officer_name: 'Sri Rajesh Sharma',
      assigned_at: new Date('2026-09-25T10:00:00Z'),
      timeline: [
        { status: 'SUBMITTED', title: 'Complaint Registered', timestamp: '2026-09-25T08:30:00Z', description: 'Grievance submitted by citizen with GPS location.', performedBy: 'Citizen' },
        { status: 'ASSIGNED', title: 'Assigned to Municipal Officer', timestamp: '2026-09-25T10:00:00Z', description: 'Assigned to Sri Rajesh Sharma (OFF001).', performedBy: 'System' }
      ]
    },
    {
      complaint_id: 'JS-2026-0002',
      citizen_name: 'Anjali Sharma',
      mobile: '9123456780',
      description: 'Street light pole #42 completely dark for over 4 nights. Major safety concern for pedestrians and women returning from work.',
      language: 'hi',
      category: 'Street Lights',
      priority: 'High',
      photo_url: '',
      latitude: 17.5101,
      longitude: 78.2912,
      exact_address: 'Near Park Gate, Sector 4, BHEL',
      village: 'Ramachandrapuram',
      mandal: 'RC Puram',
      district: 'Sangareddy',
      status: 'IN PROGRESS',
      assigned_officer_code: 'OFF001',
      assigned_officer_name: 'Sri Rajesh Sharma',
      assigned_at: new Date('2026-09-25T11:00:00Z'),
      started_at: new Date('2026-09-26T09:00:00Z'),
      timeline: [
        { status: 'SUBMITTED', title: 'Complaint Registered', timestamp: '2026-09-25T09:15:00Z', description: 'Grievance submitted.', performedBy: 'Citizen' },
        { status: 'ASSIGNED', title: 'Assigned to Officer', timestamp: '2026-09-25T11:00:00Z', description: 'Assigned to Sri Rajesh Sharma.', performedBy: 'System' },
        { status: 'IN PROGRESS', title: 'Work In Progress', timestamp: '2026-09-26T09:00:00Z', description: 'Electrical maintenance team dispatched with replacement LED luminary.', performedBy: 'Sri Rajesh Sharma' }
      ]
    },
    {
      complaint_id: 'JS-2026-0003',
      citizen_name: 'P. Sai Kumar',
      mobile: '9440123456',
      description: 'Major drinking water pipeline valve leaking continuously, flooding the street and wasting treated municipal water.',
      language: 'en',
      category: 'Water',
      priority: 'High',
      photo_url: '',
      latitude: 18.6725,
      longitude: 78.0941,
      exact_address: '5th Cross, Gandhi Chowk',
      village: 'Nizamabad North',
      mandal: 'Nizamabad',
      district: 'Nizamabad',
      status: 'COMPLETED',
      assigned_officer_code: 'OFF001',
      assigned_officer_name: 'Sri Rajesh Sharma',
      assigned_at: new Date('2026-09-24T08:00:00Z'),
      started_at: new Date('2026-09-24T10:30:00Z'),
      completed_at: new Date('2026-09-24T16:45:00Z'),
      resolution_note: 'Pipeline breach excavated and high-pressure compression coupling installed. Flow restored with zero leakage.',
      timeline: [
        { status: 'SUBMITTED', title: 'Complaint Registered', timestamp: '2026-09-24T07:30:00Z', description: 'Pipeline leak reported.', performedBy: 'Citizen' },
        { status: 'ASSIGNED', title: 'Assigned to Officer', timestamp: '2026-09-24T08:00:00Z', description: 'Assigned to Sri Rajesh Sharma.', performedBy: 'System' },
        { status: 'IN PROGRESS', title: 'Excavation Started', timestamp: '2026-09-24T10:30:00Z', description: 'Field crew arrived.', performedBy: 'Sri Rajesh Sharma' },
        { status: 'COMPLETED', title: 'Repairs Completed', timestamp: '2026-09-24T16:45:00Z', description: 'Leak resolved and verified.', performedBy: 'Sri Rajesh Sharma' }
      ]
    }
  ];

  const { data: insertedComplaints, error: compErr } = await supabase
    .from('complaints')
    .upsert(complaintsData, { onConflict: 'complaint_id' })
    .select();

  if (compErr) console.warn('Complaint seed error:', compErr.message);
  else console.log(`[Supabase Seed] Upserted ${insertedComplaints?.length || complaintsData.length} complaints.`);

  console.log('[Supabase Seed] Done! Refresh your Supabase Table Editor to see all rows.');
}

seedSupabase().catch(console.error);
