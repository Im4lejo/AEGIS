import Head from './Head'
import Navbar from './Navbar'

export default function Header({ title, stylesheet, auth, onNavigate }) {
    return (
        <>
            <Head title={title} stylesheet={stylesheet} />
            <Navbar auth={auth} onNavigate={onNavigate} />
        </>
    )
}