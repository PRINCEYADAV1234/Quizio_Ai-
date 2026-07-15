import type { User as FirebaseUser } from 'firebase/auth'

type ProfileLike = {
  name?: string | null
  email?: string | null
} | null

export function getUserDisplayName(profile: ProfileLike, firebaseUser: FirebaseUser | null) {
  const profileName = profile?.name?.trim()
  if (profileName && profileName !== 'Quizio Scholar') return profileName

  const firebaseName = firebaseUser?.displayName?.trim()
  if (firebaseName) return firebaseName

  const email = profile?.email || firebaseUser?.email
  const emailName = email?.split('@')[0]?.replace(/[._-]+/g, ' ')?.trim()
  if (emailName) {
    return emailName
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  return 'User'
}

export function getUserInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'U'
}
