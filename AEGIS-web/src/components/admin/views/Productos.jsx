import PageFrame from '../../shared/PageFrame'
import { formatCurrency } from '../../shared/presentation'

export default function Productos({ productos = [], auth }) { return <PageFrame title="AEGIS | Productos" auth={auth}><main className="table-page"><h1>Productos</h1><table><thead><tr><th>Título</th><th>Precio</th><th>Ciudad</th><th>Estado</th></tr></thead><tbody>{productos.map((product) => <tr key={product.id}><td>{product.titulo}</td><td>${formatCurrency(product.precio)}</td><td>{product.ciudad}</td><td>{product.estado_publicacion}</td></tr>)}</tbody></table></main></PageFrame> }