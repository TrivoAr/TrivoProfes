import type { SocialOuting, Team, Academy, Member, Payment } from './types';

export const socialOutings: SocialOuting[] = [
  { id: 'SO001', name: 'Beach Volleyball Day', schedule: new Date('2024-08-15T10:00:00'), limit: 20, participants: 15 },
  { id: 'SO002', name: 'Hiking at Sunrise Peak', schedule: new Date('2024-08-20T06:00:00'), limit: 15, participants: 15 },
  { id: 'SO003', name: 'City Bike Tour', schedule: new Date('2024-09-01T09:30:00'), limit: 25, participants: 22 },
  { id: 'SO004', name: 'Yoga in the Park', schedule: new Date('2024-09-05T18:00:00'), limit: 30, participants: 18 },
  { id: 'SO005', name: 'Kayaking Adventure', schedule: new Date('2024-09-12T11:00:00'), limit: 10, participants: 7 },
];

export const teams: Team[] = [
  { id: 'T001', name: 'Trivo Titans', discipline: 'Football', schedule: 'Mon, Wed, Fri @ 7pm', members: 22 },
  { id: 'T002', name: 'Court Kings', discipline: 'Basketball', schedule: 'Tue, Thu @ 8pm', members: 12 },
  { id: 'T003', name: 'Sandstorm Spikers', discipline: 'Volleyball', schedule: 'Sat @ 11am', members: 18 },
  { id: 'T004', name: 'Diamond Dogs', discipline: 'Baseball', schedule: 'Sun @ 2pm', members: 15 },
];

export const academies: Academy[] = [
  { id: 'A001', name: 'Trivo Tennis Academy', discipline: 'Tennis', location: 'Central Sports Complex', memberships: 58 },
  { id: 'A002', name: 'SwimFast Academy', discipline: 'Swimming', location: 'Aqua Center', memberships: 75 },
  { id: 'A003', name: 'Martial Arts Dojo', discipline: 'Karate', location: 'Downtown Hub', memberships: 42 },
];

export const members: Member[] = [
  { id: 'M001', name: 'Alice Johnson', avatar: 'https://picsum.photos/seed/avatar1/100/100', type: 'Academy', entity: 'Trivo Tennis Academy', status: 'Approved', email: 'alice@example.com' },
  { id: 'M002', name: 'Bob Williams', avatar: 'https://picsum.photos/seed/avatar2/100/100', type: 'Team', entity: 'Trivo Titans', status: 'Approved', email: 'bob@example.com' },
  { id: 'M003', name: 'Charlie Brown', avatar: 'https://picsum.photos/seed/avatar3/100/100', type: 'Outing', entity: 'Hiking at Sunrise Peak', status: 'Pending', email: 'charlie@example.com' },
  { id: 'M004', name: 'Diana Prince', avatar: 'https://picsum.photos/seed/avatar4/100/100', type: 'Academy', entity: 'SwimFast Academy', status: 'Approved', email: 'diana@example.com' },
  { id: 'M005', name: 'Ethan Hunt', avatar: 'https://picsum.photos/seed/avatar5/100/100', type: 'Team', entity: 'Court Kings', status: 'Pending', email: 'ethan@example.com' },
];

export const payments: Payment[] = [
  { id: 'P001', memberId: 'M001', memberName: 'Alice Johnson', memberAvatar: 'https://picsum.photos/seed/avatar1/100/100', amount: 150, item: 'Tennis Academy Monthly Fee', date: new Date('2024-07-01'), status: 'Approved' },
  { id: 'P002', memberId: 'M002', memberName: 'Bob Williams', memberAvatar: 'https://picsum.photos/seed/avatar2/100/100', amount: 50, item: 'Titans Team Contribution', date: new Date('2024-07-05'), status: 'Approved' },
  { id: 'P003', memberId: 'M004', memberName: 'Diana Prince', memberAvatar: 'https://picsum.photos/seed/avatar4/100/100', amount: 75, item: 'SwimFast Quarterly Fee', date: new Date('2024-07-10'), status: 'Pending' },
  { id: 'P004', memberId: 'M003', memberName: 'Charlie Brown', memberAvatar: 'https://picsum.photos/seed/avatar3/100/100', amount: 20, item: 'Hiking Trip Fee', date: new Date('2024-07-15'), status: 'Rejected' },
  { id: 'P005', memberId: 'M005', memberName: 'Ethan Hunt', memberAvatar: 'https://picsum.photos/seed/avatar5/100/100', amount: 0, item: 'Court Kings Tryout', date: new Date('2024-07-20'), status: 'Pending' },
];

export const revenueData = [
    { month: 'Jan', revenue: Math.floor(Math.random() * 2000) + 1000 },
    { month: 'Feb', revenue: Math.floor(Math.random() * 2000) + 1200 },
    { month: 'Mar', revenue: Math.floor(Math.random() * 2000) + 1500 },
    { month: 'Apr', revenue: Math.floor(Math.random() * 2000) + 1300 },
    { month: 'May', revenue: Math.floor(Math.random() * 2000) + 1800 },
    { month: 'Jun', revenue: Math.floor(Math.random() * 2000) + 2200 },
    { month: 'Jul', revenue: Math.floor(Math.random() * 2000) + 2500 },
];
