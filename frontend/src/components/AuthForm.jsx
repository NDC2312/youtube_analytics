import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api";

const GoogleSignInBtn = ({ onGoogleResponse }) => {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!window.google || !btnRef.current) return;

    // Reset lại nội dung để tránh lỗi render đè
    btnRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: "596162162962-hhajtorejulr1jr7sbub5pmqqv4jt8b7.apps.googleusercontent.com",
      callback: onGoogleResponse,
    });

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "signin_with",
      width: 320,
    });
  }, [onGoogleResponse]);

  return <div ref={btnRef}></div>;
};

export default function AuthForm({ onLogin, initialIsLogin = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  // mode: login | register | forgot
  const [authMode, setAuthMode] = useState(
    initialIsLogin ? "login" : "register",
  );
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp, 3=new password

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    if (location.state && location.state.isLogin !== undefined) {
      setAuthMode(location.state.isLogin ? "login" : "register");
    } else {
      setAuthMode(initialIsLogin ? "login" : "register");
    }

    setError("");
    setShowSuccess(false);
    setForgotStep(1);
  }, [location.state, initialIsLogin]);

  const resetForgotStates = () => {
    setForgotStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setSuccessMessage("");
  };

  const switchToLogin = () => {
    setAuthMode("login");
    setError("");
    setShowSuccess(false);
    setSuccessMessage("");
    resetForgotStates();
    setPassword("");
  };

  const switchToRegister = () => {
    setAuthMode("register");
    setError("");
    setShowSuccess(false);
    setSuccessMessage("");
    resetForgotStates();
    setPassword("");
  };

  const switchToForgot = () => {
    setAuthMode("forgot");
    setError("");
    setShowSuccess(false);
    setSuccessMessage("");
    setPassword("");
    resetForgotStates();
  };

  const handleGoogleResponse = useCallback(async (response) => {
    try {
      setError("");
      setIsLoading(true);

      const data = await api.googleLogin(response.credential);
      localStorage.setItem("access_token", data.access_token);
      onLogin(data.user_info);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Đăng nhập Google thất bại!");
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, onLogin]); // Đảm bảo đưa các hàm/biến từ bên ngoài vào dependency

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Mật khẩu quá ngắn. Vui lòng nhập ít nhất 8 ký tự!");
      return;
    }
    if (password.length > 50) {
      setError("Mật khẩu quá dài. Vui lòng nhập tối đa 50 ký tự!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (authMode === "login") {
        const data = await api.login(email, password);
        localStorage.setItem("access_token", data.access_token);
        onLogin(data.user_info);
        navigate("/");
      } else if (authMode === "register") {
        await api.register(name, email, password);
        setShowSuccess(true);
        setSuccessMessage("Tài khoản của bạn đã được tạo.");

        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage("");
          setAuthMode("login");
          setPassword("");
        }, 2500);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Có lỗi xảy ra!");
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 1: gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // backend làm sau:
      await api.forgotSendOtp(email);

      setSuccessMessage("Mã xác nhận đã được gửi về email của bạn.");
      setForgotStep(2);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Không thể gửi mã xác nhận.");
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: xác minh OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError("Vui lòng nhập mã xác nhận.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // backend làm sau:
      await api.forgotVerifyOtp(email, otp);

      setSuccessMessage("Xác minh mã thành công.");
      setForgotStep(3);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Mã xác nhận không đúng.");
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 3: đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword.length > 50) {
      setError("Mật khẩu mới tối đa 50 ký tự.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // backend làm sau:
      await api.forgotResetPassword(email, otp, newPassword);

      setShowSuccess(true);
      setSuccessMessage("Mật khẩu đã được cập nhật thành công.");

      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
        setAuthMode("login");
        setForgotStep(1);
        setOtp("");
        setNewPassword("");
        setConfirmNewPassword("");
        setPassword("");
        setError("");
      }, 2500);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Đổi mật khẩu thất bại!");
      } else {
        setError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderTitle = () => {
    if (authMode === "login") return "Chào mừng trở lại!";
    if (authMode === "register") return "Tạo tài khoản mới";
    if (forgotStep === 1) return "Quên mật khẩu";
    if (forgotStep === 2) return "Xác minh email";
    return "Đặt lại mật khẩu";
  };

  const renderSubtitle = () => {
    if (authMode === "login") return "Đăng nhập để tiếp tục phân tích video";
    if (authMode === "register")
      return "Bắt đầu hành trình khám phá dữ liệu ngay hôm nay";
    if (forgotStep === 1) return "Nhập email để nhận mã xác nhận";
    if (forgotStep === 2) return "Nhập mã xác nhận đã được gửi qua email";
    return "Tạo mật khẩu mới cho tài khoản của bạn";
  };

  const isNormalAuth = authMode === "login" || authMode === "register";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] border border-white/20 overflow-hidden min-h-[500px] flex flex-col justify-center">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-10"
              >
                <motion.div
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{
                    delay: 0.2,
                    duration: 0.5,
                    type: "spring",
                    bounce: 0.5,
                  }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg shadow-green-200 mb-2"
                >
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>

                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  Thành công!
                </h2>

                <p className="text-slate-500 font-medium">
                  {successMessage}
                  <br />
                  {authMode === "register"
                    ? "Đang chuyển hướng đến Đăng nhập..."
                    : "Bạn có thể đăng nhập ngay bây giờ."}
                </p>

                <Loader2 className="w-6 h-6 animate-spin text-green-500 mt-4" />
              </motion.div>
            ) : (
              <motion.div
                key={`${authMode}-${forgotStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {renderTitle()}
                  </h2>
                  <p className="text-slate-500 text-sm">{renderSubtitle()}</p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium text-center shadow-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {successMessage && authMode === "forgot" && !showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm font-medium text-center shadow-sm"
                    >
                      {successMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* LOGIN / REGISTER */}
                {isNormalAuth && (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <AnimatePresence>
                        {authMode === "register" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-1 overflow-hidden"
                          >
                            <label className="text-sm font-semibold text-slate-700 ml-1">
                              Họ tên
                            </label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                              </div>
                              <input
                                type="text"
                                required={authMode === "register"}
                                placeholder="Nguyễn Văn A"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                          Email
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="email"
                            required
                            placeholder="name@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-sm font-semibold text-slate-700">
                            Mật khẩu
                          </label>

                          {authMode === "login" && (
                            <button
                              type="button"
                              onClick={switchToForgot}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Quên mật khẩu?
                            </button>
                          )}
                        </div>

                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="password"
                            required
                            minLength={8}
                            maxLength={50}
                            placeholder="Ít nhất 8 ký tự..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:shadow-lg hover:shadow-blue-200 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            {authMode === "login"
                              ? "Đăng nhập"
                              : "Đăng ký tài khoản"}
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-8">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white/80 text-slate-500">
                            Hoặc tiếp tục với
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <GoogleSignInBtn onGoogleResponse={handleGoogleResponse} />
                      </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-600">
                      {authMode === "login"
                        ? "Chưa có tài khoản? "
                        : "Đã có tài khoản? "}
                      <button
                        type="button"
                        onClick={() => {
                          if (authMode === "login") {
                            switchToRegister();
                          } else {
                            switchToLogin();
                          }
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        {authMode === "login"
                          ? "Đăng ký ngay"
                          : "Đăng nhập ngay"}
                      </button>
                    </p>
                  </>
                )}

                {/* FORGOT PASSWORD - STEP 1 */}
                {authMode === "forgot" && forgotStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 ml-1">
                        Email
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="name@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:shadow-lg hover:shadow-blue-200 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Gửi mã xác nhận
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="w-full text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      Quay lại đăng nhập
                    </button>
                  </form>
                )}

                {/* FORGOT PASSWORD - STEP 2 */}
                {authMode === "forgot" && forgotStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                      <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                      <p className="text-sm text-slate-600">
                        Mã xác nhận đã được gửi tới
                        <span className="font-semibold text-slate-800">
                          {" "}
                          {email}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 ml-1">
                        Mã xác nhận
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Nhập 6 số"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="w-full px-4 py-3 text-center tracking-[0.4em] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:shadow-lg hover:shadow-blue-200 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Xác nhận mã
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <div className="flex flex-col gap-2 text-center">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Gửi lại mã
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep(1);
                          setError("");
                          setSuccessMessage("");
                          setOtp("");
                        }}
                        className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        Đổi email khác
                      </button>
                    </div>
                  </form>
                )}

                {/* FORGOT PASSWORD - STEP 3 */}
                {authMode === "forgot" && forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 ml-1">
                        Mật khẩu mới
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="password"
                          required
                          minLength={8}
                          maxLength={50}
                          placeholder="Ít nhất 8 ký tự..."
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700 ml-1">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="password"
                          required
                          minLength={8}
                          maxLength={50}
                          placeholder="Nhập lại mật khẩu..."
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:shadow-lg hover:shadow-blue-200 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Đổi mật khẩu
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
