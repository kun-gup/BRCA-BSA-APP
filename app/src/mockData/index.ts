export const MOCK_LEADERBOARD_BRCA = [
  { id: '1', rank: 1, hostel: 'Kumaon', points: 1820 },
  { id: '2', rank: 2, hostel: 'Jwalamukhi', points: 1640 },
  { id: '3', rank: 3, hostel: 'Aravali', points: 1490 },
  { id: '4', rank: 4, hostel: 'Satpura', points: 1280, isCurrentUser: true },
  { id: '5', rank: 5, hostel: 'Nilgiri', points: 1150 },
  { id: '6', rank: 6, hostel: 'Udaigiri', points: 980 },
];

export const MOCK_LEADERBOARD_BSA = [
  { id: '1', rank: 1, hostel: 'Kumaon', points: 2100 },
  { id: '2', rank: 2, hostel: 'Satpura', points: 1950, isCurrentUser: true },
  { id: '3', rank: 3, hostel: 'Aravali', points: 1800 },
  { id: '4', rank: 4, hostel: 'Jwalamukhi', points: 1600 },
  { id: '5', rank: 5, hostel: 'Nilgiri', points: 1200 },
  { id: '6', rank: 6, hostel: 'Udaigiri', points: 1050 },
];

export const MOCK_EVENTS_BRCA = [
  {
    id: 'e1',
    title: 'Group Dance Competition',
    club: 'Dance Club',
    date: '19 May 2025',
    time: '6:00 PM',
    venue: 'LH Auditorium',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=600&auto=format&fit=crop', // Placeholder
    isCompetitive: true,
  }
];

export const MOCK_EVENTS_BSA = [
  {
    id: 'e2',
    title: 'Inter Hostel Football',
    club: 'Football',
    date: '20 May 2025',
    time: '6:00 PM',
    venue: 'Football Ground',
    image: 'https://images.unsplash.com/photo-1518605368461-1ee7e53f0b28?q=80&w=600&auto=format&fit=crop', // Placeholder
    isCompetitive: true,
  }
];

export const MOCK_SCHEDULE_BRCA = [
  { id: 's1', time: '04:00 PM', title: 'Street Play Practice', club: 'Drama Club' },
  { id: 's2', time: '05:30 PM', title: 'Music Band Practice', club: 'Music Club' },
  { id: 's3', time: '07:00 PM', title: 'Fine Arts Workshop', club: 'Fine Arts Club' },
];

export const MOCK_SCHEDULE_BSA = [
  { id: 's4', time: '06:00 AM', title: 'Basketball Practice', club: 'Basketball Court' },
  { id: 's5', time: '04:00 PM', title: 'Cricket Net Practice', club: 'Cricket Ground' },
  { id: 's6', time: '08:00 PM', title: 'Badminton Tournament', club: 'Indoor Stadium' },
];

export const MOCK_NOTICES = [
  {
    id: 'n1',
    board: 'BSA',
    type: 'Registration',
    title: 'Registrations Open',
    subtitle: 'Inter Hostel Football',
    timeAgo: '2 hours ago',
    iconType: 'mega',
  },
  {
    id: 'n2',
    board: 'BRCA',
    type: 'Result',
    title: 'Results Out',
    subtitle: 'Group Dance Competition',
    timeAgo: 'Yesterday',
    iconType: 'trophy',
  },
  {
    id: 'n3',
    board: 'BRCA',
    type: 'Workshop',
    title: 'Workshop Alert',
    subtitle: 'Photography Workshop',
    timeAgo: '1 day ago',
    iconType: 'camera',
  },
  {
    id: 'n4',
    board: 'BSA',
    type: 'Info',
    title: 'Important Update',
    subtitle: 'Sports Meet Guidelines',
    timeAgo: '2 days ago',
    iconType: 'info',
  }
];
