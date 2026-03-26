"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Receipt, Search, Trash2, Menu, X, 
  ShoppingCart, Plus, Minus, Edit3, Check, Coffee, LogOut,
  Maximize, Minimize, Droplets, IceCream, StickyNote
} from 'lucide-react';

// --- DATA PRODUK (Contoh) ---
const products = [
  { id: 1, name: "Milk Tea", category: "Thai Series", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&h=400&fit=crop", prices: { Small: 8000, Big: 12000 } },
  { id: 2, name: "Matcha", category: "Thai Series", image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=400&h=400&fit=crop", prices: { Small: 9000, Big: 13000 } },
  { id: 3, name: "Green Tea", category: "Thai Series", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&h=400&fit=crop", prices: { Small: 9000, Big: 13000 } },
  { id: 4, name: "Milo GreenTea", category: "Thai Series", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&h=400&fit=crop", prices: { Small: 12000, Big: 17000 } },
  { id: 5, name: "Choco Dark", category: "Official Chocolate", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400&h=400&fit=crop", prices: { Small: 14000, Big: 14000 } },
  { id: 6, name: "Mango Yakult", category: "Yakult Series", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&h=400&fit=crop", prices: 15000 },
];

const toppingsData = [
  { name: "Boba", price: 2000 },
  { name: "Oreo", price: 2000 },
  { name: "Creamcheese", price: 4000 },
];

const categories = ["All", "Thai Series", "Yakult Series", "Official Chocolate"];

export default function TekoKopiLandscapePOS() {
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Customization States
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [customQty, setCustomQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("Small");
  const [selectedSugar, setSelectedSugar] = useState<string>("Normal");
  const [selectedIce, setSelectedIce] = useState<string>("Normal");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [orderNote, setOrderNote] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // --- FULLSCREEN LOGIC ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        alert("Gunakan 'Add to Home Screen' di iPhone untuk Fullscreen murni.");
      });
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  // --- CART LOGIC ---
  const hasMultipleSizes = (p: any) => p && typeof p.prices === 'object';

  const openModal = (product: any, editData?: any) => {
    if (editData) {
      setSelectedProduct({ ...product, orderId: editData.orderId });
      setCustomQty(editData.quantity);
      setSelectedSize(editData.size);
      setSelectedSugar(editData.sugar || "Normal");
      setSelectedIce(editData.ice || "Normal");
      setSelectedToppings(editData.toppings || []);
      setOrderNote(editData.note || "");
      setIsEditing(true);
    } else {
      setSelectedProduct(product);
      setCustomQty(1);
      setSelectedSize(hasMultipleSizes(product) ? "Small" : "Regular");
      setSelectedSugar("Normal");
      setSelectedIce("Normal");
      setSelectedToppings([]);
      setOrderNote("");
      setIsEditing(false);
    }
  };

  const confirmAddToCart = () => {
    const basePrice = hasMultipleSizes(selectedProduct) ? selectedProduct.prices[selectedSize] : selectedProduct.prices;
    const toppingTotal = selectedToppings.reduce((sum, tName) => {
      const topping = toppingsData.find(td => td.name === tName);
      return sum + (topping ? topping.price : 0);
    }, 0);
    const newUnitPrice = basePrice + toppingTotal;

    const orderData = {
      ...selectedProduct,
      orderId: isEditing ? selectedProduct.orderId : Date.now(),
      quantity: customQty,
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      toppings: selectedToppings,
      note: orderNote,
      unitPrice: newUnitPrice
    };

    setCart(prev => {
      if (isEditing) {
        return prev.map(item => item.orderId === orderData.orderId ? orderData : item);
      } else {
        return [...prev, orderData];
      }
    });
    setSelectedProduct(null);
  };

  const updateCartQty = (orderId: number, delta: number) => {
    setCart(prev => prev.map(item => item.orderId === orderId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const totalBill = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const filteredProducts = products.filter(p =>
    (activeCategory === "All" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 overflow-hidden font-sans text-slate-900 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]">
      
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-[100] lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      {/* --- SIDEBAR KIRI --- */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white z-[110] transition-transform duration-300 border-r border-slate-100 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            {/* Merubah warna teks menjadi Cokelat Tua */}
            <h1 className="font-black text-xl text-[#4D3C2A] tracking-tighter">Kasir Mini</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 bg-slate-50 rounded-full"><X size={20}/></button>
          </div>
          <nav className="flex-1 space-y-1">
            {/* Merubah warna aktif menjadi Cokelat Tua */}
            <button onClick={() => setActiveCategory("All")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeCategory === "All" ? 'bg-[#4D3C2A] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
              <LayoutDashboard size={18}/> Menu Utama
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-50 transition-all">
              <Receipt size={18}/> Riwayat
            </button>
          </nav>
          <button className="flex items-center gap-3 px-4 py-3 text-red-400 font-bold text-sm hover:bg-red-50 rounded-xl transition-all mt-auto">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* --- AREA TENGAH --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="p-4 lg:p-6 space-y-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white border border-slate-100 rounded-xl shadow-sm"><Menu size={20}/></button>
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              {/* Focus ring dirubah */}
              <input type="text"value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari menu..." className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-none shadow-sm outline-none text-sm focus:ring-2 focus:ring-[#4D3C2A]/20" />
            </div>
            {/* Hover dirubah */}
            <button onClick={toggleFullscreen} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-sm hover:text-[#4D3C2A] hover:border-[#4D3C2A]/10 transition-colors">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            {/* Tombol Keranjang Mobile Cokelat Tua */}
            <button onClick={() => setIsCartOpen(true)} className="lg:hidden relative p-3 bg-[#4D3C2A] text-white rounded-xl shadow-lg active:scale-95">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black">{cart.length}</span>}
            </button>
          </div>
          {/* Kategori Cokelat Tua */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-xl text-xs font-black transition-all border-2 ${activeCategory === cat ? 'bg-[#4D3C2A] border-[#4D3C2A] text-white shadow-md' : 'bg-white text-slate-400 border-white hover:border-slate-100'}`}>
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center text-slate-400">
                  Menu tidak ditemukan
                </div>
              ) : (
                filteredProducts.map(p => {
                  const price = typeof p.prices === 'number' ? p.prices : p.prices.Small;

                  return (
                    <div key={p.id} className="bg-white p-4 rounded-3xl flex flex-col shadow">

                      {/* TANPA GAMBAR */}
                      <div className="aspect-square flex items-center justify-center bg-[#4D3C2A]/10 rounded-2xl mb-3">
                        <Coffee size={40} className="text-[#4D3C2A]" />
                      </div>

                      <h3 className="font-bold text-sm">{p.name}</h3>
                      <p className="text-[#4D3C2A] font-black text-xs mb-3">
                        Rp {price.toLocaleString()}
                      </p>

                      <button
                        onClick={() => openModal(p)}
                        className="mt-auto py-2 bg-[#4D3C2A]/10 text-[#4D3C2A] rounded-xl"
                      >
                        + TAMBAH
                      </button>
                    </div>
                  );
                })
              )}
          </div>
        </div>
      </main>

      {/* --- ORDER DETAIL --- */}
      <aside className={`fixed lg:static inset-y-0 right-0 w-full sm:w-80 lg:w-96 bg-white border-l border-slate-100 z-[120] transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col pt-[max(0.5rem,env(safe-area-inset-top))]">
          <div className="p-6 flex justify-between items-center border-b">
            <h2 className="font-black text-xl text-slate-800">Detail Pesanan</h2>
            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 text-slate-400 bg-slate-50 rounded-full"><X size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 space-y-3 py-4 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-60"><ShoppingCart size={40} className="mb-4" /><p className="text-xs font-bold text-slate-400">Keranjang Kosong</p></div>
            ) : (
              cart.map((item) => (
                <div key={item.orderId} className="bg-slate-50 p-4 rounded-[24px] border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-black text-xs text-slate-800 leading-tight mb-1">{item.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {/* Variant Cokelat Tua di dalam Keranjang */}
                        <span className="px-1.5 py-0.5 bg-white text-[#4D3C2A] text-[8px] font-black rounded border border-[#4D3C2A]/10 uppercase">{item.size}</span>
                        <span className="px-1.5 py-0.5 bg-white text-blue-500 text-[8px] font-black rounded border border-blue-50 uppercase">{item.sugar} Sugar</span>
                        <span className="px-1.5 py-0.5 bg-white text-cyan-600 text-[8px] font-black rounded border border-cyan-50 uppercase">{item.ice} Ice</span>
                        {item.toppings.map((t: string) => (<span key={t} className="px-1.5 py-0.5 bg-white text-slate-500 text-[8px] font-bold rounded border border-slate-100 uppercase">+ {t}</span>))}
                      </div>
                      {item.note && <p className="text-[9px] text-slate-400 mt-1 font-medium italic">Note: {item.note}</p>}
                    </div>
                    {/* Hover dirubah */}
                    <button onClick={() => openModal(products.find(p => p.id === item.id), item)} className="p-1.5 text-slate-300 hover:text-[#4D3C2A] hover:bg-white rounded-xl transition-all"><Edit3 size={14}/></button>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200/40">
                    <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-lg px-2 py-0.5 shadow-sm">
                      <button onClick={() => updateCartQty(item.orderId, -1)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                        {item.quantity === 1 ? <Trash2 size={12}/> : <Minus size={12}/>}
                      </button>
                      <span className="text-xs font-black text-slate-800 w-3 text-center">{item.quantity}</span>
                      {/* Plus dirubah Cokelat */}
                      <button onClick={() => updateCartQty(item.orderId, 1)} className="p-1 text-[#4D3C2A] hover:bg-[#4D3C2A]/5 rounded-md"><Plus size={12}/></button>
                    </div>
                    <p className="font-black text-xs text-slate-800">Rp {(item.unitPrice * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-6 bg-white border-t border-dashed border-slate-200 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between items-center"><span className="font-black text-slate-400 text-[10px]">TOTAL ITEMS</span><span className="font-black text-slate-800 text-xs">{cart.reduce((a, b) => a + b.quantity, 0)} Gelas</span></div>
              {/* Total Teks Cokelat Tua */}
              <div className="flex justify-between items-center"><span className="font-black text-slate-800">TOTAL BAYAR</span><span className="font-black text-xl text-[#4D3C2A] tracking-tighteritalic">Rp {totalBill.toLocaleString()}</span></div>
            </div>
            {/* Tombol Konfirmasi Cokelat Tua */}
            <button className="w-full py-4 bg-[#4D3C2A] text-white rounded-[20px] font-black text-xs shadow-xl shadow-[#4D3C2A]/10 hover:bg-[#4D3C2A]/90 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 uppercase tracking-widest" disabled={cart.length === 0}>Konfirmasi Pesanan</button>
          </div>
        </div>
      </aside>

      {/* --- KUSTOM MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center p-0 lg:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full h-[90%] lg:h-auto lg:max-h-[90vh] lg:max-w-md lg:rounded-[40px] rounded-t-[40px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="p-6 flex justify-between items-center bg-white border-b border-slate-50 sticky top-0 z-10">
              <div>
                <h3 className="font-black text-lg text-slate-800">{isEditing ? 'Ubah' : 'Kustom'} {selectedProduct.name}</h3>
                <p className="text-orange-500 font-bold tracking-widest text-[10px] uppercase mt-0.5">Kustomisasi Menu</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {/* Ukuran */}
              {hasMultipleSizes(selectedProduct) && (
                <section>
                  <label className="block font-black text-slate-400 text-[9px] mb-3 uppercase tracking-widest">Ukuran Gelas</label>
                  {/* Variant Cokelat Tua untuk Tombol Pilihan */}
                  <div className="grid grid-cols-2 gap-3">
                    {["Small", "Big"].map((size) => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 rounded-xl font-black text-xs border-2 transition-all ${selectedSize === size ? 'border-[#4D3C2A] bg-[#4D3C2A]/5 text-[#4D3C2A]' : 'border-slate-50 text-slate-400 hover:border-slate-100'}`}>{size}</button>
                    ))}
                  </div>
                </section>
              )}

              {/* Gula & Es */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-6 my-6">
                <section>
                  <label className="flex items-center gap-1 font-black text-slate-400 text-[9px] mb-3 uppercase tracking-widest"><Droplets size={10} className="text-blue-400"/> Sugar Level</label>
                  <div className="flex flex-col gap-2">
                    {["Normal", "Less"].map((s) => (
                      <button key={s} onClick={() => setSelectedSugar(s)} className={`py-2.5 px-3 rounded-xl font-bold text-[11px] border-2 text-left flex justify-between items-center transition-all ${selectedSugar === s ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-inner' : 'border-slate-50 text-slate-400 hover:border-slate-100'}`}>{s} {selectedSugar === s && <Check size={14} strokeWidth={4}/>}</button>
                    ))}
                  </div>
                </section>
                <section>
                  <label className="flex items-center gap-1 font-black text-slate-400 text-[9px] mb-3 uppercase tracking-widest"><IceCream size={10} className="text-cyan-400"/> Ice Level</label>
                  <div className="flex flex-col gap-2">
                    {["Normal", "Less"].map((i) => (
                      <button key={i} onClick={() => setSelectedIce(i)} className={`py-2.5 px-3 rounded-xl font-bold text-[11px] border-2 text-left flex justify-between items-center transition-all ${selectedIce === i ? 'border-cyan-500 bg-cyan-50 text-cyan-600 shadow-inner' : 'border-slate-50 text-slate-400 hover:border-slate-100'}`}>{i} {selectedIce === i && <Check size={14} strokeWidth={4}/>}</button>
                    ))}
                  </div>
                </section>
              </div>
              
              {/* Topping */}
              <section>
                <label className="block font-black text-slate-400 text-[9px] mb-3 uppercase tracking-widest">Topping Tambahan</label>
                <div className="space-y-2">
                  {toppingsData.map((t) => (
                    <div key={t.name} onClick={() => setSelectedToppings(prev => prev.includes(t.name) ? prev.filter(x => x !== t.name) : [...prev, t.name])} className={`flex justify-between items-center p-3.5 rounded-2xl cursor-pointer border-2 transition-all active:scale-[0.98] ${selectedToppings.includes(t.name) ? 'border-[#4D3C2A] bg-[#4D3C2A]/5' : 'border-slate-50 hover:border-slate-100'}`}>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-700">{t.name}</span>
                        {/* Harga Topping Cokelat Tua */}
                        <span className="font-black text-[#4D3C2A] text-[9px]">+ Rp {t.price.toLocaleString()}</span>
                      </div>
                      {/* Checkbox Cokelat Tua */}
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedToppings.includes(t.name) ? 'bg-[#4D3C2A] border-[#4D3C2A] text-white' : 'border-slate-100 bg-white'}`}>{selectedToppings.includes(t.name) && <Check size={12} strokeWidth={4} />}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Catatan - Focus Cokelat */}
              <section>
                <label className="flex items-center gap-1 font-black text-slate-400 text-[9px] mb-3 uppercase tracking-widest"><StickyNote size={10}/> Catatan Tambahan</label>
                <textarea 
                  value={orderNote} 
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Contoh: Sedotan dikurangi, jangan pakai plastik..."
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs outline-none focus:border-[#4D3C2A]/30 min-h-[80px] resize-none transition-colors"
                />
              </section>
            </div>

            <div className="p-6 border-t bg-slate-50 sticky bottom-0 z-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pb-6">
              {/* Tombol Simpan Akhir Cokelat Tua */}
              <button onClick={confirmAddToCart} className="w-full py-4 bg-[#4D3C2A] text-white rounded-2xl font-black shadow-xl shadow-[#4D3C2A]/10 uppercase tracking-widest text-[10px] active:scale-95 transition-all">Simpan & Tambahkan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}