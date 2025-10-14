export type SocialOuting = {
  id: string;
  name: string;
  schedule: Date;
  limit: number;
  participants: number;
};

export type Team = {
  id: string;
  name: string;
  discipline: string;
  schedule: string;
  members: number;
};

export type Academy = {
  id: string;
  name: string;
  discipline: string;
  location: string;
  memberships: number;
};

export type Member = {
  id: string;
  name: string;
  avatar: string;
  type: 'Outing' | 'Team' | 'Academy';
  entity: string;
  status: 'Pending' | 'Approved';
  email: string;
};

export type Payment = {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  amount: number;
  item: string;
  date: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
};

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};
