export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state alert" role="alert">
      <div>
        <strong>Не удалось загрузить данные</strong>
        <p>{message}</p>
      </div>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={onRetry}
      >
        Повторить
      </button>
    </div>
  );
}
