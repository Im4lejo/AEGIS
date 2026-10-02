import { useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import '../css/publicarProducto.css'

// Página de publicación de producto: formulario interactivo con vista previa de imágenes.
export default function PublicarProducto({ auth, onNavigate }) {
    const [datos, setDatos] = useState({
        titulo: '',
        categoria: '',
        marca: '',
        modelo: '',
        estado: '',
        precio: '',
        stock: '',
        descripcion: '',
    })
    const [fotoPrincipal, setFotoPrincipal] = useState('')
    const [fotos, setFotos] = useState(['', '', '', ''])
    const [mensaje, setMensaje] = useState(null)

    // Actualiza un campo del formulario
    const cambiarDato = (campo, valor) => {
        const nuevos = { ...datos }
        nuevos[campo] = valor
        setDatos(nuevos)
    }

    // Vista previa de la foto principal
    const elegirFotoPrincipal = (event) => {
        const archivo = event.target.files[0]
        if (!archivo) return
        const lector = new FileReader()
        lector.onload = () => setFotoPrincipal(lector.result)
        lector.readAsDataURL(archivo)
    }

    // Vista previa de cada foto secundaria
    const elegirFotoExtra = (event, indice) => {
        const archivo = event.target.files[0]
        if (!archivo) return
        const lector = new FileReader()
        lector.onload = () => {
            const nuevas = [...fotos]
            nuevas[indice] = lector.result
            setFotos(nuevas)
        }
        lector.readAsDataURL(archivo)
    }

    // Flecha de regreso al listado de productos
    const volver = () => {
        if (onNavigate) onNavigate('/productos')
    }

    // Envío del formulario: valida y muestra confirmación
    const publicar = (event) => {
        event.preventDefault()
        const titulo = datos.titulo.trim()
        const precio = datos.precio.trim()
        if (!titulo || !precio) {
            setMensaje({ tipo: 'error', texto: 'Completa el título del anuncio y el precio referencial.' })
            return
        }
        setMensaje({ tipo: 'success', texto: '¡Producto publicado con éxito!' })
    }

    return (
        <div className="page-layout">
            <Header title="AEGIS | Publicar Producto" auth={auth} onNavigate={onNavigate} />

            <main className="main-content publish-page">
                <form onSubmit={publicar}>
                    {/* Encabezado: volver + título + botón publicar */}
                    <div className="publish-header">
                        <div className="publish-title">
                            <button type="button" className="publish-back" onClick={volver} aria-label="Volver a productos">
                                <i className="fa-solid fa-arrow-left" />
                            </button>
                            <h1>Publicación..</h1>
                        </div>
                        <button type="submit" className="publish-btn">Publicar</button>
                    </div>

                    {mensaje && (
                        <div className={mensaje.tipo === 'error' ? 'publish-alert publish-alert--error' : 'publish-alert publish-alert--success'}>
                            {mensaje.texto}
                        </div>
                    )}

                    {/* Card 1: imágenes + información básica */}
                    <section className="publish-card">
                        <div className="images-section">
                            <h2>1. Imágenes</h2>
                            <div className="images-container">
                                <label className="main-image" htmlFor="foto-principal">
                                    {fotoPrincipal ? (
                                        <img src={fotoPrincipal} alt="Foto principal" />
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-camera" />
                                            <span>Añadir Foto Principal</span>
                                        </>
                                    )}
                                    <input className="foto-input" type="file" id="foto-principal" accept="image/*" onChange={elegirFotoPrincipal} />
                                </label>

                                <div className="small-images">
                                    {fotos.map((foto, indice) => (
                                        <label className="small-box" htmlFor={`foto-${indice}`} key={indice}>
                                            {foto ? <img src={foto} alt={`Foto ${indice + 1}`} /> : <i className="fa-solid fa-plus" />}
                                            <input className="foto-input" type="file" id={`foto-${indice}`} accept="image/*" onChange={(event) => elegirFotoExtra(event, indice)} />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="info-section">
                            <h2>2. Información Básica</h2>

                            <div className="input-group">
                                <label htmlFor="titulo">Título del anuncio</label>
                                <input id="titulo" type="text" value={datos.titulo} onChange={(event) => cambiarDato('titulo', event.target.value)} />
                            </div>

                            <div className="input-group">
                                <label htmlFor="categoria">Categoría</label>
                                <input id="categoria" type="text" value={datos.categoria} onChange={(event) => cambiarDato('categoria', event.target.value)} />
                            </div>

                            <div className="triple-grid">
                                <div className="input-group">
                                    <label htmlFor="marca">Marca</label>
                                    <input id="marca" type="text" value={datos.marca} onChange={(event) => cambiarDato('marca', event.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="modelo">Modelo</label>
                                    <input id="modelo" type="text" value={datos.modelo} onChange={(event) => cambiarDato('modelo', event.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="estado">Estado</label>
                                    <input id="estado" type="text" value={datos.estado} onChange={(event) => cambiarDato('estado', event.target.value)} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Card 2: detalles del intercambio */}
                    <section className="details-card">
                        <h2>3. Detalles del Intercambio</h2>

                        <div className="double-grid">
                            <div className="input-group">
                                <label htmlFor="precio">Precio Referencial</label>
                                <input id="precio" type="text" placeholder="COP 0.00" value={datos.precio} onChange={(event) => cambiarDato('precio', event.target.value)} />
                            </div>
                            <div className="input-group">
                                <label htmlFor="stock">Stock Disponibles</label>
                                <input id="stock" type="number" placeholder="0" value={datos.stock} onChange={(event) => cambiarDato('stock', event.target.value)} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="descripcion">Descripción (Opcional)</label>
                            <textarea id="descripcion" placeholder="Especificaciones opcionales..." value={datos.descripcion} onChange={(event) => cambiarDato('descripcion', event.target.value)} />
                        </div>
                    </section>
                </form>
            </main>

            <Footer onNavigate={onNavigate} />
        </div>
    )
}
