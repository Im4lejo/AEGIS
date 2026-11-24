import { useEffect, useState } from 'react'
import PageFrame from '../../shared/PageFrame'
import { adminApi } from '../../../services/api'

export default function Usuarios({ auth }) {
  const [users, setUsers] = useState([])
  const [filters, setFilters] = useState({ q: '', rol: '', estado: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = () => {
    adminApi.users(filters, auth?.token)
      .then(({ data }) => setUsers(Array.isArray(data) ? data : []))
      .catch((requestError) => setError(requestError.message))
  }

  useEffect(load, [auth?.token])

  const update = async (user, field, value) => {
    if (!window.confirm(`¿Confirmar cambio ${field} de ${user.username}?`)) return
    try {
      await adminApi.updateUser(user.id, {
        [field]: value,
        confirmacion: 'CONFIR',
      }, auth.token)
      setMessage('Cuenta actualizada.')
      setError('')
      load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <PageFrame title="AEGIS | Usuarios" auth={auth}>
      <main className="table-page">
        <h1>Administración de cuentas</h1>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <form onSubmit={(event) => { event.preventDefault(); load() }}>
          <input aria-label="Buscar" placeholder="Nombre, usuario o email" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
          <select aria-label="Rol" value={filters.rol} onChange={(event) => setFilters({ ...filters, rol: event.target.value })}>
            <option value="">Todos los roles</option><option value="usuario">Usuario</option><option value="owner">Owner</option><option value="admin">Admin</option>
          </select>
          <select aria-label="Estado" value={filters.estado} onChange={(event) => setFilters({ ...filters, estado: event.target.value })}>
            <option value="">Todos los estados</option><option value="activo">Activo</option><option value="suspendido">Suspendido</option><option value="baneado">Baneado</option>
          </select>
          <button type="submit">Filtrar</button>
        </form>
        <table>
          <thead><tr><th>Cuenta</th><th>Email</th><th>Rol</th><th>Estado</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.nombre} {user.apellido}<br /><small>{user.username}</small></td>
                <td>{user.email}</td>
                <td>
                  <select value={user.rol} onChange={(event) => update(user, 'rol', event.target.value)}>
                    <option value="usuario">Usuario</option><option value="owner">Owner</option><option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <select value={user.estado} onChange={(event) => update(user, 'estado', event.target.value)}>
                    <option value="activo">Activo</option><option value="suspendido">Suspendido</option><option value="baneado">Baneado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </PageFrame>
  )
}