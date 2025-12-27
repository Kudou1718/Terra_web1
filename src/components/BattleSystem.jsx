import styles from './styles/BattleSystem.module.css'

export default function BattleSystem({ player, enemy, battleLog, onEnd }) {
  return (
    <div className={styles.battle}>
      <h2>⚔️ 전투 개시!</h2>
      <p>플레이어 HP: {player.hp}</p>
      <p>적 HP: {enemy.hp}</p>

      <div className={styles.log}>
        {battleLog.map((log, i) => (
          <p key={i}>{log}</p>
        ))}
      </div>

      <button onClick={onEnd} className={styles.endBtn}>전투 종료</button>
    </div>
  )
}
