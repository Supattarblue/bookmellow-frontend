
import { useState } from 'react';

function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}) {
  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(category) {
    onCategoryChange(category);
    setIsOpen(false);
  }

  return (
    <div id="categories" className="relative">
      <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
        หมวดหมู่หนังสือ
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex w-full items-center justify-between rounded-full border border-autumn-beige bg-autumn-cream px-5 py-3 text-left text-autumn-dark transition hover:border-autumn-copper focus:border-autumn-copper focus:outline-none focus:ring-2 focus:ring-autumn-sand"
      >
        <span>
          {selectedCategory === 'ทั้งหมด'
            ? 'เลือกหมวดหมู่หนังสือ'
            : selectedCategory}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-autumn-beige bg-white p-2 shadow-xl">
          <button
            type="button"
            onClick={() => handleSelect('ทั้งหมด')}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm transition hover:bg-autumn-cream ${
              selectedCategory === 'ทั้งหมด'
                ? 'bg-autumn-beige font-semibold text-autumn-chestnut'
                : 'text-autumn-dark'
            }`}
          >
            ทุกหมวดหมู่
          </button>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleSelect(category)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm transition hover:bg-autumn-cream ${
                selectedCategory === category
                  ? 'bg-autumn-beige font-semibold text-autumn-chestnut'
                  : 'text-autumn-dark'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryFilter;
