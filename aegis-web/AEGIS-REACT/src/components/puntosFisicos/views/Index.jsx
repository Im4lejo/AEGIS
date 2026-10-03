import { useState } from 'react'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import '../css/verificados.css'

const PUNTOS = [
    {
        id: 1,
        nombre: 'TeachHub Center',
        direccion: 'Av. Principal 123, Local 4',
        horario: 'Lunes a Viernes, 9:00 AM - 6:00 PM',
        tiempo: '10 min',
        x: 49,
        y: 47.2,
        servicios: [
            { icono: 'fa-solid fa-square-parking', texto: 'Estacionamiento Disponible' },
            { icono: 'fa-solid fa-wifi', texto: 'Conexion Wi-Fi gratuita' },
            { icono: 'fa-solid fa-star', texto: 'Atencion Personalizada' },
        ],
    },
    {
        id: 2,
        nombre: 'Punto AEGIS Parque Caldas',
        direccion: 'Carrera 6 #15-40, Parque Caldas',
        horario: 'Lunes a Sabado, 8:00 AM - 7:00 PM',
        tiempo: '8 min',
        x: 44.8,
        y: 49.4,
        servicios: [
            { icono: 'fa-solid fa-handshake', texto: 'Entrega de productos' },
            { icono: 'fa-solid fa-wifi', texto: 'Conexion Wi-Fi gratuita' },
            { icono: 'fa-solid fa-star', texto: 'Atencion Personalizada' },
        ],
    },
    {
        id: 3,
        nombre: 'Punto AEGIS Los Almendros',
        direccion: 'Calle 5 #32-10, Barrio Los Almendros',
        horario: 'Lunes a Viernes, 8:00 AM - 5:00 PM',
        tiempo: '12 min',
        x: 41.6,
        y: 34.4,
        servicios: [
            { icono: 'fa-solid fa-square-parking', texto: 'Estacionamiento Disponible' },
            { icono: 'fa-solid fa-wifi', texto: 'Conexion Wi-Fi gratuita' },
            { icono: 'fa-solid fa-star', texto: 'Atencion Personalizada' },
        ],
    },
    {
        id: 4,
        nombre: 'Punto AEGIS El Poblado',
        direccion: 'Calle 17 #24-40, Barrio El Poblado',
        horario: 'Todos los dias, 9:00 AM - 8:00 PM',
        tiempo: '15 min',
        x: 47.4,
        y: 65.7,
        servicios: [
            { icono: 'fa-solid fa-handshake', texto: 'Entrega de productos' },
            { icono: 'fa-solid fa-wifi', texto: 'Conexion Wi-Fi gratuita' },
            { icono: 'fa-solid fa-star', texto: 'Atencion Personalizada' },
        ],
    },
    {
        id: 5,
        nombre: 'Punto AEGIS Centro Comercial',
        direccion: 'Carrera 3 #12-20, Centro',
        horario: 'Lunes a Viernes, 8:30 AM - 6:30 PM',
        tiempo: '9 min',
        x: 58.5,
        y: 39.5,
        servicios: [
            { icono: 'fa-solid fa-square-parking', texto: 'Estacionamiento Disponible' },
            { icono: 'fa-solid fa-wifi', texto: 'Conexion Wi-Fi gratuita' },
            { icono: 'fa-solid fa-star', texto: 'Atencion Personalizada' },
        ],
    },
]

function InfoLugar({ punto, onVer }) {
    return (
        <div className="pv-info">
            <div className="pv-verificado">
                <i className="fa-solid fa-circle-check" />
                <span>Sitio Verificado</span>
            </div>
            <h3 className="pv-nombre">{punto.nombre}</h3>
            <p className="pv-dato">{punto.direccion}</p>
            <p className="pv-dato"><strong>Horario:</strong> {punto.horario}</p>
            {punto.servicios.map((servicio) => (
                <p className="pv-servicio" key={servicio.texto}>
                    <i className={servicio.icono} />
                    <span>{servicio.texto}</span>
                </p>
            ))}
            <button type="button" className="pv-boton" onClick={onVer}>VER UBICACIÓN</button>
        </div>
    )
}

export default function Index({ auth, onNavigate }) {
    const [abierto, setAbierto] = useState(null)
    const [verTiempo, setVerTiempo] = useState(true)
    const [destacado, setDestacado] = useState(null)

    const lugar = PUNTOS.find((punto) => punto.id === abierto)

    const abrirLugar = (id) => {
        setAbierto(id)
        setDestacado(null)
        setVerTiempo(true)
    }

    const enfocarLugar = () => {
        setDestacado(lugar ? lugar.id : null)
        setVerTiempo(true)
    }

    const clasePunto = (punto) => {
        if (abierto === punto.id) return 'pv-punto pv-punto-activo'
        if (destacado === punto.id) return 'pv-punto pv-punto-destacado'
        return 'pv-punto'
    }

    return (
        <div className="page-layout verificados-layout">
            <Header title="AEGIS | Puntos Verificados" auth={auth} onNavigate={onNavigate} />

            <div className="pv-contenido">
                <div className="pv-fila">
                    {lugar && (
                        <aside className="pv-panel">
                            <button type="button" className="pv-cerrar" onClick={() => setAbierto(null)} aria-label="Cerrar">
                                <i className="fa-solid fa-xmark" />
                            </button>
                            <InfoLugar punto={lugar} onVer={enfocarLugar} />
                        </aside>
                    )}

                    <div className="pv-zona-mapa">
                        <div className="pv-mapa-caja">
                            <img className="pv-mapa-img" src="/mapa-popayan.png" alt="Mapa de Popayan" />
                            {PUNTOS.map((punto) => (
                                <button
                                    key={punto.id}
                                    type="button"
                                    className={clasePunto(punto)}
                                    style={{ left: punto.x + '%', top: punto.y + '%' }}
                                    title={punto.nombre}
                                    aria-label={punto.nombre}
                                    onClick={() => abrirLugar(punto.id)}
                                />
                            ))}
                        </div>
                        <button type="button" className="pv-ruta" onClick={() => setVerTiempo(!verTiempo)}>
                            <i className="fa-solid fa-person-walking" />
                            <span>Mostrar Ruta</span>
                        </button>
                        {verTiempo && (
                            <div className="pv-tiempo">
                                Tiempo estimado: {lugar ? lugar.tiempo : '10 min'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer onNavigate={onNavigate} />
        </div>
    )
}
