export default function Head({ title = 'AEGIS', stylesheet }) {
    return (
        <>
            <title>{title}</title>
            <meta name="description" content="AEGIS, mercado de tecnología segura." />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
            {stylesheet && <link rel="stylesheet" href={stylesheet} />}
        </>
    )
}