import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { avatarUrl } from '../../shared/presentation'
import '../css/editar.css'

const IconPencil = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
)

const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" />
  </svg>
)

const IconGear = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" />
  </svg>
)

const IconShield = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
  </svg>
)

const IconChart = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </svg>
)

const IconBars = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M5 20V11M12 20V4M19 20v-6" />
  </svg>
)

const IconCamera = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h3l2-2.2h6L17 8h3v11H4z" />
    <circle cx="12" cy="13.2" r="3.4" />
  </svg>
)

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
)

const IconChevronRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
)

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="6" rx="2" />
    <rect x="3" y="14" width="18" height="6" rx="2" />
  </svg>
)

const IconStar = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.5l-5.88 3.11 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z" />
  </svg>
)

const USUARIO_EJEMPLO = {
  nombre: 'Luis Alejandro',
  apellido: 'Montenegro Ojeda',
}

const IconDolar = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CAMPOS_INICIALES = [
  { id: 'nombre', label: 'Nombre Completo', valor: 'Luis Alejandro Montenegro Ojeda', ayuda: 'los usuarios verán tu nombre en AEGIS de esta forma' },
  { id: 'contacto', label: 'Número de contacto', valor: '+57 322022020', ayuda: 'los usuarios te contactarán por este contacto' },
  { id: 'documento', label: 'Número de Documento', valor: 'N° 10617272181', ayuda: 'los usuarios te contactarán por este contacto' },
  { id: 'nacimiento', label: 'Nacimiento', valor: '03/05/2008', ayuda: 'los usuarios te contactarán por este contacto' },
  { id: 'residencia', label: 'Lugar de Residencia', valor: 'Popayán - Cauca', ayuda: 'los usuarios te contactarán por este contacto' },
]

const SECCIONES = [
  { id: 'info', label: 'Información básica', icono: <IconUser /> },
  { id: 'usuario', label: 'Opciones del usuario', icono: <IconGear /> },
  { id: 'privacidad', label: 'Privacidad', icono: <IconShield /> },
  { id: 'negocio', label: 'Ajustes del negocio', icono: <IconChart /> },
  { id: 'estadisticas', label: 'Estadísticas', icono: <IconBars /> },
  { id: 'compras', label: 'Mis compras', icono: <IconDolar /> },
]

const AJUSTES = {
  usuario: [
    { id: 'notificaciones', label: 'Recibir notificaciones por correo' },
    { id: 'mensajes', label: 'Avisarme cuando alguien me escriba' },
    { id: 'actividad', label: 'Mostrar mi actividad públicamente' },
  ],
  privacidad: [
    { id: 'perfil-publico', label: 'Perfil público' },
    { id: 'mostrar-telefono', label: 'Mostrar mi número de contacto' },
    { id: 'mensajes-libres', label: 'Permitir que cualquier usuario me escriba' },
  ],
  negocio: [
    { id: 'vendedor', label: 'Modo vendedor activo' },
    { id: 'ofertas', label: 'Aceptar ofertas directas' },
    { id: 'envios', label: 'Ofrezco envíos a todo el país' },
  ],
}

const AJUSTES_INICIALES = {
  notificaciones: true,
  mensajes: true,
  actividad: false,
  'perfil-publico': true,
  'mostrar-telefono': false,
  'mensajes-libres': true,
  vendedor: true,
  ofertas: true,
  envios: false,
}

const ESTADISTICAS = [
  { label: 'Publicaciones', valor: '12', tono: 'blue', icono: <IconChart /> },
  { label: 'Ventas completadas', valor: '48', tono: 'purple', icono: <IconStar /> },
  { label: 'Seguidores', valor: '320', tono: 'blue', icono: <IconUser /> },
  { label: 'Valoración', valor: '4.7', tono: 'purple', icono: <IconStar /> },
]

