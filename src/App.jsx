import { useState, useRef, useEffect } from 'react'
import styles from './layout.module.css'
import PlayerStatusBar from './components/PlayerStatusBar'
import MessageWindow from './components/MessageWindow'
import ExploreDirections from './components/ExploreDirections'
import ActionButtons from './components/ActionButtons'
import InputBox from './components/InputBox'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "🌆 NeoTerra RPG에 오신 걸 환영합니다!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [playerStatus, setPlayerStatus] = useState({
    hp: 100,
    maxHp: 100,
    position: { x: 50, y: 50 },
    actionPoints: { current: 50, max: 50 },
    inventory: ["녹슨 나이프", "물통"]
  })

  const messagesEndRef = useRef(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const WORLD_MIN = 1, WORLD_MAX = 100

  const sendMessage = async (customContent = null) => {
    const content = customContent || input
    if (!content.trim() || loading) return
    const userMsg = { role: "user", content }
    setMessages(prev => [...prev, userMsg])
    if (!customContent) setInput('')
    setLoading(true)

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            { role: "system", content: `너는 포스트 아포칼립스 RPG의 게임 마스터다. 현재 위치: ${playerStatus.position.x}:${playerStatus.position.y}` },
            ...messages,
            userMsg
          ],
          temperature: 0.85,
          max_tokens: 400
        })
      })
      const data = await res.json()
      const aiMsg = { role: "assistant", content: data.choices[0].message.content }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ 오류: " + err.message }])
    }
    setLoading(false)
  }

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
    sendMessage(`${dir}쪽으로 이동한다`)
    setShowDirections(false)
  }

  const rest = () => {
    const recover = Math.floor(Math.random() * 5) + 1
    setPlayerStatus(prev => ({
      ...prev,
      actionPoints: {
        ...prev.actionPoints,
        current: Math.min(prev.actionPoints.current + recover, prev.actionPoints.max)
      }
    }))
    sendMessage("휴식을 취한다")
  }

  const toggleExplore = () => {
    if (playerStatus.actionPoints.current <= 0) return
    setShowDirections(prev => !prev)
    if (!showDirections) {
      setMessages(prev => [...prev, { role: "assistant", content: "🧭 이동 가능한 방향이 보입니다." }])
    }
  }

  const directions = []
  if (playerStatus.position.y < WORLD_MAX) directions.push('북')
  if (playerStatus.position.y > WORLD_MIN) directions.push('남')
  if (playerStatus.position.x < WORLD_MAX) directions.push('동')
  if (playerStatus.position.x > WORLD_MIN) directions.push('서')

  return (
  <div className={styles.layout}>
    <div className={styles.farLeft}></div>

    <div className={styles.top1}>
      <h3>🌆 NeoTerra RPG</h3>
    </div>

    <div className={styles.top2}>
      <PlayerStatusBar playerStatus={playerStatus} />
    </div>

    <div className={styles.left}>
      <ActionButtons
        toggleExplore={toggleExplore}
        rest={rest}
        sendMessage={sendMessage}
        loading={loading}
        playerStatus={playerStatus}
      />
    </div>

    <div className={styles.center}>
      <MessageWindow messages={messages} loading={loading} messagesEndRef={messagesEndRef} />
      {showDirections && (
        <ExploreDirections
          directions={directions}
          moveDirection={moveDirection}
          setShowDirections={setShowDirections}
          loading={loading}
        />
      )}
      {/* 입력창을 중1 영역으로 이동 */}
      <InputBox
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        loading={loading}
      />
    </div>

    <div className={styles.right}></div>
    <div className={styles.farRight}></div>

    <div className={styles.bottom}>
      <p>하단 HUD / 로그 영역</p>
    </div>
  </div>
  )
}

export default App
