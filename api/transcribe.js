function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function requireString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'method_not_allowed' })
  }

  try {
    const {
      provider = 'custom',
      apiKey,
      endpoint,
      model,
      audioBase64,
      mimeType = 'audio/webm',
      language = 'zh',
    } = req.body || {}

    const cleanKey = requireString(apiKey)
    const cleanEndpoint = requireString(endpoint)
    const cleanModel = requireString(model)
    const cleanAudio = requireString(audioBase64)

    if (!cleanKey) return json(res, 400, { error: 'missing_api_key' })
    if (!cleanAudio) return json(res, 400, { error: 'missing_audio' })

    if (provider === 'openai') {
      const buffer = Buffer.from(cleanAudio, 'base64')
      const form = new FormData()
      form.append('file', new Blob([buffer], { type: mimeType }), 'miaotu-voice.webm')
      form.append('model', cleanModel || 'whisper-1')
      if (language) form.append('language', language)

      const response = await fetch(cleanEndpoint || 'https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${cleanKey}` },
        body: form,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) return json(res, response.status, { error: data.error?.message || 'openai_transcription_failed' })
      return json(res, 200, { text: data.text || '' })
    }

    if (!cleanEndpoint) return json(res, 400, { error: 'missing_endpoint' })

    const response = await fetch(cleanEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify({ audioBase64: cleanAudio, mimeType, language, model: cleanModel }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return json(res, response.status, { error: data.error?.message || data.error || 'custom_transcription_failed' })
    return json(res, 200, { text: data.text || data.transcript || data.result?.text || '' })
  } catch (error) {
    return json(res, 500, { error: error.message || 'transcription_failed' })
  }
}
