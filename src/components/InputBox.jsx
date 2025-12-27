import styles from './styles/InputBox.module.css'

export default function InputBox({ input, setInput, sendMessage, loading }) {
  return (
    <div className={styles.container}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="직접 행동 입력 (예: 주변 폐허를 조사한다)"
        className={styles.input}
        disabled={loading}
      />
      <button
        onClick={() => sendMessage()}
        disabled={loading}
        className={styles.button}
      >
        전송
      </button>
    </div>
  )
}
