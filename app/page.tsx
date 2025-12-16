"use client";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatVND } from "@/lib/currency";

type OptionItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
};

const mockData: {
  bases: OptionItem[];
  toppings: OptionItem[];
  plants: OptionItem[];
} = {
  bases: [
    {
      id: "cube",
      name: "Cube",
      price: 25000,
      description: "Balanced form with crisp edges and grounded presence.",
      image: "/cube.jpg",
    },
    {
      id: "cylinder",
      name: "Cylinder",
      price: 30000,
      description: "Softly rounded silhouette with timeless appeal.",
      image: "/cylinder.jpg",
    },
    {
      id: "hexagon",
      name: "Hexagon",
      price: 35000,
      description: "Facet-rich geometry with artisan precision.",
      image: "/hexagon.jpg",
    },
  ],
  plants: [
    {
      id: "mongrong",
      name: "Móng rồng (Haworthia)",
      price: 25000,
      description: "Ít nước, ánh sáng vừa. Dễ chăm.",
      image: "/thumb-mongrong.jpg",
    },
    {
      id: "xuongrong",
      name: "Xương rồng (Cactus)",
      price: 20000,
      description: "Ít nước, nhiều sáng. Khoẻ mạnh.",
      image: "/thumb-xuongrong.jpg",
    },
    {
      id: "senda",
      name: "Sen đá (Succulent)",
      price: 22000,
      description: "Ít nước, sáng tốt. Thanh lịch.",
      image: "/thumb-senda.jpg",
    },
  ],
  toppings: [
    {
      id: "soitrang",
      name: "Sỏi trắng",
      price: 7000,
      description: "Sạch, sáng, tạo cảm giác tinh khiết.",
      image: "/thumb-soitrang.jpg",
    },
    {
      id: "soitunhien",
      name: "Sỏi tự nhiên",
      price: 7000,
      description: "Tự nhiên, gần gũi, gam màu ấm.",
      image: "/thumb-soitunhien.jpg",
    },
  ],
};

function OptionCard({
  item,
  selected,
  onSelect,
  showDescription,
}: {
  item: OptionItem;
  selected: boolean;
  onSelect: () => void;
  showDescription?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={
        "group flex flex-col rounded-xl bg-white p-2 transition " +
        (selected
          ? "border-2 border-stone-800"
          : "border border-gray-200 hover:border-stone-400")
      }
    >
      <img
        src={item.image}
        alt={item.name}
        className="aspect-square w-full rounded-lg object-cover"
      />
      <div className="flex items-end justify-between gap-2 px-2 pb-2 pt-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-stone-900">{item.name}</span>
          {showDescription ? (
            <span className="mt-1 text-xs text-gray-500">{item.description}</span>
          ) : null}
        </div>
        <span className="text-sm text-stone-700">+ {formatVND(item.price)}</span>
      </div>
    </button>
  );
}

