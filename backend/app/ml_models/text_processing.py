import re
import emoji
import numpy as np

# --- TỪ ĐIỂN TEENCODE ---
TU_DIEN_TEENCODE = {
    'ko': 'không', 'k': 'không', 'kh': 'không', 'khong': 'không', 'kg': 'không', 
    'hong': 'không', 'hok': 'không', 'khum': 'không', 'k0': 'không', 'hem': 'không',
    'hông': 'không', 'kô': 'không', 'nô': 'không', 'chư': 'chưa', 'chửa': 'chưa',
    'dc': 'được', 'đc': 'được', 'dk': 'được', 'dx': 'được', 'đx': 'được',
    'oki': 'ok', 'oke': 'ok', 'uk': 'ừ', 'ukm': 'ừ', 'uh': 'ừ', 'okela': 'ok',
    'dạk': 'dạ', 'vângg': 'vâng', 'đúm': 'đúng', 'chuẩn': 'đúng', 'đg': 'đúng',
    'mik': 'mình', 'mk': 'mình', 'mjnh': 'mình', 'm': 'mình', 't': 'tôi', 'toy': 'tôi', 'toi': 'tôi',
    'b': 'bạn', 'bn': 'bạn', 'pạn': 'bạn', 'mem': 'thành viên', 'ad': 'quản trị viên',
    'mn': 'mọi người', 'm.n': 'mọi người', 'ngta': 'người ta', 'ngt': 'người ta',
    'ae': 'anh em', 'ce': 'chị em', 'a': 'anh', 'e': 'em', 'cj': 'chị',
    'vk': 'vợ', 'ck': 'chồng', 'cr': 'crush', 'ny': 'người yêu', 'ex': 'người yêu cũ', 'nyc': 'người yêu cũ',
    'bff': 'bạn thân', 'gđ': 'gia đình', 'hs': 'học sinh', 'sv': 'sinh viên', 'gv': 'giáo viên', 'ngk':'người khác',
    'bt': 'bình thường', 'bth': 'bình thường', 'bthg': 'bình thường',
    'nt': 'nhắn tin', 'ib': 'nhắn tin', 'rep': 'trả lời', 'tl': 'trả lời', 'cmt': 'bình luận',
    'iu': 'yêu', 'yeu': 'yêu', 'thik': 'thích', 'chê': 'không thích',
    'j': 'gì', 'zì': 'gì', 'gì z': 'gì vậy', 'z': 'vậy', 'zay': 'vậy', 'zậy': 'vậy', 'v': 'vậy',
    'tks': 'cảm ơn', 'thanks': 'cảm ơn', 'tk': 'cảm ơn', 'cam on': 'cảm ơn', 'cảm mơn': 'cảm ơn',
    'xl': 'xin lỗi', 'srr': 'xin lỗi', 'sori': 'xin lỗi','sr': 'xin lỗi', 'sory': 'xin lỗi',
    'ng': 'người', 'n': 'người',
    'ms': 'mới', 'lm': 'làm', 'bik': 'biết', 'bit': 'biết', 'hỉu': 'hiểu',
    'h': 'giờ', 'p': 'phút',
    'cx': 'cũng', 'lun': 'luôn', 'luân': 'luôn',
    'ak': 'à', 'ah': 'à', 'ha': 'hả', 'há': 'hả',
    'vs': 'với', 'wa': 'quá', 'wá': 'quá', 
    'r': 'rồi', 'roi': 'rồi', 'rùi': 'rồi', 'gòi': 'rồi', 'gòy': 'rồi',
    'bh': 'bao giờ', 'hqa': 'hôm qua', 'hnay': 'hôm nay', 'mai': 'ngày mai',
    'nma': 'nhưng mà', 'nvay': 'như vậy', 'ntn': 'như thế nào', 'tnao': 'thế nào',
    'đk': 'đúng không', 'ns': 'nói', 'nhiu': 'nhiêu', 'nhìu': 'nhiều',
    'bnhiu': 'bao nhiêu', 'kb': 'không biết', 'thui': 'thôi', 'thoai': 'thôi',
    'lquan': 'liên quan', 'klq': 'không liên quan', 'ncl': 'nói chung là', 
    'nx': 'nữa', 'mún': 'muốn', 'nc': 'nước', 'cs':'có',
    'vcl': 'vãi', 'vl': 'vãi', 'vler': 'vãi', 'vđ': 'vãi',
    'gato': 'ghen tị', 'ato': 'ảo tưởng', 'chảnh': 'kiêu ngạo',
    'tr': 'trời', 'trùi': 'trời', 'chời': 'trời', 'ui': 'ôi', 'qtqd': 'quá trời quá đất',
    'cít': 'cứt', 'cucws': 'cứt', 'hnhu': 'hình như',
    'dth': 'dễ thương', 'dzth': 'dễ thương', 'xjh': 'xinh', 'dz': 'đẹp trai', 'đz': 'đẹp trai',
    'bùn': 'buồn', 'zui': 'vui', 'xu': 'xui xẻo', 'xucana': 'xui xẻo',
    'stt': 'trạng thái', 'avt': 'ảnh đại diện', 'in4': 'thông tin', 'link': 'đường dẫn', 
    'font': 'phông chữ', 'mịa':'mẹ','zô':'vào','ôg':'ông','qá':'quá','thíu':'thiếu'
}

