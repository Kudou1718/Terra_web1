import styles from './styles/BattleSystem.module.css'

export default function BattleSystem({ player, enemy, battleLog }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h2>⚔️ 전투 개시!</h2>
      <p>플레이어 HP: {player.hp}</p>
      <p>{enemy.name} HP: {enemy.hp}</p>

      <div className={styles.battleLog}>
        {battleLog.map((log, i) => (
          <p key={i}>{log}</p>
        ))}
      </div>
    </div>
  )
}
