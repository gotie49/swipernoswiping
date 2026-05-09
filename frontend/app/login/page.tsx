'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { MdArrowBack } from 'react-icons/md'
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

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const msg = await res.text()
        setError(msg || 'Login fehlgeschlagen')
        return
      }

      const data = await res.json()
      const token: string = data.token

      const meRes = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!meRes.ok) {
        setError('Benutzerdaten konnten nicht geladen werden')
        return
      }

      const user = await meRes.json()

      login(token, {
        user_id: user.user_id,
        email: user.email,
        is_moderator: user.is_moderator,
      })

      router.push('/map')
    } catch {
      setError('Verbindung zum Server fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button
          onClick={() => router.push('/map')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            marginBottom: 16,
            padding: 0,
          }}
        >
          <MdArrowBack size={22} />
        </button>

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