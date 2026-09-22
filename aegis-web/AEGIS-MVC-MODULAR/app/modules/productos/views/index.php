<?php require_once ROOT_PATH . '/app/layouts/head.php'; ?>
<?php require_once ROOT_PATH . '/app/layouts/navbar.php'; ?>

<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
<link rel="stylesheet" href="<?= asset('css/pages/productos.css') ?>">

<main class="products-main-container">
    <!-- Panel de Filtros -->
    <aside class="filters-sidebar">
        <h2 class="filters-title">Filtros</h2>
        
        <form id="filtersForm" method="GET" action="<?= url('/productos') ?>" style="display: none;">
            <input type="hidden" name="busqueda" id="filterBusqueda" value="<?= htmlspecialchars($filtros['busqueda'] ?? '') ?>">
            <input type="hidden" name="precio_max" id="filterPrecioMax" value="<?= htmlspecialchars($filtros['precio_max'] ?? '') ?>">
            <input type="hidden" name="estado" id="filterEstado" value="<?= htmlspecialchars($filtros['estado'] ?? 'todo') ?>">
            <input type="hidden" name="cat" id="filterCategoria" value="<?= htmlspecialchars($filtros['categoria'] ?? '') ?>">
            <input type="hidden" name="sort" id="filterSort" value="<?= htmlspecialchars($filtros['sort'] ?? 'reciente') ?>">
        </form>

        <div class="filter-group">
            <span class="filter-heading">Precio Máximo</span>
            <div class="filter-label-row">
                <span>Hasta</span>
                <span class="price-badge" id="priceBadge">5'000.000</span>
            </div>
            <input type="range" class="price-slider" id="priceRange" min="0" max="5000000" value="<?= $filtros['precio_max'] > 0 ? $filtros['precio_max'] : '5000000' ?>">
            <div class="range-limits">
                <span>0 COP</span>
                <span>5'000.000 COP</span>
            </div>
        </div>

        <div class="filter-group">
            <span class="filter-heading">Estado del Producto</span>
            <div class="radio-options">
                <label class="radio-label">
                    <input type="radio" name="estado" value="todo" <?= ($filtros['estado'] ?? 'todo') === 'todo' ? 'checked' : '' ?>>
                    <span class="custom-radio"></span> Todo
                </label>
                <label class="radio-label">
                    <input type="radio" name="estado" value="nuevo" <?= ($filtros['estado'] ?? 'todo') === 'nuevo' ? 'checked' : '' ?>>
                    <span class="custom-radio"></span> Nuevo
                </label>
                <label class="radio-label">
                    <input type="radio" name="estado" value="casi-nuevo" <?= ($filtros['estado'] ?? 'todo') === 'casi-nuevo' ? 'checked' : '' ?>>
                    <span class="custom-radio"></span> Casi Nuevo
                </label>
                <label class="radio-label">
                    <input type="radio" name="estado" value="usado-buen-estado" <?= ($filtros['estado'] ?? 'todo') === 'usado-buen-estado' ? 'checked' : '' ?>>
                    <span class="custom-radio"></span> Usado - Buen estado
                </label>
                <label class="radio-label">
                    <input type="radio" name="estado" value="usado-detalles" <?= ($filtros['estado'] ?? 'todo') === 'usado-detalles' ? 'checked' : '' ?>>
                    <span class="custom-radio"></span> Usado - Con detalles
                </label>
                <label class="radio-label">
                    <input type="radio" name="estado" value="usado-mal-estado" <?= ($filtros['estado'] ?? 'todo') === 'usado-mal-estado' ? 'checked' : '' ?>>
                    <span class="custom-radio"></span> Usado - Mal estado
                </label>
            </div>
        </div>

        <?php if (!empty($categorias)): ?>
        <div class="filter-group">
            <span class="filter-heading">Categoría</span>
            <div class="radio-options">
                <label class="radio-label">
                    <input type="radio" name="categoria" value="" <?= empty($filtros['categoria']) ? 'checked' : '' ?>>
                    <span class="custom-radio"></span> Todas
                </label>
                <?php foreach ($categorias as $cat): ?>
                <label class="radio-label">
                    <input type="radio" name="categoria" value="<?= htmlspecialchars($cat['nombre']) ?>" <?= ($filtros['categoria'] ?? '') === $cat['nombre'] ? 'checked' : '' ?>>
                    <span class="custom-radio"></span> <?= htmlspecialchars($cat['nombre']) ?>
                </label>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>
    </aside>

    <!-- Sección de Contenido Principal -->
    <section class="content-section">
        
        <div class="search-utilities-bar">
            <span class="results-count" id="resultsCount"><?= count($productos ?? []) ?> Productos Encontrados</span>
            
            <div class="search-bar-wrapper">
                <span class="material-symbols-outlined search-icon">search</span>
                <input type="text" id="searchInput" placeholder="Busca tu producto aquí..." class="main-search-input" value="<?= htmlspecialchars($filtros['busqueda'] ?? '') ?>">
            </div>

            <div class="view-controls">
                <select class="sort-select" id="sortSelect" onchange="applyFilters()">
                    <option value="reciente" <?= ($filtros['sort'] ?? 'reciente') === 'reciente' ? 'selected' : '' ?>>Más Relevante</option>
                    <option value="precio-asc" <?= ($filtros['sort'] ?? 'reciente') === 'precio-asc' ? 'selected' : '' ?>>Precio: Menor a Mayor</option>
                    <option value="precio-desc" <?= ($filtros['sort'] ?? 'reciente') === 'precio-desc' ? 'selected' : '' ?>>Precio: Mayor a Menor</option>
                </select>
                <div class="layout-toggle-buttons">
                    <button class="grid-btn active" type="button" onclick="toggleLayout('grid')" title="Vista en cuadrícula">
                        <span class="material-symbols-outlined">grid_view</span>
                    </button>
                    <button class="list-btn" type="button" onclick="toggleLayout('list')" title="Vista en lista">
                        <span class="material-symbols-outlined">view_list</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="products-grid-container" id="productsContainer">
            <?php if (empty($productos)): ?>
                <div class="no-products-message">
                    <p>No se encontraron productos con los filtros seleccionados.</p>
                </div>
            <?php else: ?>
                <?php foreach ($productos as $producto): 
                    // Determinar la etiqueta y clase del estado
                    $estado = $producto['estado_producto'] ?? 'usado';
                    $etiqueta = match($estado) {
                        'nuevo' => 'Nuevo',
                        'casi-nuevo' => 'Casi Nuevo',
                        'usado-buen-estado' => 'Buen Estado',
                        'usado-detalles' => 'Con Detalles',
                        'usado-mal-estado' => 'Mal Estado',
                        default => 'Producto'
                    };
                    $clase_etiqueta = $estado === 'nuevo' ? 'tag-nuevo' : 'tag-usado';
                    
                    // Obtener imagen principal - construcción correcta de la URL
                    $imagenUrl = !empty($producto['imagen_principal']) 
                        ? url('/Assets/uploads/products/' . htmlspecialchars($producto['imagen_principal'])) 
                        : 'https://via.placeholder.com/240x160?text=Sin+Imagen';
                ?>
                <article class="product-card" onclick="window.location.href='<?= url('/productos/detalle?id=' . (int)$producto['id']) ?>'">
                    <div class="product-image-container">
                        <div class="product-image" style="background-image: url('<?= htmlspecialchars($imagenUrl) ?>')"></div>
                        <span class="product-tag <?= $clase_etiqueta ?>"><?= $etiqueta ?></span>
                    </div>
                    <div class="product-details">
                        <h3 class="product-title"><?= htmlspecialchars($producto['titulo']) ?></h3>
                        <span class="product-condition"><?= htmlspecialchars($producto['categoria_nombre'] ?? 'Producto') ?></span>
                        <div class="price-row">
                            <span class="product-price">COP <?= number_format((float)$producto['precio'], 0, ',', '.') ?></span>
                            <?php if (!empty($producto['vendedor_nombre'])): ?>
                            <div class="seller-info">
                                <div class="seller-avatar"></div>
                                <div class="seller-text">
                                    <span class="seller-name"><?= htmlspecialchars($producto['vendedor_nombre']) ?> <strong>(<?= htmlspecialchars($producto['vendedor_reputacion'] ?? '4.9') ?>)</strong></span>
                                    <span class="seller-meta">Vendedor verificado</span>
                                </div>
                            </div>
                            <?php endif; ?>
                        </div>
                        <a href="<?= url('/productos/detalle?id=' . (int)$producto['id']) ?>" class="add-to-cart-btn" onclick="event.stopPropagation()">Ver Detalle</a>
                    </div>
                </article>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </section>
