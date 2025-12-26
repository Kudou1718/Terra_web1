import { useState } from 'react'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY  // 나중에 환경 변수로

function App() {
  const [messages, setMessages] = useState([
    { role: "system", content: "포스트 아포칼립스 세계 NeoTerra에 오신 걸 환영합니다. 폐허가 된 도시, 변이된 생물, 희귀 자원이 있는 세계입니다." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
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
          messages: [...messages, userMsg],
          temperature: 0.8,
          max_tokens: 300
        })
      })

      const data = await res.json()
      const aiMsg = { role: "assistant", content: data.choices[0].message.content }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "오류 발생: " + err.message }])
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🌆 NeoTerra RPG (테스트 버전)</h1>
      <div style={{ border: '1px solid #444', height: '60vh', overflowY: 'auto', padding: '10px', background: '#111', color: '#fff', borderRadius: '8px' }}>
        {messages.slice(1).map((msg, i) => (
          <p key={i} style={{ margin: '10px 0', color: msg.role === 'user' ? '#8f8' : '#ff8' }}>
            <strong>{msg.role === 'user' ? '플레이어' : 'GM'}:</strong> {msg.content}
          </p>
        ))}
        {loading && <p>GM이 생각 중...</p>}
      </div>
      <div style={{ marginTop: '20px', display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="무슨 행동을 할까? (예: 폐허 건물을 탐색한다)"
          style={{ flex: 1, padding: '10px', fontSize: '16px' }}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: '10px 20px', fontSize: '16px' }}>
          전송
        </button>
      </div>
    </div>
  )
}

export default App