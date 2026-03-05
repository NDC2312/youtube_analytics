import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // xin chao
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // Giả lập gọi API gửi email reset mật khẩu
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto px-4 py-10"
    >
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white/20 overflow-hidden">
        {/* --- Background Blobs (Trang trí nền đồng nhất với InputForm) --- */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              // ==========================================
              // TRẠNG THÁI 1: FORM NHẬP EMAIL
              // ==========================================
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg shadow-blue-200 mb-6 transform transition-transform hover:rotate-12">
                    <KeyRound className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                    Quên mật khẩu?
                  </h2>
                  <p className="text-sm text-slate-500">
                    Đừng lo lắng! Hãy nhập email bạn đã đăng ký, chúng tôi sẽ
                    gửi liên kết để đặt lại mật khẩu.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Ô nhập Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Địa chỉ Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="Nhập email của bạn..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-slate-700"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Nút Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full relative overflow-hidden group py-4 rounded-xl font-bold text-base text-white shadow-xl shadow-blue-200 transition-all duration-300 transform active:scale-[0.98] ${
                      isSubmitting
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-indigo-300 hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <span>Gửi liên kết đặt lại mật khẩu</span>
                      )}
                    </div>
                  </button>
                </form>
              </motion.div>
            ) : (
              // ==========================================
              // TRẠNG THÁI 2: THÔNG BÁO THÀNH CÔNG
              // ==========================================
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-6"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-500 mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-3">
                  Kiểm tra email của bạn!
                </h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến <br />
                  <span className="font-bold text-slate-800">
                    {email}
                  </span>. <br />
                  Vui lòng kiểm tra cả hộp thư rác (Spam) nếu không thấy.
                </p>

                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Gửi lại email khác?
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nút quay lại đăng nhập (Luôn hiển thị ở cuối) */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Quay lại trang Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
