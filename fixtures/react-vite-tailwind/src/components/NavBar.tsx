export function NavBar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600" />
        <span className="text-lg font-bold text-gray-900">Acme</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <a href="#" className="hover:text-gray-900">Product</a>
        <a href="#" className="hover:text-gray-900">Pricing</a>
        <a href="#" className="hover:text-gray-900">Docs</a>
      </div>
      <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
        Get started
      </button>
    </nav>
  );
}
