
function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
        ค้นหาหนังสือ
      </label>

      <input
        type="text"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="ชื่อหนังสือ ผู้เขียน หรือหมวดหมู่..."
        className="w-full rounded-full border border-autumn-beige bg-autumn-cream px-5 py-3 text-autumn-dark outline-none transition placeholder:text-autumn-brown/60 focus:border-autumn-copper focus:ring-2 focus:ring-autumn-sand"
      />
    </div>
  );
}

export default SearchBar;
