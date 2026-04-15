'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const orb3Ref = useRef<HTMLDivElement>(null)
  const carouselTrackRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  /* ── Orb parallax ── */
  useEffect(() => {
    const pos = { o1: { x: 0, y: 0 }, o2: { x: 0, y: 0 }, o3: { x: 0, y: 0 } }

    function applyOrbs() {
      if (orb1Ref.current) orb1Ref.current.style.transform = `translate(${pos.o1.x}px,${pos.o1.y}px)`
      if (orb2Ref.current) orb2Ref.current.style.transform = `translate(${pos.o2.x}px,${pos.o2.y}px)`
      if (orb3Ref.current) orb3Ref.current.style.transform = `translate(${pos.o3.x}px,${pos.o3.y}px)`
    }

    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = (e.clientX - cx) / cx
      const dy = (e.clientY - cy) / cy
      pos.o1.x = dx * 30;  pos.o1.y = dy * 24
      pos.o2.x = dx * -24; pos.o2.y = dy * -20
      pos.o3.x = dx * 16;  pos.o3.y = dy * 16
      applyOrbs()
    }

    let lastSY = 0
    const onScroll = () => {
      const sy = window.scrollY
      const d = sy - lastSY
      lastSY = sy
      pos.o1.y += d * 0.18
      pos.o2.y -= d * 0.14
      pos.o3.y += d * 0.08
      applyOrbs()
    }

    document.addEventListener('mousemove', onMouseMove)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  /* ── Scroll reveal ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  /* ── Nav scrolled state ── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Close mobile nav on resize ── */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900 && isMenuOpen) setIsMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isMenuOpen])

  /* ── Body overflow lock when menu open ── */
  useEffect(() => {
    document.body.classList.toggle('menu-open', isMenuOpen)
  }, [isMenuOpen])

  /* ── Carousel ── */
  useEffect(() => {
    const track = carouselTrackRef.current
    if (!track) return
    const t = track

    const CARD_W = 300 + 18
    let isDragging = false
    let startX = 0
    let scrollStart = 0
    let isPaused = false
    let lastTs = 0
    let pauseTimeout: ReturnType<typeof setTimeout> | null = null
    const SCROLL_SPEED = 42

    const originalCards = Array.from(t.querySelectorAll('.c-card'))
    const totalCards = originalCards.length
    if (!totalCards) return

    // Duplicate cards for seamless loop
    for (let i = totalCards - 1; i >= 0; i--) {
      t.insertBefore(originalCards[i].cloneNode(true), t.firstChild)
    }
    originalCards.forEach((card) => t.appendChild(card.cloneNode(true)))

    const LOOP_W = CARD_W * totalCards
    t.scrollLeft = LOOP_W

    function wrapScroll() {
      if (t.scrollLeft <= 0) t.scrollLeft += LOOP_W
      else if (t.scrollLeft >= LOOP_W * 2) t.scrollLeft -= LOOP_W
    }

    function resumeSoon(delay = 1400) {
      if (pauseTimeout) clearTimeout(pauseTimeout)
      pauseTimeout = setTimeout(() => { isPaused = false }, delay)
    }

    let rafId: number
    function step(ts: number) {
      if (!lastTs) lastTs = ts
      const dt = (ts - lastTs) / 1000
      lastTs = ts
      if (!isPaused && !isDragging) {
        t.scrollLeft += SCROLL_SPEED * dt
        wrapScroll()
      }
      rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)

    const onMouseDown = (e: MouseEvent) => {
      isPaused = true; isDragging = true
      startX = e.clientX; scrollStart = t.scrollLeft
      t.classList.add('grabbing')
    }
    const onMouseUp = () => { isDragging = false; t.classList.remove('grabbing'); resumeSoon() }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      t.scrollLeft = scrollStart - (e.clientX - startX)
      wrapScroll()
    }
    const onMouseEnter = () => { isPaused = true; if (pauseTimeout) clearTimeout(pauseTimeout) }
    const onMouseLeave = () => { isPaused = false; if (pauseTimeout) clearTimeout(pauseTimeout) }

    let touchStartX = 0, touchScrollStart = 0
    const onTouchStart = (e: TouchEvent) => {
      isPaused = true; touchStartX = e.touches[0].clientX; touchScrollStart = t.scrollLeft
    }
    const onTouchMove = (e: TouchEvent) => {
      t.scrollLeft = touchScrollStart - (e.touches[0].clientX - touchStartX); wrapScroll()
    }
    const onTouchEnd = () => resumeSoon()

    t.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    t.addEventListener('mouseenter', onMouseEnter)
    t.addEventListener('mouseleave', onMouseLeave)
    t.addEventListener('touchstart', onTouchStart, { passive: true })
    t.addEventListener('touchmove', onTouchMove, { passive: true })
    t.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      if (pauseTimeout) clearTimeout(pauseTimeout)
      t.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      t.removeEventListener('mouseenter', onMouseEnter)
      t.removeEventListener('mouseleave', onMouseLeave)
      t.removeEventListener('touchstart', onTouchStart)
      t.removeEventListener('touchmove', onTouchMove)
      t.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  function handleNavLink(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith('#')) return
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    if (isMenuOpen) setIsMenuOpen(false)
  }

  return (
    <>
      {/* Parallax orbs */}
      <div className="orb orb-1" ref={orb1Ref} />
      <div className="orb orb-2" ref={orb2Ref} />
      <div className="orb orb-3" ref={orb3Ref} />

      {/* NAV */}
      <header className={`site-header${isScrolled ? ' scrolled' : ''}`}>
        <nav className="site-nav">
          <a href="#inicio" className="nav-logo nav-link" onClick={(e) => handleNavLink(e, '#inicio')}>
            <Image
              src="/imagens/logo-sem-fundo.png"
              alt="DareU"
              width={160}
              height={44}
              style={{ height: '44px', width: 'auto' }}
              priority
            />
          </a>
          <div className="nav-desktop">
            <div className="glass-nav nav-main-links">
              <a href="#inicio" className="nav-link" onClick={(e) => handleNavLink(e, '#inicio')}>Início</a>
              <a href="#solucao" className="nav-link" onClick={(e) => handleNavLink(e, '#solucao')}>O que é</a>
              <a href="#como" className="nav-link" onClick={(e) => handleNavLink(e, '#como')}>Como funciona</a>
              <a href="#desafios" className="nav-link" onClick={(e) => handleNavLink(e, '#desafios')}>Desafios</a>
              <a href="#ranking" className="nav-link" onClick={(e) => handleNavLink(e, '#ranking')}>Ranking</a>
              <a href="#entrar" className="nav-link" onClick={(e) => handleNavLink(e, '#entrar')}>App</a>
            </div>
            <div className="glass-nav">
              <a href="#contato" className="nav-link" onClick={(e) => handleNavLink(e, '#contato')}>Contato</a>
            </div>
          </div>
          <button
            className={`hamburger${isMenuOpen ? ' open' : ''}`}
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={isMenuOpen}
          >
            <span /><span /><span />
          </button>
        </nav>
      </header>

      <div className={`mobile-nav${isMenuOpen ? ' open' : ''}`}>
        <div className="mobile-nav-inner">
          <a href="#inicio" className="mobile-nav-link nav-link" onClick={(e) => handleNavLink(e, '#inicio')}>Início</a>
          <a href="#solucao" className="mobile-nav-link nav-link" onClick={(e) => handleNavLink(e, '#solucao')}>O que é</a>
          <a href="#como" className="mobile-nav-link nav-link" onClick={(e) => handleNavLink(e, '#como')}>Como funciona</a>
          <a href="#desafios" className="mobile-nav-link nav-link" onClick={(e) => handleNavLink(e, '#desafios')}>Desafios</a>
          <a href="#ranking" className="mobile-nav-link nav-link" onClick={(e) => handleNavLink(e, '#ranking')}>Ranking</a>
          <a href="#contato" className="mobile-nav-link nav-link" onClick={(e) => handleNavLink(e, '#contato')}>Contato</a>
        </div>
      </div>

      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="hero-content">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-brand">
                <Image
                  src="/imagens/logo-sem-fundo.png"
                  alt="DareU"
                  width={280}
                  height={70}
                  className="hero-brand-logo"
                  style={{ height: '70px', width: 'auto' }}
                  priority
                />
              </div>
              <h1 className="hero-title">
                Desafie. Comprove.<br />
                <span className="hl">Ganhe dinheiro.</span>
              </h1>
              <p className="hero-sub">
                Uma plataforma onde desafios viram oportunidades reais.
                Crie, aceite, conclua provas e suba no ranking com recompensa de verdade.
              </p>
              <div className="hero-btns">
                <a href="#como" className="btn-primary" onClick={(e) => handleNavLink(e, '#como')}>Conhecer como funciona ↓</a>
                <a href="#contato" className="btn-secondary" onClick={(e) => handleNavLink(e, '#contato')}>Nos Contatar</a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="sol-phone">
                <div className="sp-topnav">
                  <span className="sp-tab sp-tab-active">⬅ Desafios</span>
                  <span className="sp-tab">▶ Provas</span>
                </div>
                <div className="sp-filters">
                  <span className="sp-pill sp-pill-active">🔥 Em alta</span>
                  <span className="sp-pill">$ Maiores</span>
                  <span className="sp-pill">↗ Trending</span>
                </div>
                <div className="sp-feed">
                  <div className="sp-card">
                    <div className="sp-card-header">
                      <div className="sp-avatar" style={{ background: '#e67e22' }}>LS</div>
                      <div className="sp-user">
                        <span className="sp-username">Lucas Silva</span>
                        <span className="sp-handle">@lucassilva · 2h</span>
                      </div>
                      <span className="sp-more">···</span>
                    </div>
                    <div className="sp-tags">
                      <span className="sp-tag-cat">🫣 Vergonha Alheia</span>
                      <span className="sp-tag-price">$ R$ 150</span>
                    </div>
                    <div className="sp-title">Gritar &quot;EU SOU O MELHOR&quot; no meio do shopping</div>
                    <div className="sp-desc">Tem que ser no shopping lotado, no meio da praça de alimentação. Filmar tudo e postar a reação das pessoas.</div>
                    <button className="sp-btn" type="button">⚡ Aceitar Desafio — R$ 150</button>
                    <div className="sp-stats">
                      <span>🤍 1342</span><span>💬 289</span><span>🏆 12</span>
                      <span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span>
                    </div>
                  </div>
                  <div className="sp-card">
                    <div className="sp-card-header">
                      <div className="sp-avatar" style={{ background: '#8e44ad' }}>AC</div>
                      <div className="sp-user">
                        <span className="sp-username">Ana Costa</span>
                        <span className="sp-handle">@anacosta · 4h</span>
                      </div>
                      <span className="sp-more">···</span>
                    </div>
                    <div className="sp-tags">
                      <span className="sp-tag-cat">😅 Constrangedor</span>
                      <span className="sp-tag-price">$ R$ 200</span>
                    </div>
                    <div className="sp-title">Pedir o numero de 10 desconhecidos na rua</div>
                    <div className="sp-desc">Deve ser gravado, sem edição. Cada abordagem conta. Não pode ser alguém que você conheça.</div>
                    <button className="sp-btn" type="button">⚡ Aceitar Desafio — R$ 200</button>
                    <div className="sp-stats">
                      <span>🤍 2521</span><span>💬 534</span><span>🏆 8</span>
                      <span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span>
                    </div>
                  </div>
                  <div className="sp-card">
                    <div className="sp-card-header">
                      <div className="sp-avatar" style={{ background: '#27ae60' }}>PS</div>
                      <div className="sp-user">
                        <span className="sp-username">Pedro Santos</span>
                        <span className="sp-handle">@pedrosantos · 6h</span>
                      </div>
                      <span className="sp-more">···</span>
                    </div>
                    <div className="sp-tags">
                      <span className="sp-tag-cat">💪 Coragem</span>
                      <span className="sp-tag-price">$ R$ 100</span>
                    </div>
                    <div className="sp-title">Cantar no karaoke de um bar cheio sem saber a letra</div>
                    <div className="sp-desc">Escolha uma música que você não conheça e cante até o final, sem interrupções.</div>
                    <button className="sp-btn" type="button">⚡ Aceitar Desafio — R$ 100</button>
                    <div className="sp-stats">
                      <span>🤍 987</span><span>💬 143</span><span>🏆 5</span>
                      <span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span>
                    </div>
                  </div>
                </div>
                <div className="sp-bottomnav">
                  <span className="sp-bnav-item sp-bnav-active">🏠<br /><small>Feed</small></span>
                  <span className="sp-bnav-item">🔍<br /><small>Explorar</small></span>
                  <span className="sp-bnav-plus">＋</span>
                  <span className="sp-bnav-item">🔔<br /><small>Alertas</small></span>
                  <span className="sp-bnav-item">👤<br /><small>Perfil</small></span>
                </div>
              </div>
              <div className="hero-chip chip-1">🏆 Ranking</div>
              <div className="hero-chip chip-2">💰 Recompensa</div>
              <div className="hero-chip chip-3">⭐ Destaque</div>
              <div className="hero-chip chip-4">🏅 Badge desbloqueado</div>
              <div className="hero-chip chip-5">✅ Desafio concluído</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="problem" id="problema">
        <div className="problem-inner">
          <div className="problem-header reveal">
            <div className="section-label">O problema</div>
            <h2 className="section-title">Entretenimento e recompensa<br />agora no mesmo lugar</h2>
            <p className="section-sub">Muitas dinâmicas sociais acontecem sem retorno financeiro. O DareU transforma participação em recompensa validada.</p>
          </div>
          <div className="problem-grid">
            <div className="prob-card reveal">
              <span className="prob-icon">🤷</span>
              <h3>Apostas sem recompensa real</h3>
              <p>Muitas apostas sociais não geram retorno real. Aqui a recompensa é financeira e fica reservada antes do início.</p>
            </div>
            <div className="prob-card reveal" style={{ transitionDelay: '.1s' }}>
              <span className="prob-icon">🔒</span>
              <h3>Sem garantia de pagamento</h3>
              <p>Em muitos casos, quem conclui a tarefa não recebe. No DareU, o valor é bloqueado em escrow antes da aceitação.</p>
            </div>
            <div className="prob-card reveal" style={{ transitionDelay: '.2s' }}>
              <span className="prob-icon">🚫</span>
              <h3>Desafios sem controle de risco</h3>
              <p>Conteúdos sem moderação podem gerar risco real. Nossa análise automática de desafios bloqueia conteúdos ilegais, perigosos ou fora das diretrizes, com confirmação humana nas situações críticas.</p>
            </div>
            <div className="prob-card reveal" style={{ transitionDelay: '.3s' }}>
              <span className="prob-icon">📱</span>
              <h3>Falta de rede social específica para desafios</h3>
              <p>Hoje, os desafios ficam espalhados em plataformas genéricas. Falta um espaço dedicado para criar, participar, acompanhar progresso e receber recompensa no mesmo fluxo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="solution" id="solucao">
        <div className="solution-inner">
          <div className="solution-text reveal">
            <div className="section-label">A plataforma</div>
            <h2 className="section-title">Sua rede social<br />de desafios pagos</h2>
            <p className="section-sub">DareU funciona como um feed social, com recompensa vinculada a cada desafio. Você publica, outro usuário participa, envia a comprovação e recebe após validação.</p>
            <div className="solution-list">
              <div className="sol-feat">
                <div className="sol-feat-icon">💸</div>
                <div className="sol-feat-body">
                  <h4>Recompensa bloqueada antes do início</h4>
                  <p>O valor é alocado em escrow no momento da publicação. A transferência ocorre somente após a validação da entrega.</p>
                </div>
              </div>
              <div className="sol-feat">
                <div className="sol-feat-icon">🧠</div>
                <div className="sol-feat-body">
                  <h4>Análise automática de desafios</h4>
                  <p>Cada desafio passa por análise automática antes de ir ao ar. Conteúdo ilegal, +18 ou arriscado é bloqueado na hora.</p>
                </div>
              </div>
              <div className="sol-feat">
                <div className="sol-feat-icon">👁️</div>
                <div className="sol-feat-body">
                  <h4>Análise automática de vídeos no envio</h4>
                  <p>A análise automática de vídeos avalia cada envio e barra provas artificiais. Só conta o que é real.</p>
                </div>
              </div>
              <div className="sol-feat">
                <div className="sol-feat-icon">📲</div>
                <div className="sol-feat-body">
                  <h4>Feed, curtida e ranking</h4>
                  <p>Siga outros participantes, interaja com os desafios em destaque e evolua no ranking da plataforma.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="solution-visual reveal" style={{ transitionDelay: '.2s' }}>
            <div className="sol-glow" />
            <div className="sol-phone">
              <div className="sp-topnav">
                <span className="sp-tab sp-tab-active">⬅ Desafios</span>
                <span className="sp-tab">▶ Provas</span>
              </div>
              <div className="sp-filters">
                <span className="sp-pill sp-pill-active">🔥 Em alta</span>
                <span className="sp-pill">$ Maiores</span>
                <span className="sp-pill">↗ Trending</span>
              </div>
              <div className="sp-feed">
                <div className="sp-card">
                  <div className="sp-card-header">
                    <div className="sp-avatar" style={{ background: '#e67e22' }}>LS</div>
                    <div className="sp-user">
                      <span className="sp-username">Lucas Silva</span>
                      <span className="sp-handle">@lucassilva · 2h</span>
                    </div>
                    <span className="sp-more">···</span>
                  </div>
                  <div className="sp-tags">
                    <span className="sp-tag-cat">🫣 Vergonha Alheia</span>
                    <span className="sp-tag-price">$ R$ 150</span>
                  </div>
                  <div className="sp-title">Gritar &quot;EU SOU O MELHOR&quot; no meio do shopping</div>
                  <div className="sp-desc">Tem que ser no shopping lotado, no meio da praça de alimentação. Filmar tudo e postar a reação das pessoas.</div>
                  <button className="sp-btn" type="button">⚡ Aceitar Desafio — R$ 150</button>
                  <div className="sp-stats">
                    <span>🤍 1342</span><span>💬 289</span><span>🏆 12</span>
                    <span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span>
                  </div>
                </div>
                <div className="sp-card">
                  <div className="sp-card-header">
                    <div className="sp-avatar" style={{ background: '#8e44ad' }}>AC</div>
                    <div className="sp-user">
                      <span className="sp-username">Ana Costa</span>
                      <span className="sp-handle">@anacosta · 4h</span>
                    </div>
                    <span className="sp-more">···</span>
                  </div>
                  <div className="sp-tags">
                    <span className="sp-tag-cat">😅 Constrangedor</span>
                    <span className="sp-tag-price">$ R$ 200</span>
                  </div>
                  <div className="sp-title">Pedir o número de 10 desconhecidos na rua</div>
                  <div className="sp-desc">Tem que ser gravado, sem edição. Cada abordagem conta. Não pode ser gente que você conhece! 😂</div>
                  <button className="sp-btn" type="button">⚡ Aceitar Desafio — R$ 200</button>
                  <div className="sp-stats">
                    <span>🤍 2521</span><span>💬 534</span><span>🏆 8</span>
                    <span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span>
                  </div>
                </div>
                <div className="sp-card">
                  <div className="sp-card-header">
                    <div className="sp-avatar" style={{ background: '#27ae60' }}>PS</div>
                    <div className="sp-user">
                      <span className="sp-username">Pedro Santos</span>
                      <span className="sp-handle">@pedrosantos · 6h</span>
                    </div>
                    <span className="sp-more">···</span>
                  </div>
                  <div className="sp-tags">
                    <span className="sp-tag-cat">💪 Coragem</span>
                    <span className="sp-tag-price">$ R$ 100</span>
                  </div>
                  <div className="sp-title">Cantar no karaokê de um bar cheio sem saber a letra</div>
                  <div className="sp-desc">Escolha uma música que você NÃO conhece e cante até o final. Sem parar, sem desistir. 🎤</div>
                  <button className="sp-btn" type="button">⚡ Aceitar Desafio — R$ 100</button>
                  <div className="sp-stats">
                    <span>🤍 987</span><span>💬 143</span><span>🏆 5</span>
                    <span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span>
                  </div>
                </div>
              </div>
              <div className="sp-bottomnav">
                <span className="sp-bnav-item sp-bnav-active">🏠<br /><small>Feed</small></span>
                <span className="sp-bnav-item">🔍<br /><small>Explorar</small></span>
                <span className="sp-bnav-plus">＋</span>
                <span className="sp-bnav-item">🔔<br /><small>Alertas</small></span>
                <span className="sp-bnav-item">👤<br /><small>Perfil</small></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="how" id="como">
        <div className="how-inner">
          <div className="how-header reveal">
            <div className="section-label">Passo a passo</div>
            <h2 className="section-title">Como funciona<br />do início ao prêmio</h2>
            <p className="section-sub">Do desafio à recompensa: cada etapa é protegida antes da liberação final.</p>
          </div>
          <div className="timeline">
            <div className="timeline-item reveal">
              <div className="timeline-side left">
                <article className="timeline-card">
                  <div className="tl-step">Etapa 01</div>
                  <h3 className="tl-title">Criação do desafio</h3>
                  <p className="tl-desc">Um usuário cria um desafio e define a recompensa em dinheiro. O valor fica bloqueado na plataforma até o fim da validação.</p>
                </article>
                <span className="tl-badge top">Escrow ativo</span>
              </div>
              <div className="timeline-node"><span className="node-icon">🎯</span><span className="node-num">01</span></div>
            </div>
            <div className="timeline-item reveal" style={{ transitionDelay: '.08s' }}>
              <div className="timeline-side right">
                <article className="timeline-card">
                  <div className="tl-step">Etapa 02</div>
                  <h3 className="tl-title">Análise automática de conteúdo</h3>
                  <p className="tl-desc">O desafio passa por análise automática antes da publicação, garantindo segurança e conformidade da proposta.</p>
                </article>
                <span className="tl-badge alt bottom">Análise automática</span>
              </div>
              <div className="timeline-node purple"><span className="node-icon">🛡️</span><span className="node-num">02</span></div>
            </div>
            <div className="timeline-item reveal" style={{ transitionDelay: '.16s' }}>
              <div className="timeline-side left">
                <article className="timeline-card">
                  <div className="tl-step">Etapa 03</div>
                  <h3 className="tl-title">Aceitação e envio</h3>
                  <p className="tl-desc">Outro usuário encontra o desafio, aceita e envia um vídeo cumprindo a proposta dentro do prazo estabelecido.</p>
                </article>
                <span className="tl-badge bottom">Envio registrado</span>
              </div>
              <div className="timeline-node"><span className="node-icon">🎬</span><span className="node-num">03</span></div>
            </div>
            <div className="timeline-item reveal" style={{ transitionDelay: '.24s' }}>
              <div className="timeline-side right">
                <article className="timeline-card">
                  <div className="tl-step">Etapa 04</div>
                  <h3 className="tl-title">Verificação visual do vídeo</h3>
                  <p className="tl-desc">O vídeo enviado passa por análise visual automática para verificar integridade e conformidade com as regras.</p>
                </article>
                <span className="tl-badge alt top">Análise automática de vídeos</span>
              </div>
              <div className="timeline-node purple"><span className="node-icon">🔍</span><span className="node-num">04</span></div>
            </div>
            <div className="timeline-item reveal" style={{ transitionDelay: '.32s' }}>
              <div className="timeline-side left">
                <article className="timeline-card">
                  <div className="tl-step">Etapa 05</div>
                  <h3 className="tl-title">Validação administrativa</h3>
                  <p className="tl-desc">Se o vídeo passar pelos filtros automáticos, segue para validação administrativa antes da liberação final.</p>
                </article>
                <span className="tl-badge top">Checklist humano</span>
              </div>
              <div className="timeline-node"><span className="node-icon">✅</span><span className="node-num">05</span></div>
            </div>
            <div className="timeline-item reveal" style={{ transitionDelay: '.4s' }}>
              <div className="timeline-side right">
                <article className="timeline-card">
                  <div className="tl-step">Etapa 06</div>
                  <h3 className="tl-title">Recompensa liberada</h3>
                  <p className="tl-desc">Após a validação completa, a recompensa é liberada ao participante. Nenhum valor é transferido antes disso.</p>
                </article>
                <span className="tl-badge alt bottom">Pagamento seguro</span>
              </div>
              <div className="timeline-node purple"><span className="node-icon">💰</span><span className="node-num">06</span></div>
            </div>
            <div className="timeline-item reveal" style={{ transitionDelay: '.48s' }}>
              <div className="timeline-side left">
                <article className="timeline-card">
                  <div className="tl-step">Etapa 07</div>
                  <h3 className="tl-title">Evolução no ranking</h3>
                  <p className="tl-desc">Quem conclui o desafio sobe no ranking da plataforma, ganhando visibilidade e destaque no feed.</p>
                </article>
                <span className="tl-badge bottom">+ Pontos</span>
              </div>
              <div className="timeline-node"><span className="node-icon">📈</span><span className="node-num">07</span></div>
            </div>
            <div className="timeline-item reveal" style={{ transitionDelay: '.56s' }}>
              <div className="timeline-side right">
                <article className="timeline-card">
                  <div className="tl-step">Etapa 08</div>
                  <h3 className="tl-title">Badges e progressão</h3>
                  <p className="tl-desc">O sistema libera badges e progressão competitiva, reconhecendo conquistas e incentivando novos desafios.</p>
                </article>
                <span className="tl-badge alt top">Badge desbloqueado</span>
              </div>
              <div className="timeline-node purple"><span className="node-icon">🏅</span><span className="node-num">08</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* CARROSSEL */}
      <div className="carousel-section" id="desafios">
        <div className="carousel-label">🔥 Desafios abertos agora mesmo</div>
        <div className="carousel-outer">
          <div className="carousel-track" ref={carouselTrackRef}>
            <div className="c-card">
              <div className="c-card-header">
                <div className="c-avatar" style={{ background: '#e67e22' }}>LS</div>
                <div className="c-user"><span className="c-username">Lucas Silva</span><span className="c-handle">@lucassilva · 2h</span></div>
                <span className="c-more">···</span>
              </div>
              <div className="c-tags"><span className="c-tag-cat">🫣 Vergonha Alheia</span><span className="c-tag-price">$ R$ 150</span></div>
              <div className="c-title">Gritar &quot;EU SOU O MELHOR&quot; no meio do shopping</div>
              <div className="c-desc">Tem que ser no shopping lotado, no meio da praça de alimentação. Filmar tudo e postar a reação das pessoas.</div>
              <button className="c-btn" type="button">⚡ Aceitar Desafio — R$ 150</button>
              <div className="c-stats"><span>🤍 1342</span><span>💬 289</span><span>🏆 12</span><span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span></div>
            </div>
            <div className="c-card">
              <div className="c-card-header">
                <div className="c-avatar" style={{ background: '#8e44ad' }}>AC</div>
                <div className="c-user"><span className="c-username">Ana Costa</span><span className="c-handle">@anacosta · 4h</span></div>
                <span className="c-more">···</span>
              </div>
              <div className="c-tags"><span className="c-tag-cat">😅 Constrangedor</span><span className="c-tag-price">$ R$ 200</span></div>
              <div className="c-title">Pedir o número de 10 desconhecidos na rua</div>
              <div className="c-desc">Deve ser gravado, sem edição. Cada abordagem conta. Não pode ser alguém que você conheça.</div>
              <button className="c-btn" type="button">⚡ Aceitar Desafio — R$ 200</button>
              <div className="c-stats"><span>🤍 2521</span><span>💬 534</span><span>🏆 8</span><span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span></div>
            </div>
            <div className="c-card">
              <div className="c-card-header">
                <div className="c-avatar" style={{ background: '#27ae60' }}>PS</div>
                <div className="c-user"><span className="c-username">Pedro Santos</span><span className="c-handle">@pedrosantos · 6h</span></div>
                <span className="c-more">···</span>
              </div>
              <div className="c-tags"><span className="c-tag-cat">💪 Coragem</span><span className="c-tag-price">$ R$ 100</span></div>
              <div className="c-title">Cantar no karaokê de um bar cheio sem saber a letra</div>
              <div className="c-desc">Escolha uma música que você não conheça e cante até o final, sem interrupções.</div>
              <button className="c-btn" type="button">⚡ Aceitar Desafio — R$ 100</button>
              <div className="c-stats"><span>🤍 987</span><span>💬 143</span><span>🏆 5</span><span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span></div>
            </div>
            <div className="c-card">
              <div className="c-card-header">
                <div className="c-avatar" style={{ background: '#2980b9' }}>RM</div>
                <div className="c-user"><span className="c-username">Rafa Mendes</span><span className="c-handle">@rafamendes · 1h</span></div>
                <span className="c-more">···</span>
              </div>
              <div className="c-tags"><span className="c-tag-cat">🎤 Coragem</span><span className="c-tag-price">$ R$ 80</span></div>
              <div className="c-title">Pedir um autógrafo para um desconhecido como se fosse famoso</div>
              <div className="c-desc">Abordagem precisa ser educada e gravada de forma contínua, sem cortes.</div>
              <button className="c-btn" type="button">⚡ Aceitar Desafio — R$ 80</button>
              <div className="c-stats"><span>🤍 1165</span><span>💬 201</span><span>🏆 9</span><span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span></div>
            </div>
            <div className="c-card">
              <div className="c-card-header">
                <div className="c-avatar" style={{ background: '#c0392b' }}>TB</div>
                <div className="c-user"><span className="c-username">Taina Braga</span><span className="c-handle">@tainabraga · 3h</span></div>
                <span className="c-more">···</span>
              </div>
              <div className="c-tags"><span className="c-tag-cat">🧠 Criativo</span><span className="c-tag-price">$ R$ 95</span></div>
              <div className="c-title">Contar uma história improvisada para 3 pessoas na praça</div>
              <div className="c-desc">A história deve ter começo, meio e fim, com duração mínima de 2 minutos.</div>
              <button className="c-btn" type="button">⚡ Aceitar Desafio — R$ 95</button>
              <div className="c-stats"><span>🤍 879</span><span>💬 121</span><span>🏆 4</span><span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span></div>
            </div>
            <div className="c-card">
              <div className="c-card-header">
                <div className="c-avatar" style={{ background: '#16a085' }}>GK</div>
                <div className="c-user"><span className="c-username">Gabi Klein</span><span className="c-handle">@gabiklein · 5h</span></div>
                <span className="c-more">···</span>
              </div>
              <div className="c-tags"><span className="c-tag-cat">🏃 Desempenho</span><span className="c-tag-price">$ R$ 120</span></div>
              <div className="c-title">Subir 15 andares de escada e registrar o tempo final</div>
              <div className="c-desc">Vídeo contínuo do início ao fim mostrando o cronômetro e a chegada.</div>
              <button className="c-btn" type="button">⚡ Aceitar Desafio — R$ 120</button>
              <div className="c-stats"><span>🤍 1440</span><span>💬 198</span><span>🏆 11</span><span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span></div>
            </div>
            <div className="c-card">
              <div className="c-card-header">
                <div className="c-avatar" style={{ background: '#d35400' }}>NF</div>
                <div className="c-user"><span className="c-username">Nina Freitas</span><span className="c-handle">@ninafreitas · 7h</span></div>
                <span className="c-more">···</span>
              </div>
              <div className="c-tags"><span className="c-tag-cat">🎬 Performance</span><span className="c-tag-price">$ R$ 70</span></div>
              <div className="c-title">Fazer uma cena de filme em local público por 1 minuto</div>
              <div className="c-desc">A interpretação deve ter fala audível e enquadramento estável durante toda a prova.</div>
              <button className="c-btn" type="button">⚡ Aceitar Desafio — R$ 70</button>
              <div className="c-stats"><span>🤍 761</span><span>💬 88</span><span>🏆 3</span><span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span></div>
            </div>
            <div className="c-card">
              <div className="c-card-header">
                <div className="c-avatar" style={{ background: '#7f8c8d' }}>VT</div>
                <div className="c-user"><span className="c-username">Vitor Telles</span><span className="c-handle">@vitortelles · 9h</span></div>
                <span className="c-more">···</span>
              </div>
              <div className="c-tags"><span className="c-tag-cat">📚 Foco</span><span className="c-tag-price">$ R$ 60</span></div>
              <div className="c-title">Estudar por 90 minutos sem celular no alcance da mesa</div>
              <div className="c-desc">Time-lapse permitido, desde que mostre o ambiente e o tempo total completo.</div>
              <button className="c-btn" type="button">⚡ Aceitar Desafio — R$ 60</button>
              <div className="c-stats"><span>🤍 690</span><span>💬 74</span><span>🏆 2</span><span style={{ marginLeft: 'auto' }}>🔖 &nbsp; ↗</span></div>
            </div>
          </div>
        </div>
        <div className="carousel-dots" id="carouselDots" style={{ display: 'none' }} />
      </div>

      {/* RANKING */}
      <section className="ranking" id="ranking">
        <div className="ranking-inner">
          <div className="ranking-header reveal">
            <div className="section-label">Competição</div>
            <h2 className="section-title">Ranking e<br />gamificação</h2>
            <p className="section-sub">Cada desafio concluído fortalece sua posição. Badges, progressão e visibilidade dentro da comunidade.</p>
          </div>
          <div className="rank-features reveal" style={{ transitionDelay: '.08s' }}>
            <article className="rank-feature"><span className="rank-feature-icon">🏆</span><h3>Ranking ativo</h3><p>Sua posição muda a cada desafio concluído.</p></article>
            <article className="rank-feature"><span className="rank-feature-icon">🏅</span><h3>Badges exclusivos</h3><p>Reconhecimento por conquistas e consistência.</p></article>
            <article className="rank-feature"><span className="rank-feature-icon">📊</span><h3>Progressão visível</h3><p>Acompanhe sua evolução dentro da plataforma.</p></article>
            <article className="rank-feature"><span className="rank-feature-icon">👁️</span><h3>Visibilidade</h3><p>Os melhores ganham destaque no feed e no ranking.</p></article>
          </div>
          <div className="rank-marquee reveal" style={{ transitionDelay: '.16s' }}>
            <div className="rank-track">
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@lucas.rvs</span><span className="rank-pos">#3</span></div><span className="rank-badge">Explorador</span><p className="rank-desc">Caminhar 10km em 24h</p><div className="rank-reward">R$ 85,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@marina.dst</span><span className="rank-pos">#7</span></div><span className="rank-badge">Competidora</span><p className="rank-desc">Cozinhar sem receita</p><div className="rank-reward">R$ 120,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@phelipe.rn</span><span className="rank-pos">#1</span></div><span className="rank-badge">Veterano</span><p className="rank-desc">30 dias sem redes sociais</p><div className="rank-reward">R$ 250,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@carol.braga</span><span className="rank-pos">#14</span></div><span className="rank-badge">Iniciante</span><p className="rank-desc">Falar em público por 5 min</p><div className="rank-reward">R$ 60,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@thiago.mx</span><span className="rank-pos">#5</span></div><span className="rank-badge">Destemido</span><p className="rank-desc">Acampar sozinho 1 noite</p><div className="rank-reward">R$ 180,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@bruna.alves</span><span className="rank-pos">#2</span></div><span className="rank-badge">Estrategista</span><p className="rank-desc">Resolver cubo mágico vendado</p><div className="rank-reward">R$ 200,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@diego.costa</span><span className="rank-pos">#9</span></div><span className="rank-badge">Persistente</span><p className="rank-desc">100 flexões em 10 min</p><div className="rank-reward">R$ 95,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@juliana.vm</span><span className="rank-pos">#11</span></div><span className="rank-badge">Criativa</span><p className="rank-desc">Pintar um quadro em 1h</p><div className="rank-reward">R$ 70,00</div></article>
              {/* Duplicates for seamless marquee */}
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@lucas.rvs</span><span className="rank-pos">#3</span></div><span className="rank-badge">Explorador</span><p className="rank-desc">Caminhar 10km em 24h</p><div className="rank-reward">R$ 85,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@marina.dst</span><span className="rank-pos">#7</span></div><span className="rank-badge">Competidora</span><p className="rank-desc">Cozinhar sem receita</p><div className="rank-reward">R$ 120,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@phelipe.rn</span><span className="rank-pos">#1</span></div><span className="rank-badge">Veterano</span><p className="rank-desc">30 dias sem redes sociais</p><div className="rank-reward">R$ 250,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@carol.braga</span><span className="rank-pos">#14</span></div><span className="rank-badge">Iniciante</span><p className="rank-desc">Falar em público por 5 min</p><div className="rank-reward">R$ 60,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@thiago.mx</span><span className="rank-pos">#5</span></div><span className="rank-badge">Destemido</span><p className="rank-desc">Acampar sozinho 1 noite</p><div className="rank-reward">R$ 180,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@bruna.alves</span><span className="rank-pos">#2</span></div><span className="rank-badge">Estrategista</span><p className="rank-desc">Resolver cubo mágico vendado</p><div className="rank-reward">R$ 200,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@diego.costa</span><span className="rank-pos">#9</span></div><span className="rank-badge">Persistente</span><p className="rank-desc">100 flexões em 10 min</p><div className="rank-reward">R$ 95,00</div></article>
              <article className="rank-card"><div className="rank-top"><span className="rank-user">@juliana.vm</span><span className="rank-pos">#11</span></div><span className="rank-badge">Criativa</span><p className="rank-desc">Pintar um quadro em 1h</p><div className="rank-reward">R$ 70,00</div></article>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Contato */}
      <section className="cta-section" id="entrar">
        <div className="cta-inner reveal">
          <div className="section-label">Contato</div>
          <h2 className="cta-title">
            Está interessado na<br />
            <span className="hl">DareU?</span>
          </h2>
          <p className="cta-sub">Contate a gente para saber mais!</p>
          <div className="contact-info">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=equipe.dareu@gmail.com"
              className="contact-email-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              equipe.dareu@gmail.com
            </a>
          </div>
          <button
            className="btn-to-top-cta"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            ↑ Voltar ao topo
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contato">
        <span className="footer-logo">
          <Image
            src="/imagens/logo-sem-fundo.png"
            alt="DareU"
            width={200}
            height={56}
            style={{ height: '56px', width: 'auto' }}
          />
        </span>
        <p className="footer-copy">© 2026 DareU. Todos os direitos reservados.</p>
        <div className="footer-links">
          <a href="#">Termos de uso</a>
          <a href="#">Privacidade</a>
          <a href="#">Contato</a>
        </div>
      </footer>
    </>
  )
}