# --- TỪ KHÓA ---
TU_KHOA_TICH_CUC = [
    'hay', 'tuyệt', 'đỉnh', 'thích', 'yêu', 'ngon', 'quá đã', 'xuất sắc', '10 điểm', 
    'mê', 'đẹp', 'giỏi', 'cảm ơn', 'ý nghĩa', 'siêu', 'hóng', 'vui', 'xịn', 'tốt',
    'support', 'ủng hộ', 'fighting', 'best', 'nhất', 'thấm', 'cuốn', 'chất', 'mượt', 'lót dép', 'chu đáo',
    'chờ mãi', 'cháy', 'mlem', 'bén', 'dính', 'keo', 'slay', 'bánh cuốn', 'gét gô', 'đỉnh chóp',
    'hết nước chấm', 'uy tín', 'đáng yêu', 'cute', 'dễ thương', 'ngầu', 'xin vía',
    'hài', 'cười', 'giải trí', 'thư giãn', 'hạnh phúc', 'xúc động', 'khóc', 
    'ngưỡng mộ', 'respect', 'nể', 'tâm huyết', 'đầu tư', 'sâu sắc', 'nhân văn', 'truyền cảm hứng', 'động lực',
    'đáng mơ ước', 'đã ghê', 'chúc', 'may mắn', 'tuyệt vời', 'yêu lắm', 'chữa lành', 'ấn tượng', 'đáng yêu xỉu', '<3', 'mến mộ','đã quá',
    'đã thật sự', 'sạch bóng', 'kinh nghiệm', 'tuyệt trần', 'phê', 'rực rỡ'
]

TU_KHOA_TIEU_CUC = [
    'chán', 'dở', 'tệ', 'xấu', 'lag', 'rác', 'nhạt', 'phế', 'cứt', 'đần', 
    'ghét', 'phẫn nộ', 'kém', 'thất vọng', 'xàm', 'bịp', 'lừa', 'dislike', 'tắt',
    'kinh', 'phí', 'nhục', 'ngứa mắt', 'thua', 'dốt', 'cay',
    'ngu', 'óc', 'trẩu', 'súc vật', 'chó', 'điên', 'khùng', 'biến',
    'nhảm', 'xàm xí', 'xàm lờ', 'câu view', 'câu like', 'bú fame', 'bú flame',
    'lố', 'ô dề', 'giả trân', 'flop', 'xu cà na', 'toxic', 'hãm',
    'phản đối', 'tẩy chay', 'xóa', 'report', 'spam', 'quảng cáo', 'mờ', 'giật',
    'không hay', 'phí tiền', 'phí thời gian', 'đừng xem', 'đổ lỗi', 'xúc phạm',
    'não tàn', 'não', 'chịu', 'cũng chịu', 'làm ăn', 'làm ăn thế này',
    'cẩu thả', 'cẩu', 'thối não', 'nội dung thối não', 'coi thường',
    'chả khác gì coi thường', 'nát', 'ăn chửi', 'chỉ đến mức này thôi à',
    'nhục nhã', 'sai', 'vẫn sai hoàn sai', 'ngứa', 'thấy ngứa mắt',
    'thất bại', 'thất bại thật sự', 'vô duyên', 'rác rưởi', 'thiển cận', 
    'stress', 'stress nặng', 'mõm', 'dở ẹc', 'tệ thật', 'thật sự thất vọng', 
    'cực chán', 'quãi', 'quãi ghê', 'phèn', 'lôi thôi', 'giả tạo',
    'bó tay', 'hết cứu', 'lấp liếm', 'giấu', 'bất công', 'thiếu sót',
    'đi xuống', 'thụt lùi', 'chói mắt', 'khóc mướn', 'bôi bác',
    'hối hận', 'gượng gạo', 'giả', 'dài dòng', 'lạc đề', 'ngộ độc',
    'ảo tưởng', 'oãi cả chưởng', 'ma túy', 'trộm',
    'bậy bạ', 'tức', 'bực', 'điêu', 'phế phẩm', 
    'không ra hồn', 'lỗi tè le', 'ẩu tả', 'thiếu thiện cảm', 'ko còn thiện cảm', 'tội ác'
]

