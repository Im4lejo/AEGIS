import { useState } from 'react'
import PageFrame from '../../shared/PageFrame'
import { avatarUrl, formatCurrency, route } from '../../shared/presentation'

export default function Perfil({ usuario = {}, publicaciones = [], productos = [], esPropio = false, auth }) {
    const [avatar, setAvatar] = useState(usuario.avatar || avatarUrl(usuario, 140))
    const handleAvatarChange = (event) => {
        const [file] = event.target.files
        if (!file) return
        const reader = new FileReader()
        reader.onload = (loadEvent) => setAvatar(loadEvent.target.result)
        reader.readAsDataURL(file)
        event.currentTarget.form?.requestSubmit()
    }

    return <PageFrame title="AEGIS | Perfil" auth={auth}><main className="page"><section className="profile-card"><div className="cover" /><div className="profile-body"><div className="profile-row"><form method="POST" action={route('/perfil/editar')} encType="multipart/form-data"><img className="avatar-profile" src={avatar} alt="Foto de perfil" />{esPropio && <><label htmlFor="fotoPerfilInput" className="avatar-edit-btn" title="Cambiar foto de perfil"><i className="fa-solid fa-camera" /></label><input id="fotoPerfilInput" type="file" name="foto_perfil" accept="image/*" hidden onChange={handleAvatarChange} /></>}</form><div className="profile-info"><div className="profile-name">{usuario.nombre} {usuario.apellido}</div><div className="profile-handle">@{usuario.username || usuario.email || 'usuario'}</div><span className="chip">Reputación: {Number(usuario.reputacion || 5).toFixed(1)}</span>{esPropio && <a href={route('/perfil/editar')} className="btn-alt">Editar perfil</a>}</div></div></div></section><div className="content"><div className="left-col"><section className="info-card"><h3>Descripción</h3><p>{usuario.descripcion || 'Sin descripción disponible.'}</p><div className="info-row"><span>Ciudad</span><strong>{usuario.ciudad || 'No definida'}</strong></div><div className="info-row"><span>Correo</span><strong>{usuario.email || '-'}</strong></div></section><section className="pub-card"><h3>Publicaciones</h3>{publicaciones.length === 0 && <p>No hay publicaciones para este perfil.</p>}{publicaciones.map((publication) => <a href={route('/foro')} className="pub-item" key={publication.id}><div><strong>{publication.titulo}</strong><p>{publication.contenido}</p></div></a>)}</section></div><div className="right-col"><section className="profile-products-card"><h3>Productos del Vendedor</h3>{productos.map((product) => <a href={route(`/productos/detalle?id=${product.id}`)} className="profile-product-card" key={product.id}><h4>{product.titulo}</h4><span>COP {formatCurrency(product.precio)}</span></a>)}</section></div></div></main></PageFrame>
}