export default function ConfiguratorPage() {
  const [selectedBase, setSelectedBase] = useState<OptionItem>(mockData.bases[0]);
  const [selectedPlant, setSelectedPlant] = useState<OptionItem>(
    mockData.plants[0]
  );
  const [selectedTopping, setSelectedTopping] = useState<OptionItem>(
    mockData.toppings[0]
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [specificAddress, setSpecificAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK_TRANSFER">("COD");
  const [provinces, setProvinces] = useState<Array<{ id: string | number; name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ id: string | number; name: string }>>([]);
  const [wards, setWards] = useState<Array<{ id: string | number; name: string }>>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | number | undefined>(undefined);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | number | undefined>(undefined);
  const [selectedWardId, setSelectedWardId] = useState<string | number | undefined>(undefined);
  type CartItem = {
    base: OptionItem;
    plant: OptionItem;
    topping: OptionItem;
    total: number;
    preview_image: string;
    creation_name?: string;
  };
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [creationName, setCreationName] = useState("");
  const [showLanding, setShowLanding] = useState(true);
  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };
  type RawLocation = {
    id?: string | number;
    ID?: string | number;
    code?: string | number;
    matp?: string | number;
    maqh?: string | number;
    xaid?: string | number;
    name?: string;
    NAME?: string;
    full_name?: string;
    ten?: string;
    Ten?: string;
    title?: string;
  };
  type RawContainer = { data?: RawLocation[] };
  const isRawContainer = (x: unknown): x is RawContainer =>
    typeof x === "object" && x !== null && "data" in (x as Record<string, unknown>);
  const isRawArray = (x: unknown): x is RawLocation[] => Array.isArray(x);
  const normalizeItems = (items: unknown): Array<{ id: string | number; name: string }> => {
    const arr: RawLocation[] = isRawArray(items) ? items : isRawContainer(items) ? items.data ?? [] : [];
    return arr
      .map((it) => {
        const id = it.id ?? it.ID ?? it.code ?? it.matp ?? it.maqh ?? it.xaid;
        const name = it.name ?? it.NAME ?? it.full_name ?? it.ten ?? it.Ten ?? it.title;
        if (id == null || name == null) return undefined;
        return { id, name: String(name) };
      })
      .filter((v): v is { id: string | number; name: string } => Boolean(v));
  };
  const fetchJSON = async (url: string): Promise<unknown> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };
  const loadProvinces = async () => {
    let data = await fetchJSON("https://esgoo.net/api-tinhthanh/1/0.htm");
    if (!data) data = await fetchJSON("https://esgoo.net/api-tinhthanh?type=province");
    setProvinces(normalizeItems(data));
  };
  const loadDistricts = async (provinceId: string | number) => {
    let data = await fetchJSON(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
    if (!data) data = await fetchJSON(`https://esgoo.net/api-tinhthanh?type=district&parent=${provinceId}`);
    setDistricts(normalizeItems(data));
  };
  const loadWards = async (districtId: string | number) => {
    let data = await fetchJSON(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
    if (!data) data = await fetchJSON(`https://esgoo.net/api-tinhthanh?type=ward&parent=${districtId}`);
    setWards(normalizeItems(data));
  };
  if (typeof window !== "undefined") {
    // Load province list when opening modal
    if (isCheckoutModalOpen && provinces.length === 0) {
      void loadProvinces();
    }
  }
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = useMemo(
    () => selectedBase.price + selectedPlant.price + selectedTopping.price,
    [selectedBase, selectedPlant, selectedTopping]
  );
  const previewSrc =
    currentStep === 1
      ? `/${selectedBase.id}.jpg`
      : `/${selectedBase.id}-${selectedPlant.id}.jpg`;
  const previewAlt =
    currentStep === 1
      ? `${selectedBase.name}`
      : `${selectedBase.name} + ${selectedPlant.name}`;
  const stepCircle = (n: number) =>
    "flex h-6 w-6 items-center justify-center rounded-full border " +
    (n === currentStep
      ? "border-black bg-black text-white"
      : n < currentStep
      ? "border-stone-900 bg-white text-stone-900"
      : "border-stone-300 bg-white text-stone-400");

  if (showLanding) {
    return (
      <div className="relative min-h-screen w-full">
        <img
          src="/images/background/plant_collage.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h1 className="text-3xl font-serif text-white md:text-5xl">
              Tạo ra mầm sống mang dấu ấn riêng của bạn
            </h1>
            <p className="mt-4 text-stone-200 md:text-lg">
              Bắt đầu hành trình thiết kế chậu cây của riêng bạn.
            </p>
            <button
              onClick={() => {
                setShowLanding(false);
                setCurrentStep(1);
              }}
              className="mt-8 rounded-full bg-black px-6 py-3 text-white transition hover:bg-stone-800 md:px-8 md:py-4 md:text-lg"
            >
              Bắt đầu Thiết kế →
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-white font-sans">
      <div className="lg:grid lg:grid-cols-2">
        <div className="bg-stone-100 lg:sticky lg:top-0 lg:h-screen">
          <div className="mx-auto max-w-2xl p-6 md:p-8 lg:p-10">
            <img
              src={previewSrc}
              alt={previewAlt}
              className="w-full rounded-2xl border border-stone-200 object-cover"
            />
            <div className="mt-4 text-center text-sm text-stone-600">
              Nền bởi Nghệ nhân. Hoàn thiện bởi Bạn.
            </div>
            <div className="mt-6 text-center font-serif text-3xl tracking-tight text-stone-900 md:text-4xl">
              {formatVND(totalPrice)}
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-green-300 bg-green-50 p-4 text-center text-sm text-green-800">
              🎁 Quà tặng kèm: 1 Bịch đất (300g) + 1 Xẻng mini + 1 Bình tưới nhỏ
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="mx-auto max-w-2xl px-6 py-8 md:px-8 md:py-12">
            <div className="mb-6 text-stone-900">
              <div className="text-2xl font-serif">Cement Life</div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="rounded-full border border-stone-300 px-3 py-1 text-sm text-stone-900 hover:bg-stone-100"
                >
                  Giỏ hàng ({cart.length})
                </button>
              </div>
            </div>
            <div className="mb-8">
              <div className="flex items-center gap-3 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <span className={stepCircle(1)}>1</span>
                  <span>Chậu</span>
                </div>
                <span className="text-stone-300">→</span>
                <div className="flex items-center gap-2">
                  <span className={stepCircle(2)}>2</span>
                  <span>Cây</span>
                </div>
                <span className="text-stone-300">→</span>
                <div className="flex items-center gap-2">
                  <span className={stepCircle(3)}>3</span>
                  <span>Sỏi</span>
                </div>
                <span className="text-stone-300">→</span>
                <div className="flex items-center gap-2">
                  <span className={stepCircle(4)}>4</span>
                  <span>Tên</span>
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="mb-24">
                <div className="mb-3 font-serif text-xl text-stone-900">Chọn Chậu</div>
                <div className="grid grid-cols-2 gap-4">
                  {mockData.bases.map((b) => (
                    <OptionCard
                      key={b.id}
                      item={b}
                      selected={selectedBase.id === b.id}
                      onSelect={() => setSelectedBase(b)}
                    />
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="mb-24">
                <div className="mb-3 font-serif text-xl text-stone-900">Chọn Cây</div>
                <div className="grid grid-cols-2 gap-4">
                  {mockData.plants.map((plant) => (
                  <OptionCard
                    key={plant.id}
                    item={plant}
                    selected={selectedPlant.id === plant.id}
                    onSelect={() => setSelectedPlant(plant)}
                    showDescription
                  />
                ))}
              </div>
            </div>
          )}

            {currentStep === 3 && (
              <div className="mb-24">
                <div className="mb-3 font-serif text-xl text-stone-900">Chọn Sỏi</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {mockData.toppings.map((t) => (
                    <OptionCard
                      key={t.id}
                      item={t}
                      selected={selectedTopping.id === t.id}
                      onSelect={() => setSelectedTopping(t)}
                      showDescription
                    />
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="mb-24">
                <div className="mb-3 font-serif text-xl text-stone-900">Đặt tên cho chậu cây</div>
                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Một cái tên dành riêng cho nó."
                    value={creationName}
                    onChange={(e) => setCreationName(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-stone-800"
                  />
                  <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <div className="mb-2 text-center text-sm text-stone-700">
                      {`${creationName || "..."}, đã sẵn sàng.`}
                    </div>
                    <img
                      src={`/${selectedBase.id}-${selectedPlant.id}.jpg`}
                      alt={`${selectedBase.name} + ${selectedPlant.name}`}
                      className="w-full rounded-lg border border-stone-200 object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="mb-24 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <div className="font-serif text-lg text-stone-900">Tóm tắt lựa chọn</div>
                <div className="mt-2 text-sm text-stone-700">
                  <div>Chậu: {selectedBase.name}</div>
                  <div>Cây: {selectedPlant.name}</div>
                  <div>Sỏi: {selectedTopping.name}</div>
                </div>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 border-t border-stone-200 bg-white">
            <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-6 md:px-8">
              {currentStep === 1 && (
                <>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full rounded-full bg-black py-4 text-white transition hover:bg-stone-800"
                  >
                    Tiếp: Chọn Cây →
                  </button>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="w-full rounded-full border border-stone-300 bg-white py-4 text-black transition hover:bg-stone-100"
                  >
                    ← Quay lại
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full rounded-full bg-black py-4 text-white transition hover:bg-stone-800"
                  >
                    Tiếp: Chọn Sỏi →
                  </button>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full rounded-full border border-stone-300 bg-white py-4 text-black transition hover:bg-stone-100"
                  >
                    ← Quay lại
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="w-full rounded-full bg-black py-4 text-white transition hover:bg-stone-800"
                  >
                    Tiếp: Đặt tên →
                  </button>
                </>
              )}
              {currentStep === 4 && (
                <>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="w-full rounded-full border border-stone-300 bg-white py-4 text-black transition hover:bg-stone-100"
                  >
                    ← Quay lại
                  </button>
                  <div className="flex w-full items-center gap-4">
                    <button
                      onClick={() => {
                        const item: CartItem = {
                          base: selectedBase,
                          plant: selectedPlant,
                          topping: selectedTopping,
                          total: totalPrice,
                          preview_image: `/${selectedBase.id}-${selectedPlant.id}.jpg`,
                          creation_name: creationName,
                        };
                        setCart((prev) => [...prev, item]);
                        alert(`Đã thêm ${creationName || "tác phẩm"} vào giỏ hàng!`);
                        setSelectedBase(mockData.bases[0]);
                        setSelectedPlant(mockData.plants[0]);
                        setSelectedTopping(mockData.toppings[0]);
                        setCreationName("");
                        setCurrentStep(1);
                      }}
                      className="w-full rounded-full border border-stone-300 bg-white py-4 text-black transition hover:bg-stone-100"
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutModalOpen(true);
                      }}
                      className="w-full rounded-full bg-black py-4 text-white transition hover:bg-stone-800"
                    >
                      Tính tiền →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-serif text-xl text-stone-900">Giỏ hàng của bạn</div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full border border-stone-300 px-3 py-1 text-sm text-stone-900 hover:bg-stone-100"
              >
                Đóng
              </button>
            </div>
            <div className="max-h-[50vh] overflow-auto">
              {cart.length === 0 ? (
                <div className="text-sm text-stone-700">Giỏ hàng trống.</div>
              ) : (
                <div className="space-y-3">
                  {cart.map((ci, idx) => (
                    <div
                      key={`ci-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-stone-200 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={ci.preview_image}
                          alt={`${ci.base.name} + ${ci.plant.name}`}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                        <div className="text-sm text-stone-800">
                          <div className="font-medium">{ci.base.name}</div>
                          <div>{ci.plant.name}</div>
                          <div>{ci.topping.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-stone-900">{formatVND(ci.total)}</div>
                        <button
                          aria-label="Xóa"
                          onClick={() => handleRemoveItem(idx)}
                          className="rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-stone-800">
                Tổng cộng: {formatVND(cart.reduce((sum, c) => sum + c.total, 0))}
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
                className="rounded-full bg-black px-4 py-2 text-white transition hover:bg-stone-800"
              >
                Tính tiền
              </button>
            </div>
          </div>
        </div>
      )}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !submitting && setIsCheckoutModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 text-center font-serif text-xl text-stone-900">
              Hoàn tất Đơn hàng
            </div>
            <div className="mb-4 text-center text-stone-700">
              Tổng tiền: {formatVND(totalPrice)}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const provinceName = provinces.find((p) => p.id == selectedProvinceId)?.name;
                const districtName = districts.find((d) => d.id == selectedDistrictId)?.name;
                const wardName = wards.find((w) => w.id == selectedWardId)?.name;
                if (
                  !customerName ||
                  !customerPhone ||
                  !customerEmail ||
                  !specificAddress ||
                  !provinceName ||
                  !districtName ||
                  !wardName
                ) {
                  alert("Vui lòng điền đầy đủ thông tin.");
                  return;
                }
                setSubmitting(true);
                const orderDetails = {
                  base: { id: selectedBase.id, name: selectedBase.name, price: selectedBase.price },
                  plant: { id: selectedPlant.id, name: selectedPlant.name, price: selectedPlant.price },
                  topping: { id: selectedTopping.id, name: selectedTopping.name, price: selectedTopping.price },
                  preview_image:
                    currentStep === 1
                      ? `/${selectedBase.id}.jpg`
                      : `/${selectedBase.id}-${selectedPlant.id}.jpg`,
                  payment_method: paymentMethod,
                  creation_name: creationName,
                };
                const customerAddress = `${specificAddress}, ${wardName}, ${districtName}, ${provinceName}`;
                const { data, error } = await supabase
                  .from("orders")
                  .insert({
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    customer_address: customerAddress,
                    total_amount: totalPrice,
                    order_details: orderDetails,
                    status: "PENDING",
                  })
                  .select();
                setSubmitting(false);
                if (error) {
                  alert(`Đặt hàng thất bại: ${error.message}`);
                  return;
                }
                const id =
                  Array.isArray(data) && data.length > 0
                    ? (data[0] as { id?: number | string }).id
                    : undefined;
                alert(id ? `Thành công! Đơn hàng #${id} đã xác nhận.` : "Thành công! Đơn hàng đã xác nhận.");
                setIsCheckoutModalOpen(false);
                setCurrentStep(1);
              }}
            >
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Họ và tên"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-800"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-800"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Địa chỉ cụ thể (Số nhà, Tên đường)"
                  value={specificAddress}
                  onChange={(e) => setSpecificAddress(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <select
                    required
                    value={selectedProvinceId ?? ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedProvinceId(id);
                      setSelectedDistrictId(undefined);
                      setSelectedWardId(undefined);
                      setDistricts([]);
                      setWards([]);
                      if (id) {
                        void loadDistricts(id);
                      }
                    }}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-800"
                  >
                    <option value="">Chọn tỉnh / thành</option>
                    {provinces.map((p) => (
                      <option key={`p-${p.id}`} value={String(p.id)}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    value={selectedDistrictId ?? ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedDistrictId(id);
                      setSelectedWardId(undefined);
                      setWards([]);
                      if (id) {
                        void loadWards(id);
                      }
                    }}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-800"
                    disabled={!selectedProvinceId}
                  >
                    <option value="">Chọn quận / huyện</option>
                    {districts.map((d) => (
                      <option key={`d-${d.id}`} value={String(d.id)}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    value={selectedWardId ?? ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedWardId(id);
                    }}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-800"
                    disabled={!selectedDistrictId}
                  >
                    <option value="">Chọn phường / xã</option>
                    {wards.map((w) => (
                      <option key={`w-${w.id}`} value={String(w.id)}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2">
                  <div className="mb-2 text-sm font-medium text-stone-900">Phương thức thanh toán</div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-stone-800">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                      />
                      Thanh toán khi nhận hàng (COD)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-stone-800">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "BANK_TRANSFER"}
                        onChange={() => setPaymentMethod("BANK_TRANSFER")}
                      />
                      Chuyển khoản ngân hàng
                    </label>
                  </div>
                  {paymentMethod === "BANK_TRANSFER" && (
                    <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-800">
                      <div className="font-medium text-stone-900">Thông tin chuyển khoản (Techcombank)</div>
                      <div>Ngân hàng: Techcombank</div>
                      <div>Chủ tài khoản: NGO VAN HONG</div>
                      <div>Số tài khoản: 19033210412014</div>
                      <div>Chi nhánh: TP. Hồ Chí Minh</div>
                      <div className="mt-2 text-stone-600">
                        Vui lòng ghi nội dung chuyển khoản: Họ tên + SĐT
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="w-full rounded-full border border-stone-300 bg-white py-3 text-black transition hover:bg-stone-100 disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-black py-3 text-white transition hover:bg-stone-800 disabled:opacity-60"
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận đơn hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
