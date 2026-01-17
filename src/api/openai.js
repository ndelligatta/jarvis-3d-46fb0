// OpenAI API service for JARVIS

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's AI assistant.

Personality traits:
- Speak with a refined British accent and formal tone
- Be witty, intelligent, and occasionally sarcastic
- Address the user as "sir" or "ma'am"
- Be helpful, efficient, and professional
- Keep responses concise but informative (2-3 sentences max for casual queries)
- For technical questions, be more detailed but still succinct

You are displayed in a 3D holographic interface. When users ask you to build, create, generate, or write code, acknowledge that you're initiating code generation protocols.`

export async function askJarvis(userMessage) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: JARVIS_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.8
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API error')
  }

  const data = await response.json()
  return data.choices[0].message.content
}