</main>

<?php require_once ROOT_PATH . '/app/layouts/footer.php'; ?>

<script>
    // Inicializar el badge de precio al cargar la página
    document.addEventListener('DOMContentLoaded', function() {
        const priceRange = document.getElementById('priceRange');
        const precio = parseInt(priceRange.value);
        updatePriceBadge(precio);
    });

    // Función para actualizar el badge de precio
    function updatePriceBadge(precio) {
        const badge = document.getElementById('priceBadge');
        if (precio === 5000000) {
            badge.textContent = '5\'000.000';
        } else {
            const formatter = new Intl.NumberFormat('es-CO');
            badge.textContent = formatter.format(precio);
        }
    }

    // Manejo de la barra de búsqueda
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    // Manejo del deslizador de precio
    document.getElementById('priceRange').addEventListener('input', function(e) {
        const precio = parseInt(e.target.value);
        updatePriceBadge(precio);
    });

    // Manejo de cambios en los filtros
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', applyFilters);
    });

    function applyFilters() {
        const busqueda = document.getElementById('searchInput').value;
        const precioMax = document.getElementById('priceRange').value;
        const estado = document.querySelector('input[name="estado"]:checked').value;
        const categoria = document.querySelector('input[name="categoria"]:checked')?.value || '';
        const sort = document.getElementById('sortSelect').value;

        const url = new URL('<?= url('/productos') ?>', window.location.origin);
        if (busqueda) url.searchParams.set('busqueda', busqueda);
        if (precioMax && precioMax !== '5000000') url.searchParams.set('precio_max', precioMax);
        if (estado !== 'todo') url.searchParams.set('estado', estado);
        if (categoria) url.searchParams.set('cat', categoria);
        if (sort !== 'reciente') url.searchParams.set('sort', sort);

        window.location.href = url.toString();
    }

    function toggleLayout(layout) {
        const container = document.getElementById('productsContainer');
        const gridBtn = document.querySelector('.grid-btn');
        const listBtn = document.querySelector('.list-btn');
        const cards = container.querySelectorAll('.product-card');

        if (layout === 'list') {
            container.classList.add('products-list-container');
            container.classList.remove('products-grid-container');
            cards.forEach(card => card.classList.add('list-view'));
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
        } else {
            container.classList.remove('products-list-container');
            container.classList.add('products-grid-container');
            cards.forEach(card => card.classList.remove('list-view'));
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        }
    }
</script>

