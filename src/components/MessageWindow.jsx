import styles from './styles/MessageWindow.module.css'

export default function MessageWindow({ messages, loading, messagesEndRef }) {
  return (
    <div className={styles.window}>
      {messages.map((msg, i) => (
        <p key={i} className={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}>
          <strong>{msg.role === 'user' ? '▶ 당신' : '🧑‍💼 GM'}:</strong> {msg.content}
        </p>
      ))}
      {loading && <p className={styles.loading}>GM이 세계를 생성 중...</p>}
      <div ref={messagesEndRef} />
    </div>
  )
}
