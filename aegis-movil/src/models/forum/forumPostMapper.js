export function formatForumPostAge(value) {
    const timestamp = new Date(value).getTime();
    if (!Number.isFinite(timestamp)) {
        return "";
    }

    const minutes = Math.floor(Math.max(0, Date.now() - timestamp) / 60000);
    if (minutes < 1) {
        return "Ahora";
    }
    if (minutes < 60) {
        return `Hace ${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `Hace ${hours} h`;
    }

    return `Hace ${Math.floor(hours / 24)} d`;
}

export function mapForumComment(comment) {
    const authorName = [
        comment.usuario?.nombre,
        comment.usuario?.apellido,
    ].filter(Boolean).join(" ");

    return {
        id: comment.id,
        author: authorName || comment.usuario?.username || "Usuario",
        avatar: comment.usuario?.foto_perfil || comment.usuario?.foto_perfil_url || null,
        body: comment.comentario,
    };
}

export function mapForumPost(post, author = post.usuario) {
    const content = post.contenido || "";
    const authorName = [
        author?.nombre,
        author?.apellido,
    ].filter(Boolean).join(" ");
    const comments = (post.comentarios || []).map(mapForumComment);

    return {
        id: post.id,
        author: authorName || author?.username || "Usuario",
        avatar: author?.foto_perfil || author?.foto_perfil_url || null,
        age: formatForumPostAge(post.fecha_publicacion),
        title: post.titulo && !content.startsWith(post.titulo)
            ? post.titulo
            : "",
        body: content,
        likes: Number(post.likes_count || 0),
        comments: Number(post.comentarios_count ?? comments.length),
        commentItems: comments,
        images: (post.imagenes || []).map((image) => image.imagen),
    };
}
