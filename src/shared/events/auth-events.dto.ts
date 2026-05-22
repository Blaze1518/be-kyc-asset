export interface UserCreatedEventPayload {
  userId: string;
  username: string;
  displayName: string;
}

export const AUTH_EVENTS = {
  USER_CREATED: 'auth.user.created',
};
