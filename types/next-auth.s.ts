declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    /** The user's id number */
    id: number;
    /** The user's name */
    name: string;
    /** The user's email address */
    email: string;
    /** The user's profile image url (provided by oAuth service) */
    avatar: string;
    /** The user's provider (email, google, facebook, etc) */
    provider: string;
    /** The user's role */
    role: 'admin' | 'user';
    /** If the user has access to private videos */
    hasPrivateVideos: boolean;
    /** The user's profile data (optional) */
    person: {
      id: number;
      name: string;
      gender: string;
      image: string;
      birthday: Date;
    };
  }
}
