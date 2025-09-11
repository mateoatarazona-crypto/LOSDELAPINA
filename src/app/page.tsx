import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export default async function Home() {
  try {
    const session = await getServerSession(authOptions)
    
    if (session) {
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error) {
    console.error('Error getting session:', error)
    redirect('/login')
  }
}
