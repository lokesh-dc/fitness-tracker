export const DEMO_USER_ID = '605c7b2ec2f848d8825a1def'; // 24-character hex string


export const DEMO_EMAIL = 'demo@fittrack.app';

export const isDemoSession = (session: any) =>
  session?.user?.email === DEMO_EMAIL;

export const isDemoUser = (userId: string | undefined) =>
  userId === DEMO_USER_ID;
