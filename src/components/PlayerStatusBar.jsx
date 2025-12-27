import styles from './styles/PlayerStatusBar.module.css'

export default function PlayerStatusBar({ playerStatus }) {
  return (
    <div className={styles.statusBar}>
      <div className={styles.topRow}>
        <span>❤️ HP: {playerStatus.hp}/{playerStatus.maxHp}</span>
        <span>📍 위치: {playerStatus.position.x}:{playerStatus.position.y}</span>
        <span>⚡ 행동력: {playerStatus.actionPoints.current}/{playerStatus.actionPoints.max}</span>
      </div>
      <div className={styles.inventory}>
        🎒 인벤토리: {playerStatus.inventory.join(" | ") || "비어 있음"}
      </div>
    </div>
  )
}
