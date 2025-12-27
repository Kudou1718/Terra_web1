import styles from './styles/ActionButtons.module.css'

export default function ActionButtons({ toggleExplore, rest, sendMessage, loading, playerStatus }) {
  return (
    <div className={styles.container}>
      <button
        onClick={toggleExplore}
        disabled={loading || playerStatus.actionPoints.current <= 0}
        className={styles.explore}
      >
        🧭 탐색 (방향 선택)
      </button>
      <button
        onClick={rest}
        disabled={loading}
        className={styles.rest}
      >
        😴 휴식 (행동력 +1~5)
      </button>
      <button
        onClick={() => sendMessage("인벤토리를 확인한다")}
        disabled={loading}
        className={styles.inventory}
      >
        🎒 인벤토리 확인
      </button>
    </div>
  )
}
