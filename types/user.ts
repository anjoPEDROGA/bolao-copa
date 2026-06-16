// Perfil interno do usuário.
// Os dados vindos de auth ou Firestore serão normalizados para este shape.

export type UserProfile = {
  name: string;
  favoriteTeamIds: string[];
  createdAt?: string;
  updatedAt?: string;
};
