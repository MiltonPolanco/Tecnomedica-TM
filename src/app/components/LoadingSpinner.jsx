export default function LoadingSpinner({ size = "md", message = "Cargando..." }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary`}></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
}
