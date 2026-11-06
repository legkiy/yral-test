import { useRef } from 'react';

export default function ArticleInput({ value, onChange }) {
  const inputRef = useRef(null);
  return (
    <div className="article-field">
      <label className="form-label" htmlFor="article">
        Артикул детали
      </label>
      <div className="input-wrap">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
        <input
          ref={inputRef}
          id="article"
          className="form-control"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Введите номер запчасти"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby="article-help"
        />
        {value && (
          <button
            type="button"
            className="clear-input"
            aria-label="Очистить артикул"
            onClick={() => {
              onChange('');
              inputRef.current.focus();
            }}
          >
            ×
          </button>
        )}
      </div>
      <p id="article-help" className="field-help">
        Поиск начнётся автоматически. Например:{' '}
        <button
          type="button"
          className="example-button"
          onClick={() => {
            onChange('01089');
            inputRef.current.focus();
          }}
        >
          01089
        </button>
      </p>
    </div>
  );
}
