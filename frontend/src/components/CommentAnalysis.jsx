import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ScatterChart, Scatter, ZAxis,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  MessageSquare, TrendingUp, ThumbsUp, Target, Activity, Zap, Filter, X, 
  Cloud, Users, Smile 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MÀU SẮC CHỦ ĐẠO ---
const COLORS = {
  pos: '#22c55e', neg: '#ef4444', neu: '#94a3b8', primary: '#3b82f6', accent: '#8b5cf6',
};

const WORD_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#06b6d4', '#84cc16', '#d946ef'
];

const SENTIMENT_MAP = {
  'Tích cực': 'Positive', 'Tiêu cực': 'Negative', 'Trung tính': 'Neutral'
};

// --- COMPONENT: MODAL BÌNH LUẬN ---
const CommentModal = ({ isOpen, onClose, title, comments, type }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Lọc bình luận theo:</h3>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {comments.length > 0 ? comments.map((cmt, idx) => (
              <div key={idx} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-700 text-sm">{cmt.tac_gia}</span>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${cmt.cam_xuc_du_doan === 'Positive' ? 'bg-green-100 text-green-600' : cmt.cam_xuc_du_doan === 'Negative' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    {cmt.cam_xuc_du_doan}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{cmt.ban_goc}</p>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                <p>Không tìm thấy bình luận nào phù hợp.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-right text-xs text-slate-400">
            Hiển thị {comments.length} kết quả
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CustomScatterTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-xl max-w-xs z-50">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <p className="font-bold text-slate-700 text-sm">{data.author}</p>
        </div>
        <p className="text-xs text-slate-600 line-clamp-3 italic">"{data.content}"</p>
      </div>
    );
  }
  return null;
};

// Component hiển thị khi không có dữ liệu
const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 py-8">
    <Icon className="w-10 h-10 opacity-20" />
    <p className="text-sm italic">{message}</p>
  </div>
);

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function CommentAnalysis({ data }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [filterValue, setFilterValue] = useState(null);
  const [timeRange, setTimeRange] = useState('7');

  // --- TRÍCH XUẤT DỮ LIỆU ---
  const sentimentData = data?.sentiment_chart?.length > 0 ? data.sentiment_chart : [];
  const emojiData = data?.emoji_stats?.length > 0 ? data.emoji_stats : [];
  const rawWordCloudData = data?.word_cloud?.length > 0 ? data.word_cloud : [];
  const totalComments = data?.total_comments || 0;
  const topUsers = data?.top_users?.length > 0 ? data.top_users : [];
  const scatterData = data?.scatter_clusters?.length > 0 ? data.scatter_clusters : [];

  //Lấy danh sách tên cụm động từ Backend trả về
  const uniqueClusters = useMemo(() => {
    if (!scatterData.length) return [];
    return [...new Set(scatterData.map(item => item.cluster))].sort();
  }, [scatterData]);

  // Bộ màu và hình dáng cho các cụm
  const scatterColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
  const scatterShapes = ["circle", "triangle", "square", "diamond", "star"];

  const allComments = data?.all_comments?.length > 0 ? data.all_comments : [];
  const timeSeriesData = data?.time_series?.length > 0 ? data.time_series : [];

  // --- XỬ LÝ LOGIC ---
  const filteredTimeSeries = useMemo(() => {
    if (timeRange === 'all') return timeSeriesData;
    const cutoff = new Date(); 
    cutoff.setDate(cutoff.getDate() - parseInt(timeRange));
    return timeSeriesData.filter(item => new Date(item.date) >= cutoff);
  }, [timeSeriesData, timeRange]);

  const positiveCount = sentimentData.find(i => i.name === 'Tích cực')?.value || 0;
  const negativeCount = sentimentData.find(i => i.name === 'Tiêu cực')?.value || 0;
  const neutralCount = sentimentData.find(i => i.name === 'Trung tính')?.value || 0;
  
  const positivePercent = totalComments > 0 ? Math.round((positiveCount / totalComments) * 100) : 0;
  const negativePercent = totalComments > 0 ? Math.round((negativeCount / totalComments) * 100) : 0;

  const handleWordClick = (w) => { setFilterType('WORD'); setFilterValue(w); setModalOpen(true); };
  const handleSentimentClick = (e) => { setFilterType('SENTIMENT'); setFilterValue(e.name); setModalOpen(true); };
  const handleUserClick = (u) => { setFilterType('USER'); setFilterValue(u); setModalOpen(true); };
  const handleEmojiClick = (e) => { if (e?.emoji) { setFilterType('EMOJI'); setFilterValue(e.emoji); setModalOpen(true); } };

  const filteredComments = useMemo(() => {
    if (!filterType || !filterValue) return [];
    return (allComments || []).filter(cmt => {
        if (filterType === 'USER') return cmt.tac_gia === filterValue;
        if (filterType === 'SENTIMENT') return cmt.cam_xuc_du_doan === SENTIMENT_MAP[filterValue];
        if (filterType === 'WORD') return cmt.ban_goc?.toLowerCase().includes(filterValue.toLowerCase());
        if (filterType === 'EMOJI') return cmt.ban_goc?.includes(filterValue);
        //Lọc bình luận theo cụm (Nhóm)
        if (filterType === 'CLUSTER') return filterValue.startsWith(`Nhóm ${cmt.cum + 1}`);
        return false;
    });
  }, [filterType, filterValue, allComments]);

  const getModalTitle = () => {
      switch(filterType) {
          case 'USER': return `Người dùng: "${filterValue}"`;
          case 'SENTIMENT': return `Nhóm cảm xúc: ${filterValue}`;
          case 'WORD': return `Chứa từ khóa: "${filterValue}"`;
          case 'EMOJI': return `Chứa Emoji: ${filterValue}`;
          //Tiêu đề khi click vào biểu đồ phân cụm
          case 'CLUSTER': return `Thuộc cụm: ${filterValue}`;
          default: return '';
      }
  };

  const radarRealData = useMemo(() => {
    if (!totalComments) return [];
    const funEmojis = [
      // Emoji cười các kiểu
      '😂', '🤣', '😆', '😁', '😹', '😄', '😃', '😅', '🙂',
      '🤪', '😜', '😝', '😛', '🤭', '😸',  '🌝',

      // Tiếng cười (Onomatopoeia)
      'haha', 'hihi', 'hehe', 'hô hô', 'hí hí', 'khà khà', 'hề hề',
      'kkk', 'kkkk', 'kaka', 'kiki',

      // Tiếng lóng tiếng Anh phổ biến
      'lol', 'lmao', 'lmfao', 'rofl', 'kekw', 'omg',

      // Cụm từ diễn tả sự buồn cười quá mức
      'xỉu', 'xỉu ngang', 'xỉu up xỉu down', 
      'cười chết', 'cười ỉa', 'cười sảng', 'cười bò', 
      'cười té ghế', 'cười lộn ruột', 'cười sặc', 'cười rụng nụ', 
      'cười đau bụng', 'mắc cười quá',
    ];
    // Tính số ngày thực tế có trong dữ liệu thời gian
    const dates = allComments
      .map(c => new Date(c.thoi_gian || c.date))
      .filter(d => !isNaN(d));

    const startDate = dates.length ? new Date(Math.min(...dates)) : new Date();
    const endDate = dates.length ? new Date(Math.max(...dates)) : new Date();

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Tối thiểu là 1 ngày

    // Chỉ số sôi nổi = (Tổng comment / Số ngày) / Benchmark (ví dụ: 50 cmt/ngày là rất sôi nổi)
    const commentsPerDay = totalComments / diffDays;
    const livelinessScore = Math.min(
      100,
      Math.round(
        (Math.log10(commentsPerDay + 1) / 2) * 100
      )
    );

    // Sáng tạo = (Số lượng từ khóa duy nhất / Tổng số bình luận) * Hệ số điều chỉnh
    const allWords = allComments
      .map(c => c.ban_goc?.toLowerCase().split(/\s+/))
      .flat();

    const uniqueWords = new Set(allWords);

    const vocabRatio =
      uniqueWords.size / allWords.length;

    const creativityScore = Math.min(
      100,
      Math.round(vocabRatio * 200)
    );

    const avgLength = allComments.reduce(
      (sum, c) => sum + (c.ban_goc?.length || 0),
      0
    ) / totalComments;

    const engagementScore = Math.min(
      100,
      Math.round(avgLength * 2)
    );

    const funCount = allComments.filter(c =>
      funEmojis.some(k =>
        c.ban_goc?.toLowerCase().includes(k)
      )
    ).length;
    const scale = (val, max) => max ? Math.min(100, Math.round((val / max) * 100)) : 0;
    return [
      { subject: 'Tích cực', A: scale(positiveCount, totalComments), fullMark: 100 },
      { subject: 'Tiêu cực', A: scale(negativeCount, totalComments), fullMark: 100 },
      { subject: 'Hài hước', A: scale(funCount, totalComments), fullMark: 100 }, 
      { subject: 'Trung lập', A: scale(neutralCount, totalComments), fullMark: 100 },
      { subject: 'Sôi nổi', A: livelinessScore, fullMark: 100 }, 
      { subject: 'Sáng tạo', A: creativityScore, fullMark: 100 }, 
      { subject: 'Tương tác', A: engagementScore, fullMark: 100 }
    ];
  }, [positiveCount, negativeCount, neutralCount, emojiData, rawWordCloudData, totalComments]);

  const processedWordCloud = useMemo(() => {
    if (!rawWordCloudData.length) return { items: [], maxVal: 1, minVal: 0 };
    const maxVal = Math.max(...rawWordCloudData.map(w => w.value));
    const minVal = Math.min(...rawWordCloudData.map(w => w.value));
    const shuffledItems = [...rawWordCloudData].sort(() => Math.random() - 0.5);
    return { items: shuffledItems, maxVal, minVal };
  }, [rawWordCloudData]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CommentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={getModalTitle()} 
        comments={filteredComments} 
        type={filterValue === 'Tiêu cực' ? 'danger' : 'normal'} 
      />

      {/* 1. KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng Bình Luận', val: totalComments > 0 ? totalComments.toLocaleString() : '—', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Điểm Cảm Xúc', val: totalComments > 0 ? `${positivePercent - negativePercent}` : '—', icon: Target, color: 'text-violet-600', bg: 'bg-violet-50', note: 'Chỉ số ròng' },
          { label: 'Độ Tích Cực', val: totalComments > 0 ? `${positivePercent}%` : '—', icon: ThumbsUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Tiêu Cực / Toxic', val: totalComments > 0 ? `${negativePercent}%` : '—', icon: Zap, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.val === '—' ? 'text-slate-300' : 'text-slate-800'}`}>{stat.val}</p>
              {stat.note && <p className="text-[10px] text-slate-400 mt-1">{stat.note}</p>}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. TIME SERIES */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500"/> Xu hướng thảo luận
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['7', '30', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeRange === range ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {range === 'all' ? 'Tất cả' : `${range} ngày`}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72 w-full">
          {filteredTimeSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTimeSeries}>
                <defs>
                  <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10}
                  tickFormatter={(str) => {
                    const dateObj = new Date(str);
                    if (isNaN(dateObj.getTime())) return str;
                    const hours = dateObj.getHours();
                    const minutes = dateObj.getMinutes();
                    if (hours === 0 && minutes === 0) return `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
                  }}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="comments" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorComments)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={TrendingUp} message="Không có dữ liệu thời gian cho khoảng thời gian này." />
          )}
        </div>
      </div>

      {/* 3. ROW: SENTIMENT PIE & RADAR CHART */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative group cursor-pointer hover:border-blue-200 transition-colors">
          <div className="absolute top-4 right-4 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
            🖱️ Nhấn để lọc
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-2 text-center">Tỷ lệ Cảm Xúc</h3>
          <div className="h-64 relative w-full">
            {sentimentData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" onClick={handleSentimentClick}>
                      {sentimentData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="hover:opacity-80 transition-opacity cursor-pointer"/>))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-3xl font-extrabold text-slate-800">{positivePercent}%</span>
                  <span className="text-xs text-slate-400 font-bold uppercase">Tích cực</span>
                </div>
              </>
            ) : (
              <EmptyState icon={Target} message="Không có dữ liệu cảm xúc." />
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-2 text-center flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-pink-500" /> Sắc thái Nội dung
          </h3>
          <div className="h-64 w-full">
            {radarRealData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarRealData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Video này" dataKey="A" stroke={COLORS.accent} strokeWidth={3} fill={COLORS.accent} fillOpacity={0.3} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px' }}/>
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Activity} message="Không đủ dữ liệu phân tích sắc thái." />
            )}
          </div>
        </div>
      </div>

      {/* 4. SCATTER PLOT */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500"/> Bản đồ Phân cụm nội dung
        </h3>
        
        {/* Thêm chú thích nhỏ hướng dẫn người dùng click */}
        <p className="text-xs text-slate-400 mb-2 italic">
          🖱️ Nhấn vào tên nhóm ở dưới hoặc các điểm trên biểu đồ để xem bình luận
        </p>
        
        <div className="h-96 w-full bg-slate-50/50 rounded-2xl border border-slate-100">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" name="PCA 1" hide />
                <YAxis type="number" dataKey="y" name="PCA 2" hide />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <RechartsTooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Thêm sự kiện onClick và đổi trỏ chuột */}
                <Legend 
                  verticalAlign="bottom" 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '20px', cursor: 'pointer' }} 
                  onClick={(e) => {
                    if(e && e.value) {
                      setFilterType('CLUSTER');
                      setFilterValue(e.value);
                      setModalOpen(true);
                    }
                  }}
                />
                
                {uniqueClusters.map((clusterName, index) => (
                   <Scatter 
                     key={clusterName}
                     name={clusterName} 
                     data={scatterData.filter(c => c.cluster === clusterName)} 
                     fill={scatterColors[index % scatterColors.length]} 
                     shape={scatterShapes[index % scatterShapes.length]} 
                     
                     // [ĐÃ SỬA] Cho phép click trực tiếp vào các điểm chấm trên bản đồ
                     className="cursor-pointer hover:opacity-80 transition-opacity"
                     onClick={() => {
                        setFilterType('CLUSTER');
                        setFilterValue(clusterName);
                        setModalOpen(true);
                     }}
                   />
                ))}

              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={Target} message="Không có dữ liệu phân cụm nội dung." />
          )}
        </div>
      </div>

      {/* 5. WORD CLOUD */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative group">
        <div className="absolute top-6 right-6 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
          🖱️ Nhấn vào từ để xem comment
        </div>
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-sky-500" /> Đám mây từ khóa
        </h3>
        <div className="min-h-[350px] bg-slate-50/50 rounded-2xl border border-slate-100 relative overflow-hidden flex flex-wrap content-center justify-center items-center gap-x-6 gap-y-3 p-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-30 -z-10"></div>
          {processedWordCloud.items.length > 0 ? processedWordCloud.items.map((word, idx) => {
            const ratio = (word.value - processedWordCloud.minVal) / (processedWordCloud.maxVal - processedWordCloud.minVal || 1);
            const fontSize = 14 + (ratio * 45); 
            const opacity = 0.6 + (ratio * 0.4);
            const fontWeight = ratio > 0.5 ? 800 : (ratio > 0.3 ? 600 : 400);
            return (
              <motion.span 
                key={idx}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: idx * 0.01, duration: 0.4 }} whileHover={{ scale: 1.2, zIndex: 10, rotate: 3 }}
                style={{ fontSize: `${fontSize}px`, color: WORD_COLORS[idx % WORD_COLORS.length], opacity, fontWeight, lineHeight: '1.2' }}
                className="cursor-pointer select-none font-sans hover:underline decoration-2" title={`${word.text}: ${word.value}`} onClick={() => handleWordClick(word.text)} 
              >
                {word.text}
              </motion.span>
            )
          }) : <EmptyState icon={Cloud} message="Không trích xuất được từ khóa nổi bật nào." />}
        </div>
      </div>

      {/* 6. ROW: TOP USERS & EMOJIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative group">
          <div className="absolute top-6 right-6 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
            🖱️ Chọn người dùng để xem lịch sử
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" /> Người dùng nổi bật
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {topUsers.length > 0 ? topUsers.map((user, idx) => (
              <div key={idx} onClick={() => handleUserClick(user.name)} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all cursor-pointer group/item">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 flex-shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shadow-sm group-hover/item:scale-110 transition-transform">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[150px] group-hover/item:text-blue-600" title={user.name}>{user.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {user.sentiment === 'Positive' && <span className="text-green-600 font-medium">● Tích cực</span>}
                      {user.sentiment === 'Negative' && <span className="text-red-600 font-medium">● Tiêu cực</span>}
                      {user.sentiment === 'Neutral' && <span className="text-gray-500 font-medium">● Trung lập</span>}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm group-hover/item:border-blue-200">
                  {user.count}
                </span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
                <Users className="w-8 h-8 opacity-20" />
                <p className="text-sm italic">Chưa có dữ liệu người dùng nổi bật.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative group">
          <div className="absolute top-6 right-6 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
            🖱️ Nhấn Emoji để lọc
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-500" /> Top Emoji phổ biến
          </h3>
          <div className="h-64 w-full">
            {emojiData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emojiData.slice(0, 7)} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="emoji" type="category" width={40} tick={{ fontSize: 20 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#fbbf24" radius={[0, 6, 6, 0]} barSize={24} background={{ fill: '#f8fafc', radius: [0,6,6,0] }} onClick={handleEmojiClick} className="cursor-pointer">
                    {emojiData.map((entry, index) => (<Cell key={`cell-${index}`} fill="#fbbf24" className="hover:opacity-80 transition-opacity cursor-pointer"/>))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Smile} message="Không tìm thấy Emoji nào trong các bình luận." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}