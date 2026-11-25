import Header from '../layouts/Header'
import Footer from '../layouts/Footer'
import WorkspaceChrome from '../layouts/WorkspaceChrome'

export default function PageFrame({ children, title, stylesheet, auth, onNavigate }) {
    return (
        <div className="page-layout">
            <Header title={title} stylesheet={stylesheet} auth={auth} onNavigate={onNavigate} />
            <WorkspaceChrome auth={auth} onNavigate={onNavigate}>{children}</WorkspaceChrome>
            <Footer onNavigate={onNavigate} />
        </div>
    )
}