export function CandleUsageGuide() {
  const guideItems = [
    "Không đốt nơi gió lùa, gần vật bắt lửa. Tránh tầm tay trẻ em, vật nuôi",
    "Luôn cắt bấc nến còn khoảng 0.5cm trước mỗi lần đốt",
    "Đốt tối thiểu 02 tiếng trong lần đốt đầu tiên",
    "Không đốt quá 04 tiếng liên tục trong một lần đốt",
    "Không đốt cạn hũ, để lại tối thiểu 1cm trong lần đốt cuối cùng",
    "Dùng khăn ẩm lau thành hũ nếu có muội thành bám",
    "Sử dụng diêm dài/bật lửa để thắp lửa dễ hơn",
    "Không dập tắt nến bằng cách thổi, mà dùng dụng cụ chuyên nghiệp hoặc đậy nắp hũ lại",
    "Nếu đốt nến bằng đèn: đổ bớt sáp nến đã chảy sau 2-3 lần đốt",
    "Bảo quản nơi khô ráo, mát mẻ, tránh ánh nắng trực tiếp",
  ];

  return (
    <div className="candle-usage-guide mt-4 pt-3 border-top">
      <h3
        className="fw-bold mb-3 text-dark text-uppercase"
        style={{ fontSize: "16px", letterSpacing: "0.03em" }}
      >
        ĐỂ SỬ DỤNG NẾN THƠM ĐÚNG CÁCH
      </h3>
      <ul className="list-unstyled mb-0 text-secondary" style={{ fontSize: "14px", lineHeight: "1.6" }}>
        {guideItems.map((item, idx) => (
          <li key={idx} className="mb-2 d-flex align-items-start gap-2">
            <span style={{ color: "#333", fontSize: "1rem", lineHeight: "1.4" }}>•</span>
            <span style={{ flex: 1 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
