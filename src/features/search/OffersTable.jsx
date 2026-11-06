import { useState } from 'react';

const PAGE_SIZE = 25;
const priceFormat = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const countFormat = new Intl.NumberFormat('ru-RU');

export default function OffersTable({ offers }) {
  const [page, setPage] = useState(1);
  const pages = Math.ceil(offers.length / PAGE_SIZE);
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleOffers = offers.slice(start, start + PAGE_SIZE);
  return (
    <>
      <div
        className="table-responsive offers-scroll"
        role="region"
        aria-label="Складские предложения"
        tabIndex={0}
      >
        <table className="table offers-table">
          <caption className="visually-hidden">
            Предложения на исходную деталь и её аналоги. Каждая строка
            соответствует отдельному складу.
          </caption>
          <thead>
            <tr>
              <th scope="col">Артикул / Производитель</th>
              <th scope="col">Наименование</th>
              <th scope="col">Склад</th>
              <th scope="col" className="text-end">
                Цена
              </th>
              <th scope="col" className="text-end">
                Остаток
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleOffers.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <span className="part-number">{offer.number}</span>
                  <span className="part-brand">{offer.brand}</span>
                </td>
                <td className="part-name">{offer.name}</td>
                <td className="warehouse-name">
                  {offer.warehouse || 'Нет предложений'}
                </td>
                <td className="text-end price-cell">
                  {offer.price === null ? '—' : priceFormat.format(offer.price)}
                </td>
                <td className="text-end stock-cell">
                  <span className={offer.stock > 0 ? 'in-stock' : 'muted'}>
                    {offer.stock === null
                      ? '—'
                      : offer.stock === 0
                        ? 'Нет в наличии'
                        : `${countFormat.format(offer.stock)} шт.`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span aria-live="polite">
          {countFormat.format(start + 1)}–
          {countFormat.format(Math.min(start + PAGE_SIZE, offers.length))} из{' '}
          {countFormat.format(offers.length)}
        </span>
        {pages > 1 && (
          <nav className="table-pagination" aria-label="Страницы предложений">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Предыдущая страница"
            >
              ←
            </button>
            <span>
              {currentPage} / {pages}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage === pages}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Следующая страница"
            >
              →
            </button>
          </nav>
        )}
      </div>
    </>
  );
}
