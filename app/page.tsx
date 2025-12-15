"use client";
import { useMemo, useState } from "react";

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
      price: 80,
      description: "Balanced form with crisp edges and grounded presence.",
      image: "/cube.jpg",
    },
    {
      id: "cylinder",
      name: "Cylinder",
      price: 90,
      description: "Softly rounded silhouette with timeless appeal.",
      image: "/cylinder.jpg",
    },
    {
      id: "hexagon",
      name: "Hexagon",
      price: 95,
      description: "Facet-rich geometry with artisan precision.",
      image: "/hexagon.jpg",
    },
  ],
  plants: [
    {
      id: "mongrong",
      name: "Móng rồng (Haworthia)",
      price: 25,
      description: "Ít nước, ánh sáng vừa. Dễ chăm.",
      image: "/thumb-mongrong.jpg",
    },
    {
      id: "xuongrong",
      name: "Xương rồng (Cactus)",
      price: 30,
      description: "Ít nước, nhiều sáng. Khoẻ mạnh.",
      image: "/thumb-xuongrong.jpg",
    },
    {
      id: "senda",
      name: "Sen đá (Succulent)",
      price: 20,
      description: "Ít nước, sáng tốt. Thanh lịch.",
      image: "/thumb-senda.jpg",
    },
  ],
  toppings: [
    {
      id: "soitrang",
      name: "Sỏi trắng",
      price: 5,
      description: "Sạch, sáng, tạo cảm giác tinh khiết.",
      image: "/thumb-soitrang.jpg",
    },
    {
      id: "soitunhien",
      name: "Sỏi tự nhiên",
      price: 5,
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
            <span className="mt-1 text-xs text-stone-600">{item.description}</span>
          ) : null}
        </div>
        <span className="text-sm text-stone-700">+ ${item.price}</span>
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
              ${totalPrice}
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-green-300 bg-green-50 p-4 text-center text-sm text-green-800">
              🎁 Quà tặng kèm (Free): 1 Bịch đất (300g) + 1 Xẻng mini + 1 Bình tưới nhỏ
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="mx-auto max-w-2xl px-6 py-8 md:px-8 md:py-12">
            <div className="mb-6 text-stone-900">
              <div className="text-2xl font-serif">Cement Life</div>
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

            <div className="mb-24 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="font-serif text-lg text-stone-900">Tóm tắt lựa chọn</div>
              <div className="mt-2 text-sm text-stone-700">
                <div>Chậu: {selectedBase.name}</div>
                <div>Cây: {selectedPlant.name}</div>
                <div>Sỏi: {selectedTopping.name}</div>
              </div>
            </div>
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
                  <button className="w-full rounded-full bg-black py-4 text-white transition hover:bg-stone-800">
                    Hoàn tất tác phẩm của tôi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