MAU_MIA_MAI = [
    r'(tuyệt vời|hay|đỉnh|giỏi|xuất sắc|chuyên nghiệp|quốc gia).{1,40}(mà|nhưng|lại|vẫn).{1,40}(sai|lỗi|tệ|chán|thất vọng|không ra hồn|tè le)',
    r'(chắc|hình như|chắc là|đài|kênh|chuyên nghiệp).{1,40}(thực tập|sinh viên|intern|trẻ con|mẫu giáo)',
    r'ảo tưởng.(vừa|ít).thôi',
    r'(nhục|chán|tệ).{1,15}(nhỉ|thật|vậy)',
    r'holy sh\*t', r'xúc phạm iq'
]

TU_LOAI_BO_TIENG_VIET = {
    'là', 'và', 'của', 'thì', 'mà', 'có', 'nhưng', 'với', 'những', 'này', 
    'cho', 'được', 'cũng', 'đã', 'trong', 'để', 'các', 'một', 'làm', 'người',
    'tại', 'bởi', 'vì', 'rằng', 'nếu', 'dù', 'hoặc', 'tuy', 
    'em', 'anh', 'mình', 'bạn', 'tôi', 'tao', 'mày', 'nó', 'họ', 'chị', 'chú', 'bác',
    'admin', 'kênh', 'video', 'clip', 'xem', 'kênh', 'vid', 'tui', 'ad', 'ta',
    'ạ', 'ơi', 'nha', 'ôi', 'ủa', 'ae', 'nhé', 'nhỉ', 'ha', 'hả', 'hở', 'á', 'cơ', 
    'đâu', 'đấy', 'đó', 'kia', 'nọ', 'rồi', 'vậy', 'thôi', 'luôn', 'ngay',
    'không', 'ko', 'k', 'kh', 'khong', # Phủ định
    'năm', 'nay', 'hôm', 'ngày', 'giờ', 'phút', 'năm nay','năm ngoái', # Thời gian
    'phải', 'đến', 'ra', 'vào', 'lên', 'xuống', # Động từ chỉ hướng/trạng thái
    'quá', 'lắm', 'thật', 'thiệt', 'rất', 'hơi', # Trạng từ mức độ
    'ông', 'bà', 'anh', 'chị', 'em', 'tui', 'mình', 'nó', 'họ', 'bạn', # Xưng hô
    'cái', 'con', 'chiếc', 'vụ', 'việc', 'điều', 'thứ', # Loại từ
    'thấy', 'biết', 'nói', 'bảo', 'nghe', 'nhìn', # Động từ giác quan
    'rồi', 'xong', 'chưa', 'vẫn', 'còn', 'cứ', # Trạng thái
    'đâu', 'đó', 'đây', 'kia','ai', # Chỉ định từ
    'nhỉ', 'nhé', 'nha', 'hả', 'luôn', 'ngay', # Từ đệm
    'chắc', 'tưởng', 'ngỡ', 'hình', 'như', # Phỏng đoán
    'từ', 'theo', 'do', 'bị', 'khi', 'lúc', 'nào', # Giới từ khác
    'video','chỉ','nè', 'oi', 'co'
}

