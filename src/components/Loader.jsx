export default function Loader({ children }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
