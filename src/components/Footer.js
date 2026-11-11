
function Footer() {
  return (
    <footer className="bg-autumn-chestnut px-6 py-10 text-autumn-cream">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">

        <div>
          <h2 className="mb-3 text-2xl font-semibold tracking-wide">
            BookMellow
          </h2>

          <p className="max-w-md text-sm leading-7 text-autumn-cream/80">
            พื้นที่เล็ก ๆ สำหรับคนรักการอ่าน
            ค้นพบหนังสือเล่มโปรดและเรื่องราวใหม่ ๆ
            ที่รอให้คุณได้เปิดอ่าน
          </p>
        </div>

        <div className="md:text-right">
          <h3 className="mb-3 font-semibold">
            เมนูเว็บไซต์
          </h3>

          <div className="flex flex-col gap-2 text-sm text-autumn-cream/80 md:items-end">
            <a href="/#home" className="transition hover:text-white">
              หน้าแรก
            </a>

            <a href="/#books" className="transition hover:text-white">
              หนังสือทั้งหมด
            </a>

            <a href="/#categories" className="transition hover:text-white">
              หมวดหมู่
            </a>
          </div>
        </div>

      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/20 pt-5 text-center text-xs text-autumn-cream/70">
        © 2026 BookMellow — มุมเล็ก ๆ สำหรับคนรักการอ่าน
      </div>
    </footer>
  );
}

export default Footer;
