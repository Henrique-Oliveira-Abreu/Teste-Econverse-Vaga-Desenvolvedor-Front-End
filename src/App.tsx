import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { getProducts } from './services/productService';
import type { Product } from './types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(price);

function Icon({
  name,
  size = 20,
}: {
  name: 'search' | 'user' | 'bag' | 'arrow' | 'spark' | 'phone' | 'headphones' | 'watch' | 'camera' | 'close' | 'chevron';
  size?: number;
}) {
  const paths: Record<typeof name, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    phone: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></>,
    headphones: <><path d="M3 14v-3a9 9 0 0 1 18 0v3" /><rect x="3" y="13" width="5" height="8" rx="2" /><rect x="16" y="13" width="5" height="8" rx="2" /></>,
    watch: <><rect x="6" y="7" width="12" height="10" rx="3" /><path d="m9 7 .5-4h5L15 7m0 10 .5 4h-5L9 17" /></>,
    camera: <><path d="M14 5h-4L8 8H4v12h16V8h-4l-2-3Z" /><circle cx="12" cy="14" r="3" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const categories = [
  { name: 'Smartphones', icon: 'phone' as const, color: 'lavender' },
  { name: 'Áudio', icon: 'headphones' as const, color: 'peach' },
  { name: 'Smartwatches', icon: 'watch' as const, color: 'mint' },
  { name: 'Acessórios', icon: 'camera' as const, color: 'yellow' },
];

const brands = ['apple', 'SAMSUNG', 'Xiaomi', 'motorola', 'JBL', 'SONY'];

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const productRail = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    getProducts(controller.signal)
      .then(setProducts)
      .catch((loadError: unknown) => {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Ocorreu um erro ao carregar o catálogo.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !selectedProduct) return;

    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('pt-BR');
    if (!query) return products;
    return products.filter((product) =>
      `${product.productName} ${product.descriptionShort}`.toLocaleLowerCase('pt-BR').includes(query),
    );
  }, [products, searchTerm]);

  const scrollProducts = (direction: -1 | 1) => {
    productRail.current?.scrollBy({
      left: direction * 300,
      behavior: 'smooth',
    });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  const addToCart = () => setCartCount((count) => count + 1);

  return (
    <>
      <div className="announcement">
        <div className="announcement__inner">
          <span><Icon name="spark" size={15} /> FRETE GRÁTIS ACIMA DE R$ 499</span>
          <span className="announcement__divider" />
          <span>Parcele em até 10x sem juros</span>
          <a href="#ofertas">Confira as ofertas <Icon name="arrow" size={14} /></a>
        </div>
      </div>

      <header className="site-header">
        <div className="header-main page-width">
          <a className="brand" href="#inicio" aria-label="Econverse, início">
            <span className="brand__mark">e</span>
            <span className="brand__name">econverse<span>.</span></span>
          </a>

          <form className="search" role="search" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="site-search">Buscar produtos</label>
            <input
              id="site-search"
              type="search"
              placeholder="O que você está procurando?"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit" aria-label="Buscar"><Icon name="search" /></button>
          </form>

          <div className="header-actions">
            <button className="icon-button account-button" type="button" aria-label="Minha conta">
              <Icon name="user" size={21} />
              <span>Minha conta</span>
            </button>
            <button className="icon-button cart-button" type="button" aria-label={`Sacola, ${cartCount} itens`}>
              <Icon name="bag" size={21} />
              <span className="cart-button__label">Sacola</span>
              <span className="cart-count">{cartCount}</span>
            </button>
          </div>
        </div>
        <nav className="main-nav" aria-label="Navegação principal">
          <div className="page-width main-nav__inner">
            <a className="main-nav__active" href="#categorias">Todos os produtos</a>
            <a href="#produtos">Smartphones</a>
            <a href="#categorias">Áudio</a>
            <a href="#categorias">Smartwatches</a>
            <a href="#categorias">Acessórios</a>
            <a className="main-nav__sale" href="#ofertas">Ofertas especiais <span>↗</span></a>
          </div>
        </nav>
      </header>

      <main id="inicio">
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow"><span /> TECNOLOGIA QUE CONECTA</p>
            <h1 id="hero-title">O próximo capítulo<br />começa <em>agora.</em></h1>
            <p className="hero__description">Descubra a tecnologia que acompanha o seu ritmo. Novidades incríveis, do seu jeito.</p>
            <a href="#produtos" className="button button--dark">Explorar produtos <Icon name="arrow" size={17} /></a>
            <div className="hero__note"><span className="hero__note-icon"><Icon name="spark" size={16} /></span><span>Seu mundo. Do seu jeito.<br /><strong>Seu próximo favorito está aqui.</strong></span></div>
          </div>
          <div className="hero__art" aria-label="Smartphone em destaque">
            <div className="hero__orb" />
            <div className="hero__sun" />
            <div className="hero__image-wrap">
              <img
                src={products[0]?.photo ?? 'https://app.econverse.com.br/teste-front-end/junior/tecnologia/fotos-produtos/foto-iphone.png'}
                alt="Smartphone em destaque"
              />
            </div>
            <div className="hero__product-tag"><span className="hero__tag-dot" /><span>TECNOLOGIA<br /><strong>SEM LIMITES</strong></span></div>
            <span className="hero__star hero__star--one">✳</span>
            <span className="hero__star hero__star--two">✳</span>
            <span className="hero__vertical">INOVAÇÃO • ESTILO • CONEXÃO</span>
          </div>
          <span className="hero__index">01 <span /> 03</span>
        </section>

        <section className="category-section page-width" id="categorias" aria-labelledby="categories-title">
          <div className="section-heading">
            <div><p className="eyebrow">ENCONTRE O SEU</p><h2 id="categories-title">Explore por categoria</h2></div>
            <a className="text-link" href="#produtos">Ver tudo <Icon name="arrow" size={16} /></a>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <a className="category-card" href="#produtos" key={category.name}>
                <span className={`category-card__icon category-card__icon--${category.color}`}><Icon name={category.icon} size={26} /></span>
                <span className="category-card__name">{category.name}</span>
                <span className="category-card__arrow"><Icon name="arrow" size={17} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="brand-strip" aria-label="Marcas parceiras">
          <div className="page-width brand-strip__inner">
            <span className="brand-strip__label">AS MARCAS QUE<br /><strong>VOCÊ AMA</strong></span>
            <div className="brand-strip__logos">
              {brands.map((brand) => <span className={`brand-logo brand-logo--${brand.toLowerCase()}`} key={brand}>{brand}</span>)}
            </div>
          </div>
        </section>

        <section className="products-section page-width" id="produtos" aria-labelledby="products-title">
          <div className="section-heading">
            <div><p className="eyebrow">SELECIONADOS PARA VOCÊ</p><h2 id="products-title">{searchTerm ? 'Resultados da busca' : 'Favoritos da semana'}<span className="heading-period">.</span></h2></div>
            <div className="carousel-controls">
              <a className="text-link products-see-all" href="#ofertas">Ver todos <Icon name="arrow" size={16} /></a>
              <button type="button" aria-label="Produtos anteriores" onClick={() => scrollProducts(-1)}><Icon name="chevron" size={19} /></button>
              <button type="button" aria-label="Próximos produtos" onClick={() => scrollProducts(1)}><Icon name="chevron" size={19} /></button>
            </div>
          </div>

          {loading && <p className="catalog-message" role="status">Carregando os produtos...</p>}
          {error && <div className="catalog-message catalog-message--error" role="alert"><strong>Não conseguimos carregar a vitrine.</strong><span>{error} Atualize a página para tentar novamente.</span></div>}
          {!loading && !error && filteredProducts.length === 0 && <p className="catalog-message">Nenhum produto encontrado para “{searchTerm}”.</p>}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="product-rail" ref={productRail}>
              {filteredProducts.map((product, index) => (
                <article className="product-card" key={`${product.productName}-${index}`}>
                  <button className="product-card__image" type="button" onClick={() => setSelectedProduct(product)} aria-label={`Ver detalhes de ${product.productName}`}>
                    {index < 2 && <span className="product-card__badge">MAIS VENDIDO</span>}
                    <img src={product.photo} alt={product.productName} loading="lazy" />
                    <span className="product-card__quick-view">Ver detalhes <Icon name="arrow" size={14} /></span>
                  </button>
                  <div className="product-card__content">
                    <p className="product-card__eyebrow">SMARTPHONES <span>•</span> ECONVERSE</p>
                    <h3><button type="button" onClick={() => setSelectedProduct(product)}>{product.productName}</button></h3>
                    <p className="product-card__description">{product.descriptionShort}</p>
                    <div className="product-card__price">{formatPrice(product.price)}</div>
                    <p className="product-card__installments">ou 10x de {formatPrice(product.price / 10)} sem juros</p>
                    <button className="button button--buy" type="button" onClick={addToCart}>Adicionar à sacola <Icon name="arrow" size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && !error && products.length > 0 && <div className="carousel-progress"><span style={{ width: `${Math.min(100, 100 / products.length * Math.max(1, filteredProducts.length))}%` }} /></div>}
        </section>

        <section className="promo page-width" id="ofertas">
          <div className="promo__copy"><p className="eyebrow">UM BOM MOMENTO PARA CONECTAR</p><h2>Novidades que<br />valem a <em>pena.</em></h2><p>O seu próximo favorito está a um clique de distância.</p><a href="#produtos" className="button button--dark">Ver ofertas <Icon name="arrow" size={17} /></a></div>
          <div className="promo__graphic"><span className="promo__circle" /><span className="promo__spark">✳</span><div className="promo__badge">ATÉ<br /><strong>10x</strong><br />SEM JUROS</div><span className="promo__caption">GOOD<br />THINGS<br />AHEAD.</span></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width site-footer__inner">
          <a className="brand brand--footer" href="#inicio"><span className="brand__mark">e</span><span className="brand__name">econverse<span>.</span></span></a>
          <p>Tecnologia que aproxima você do que importa.</p>
          <span>© 2026 Econverse. Feito para conectar.</span>
        </div>
      </footer>

      <dialog
        className="product-dialog"
        ref={dialogRef}
        aria-labelledby="dialog-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) setSelectedProduct(null);
        }}
        onClose={() => setSelectedProduct(null)}
      >
        {selectedProduct && (
          <div className="dialog-card">
            <button className="dialog-close" type="button" onClick={() => setSelectedProduct(null)} aria-label="Fechar detalhes"><Icon name="close" size={19} /></button>
            <div className="dialog-card__image"><img src={selectedProduct.photo} alt={selectedProduct.productName} /></div>
            <div className="dialog-card__content">
              <p className="eyebrow">DETALHES DO PRODUTO</p>
              <h2 id="dialog-title">{selectedProduct.productName}</h2>
              <p className="dialog-card__description">{selectedProduct.descriptionShort}</p>
              <div className="dialog-card__price">{formatPrice(selectedProduct.price)}</div>
              <p className="product-card__installments">ou 10x de {formatPrice(selectedProduct.price / 10)} sem juros</p>
              <button className="button button--dark dialog-card__buy" type="button" onClick={addToCart}>Adicionar à sacola <Icon name="arrow" size={17} /></button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

export default App;
