import styles from './styles/ExploreDirections.module.css'

export default function ExploreDirections({ directions, moveDirection, setShowDirections, loading }) {
  return (
    <div className={styles.container}>
      <strong className={styles.title}>🧭 이동 방향 선택 (비용: 행동력 1)</strong>
      {directions.map(dir => (
        <button
          key={dir}
          onClick={() => moveDirection(dir)}
          disabled={loading}
          className={styles.button}
        >
          {dir}쪽으로 이동
        </button>
      ))}
      <button
        onClick={() => setShowDirections(false)}
        className={styles.cancel}
      >
        취소
      </button>
    </div>
  )
}
