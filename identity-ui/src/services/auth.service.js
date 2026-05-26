import { API_BASE } from "../config";
import TokenService from "./token.service";
import apiRequest from "./api.service";

const AuthService = {
  // ─── Auth ───────────────────────────────────────────────────────────────────
  // POST /auth/token → { username, password }
  // Response: { code, result: { accessToken, refreshToken, tokenType, authenticated } }
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.result?.authenticated)
      throw new Error(data.message || "Sai username hoặc mật khẩu");
    TokenService.setTokens(data.result.accessToken, data.result.refreshToken);
    const userRes = await fetch(`${API_BASE}/users/my-info`, {
      headers: { Authorization: `Bearer ${data.result.accessToken}` },
    });
    const userData = await userRes.json();
    const user = userData.result ?? userData;
    TokenService.saveUser(user);
    return user;
  },

  // POST /auth/logout → { refreshToken }
  logout: async () => {
    try {
      const refreshToken = TokenService.getRefresh();
      if (refreshToken)
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
    } catch {}
    finally { TokenService.clear(); }
  },

  // ─── Users (public) ──────────────────────────────────────────────────────────
  // POST /users → UserCreationRequest { username, password, firstName, lastName, email, dob }
  register: async (form) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
    return data;
  },

  // POST /users/verify-email → { email, code }
  verifyEmail: async (email, code) => {
    const res = await fetch(`${API_BASE}/users/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Xác thực thất bại");
    return data;
  },

  // POST /users/forgot-password → { email }
  forgotPassword: async (email) => {
    const res = await fetch(`${API_BASE}/users/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Không thể gửi email");
    return data;
  },

  // POST /users/reset-password → { email, code, newPassword }
  resetPassword: async (email, code, newPassword) => {
    const res = await fetch(`${API_BASE}/users/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Reset thất bại");
    return data;
  },

  // ─── Users (authenticated) ───────────────────────────────────────────────────
  // GET /users/my-info → ApiResponse<UserResponse>
  getMe: async () => {
    const res = await apiRequest("/users/my-info");
    if (!res.ok) throw new Error("Không thể lấy thông tin");
    const data = await res.json();
    return data.result ?? data;
  },

  // PUT /users/my-info → { firstName, lastName, dob }
  updateMyProfile: async (form) => {
    const res = await apiRequest("/users/my-info", {
      method: "PUT",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");
    return data.result ?? data;
  },

  // PUT /users/change-password → { oldPassword, newPassword }
  changePassword: async (oldPassword, newPassword) => {
    const res = await apiRequest("/users/change-password", {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");
    return data;
  },

  // ─── Admin: Users ────────────────────────────────────────────────────────────
  // GET /users?page=0&size=10&keyword=
  // Response: ApiResponse<PageResponse<UserResponse>>
  //   PageResponse: { currentPage, totalPages, totalElements, pageSize, data: UserResponse[] }
  //   UserResponse: { id, username, firstName, lastName, dob, roles: Set<RoleResponse> }
  getUsers: async (page = 0, size = 10, keyword = "") => {
    const params = new URLSearchParams({ page, size });
    if (keyword) params.append("keyword", keyword);
    const res = await apiRequest(`/users?${params}`);
    if (!res.ok) throw new Error(res.status === 403 ? "Không có quyền (403 Forbidden)" : "Lỗi tải danh sách users");
    const data = await res.json();
    return data.result ?? data;
  },

  // GET /users/{userId}
  getUser: async (userId) => {
    const res = await apiRequest(`/users/${userId}`);
    if (!res.ok) throw new Error("Không thể lấy thông tin user");
    const data = await res.json();
    return data.result ?? data;
  },

  // DELETE /users/{userId}
  deleteUser: async (userId) => {
    const res = await apiRequest(`/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Xóa thất bại");
    return data;
  },

  // PUT /users/{userId}/roles → { roles: ["ADMIN", "USER"] }
  // roles là list tên role (String), khớp UpdateUserRoleRequest { List<String> roles }
  updateUserRoles: async (userId, roles) => {
    const res = await apiRequest(`/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cập nhật role thất bại");
    return data.result ?? data;
  },

  // ─── Admin: Roles ─────────────────────────────────────────────────────────────
  // GET /roles → ApiResponse<List<RoleResponse>>
  //   RoleResponse: { name, description, permissions: Set<PermissionResponse> }
  getRoles: async () => {
    const res = await apiRequest("/roles");
    if (!res.ok) throw new Error("Lỗi tải roles");
    const data = await res.json();
    return data.result ?? data;
  },

  // POST /roles → { name, description, permissions: ["PERM_A"] }
  createRole: async (name, description, permissions) => {
    const res = await apiRequest("/roles", {
      method: "POST",
      body: JSON.stringify({ name, description, permissions }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Tạo role thất bại");
    return data.result ?? data;
  },

  // DELETE /roles/{role}
  deleteRole: async (role) => {
    const res = await apiRequest(`/roles/${role}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Xóa role thất bại");
    return data;
  },

  // ─── Admin: Permissions ───────────────────────────────────────────────────────
  // GET /permissions → ApiResponse<List<PermissionResponse>>
  //   PermissionResponse: { name, description }
  getPermissions: async () => {
    const res = await apiRequest("/permissions");
    if (!res.ok) throw new Error("Lỗi tải permissions");
    const data = await res.json();
    return data.result ?? data;
  },

  // POST /permissions → { name, description }
  createPermission: async (name, description) => {
    const res = await apiRequest("/permissions", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Tạo permission thất bại");
    return data.result ?? data;
  },

  // DELETE /permissions/{permission}
  deletePermission: async (permission) => {
    const res = await apiRequest(`/permissions/${permission}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Xóa permission thất bại");
    return data;
  },
};

export default AuthService;
