import PageFrame from '../../shared/PageFrame'
import { route } from '../../shared/presentation'

export default function Index({ puntos = [], auth }) { return <PageFrame title="AEGIS | Puntos físicos" auth={auth}><main className="table-page"><h1>Puntos físicos verificados</h1><div className="points-grid">{puntos.map((point) => <article key={point.id}><h3>{point.nombre}</h3><p>{point.ciudad}</p><p>{point.direccion}</p><a href={route(`/puntos-fisicos/${point.id}`)}>Ver punto</a></article>)}</div></main></PageFrame> }