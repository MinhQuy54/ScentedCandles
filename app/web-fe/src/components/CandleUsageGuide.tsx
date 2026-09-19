interface CandleUsageGuideProps {
  type?: "candle" | "essential-oil";
  categoryName?: string;
  productName?: string;
}

export function CandleUsageGuide({ type, categoryName, productName }: CandleUsageGuideProps = {}) {
  const isEssentialOil =
    type === "essential-oil" ||
    (categoryName && /tinh dầu|essential|khuếch tán/i.test(categoryName)) ||
    (productName && /tinh dầu|essential|khuếch tán/i.test(productName));

  const productInfoCandleItems = [
    "Dung tích: 8oz, tương đương 225gram, khả năng dùng liên tục trong 40-45 giờ đốt",
    "Thành phần: sáp cọ, tinh dầu",
    "Công dụng: tạo hương thơm, thắp sáng không gian",
    "Sản phẩm của 7senses được sản xuất thủ công với những nguyên liệu an toàn với sức khoẻ người dùng, kể cả trẻ em và mẹ bầu, không chứa các chất độc hại thường có trong hương liệu như arsen, thuỷ ngân, chì, cadimi… Sản phẩm đã được kiểm nghiệm và chứng nhận bởi Viện kiểm nghiệm & kiểm định chất lượng VNTEST - Liên hiệp các hội khoa học & kỹ thuật Việt Nam.",
    "Bấc nến làm bằng gỗ tạo ra âm thanh tí tách nhỏ vui tai khi đốt",
    "Nến được đặt trong hũ thủy tinh chắc chắn, chịu nhiệt tốt, màu sắc và họa tiết trên thân vỏ thuộc độc quyền của 7senses, không thể tìm thấy y hệt ở bất kỳ thương hiệu nào.",
    "Quy cách đóng gói miễn phí đi kèm: hộp giấy carton, túi giấy thiết kế trang nhã, tinh tế kèm theo hướng dẫn sử dụng. Nếu quý khách cần thắt nơ ruy băng ở hộp và thiệp để đi tặng, vui lòng ghi chú thêm trong đơn hàng hoặc báo với nhân viên bán hàng tại store để được cung cấp miễn phí.",
  ];

  const productInfoEssentialOilItems = [
    "Dung tích: 100ml, khả năng dùng liên tục trong 5 tháng",
    "Thành phần: tinh dầu",
    "Công dụng: tạo hương thơm cho không gian, trang trí",
    "Sản phẩm của 7senses được sản xuất thủ công với những nguyên liệu an toàn với sức khoẻ người dùng, kể cả trẻ em và mẹ bầu, không chứa các chất độc hại thường có trong hương liệu như arsen, thuỷ ngân, chì, cadimi… Sản phẩm đã được kiểm nghiệm và chứng nhận bởi Viện kiểm nghiệm & kiểm định chất lượng VNTEST - Liên hiệp các hội khoa học & kỹ thuật Việt Nam.",
    "Tinh dầu được đặt trong hũ thủy tinh chắc chắn, màu sắc và họa tiết trên thân vỏ thuộc độc quyền của 7senses, không thể tìm thấy y hệt ở bất kỳ thương hiệu nào.",
    "Quy cách đóng gói miễn phí đi kèm: 8 que khuếch tán, hộp giấy carton, túi giấy thiết kế trang nhã, tinh tế kèm theo hướng dẫn sử dụng. Nếu quý khách cần thắt nơ ruy băng ở hộp và thiệp để đi tặng, vui lòng ghi chú thêm trong đơn hàng hoặc báo với nhân viên bán hàng tại store để được cung cấp miễn phí.",
  ];

  const guideCandleItems = [
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

  const guideEssentialOilItems = [
    "Sau khi mở nắp lần đầu: cắm que trong 01 tiếng, sau đó quay đầu que còn lại để hai đầu que đều ướt",
    "Không chụm que về một bên mà xòe rộng các que",
    "Số que cắm quyết định độ khuếch tán của tinh dầu mạnh hay nhẹ: Phòng nhỏ cắm ít que, phòng rộng cắm nhiều que",
    "Thường xuyên khuấy nhẹ tinh dầu và đảo đầu que mỗi tuần",
  ];

  const productInfoItems = isEssentialOil ? productInfoEssentialOilItems : productInfoCandleItems;
  const guideItems = isEssentialOil ? guideEssentialOilItems : guideCandleItems;
  const guideTitle = isEssentialOil ? "ĐỂ SỬ DỤNG TINH DẦU ĐÚNG CÁCH" : "ĐỂ SỬ DỤNG NẾN THƠM ĐÚNG CÁCH";

  const renderList = (items: string[]) => (
    <ul className="list-unstyled mb-0 text-secondary" style={{ fontSize: "14px", lineHeight: "1.6" }}>
      {items.map((item, idx) => (
        <li key={idx} className="mb-2 d-flex align-items-start gap-2">
          <span style={{ color: "#333", fontSize: "1rem", lineHeight: "1.4" }}>•</span>
          <span style={{ flex: 1 }}>{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div className="candle-product-info mt-4 pt-3 border-top">
        <h3
          className="fw-bold mb-3 text-dark text-uppercase"
          style={{ fontSize: "16px", letterSpacing: "0.03em" }}
        >
          THÔNG TIN SẢN PHẨM
        </h3>
        {renderList(productInfoItems)}
      </div>

      <div className="candle-usage-guide mt-4 pt-3 border-top">
        <h3
          className="fw-bold mb-3 text-dark text-uppercase"
          style={{ fontSize: "16px", letterSpacing: "0.03em" }}
        >
          {guideTitle}
        </h3>
        {renderList(guideItems)}
      </div>
    </>
  );
}

