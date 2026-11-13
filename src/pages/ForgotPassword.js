
import { Link } from 'react-router-dom';

function ForgotPassword() {
  return (
    <section className="flex min-h-[75vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-autumn-beige bg-white p-8 shadow-lg sm:p-10">

        <div className="mb-8 text-center">
          <p className="mb-3 text-sm tracking-widest text-autumn-copper">
            PASSWORD RECOVERY
          </p>

          <h1 className="text-3xl font-semibold text-autumn-chestnut">
            ลืมรหัสผ่าน?
          </h1>

          <p className="mt-3 text-sm leading-6 text-autumn-brown">
            ไม่ต้องกังวลค่ะ หากคุณลืมรหัสผ่าน
            สามารถติดต่อผู้ดูแลระบบ BookMellow
            เพื่อขอความช่วยเหลือในการรีเซ็ตรหัสผ่านได้
          </p>
        </div>

        <div className="rounded-2xl border border-autumn-beige bg-autumn-cream p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">🔐</span>
            <h2 className="font-semibold text-autumn-chestnut">
              วิธีขอรีเซ็ตรหัสผ่าน
            </h2>
          </div>

          <ol className="list-inside list-decimal space-y-3 text-sm leading-6 text-autumn-brown">
            <li>
              ติดต่อผู้ดูแลระบบ BookMellow
            </li>
            <li>
              แจ้งอีเมลที่ใช้สมัครสมาชิก
            </li>
            <li>
              รอผู้ดูแลระบบตรวจสอบและยืนยันตัวตน
            </li>
            <li>
              รับความช่วยเหลือในการตั้งรหัสผ่านใหม่
            </li>
          </ol>
        </div>

        <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          <strong>หมายเหตุ:</strong>
          เพื่อความปลอดภัย กรุณาอย่าแจ้งรหัสผ่านเดิมให้ผู้อื่นทราบ
          และอย่าส่งข้อมูลลับของบัญชีให้บุคคลที่ไม่ใช่ผู้ดูแลระบบ
        </div>

        <div className="mt-7 text-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-autumn-chestnut px-6 py-3 font-medium text-white transition hover:bg-autumn-brown"
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>

      </div>
    </section>
  );
}

export default ForgotPassword;