export default function Editar({ auth, onNavigate, id }) {
  const yo = USUARIO_EJEMPLO

  const guardado = JSON.parse(localStorage.getItem('perfilAegis') || '{}')
  const camposGuardados = JSON.parse(localStorage.getItem('camposPerfilAegis') || '[]')
  const ajustesGuardados = JSON.parse(localStorage.getItem('ajustesPerfilAegis') || '{}')
  const [avatar, setAvatar] = useState(guardado.avatar || avatarUrl(yo, 160))
  const [portada, setPortada] = useState(guardado.portada || null)
  const [descripcion, setDescripcion] = useState(guardado.descripcion || '')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [borradorAvatar, setBorradorAvatar] = useState(avatar)
  const [borradorPortada, setBorradorPortada] = useState(null)
  const [borradorDesc, setBorradorDesc] = useState('')

  const [seccion, setSeccion] = useState(id || 'info')

  const [campos, setCampos] = useState(
    CAMPOS_INICIALES.map((campo) => {
      const previo = camposGuardados.find((item) => item.id === campo.id)
      return previo ? { ...campo, valor: previo.valor } : campo
    })
  )
  const [editando, setEditando] = useState(null)
  const [valorEdit, setValorEdit] = useState('')

  const [ajustes, setAjustes] = useState({ ...AJUSTES_INICIALES, ...ajustesGuardados })

  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!modalAbierto) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setModalAbierto(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [modalAbierto])

  useEffect(() => {
    setSeccion(id || 'info')
  }, [id])

  const abrirModal = () => {
    setBorradorAvatar(avatar)
    setBorradorPortada(portada)
    setBorradorDesc(descripcion)
    setModalAbierto(true)
  }

  const aplicarFoto = (campo, datos) => {
    if (campo === 'avatar') {
      setBorradorAvatar(datos)
      setAvatar(datos)
    } else {
      setBorradorPortada(datos)
      setPortada(datos)
    }
    const previo = JSON.parse(localStorage.getItem('perfilAegis') || '{}')
    const nuevos = { avatar: previo.avatar || '', portada: previo.portada || '', descripcion: previo.descripcion || '' }
    if (campo === 'avatar') nuevos.avatar = datos
    else nuevos.portada = datos
    localStorage.setItem('perfilAegis', JSON.stringify(nuevos))
    setToast('Foto guardada ✓')
  }

  const leerImagen = (file, campo) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const imagen = new Image()
      imagen.onload = () => {
        const escala = Math.min(1, 900 / Math.max(imagen.width, imagen.height))
        const ancho = Math.round(imagen.width * escala)
        const alto = Math.round(imagen.height * escala)
        const lienzo = document.createElement('canvas')
        lienzo.width = ancho
        lienzo.height = alto
        lienzo.getContext('2d').drawImage(imagen, 0, 0, ancho, alto)
        aplicarFoto(campo, lienzo.toDataURL('image/jpeg', 0.85))
      }
      imagen.src = loadEvent.target.result
    }
    reader.readAsDataURL(file)
  }

  const guardarModal = () => {
    setAvatar(borradorAvatar)
    setPortada(borradorPortada)
    setDescripcion(borradorDesc.trim())
    localStorage.setItem('perfilAegis', JSON.stringify({ avatar: borradorAvatar, portada: borradorPortada, descripcion: borradorDesc.trim() }))
    setModalAbierto(false)
    setToast('Cambios guardados')
  }

  const guardarCampo = (id) => {
    const nuevos = campos.map((campo) => (campo.id === id ? { ...campo, valor: valorEdit.trim() || campo.valor } : campo))
    setCampos(nuevos)
    const paraGuardar = nuevos.map((campo) => ({ id: campo.id, valor: campo.valor }))
    localStorage.setItem('camposPerfilAegis', JSON.stringify(paraGuardar))
    setEditando(null)
    setToast('Cambios guardados')
  }

  const alternarAjuste = (id) => {
    const nuevos = { ...ajustes, [id]: !ajustes[id] }
    setAjustes(nuevos)
    localStorage.setItem('ajustesPerfilAegis', JSON.stringify(nuevos))
  }

  const seccionActual = SECCIONES.find((item) => item.id === seccion)

  return (
    <div className="page-layout">
      <Header title="AEGIS | Editar Perfil" auth={auth} onNavigate={onNavigate} />

      <main className="editar-page">
        <aside className="editar-nav">
          <div className="editar-nav-title">
            <IconSettings /> Ajustes de la cuenta
          </div>
          <nav className="editar-nav-list">
            {SECCIONES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`editar-nav-item ${seccion === item.id ? 'active' : ''}`}
                onClick={() => setSeccion(item.id)}
              >
                <span className="editar-nav-icon">{item.icono}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="editar-main">
          <button type="button" className="editar-back" onClick={() => onNavigate && onNavigate('/perfil')}>
            ← Volver a mi perfil
          </button>

          {seccion !== 'compras' && (
            <section className="editar-hero">
              <div
                className={portada ? 'editar-hero-portada con-foto' : 'editar-hero-portada'}
                style={portada ? { backgroundImage: `url(${portada})` } : undefined}
              />
              <div className="editar-hero-box">
                <div className="editar-hero-avatar">
                  <img src={avatar} alt="Foto de perfil" />
                </div>
                <div className="editar-hero-info">
                  <p className="editar-hero-hint" onClick={abrirModal}>
                    Personaliza tu foto de perfil, así es como las personas te verán en la plataforma.
                  </p>
                  {descripcion && <p className="editar-hero-desc">{descripcion}</p>}
                  <button type="button" className="editar-hero-btn" onClick={abrirModal}>
                    Editar <IconPencil size={15} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {seccion === 'info' && (
            <section className="editar-section">
              <h2 className="editar-section-title">Información básica</h2>
              <div className="editar-card">
                {campos.map((campo) => (
                  <div className="editar-row" key={campo.id}>
                    <span className="editar-row-label">{campo.label}</span>
                    {editando === campo.id ? (
                      <div className="editar-row-form">
                        <input
                          value={valorEdit}
                          onChange={(event) => setValorEdit(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') guardarCampo(campo.id)
                            if (event.key === 'Escape') setEditando(null)
                          }}
                          autoFocus
                        />
                        <button type="button" className="editar-btn-primary editar-btn-sm" onClick={() => guardarCampo(campo.id)}>
                          Guardar
                        </button>
                        <button type="button" className="editar-btn-ghost editar-btn-sm" onClick={() => setEditando(null)}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="editar-row-value">{campo.valor}</span>
                        <span className="editar-row-help">{campo.ayuda}</span>
                        <button
                          type="button"
                          className="editar-row-btn"
                          onClick={() => {
                            setEditando(campo.id)
                            setValorEdit(campo.valor)
                          }}
                        >
                          Editar <IconChevronRight />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {AJUSTES[seccion] && (
            <section className="editar-section">
              <h2 className="editar-section-title">{seccionActual ? seccionActual.label : ''}</h2>
              <div className="editar-card">
                {AJUSTES[seccion].map((item) => (
                  <div className="editar-toggle-row" key={item.id}>
                    <span className="editar-toggle-label">{item.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={ajustes[item.id]}
                      aria-label={item.label}
                      className={`editar-switch ${ajustes[item.id] ? 'on' : ''}`}
                      onClick={() => alternarAjuste(item.id)}
                    >
                      <span className="editar-switch-knob" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {seccion === 'estadisticas' && (
            <section className="editar-section">
              <h2 className="editar-section-title">Estadísticas</h2>
              <div className="editar-stats">
                {ESTADISTICAS.map((stat) => (
                  <div className="editar-stat-card" key={stat.label}>
                    <span className={`editar-stat-icon ${stat.tono}`}>{stat.icono}</span>
                    <strong className="editar-stat-valor">{stat.valor}</strong>
                    <span className="editar-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {seccion === 'compras' && (
            <section className="editar-section">
              <div className="editar-compras-vacio">
                <h2>Ups, Todavía no has realizado ninguna compra aun.</h2>
                <img src="/carrito-vacio.png" alt="Carrito vacío" />
              </div>
            </section>
          )}
        </section>
      </main>

      {modalAbierto && (
        <div
          className="editar-modal"
          onClick={(event) => {
            if (event.target === event.currentTarget) setModalAbierto(false)
          }}
        >
          <div className="editar-modal-card" role="dialog" aria-modal="true" aria-label="Personaliza tu perfil">
            <div className="editar-modal-head">
              <h3>Personaliza tu perfil</h3>
              <button type="button" className="editar-modal-close" onClick={() => setModalAbierto(false)} aria-label="Cerrar">
                <IconClose />
              </button>
            </div>

            <div className="editar-modal-body">
              <label className={`editar-modal-cover ${borradorPortada ? 'con-foto' : ''}`}>
                {borradorPortada ? (
                  <img src={borradorPortada} alt="Portada" />
                ) : (
                  <span className="editar-modal-cover-placeholder">
                    <IconCamera />
                    <em>Añade una foto de portada</em>
                  </span>
                )}
                <span className="editar-modal-cover-hint">{borradorPortada ? 'Cambiar foto' : 'Subir imagen'}</span>
                <input type="file" accept="image/*" hidden onChange={(event) => leerImagen(event.target.files[0], 'portada')} />
              </label>

              <div className="editar-modal-avatar-wrap">
                <label className="editar-modal-avatar">
                  <img src={borradorAvatar} alt="Foto de perfil" />
                  <span className="editar-modal-avatar-edit" title="Cambiar foto de perfil">
                    <IconPencil size={13} />
                  </span>
                  <input type="file" accept="image/*" hidden onChange={(event) => leerImagen(event.target.files[0], 'avatar')} />
                </label>
                <span className="editar-modal-avatar-label">Foto Perfil</span>
              </div>

              <div className="editar-modal-desc">
                <h4>Descripción</h4>
                <textarea
                  value={borradorDesc}
                  onChange={(event) => setBorradorDesc(event.target.value)}
                  placeholder="Añade lo que quieras que tus Visitantes sepan de ti"
                />
              </div>
            </div>

            <div className="editar-modal-actions">
              <button type="button" className="editar-btn-ghost" onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className="editar-btn-primary" onClick={guardarModal}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="editar-toast">{toast}</div>}

      <Footer onNavigate={onNavigate} />
    </div>
  )
}
