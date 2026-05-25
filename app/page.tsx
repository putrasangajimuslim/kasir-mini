"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Receipt, Search, Trash2, Menu, X, 
  ShoppingCart, Plus, Minus, Edit3, Check, Coffee, LogOut,
  Maximize, Minimize, Droplets, IceCream, StickyNote, Share2, Download, CheckCircle2
} from 'lucide-react';

// --- DATA PRODUK ---
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

  // --- STATE PAYMENT & MODAL SUKSES ---
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);

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

  const resetPaymentAndCart = () => {
    setCart([]);
    setCashReceived('');
    setPaymentMethod('CASH');
  };

  const totalBill = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  const changeAmount = cashReceived && cashReceived >= totalBill ? cashReceived - totalBill : 0;

  const isPaymentValid = () => {
    if (cart.length === 0) return false;
    if (paymentMethod === 'CASH') {
      return cashReceived !== '' && cashReceived >= totalBill;
    }
    return true;
  };

  // --- HANDLE SUBMIT TRANSAKSI ---
  const handleConfirmPayment = () => {
    if (!isPaymentValid()) return;

    setCompletedOrderData({
      items: [...cart],
      totalBill: totalBill,
      totalItems: totalItems,
      paymentMethod: paymentMethod,
      cashReceived: paymentMethod === 'CASH' ? cashReceived : totalBill,
      changeAmount: paymentMethod === 'CASH' ? changeAmount : 0,
      receiptNo: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    });

    setIsReceiptModalOpen(true);
  };

  // --- HANDLE TRANSAKSI BARU ---
  const handleNewTransaction = () => {
    resetPaymentAndCart();
    setIsReceiptModalOpen(false);
    setCompletedOrderData(null);
    setIsCartOpen(false);
  };

  // --- RE-ROUTING KE API BACKEND UNTUK UNDUH FILE PDF ---
  const handleDownloadPDF = async () => {
     alert("Gagal memproses file PDF di server.");
  };

  // --- BAGIKAN DATA STRUK LANGSUNG KE WHATSAPP (REAL LIVE ACTION) ---
  const handleShareWhatsApp = () => {
    if (!completedOrderData) return;

    // Skenario pembuatan template teks rapi ala WhatsApp Markdown
    let textMessage = `*STRUK PEMBELIAN ZIPTEA*\n`;
    textMessage += `=========================\n`;
    textMessage += `*No. Nota:* ${completedOrderData.receiptNo}\n`;
    textMessage += `*Tanggal:* ${completedOrderData.date}\n`;
    textMessage += `*Metode:* ${completedOrderData.paymentMethod}\n`;
    textMessage += `=========================\n\n`;

    completedOrderData.items.forEach((item: any, index: number) => {
      textMessage += `${index + 1}. *${item.name}* (x${item.quantity})\n`;
      textMessage += `   Size: ${item.size} | Sugar: ${item.sugar} | Ice: ${item.ice}\n`;
      if (item.toppings.length > 0) {
        textMessage += `   Topping: ${item.toppings.join(', ')}\n`;
      }
      if (item.note) {
        textMessage += `   _Note: ${item.note}_\n`;
      }
      textMessage += `   Subtotal: Rp ${(item.unitPrice * item.quantity).toLocaleString()}\n\n`;
    });

    textMessage += `=========================\n`;
    textMessage += `*TOTAL TAGIHAN:* Rp ${completedOrderData.totalBill.toLocaleString()}\n`;
    textMessage += `*Uang Diterima:* Rp ${completedOrderData.cashReceived.toLocaleString()}\n`;
    
    if (completedOrderData.paymentMethod === 'CASH') {
      textMessage += `*Kembalian:* Rp ${completedOrderData.changeAmount.toLocaleString()}\n`;
    }
    textMessage += `=========================\n`;
    textMessage += `_Terima kasih atas kunjungan Anda!_`;

    // Encode teks agar kompatibel dengan URL Web Browser & Handphone
    const encodedText = encodeURIComponent(textMessage);
    
    // Gunakan open API resmi WhatsApp click-to-chat
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    
    // Eksekusi buka tab baru mengarah ke aplikasi WA
    window.open(whatsappUrl, '_blank');
  };

  const quickCashOptions = [10000, 20000, 50000, 100000];

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
            <h1 className="font-black text-xl text-[#4D3C2A] tracking-tighter">Kasir Mini</h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 bg-slate-50 rounded-full"><X size={20}/></button>
          </div>
          <nav className="flex-1 space-y-1">
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
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari menu..." className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-none shadow-sm outline-none text-sm focus:ring-2 focus:ring-[#4D3C2A]/20" />
            </div>
            <button onClick={toggleFullscreen} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-sm hover:text-[#4D3C2A] hover:border-[#4D3C2A]/10 transition-colors">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="lg:hidden relative p-3 bg-[#4D3C2A] text-white rounded-xl shadow-lg active:scale-95">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black">{cart.length}</span>}
            </button>
          </div>
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

      {/* --- SIDEBAR ORDER DETAIL (KANAN) --- */}
      <aside className={`fixed lg:static inset-y-0 right-0 w-full sm:w-80 lg:w-96 bg-white border-l border-slate-100 z-[120] transition-transform duration-300 flex flex-col h-full ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        
        {/* AREA ATAS */}
        <div className="flex-1 flex flex-col overflow-hidden pt-[max(0.5rem,env(safe-area-inset-top))]">
          <div className="p-4 flex justify-between items-center border-b flex-none">
            <h2 className="font-black text-lg text-slate-800">Detail Pesanan</h2>
            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 text-slate-400 bg-slate-50 rounded-full"><X size={18}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 space-y-2 py-3 scrollbar-hide bg-slate-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-60 min-h-[150px]">
                <ShoppingCart size={32} className="mb-2" />
                <p className="text-[11px] font-bold text-slate-400">Keranjang Kosong</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.orderId} className="bg-white p-3 rounded-[16px] border border-slate-100 flex flex-col shadow-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-slate-800 truncate mb-0.5">{item.name}</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-1 py-0.5 bg-slate-50 text-[#4D3C2A] text-[8px] font-black rounded border border-[#4D3C2A]/5 uppercase">{item.size}</span>
                        <span className="px-1 py-0.5 bg-slate-50 text-blue-500 text-[8px] font-black rounded border border-blue-50 uppercase">{item.sugar} Sugar</span>
                        <span className="px-1 py-0.5 bg-slate-50 text-cyan-600 text-[8px] font-black rounded border border-cyan-50 uppercase">{item.ice} Ice</span>
                        {item.toppings.map((t: string) => (
                          <span key={t} className="px-1 py-0.5 bg-slate-50 text-slate-500 text-[8px] font-bold rounded border border-slate-100 uppercase truncate max-w-[60px]">+ {t}</span>
                        ))}
                      </div>
                      {item.note && <p className="text-[9px] text-slate-400 mt-0.5 font-medium italic truncate">Note: {item.note}</p>}
                    </div>
                    <button onClick={() => openModal(products.find(p => p.id === item.id), item)} className="p-1 text-slate-300 hover:text-[#4D3C2A] hover:bg-slate-50 rounded-lg transition-all"><Edit3 size={12}/></button>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                      <button onClick={() => updateCartQty(item.orderId, -1)} className="p-0.5 text-slate-400 hover:text-red-500 transition-colors">
                        {item.quantity === 1 ? <Trash2 size={10}/> : <Minus size={10}/>}
                      </button>
                      <span className="text-[11px] font-black text-slate-800 w-3 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.orderId, 1)} className="p-0.5 text-[#4D3C2A] hover:bg-[#4D3C2A]/5 rounded-sm"><Plus size={10}/></button>
                    </div>
                    <p className="font-black text-xs text-slate-800">Rp {(item.unitPrice * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AREA BAWAH (STAY AT BOTTOM) */}
        <div className="flex-none p-4 bg-white border-t border-dashed border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3.5">
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-wider">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-[10px]">
              <button 
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-1.5 text-xs font-black rounded-[8px] transition-all ${paymentMethod === 'CASH' ? 'bg-[#4D3C2A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
              >
                CASH
              </button>
              <button 
                type="button"
                onClick={() => {
                  setPaymentMethod('QRIS');
                  setCashReceived('');
                }}
                className={`py-1.5 text-xs font-black rounded-[8px] transition-all ${paymentMethod === 'QRIS' ? 'bg-[#4D3C2A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
              >
                QRIS
              </button>
            </div>
          </div>

          {paymentMethod === 'CASH' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Uang Diterima (Rp)</label>
                <input 
                  type="number" 
                  placeholder="Masukkan nominal..."
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[10px] text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4D3C2A] transition-colors"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {quickCashOptions.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setCashReceived(amount)}
                    className={`py-1 border text-[10px] font-black rounded-[10px] transition-all ${cashReceived === amount ? 'border-[#4D3C2A] bg-[#4D3C2A]/5 text-[#4D3C2A]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    {amount / 1000}k
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-xs pt-1.5 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="font-black text-slate-400 text-[10px]">TOTAL ITEMS</span>
              <span className="font-black text-slate-800">{totalItems} Gelas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-black text-slate-800">TOTAL BAYAR</span>
              <span className="font-black text-lg text-[#4D3C2A]">Rp {totalBill.toLocaleString()}</span>
            </div>

            {paymentMethod === 'CASH' && (
              <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
                <span className="font-black text-slate-400 text-[10px] uppercase">Kembalian</span>
                <span className={`font-black text-sm ${changeAmount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                  Rp {changeAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 pt-0.5">
            <button 
              type="button"
              onClick={resetPaymentAndCart}
              className="w-1/4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[16px] font-black text-xs transition-all active:scale-95 uppercase tracking-wider text-center"
            >
              Batal
            </button>
            
            <button 
              type="button"
              onClick={handleConfirmPayment}
              className="flex-1 py-3 bg-[#4D3C2A] text-white rounded-[16px] font-black text-xs shadow-lg shadow-[#4D3C2A]/10 hover:bg-[#4D3C2A]/90 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none uppercase tracking-widest" 
              disabled={!isPaymentValid()}
            >
              Konfirmasi Pesanan
            </button>
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
              {hasMultipleSizes(selectedProduct) && (
                <section>
                  <label className="block font-black text-slate-400 text-[9px] mb-3 uppercase tracking-widest">Ukuran Gelas</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Small", "Big"].map((size) => (
                      <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 rounded-xl font-black text-xs border-2 transition-all ${selectedSize === size ? 'border-[#4D3C2A] bg-[#4D3C2A]/5 text-[#4D3C2A]' : 'border-slate-50 text-slate-400 hover:border-slate-100'}`}>{size}</button>
                    ))}
                  </div>
                </section>
              )}

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
              
              <section>
                <label className="block font-black text-slate-400 text-[9px] mb-3 uppercase tracking-widest">Topping Tambahan</label>
                <div className="space-y-2">
                  {toppingsData.map((t) => (
                    <div key={t.name} onClick={() => setSelectedToppings(prev => prev.includes(t.name) ? prev.filter(x => x !== t.name) : [...prev, t.name])} className={`flex justify-between items-center p-3.5 rounded-2xl cursor-pointer border-2 transition-all active:scale-[0.98] ${selectedToppings.includes(t.name) ? 'border-[#4D3C2A] bg-[#4D3C2A]/5' : 'border-slate-50 hover:border-slate-100'}`}>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-700">{t.name}</span>
                        <span className="font-black text-[#4D3C2A] text-[9px]">+ Rp {t.price.toLocaleString()}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedToppings.includes(t.name) ? 'bg-[#4D3C2A] border-[#4D3C2A] text-white' : 'border-slate-100 bg-white'}`}>{selectedToppings.includes(t.name) && <Check size={12} strokeWidth={4} />}</div>
                    </div>
                  ))}
                </div>
              </section>

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
              <button onClick={confirmAddToCart} className="w-full py-4 bg-[#4D3C2A] text-white rounded-2xl font-black shadow-xl shadow-[#4D3C2A]/10 uppercase tracking-widest text-[10px] active:scale-95 transition-all">Simpan & Tambahkan</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TRANSAKSI BERHASIL (STRUK) ================= */}
      {isReceiptModalOpen && completedOrderData && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 flex flex-col max-h-[95vh] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            
            {/* Bagian Atas */}
            <div className="flex flex-col items-center text-center mt-2 flex-none">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-3 animate-bounce">
                <CheckCircle2 size={44} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Transaksi Berhasil</h3>
              <h4 className="text-md font-black text-[#4D3C2A] mt-0.5 tracking-wider uppercase">ZIPTEA</h4>
              <p className="text-[10px] text-slate-400 font-medium mt-1">{completedOrderData.date} • {completedOrderData.receiptNo}</p>
            </div>

            {/* Bagian Tengah */}
            <div className="flex-1 overflow-y-auto my-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3 text-xs scrollbar-hide">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">Rincian Item</div>
              
              {completedOrderData.items.map((item: any, idx: number) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-black text-slate-800">
                    <span className="truncate max-w-[180px]">{item.name} (x{item.quantity})</span>
                    <span>Rp {(item.unitPrice * item.quantity).toLocaleString()}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium pl-1">
                    {item.size} • {item.sugar} Sugar • {item.ice} Ice
                    {item.toppings.length > 0 && ` • Topping: ${item.toppings.join(', ')}`}
                  </div>
                </div>
              ))}

              <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5 font-bold text-slate-600">
                <div className="flex justify-between text-[10px]">
                  <span>Metode Pembayaran</span>
                  <span className="font-black text-slate-800 uppercase">{completedOrderData.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-800 pt-1 border-t border-slate-100">
                  <span className="font-black">Total Tagihan</span>
                  <span className="font-black text-sm text-[#4D3C2A]">Rp {completedOrderData.totalBill.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Uang Diterima</span>
                  <span className="text-slate-800">Rp {completedOrderData.cashReceived.toLocaleString()}</span>
                </div>
                {completedOrderData.paymentMethod === 'CASH' && (
                  <div className="flex justify-between text-[11px] text-green-600">
                    <span>Kembalian</span>
                    <span className="font-black">Rp {completedOrderData.changeAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bagian Bawah (Fungsi WhatsApp & PDF Aktif) */}
            <div className="space-y-2 flex-none mt-2">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 bg-green-50 hover:bg-green-100 text-green-600 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Share2 size={14}/> Share WA
                </button>
                <button 
                  type="button" 
                  onClick={handleDownloadPDF}
                  className="py-2.5 px-3 bg-[#4D3C2A]/10 hover:bg-[#4D3C2A]/20 text-[#4D3C2A] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download size={14}/> Unduh PDF
                </button>
              </div>

              <button 
                type="button" 
                onClick={handleNewTransaction}
                className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-black text-xs rounded-xl shadow-lg shadow-green-500/10 transition-all uppercase tracking-widest active:scale-95 text-center"
              >
                Transaksi Baru
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}