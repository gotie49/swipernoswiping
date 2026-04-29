'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login } = useUser()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    /*try {

      const res = await fetch('/api/auth/login', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ email, password }),

      })

      const data = await res.json()

      if (!res.ok) {

        setError(data.message ?? 'Login fehlgeschlagen')

        return

      }

      login(data.token, data.user)

      router.push('/map')

    } catch {

      setError('Verbindung zum Server fehlgeschlagen')

    } finally {

      setIsLoading(false)

    }*/

    await new Promise(resolve => setTimeout(resolve, 500))

    if (email === 'test@test.de' && password === '1234') {
      login('dummy-token-123', { user_id: '1', name: 'Test User', email })
      router.push('/map')
    } else {
      setError('E-Mail oder Passwort falsch')
    }

    setIsLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Anmelden</h1>
        <p className={styles.subtitle}>
          Melde dich an um Orte zu bewerten und zu kommentieren.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="E-Mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@beispiel.de"
            required
          />
          <Input
            label="Passwort"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && <p className={styles.errorMessage}>{error}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
          </Button>
        </form>

        <p className={styles.footer}>
          Noch kein Konto?{' '}
          <a href="/register" className={styles.footerLink}>Registrieren</a>
        </p>
      </div>
    </div>
  )
}