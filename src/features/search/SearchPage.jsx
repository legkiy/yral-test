import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  articleChanged,
  brandSelected,
  fetchBrands,
  fetchOffers,
} from './searchSlice.js';
import ArticleInput from './ArticleInput.jsx';
import BrandList from './BrandList.jsx';
import OffersTable from './OffersTable.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

export default function SearchPage() {
  const dispatch = useDispatch();
  const {
    article,
    selectedBrand,
    brands,
    offers,
    brandsStatus,
    offersStatus,
    brandsError,
    offersError,
  } = useSelector((state) => state.search);
  const [brandsAttempt, setBrandsAttempt] = useState(0);
  const [offersAttempt, setOffersAttempt] = useState(0);
  const number = article.trim();

  useEffect(() => {
    if (!number) return;
    let request;
    const timer = setTimeout(() => {
      request = dispatch(fetchBrands(number));
    }, 400);
    return () => {
      clearTimeout(timer);
      request?.abort();
    };
  }, [article, number, brandsAttempt, dispatch]);

  useEffect(() => {
    if (!number || !selectedBrand) return;
    const request = dispatch(fetchOffers({ number, brand: selectedBrand }));
    return () => request.abort();
  }, [number, selectedBrand, offersAttempt, dispatch]);

  return (
    <>
      <main className="page-width main-content">
        <div className="page-intro">
          <p className="eyebrow">КАТАЛОГ ЗАПЧАСТЕЙ</p>
          <h1>Найдите нужную деталь</h1>
          <p className="intro-copy">
            Введите артикул и выберите производителя, чтобы увидеть аналоги,
            цены и наличие на складах.
          </p>
        </div>
        <section className="search-section" aria-labelledby="search-heading">
          <div className="step-heading">
            <h2 id="search-heading">Поиск по артикулу</h2>
          </div>
          <ArticleInput
            value={article}
            onChange={(value) => dispatch(articleChanged(value))}
          />
          {number &&
            (brandsStatus === 'idle' || brandsStatus === 'loading') && (
              <Loader>Ищем производителей…</Loader>
            )}
          {brandsStatus === 'failed' && (
            <ErrorMessage
              message={brandsError}
              onRetry={() => setBrandsAttempt((value) => value + 1)}
            />
          )}
          {brandsStatus === 'succeeded' &&
            (brands.length ? (
              <BrandList
                brands={brands}
                selectedBrand={selectedBrand}
                onSelect={(brand) => dispatch(brandSelected(brand))}
              />
            ) : (
              <div className="inline-empty" role="status">
                <strong>Производители не найдены</strong>
                <p>Проверьте артикул или попробуйте другой номер детали.</p>
              </div>
            ))}
        </section>
        <section
          className="results-section"
          aria-labelledby="results-heading"
          aria-busy={offersStatus === 'loading'}
        >
          <div className="results-heading-row">
            <div className="step-heading">
              <h2 id="results-heading">Предложения и аналоги</h2>
            </div>
            {offersStatus === 'succeeded' && offers.length > 0 && (
              <span className="results-count">
                {new Intl.NumberFormat('ru-RU').format(offers.length)}{' '}
                предложений
              </span>
            )}
          </div>
          {selectedBrand && (
            <p className="results-context">
              <span>{number}</span>
              <span className="context-divider">/</span>
              {selectedBrand}
              <span className="context-note">Исходная деталь и аналоги</span>
            </p>
          )}
          {!selectedBrand && (
            <div className="results-empty">
              <svg
                width="52"
                height="52"
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden="true"
              >
                <rect x="9" y="7" width="30" height="35" rx="3" />
                <path d="M17 7V4h14v7H17V7Zm0 15h14M17 29h14M17 36h8" />
              </svg>
              <h3>Здесь появятся предложения</h3>
              <p>
                {brands.length
                  ? 'Выберите производителя из списка выше.'
                  : 'Сначала введите артикул и выберите производителя.'}
              </p>
            </div>
          )}
          {selectedBrand &&
            (offersStatus === 'idle' || offersStatus === 'loading') && (
              <Loader>Загружаем предложения и аналоги…</Loader>
            )}
          {offersStatus === 'failed' && (
            <ErrorMessage
              message={offersError}
              onRetry={() => setOffersAttempt((value) => value + 1)}
            />
          )}
          {offersStatus === 'succeeded' &&
            (offers.length ? (
              <OffersTable
                key={`${number}:${selectedBrand}:${offersAttempt}`}
                offers={offers}
              />
            ) : (
              <div className="inline-empty" role="status">
                <strong>Предложения не найдены</strong>
                <p>
                  Попробуйте выбрать другого производителя или изменить артикул.
                </p>
              </div>
            ))}
        </section>
      </main>
    </>
  );
}
