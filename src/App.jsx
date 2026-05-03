import { useEffect, useMemo, useState } from 'react'
import logoUms from './assets/4.UMS.png'
import backgroundGedung from './assets/gedung.webp'
import './App.css'
import { fetchSolarTrackerData, sendButtonCommand } from './utils/solarTrackerApi'

const INITIAL_DATA = {
  ARUS: 0,
  DAYA: 0,
  SUHU: 0,
  TEGANGAN: 0,
  BUTTON: '',
}

const metricCards = [
  {
    key: 'TEGANGAN',
    label: 'Tegangan',
    unit: 'V',
    icon: 'bolt',
    accent: 'primary',
    live: true,
  },
  {
    key: 'ARUS',
    label: 'Arus',
    unit: 'A',
    icon: 'electric_bolt',
    accent: 'primary',
    live: true,
  },
  {
    key: 'DAYA',
    label: 'Daya',
    unit: 'W',
    icon: 'speed',
    accent: 'primary',
    live: true,
  },
]

const previewCards = [
  {
    key: 'TEGANGAN',
    label: 'Tegangan',
    unit: 'V',
    icon: 'bolt',
  },
  {
    key: 'ARUS',
    label: 'Arus',
    unit: 'A',
    icon: 'electric_bolt',
  },
  {
    key: 'DAYA',
    label: 'Daya',
    unit: 'W',
    icon: 'speed',
  },
]

function formatValue(value, fractionDigits = 1) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : fractionDigits,
  }).format(value)
}

