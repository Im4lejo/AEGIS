import { navigateTo, route } from '../shared/presentation'
import { HEADER_LINKS } from './headerNavigation'

const ICONS = {
    marketplace: (
        <>
            <rect x="3" y="3" width="8" height="8" rx="1" />
            <rect x="13" y="3" width="8" height="8" rx="1" />
            <rect x="3" y="13" width="8" height="8" rx="1" />
            <rect x="13" y="13" width="8" height="8" rx="1" />
        </>
    ),
    publish: (
        <>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </>
    ),
    forum: (
        <>
            <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6a7.5 7.5 0 1 1 17-3.5Z" />
            <path d="M8 11h8M8 14h5" />
        </>
    ),
    points: (
        <>
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
        </>
    ),
}

function NavbarIcon({ name }) {
    return (
        <svg
            aria-hidden="true"
            className="header-nav__icon"
            fill="none"
            focusable="false"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
        >
            {ICONS[name]}
        </svg>
    )
}

export default function Navbar({ onNavigate }) {
    const go = (event, path) => {
        if (event) event.preventDefault()
        navigateTo(path, onNavigate)
    }

    return (
        <nav className="header-nav">
            {HEADER_LINKS.map(({ href, label, icon }) => (
                <a href={route(href)} key={href} onClick={(event) => go(event, href)}>
                    <NavbarIcon name={icon} />
                    <span>{label}</span>
                </a>
            ))}
        </nav>
    )
}