def lam_sach_van_ban(van_ban, xoa_tu_loai_bo=False): 
    if not isinstance(van_ban, str): return ""
    
    # 1. Chuyển chữ thường
    van_ban = van_ban.lower()
    
    # 2. Xóa URL & Mention
    van_ban = re.sub(r'http\S+', '', van_ban)
    van_ban = re.sub(r'@[\w\.-]+', '', van_ban)
    
    # 3. Xóa ký tự đặc biệt (Giữ lại chữ và số)
    van_ban = re.sub(r'[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ0-9]', ' ', van_ban)
    
    # XỬ LÝ TIẾNG CƯỜI VÀ VÀI KÝ TỰ ĐẶC BIỆT TRƯỚC KHI RÚT GỌN KÝ TỰ
    van_ban = re.sub(r'\bk{2,}\b', ' haha ', van_ban)
    van_ban = re.sub(r'\bh{2,}\b', ' haha ', van_ban)
    van_ban = re.sub(r'\b(ha){2,}(h)?\b', ' haha ', van_ban)
    van_ban = re.sub(r'\b(he){2,}(h)?\b', ' haha ', van_ban)
    van_ban = re.sub(r'\b(hi){2,}(h)?\b', ' haha ', van_ban)
    van_ban = re.sub(r'\bz{2,}\b', ' khò ', van_ban)
    van_ban = re.sub(r'\ba{2,}\b', ' á ', van_ban)
    van_ban = re.sub(r'\bp{2,}\b', ' tạm biệt ', van_ban)
    
    # 4. Xóa ký tự kéo dài
    van_ban = re.sub(r'([a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])\1{2,}', r'\1', van_ban)
    
    # 5. Tách từ
    cac_tu = van_ban.split()
    
    # 6. Chuẩn hóa Teencode
    cac_tu = [TU_DIEN_TEENCODE.get(tu, tu) for tu in cac_tu]
    
    # 7. Lọc Stopwords (Chỉ áp dụng cho WordCloud hoặc khi cần)
    if xoa_tu_loai_bo:
        cac_tu = [tu for tu in cac_tu if tu not in TU_LOAI_BO_TIENG_VIET and not tu.isdigit()] 
        
    van_ban = ' '.join(cac_tu)
    van_ban = re.sub(r'\s+', ' ', van_ban).strip()
    return van_ban

def an_danh_ten_rieng_cho_bert_an_toan(van_ban):
    if not isinstance(van_ban, str): return ""
    pattern_hoa = r'\b[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ][a-zàáâãèéêìíòóôõùúăđĩũơưăạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]*\b'
    cau_da_che = re.sub(pattern_hoa, 'ai_đó', van_ban)
    cau_hoan_thien = re.sub(r'(ai_đó\s*)+', 'ai_đó ', cau_da_che)
    return cau_hoan_thien.strip()

def hieu_chinh_cam_xuc_theo_luat(cau_goc, nhan_may_doan):
    if not isinstance(cau_goc, str): return nhan_may_doan
    cau_thuong = cau_goc.lower()
    cac_tu = cau_thuong.split()
    if not cac_tu: return nhan_may_doan
    
    kinh_ngu = ['dạ', 'vâng', 'thưa', 'xin mời', 'mời', 'ạ']
    if any(tu in cac_tu for tu in kinh_ngu) and nhan_may_doan == 'Negative': 
        return 'Neutral' 

    cum_tu_tich_cuc_manh = ["không thua kém", "không kém", 'chúc', 'cảm ơn', 'cám ơn', 'hi vọng']
    if any(cum in cau_thuong for cum in cum_tu_tich_cuc_manh):
        return "Positive"
    return nhan_may_doan

