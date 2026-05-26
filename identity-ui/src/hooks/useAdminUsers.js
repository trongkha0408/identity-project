import { useState, useEffect } from "react";
import apiRequest from "../services/api.service";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("/admin/users");
        if (res.status === 403) throw new Error("Không có quyền truy cập (403 Forbidden)");
        if (!res.ok) throw new Error("Lỗi tải dữ liệu người dùng");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users ?? []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { users, loading, error };
}
