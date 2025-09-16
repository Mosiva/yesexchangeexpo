export interface User {
  id: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  // Add other user properties as needed
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface Credentials {
  username: string;
  password: string;
}
