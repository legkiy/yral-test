function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function numeric(value) {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    typeof value === 'boolean'
  )
    return null;
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : null;
}

function isGood(good) {
  // An unknown article is represented by a zero-filled placeholder in the API.
  return (
    good && typeof good === 'object' && text(good.brand) && text(good.number)
  );
}

export function extractBrands(goods) {
  const brands = new Map();
  for (const good of goods) {
    if (!isGood(good)) continue;
    const brand = text(good.brand);
    const key = brand.toLocaleUpperCase('ru-RU');
    if (!brands.has(key))
      brands.set(key, { name: brand, description: text(good.name) });
  }
  return [...brands.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'ru'),
  );
}

export function normalizeOffers(goods) {
  const rows = new Map();
  // Requested goods first, followed by analogues. Never use the obsolete goods.price.
  const products = [
    ...goods,
    ...goods.flatMap((good) =>
      Array.isArray(good?.analogues) ? good.analogues : [],
    ),
  ];
  for (const good of products) {
    if (!isGood(good)) continue;
    const base = {
      brand: text(good.brand),
      number: text(good.number),
      name: text(good.name) || 'Наименование не указано',
    };
    const productKey = JSON.stringify([
      text(good.goodsID),
      base.brand,
      base.number,
    ]);
    const warehouses = Array.isArray(good.warehouses)
      ? good.warehouses.filter(
          (warehouse) => warehouse && typeof warehouse === 'object',
        )
      : [];
    if (!warehouses.length) {
      const id = `${productKey}:no-warehouse`;
      rows.set(id, {
        ...base,
        id,
        warehouse: null,
        price: null,
        stock: numeric(good.count) === 0 ? 0 : null,
      });
    }
    for (const warehouse of warehouses) {
      const price = numeric(warehouse.price);
      const stock = numeric(warehouse.stock);
      const id = JSON.stringify([
        productKey,
        text(warehouse.id),
        text(warehouse.code),
        text(warehouse.warehouseShipping),
        warehouse.shipmentDate,
        price,
        stock,
      ]);
      rows.set(id, {
        ...base,
        id,
        warehouse: text(warehouse.code) || text(warehouse.id) || 'Не указан',
        price,
        stock,
      });
    }
  }
  return [...rows.values()];
}