def chuyen_hoa_ngu_canh(van_ban):
    van_ban = f" {van_ban} "
    tu_bao_ve = ['chi phí', 'lệ phí', 'miễn phí', 'nhập cư', 'quy hoạch', 'hạ tầng', 'kinh thủ lăng nghiêm']
    for tu in tu_bao_ve:
        van_ban = van_ban.replace(tu, tu.replace(" ", "_"))

    tu_dien_dao_nghia = {
        r'tắt (bếp|đèn|máy|điện|nước|quạt|lửa|tiếng|cam|camera)': r'ngắt \1',
        r'(không|ko|k|chả|chẳng|chưa).{1,15}(rác|dơ|bẩn)': 'sạch sẽ',
        r'(không|ko|k|chả|chẳng|chưa).{1,15}(chán|tệ|dở)': 'thú vị',
        r'(không|ko|k).{1,15}(thua kém|kém)': 'xuất sắc',
        r'hết buồn|hết chán|hết mệt|hết bực': 'vui vẻ',
        r'chờ muốn chết|đợi muốn chết|hóng muốn chết|chờ mòn mỏi|đợi mòn mỏi': 'rất hóng',
        r'im lặng một cách ồn ào|ồn ào mà vui|ồn ào cũng vui': 'thú vị',
        r'buồn cười': 'hài hước',
        r'đã thật sự|phê ê ê': 'rất tuyệt vời',
        r'chết cười|cười chết|cười đau bụng|cười ẻ': 'rất buồn cười',
        r'buồn ghê.*không có video|buồn.*không thấy ra clip': 'mong ngóng video',
        r'ngán lây': 'đồng cảm',
        r'không thấy rác|sạch bóng|không một cọng rác': 'rất sạch sẽ',
        r'(không|ko|k|chưa|chẳng|chả).{1,25}thất vọng': 'tuyệt vời',
    }
    for mau, thay_the in tu_dien_dao_nghia.items():
        van_ban = re.sub(mau, thay_the, van_ban, flags=re.IGNORECASE)

    cau_hoi_pattern = r'(\?|bao nhiêu|chi phí|làm sao|thế nào|đko\b|được không|k a\b|k ạ\b|nhỉ\b|hả\b)'
    if re.search(cau_hoi_pattern, van_ban):
        return "" 
        
    return van_ban.strip()

def kiem_tra_mia_mai(van_ban):
    for mau in MAU_MIA_MAI:
        if re.search(mau, van_ban, re.IGNORECASE):
            return True
    return False

def tinh_diem_phan_doan(doan_van):
    diem_pos = 0.0
    diem_neg = 0.0

    tu_phu_dinh = ['không ', 'ko ', 'k ', 'kh ', 'khong ', 'chưa ', 'chả ', 'chẳng ', 'đừng ']
    cum_tu_tich_cuc = [kw for kw in TU_KHOA_TICH_CUC if ' ' in kw]
    cum_tu_tieu_cuc = [kw for kw in TU_KHOA_TIEU_CUC if ' ' in kw]
    
    for pd in tu_phu_dinh:
        for tc in cum_tu_tich_cuc:
            if pd + tc in doan_van:
                diem_neg += 1.0  
                doan_van = doan_van.replace(pd + tc, " ")
        for tc in cum_tu_tieu_cuc:
            if pd + tc in doan_van:
                diem_pos += 1.0 
                doan_van = doan_van.replace(pd + tc, " ")
                
    for tu in cum_tu_tieu_cuc:
        if tu in doan_van: 
            diem_neg += 1.0
            doan_van = doan_van.replace(tu, " ")
    for tu in cum_tu_tich_cuc:
        if tu in doan_van: 
            diem_pos += 1.0
            doan_van = doan_van.replace(tu, " ")

    words = doan_van.split()
    he_so_nhan = 1.0
    co_phu_dinh_phia_truoc = False
    tu_phu_dinh_don = [p.strip() for p in tu_phu_dinh]
    tu_chi_muc_do = ['rất', 'quá', 'cực', 'cực kỳ', 'siêu', 'lắm', 'vô cùng', 'thật sự', 'thực sự']

    for word_lower in words:
        if word_lower in tu_phu_dinh_don:
            co_phu_dinh_phia_truoc = True
            continue
            
        if word_lower in tu_chi_muc_do:
            he_so_nhan = 1.5 
            continue

        if word_lower in TU_KHOA_TIEU_CUC:
            diem_tu = 1.0 * he_so_nhan
            if co_phu_dinh_phia_truoc: diem_pos += diem_tu
            else: diem_neg += diem_tu
            he_so_nhan = 1.0
            co_phu_dinh_phia_truoc = False
            
        elif word_lower in TU_KHOA_TICH_CUC:
            diem_tu = 1.0 * he_so_nhan
            if co_phu_dinh_phia_truoc: diem_neg += diem_tu
            else: diem_pos += diem_tu
            he_so_nhan = 1.0
            co_phu_dinh_phia_truoc = False
        else:
            co_phu_dinh_phia_truoc = False

    return diem_pos, diem_neg

