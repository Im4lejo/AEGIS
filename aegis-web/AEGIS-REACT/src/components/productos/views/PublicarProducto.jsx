import { useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import { guardarProductoPublicado } from '../productosDemo'
import '../css/publicarProducto.css'


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
    const [fotosMoviles, setFotosMoviles] = useState([])
    const [mensaje, setMensaje] = useState(null)
    const [publicado, setPublicado] = useState(false)


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

    const elegirFotoPrincipal = (event) => {
        comprimir(event.target.files[0], setFotoPrincipal)
    }

    const elegirFotoExtra = (event, indice) => {
        comprimir(event.target.files[0], (datosFoto) => {
            const nuevas = [...fotos]
            nuevas[indice] = datosFoto
            setFotos(nuevas)
        })
    }

    const elegirFotos = (event) => {
        const archivos = Array.from(event.target.files)
        archivos.forEach((archivo, indice) => {
            comprimir(archivo, (datosFoto) => {
                if (indice === 0) {
                    if (fotoPrincipal) {
                        setFotosMoviles((previas) => [fotoPrincipal, ...previas])
                    }
                    setFotoPrincipal(datosFoto)
                } else {
                    setFotosMoviles((previas) => [...previas, datosFoto])
                }
            })
        })
        event.target.value = ''
    }

    const volver = () => {
        if (onNavigate) onNavigate('/productos')
    }

    const publicar = (event) => {
        event.preventDefault()
        const titulo = datos.titulo.trim()
        const precio = Number(datos.precio.split('').filter((letra) => '0123456789'.indexOf(letra) !== -1).join(''))
        if (!titulo || !precio || !fotoPrincipal) {
            setMensaje({ tipo: 'error', texto: 'Completa el título, el precio y añade la foto principal del producto.' })
            return
        }
        const nuevo = {
            id: 'mio-' + Date.now(),
            nombre: titulo,
            titulo: titulo,
            descripcion: datos.descripcion.trim(),
            categoria: datos.categoria.trim(),
            marca: datos.marca.trim(),
            modelo: datos.modelo.trim(),
            estado: datos.estado.trim().toLowerCase() || 'usado',
            precio: precio,
            stock: datos.stock.trim() === '' ? 1 : Number(datos.stock),
            imagen: fotoPrincipal,
            fotos: [...fotos.filter((foto) => foto), ...fotosMoviles],
            vendedor: { id: 4, nombre: 'Luis Alejandro Montenegro Ojeda', reputacion: 4.7 },
            mio: true,
            publicadoEn: Date.now(),
        }
        guardarProductoPublicado(nuevo)
        setMensaje(null)
        setPublicado(true)
    }

    return (
        <div className="page-layout">
            <Header title="AEGIS | Publicar Producto" auth={auth} onNavigate={onNavigate} />

            <main className="main-content publish-page">
                {publicado ? (
                    <div className="publish-success">
                        <i className="fa-solid fa-circle-check" />
                        <h1>Producto publicado correctamente</h1>
                        <p>Tu producto ya aparece en Novedades, en la lista de productos y en la sección "Productos del Vendedor" de tu perfil.</p>
                        <button type="button" className="publish-btn" onClick={() => onNavigate && onNavigate('/')}>Ir al Home</button>
                    </div>
                ) : (
                <form onSubmit={publicar}>

                    <div className="publish-header">
                        <div className="publish-title">
                            <button type="button" className="publish-back" onClick={volver} aria-label="Volver a productos">
                                <i className="fa-solid fa-arrow-left" />
                            </button>
                            <h1>Publicación..</h1>
                        </div>
                        <button type="submit" className="publish-btn publish-btn-top">Publicar</button>
                    </div>

                    {mensaje && (
                        <div className={mensaje.tipo === 'error' ? 'publish-alert publish-alert--error' : 'publish-alert publish-alert--success'}>
                            {mensaje.texto}
                        </div>
                    )}

                    <section className="publish-card">
                        <div className="images-section images-escritorio">
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
                            <h2><span className="num-escritorio">2.</span><span className="num-movil">1.</span> Información Básica</h2>

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

                    <section className="details-card">
                        <h2><span className="num-escritorio">3.</span><span className="num-movil">2.</span> Detalles del Intercambio</h2>

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

                    <section className="details-card images-movil">
                        <div className="images-section">
                            <h2>3. Imágenes</h2>
                            <div className="images-container">
                                <label className="main-image" htmlFor="foto-principal-movil">
                                    {fotoPrincipal ? (
                                        <>
                                            <img src={fotoPrincipal} alt="Foto principal" />
                                            <span className="main-image-mas">+ Agregar más</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-camera" />
                                            <span>Añadir Fotos</span>
                                        </>
                                    )}
                                    <input className="foto-input" type="file" id="foto-principal-movil" accept="image/*" multiple onChange={elegirFotos} />
                                </label>
                            </div>

                            {fotosMoviles.length > 0 && (
                                <div className="miniaturas">
                                    {fotosMoviles.map((foto, indice) => (
                                        <div className="small-box" key={indice}>
                                            <img src={foto} alt={`Foto ${indice + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="publish-actions">
                        <button type="submit" className="publish-btn">Publicar</button>
                    </div>
                </form>
                )}
            </main>

            <Footer onNavigate={onNavigate} />
        </div>
    )
}
