import { useState } from 'react'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "🌆 포스트 아포칼립스 세계 NeoTerra에 오신 걸 환영합니다.\n폐허가 된 도시, 변이된 생물, 희귀한 자원이 기다리고 있어요.\n현재 위치: 50:50 (세계 중앙). 행동력: 50/50.\n무엇을 하시겠어요?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [playerStatus, setPlayerStatus] = useState({
    hp: 100,
    maxHp: 100,
    position: { x: 50, y: 50 },  // 초기 위치: 세계 중앙
    actionPoints: { current: 50, max: 50 },
    inventory: ["녹슨 나이프", "물통 (반 정도 차있음)"]
  })

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
            { role: "system", content: `너는 포스트 아포칼립스 텍스트 RPG의 게임 마스터다. 생생하고 몰입감 있는 서사로 응답해. 플레이어의 행동에 따라 세계가 변하고, 위험과 보상이 있다. 현재 플레이어 위치: ${playerStatus.position.x}:${playerStatus.position.y}. 세계는 ${WORLD_MIN}:${WORLD_MIN}부터 ${WORLD_MAX}:${WORLD_MAX}까지 그리드. 위치에 따라 환경 변함 (예: 낮은 x/y = 황무지, 높은 x/y = 도시 폐허).` },
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

      // 간단한 아이템 획득 로직 예시 (실제론 AI 응답 파싱해서 구현)
      if (Math.random() < 0.3) {  // 30% 확률로 아이템 추가 (테스트용)
        const newItem = ["탄약 5발", "붕대", "통조림", "지도 조각"][Math.floor(Math.random()*4)]
        setPlayerStatus(prev => ({
          ...prev,
          inventory: [...prev.inventory, newItem]
        }))
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ 연결 오류: " + err.message }])
    }
    setLoading(false)
  }

  const moveDirection = (direction) => {
    if (playerStatus.actionPoints.current <= 0) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ 행동력이 부족합니다! 휴식을 취하세요." }])
      return
    }

    let newPos = { ...playerStatus.position }
    let moveDesc = ''

    switch (direction) {
      case '북':
        if (newPos.y < WORLD_MAX) {
          newPos.y += 1
          moveDesc = '북쪽으로 이동한다'
        }
        break
      case '남':
        if (newPos.y > WORLD_MIN) {
          newPos.y -= 1
          moveDesc = '남쪽으로 이동한다'
        }
        break
      case '동':
        if (newPos.x < WORLD_MAX) {
          newPos.x += 1
          moveDesc = '동쪽으로 이동한다'
        }
        break
      case '서':
        if (newPos.x > WORLD_MIN) {
          newPos.x -= 1
          moveDesc = '서쪽으로 이동한다'
        }
        break
      default:
        return
    }

    if (moveDesc) {
      setPlayerStatus(prev => ({
        ...prev,
        position: newPos,
        actionPoints: { ...prev.actionPoints, current: prev.actionPoints.current - 1 }
      }))
      sendMessage(moveDesc)
    } else {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${direction}쪽은 세계 끝입니다. 더 갈 수 없어요.` }])
    }
  }

  const quickActions = [
    "주변을 탐색한다",
    "폐허 건물 안으로 들어간다",
    "휴식을 취한다",
    "인벤토리를 확인한다"
  ]

  // 동적 방향 버튼: 경계에 따라 버튼 숨김
  const directions = []
  if (playerStatus.position.y < WORLD_MAX) directions.push('북')
  if (playerStatus.position.y > WORLD_MIN) directions.push('남')
  if (playerStatus.position.x < WORLD_MAX) directions.push('동')
  if (playerStatus.position.x > WORLD_MIN) directions.push('서')

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', background: '#000', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#ff6600' }}>🌆 NeoTerra RPG</h1>
      
      {/* 플레이어 상태바 */}
      <div style={{ background: '#111', padding: '10px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>❤️ HP: {playerStatus.hp}/{playerStatus.maxHp}</span>
          <span>📍 위치: {playerStatus.position.x}:{playerStatus.position.y}</span>
          <span>⚡ 행동력: {playerStatus.actionPoints.current}/{playerStatus.actionPoints.max}</span>
        </div>
        <div style={{ marginTop: '8px' }}>
          🎒 인벤토리: {playerStatus.inventory.join(" | ")}
        </div>
      </div>

      {/* 메시지 창 */}
      <div style={{ border: '1px solid #0f0', height: '55vh', overflowY: 'auto', padding: '15px', background: '#0a0a0a', borderRadius: '8px', marginBottom: '15px' }}>
        {messages.map((msg, i) => (
          <p key={i} style={{ margin: '12px 0', color: msg.role === 'user' ? '#88ff88' : '#ffff88' }}>
            <strong>{msg.role === 'user' ? '▶ 당신' : '🧑‍💼 GM'}:</strong> {msg.content}
          </p>
        ))}
        {loading && <p style={{ color: '#ff6600' }}>GM이 세계를 생성 중...</p>}
      </div>

      {/* 방향 이동 버튼 */}
      <div style={{ marginBottom: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {directions.map(dir => (
          <button
            key={dir}
            onClick={() => moveDirection(dir)}
            disabled={loading || playerStatus.actionPoints.current <= 0}
            style={{ padding: '8px 12px', background: '#003300', color: '#0f0', border: '1px solid #0f0', borderRadius: '4px' }}
          >
            {dir}쪽으로 이동
          </button>
        ))}
      </div>

      {/* 빠른 행동 버튼 */}
      <div style={{ marginBottom: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {quickActions.map(action => (
          <button
            key={action}
            onClick={() => sendMessage(action)}
            disabled={loading || (action !== "휴식을 취한다" && playerStatus.actionPoints.current <= 0)}
            style={{ padding: '8px 12px', background: '#003300', color: '#0f0', border: '1px solid #0f0', borderRadius: '4px' }}
          >
            {action}
          </button>
        ))}
      </div>

      {/* 자유 입력 */}
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="직접 행동 입력 (예: 문을 부수고 들어간다)"
          style={{ flex: 1, padding: '12px', fontSize: '16px', background: '#111', color: '#0f0', border: '1px solid #0f0' }}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading}
          style={{ padding: '12px 20px', background: '#003300', color: '#0f0', border: '1px solid #0f0', fontSize: '16px' }}
        >
          전송
        </button>
      </div>
    </div>
  )
}

export default App