def tinh_diem_cam_xuc_tho(van_ban):
    van_ban_thuong = van_ban.lower()
    van_ban_thuong = chuyen_hoa_ngu_canh(van_ban_thuong)
    
    tu_chuyen_huong = [' nhưng ', ' nma ', ' nhưng mà ', ' tuy nhiên ', ' cơ mà ', ' mặc dù ', ' bao giờ ']
    vi_tri_cat = -1
    tu_cat_dung = ""
    
    for tu in tu_chuyen_huong:
        pos = van_ban_thuong.find(tu)
        if pos != -1 and (vi_tri_cat == -1 or pos < vi_tri_cat):
            vi_tri_cat = pos
            tu_cat_dung = tu
            
    if vi_tri_cat != -1:
        ve_truoc = van_ban_thuong[:vi_tri_cat]
        ve_sau = van_ban_thuong[vi_tri_cat + len(tu_cat_dung):]
        
        pos_truoc, neg_truoc = tinh_diem_phan_doan(ve_truoc)
        pos_sau, neg_sau = tinh_diem_phan_doan(ve_sau)
        
        diem_pos = (pos_truoc * 0.5) + (pos_sau * 2.0)
        diem_neg = (neg_truoc * 0.5) + (neg_sau * 2.0)
    else:
        diem_pos, diem_neg = tinh_diem_phan_doan(van_ban_thuong)
        
    if 'buồn' in van_ban_thuong or 'tiếc' in van_ban_thuong or 'đau' in van_ban_thuong:
        diem_neg += 1.0
        
    return diem_pos, diem_neg

def lay_cam_xuc_soft(van_ban):
    diem_pos, diem_neg = tinh_diem_cam_xuc_tho(van_ban)
    
    ds_bieu_tuong = [c['emoji'] for c in emoji.emoji_list(van_ban)]
    icon_tich_cuc = ['❤', '🥰', '😍', '👍', '🔥', '😘', '😊', '😁', '❤️', '💕', '😆', '😋', '😎', '😚', '🤗', '🤑', '🌹', '🎊']
    icon_tieu_cuc = ['💔', '👎', '😡', '🤬', '😞', '😒', '🤦‍♀️','🤦‍♂️','😑','🙄','😔','☹️','🙁','😟','😰','😱','💀','☠️','💩','🤡']
    
    for icon in ds_bieu_tuong:
        if icon in icon_tich_cuc: diem_pos += 0.5
        if icon in icon_tieu_cuc: diem_neg += 0.5

    if kiem_tra_mia_mai(van_ban.lower()):
        diem_neg += 2.0
        diem_pos = 0.0 

    diem_tu_text_chi_dinh = tinh_diem_cam_xuc_tho(van_ban)[1] 
    if diem_tu_text_chi_dinh >= 2.0 and diem_pos > 0:
        diem_pos = 0.0 

    logits = np.array([diem_neg, 0.5, diem_pos]) 
    T = 1.5 
    exp_logits = np.exp(logits / T)
    probabilities = exp_logits / np.sum(exp_logits)
    
    return probabilities

def la_binh_luan_rac(van_ban):
    van_ban = van_ban.lower().strip()
    
    # 1. Comment quá ngắn (dưới 2 ký tự)
    if len(van_ban) < 2: return True
    
    # 2. Comment chỉ toàn số (VD: "2025")
    if van_ban.isdigit(): return True
    
    # 3. Comment điểm danh (VD: "Ai 2025?", "2025 điểm danh")
    mau_binh_luan_rac = [
        r'^ai xem.*202\d.*',      # Ai xem... 202x
        r'^202\d\s*điểm danh',    # 202x điểm danh
        r'^có ai.*202\d.*',       # Có ai... 202x
        r'^202\d\s*👇',            # 202x + icon chỉ tay
        r'^202\d\s*chấm'          # 202x chấm
    ]
    for mau in mau_binh_luan_rac:
        if re.search(mau, van_ban):
            return True
            
    return False