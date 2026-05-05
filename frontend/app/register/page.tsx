'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import Button from '@/components/ui/Button/Button'
import Input from '@/components/ui/Input/Input'
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
      /*
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? 'Registrierung fehlgeschlagen')
        return
      }

      login(data.token, data.user)
      router.push('/map')
      */
            // --- DUMMY REGISTER ---
            await new Promise(resolve => setTimeout(resolve, 500))

            if (password !== passwordConfirm) {
                setError('Passwörter stimmen nicht überein')
                return
            }

            login('dummy-token-123', {
                user_id: '1',
                name,
                email,
            })
            router.push('/map')
            // --- ENDE DUMMY ---
    } catch {
      setError('Verbindung zum Server fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
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
          <a href="/login" className={styles.footerLink}>
            Anmelden
          </a>
        </p>
      </div>
    </div>
  )
}
