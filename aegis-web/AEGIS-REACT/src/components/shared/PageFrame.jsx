import Header from '../layouts/Header'
import Footer from '../layouts/Footer'

export default function PageFrame({ children, title, stylesheet, auth }) {
    return <><Header title={title} stylesheet={stylesheet} auth={auth} />{children}<Footer /></>
}