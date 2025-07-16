export default function ErrorMessage({ message }) {
  return (
    <div className="bg-red-100 text-red-800 p-4 rounded shadow text-center">
      Ошибка: {message}
    </div>
  );
}
