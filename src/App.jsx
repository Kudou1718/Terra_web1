import { useState, useRef, useEffect } from 'react'
import PlayerStatusBar from './components/PlayerStatusBar'
import MessageWindow from './components/MessageWindow'
import ExploreDirections from './components/ExploreDirections'
import ActionButtons from './components/ActionButtons'
import InputBox from './components/InputBox'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "🌆 포스트 아포칼립스 세계 NeoTerra에 오신 걸 환영합니다.\n폐허가 된 도시, 변이된 생물, 희귀한 자원이 기다리고 있어요.\n현재 위치: 50:50 (세계 중앙). 행동력: 50/50.\n무엇을 하시겠어요?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDirections, setShowDirections] = useState(false)
  const [playerStatus, setPlayerStatus] = useState({
    hp: 100,
    maxHp: 100,
    position: { x: 50, y: 50 },
    actionPoints: { current: 50, max: 50 },
    inventory: ["녹슨 나이프", "물통 (반 정도 차있음)"]
  })

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const WORLD_MIN = 1
  const WORLD_MAX = 100

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
            { role: "system", content: `너는 포스트 아포칼립스 텍스트 RPG의 게임 마스터다. 현재 위치: ${playerStatus.position.x}:${playerStatus.position.y}. 세계는 ${WORLD_MIN}:${WORLD_MIN}부터 ${WORLD_MAX}:${WORLD_MAX}까지.` },
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

      if (Math.random() < 0.3) {
        const newItem = ["탄약 5발", "붕대", "통조림", "지도 조각"][Math.floor(Math.random()*4)]
        setPlayerStatus(prev => ({
          ...prev,
          inventory: [...prev.inventory, newItem]
        }))
        setMessages(prev => [...prev, { role: "assistant", content: `🎒 발견! "${newItem}"을(를) 인벤토리에 추가했습니다.` }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ 연결 오류: " + err.message }])
    }
    setLoading(false)
  }

  const moveDirection = (direction) => {
    if (playerStatus.actionPoints.current <= 0) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ 행동력이 부족합니다! 먼저 휴식을 취하세요." }])
      return
    }

    let newPos = { ...playerStatus.position }
    let validMove = true

    switch (direction) {
      case '북': newPos.y >= WORLD_MAX ? validMove = false : newPos.y += 1; break
      case '남': newPos.y <= WORLD_MIN ? validMove = false : newPos.y -= 1; break
      case '동': newPos.x >= WORLD_MAX ? validMove = false : newPos.x += 1; break
      case '서': newPos.x <= WORLD_MIN ? validMove = false : newPos.x -= 1; break
      default: validMove = false
    }

    if (validMove) {
      setPlayerStatus(prev => ({
        ...prev,
        position: newPos,
        actionPoints: { ...prev.actionPoints, current: prev.actionPoints.current - 1 }
      }))
      sendMessage(`${direction}쪽으로 이동한다`)
      setShowDirections(false)
    } else {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${direction}쪽은 세계의 끝입니다.` }])
    }
  }

  const rest = () => {
    if (loading) return
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
    if (playerStatus.actionPoints.current <= 0) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ 행동력이 부족해 탐색할 수 없습니다." }])
      return
    }
    setShowDirections(prev => !prev)
    if (!showDirections) {
      setMessages(prev => [...prev, { role: "assistant", content: "🧭 주변을 살펴보니 이동 가능한 방향이 보입니다." }])
    }
  }

  const directions = []
  if (playerStatus.position.y < WORLD_MAX) directions.push('북')
  if (playerStatus.position.y > WORLD_MIN) directions.push('남')
  if (playerStatus.position.x < WORLD_MAX) directions.push('동')
  if (playerStatus.position.x > WORLD_MIN) directions.push('서')

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', background: '#000', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#ff6600' }}>🌆 NeoTerra RPG</h1>

      <PlayerStatusBar playerStatus={playerStatus} />
      <MessageWindow messages={messages} loading={loading} messagesEndRef={messagesEndRef} />

      {showDirections && (
        <ExploreDirections
          directions={directions}
          moveDirection={moveDirection}
          setShowDirections={setShowDirections}
          loading={loading}
        />
      )}

      <ActionButtons
        toggleExplore={toggleExplore}
        rest={rest}
        sendMessage={sendMessage}
        loading={loading}
        playerStatus={playerStatus}
      />

      <InputBox
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        loading={loading}
      />
    </div>
  )
}

export default App
