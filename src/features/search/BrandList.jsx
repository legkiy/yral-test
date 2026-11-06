export default function BrandList({ brands, selectedBrand, onSelect }) {
  return (
    <div className="brands">
      <div className="section-label" id="brands-label">
        Выберите производителя{' '}
        <span className="count-badge">{brands.length}</span>
      </div>
      <div className="brand-list" role="group" aria-labelledby="brands-label">
        {brands.map((brand) => (
          <button
            key={brand.name}
            type="button"
            className={`brand-button ${selectedBrand === brand.name ? 'is-selected' : ''}`}
            aria-pressed={selectedBrand === brand.name}
            title={brand.description || undefined}
            onClick={() => onSelect(brand.name)}
          >
            {brand.name}
            {selectedBrand === brand.name && <span aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
