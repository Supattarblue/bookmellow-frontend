
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/backend';

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadMembers(keyword = '') {
    setLoading(true);
    setError('');

    try {
      const result = await apiRequest(
        `/api/admin/members?search=${encodeURIComponent(keyword)}`
      );

      setMembers(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดรายชื่อสมาชิกได้');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    await loadMembers(search);
  }

  async function handleRoleChange(member) {
    const nextRole = member.role === 'admin' ? 'member' : 'admin';

    const confirmed = window.confirm(
      `ต้องการเปลี่ยนสิทธิ์ของ ${member.username} เป็น ${
        nextRole === 'admin' ? 'Admin' : 'Member'
      } ใช่หรือไม่?`
    );

    if (!confirmed) return;

    setUpdatingId(member.id);
    setError('');
    setMessage('');

    try {
      await apiRequest(`/api/admin/members/${member.id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: nextRole }),
      });

      setMessage(`เปลี่ยนสิทธิ์ของ ${member.username} เรียบร้อยแล้ว`);
      await loadMembers(search);
    } catch (err) {
      setError(err.message || 'ไม่สามารถเปลี่ยนสิทธิ์ได้');
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <div className="min-h-screen bg-autumn-cream px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-autumn-dark">
            จัดการสมาชิก
          </h1>
          <p className="mt-2 text-autumn-brown">
            ตรวจสอบรายชื่อและจัดการสิทธิ์สมาชิก BookMellow
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-autumn-brown">สมาชิกที่ค้นพบ</p>
            <p className="mt-2 text-3xl font-bold text-autumn-dark">
              {members.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-autumn-brown">ผู้ดูแลระบบในรายการ</p>
            <p className="mt-2 text-3xl font-bold text-autumn-dark">
              {members.filter((member) => member.role === 'admin').length}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row"
        >
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาด้วยชื่อสมาชิกหรืออีเมล..."
            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-autumn-dark px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            ค้นหา
          </button>
        </form>

        {error && (
          <div className="mb-5 rounded-xl bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl bg-green-100 p-4 text-green-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-bold text-autumn-dark">
              รายชื่อสมาชิกทั้งหมด
            </h2>
          </div>

          {loading ? (
            <p className="p-8 text-center text-autumn-brown">
              กำลังโหลดรายชื่อสมาชิก...
            </p>
          ) : members.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              ไม่พบสมาชิก
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-gray-50 text-sm text-autumn-brown">
                  <tr>
                    <th className="px-5 py-4">ชื่อสมาชิก</th>
                    <th className="px-5 py-4">อีเมล</th>
                    <th className="px-5 py-4">สิทธิ์ปัจจุบัน</th>
                    <th className="px-5 py-4 text-center">จัดการสิทธิ์</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-autumn-dark">
                        {member.username}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {member.email}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            member.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {member.role === 'admin' ? 'Admin' : 'Member'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRoleChange(member)}
                          disabled={updatingId === member.id}
                          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                            member.role === 'admin'
                              ? 'bg-gray-600 hover:bg-gray-700'
                              : 'bg-autumn-brown hover:opacity-90'
                          }`}
                        >
                          {updatingId === member.id
                            ? 'กำลังบันทึก...'
                            : member.role === 'admin'
                              ? 'ลดเป็น Member'
                              : 'เลื่อนเป็น Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMembers;
