// components/Button.js
export default function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow ${className}`}
    >
      {children}
    </button>
  );
}
