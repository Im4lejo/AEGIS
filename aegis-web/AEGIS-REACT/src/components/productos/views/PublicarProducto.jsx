import { useEffect, useState } from 'react'
import Header from '../../layouts/Header'
import WorkspaceChrome from '../../layouts/WorkspaceChrome'
import Footer from '../../layouts/Footer'
import { formatCurrency } from '../../shared/presentation'
import { useAuth } from '../../../auth/useAuth'
import { productApi } from '../../../services/api'
import MediaDropzone from '../../shared/MediaDropzone'
import '../css/publicarProducto.css'


export default function PublicarProducto({ auth, onNavigate }) {
    const { token } = useAuth()
    const [datos, setDatos] = useState({
        titulo: '',
        categoria_id: '',
        estado: '',
        precio: '',
        descripcion: '',
        ciudad: '',
    })
    const [fotoPrincipal, setFotoPrincipal] = useState('')
    const [categorias, setCategorias] = useState([])
    const [errorCategorias, setErrorCategorias] = useState('')
    const [mensaje, setMensaje] = useState(null)
    const [mediaFiles, setMediaFiles] = useState([])
    const [mediaAltText, setMediaAltText] = useState('')
    const [publicando, setPublicando] = useState(false)

    useEffect(() => {
        let active = true
        productApi.categories()
            .then(({ data }) => {
                if (active) setCategorias(data)
            })
            .catch((error) => {
                if (active) setErrorCategorias(error.message)
            })
        return () => { active = false }
    }, [])

    const cambiarDato = (campo, valor) => {
        const nuevos = { ...datos }
        nuevos[campo] = valor
        setDatos(nuevos)
    }

    const comprimir = (archivo, alListo) => {
        if (!archivo) return
        const lector = new FileReader()
        lector.onload = (evento) => {
            const imagen = new Image()
            imagen.onload = () => {
                const escala = Math.min(1, 1000 / Math.max(imagen.width, imagen.height))
                const ancho = Math.round(imagen.width * escala)
                const alto = Math.round(imagen.height * escala)
                const lienzo = document.createElement('canvas')
                lienzo.width = ancho
                lienzo.height = alto
                lienzo.getContext('2d').drawImage(imagen, 0, 0, ancho, alto)
                alListo(lienzo.toDataURL('image/jpeg', 0.82))
            }
            imagen.src = evento.target.result
        }
        lector.readAsDataURL(archivo)
    }

    const actualizarMedia = (files) => {
        setMediaFiles(files)
        const primeraImagen = files.find((archivo) => archivo.type.startsWith('image/'))
        if (primeraImagen) {
            comprimir(primeraImagen, setFotoPrincipal)
        } else {
            setFotoPrincipal('')
        }
    }

    const volver = () => {
        if (onNavigate) onNavigate('/productos')
    }

    const soloNumeros = (texto) => Number(texto.split('').filter((letra) => '0123456789'.indexOf(letra) !== -1).join(''))

    const publicar = async (event) => {
        event.preventDefault()
        if (publicando) return
        const titulo = datos.titulo.trim()
        const precio = soloNumeros(datos.precio)
        const imagenes = mediaFiles
        if (!titulo || !datos.categoria_id || !datos.estado || !imagenes.length || !Number.isFinite(precio) || precio < 0) {
            setMensaje({ tipo: 'error', texto: 'Completa título, categoría, estado, precio y añade al menos una imagen o video.' })
            return
        }
        try {
            setPublicando(true)
            await productApi.create({
                categoria_id: datos.categoria_id,
                titulo,
                descripcion: datos.descripcion.trim(),
                precio,
                estado_producto: datos.estado,
                ciudad: datos.ciudad.trim(),
                imagenes,
                alt_text: mediaAltText,
            }, token)
            setMensaje(null)
            if (onNavigate) onNavigate('/productos', { message: '¡El producto se ha publicado satisfactoriamente!' })
        } catch (error) {
            setMensaje({ tipo: 'error', texto: error.message })
        } finally {
            setPublicando(false)
        }
    }

    const precioVista = soloNumeros(datos.precio)

    return (
        <div className="page-layout publish-layout">
            <Header title="AEGIS | Publicar Producto" auth={auth} onNavigate={onNavigate} />
            <WorkspaceChrome auth={auth} onNavigate={onNavigate}>

            <main className="main-content publish-page">
                <form onSubmit={publicar}>
                    <div className="publish-header">
                        <div className="publish-title">
                            <button type="button" className="publish-back" onClick={volver} aria-label="Volver a productos">
                                <i className="fa-solid fa-arrow-left" />
                            </button>
                            <h1>Publicar producto</h1>
                        </div>
                    </div>

                    {mensaje && (
                        <div className={mensaje.tipo === 'error' ? 'publish-alert publish-alert--error' : 'publish-alert publish-alert--success'}>
                            {mensaje.texto}
                        </div>
                    )}

                    <div className="publish-columns">
                        <div className="publish-form-col">
                            <section className="publish-card">
                                <div className="images-section">
                                    <h2>1. Imágenes y videos</h2>
                                    <MediaDropzone
                                        value={mediaFiles}
                                        onChange={actualizarMedia}
                                        altText={mediaAltText}
                                        onAltTextChange={setMediaAltText}
                                        maxFiles={5}
                                    />
                                </div>

                                <div className="info-section">
                                    <h2>2. Información Básica</h2>

                                    <div className="input-group">
                                        <label htmlFor="titulo">Título del anuncio</label>
                                        <input id="titulo" type="text" required maxLength="150" value={datos.titulo} onChange={(event) => cambiarDato('titulo', event.target.value)} />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="categoria">Categoría</label>
                                        <select id="categoria" required value={datos.categoria_id} onChange={(event) => cambiarDato('categoria_id', event.target.value)}>
                                            <option value="">Selecciona una categoría</option>
                                            {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
                                        </select>
                                        {errorCategorias && <span className="publish-alert publish-alert--error">{errorCategorias}</span>}
                                    </div>

                                    <div className="double-grid">
                                        <div className="input-group">
                                            <label htmlFor="estado">Estado</label>
                                            <select id="estado" required value={datos.estado} onChange={(event) => cambiarDato('estado', event.target.value)}>
                                                <option value="">Selecciona el estado</option>
                                                <option value="nuevo">Nuevo</option>
                                                <option value="usado">Usado</option>
                                                <option value="reacondicionado">Reacondicionado</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="ciudad">Ciudad (opcional)</label>
                                            <input id="ciudad" type="text" maxLength="100" value={datos.ciudad} onChange={(event) => cambiarDato('ciudad', event.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="details-card">
                                <h2>3. Detalles del Intercambio</h2>

                                <div className="double-grid">
                                    <div className="input-group">
                                        <label htmlFor="precio">Precio Referencial</label>
                                        <input id="precio" type="number" min="0" step="1" required placeholder="COP 0.00" value={datos.precio} onChange={(event) => cambiarDato('precio', event.target.value)} />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="descripcion">Descripción</label>
                                    <textarea id="descripcion" required placeholder="Describe el producto..." value={datos.descripcion} onChange={(event) => cambiarDato('descripcion', event.target.value)} />
                                </div>
                            </section>

                            <div className="publish-actions">
                                <button type="submit" className="publish-btn" disabled={publicando}>{publicando ? 'Publicando...' : 'Publicar'}</button>
                            </div>
                        </div>

                        <aside className="publish-preview">
                            <div className="preview-head">
                                <h2>Vista previa</h2>
                                <p>Así se verá tu publicación</p>
                            </div>

                            <article className="preview-card">
                                <div className="preview-image">
                                    {mediaFiles[0]?.type.startsWith('video/') ? (
                                        <i className="fa-solid fa-video" aria-label="Video seleccionado" />
                                    ) : fotoPrincipal ? (
                                        <img src={fotoPrincipal} alt="Foto principal" />
                                    ) : (
                                        <i className="fa-regular fa-image" />
                                    )}
                                    {datos.estado && <span className="preview-tag">{datos.estado}</span>}
                                </div>

                                <div className="preview-body">
                                    <p className="preview-price">{precioVista > 0 ? 'COP ' + formatCurrency(precioVista) : 'COP 0'}</p>
                                    <h3 className="preview-title">{datos.titulo ? datos.titulo : 'Título del anuncio'}</h3>
                                    <p className="preview-brand">
                                        {datos.ciudad || 'Sin ciudad'}
                                    </p>

                                    <ul className="preview-specs">
                                        <li><span>Categoría</span><strong>{categorias.find((categoria) => String(categoria.id) === String(datos.categoria_id))?.nombre || 'Sin categoría'}</strong></li>
                                        <li><span>Estado</span><strong>{datos.estado ? datos.estado : 'Usado'}</strong></li>
                                    </ul>

                                    <p className="preview-desc">{datos.descripcion ? datos.descripcion : 'Sin descripción del producto.'}</p>

                                    <div className="preview-seller">
                                        <i className="fa-solid fa-circle-user" />
                                        <div>
                                            <strong>{auth?.user ? `${auth.user.nombre} ${auth.user.apellido}` : 'Vendedor'}</strong>
                                            <span><i className="fa-regular fa-star" /> {auth?.user?.reputacion || 'Nuevo vendedor'}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="preview-btn"
                                        disabled
                                        title="El checkout no está disponible en esta versión"
                                    >
                                        Comprar ahora · próximamente
                                    </button>
                                </div>
                            </article>
                        </aside>
                    </div>
                </form>
            </main>

            </WorkspaceChrome>
            <Footer onNavigate={onNavigate} />
        </div>
    )
}
