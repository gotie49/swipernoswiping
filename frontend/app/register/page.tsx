'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import Button from '@/components/ui/Button/Button'
import Input from '@/components/ui/Input/Input'
import { MdArrowBack } from 'react-icons/md'
import styles from './RegisterPage.module.css'

export default function RegisterPage() {
  const { login } = useUser()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password }),
      })

      if (!res.ok) {
        const msg = await res.text()
        setError(msg || 'Registrierung fehlgeschlagen')
        return
      }

      const loginRes = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!loginRes.ok) {
        router.push('/login')
        return
      }

      const loginData = await loginRes.json()
      const token: string = loginData.token

      const meRes = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!meRes.ok) {
        router.push('/login')
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
    <div className={styles.container}>
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

        <h1 className={styles.title}>Registrieren</h1>
        <p className={styles.subtitle}>
          Erstelle ein Konto um Orte zu bewerten und zu kommentieren.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Dein Name"
            required
          />
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
          <Input
            label="Passwort bestätigen"
            type="password"
            value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Wird registriert...' : 'Konto erstellen'}
          </Button>
        </form>

        <p className={styles.footer}>
          Bereits ein Konto?{' '}
          <a href="/login" className={styles.footerLink}>Anmelden</a>
        </p>
      </div>
    </div>
  )
}