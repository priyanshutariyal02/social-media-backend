export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  subscribersCount?: number;
  isSubscribed?: boolean;
}

export interface Video {
  _id: string;
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner: User;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
}

export interface Tweet {
  _id: string;
  content: string;
  owner: User;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
}

export interface Comment {
  _id: string;
  content: string;
  video: string;
  owner: User;
  createdAt: string;
}

export interface ChannelStats {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  totalLikes: number;
}