function App() {
  const [data, setData] = useState(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState('Memuat...')
  const [buttonStatus, setButtonStatus] = useState('IDLE')
  const [sending, setSending] = useState(false)
  const displayStatus = data.BUTTON ?? buttonStatus

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        const nextData = await fetchSolarTrackerData()

        if (!active) {
          return
        }

        setData(nextData)
        setError('')
        setLoading(false)
        setLastUpdated(new Date().toLocaleTimeString('id-ID'))
      } catch (requestError) {
        if (!active) {
          return
        }

        setError(requestError instanceof Error ? requestError.message : 'Gagal memuat data')
        setLoading(false)
      }
    }

    loadData()
    const intervalId = window.setInterval(loadData, 5000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  const usageSummary = useMemo(
    () => [
      {
        label: 'Tegangan',
        value: `${formatValue(data.TEGANGAN, 1)} V`,
      },
      {
        label: 'Arus',
        value: `${formatValue(data.ARUS, 1)} A`,
      },
      {
        label: 'Daya',
        value: `${formatValue(data.DAYA, 0)} W`,
      },
      {
        label: 'Suhu Panel',
        value: `${formatValue(data.SUHU, 1)} °C`,
      },
    ],
    [data],
  )

  const handleButtonPress = async () => {
    setSending(true)
    setButtonStatus('MENGIRIM')

    try {
      await sendButtonCommand('ON')
      // optimistically update local data BUTTON status
      setData((d) => ({ ...d, BUTTON: 'ON' }))
      setButtonStatus('TERKIRIM')
      setError('')
      setLastUpdated(new Date().toLocaleTimeString('id-ID'))
    } catch (requestError) {
      setButtonStatus('GAGAL')
      setError(requestError instanceof Error ? requestError.message : 'Gagal mengirim perintah')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="dashboard-app">
      <header className="topbar">
        <div className="topbar__brand">
          <img className="topbar__logo" src={logoUms} alt="Logo UMS" />
          <div>
            <p className="topbar__eyebrow">UMS Solar Tracker</p>
            <h1 className="topbar__title">Sistem Monitoring Solar Tracker</h1>
          </div>
        </div>

        <div className="topbar__meta">
          <span className="topbar__pill">Realtime Dashboard</span>
          <span className="topbar__clock">Update {lastUpdated}</span>
        </div>
      </header>

      <main className="dashboard-layout">
        <section className="hero-card">
          <div
            className="hero-card__media"
            style={{ backgroundImage: `url(${backgroundGedung})` }}
            aria-hidden="true"
          />
          <div className="hero-card__overlay" aria-hidden="true" />
          <div className="hero-card__content">
            <h1 className="hero-card__welcome">Welcome To Dashboard Sistem Solar Tracker</h1>
            <p className="hero-card__eyebrow">Monitoring Real-time</p>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-column dashboard-column--main">
            <section className="panel-section">
              <div className="section-header">
                <div>
                  <p className="section-header__eyebrow">Live Data</p>
                  <h2>Data Sistem Solar Tracker</h2>
                </div>
                <span className={`status-chip ${loading ? 'status-chip--loading' : ''}`}>
                  {loading ? 'MEMUAT' : 'LIVE DATA'}
                </span>
              </div>

              {error ? <div className="alert-box">{error}</div> : null}

              <div className="metric-grid">
                {metricCards.map((metric) => (
                  <article key={metric.key} className={`metric-card metric-card--${metric.accent}`}>
                    <div className="metric-card__header">
                      <span className="metric-card__label">{metric.label}</span>
                      <span className="material-symbols-outlined metric-card__icon">
                        {metric.icon}
                      </span>
                    </div>
                    <div className="metric-card__value-row">
                      <strong className="metric-card__value">
                        {formatValue(data[metric.key], metric.key === 'DAYA' ? 0 : 1)}
                      </strong>
                      <span className="metric-card__unit">{metric.unit}</span>
                    </div>
                    <div className="metric-card__footer">
                      {!['TEGANGAN', 'ARUS', 'DAYA'].includes(metric.key) && (
                        <span className="metric-card__progress">
                          <span className="metric-card__progress-fill" style={{ width: metric.live ? '36%' : '22%' }} />
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel-section panel-section--muted">
              <div className="section-header section-header--compact">
                <div>
                  <p className="section-header__eyebrow">Pembanding</p>
                  <h2>Data Non Sistem Solar Tracker</h2>
                </div>
              </div>

              <div className="preview-grid">
                {previewCards.map((metric) => (
                  <article key={metric.key} className="preview-card">
                    <div className="preview-card__header">
                      <span className="preview-card__label">{metric.label}</span>
                      <span className="material-symbols-outlined preview-card__icon">{metric.icon}</span>
                    </div>
                    <div className="preview-card__value-row">
                      <strong>{formatValue(data[metric.key], metric.key === 'DAYA' ? 0 : 1)}</strong>
                      <span>{metric.unit}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <aside className="dashboard-column dashboard-column--side">
            <section className="panel-card panel-card--control">
              <div className="section-header section-header--stacked">
                <div>
                  <p className="section-header__eyebrow">Panel Kontrol</p>
                  <h2>Panel Kontrol &amp; Ringkasan</h2>
                </div>
              </div>

              <article className="control-metric">
                <div className="control-metric__header">
                  <span className="material-symbols-outlined control-metric__icon">thermometer</span>
                  <span className="control-metric__label">Suhu Panel</span>
                </div>
                <div className="control-metric__value-row">
                  <strong>{formatValue(data.SUHU, 1)}</strong>
                  <span>°C</span>
                </div>
                <p className="control-metric__hint">Kondisi panel yang dipantau secara berkala.</p>
              </article>

              <div className="control-list">
                <div className="control-item">
                  <div>
                    <p className="control-item__title">Pembersih Panel</p>
                    <p className="control-item__subtitle">
                      STATUS: <span className={`control-item__status ${displayStatus === 'OFF' ? 'status-off' : displayStatus === 'ON' ? 'status-on' : ''}`}>{displayStatus}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="control-button"
                    onClick={handleButtonPress}
                    disabled={sending}
                  >
                    {sending ? 'Mengirim...' : 'Aktifkan'}
                  </button>
                </div>

              </div>
            </section>
          </aside>
        </div>

        <section className="panel-card panel-card--info info-full">
          <div className="section-header section-header--compact">
            <div>
              <p className="section-header__eyebrow">Informasi</p>
              <h2>Informasi Tambahan</h2>
            </div>
          </div>

          <div className="info-text">
            <p>
              Solar tracker adalah sistem yang dirancang untuk mengarahkan panel surya agar
              selalu mengikuti posisi matahari sepanjang hari. Tujuannya agar sinar matahari
              jatuh lebih tegak lurus ke permukaan panel, sehingga energi listrik yang dihasilkan
              menjadi lebih maksimal dibandingkan panel yang posisinya tetap.
            </p>
            <p>
              Secara umum, sistem ini menggunakan sensor cahaya (photodiode/photocell) atau
              perhitungan astronomi/waktu untuk menentukan posisi matahari, lalu motor akan
              menggerakkan panel ke arah yang paling optimal. Sistem semacam ini biasa diterapkan
              pada pembangkit listrik tenaga surya untuk meningkatkan efisiensi dan produksi energi.
            </p>
            <p>
              Pada dashboard ini, data diambil dari Firebase Realtime Database dan diperbarui
              secara berkala untuk memberi gambaran kondisi sistem dan status aktuator.
            </p>
          </div>

          <div className="info-footer">
            <span>Last Update</span>
            <strong>{lastUpdated}</strong>
          </div>
        </section>

        <footer className="site-footer">
          <p>© 2026 Universitas Muhammadiyah Surakarta - Teknik Elektro</p>
        </footer>
      </main>

      <nav className="mobile-nav" aria-label="Navigasi mobile">
        <button type="button" className="mobile-nav__item mobile-nav__item--active">
          <span className="material-symbols-outlined">grid_view</span>
          <span>Home</span>
        </button>
        <button type="button" className="mobile-nav__item">
          <span className="material-symbols-outlined">insights</span>
          <span>Metrics</span>
        </button>
        <button type="button" className="mobile-nav__item">
          <span className="material-symbols-outlined">settings_remote</span>
          <span>Control</span>
        </button>
        <button type="button" className="mobile-nav__item">
          <span className="material-symbols-outlined">history</span>
          <span>Logs</span>
        </button>
      </nav>
    </div>
  )
}

export default App
