type UserRecord = {
  id: string;
  name: string;
  age: number;
  email: string;
  username: string;
  accessLevel: number;
};

export type UserView = {
  uid: string;
  name: string;
  age: number;
  email: string;
  username: string;
  accessLevel: number;
  roleIds: string[];
};

export function toUserView(user: UserRecord, roleIds: string[]): UserView {
  return {
    uid: user.id,
    name: user.name,
    age: user.age,
    email: user.email,
    username: user.username,
    accessLevel: user.accessLevel,
    roleIds: [...new Set(roleIds)].sort()
  };
}
