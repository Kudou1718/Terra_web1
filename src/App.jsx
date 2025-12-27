import { useState, useRef, useEffect } from 'react'
import styles from './layout.module.css'
import PlayerStatusBar from './components/PlayerStatusBar'
import MessageWindow from './components/MessageWindow'
import ExploreDirections from './components/ExploreDirections'
import ActionButtons from './components/ActionButtons'
import BattleSystem from './components/BattleSystem'

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "🌆 NeoTerra RPG에 오신 걸 환영합니다!" }
  ])
  const [loading, setLoading] = useState(false)
  const [showDirections, setShowDirections] = useState(false)

  // 플레이어 상태
  const [playerStatus, setPlayerStatus] = useState({
    hp: 100,
    maxHp: 100,
    position: { x: 50, y: 50 },
    actionPoints: { current: 50, max: 50 },
    inventory: []
  })

  // 전투 상태
  const [inBattle, setInBattle] = useState(false)
  const [battleLog, setBattleLog] = useState([])

  // enemy 기본 객체 추가
  const [enemy, setEnemy] = useState({
    name: "야생 돌연변이",
    hp: 50,
    maxHp: 50
  })

  const WORLD_MIN = 1, WORLD_MAX = 100
  const messagesEndRef = useRef(null)

  // 탐색 시 적 조우 확률
  const moveDirection = (dir) => {
    if (playerStatus.actionPoints.current <= 0) return

    let newPos = { ...playerStatus.position }
    if (dir === '북' && newPos.y < WORLD_MAX) newPos.y++
    if (dir === '남' && newPos.y > WORLD_MIN) newPos.y--
    if (dir === '동' && newPos.x < WORLD_MAX) newPos.x++
    if (dir === '서' && newPos.x > WORLD_MIN) newPos.x--

    setPlayerStatus(prev => ({
      ...prev,
      position: newPos,
      actionPoints: { ...prev.actionPoints, current: prev.actionPoints.current - 1 }
    }))

    // 30% 확률로 적 조우
    if (Math.random() < 0.3) {
      startBattle()
    } else {
      setMessages(prev => [...prev, { role: "assistant", content: `${dir}쪽으로 이동했다.` }])
      setShowDirections(false)
    }
  }

  // 전투 시작
  const startBattle = () => {
    const newEnemy = { name: "야생 돌연변이", hp: 50, maxHp: 50 }
    setEnemy(newEnemy)
    setInBattle(true)

    const logs = []
    let turn = 1
    let playerHp = playerStatus.hp
    let enemyHp = newEnemy.hp

    while (playerHp > 0 && enemyHp > 0 && turn < 50) {
      const playerDmg = Math.floor(Math.random() * 6) + 5 // 5~10
      const enemyDmg = Math.floor(Math.random() * 6) + 5 // 5~10

      enemyHp = Math.max(0, enemyHp - playerDmg)
      playerHp = Math.max(0, playerHp - enemyDmg)

      logs.push(`턴 ${turn}: 플레이어가 ${playerDmg} 데미지를 입혔다. 적 HP: ${enemyHp}`)
      logs.push(`턴 ${turn}: 적이 ${enemyDmg} 데미지를 입혔다. 플레이어 HP: ${playerHp}`)

      turn++
    }

    if (playerHp <= 0 && enemyHp <= 0) {
      logs.push("⚔️ 무승부! 서로 쓰러졌다.")
    } else if (playerHp <= 0) {
      logs.push("💀 플레이어 패배!")
    } else {
      logs.push("🏆 플레이어 승리!")
    }

    setBattleLog(logs)
    setPlayerStatus(prev => ({ ...prev, hp: playerHp }))
    setEnemy({ ...newEnemy, hp: enemyHp })
  }

  // 전투 종료
  const endBattle = () => {
    setInBattle(false)
    setBattleLog([])
    setEnemy({ name: "야생 돌연변이", hp: 50, maxHp: 50 }) // 기본 enemy로 리셋
    setMessages(prev => [...prev, { role: "assistant", content: "전투가 끝났다. 다시 탐색할 수 있다." }])
  }

  const directions = []
  if (playerStatus.position.y < WORLD_MAX) directions.push('북')
  if (playerStatus.position.y > WORLD_MIN) directions.push('남')
  if (playerStatus.position.x < WORLD_MAX) directions.push('동')
  if (playerStatus.position.x > WORLD_MIN) directions.push('서')

  return (
    <div className={styles.layout}>
      <div className={styles.top1}><h3>🌆 NeoTerra RPG</h3></div>
      <div className={styles.top2}><PlayerStatusBar playerStatus={playerStatus} /></div>

      <div className={styles.left}>
        <ActionButtons
          toggleExplore={() => setShowDirections(prev => !prev)}
          rest={() => setPlayerStatus(prev => ({
            ...prev,
            actionPoints: {
              ...prev.actionPoints,
              current: Math.min(prev.actionPoints.current + (Math.floor(Math.random() * 5) + 1), prev.actionPoints.max)
            }
          }))}
          sendMessage={(msg) => setMessages(prev => [...prev, { role: "user", content: msg }])}
          loading={loading}
          playerStatus={playerStatus}
        />

        {showDirections && !inBattle && (
          <ExploreDirections
            directions={directions}
            moveDirection={moveDirection}
            setShowDirections={setShowDirections}
            loading={loading}
          />
        )}
      </div>

      <div className={styles.center}>
        {inBattle && enemy ? (
          <BattleSystem
            player={playerStatus}
            enemy={enemy}
            battleLog={battleLog}
            onEnd={endBattle}
          />
        ) : (
          <MessageWindow messages={messages} loading={loading} messagesEndRef={messagesEndRef} />
        )}
      </div>

      <div className={styles.right}></div>
      <div className={styles.farLeft}></div>
      <div className={styles.farRight}></div>
      <div className={styles.bottom}><p>하단 HUD / 로그 영역</p></div>
    </div>
  )
}

export default App
