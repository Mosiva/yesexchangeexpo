export interface User {
  id: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  discount?: {
    available: boolean;
    percent: number;
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface Credentials {
  username: string;
  password: string;
}
