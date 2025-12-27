import styles from './styles/BattleSystem.module.css'

export default function BattleSystem({ player, enemy, battleLog, onEnd }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h2>⚔️ 전투 개시!</h2>
      <p>플레이어 HP: {player.hp}</p>
      <p>{enemy.name} HP: {enemy.hp}</p>

      <div className="battleLog">
        {battleLog.map((log, i) => (
          <p key={i}>{log}</p>
        ))}
      </div>

      {/* 전투 종료 후 돌아가기 버튼 */}
      <button onClick={onEnd} style={{
        marginTop: "10px",
        padding: "10px 20px",
        background: "#550000",
        color: "#fff",
        border: "1px solid #f00",
        borderRadius: "4px"
      }}>
        돌아가기
      </button>
    </div>
  )
}
