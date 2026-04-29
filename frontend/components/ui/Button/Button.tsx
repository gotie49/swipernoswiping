import styles from './Button.module.css'

interface ButtonProps {
  type?: 'submit' | 'button' | 'reset'
  disabled?: boolean
  onClick?: () => void
  background?: string
  children: React.ReactNode
}

export default function Button({ type = 'button', disabled, onClick, background = '#111827', children }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={styles.button}
      style={{ background }}
    >
      {children}
    </button>
  )
}