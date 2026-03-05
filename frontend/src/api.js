import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Địa chỉ FastAPI của bạn

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const api = {
  // ==========================================
  // 1. CÁC API PHÂN TÍCH (ĐÃ ĐỒNG BỘ TIẾNG VIỆT)
  // ==========================================
  
  // Gửi link để bắt đầu phân tích
  startAnalysis: async (url, count) => {
    // Backend yêu cầu 'duong_dan' và 'so_luong'
    const response = await axios.post(`${API_BASE_URL}/api/analyze`, { 
      duong_dan: url, 
      so_luong: count 
    }, getAuthHeader());
    
    // Backend trả về 'ma_tac_vu' (không phải task_id)
    return response.data.ma_tac_vu; 
  },

  // Polling: Kiểm tra trạng thái
  checkStatus: async (taskId) => {
    // Sửa đường dẫn thành /api/status/ để khớp với Backend
    const response = await axios.get(`${API_BASE_URL}/api/status/${taskId}`);
    return response.data;
  },

  // Chat với dữ liệu (Tương tự, sửa cho khớp với YeuCauTroChuyen)
  chatWithData: async (taskId, question) => {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      ma_tac_vu: taskId,
      cau_hoi: question
    }, getAuthHeader());
    return response.data.answer;
  },

  // ==========================================
  // 2. CÁC API XÁC THỰC
  // ==========================================

  login: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: email,
      mat_khau: password
    });
    return response.data; 
  },

  register: async (name, email, password) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      ten_dang_nhap: name,
      email: email,
      mat_khau: password
    });
    return response.data;
  }
};