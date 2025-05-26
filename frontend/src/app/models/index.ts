export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: Date;
}

export interface Publication {
  id: number;
  title: string;
  content: string;
  location?: string;
  user_id: number;
  author_name?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  publication_id: number;
  author_name?: string;
  created_at?: Date;
  updated_at?: Date;
}
