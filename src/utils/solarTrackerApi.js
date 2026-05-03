const API_URL = 'https://sistem-solar-tracker-default-rtdb.firebaseio.com/Data.json'

export async function fetchSolarTrackerData() {
  const response = await fetch(API_URL, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Gagal mengambil data (${response.status})`)
  }

  const payload = await response.json()

  return {
    ARUS: Number(payload?.ARUS ?? 0),
    DAYA: Number(payload?.DAYA ?? 0),
    SUHU: Number(payload?.SUHU ?? 0),
    TEGANGAN: Number(payload?.TEGANGAN ?? 0),
    BUTTON: String(payload?.BUTTON ?? ''),
  }
}

export async function sendButtonCommand(value) {
  const response = await fetch(API_URL, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ BUTTON: value }),
  })

  if (!response.ok) {
    throw new Error(`Gagal mengirim perintah (${response.status})`)
  }

  return response.json()
}