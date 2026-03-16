const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Sample doctors data
  const doctors = [
    {
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@mediconnect.com',
      city: 'Mumbai',
      specialization: 'Cardiologist',
      qualifications: 'MBBS, MD (Cardiology), DM (Cardiology)',
      experienceYears: 15,
      consultationFee: 800,
      clinicAddress: 'Kohinoor Hospital, Dadar, Mumbai',
      bio: 'Senior Cardiologist with 15 years of experience in interventional cardiology.',
      slots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '09:30' },
        { dayOfWeek: 1, startTime: '09:30', endTime: '10:00' },
        { dayOfWeek: 1, startTime: '10:00', endTime: '10:30' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '09:30' },
        { dayOfWeek: 3, startTime: '09:30', endTime: '10:00' },
        { dayOfWeek: 5, startTime: '11:00', endTime: '11:30' },
      ]
    },
    {
      name: 'Dr. Priya Patel',
      email: 'priya.patel@mediconnect.com',
      city: 'Ahmedabad',
      specialization: 'Dermatologist',
      qualifications: 'MBBS, MD (Dermatology)',
      experienceYears: 8,
      consultationFee: 500,
      clinicAddress: 'Skin Care Clinic, CG Road, Ahmedabad',
      bio: 'Expert dermatologist specializing in cosmetic and medical dermatology.',
      slots: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '10:30' },
        { dayOfWeek: 2, startTime: '10:00', endTime: '10:30' },
        { dayOfWeek: 2, startTime: '10:30', endTime: '11:00' },
        { dayOfWeek: 4, startTime: '14:00', endTime: '14:30' },
        { dayOfWeek: 4, startTime: '14:30', endTime: '15:00' },
      ]
    },
    {
      name: 'Dr. Anil Mehta',
      email: 'anil.mehta@mediconnect.com',
      city: 'Delhi',
      specialization: 'Orthopedist',
      qualifications: 'MBBS, MS (Orthopaedics)',
      experienceYears: 12,
      consultationFee: 700,
      clinicAddress: 'Apollo Clinic, Connaught Place, Delhi',
      bio: 'Orthopedic surgeon specializing in joint replacement and sports injuries.',
      slots: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '08:30' },
        { dayOfWeek: 2, startTime: '08:00', endTime: '08:30' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '08:30' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '08:30' },
      ]
    },
    {
      name: 'Dr. Sunita Krishnan',
      email: 'sunita.krishnan@mediconnect.com',
      city: 'Bangalore',
      specialization: 'Neurologist',
      qualifications: 'MBBS, MD (Neurology), DM (Neurology)',
      experienceYears: 18,
      consultationFee: 1000,
      clinicAddress: 'Manipal Hospital, Whitefield, Bangalore',
      bio: 'Senior neurologist with expertise in stroke management and epilepsy.',
      slots: [
        { dayOfWeek: 2, startTime: '11:00', endTime: '11:30' },
        { dayOfWeek: 2, startTime: '11:30', endTime: '12:00' },
        { dayOfWeek: 4, startTime: '11:00', endTime: '11:30' },
        { dayOfWeek: 4, startTime: '11:30', endTime: '12:00' },
      ]
    },
    {
      name: 'Dr. Kavita Shah',
      email: 'kavita.shah@mediconnect.com',
      city: 'Rajkot',
      specialization: 'Gynecologist',
      qualifications: 'MBBS, MS (Obstetrics & Gynaecology)',
      experienceYears: 10,
      consultationFee: 600,
      clinicAddress: 'Women Care Clinic, Kalawad Road, Rajkot',
      bio: 'Experienced gynecologist specializing in high-risk pregnancies and laparoscopic surgeries.',
      slots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '09:30' },
        { dayOfWeek: 1, startTime: '09:30', endTime: '10:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '09:30' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '09:30' },
        { dayOfWeek: 5, startTime: '09:30', endTime: '10:00' },
      ]
    },
    {
      name: 'Dr. Rohit Verma',
      email: 'rohit.verma@mediconnect.com',
      city: 'Mumbai',
      specialization: 'Pediatrician',
      qualifications: 'MBBS, MD (Paediatrics)',
      experienceYears: 9,
      consultationFee: 400,
      clinicAddress: 'Child Care Center, Bandra, Mumbai',
      bio: 'Dedicated pediatrician with a gentle approach to child healthcare.',
      slots: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '10:30' },
        { dayOfWeek: 1, startTime: '10:30', endTime: '11:00' },
        { dayOfWeek: 2, startTime: '10:00', endTime: '10:30' },
        { dayOfWeek: 3, startTime: '10:00', endTime: '10:30' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '10:30' },
      ]
    },
    {
      name: 'Dr. Meera Nair',
      email: 'meera.nair@mediconnect.com',
      city: 'Chennai',
      specialization: 'General Physician',
      qualifications: 'MBBS, MD (General Medicine)',
      experienceYears: 7,
      consultationFee: 300,
      clinicAddress: 'Health First Clinic, Anna Nagar, Chennai',
      bio: 'General physician providing comprehensive primary care for all age groups.',
      slots: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '08:30' },
        { dayOfWeek: 1, startTime: '08:30', endTime: '09:00' },
        { dayOfWeek: 2, startTime: '08:00', endTime: '08:30' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '08:30' },
        { dayOfWeek: 4, startTime: '08:00', endTime: '08:30' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '08:30' },
      ]
    },
    {
      name: 'Dr. Vikram Singh',
      email: 'vikram.singh@mediconnect.com',
      city: 'Delhi',
      specialization: 'Psychiatrist',
      qualifications: 'MBBS, MD (Psychiatry)',
      experienceYears: 14,
      consultationFee: 900,
      clinicAddress: 'Mind Wellness Center, Lajpat Nagar, Delhi',
      bio: 'Compassionate psychiatrist specializing in anxiety, depression, and stress management.',
      slots: [
        { dayOfWeek: 2, startTime: '14:00', endTime: '14:30' },
        { dayOfWeek: 2, startTime: '14:30', endTime: '15:00' },
        { dayOfWeek: 4, startTime: '14:00', endTime: '14:30' },
        { dayOfWeek: 4, startTime: '14:30', endTime: '15:00' },
      ]
    },
    {
      name: 'Dr. Anjali Desai',
      email: 'anjali.desai@mediconnect.com',
      city: 'Pune',
      specialization: 'Ophthalmologist',
      qualifications: 'MBBS, MS (Ophthalmology)',
      experienceYears: 11,
      consultationFee: 550,
      clinicAddress: 'Vision Care Hospital, FC Road, Pune',
      bio: 'Eye specialist with expertise in cataract surgery and retinal diseases.',
      slots: [
        { dayOfWeek: 1, startTime: '11:00', endTime: '11:30' },
        { dayOfWeek: 3, startTime: '11:00', endTime: '11:30' },
        { dayOfWeek: 3, startTime: '11:30', endTime: '12:00' },
        { dayOfWeek: 5, startTime: '11:00', endTime: '11:30' },
      ]
    },
    {
      name: 'Dr. Suresh Iyer',
      email: 'suresh.iyer@mediconnect.com',
      city: 'Hyderabad',
      specialization: 'ENT Specialist',
      qualifications: 'MBBS, MS (ENT)',
      experienceYears: 13,
      consultationFee: 450,
      clinicAddress: 'ENT Care Clinic, Banjara Hills, Hyderabad',
      bio: 'ENT specialist with experience in endoscopic sinus surgery and hearing disorders.',
      slots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '09:30' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '09:30' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '09:30' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '09:30' },
      ]
    },
    {
      name: 'Dr. Neha Gupta',
      email: 'neha.gupta@mediconnect.com',
      city: 'Rajkot',
      specialization: 'Dermatologist',
      qualifications: 'MBBS, DVD (Dermatology)',
      experienceYears: 6,
      consultationFee: 450,
      clinicAddress: 'Skin & Hair Clinic, Race Course Road, Rajkot',
      bio: 'Dermatologist specializing in acne, pigmentation, and hair loss treatments.',
      slots: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '10:30' },
        { dayOfWeek: 2, startTime: '10:00', endTime: '10:30' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '10:30' },
        { dayOfWeek: 5, startTime: '10:00', endTime: '10:30' },
      ]
    },
    {
      name: 'Dr. Arjun Kapoor',
      email: 'arjun.kapoor@mediconnect.com',
      city: 'Mumbai',
      specialization: 'Orthopedist',
      qualifications: 'MBBS, DNB (Orthopaedics)',
      experienceYears: 10,
      consultationFee: 750,
      clinicAddress: 'Bone & Joint Clinic, Andheri, Mumbai',
      bio: 'Orthopedic specialist focusing on minimally invasive spine and knee surgeries.',
      slots: [
        { dayOfWeek: 1, startTime: '12:00', endTime: '12:30' },
        { dayOfWeek: 2, startTime: '12:00', endTime: '12:30' },
        { dayOfWeek: 3, startTime: '12:00', endTime: '12:30' },
        { dayOfWeek: 5, startTime: '12:00', endTime: '12:30' },
      ]
    },
  ];

  const defaultPassword = await bcrypt.hash('Doctor@123', 10);

  for (const doc of doctors) {
    // Create user first
    const user = await prisma.user.create({
      data: {
        email: doc.email,
        passwordHash: defaultPassword,
        role: 'doctor',
        name: doc.name,
        city: doc.city,
      }
    });

    // Create doctor profile with time slots
    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        specialization: doc.specialization,
        qualifications: doc.qualifications,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        city: doc.city,
        clinicAddress: doc.clinicAddress,
        bio: doc.bio,
        averageRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)), // random 3.5–5.0
        totalReviews: Math.floor(20 + Math.random() * 180),                // random 20–200
        timeSlots: {
          create: doc.slots.map(slot => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
            slotDurationMinutes: 30
          }))
        }
      }
    });

    console.log(`✔ Created doctor: ${doc.name}`);
  }

  console.log('\n✅ Seeding complete! 12 doctors added to the database.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });