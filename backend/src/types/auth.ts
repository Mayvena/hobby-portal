export type AccessMode = 'readOnly' | 'readWrite' | 'delete';

export type AuthUser = {
  uid: string;
  username: string;
  accessLevel: number;
  roleIds: string[];
};
