export interface UserInfo {
  moodleToken?: string;
  userid: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  lang?: string;
  sitename?: string;
  siteurl?: string;
  userPictureUrl?: string;
}

export interface LoginUserInfo extends Omit<UserInfo, 'userPictureUrl'> {
  userPictureUrl?: string;
  userpictureurl?: string;
}
