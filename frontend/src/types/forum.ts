export interface ForumCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  topicsCount: number;
  postsCount: number;
  lastActivity?: {
    author: string;
    date: Date;
  };
}

export interface ForumTopic {
  id: string;
  title: string;
  postsCount: number;
  viewsCount: number;
  isPinned?: boolean;
  isLocked?: boolean;
  author: {
    name: string;
  };
  createdAt: Date;
}

export interface ForumPost {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string;
  };
  reactions?: {
    [key: string]: {
      count: number;
      userReacted: boolean;
    };
  };
}