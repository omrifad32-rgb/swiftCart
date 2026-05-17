/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** internal-system-ver: 1.0.1 **/
import { useState, useEffect, useMemo, useRef, ChangeEvent } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, update, remove, get } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  Home, 
  Zap, 
  ShoppingBag, 
  Box, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  ArrowLeft,
  Heart,
  Star,
  ShieldAlert,
  LayoutDashboard,
  Search,
  Trash2,
  Settings,
  CheckCircle2,
  AlertTriangle,
  X,
  Rocket,
  Percent,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Image as ImageIcon,
  Send,
  Crown,
  UserCheck,
  Package,
  Truck,
  Receipt,
  Headset,
  MessageSquare,
  Mail,
  ShieldCheck,
  Lock,
  Phone,
  MapPin,
  Sun,
  Moon,
  Trophy,
  CreditCard,
  Clock,
  Info,
  BadgePercent,
  Flame,
  Layout,
  CheckCircle,
  Circle,
  TruckIcon,
  MessageCircle,
  LogIn,
  Users,
  Sparkles,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  Wallet,
  Menu,
  ExternalLink,
  Link,
  Edit,
  Images,
  Globe,
  ChevronsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, Order, Review, AppSettings, ContactMessage, ProductVariant, ChatMessage, ChatSession, Coupon } from './types';

// Firebase configuration (from user's request)
const firebaseConfig = {
  apiKey: "AIzaSyClINnufUSy3OUJe-bhYmwcbHzpQQKpjLc",
  authDomain: "titan-x-552bd.firebaseapp.com",
  databaseURL: "https://titan-x-552bd-default-rtdb.firebaseio.com",
  projectId: "titan-x-552bd",
  storageBucket: "titan-x-552bd.firebasestorage.app",
  appId: "1:55152198563:web:f94af0549185ef36ac5016"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`Failed to set ${key} in localStorage`, e);
  }
};

export default function App() {
  const [activePage, setActivePage] = useState<'catalog' | 'cart' | 'orders' | 'reviews' | 'admin' | 'support' | 'home' | string>('home');
  const [products, setProducts] = useState<Product[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [contactData, setContactData] = useState({ name: '', contactInfo: '', message: '' });
  const [contactFormStatus, setContactFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  
  // Chat States
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [myChat, setMyChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Record<string, Coupon>>({});
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [admins, setAdmins] = useState<Record<string, boolean>>({});
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sc_cart');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem('sc_cart');
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sc_wishlist');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.removeItem('sc_wishlist');
      return [];
    }
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>(['מגני מסך', 'אביזרים לסמארטפונים', 'טאבלטים', 'שעונים חכמים', 'ציוד הקלטה', 'ציוד גיימינג', 'אביזרי רכב', 'בית חכם', 'כבלים ומתאמים', 'ציוד מגן', 'אביזרים', 'ביגוד', 'הנעלה', 'אלקטרוניקה', 'בית וגן', 'צעצועים', 'ספורט', 'רכב']);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWishlistView, setIsWishlistView] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revText, setRevText] = useState('');
  const [revScore, setRevScore] = useState(5);
  const [revImg, setRevImg] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    title: "SwiftCart",
    sub: "ציוד אקסטרים פרימיום",
    pb: "#",
    terms: "תקנון האתר יוצג כאן...",
    isWarMode: false,
    theme: 'dark',
    shippingCost: 35,
    officeHours: "כל יום עד 22:00",
    ourStory: "הסיפור שלנו מתחיל באהבה לאקסטרים...",
    specialDayEnabled: false,
    specialDayName: "שבוע המכירות הגדול",
    specialDayDescription: "כלל המוצרים בחנות המשתתפים במבצע",
    globalDiscountPercent: 0,
    bitLink: '',
    paypalLink: '',
    payboxLink: '',
    bankTransferPhone: '',
    bitLabel: 'Bit',
    paypalLabel: 'PayPal',
    payboxLabel: 'PayBox',
  });
  const [user, setUser] = useState<string | null>(localStorage.getItem('sc_user'));
  const [userBalance, setUserBalance] = useState(0);
  const [useBalanceInCheckout, setUseBalanceInCheckout] = useState(false);
  const [guestId, setGuestId] = useState<string>(() => {
    const saved = localStorage.getItem('sc_guest_id');
    if (saved) return saved;
    const newId = `guest_${Math.random().toString(36).substring(2, 11)}`;
    safeSetItem('sc_guest_id', newId);
    return newId;
  });
  const [authNote, setAuthNote] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'reg' | 'forgot' | 'verify'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authCodeInput, setAuthCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [showDonationsModal, setShowDonationsModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [confirmPlacement, setConfirmPlacement] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment'>('form');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [localTheme, setLocalTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sc_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Sync localTheme with global settings if no local preference exists
  useEffect(() => {
    const saved = localStorage.getItem('sc_theme');
    if (!saved && settings.theme) {
      setLocalTheme(settings.theme);
    }
  }, [settings.theme]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedCustomOptions, setSelectedCustomOptions] = useState<Record<string, string>>({});
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [tempQty, setTempQty] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Close modals on page change
  useEffect(() => {
    setSelectedProduct(null);
    setShowAuthModal(false);
    setShowCheckoutModal(false);
    setShowTermsModal(false);
    setShowEditProdModal(false);
    setShowAddProdModal(false);
    setOrderToDelete(null);
    setOrderToEdit(null);
    setReviewToDelete(null);
    setEditingRev(null);
  }, [activePage]);

  // Reset tempQty when selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      setTempQty(1);
      setEditingImgIdx(0);
      setSelectedVariant(null);
      setSelectedCustomOptions({});
    }
  }, [selectedProduct]);

  const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', city: '', street: '', terms: false });
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [lastOrderPaymentMethod, setLastOrderPaymentMethod] = useState<string | null>(null);
  const [pendingImg, setPendingImg] = useState<string>('');
  const [gallerySelectorConfig, setGallerySelectorConfig] = useState<{ active: boolean, availableImages: string[], onSelect: (url: string) => void } | null>(null);
  const [newProdData, setNewProdData] = useState({ 
    name: '', 
    price: '', 
    oldPrice: '', 
    costPrice: 0, 
    sourceLink: '',
    category: '', 
    desc: '', 
    img: '', 
    extraImages: [] as string[], 
    stock: -1, 
    shippingCost: 0,
    variants: [] as ProductVariant[],
    variantLabel: 'בחר דגם',
    customOptions: [] as { title: string; choices: string[] }[]
  });
  const [newCatName, setNewCatName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [editingProdIndex, setEditingProdIndex] = useState<number | null>(null);
  const [editProdData, setEditProdData] = useState<Product | null>(null);
  const [showEditProdModal, setShowEditProdModal] = useState(false);
  const [showCustomerManagement, setShowCustomerManagement] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [showMessages, setShowMessages] = useState(false);

  const [editingRev, setEditingRev] = useState<Review | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ message: string, onConfirm: () => void } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [trashedProducts, setTrashedProducts] = useState<Product[]>([]);
  const [trashedOrders, setTrashedOrders] = useState<Order[]>([]);
  const [trashedReviews, setTrashedReviews] = useState<Review[]>([]);

  // Sync theme to body class
  useEffect(() => {
    const accepted = localStorage.getItem('sc_cookies_accepted');
    if (!accepted) {
      setTimeout(() => setShowCookieBanner(true), 2000);
    }
  }, []);
  useEffect(() => {
    if (localTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    
    safeSetItem('sc_theme', localTheme);
    if (user) set(ref(db, `users/${user.replace(/\./g, ',')}/theme`), localTheme);
  }, [localTheme, user]);

  // Body scroll lock for modals - ensuring content is still scrollable but background is locked
  useEffect(() => {
    const isModalOpen = showAuthModal || !!selectedProduct || showCheckoutModal || showSuccessModal || showAddProdModal || showTermsModal || showEditProdModal;
    if (isModalOpen) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => { 
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [showAuthModal, selectedProduct, showCheckoutModal, showSuccessModal, showAddProdModal, showTermsModal, showEditProdModal]);

  // Sync cart and wishlist to localStorage
  useEffect(() => {
    safeSetItem('sc_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeSetItem('sc_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) safeSetItem('sc_user', user);
    else localStorage.removeItem('sc_user');
  }, [user]);

  // Load data from Firebase
  useEffect(() => {
    const productsRef = ref(db, 'products');
    const settingsRef = ref(db, 'settings');
    const couponsRef = ref(db, 'coupons');
    const adminsRef = ref(db, 'admins');
    const ordersRef = ref(db, 'orders');
    const reviewsRef = ref(db, 'reviews');
    const categoriesRef = ref(db, 'categories');

    const unsubSettings = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    });

    const unsubCoupons = onValue(couponsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setCoupons(data);
    });

    const unsubAdmins = onValue(adminsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setAdmins(data);
    });

    const unsubCategories = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        setCategories(['מגני מסך', 'אביזרים לסמארטפונים', 'טאבלטים', 'שעונים חכמים', 'ציוד הקלטה', 'ציוד גיימינג', 'אביזרי רכב', 'בית חכם', 'כבלים ומתאמים', 'ציוד מגן', 'אביזרים', 'ביגוד', 'הנעלה', 'אלקטרוניקה', 'בית וגן', 'צעצועים', 'ספורט', 'רכב']);
      }
    });

    const unsubOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...(val as Order), id }));
        setOrders(list.reverse());
      } else {
        setOrders([]);
      }
    });

    const unsubReviews = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...(val as Review), id })).reverse();
        setReviews(list);
      } else {
        setReviews([]);
      }
    });

    const unsubUsers = onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]) => ({ ...(val as any), emailKey: key }));
        setAllUsers(list);
      } else {
        setAllUsers([]);
      }
    });

    const unsubMessages = onValue(ref(db, 'messages'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...(val as ContactMessage), id }));
        setMessages(list.sort((a, b) => b.time - a.time));
      } else {
        setMessages([]);
      }
    });

    const unsubscribeProds = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let productsList = (Array.isArray(data) ? data : Object.values(data)).filter(Boolean);
        
        setProducts(productsList as Product[]);
      } else {
        setProducts([
          {
            id: 'prod_custom_1',
            name: 'מוצר מעוצב אישית',
            price: 150,
            oldPrice: 199,
            category: 'אביזרים',
            img: 'https://plus.unsplash.com/premium_photo-1675896041697-d86bca70dfec?w=400&h=400&auto=format&fit=crop',
            desc: 'מוצר איכותי במיוחד שניתן להתאים בדיוק לסטייל ולצורך שלכם – גם בצבע, וגם בחומר ממנו עשוי! בחרו מה שאתם רוצים.',
            stock: 100,
            inS: true,
            customOptions: [
              { title: 'צבע', choices: ['שחור', 'לבן', 'כחול עמוק', 'אדום'] },
              { title: 'חומר', choices: ['עור', 'סיליקון', 'פלסטיק קשיח', 'בד קטיפה'] }
            ]
          },
          { 
            id: '1', 
            name: 'קסדת רכיבה Elite V1', 
            price: 299, 
            oldPrice: 399,
            img: 'https://images.unsplash.com/photo-1599812411603-75a7fcd08761?w=400&h=400&auto=format&fit=crop', 
            category: 'ציוד מגן',
            desc: 'קסדת עילית מגן מסיבי\nחומר: סיבי פחמן\nמשקל: 1.2 ק"ג\nאוורור: 12 פתחי ניקוז'
          },
          { 
            id: '2', 
            name: 'מגן מסך וגוף לאייפון 17', 
            price: 120, 
            oldPrice: 180,
            img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&auto=format&fit=crop', 
            category: 'אביזרים',
            variantLabel: 'בחר דגם אייפון 17',
            variants: [
              { id: 'v1', name: 'אייפון 17 סטנדרטי' },
              { id: 'v2', name: 'אייפון 17 פרו' },
              { id: 'v3', name: 'אייפון 17 פרו מקס', price: 140 },
              { id: 'v4', name: 'אייפון 17 פלוס' }
            ],
            desc: 'הגנה מקסימלית למכשיר החדש ביותר\nעמידות בנפילות: עד 3 מטרים\nציפוי אולאופובי: דוחה טביעות אצבע\nשקיפות: 100% קריסטל קליר'
          },
          { 
            id: '3', 
            name: 'מעיל רכיבה Stealth', 
            price: 450, 
            oldPrice: 550,
            img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&auto=format&fit=crop', 
            category: 'ביגוד',
            desc: 'מעיל רכיבה עמיד במים וברוח\nהגנות בכתפיים ובמרפקים\nבד נושם ואיכותי'
          },
          { 
            id: '4', 
            name: 'אוזניות Air Pods Pro Ultra', 
            price: 990, 
            oldPrice: 1200,
            img: 'https://images.unsplash.com/photo-1588423770574-91021160dfbb?w=400&h=400&auto=format&fit=crop', 
            category: 'אלקטרוניקה',
            desc: 'ביטול רעשים אקטיבי\nאיכות סאונד מדהימה\nחיי סוללה ארוכים'
          },
          {
            id: '5',
            name: 'נעלי ספורט מקצועיות',
            price: 350,
            oldPrice: 490,
            img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&auto=format&fit=crop',
            category: 'הנעלה',
            desc: 'סוליית גומי עמידה\nתמיכה מקסימלית לכף הרגל\nמתאים לריצה ואימונים'
          },
          {
            id: '6',
            name: 'שעון חכם Nitro X',
            price: 750,
            oldPrice: 950,
            img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&auto=format&fit=crop',
            category: 'אלקטרוניקה',
            desc: 'ניטור דופק ושינה\nעמיד במים בתקן IP68\nמסך אמולד חד'
          }
        ]);
      }
      
      setTimeout(() => {
        setIsLoaded(true);
        setTimeout(() => setShowSplash(false), 1000);
      }, 500);
    });

    let unsubTrashProd: any, unsubTrashOrd: any, unsubTrashRev: any, unsubChatSessions: any, unsubUser: any, unsubMyChats: any;

    if (user) {
      const userRef = ref(db, `users/${user.replace(/\./g, ',')}`);
      unsubUser = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          if (data.cart) setCart((Array.isArray(data.cart) ? data.cart : Object.values(data.cart)).filter(Boolean));
          if (data.wishlist) setWishlist((Array.isArray(data.wishlist) ? data.wishlist : Object.values(data.wishlist)).filter(Boolean));
          if (data.theme) setLocalTheme(data.theme);
          if (data.balance) setUserBalance(data.balance);
          else setUserBalance(0);
        }
      });
      
      const myChatsRef = ref(db, `chats/${user.replace(/\./g, ',')}/messages`);
      unsubMyChats = onValue(myChatsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
           const list = Object.entries(data).map(([id, val]) => ({ ...(val as any), id }));
           setMyChat(list.sort((a, b) => a.timestamp - b.timestamp));
        } else {
           setMyChat([]);
        }
      });
    }

    // For Admin: Listen to all chat sessions
    unsubChatSessions = onValue(ref(db, 'chats'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
           userKey: key,
           email: val.email || key.replace(/,/g, '.'),
           lastUpdate: val.lastUpdate || 0,
           unreadByAdmin: !!val.unreadByAdmin,
           unreadByUser: !!val.unreadByUser,
           messages: val.messages || {}
        }));
        setChatSessions(list.sort((a, b) => b.lastUpdate - a.lastUpdate));
      } else {
        setChatSessions([]);
      }
    });

    unsubTrashProd = onValue(ref(db, 'trash/products'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...(val as Product), id }));
        setTrashedProducts(list);
      } else {
        setTrashedProducts([]);
      }
    });

    unsubTrashOrd = onValue(ref(db, 'trash/orders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...(val as Order), id }));
        setTrashedOrders(list);
      } else {
        setTrashedOrders([]);
      }
    });

    unsubTrashRev = onValue(ref(db, 'trash/reviews'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ ...(val as Review), id })).reverse();
        setTrashedReviews(list);
      } else {
        setTrashedReviews([]);
      }
    });

    return () => {
       unsubscribeProds();
       unsubSettings();
       unsubCoupons();
       unsubAdmins();
       unsubCategories();
       unsubOrders();
       unsubReviews();
       unsubUsers();
       unsubMessages();
       if (unsubChatSessions) unsubChatSessions();
       if (unsubTrashProd) unsubTrashProd();
       if (unsubTrashOrd) unsubTrashOrd();
       if (unsubTrashRev) unsubTrashRev();
       if (unsubUser) unsubUser();
       if (unsubMyChats) unsubMyChats();
    };
  }, [user]);

  const categoriesList = useMemo(() => {
    return ['all', ...Array.from(new Set(categories))];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      const matchWish = isWishlistView ? wishlist.includes(p.id) : true;
      return matchCat && matchSearch && matchWish;
    });
  }, [products, activeCategory, searchQuery, isWishlistView, wishlist]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart]);
  const cartTotal = useMemo(() => {
    const raw = cart.reduce((acc, item) => {
      const price = Number(item.selectedVariant?.price ?? item.price);
      return acc + (isNaN(price) ? 0 : price) * item.qty;
    }, 0);
    const globalDisc = settings.specialDayEnabled ? (settings.globalDiscountPercent || 0) : 0;
    const totalDisc = globalDisc;
    let discounted = Math.max(0, raw * (1 - totalDisc / 100));
    
    if (appliedCoupon && appliedCoupon.active) {
       if (!appliedCoupon.minAmount || raw >= appliedCoupon.minAmount) {
          if (appliedCoupon.type === 'percent') {
             discounted = discounted * (1 - appliedCoupon.value / 100);
          } else {
             discounted = Math.max(0, discounted - appliedCoupon.value);
          }
       }
    }
    
    discounted = Math.round(discounted);
    
    if (useBalanceInCheckout && userBalance > 0) {
      return Math.max(0, discounted - userBalance);
    }
    return discounted;
  }, [cart, settings.specialDayEnabled, settings.globalDiscountPercent, useBalanceInCheckout, userBalance, appliedCoupon]);

  const currentShippingCost = useMemo(() => {
    if (cart.length === 0) return 0;
    if (settings.freeShippingThreshold && cartTotal >= settings.freeShippingThreshold) return 0;
    
    // Calculate shipping per item: use item specific if exists, else global default
    const shippingPrices = cart.map(item => item.shippingCost !== undefined ? item.shippingCost : (settings.shippingCost || 0));
    return Math.max(...shippingPrices);
  }, [cart, cartTotal, settings.shippingCost, settings.freeShippingThreshold]);

  const totalNetProfit = useMemo(() => {
    return orders.reduce((total, order) => {
      return total + (order.profit || order.total);
    }, 0);
  }, [orders]);

  useEffect(() => {
    if (user) {
      const mailKey = user.replace(/\./g, ',');
      const isListedAdmin = !!admins[mailKey];
      const isMaster = user === 'omrifad32@gmail.com';
      setIsAdmin(isListedAdmin || isMaster);
      setIsOwner(isMaster);
    } else {
      setIsAdmin(false);
      setIsOwner(false);
    }
  }, [user, admins]);

  const currentUserId = user || guestId;

  // Sync isBanned status
  useEffect(() => {
    if (user) {
      const mailKey = user.replace(/\./g, ',');
      const userRef = ref(db, `users/${mailKey}`);
      const unsub = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.isBanned) {
          setIsBanned(true);
        } else {
          setIsBanned(false);
        }
      });
      return () => unsub();
    } else {
      setIsBanned(false);
    }
  }, [user]);

  const getCartId = (item: CartItem): string => {
    const optsKeys = Object.keys(item.selectedOptions || {}).sort();
    const optsStr = optsKeys.map(k => `${k}:${item.selectedOptions![k]}`).join('|');
    return `${item.id}_${item.selectedVariant ? item.selectedVariant.id : 'base'}_${optsStr}`;
  };

  const addToCart = (product: Product, qty: number = 1, variant?: ProductVariant | null, optionsObj?: Record<string, string>) => {
    if (!product) return;
    
    const hasVariants = product.variants && Object.keys(product.variants).length > 0;
    const hasCustomOptions = product.customOptions && product.customOptions.length > 0;

    let itemVariant = variant || selectedVariant;
    let itemOpts = optionsObj || selectedCustomOptions;

    // Reset stale state properties if the product doesn't actually have variants
    if (!hasVariants) itemVariant = null;
    if (!hasCustomOptions) itemOpts = {};
    
    // If product has variants but none selected, require one
    if (hasVariants && !itemVariant) {
      setAlertMessage("נא לבחור " + (product.variantLabel || "אופציה"));
      return;
    }

    if (hasCustomOptions) {
      const missing = product.customOptions!.find(opt => !itemOpts[opt.title]);
      if (missing) {
        setAlertMessage(`נא לבחור ${missing.title}`);
        return;
      }
    }

    const newCartItem: CartItem = { ...product, qty: 1, selectedVariant: itemVariant || undefined, selectedOptions: Object.keys(itemOpts).length > 0 ? itemOpts : undefined };
    const cartId = getCartId(newCartItem);

    const currentStock = product.stock !== undefined ? product.stock : (product.inS === 'false' ? 0 : -1);
    
    setCart(prev => {
      const existing = prev.find(item => getCartId(item) === cartId);
      let newCart;
      
      if (existing) {
        const totalQty = existing.qty + qty;
        if (currentStock !== -1 && totalQty > currentStock) {
          setAlertMessage(`מצטערים, נשארו רק ${currentStock} יחידות במלאי`);
          return prev;
        }
        newCart = prev.map(item => {
          return getCartId(item) === cartId ? { ...item, qty: totalQty } : item;
        });
      } else {
        if (currentStock !== -1 && qty > currentStock) {
          setAlertMessage(`מצטערים, נשארו רק ${currentStock} יחידות במלאי`);
          return prev;
        }
        newCart = [...prev, { ...newCartItem, qty }];
      }
      
      if (user) set(ref(db, `users/${user.replace(/\./g, ',')}/cart`), JSON.parse(JSON.stringify(newCart)));
      safeSetItem('sc_cart', JSON.stringify(newCart));
      return newCart;
    });
    
    const sortedOptsKeys = Object.keys(itemOpts).sort();
    const optsLabels = sortedOptsKeys.length > 0 ? ` (${sortedOptsKeys.map(k => itemOpts[k]).join(', ')})` : '';
    setAlertMessage(`התווסף לסל כמות: ${qty} - ${product.name}${itemVariant ? ` (${itemVariant.name})` : ''}${optsLabels}`);
    setSelectedProduct(null);
  };

  const toggleWishlist = (id: string) => {
    if (!user) {
      setAuthNote('כדי לשמור מוצרים ברשימת המשאלות, עליך להתחבר למערכת.');
      setShowAuthModal(true);
      return;
    }
    setWishlist(prev => {
      const newList = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      if (user) set(ref(db, `users/${user.replace(/\./g, ',')}/wishlist`), newList);
      return newList;
    });
  };

  const updateQty = (cartId: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => getCartId(i) === cartId);
      if (!item) return prev;
      
      const currentStock = item.stock !== undefined ? item.stock : (item.inS === 'false' ? 0 : -1);
      const newQty = item.qty + delta;
      
      if (delta > 0 && currentStock !== -1 && newQty > currentStock) {
        setAlertMessage(`מצטערים, אין יותר יחידות במלאי`);
        return prev;
      }

      const newCart = prev.map(i => {
        if (getCartId(i) === cartId) {
          return newQty > 0 ? { ...i, qty: newQty } : null;
        }
        return i;
      }).filter((i): i is CartItem => i !== null);
      
      if (user) set(ref(db, `users/${user.replace(/\./g, ',')}/cart`), JSON.parse(JSON.stringify(newCart)));
      safeSetItem('sc_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeItem = (cartId: string) => {
    setCart(prev => {
      const newCart = prev.filter(i => getCartId(i) !== cartId);
      if (user) set(ref(db, `users/${user.replace(/\./g, ',')}/cart`), JSON.parse(JSON.stringify(newCart)));
      safeSetItem('sc_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleAuth = () => {
    const email = authEmail.toLowerCase().trim();
    if (!email) return;

    if (authMode === 'forgot') {
      const mailKey = email.replace(/\./g, ',');
      
      const triggerReset = () => {
        sendPasswordResetEmail(auth, email)
          .then(() => {
            setAuthNote(`הוראות לאיפוס הסיסמה נשלחו לכתובת הדוא״ל ${email}. במידה ואינך רואה את ההודעה, אנא בדוק גם בתיקיית דואר הזבל (ספאם).`);
            setTimeout(() => {
              setAuthMode('login');
              setAuthNote(null);
            }, 6000);
          })
          .catch((error: any) => {
            if (error.code === 'auth/user-not-found') {
              setAuthNote("האימייל לא נמצא במערכת");
            } else if (error.code === 'auth/invalid-email') {
              setAuthNote("כתובת האימייל אינה תקינה.");
            } else if (error.code === 'auth/configuration-not-found') {
              setAuthNote("שגיאת הגדרות: עליך להיכנס למסוף Firebase, לעבור אל 'Authentication', ללחוץ על 'Get Started' ולהפעיל את 'Email/Password'.");
            } else {
              setAuthNote("המשתמש לא נמצא במערכת או שחלה שגיאה.");
            }
          });
      };

      // Check if user exists in legacy DB first to migrate them if needed
      get(ref(db, `users/${mailKey}`)).then((snapshot) => {
        const pass = (snapshot.exists() && snapshot.val().password) ? snapshot.val().password : Math.random().toString(36).slice(-10) + 'Aa1#';
        
        // Attempt creation just to be absolutely sure they exist in Firebase Auth so the email actually sends!
        createUserWithEmailAndPassword(auth, email, pass).then(() => {
          if (!snapshot.exists()) {
            set(ref(db, `users/${mailKey}`), { email, password: pass, lastActive: Date.now() });
          }
          triggerReset();
        }).catch(() => {
          // Already migrated or error - send reset anyway
          triggerReset();
        });
      }).catch(() => {
        triggerReset();
      });
      return;
    }

    const pass = authPass;
    if (pass.length < 6) return;

    if (authMode === 'login') {
      if (email === 'omrifad32@gmail.com' && pass === 'omrifad3232@@') {
        setUser(email);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPass('');
        setAuthNote(null);
        return;
      }
      signInWithEmailAndPassword(auth, email, pass)
        .then((userCredential) => {
          const mailKey = email.replace(/\./g, ',');
          const userRef = ref(db, `users/${mailKey}`);
          update(userRef, { lastActive: Date.now() });
          
          setUser(email);
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPass('');
          setAuthNote(null);
        })
        .catch((error: any) => {
          let msg = 'שגיאה כללית בהתחברות. אנא נסה שנית.'; // Fallback error
          if (error.code === 'auth/user-not-found') msg = 'האימייל לא נמצא במערכת';
          if (error.code === 'auth/wrong-password') msg = 'סיסמה שגויה';
          if (error.code === 'auth/invalid-credential') msg = 'פרטי התחברות שגויים';
          if (error.code === 'auth/configuration-not-found') msg = "שגיאת הגדרות: עליך להפעיל Email/Password במסוף Firebase (תחת Authentication).";
          if (error.code === 'auth/network-request-failed') msg = 'שגיאת רשת: אנא ודא שחוסם הפרסומות כבוי או שיש חיבור יציב.';
          
          // Fallback check for old DB users seamlessly logging in!
          const mailKey = email.replace(/\./g, ',');
          const userRef = ref(db, `users/${mailKey}`);
          get(userRef).then((snapshot) => {
            const val = snapshot.val();
            if (val && val.password === pass) {
              // Legacy login path!!
              setUser(email);
              setShowAuthModal(false);
              setAuthEmail('');
              setAuthPass('');
              setAuthNote(null);
              // Migrate in background
              createUserWithEmailAndPassword(auth, email, pass).catch(() => {});
            } else {
              setAuthNote(msg);
            }
          });
        });
    } else if (authMode === 'reg') {
      createUserWithEmailAndPassword(auth, email, pass)
        .then((userCredential) => {
          const mailKey = email.replace(/\./g, ',');
          const userRef = ref(db, `users/${mailKey}`);
          set(userRef, { email, password: pass, lastActive: Date.now() });
          
          setUser(email);
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPass('');
          setAuthNote(null);
          
          push(ref(db, `chats/${mailKey}`), {
            id: Date.now(),
            sender: 'admin',
            text: 'ברוך הבא! כיצד נוכל לעזור לך היום?',
            time: Date.now(),
            isAdmin: true
          });
        })
        .catch((error: any) => {
          let msg = 'שגיאה כללית בהרשמה. אנא נסה שנית.'; // Fallback error
          if (error.code === 'auth/email-already-in-use') msg = 'כתובת האימייל כבר בשימוש';
          if (error.code === 'auth/weak-password') msg = 'הסיסמה חלשה מדי';
          if (error.code === 'auth/configuration-not-found') msg = "שגיאת הגדרות: עליך להפעיל Email/Password במסוף Firebase (תחת Authentication).";
          if (error.code === 'auth/network-request-failed') msg = 'שגיאת רשת: אנא ודא שחוסם הפרסומות כבוי או שיש חיבור יציב.';
          
          const mailKey = email.replace(/\./g, ',');
          get(ref(db, `users/${mailKey}`)).then((snapshot) => {
             if (!snapshot.exists()) {
                if (error.code === 'auth/operation-not-allowed') {
                   // Auth disabled in panel? Fallback to DB!
                   set(ref(db, `users/${mailKey}`), { email, password: pass, lastActive: Date.now() });
                   setUser(email);
                   setShowAuthModal(false);
                   setAuthEmail('');
                   setAuthPass('');
                   setAuthNote(null);
                } else {
                   setAuthNote(msg);
                }
             } else {
                setAuthNote('כתובת האימייל כבר קיימת במערכת.');
             }
          });
        });
    }
  };

  const handleLogout = () => {
    signOut(auth).catch(() => {});
    setUser(null);
    setIsAdmin(false);
    setIsOwner(false);
    setCart([]);
    setWishlist([]);
    setLocalTheme('dark');
    setShowAuthModal(false);
  };

  const handlePlaceOrder = () => {
    if (isPlacingOrder) return;
    
    const nameStr = checkoutData.name ? checkoutData.name.trim() : '';
    const phoneClean = checkoutData.phone ? checkoutData.phone.replace(/[\s-]/g, '') : '';
    
    if (nameStr.length < 2) {
      setCheckoutError('אנא הזן שם מלא תקין (לפחות 2 אותיות)');
      setCheckoutStep('form');
      return;
    }
    if (phoneClean.length < 9 || phoneClean.length > 15 || !/^\d+$/.test(phoneClean)) {
      setCheckoutError('אנא הזן מספר טלפון תקין (רק ספרות, לפחות 9)');
      setCheckoutStep('form');
      return;
    }
    if (!checkoutData.city.trim() || !checkoutData.street.trim()) {
      setCheckoutError('אנא מלא כתובת מלאה (עיר ורחוב)');
      setCheckoutStep('form');
      return;
    }
    if (!checkoutData.terms) {
      setCheckoutError('עליך לאשר את תקנון האתר');
      setCheckoutStep('form');
      return;
    }
    
    setIsPlacingOrder(true);
    setCheckoutError(null);
    const id = 'SC-' + Math.floor(Math.random() * 9000 + 1000);
    const itemsStr = cart.map(x => {
      let opts = [];
      if (x.selectedVariant) opts.push(x.selectedVariant.name);
      if (x.selectedOptions) {
        Object.entries(x.selectedOptions).forEach(([k, v]) => opts.push(`${k}: ${v}`));
      }
      const optsStr = opts.length > 0 ? ` (${opts.join(', ')})` : '';
      return `${x.name}${optsStr} (x${x.qty})`;
    }).join(', ');
    const fullAddress = `${checkoutData.city}, ${checkoutData.street}`;
    
    let totalWithShipping = cartTotal + currentShippingCost;
    
    // Balance usage logic
    const globalDisc = settings.specialDayEnabled ? (settings.globalDiscountPercent || 0) : 0;
    const discountedTotal = Math.round(cart.reduce((acc, item) => acc + (Number(item.selectedVariant?.price ?? item.price) * item.qty), 0) * (1 - globalDisc / 100));
    const amountFromBalance = useBalanceInCheckout ? Math.min(userBalance, discountedTotal) : 0;

    // Calculate net profit: (Sales - Costs)
    const orderProfit = cart.reduce((acc, item) => {
      const price = Number(item.selectedVariant?.price ?? item.price);
      const cost = item.costPrice || price; 
      return acc + (price - cost) * item.qty;
    }, 0) + currentShippingCost;

    const orderData: Order = {
      id,
      user: currentUserId,
      name: checkoutData.name,
      phone: checkoutData.phone,
      address: fullAddress,
      total: totalWithShipping,
      profit: orderProfit,
      email: user || 'אורח',
      status: 'התקבל',
      items: itemsStr,
      itemsRaw: cart,
      time: Date.now(),
      usedBalance: amountFromBalance,
      paymentMethod: selectedPaymentMethod || 'כללי'
    };

    set(ref(db, `orders/${id}`), orderData)
      .then(() => {
         // Deduct balance if used
         if (amountFromBalance > 0 && user) {
          const mailKey = user.replace(/\./g, ',');
          set(ref(db, `users/${mailKey}/balance`), Math.max(0, userBalance - amountFromBalance));
        }
  
        setLastOrderTotal(totalWithShipping);
        setLastOrderId(id);
        setLastOrderPaymentMethod(selectedPaymentMethod);
        if (user) {
          set(ref(db, `users/${user.replace(/\./g, ',')}/cart`), []);
        }
        setCart([]);
        setShowCheckoutModal(false);
        setConfirmPlacement(false);
        setShowSuccessModal(true);
        setUseBalanceInCheckout(false);
        setCheckoutStep('form');
        setSelectedPaymentMethod(null);
      })
      .catch((err) => {
        console.error("Error creating order", err);
        setCheckoutError('אירעה שגיאה בביצוע ההזמנה. אנא נסה שוב.');
      })
      .finally(() => {
        setIsPlacingOrder(false);
      });
  };

  const handleUpdateOrderStatus = (order: Order, newStatus: string) => {
    const orderRef = ref(db, `orders/${order.id}`);
    update(orderRef, { status: newStatus });

    // Cashback Logic: if marked as Delivered, award 5%
    if (newStatus === 'הגיע ליעד' && order.user && order.user !== 'guest') {
      const cashbackPercent = settings.cashbackPercent || 5;
      const earned = Math.round(order.total * (cashbackPercent / 100));
      
      const userRef = ref(db, `users/${order.user.replace(/\./g, ',')}`);
      get(userRef).then(snap => {
        const userData = snap.val();
        const currentBalance = userData?.balance || 0;
        // Check if already earned to avoid duplicates
        if (!order.cashbackEarned) {
          update(userRef, { balance: currentBalance + earned });
          update(orderRef, { cashbackEarned: earned });
        }
      });
    }
  };

  const handlePostReview = (text: string, score: number, id?: string, img?: string) => {
    if (!user) {
      setAuthNote('כדי לכתוב ביקורת על מוצר, עליך להתחבר למערכת.');
      setShowAuthModal(true);
      return;
    }
    if (!text) return;
    if (id) {
      update(ref(db, `reviews/${id}`), {
        t: text,
        s: score,
        img: img || null,
        time: Date.now()
      });
    } else {
      push(ref(db, 'reviews'), {
        u: user.split('@')[0],
        e: user, // Store email to allow editing
        t: text,
        s: score,
        img: img || null,
        time: Date.now()
      });
    }
  };

  const cleanPayload = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(cleanPayload).filter(v => v !== undefined);
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanPayload(v)])
    );
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    
    const coupon = coupons[code];
    if (!coupon || !coupon.active) {
      setCouponError('קופון לא תקין או פג תוקף');
      return;
    }
    
    if (coupon.minAmount) {
       const raw = cart.reduce((acc, item) => {
         const price = Number(item.selectedVariant?.price ?? item.price);
         return acc + (isNaN(price) ? 0 : price) * item.qty;
       }, 0);
       if (raw < coupon.minAmount) {
         setCouponError(`קופון זה תקף רק בקנייה מעל ₪${coupon.minAmount}`);
         return;
       }
    }
    
    setAppliedCoupon(coupon);
    setCouponInput('');
  };

  const handleAddCoupon = (code: string, name: string, type: 'percent' | 'fixed', value: number, minAmount?: number) => {
    if (!code || !value) return;
    set(ref(db, `coupons/${code}`), { id: code, name: name || '', type, value, active: true, minAmount: minAmount || 0 });
  };
  
  const handleToggleCoupon = (code: string, active: boolean) => {
    update(ref(db, `coupons/${code}`), { active });
  };
  
  const handleDeleteCoupon = (code: string) => {
    remove(ref(db, `coupons/${code}`));
  };

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const generateDescription = async (name: string, currentDesc: string, setter: (desc: string) => void) => {
    if (!name) {
      alert('נא להזין שם מוצר קודם');
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, currentDesc })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setter(data.description);
    } catch (err: any) {
      console.error('Error generating description', err);
      alert(err.message || 'שגיאה ביצירת תיאור למוצר');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleAddProduct = () => {
    if (!newProdData.name || !newProdData.price || !newProdData.img) {
       setAlertMessage('אנא מלא שם חובה, מחיר חובה ותמונה ראשית חובה');
       return;
    }
    setConfirmAction({
      message: 'האם אתה בטוח שברצונך להוסיף מוצר זה?',
      onConfirm: () => {
        const id = Date.now().toString();
        const list = [...products];
        list.unshift({ ...newProdData, id });
        set(ref(db, 'products'), cleanPayload(list));
        setShowAddProdModal(false);
        setNewProdData({ 
          name: '', 
          price: '', 
          oldPrice: '', 
          costPrice: 0, 
          category: '', 
          desc: '', 
          img: '', 
          extraImages: [] as string[], 
          stock: -1, 
          shippingCost: 0,
          variants: [] as ProductVariant[],
          variantLabel: 'בחר דגם'
        });
      }
    });
  };

  const handleUpdateProduct = (id: string, data: Partial<Product>) => {
    const list = [...products];
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      set(ref(db, 'products'), cleanPayload(list));
    }
    setShowEditProdModal(false);
    setEditingProdIndex(null);
    setEditProdData(null);
  };

  const [editingImgIdx, setEditingImgIdx] = useState(0);

  const productImages = useMemo(() => {
    if (!selectedProduct) return [];
    // Ensure extraImages is treated as an array
    const extras = Array.isArray(selectedProduct.extraImages) ? selectedProduct.extraImages : [];
    const base = [selectedProduct.img, ...extras].filter(Boolean);
    
    // Add variant image if it exists and isn't already in the list
    if (selectedVariant?.img && !base.includes(selectedVariant.img)) {
      return [selectedVariant.img, ...base];
    }
    return base;
  }, [selectedProduct, selectedVariant]);

  const currentDisplayImg = (productImages && productImages.length > editingImgIdx) 
    ? productImages[editingImgIdx] 
    : (selectedProduct?.img || '');

  const startEditing = (product: Product) => {
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      setEditingProdIndex(index);
      setEditProdData({ ...product });
      setShowEditProdModal(true);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setConfirmAction({
      message: 'האם אתה בטוח שברצונך להעביר מוצר זה לסל המחזור?',
      onConfirm: () => {
        const p = products.find(prod => prod.id === id);
        if (p) {
          set(ref(db, `trash/products/${id}`), cleanPayload(p));
        }
        const list = products.filter((p) => p.id !== id);
        set(ref(db, 'products'), cleanPayload(list));
      }
    });
  };

  const handleAddCategory = () => {
    if (!newCatName || categories.includes(newCatName)) return;
    const newList = [...categories, newCatName];
    set(ref(db, 'categories'), newList);
    setNewCatName('');
  };

  const handleDeleteCategory = (index: number) => {
    const newList = categories.filter((_, i) => i !== index);
    set(ref(db, 'categories'), newList);
  };

  const handleBanUser = (mailKey: string, status: boolean) => {
    update(ref(db, `users/${mailKey}`), { isBanned: status });
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail) return;
    const key = newAdminEmail.replace(/\./g, ',');
    set(ref(db, `admins/${key}`), true);
    setNewAdminEmail('');
  };

  const handleRemoveAdmin = (key: string) => {
    remove(ref(db, `admins/${key}`));
  };

  const handleUploadImage = (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) callback(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
    { id: 'catalog', label: 'חנות', icon: Zap },
    { id: 'reviews', label: 'ביקורות', icon: Star },
    { id: 'cart', label: 'עגלה', icon: ShoppingBag },
    { id: 'orders', label: 'הזמנות', icon: Box },
  ] as const;

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-[#050508] z-[999999] flex flex-col items-center justify-center">
        <motion.div
          animate={{ y: [10, -20, 10], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Rocket className="w-20 h-20 text-pri drop-shadow-[0_15px_30px_rgba(0,240,255,0.4)]" />
        </motion.div>
        <div className="font-display text-5xl uppercase tracking-widest mt-8 animate-pulse" translate="no">
          {settings.title}
        </div>
        <p className="text-gray-500 font-bold tracking-widest mt-4">המערכת עולה לאוויר...</p>
      </div>
    );
  }

  if (isBanned && !isAdmin) {
    return (
      <div className="fixed inset-0 bg-[#050508] z-[99999] flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="w-40 h-40 text-red-500 mb-8 drop-shadow-[0_0_50px_rgba(239,68,68,0.8)]" />
        <h1 className="font-display text-4xl text-red-500 mb-4 tracking-widest leading-tight">חשבונך נחסם</h1>
        <p className="text-gray-300 text-xl font-bold leading-relaxed mb-8">אינך יכול לגשת לאתר זה יותר עקב הפרת תנאי השימוש.</p>
        <button 
          className="btn-main font-bold mt-4 px-8 py-3 w-auto m-auto max-w-[200px]" 
          onClick={handleLogout}
        >
          התנתק מהמערכת
        </button>
      </div>
    );
  }

  if (settings.isWarMode && !isAdmin) {
    return (
      <div className="fixed inset-0 bg-linear-to-br from-[#220000] to-black z-[99999] flex flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="w-40 h-40 text-acc mb-8 drop-shadow-[0_0_50px_rgba(255,0,85,0.8)]" />
        <h1 className="font-display text-6xl text-acc mb-4 drop-shadow-[0_0_20px_rgba(255,0,85,0.5)]">האתר סגור זמנית</h1>
        <p className="text-gray-300 text-2xl font-bold leading-relaxed">עקב המצב, הפעילות הופסקה.<br />נשוב בקרוב.</p>
        <div 
          onClick={() => setShowAuthModal(true)}
          className="mt-12 text-gray-600 cursor-pointer text-xl border-b border-dashed border-gray-600 pb-1"
        >
          <Lock className="inline w-5 h-5 ml-2" /> כניסת מנהלים
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[calc(100px+env(safe-area-inset-bottom))] pt-24" dir="rtl">
      <header className="glass-header">
        <div 
          translate="no"
          className="font-display text-3xl font-black tracking-wider cursor-pointer"
          onClick={() => {
             setActivePage('home');
             window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {settings.title}
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="w-8 h-8 shrink-0 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
              title="שנה שפה / Change Language"
            >
              <Globe className="w-4 h-4 text-white" />
            </button>
            
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[140px] z-50 flex flex-col backdrop-blur-2xl"
                >
                  {[
                    { code: 'iw', label: 'עברית' },
                    { code: 'en', label: 'English' },
                    { code: 'ru', label: 'Русский' },
                    { code: 'ar', label: 'العربية' },
                    { code: 'fr', label: 'Français' },
                    { code: 'es', label: 'Español' },
                    { code: 'de', label: 'Deutsch' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      className="px-4 py-2 text-xs text-center hover:bg-white/10 transition-all text-white font-bold border-b border-white/5 last:border-0"
                      onClick={() => {
                        if (lang.code === 'iw') {
                          // Clear google translate cookies completely to restore original language
                          const cookies = document.cookie.split(";");
                          for (let i = 0; i < cookies.length; i++) {
                            const cookie = cookies[i];
                            let eqPos = cookie.indexOf("=");
                            let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                            if (name.trim() === "googtrans") {
                              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                            }
                          }
                          
                          // Trick Google Translate into restoring original language
                          const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                          if (select) {
                            let iwOpt = Array.from(select.options).find(opt => opt.value === 'iw');
                            if (!iwOpt) {
                              iwOpt = document.createElement('option');
                              iwOpt.value = 'iw';
                              select.appendChild(iwOpt);
                            }
                            select.value = 'iw';
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                          }
                          
                          // Also try the iframe restore button just in case
                          try {
                            const iframe = document.querySelector('iframe.goog-te-banner-frame') as HTMLIFrameElement;
                            if (iframe) {
                              const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
                              if (innerDoc) {
                                const restoreBtn = innerDoc.querySelector('button[id*="restore"]') || innerDoc.querySelector('button');
                                if (restoreBtn) (restoreBtn as HTMLElement).click();
                              }
                            }
                          } catch (e) {}

                          document.body.classList.remove('translated-ltr', 'translated-rtl');
                          document.documentElement.lang = 'iw';
                        } else {
                          const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
                          if (select) {
                            select.value = lang.code;
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                          }
                        }
                        setLangMenuOpen(false);
                      }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setLocalTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 shrink-0 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
          >
            {localTheme === 'dark' ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-pri" />}
          </button>
          <div 
            className="user-status flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
            onClick={() => {
              setAuthNote(null);
              setShowAuthModal(true);
            }}
          >
            <User className={`w-4 h-4 ${user ? 'text-green-400' : 'text-pri'}`} />
            <span translate="no" className="text-xs font-bold text-white hidden sm:inline">
              {user ? user.split('@')[0] : <span translate="yes">התחברות</span>}
            </span>
          </div>

          <div 
            className="relative cursor-pointer group"
            onClick={() => setActivePage('cart')}
          >
            <ShoppingCart className="w-6 h-6 group-hover:text-pri transition-colors" />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-acc text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#12121A] md:w-5 md:h-5 md:text-[10px]"
              >
                {cartCount}
              </motion.span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-40 md:pb-24">
        {settings.specialDayEnabled && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-8"
          >
            <div className="bg-linear-to-r from-gold via-acc to-gold p-4 rounded-3xl text-center shadow-[0_0_30px_rgba(252,238,10,0.4)] animate-pulse relative overflow-hidden">
              <div className="flex flex-col items-center justify-center gap-2 relative z-10">
                <div className="flex items-center justify-center gap-6">
                  <Flame className="w-8 h-8 text-white hidden md:block" />
                  <h2 className="text-xl md:text-3xl font-display font-black text-white uppercase tracking-tighter">
                    {settings.specialDayName} 🔥 {settings.globalDiscountPercent}% הנחה!
                  </h2>
                  <Flame className="w-8 h-8 text-white hidden md:block" />
                </div>
                {settings.specialDayDescription && (
                  <p className="text-white text-lg font-bold">{settings.specialDayDescription}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        <AnimatePresence mode="wait">
          {activePage === 'support' && (
            <motion.section
              key="support"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 pb-40 md:pb-12"
            >
              <h2 className="sec-title flex items-center justify-center gap-4">
                <Headset className="w-12 h-12" /> שירות לקוחות
              </h2>
              <div className="max-w-4xl mx-auto">
                <div className="bg-glass p-12 rounded-[50px] border border-white/10 shadow-2xl text-center space-y-8">
                  <div className="w-32 h-32 bg-pri/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                    <Headset className="w-20 h-20 text-pri" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-display font-black mb-4">איך נוכל לעזור לכם?</h3>
                    <p className="text-gray-400 text-xl font-bold italic">הצוות שלנו זמין עבורכם לכל שאלה, תקלה או בירור לגבי הזמנה קיימת.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] flex flex-col items-center justify-center outline outline-1 outline-white/5">
                      <Clock className="w-12 h-12 text-acc mx-auto mb-4" />
                      <h4 className="text-2xl font-black mb-2">שעות פעילות</h4>
                      <div className="text-sm text-gray-500 font-bold leading-relaxed whitespace-pre-line">
                        {settings.officeHours || 'א-ה: 09:00 - 18:00\nו: 09:00 - 13:00'}
                      </div>
                    </div>
                    <div className="bg-pri/5 border border-pri/20 p-8 rounded-[40px] flex flex-col w-full h-[500px] col-span-1 md:col-span-2 relative">
                      {!user ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                           <MessageSquare className="w-16 h-16 text-pri mb-6 opacity-30" />
                           <h4 className="text-3xl font-black mb-4">צ'אט תמיכה לייב</h4>
                           <p className="text-gray-400 font-bold mb-8">התחברו לחשבון כדי לשוחח עם נציג שלנו.</p>
                           <button onClick={() => setShowAuthModal(true)} className="btn-main py-4 px-10 text-xl">התחברות לצ'אט</button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-grow overflow-y-auto mb-4 pr-2 custom-scrollbar space-y-4 text-right flex flex-col">
                             {myChat.length === 0 ? (
                               <div className="m-auto text-gray-500 font-bold text-center">אין הודעות. שלחו אלינו הודעה...</div>
                             ) : (
                               myChat.map(msg => (
                                 <div key={msg.id} className={`max-w-[80%] p-4 rounded-3xl ${msg.sender === 'user' ? 'bg-pri/20 text-white self-start rounded-tr-sm border border-pri/30' : 'bg-white/10 text-white self-end rounded-tl-sm border border-white/20'}`}>
                                   <div className="text-[10px] text-gray-400 mb-1 font-bold tracking-wider">{msg.sender === 'user' ? 'אני' : 'נציג תמיכה'} - {new Date(msg.timestamp).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</div>
                                   {msg.img && <img src={msg.img} alt="attachment" className="rounded-xl mb-2 max-w-full max-h-48 object-cover" />}
                                   {msg.text && <div className="font-bold text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>}
                                 </div>
                               ))
                             )}
                          </div>
                          <div className="flex gap-2 items-end shrink-0 relative mt-auto border-t border-white/10 pt-4">
                             <label className="cursor-pointer bg-black/40 hover:bg-black/60 p-4 rounded-2xl border border-white/10 transition-all text-gray-400 hover:text-white shrink-0">
                               <ImageIcon className="w-6 h-6" />
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, (url) => {
                                   const msgId = Date.now().toString();
                                   const newMsg: ChatMessage = { id: msgId, sender: 'user', text: '', img: url, timestamp: Date.now() };
                                   const chatRef = ref(db, `chats/${user.replace(/\./g, ',')}`);
                                   update(chatRef, { lastUpdate: Date.now(), unreadByAdmin: true, email: user });
                                   set(ref(db, `chats/${user.replace(/\./g, ',')}/messages/${msgId}`), newMsg);
                               })} />
                             </label>
                             <textarea 
                               placeholder="הקלד הודעה..." 
                               className="flex-grow bg-black/40 border-white/10 rounded-2xl p-4 text-white h-14 resize-none outline-none focus:border-pri/50"
                               value={chatInput}
                               onChange={(e) => setChatInput(e.target.value)}
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter' && !e.shiftKey) {
                                   e.preventDefault();
                                   if (!chatInput.trim()) return;
                                   const msgId = Date.now().toString();
                                   const newMsg: ChatMessage = { id: msgId, sender: 'user', text: chatInput.trim(), timestamp: Date.now() };
                                   const chatRef = ref(db, `chats/${user.replace(/\./g, ',')}`);
                                   update(chatRef, { lastUpdate: Date.now(), unreadByAdmin: true, email: user });
                                   set(ref(db, `chats/${user.replace(/\./g, ',')}/messages/${msgId}`), newMsg);
                                   setChatInput('');
                                 }
                               }}
                             />
                             <button 
                               onClick={() => {
                                 if (!chatInput.trim()) return;
                                 const msgId = Date.now().toString();
                                 const newMsg: import('./types').ChatMessage = { id: msgId, sender: 'user', text: chatInput.trim(), timestamp: Date.now() };
                                 const chatRef = ref(db, `chats/${user.replace(/\./g, ',')}`);
                                 update(chatRef, { lastUpdate: Date.now(), unreadByAdmin: true, email: user });
                                 set(ref(db, `chats/${user.replace(/\./g, ',')}/messages/${msgId}`), newMsg);
                                 setChatInput('');
                               }}
                               className="bg-pri hover:bg-pri/80 text-black p-4 rounded-2xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0"
                             >
                                <ArrowLeft className="w-6 h-6" />
                             </button>
                          </div>
                          {myChat.length > 0 && (() => {
                             // mark as read for user on render (simple approach)
                             // This is a rough place to do it, but okay for our context unless it causes infinite loops. Actually let's avoid DB writes in render.
                             // Instead we'll let it be. Unread badges are mostly for admins anyway.
                             return null;
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {activePage === 'home' && (
            <motion.section
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 pb-40 md:pb-12 space-y-12"
            >
              <div className="text-center pb-8 border-b border-white/10 max-w-4xl mx-auto pt-6 relative inline-block w-full">
                <h1 translate="no" className="font-paint text-6xl md:text-7xl mb-4 tracking-wider px-2 flex justify-center flex-wrap relative z-10 leading-tight" dir="auto">
                  {settings.title.split('').map((char, i) => {
                    const palette = localTheme === 'light' ? [
                      { top: '#000000', side: '#9CA3AF', glow: 'rgba(0,0,0,0.2)' }
                    ] : [
                      { top: '#FFFFFF', side: '#CBD5E1', glow: 'rgba(255,255,255,0.6)' }
                    ];
                    const s = palette[i % palette.length];
                    const text3D = `
                      1px 1px 0px ${s.side},
                      2px 2px 0px ${s.side},
                      3px 3px 0px ${s.side},
                      4px 4px 0px ${s.side},
                      5px 5px 0px ${s.side},
                      6px 6px 0px ${s.side},
                      7px 7px 10px rgba(0,0,0,0.8),
                      0px 0px 20px ${s.glow}
                    `;
                    return (
                      <motion.span
                        key={i}
                        className="inline-block relative cursor-default"
                        initial={{ y: 0, rotate: i % 2 === 0 ? -2 : 2 }}
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                        whileHover={{ scale: 1.05, rotate: Math.random() * 10 - 5, y: -5, transition: { duration: 0.2 } }}
                        style={{ 
                          color: localTheme === 'light' ? '#202124' : '#ffffff',
                          textShadow: text3D,
                          WebkitTextStroke: `1px ${s.top}`,
                          marginInline: char === ' ' ? '1rem' : '0.1rem'
                        }}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </motion.span>
                    );
                  })}
                </h1>
                <p className="text-xl md:text-2xl text-pri font-bold tracking-widest uppercase opacity-80 mt-8 relative z-10">{settings.sub}</p>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={() => setActivePage('catalog')}
                  className="btn-main group flex items-center justify-center gap-4 py-8 px-12 text-3xl !rounded-full shadow-[0_0_50px_rgba(0,240,255,0.3)] hover:scale-105 transition-all duration-500"
                >
                  <span className="font-black tracking-tighter">היכנס לחנות עכשיו</span>
                  <Zap className="w-8 h-8 text-black group-hover:rotate-12 transition-transform" />
                </button>
              </div>

              <div className="mb-8">
                <div className="bg-glass p-8 md:p-16 rounded-[40px] border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pri/5 blur-[100px] rounded-full" />
                  <div className="relative z-10 text-right">
                    <div className="flex items-center justify-end gap-4 mb-8">
                      <h2 className="text-4xl md:text-6xl font-display font-black text-white">הסיפור שלנו</h2>
                      <Info className="w-8 h-8 md:w-12 md:h-12 text-pri" />
                    </div>

                    {settings.aboutImagesPosition === 'top' && settings.aboutImages && settings.aboutImages.length > 0 && !(settings.ourStory || "").includes("[תמונה") && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {settings.aboutImages.map((img, i) => (
                          <div key={i} className="rounded-3xl overflow-hidden aspect-video bg-black/40 border border-white/5">
                            <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-gray-400 text-xl md:text-3xl leading-relaxed font-bold whitespace-pre-wrap max-w-4xl tracking-wide mr-auto mb-10">
                      {(settings.ourStory || "הסיפור שלנו מתחיל בחלום לספק את הציוד הטוב ביותר...").split(/(\[תמונה \d\])/g).map((part, i) => {
                        const match = part.match(/\[תמונה (\d)\]/);
                        if (match) {
                          const idx = Number(match[1]) - 1;
                          if (settings.aboutImages?.[idx]) {
                             return <div key={i} className="my-8 rounded-3xl overflow-hidden bg-black/40 border border-white/5 w-full aspect-video"><img src={settings.aboutImages[idx]} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" /></div>;
                          }
                          return null;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </div>

                    {(!settings.aboutImagesPosition || settings.aboutImagesPosition === 'bottom') && settings.aboutImages && settings.aboutImages.length > 0 && !(settings.ourStory || "").includes("[תמונה") && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {settings.aboutImages.map((img, i) => (
                          <div key={i} className="rounded-3xl overflow-hidden aspect-video bg-black/40 border border-white/5">
                            <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-24 space-y-12">
                <div className="flex flex-col items-center gap-6 pb-12">
                  <div className="flex items-center gap-4 bg-white/5 py-4 px-8 rounded-full border border-white/10">
                    <Clock className="w-6 h-6 text-pri" />
                    <span className="text-xl font-black text-gray-300">שעות פעילות: {settings.officeHours}</span>
                  </div>
                  <button 
                    className="text-gray-500 font-bold hover:text-pri transition-colors text-lg"
                    onClick={() => setShowTermsModal(true)}
                  >
                    קרא את תקנון ומדיניות האתר
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {activePage === 'catalog' && (
            <motion.section
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 pb-40 md:pb-12"
            >

              <h2 className="sec-title">הקטלוג המלא</h2>

              {/* Visual Category Bar */}
              <div className="flex gap-6 overflow-x-auto pb-8 mb-12 no-scrollbar px-2">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="flex flex-col items-center gap-3 min-w-[100px] group transition-all"
                  >
                    <div className={`w-20 h-20 rounded-full border-2 p-1 transition-all duration-500 overflow-hidden ${activeCategory === cat ? 'border-pri shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'border-white/10 grayscale group-hover:grayscale-0 group-hover:border-pri/40'}`}>
                      <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center relative overflow-hidden">
                        {/* Placeholder or real icon for category */}
                        <img 
                          src={cat === 'all' ? 'https://picsum.photos/seed/all/100/100' : (settings.categoryImages?.[cat] || `https://picsum.photos/seed/${cat}/100/100`)} 
                          alt={cat}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <span className={`text-sm font-black whitespace-nowrap transition-colors ${activeCategory === cat ? 'text-pri' : 'text-gray-500 group-hover:text-white'}`}>
                      {cat === 'all' ? 'כל המוצרים' : cat}
                    </span>
                  </button>
                ))}
              </div>

              {isAdmin && (
                <div className="bg-linear-to-br from-yellow-900/20 to-black p-6 rounded-3xl border border-gold/30 mb-8">
                  <h3 className="text-gold font-display text-2xl mb-4 flex items-center gap-3">
                    <Crown className="w-6 h-6" /> פעולות הנהלה
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      className="btn-save flex-1 py-4 text-xl"
                      onClick={() => setShowAddProdModal(true)}
                    >
                      <Plus className="w-6 h-6" /> הוסף מוצר
                    </button>
                    <div className="flex flex-1 gap-2">
                      <input 
                        placeholder="קטגוריה חדשה..."
                        className="flex-1 bg-black/60 border-gold/20"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                      />
                      <button 
                        className="bg-gold text-black px-6 rounded-2xl font-bold"
                        onClick={handleAddCategory}
                      >
                        הוסף
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex gap-4 mb-6 items-center">
                  <div className="relative flex-grow">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-pri" />
                    <input 
                      type="text" 
                      placeholder="חפש ציוד..." 
                      className="search-bar py-5 pr-16"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setIsWishlistView(!isWishlistView)}
                    className={`p-5 rounded-2xl border-2 transition-all ${isWishlistView ? 'bg-acc border-acc text-white shadow-[0_0_30px_rgba(255,0,85,0.4)]' : 'bg-black/50 border-acc/30 text-acc'}`}
                  >
                    <Heart className={`w-8 h-8 ${isWishlistView ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex justify-between items-center mb-4 px-2">
                  <div className="cat-tabs flex gap-4 overflow-x-auto pb-2 no-scrollbar flex-grow">
                    {categoriesList.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`cat-tab px-8 py-4 rounded-full text-xl ${activeCategory === cat ? 'active' : ''}`}
                      >
                        {cat === 'all' ? 'הכל' : cat}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowDonationsModal(true)}
                    className="flex-shrink-0 mr-4 text-pink-500 font-black text-sm flex items-center gap-2 hover:scale-105 transition-all bg-pink-500/10 py-2 px-4 rounded-full border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.1)]"
                  >
                    <Heart className="w-4 h-4 fill-current" /> תרומה לאתר
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {filteredProducts.map(p => (
                  <motion.div 
                    layout
                    key={p.id} 
                    className={`product-card group cursor-pointer relative overflow-hidden transition-all duration-500`}
                    onClick={() => setSelectedProduct(p)}
                  >
                    <div className="absolute inset-0 bg-radial from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                      className={`absolute top-3 left-3 md:top-6 md:left-6 z-10 p-2 md:p-3 rounded-full bg-black/60 border border-white/10 transition-all hover:scale-110 active:scale-95 ${wishlist.includes(p.id) ? 'text-acc border-acc shadow-[0_0_15px_rgba(255,0,85,0.4)]' : 'text-white'}`}
                    >
                      <Heart className={`w-4 h-4 md:w-6 md:h-6 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
                    </button>
                    
                    {isAdmin && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); startEditing(p); }}
                        className="absolute top-14 left-3 md:top-24 md:left-6 z-30 p-2 md:p-3 rounded-full bg-gold text-black border border-white/10 transition-all hover:scale-110 shadow-[0_0_15px_rgba(252,238,10,0.4)]"
                      >
                        <Settings className="w-4 h-4 md:w-6 md:h-6" />
                      </button>
                    )}

                    {!p.hideAddToCart && (
                      <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if ((p.variants && Object.keys(p.variants).length > 0) || (p.customOptions && p.customOptions.length > 0)) {
                              setSelectedProduct(p);
                            } else {
                              addToCart(p, 1); 
                            }
                          }}
                          className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all active:scale-90 bg-pri hover:bg-pri/80`}
                        >
                          <Plus className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                      </div>
                    )}

                    {p.oldPrice && Number(p.oldPrice) > Number(p.price) && (
                      <div className={`sale-tag`}>-{Math.round(100 - (Number(p.price) / Number(p.oldPrice) * 100))}%</div>
                    )}
                    {(settings.globalDiscountPercent || 0) > 0 && (
                      <div className={`absolute top-4 right-4 z-20 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 bg-linear-to-r from-acc to-gold`}>
                        הנחת {settings.specialDayName || 'אירוע'}!
                      </div>
                    )}
                    {Number(p.oldPrice) > Number(p.price) * 1.5 && (
                      <div className={`absolute top-12 right-4 z-20 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 bg-linear-to-r from-pri to-blue-500`}>
                        OUTLET 🔥
                      </div>
                    )}
                    {(p.stock === 0 || p.inS === 'false') && (
                      <div className="oos-overlay"><div className="oos-text">אזל</div></div>
                    )}
                    {p.stock !== undefined && p.stock > 0 && p.stock <= 5 && (
                      <div className="absolute bottom-4 left-4 z-10 bg-acc/80 text-white text-[10px] font-black px-2 py-1 rounded-lg animate-pulse">נשארו {p.stock} יחידות!</div>
                    )}
                    
                    <div className="img-container aspect-square p-4 md:p-8 flex items-center justify-center bg-radial from-white/5 to-transparent rounded-t-[30px] overflow-hidden">
                      <motion.img 
                        src={p.img} 
                        alt={p.name} 
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all duration-700" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    
                    <div className="p-4 md:p-6 text-right flex-grow flex flex-col relative z-20">
                      <div className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 group-hover:text-pri transition-colors">{p.category}</div>
                      <div className={`font-bold text-sm md:text-2xl mb-2 md:mb-4 leading-tight group-hover:text-white transition-colors line-clamp-2`}>{p.name}</div>
                      <div className="flex items-center gap-2 md:gap-4 mt-auto">
                        <div className={`font-display text-xl md:text-4xl text-gold`}>₪{p.price}</div>
                        {p.oldPrice && <div className="text-gray-600 line-through text-xs md:text-lg font-bold opacity-50">₪{p.oldPrice}</div>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Removed duplicate footer from catalog so it only shows on home page, or perhaps we want it on both. It's okay to keep footer on catalog too, but let's just make it a pad so it looks clean */}
              <div className="mt-24 space-y-12">
              </div>
            </motion.section>
          )}

          {activePage === 'cart' && (
            <motion.section
              key="cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-6"
            >
              <h2 className="sec-title">העגלה שלי</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <ShoppingBag className="w-20 h-20 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold mb-4">הסל שלך ריק</h3>
                  <button 
                    className="btn-main max-w-xs mx-auto"
                    onClick={() => setActivePage('catalog')}
                  >
                    חזור לחנות
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-left">
                    <button 
                      className="text-acc font-bold flex items-center gap-2 mr-auto hover:underline"
                      onClick={() => {
                        setConfirmAction({
                          message: 'לרוקן את כל הסל?',
                          onConfirm: () => {
                            setCart([]);
                            if (user) set(ref(db, `users/${user.replace(/\./g, ',')}/cart`), []);
                          }
                        });
                      }}
                    >
                      <Trash2 className="w-5 h-5" /> נקה סל
                    </button>
                  </div>

                  {cart.map(item => {
                    const cartId = getCartId(item);
                    const displayImg = item.selectedVariant?.img || item.img;
                    const displayPrice = item.selectedVariant?.price ?? item.price;
                    return (
                      <div key={cartId} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-glass p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black/40 rounded-2xl p-3 sm:p-4 flex items-center justify-center border border-white/5">
                          <img src={displayImg} alt={item.name} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow text-center sm:text-right">
                          <div className="font-bold text-lg sm:text-xl mb-1 line-clamp-1">{item.name}</div>
                          {item.selectedVariant && (
                            <div className="text-pri text-xs font-black uppercase tracking-widest mb-1">
                              {item.selectedVariant.name}
                            </div>
                          )}
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <div className="text-gray-400 text-xs mt-1 space-y-1">
                              {Object.entries(item.selectedOptions).map(([k, v]) => (
                                <div key={k}>{k}: <span className="text-white">{v}</span></div>
                              ))}
                            </div>
                          )}
                          <div className="text-gold font-display text-xl sm:text-2xl mt-1">₪{displayPrice}</div>
                        </div>
                        <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5 w-full sm:w-auto justify-center">
                          <button 
                            onClick={() => removeItem(cartId)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-acc/10 text-acc flex items-center justify-center hover:bg-acc/20 active:scale-90 transition-all ml-2"
                            title="הסר מהסל"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQty(cartId, -1)}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
                            >
                              <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <span className="w-8 text-center text-xl sm:text-2xl font-display font-bold">{item.qty}</span>
                            <button 
                              onClick={() => updateQty(cartId, 1)}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-pri/20 text-pri flex items-center justify-center hover:bg-pri/30 active:scale-90 transition-all"
                            >
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-10 border-t border-white/10 mt-10">
                    <div className="bg-linear-to-br from-pri/5 to-black p-8 rounded-[40px] border border-pri/20 shadow-2xl space-y-4">
                      {/* Original Subtotal before discounts */}
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span className="text-gray-400 font-bold">סיכום ביניים:</span>
                        <span className="text-white">₪{cart.reduce((acc, item) => acc + (Number(item.selectedVariant?.price ?? item.price) * item.qty), 0)}</span>
                      </div>
                      
                      {/* Coupon */}
                      <div className="flex flex-col gap-2 pt-2 pb-4 border-b border-white/5">
                        <div className="flex gap-2">
                           <input 
                             type="text" 
                             placeholder="הזן קוד קופון" 
                             className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-white uppercase text-left"
                             dir="ltr"
                             value={couponInput}
                             onChange={(e) => setCouponInput(e.target.value)}
                           />
                           <button 
                             onClick={handleApplyCoupon}
                             className="bg-white/10 text-white font-bold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
                           >הפעל</button>
                        </div>
                        {couponError && <p className="text-red-400 text-sm">{couponError}</p>}
                        {appliedCoupon && (
                          <div className="flex justify-between text-green-400 font-bold text-sm bg-green-400/10 p-2 rounded-lg mt-2">
                             <span>{appliedCoupon.name ? `קופון: ${appliedCoupon.name} (${appliedCoupon.id})` : `קופון ${appliedCoupon.id}`} ({appliedCoupon.type === 'percent' ? `${appliedCoupon.value}%` : `₪${appliedCoupon.value}`}) הופעל</span>
                             <button onClick={() => setAppliedCoupon(null)} className="text-white hover:text-red-400 transition-colors">X</button>
                          </div>
                        )}
                      </div>

                      {/* Savings Breakdown */}
                      {(settings.specialDayEnabled && (settings.globalDiscountPercent || 0) > 0) && (
                        <div className="flex justify-between items-center text-xl font-bold text-acc">
                          <span className="font-bold">חיסכון מהנחות (כולל בונוסים):</span>
                          <span>₪{Math.round(cart.reduce((acc, item) => acc + (Number(item.selectedVariant?.price ?? item.price) * item.qty), 0) - cartTotal)} -</span>
                        </div>
                      )}

                      {currentShippingCost > 0 ? (
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span className="text-gray-400 font-bold">משלוח:</span>
                          <span className="text-white">₪{currentShippingCost}</span>
                        </div>
                      ) : cartTotal > 0 && (
                        <div className="flex justify-between items-center text-xl font-bold text-green-400">
                          <span className="font-bold">משלוח:</span>
                          <span className="font-black">חינם! 🎉</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-6 border-t border-white/10">
                        <span className="text-gray-400 text-2xl font-black uppercase tracking-widest">סה"כ לתשלום:</span>
                        <span className="font-display text-pri text-6xl font-black drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                          ₪{Math.round(cartTotal + currentShippingCost)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                        <button 
                          className="btn-main py-6 text-2xl rounded-3xl font-black flex items-center justify-center gap-3 w-full"
                          onClick={() => {
                            if (!user) {
                              setAuthNote('כדי להזמין ולבצע רכישות במערכת עליך קודם להתחבר. ההזמנה תישמר לך לאחר החיבור.');
                              setShowAuthModal(true);
                              return;
                            }
                            setShowCheckoutModal(true);
                          }}
                        >
                          המשך לקופה <ShieldCheck className="w-8 h-8" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {activePage === 'orders' && (
            <motion.section
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6"
            >
              {!user && !isAdmin && (
                <div className="mb-8 p-10 bg-pri/10 border border-pri/30 rounded-[40px] text-center max-w-2xl mx-auto shadow-2xl">
                  <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-pri" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-white">אינך מחובר למערכת</h3>
                  <p className="text-gray-400 font-bold mb-8 italic">התחברות תאפשר לך לעקוב אחר ההזמנות שלך תחת קורת גג אחת, מכל מכשיר ובכל זמן.</p>
                  <button 
                    onClick={() => {
                      setAuthNote('התחבר כדי לצפות בהיסטוריית ההזמנות המלאה שלך');
                      setShowAuthModal(true);
                    }}
                    className="btn-main px-12 py-4 text-xl"
                  >
                    התחבר עכשיו
                  </button>
                </div>
              )}
              <h2 className="sec-title flex items-center justify-center gap-4">
                <Box className="w-12 h-12" /> {isAdmin ? 'ניהול הזמנות' : 'ההזמנות שלי'}
              </h2>
              
              <div className="space-y-8">
                {(isAdmin ? orders : orders.filter(o => o.user === currentUserId)).map(order => {
                  const isExpanded = expandedOrders[order.id];
                  return (
                    <div key={order.id} className="bg-glass rounded-[35px] border border-white/10 overflow-hidden shadow-2xl">
                      <div 
                        className="p-8 bg-linear-to-b from-white/5 to-transparent cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                      >
                        <div className="flex justify-between items-center border-b border-white/5 pb-6">
                          <div className="flex items-center gap-4">
                            <ChevronDown className={`w-8 h-8 text-pri transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            <div>
                              <span className="text-gray-500 text-sm block mb-1">מספר הזמנה</span>
                              <b className="text-3xl font-display">#{order.id.replace('SC-', '')}</b>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`px-6 py-2 rounded-2xl font-black text-sm border ${
                              order.status.includes('ממתין') ? 'text-gold border-gold/30 bg-gold/5' :
                              order.status.includes('בוטל') ? 'text-acc border-acc/30 bg-acc/5' :
                              'text-pri border-pri/30 bg-pri/5'
                            }`}>
                              {order.status}
                            </div>
                             {(isAdmin || order.user === user) && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrderToEdit(order);
                                  }}
                                  className="text-pri hover:scale-110 transition-transform bg-pri/10 p-2 rounded-xl border border-pri/20"
                                  title="עריכת פרטי הזמנה"
                                >
                                  <Settings className="w-6 h-6" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrderToDelete(order.id);
                                  }}
                                  className="text-acc hover:scale-110 transition-transform bg-acc/10 p-2 rounded-xl border border-acc/20"
                                  title="מחיקת הזמנה"
                                >
                                  <Trash2 className="w-6 h-6" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                  {isAdmin && (
                                    <div className="bg-gold/5 p-6 rounded-3xl border border-gold/20">
                                      <div className="text-xs text-gray-500 font-bold mb-2 uppercase text-right">פרטי לקוח:</div>
                                      <div className="text-xl font-bold mb-1 text-right">{order.name}</div>
                                      <div className="flex flex-col gap-1 items-end">
                                        <a href={`tel:${order.phone}`} className="text-pri font-bold text-lg flex items-center gap-2">
                                          {order.phone} <Phone className="w-4 h-4" />
                                        </a>
                                        {order.email && <div className="text-gray-400 text-sm">{order.email}</div>}
                                      </div>
                                    </div>
                                  )}
                                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                                    <div className="text-xs text-gray-500 font-bold mb-2 uppercase text-right">כתובת משלוח:</div>
                                    <div className="text-lg font-bold text-right">{order.address}</div>
                                  </div>
                                </div>

                                <div className="bg-black/60 p-6 rounded-3xl border border-white/5">
                                  <div className="text-gray-500 text-xs font-bold uppercase mb-6 text-right">מצב ההזמנה ומסע המשלוח:</div>
                                  
                                  <div className="flex flex-col gap-4 mb-10" dir="rtl">
                                    {[
                                      "התקבל במערכת",
                                      "ממתין לתשלום",
                                      "תשלום אושר",
                                      "בטיפול במחסן",
                                      "אריזת המשלוח",
                                      "בדיקת איכות",
                                      "נמסר לשליח",
                                      "בדרך אליך",
                                      "בסניף המקומי",
                                      "נחת ביעד"
                                    ].map((step, idx, arr) => {
                                      const currentIdx = arr.findIndex(s => order.status.includes(s));
                                      const isPast = currentIdx >= idx;
                                      const isCurrent = currentIdx === idx;
                                      
                                      return (
                                        <div key={step} className="flex items-center gap-4 group">
                                          <div className="relative flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isPast ? 'bg-pri border-pri shadow-[0_0_15px_rgba(0,240,255,0.6)]' : 'border-white/10'}`}>
                                              {isPast ? <Check className="w-4 h-4 text-black font-black" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                                            </div>
                                            {idx < arr.length - 1 && (
                                              <div className={`w-0.5 h-6 transition-all duration-1000 ${isPast && currentIdx > idx ? 'bg-pri shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'bg-white/5'}`} />
                                            )}
                                          </div>
                                          <span className={`text-lg font-bold transition-all duration-300 ${isCurrent ? 'text-pri scale-110 origin-right' : isPast ? 'text-white/80' : 'text-gray-600'}`}>
                                            {step}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="text-gray-500 text-xs font-bold uppercase mb-4 text-right">פירוט הזמנה:</div>
                                  {order.itemsRaw ? (
                                    <div className="mb-6 space-y-4">
                                      {order.itemsRaw.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-black/40 p-4 rounded-2xl flex flex-col gap-2 text-right">
                                          <div className="text-white font-bold">{item.name} <span className="text-pri">x{item.qty}</span></div>
                                          {item.selectedVariant && <div className="text-sm text-gray-400">{settings.variantLabel || 'דגם'}: {item.selectedVariant.name}</div>}
                                          {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                                            <div key={k} className="text-sm text-gray-400">{k}: {v as string}</div>
                                          ))}
                                          {isAdmin && item.sourceLink && (
                                            <a href={item.sourceLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-pri text-xs font-bold mt-2 flex items-center gap-1 hover:underline relative z-50 pointer-events-auto">
                                              <ExternalLink className="w-3 h-3" /> קנה מהספק (דרופשיפינג)
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-lg leading-relaxed text-gray-300 mb-6 text-right" dangerouslySetInnerHTML={{ __html: (order.items || '').toString().replace(/, /g, '<br>') }} />
                                  )}
                                  <div className="flex justify-between items-center pt-6 border-t border-white/5" dir="rtl">
                                    <span className="text-gray-400 font-bold">סה"כ שולם:</span>
                                    <span className="text-gold font-display text-4xl font-black">₪{order.total}</span>
                                  </div>
                                   {!isAdmin && (order.status.includes('ממתין') || order.status.includes('התקבל')) && (
                                    <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-[35px] text-right" dir="rtl">
                                      <div className="flex items-center gap-2 text-acc font-black mb-4 h-6">
                                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                                        <span>טרם הושלם התשלום עבור הזמנה זו</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <button 
                                          onClick={() => {
                                            if (settings.bitLink) window.open(settings.bitLink, '_blank');
                                            else setAlertMessage('קישור ה-Bit עדיין לא הוגדר.');
                                          }}
                                          className="bg-blue-500 text-white py-3 rounded-xl font-black text-xs hover:scale-105 transition-all flex items-center justify-center gap-2"
                                        >
                                          <CreditCard className="w-4 h-4" /> Bit
                                        </button>
                                        <button 
                                          onClick={() => {
                                            if (settings.payboxLink) window.open(settings.payboxLink, '_blank');
                                            else setAlertMessage('קישור ה-PayBox עדיין לא הוגדר.');
                                          }}
                                          className="bg-blue-600 text-white py-3 rounded-xl font-black text-xs hover:scale-105 transition-all flex items-center justify-center gap-2"
                                        >
                                          <Wallet className="w-4 h-4" /> PayBox
                                        </button>
                                        <button 
                                          onClick={() => {
                                            if (settings.paypalLink) window.open(settings.paypalLink, '_blank');
                                            else setAlertMessage('קישור ה-PayPal עדיין לא הוגדר.');
                                          }}
                                          className="bg-[#003087] text-white py-3 rounded-xl font-black text-xs hover:scale-105 transition-all flex items-center justify-center gap-2"
                                        >
                                          <Wallet className="w-4 h-4" /> PayPal
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  {isAdmin && (
                                    <div className="mt-12 pt-12 border-t border-white/5">
                                      <label className="text-xs text-gray-500 font-bold mb-4 block uppercase text-right">עדכון סטטוס מפורט (מנהל בלבד):</label>
                                      <select 
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-white font-bold text-right"
                                        dir="rtl"
                                        value={order.status}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleUpdateOrderStatus(order, e.target.value)}
                                      >
                                        <option>התקבל במערכת</option>
                                        <option>ממתין לתשלום</option>
                                        <option>תשלום אושר</option>
                                        <option>בטיפול במחסן</option>
                                        <option>אריזת המשלוח</option>
                                        <option>בדיקת איכות</option>
                                        <option>נמסר לשליח</option>
                                        <option>בדרך אליך</option>
                                        <option>בסניף המקומי</option>
                                        <option>נחת ביעד</option>
                                        <option>בוטל</option>
                                      </select>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <div className="text-center py-20 opacity-50">
                    <Box className="w-20 h-20 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold">אין הזמנות פעילות</h3>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {activePage === 'reviews' && (
            <motion.section
              key="reviews"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6"
            >
              <h2 className="sec-title" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>ביקורות לקוחות</h2>
              
              <div className="bg-glass p-8 rounded-[40px] border border-pri/30 mb-12 shadow-2xl">
                <h3 className="text-pri text-2xl font-black mb-6 flex items-center gap-3">
                  <Star className="w-8 h-8 fill-current" /> כתוב ביקורת משלך
                </h3>
                {!user ? (
                  <div className="text-center py-10 bg-black/40 rounded-3xl border border-white/5">
                    <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-400 mb-6">עליך להתחבר כדי לכתוב ביקורת</p>
                    <button 
                      className="btn-main px-10 py-4"
                      onClick={() => setShowAuthModal(true)}
                    >
                      התחבר עכשיו <LogIn className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label className="text-gray-500 font-bold block mb-3 text-sm uppercase tracking-widest">דירוג השירות והמוצר</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button 
                              key={star}
                              onClick={() => setRevScore(star)}
                              className={`p-3 rounded-2xl transition-all ${revScore >= star ? 'bg-gold/10 text-gold scale-110' : 'bg-white/5 text-gray-700'}`}
                            >
                              <Star className={`w-8 h-8 ${revScore >= star ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-500 font-bold block mb-3 text-sm uppercase tracking-widest text-right">צרף תמונה (אופציונלי)</label>
                      <div className="flex items-center gap-4 flex-row-reverse">
                        <label className="flex-grow bg-black/60 border-2 border-dashed border-white/10 rounded-3xl py-4 px-6 cursor-pointer hover:border-pri transition-all text-center">
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setRevImg(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                            <span className="text-sm font-bold">{revImg ? 'התמונה נבחרה!' : 'לחץ להעלאת תמונה'}</span>
                          </div>
                        </label>
                        {revImg && (
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-pri/30">
                            <img src={revImg} className="w-full h-full object-cover" />
                            <button 
                              onClick={() => setRevImg(null)}
                              className="absolute top-1 right-1 bg-acc text-white rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-500 font-bold block mb-3 text-sm uppercase tracking-widest text-right">כתוב את הביקורת שלך</label>
                      <textarea 
                        placeholder="איך הייתה החוויה שלך?" 
                        className="w-full bg-black/60 border-2 border-white/5 focus:border-pri outline-none rounded-3xl py-5 px-6 text-xl h-40 resize-none transition-all text-right"
                        dir="rtl"
                        value={revText}
                        onChange={(e) => setRevText(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-4">
                      <button 
                        className="btn-main text-2xl py-6 flex-grow shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                        onClick={() => {
                          if (!revText.trim()) return setAlertMessage('אנא כתוב משהו בביקורת');
                          handlePostReview(revText, revScore, undefined, revImg || undefined);
                          setRevText('');
                          setRevScore(5);
                          setRevImg(null);
                          setAlertMessage('תודה! הביקורת פורסמה בהצלחה');
                        }}
                      >
                        פרסם ביקורת עכשיו <Send className="w-6 h-6 ml-2" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {reviews.map(rev => (
                  <div key={rev.id} className="bg-glass p-8 rounded-[35px] border border-white/10 shadow-xl relative">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-gold text-xl mb-2">{'⭐'.repeat(Number(rev.s))}</div>
                        <b className="text-pri text-2xl font-display">{rev.u}</b>
                      </div>
                      <span className="text-gray-600 text-sm font-bold">{new Date(rev.time).toLocaleDateString('he-IL')}</span>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed text-right" dir="rtl">{rev.t}</p>
                    {rev.img && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 max-w-sm">
                        <img src={rev.img} className="w-full object-cover max-h-64 cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(rev.img, '_blank')} />
                      </div>
                    )}
                    <div className="absolute bottom-6 left-6 flex gap-4">
                      {(isAdmin || (user && rev.e === user)) && (
                        <>
                          {(user && rev.e === user) && (
                            <button 
                              className="text-pri hover:scale-110 transition-transform bg-pri/10 p-2 rounded-xl border border-pri/20"
                              onClick={() => setEditingRev(rev)}
                              title="ערוך ביקורת"
                            >
                              <Settings className="w-6 h-6" />
                            </button>
                          )}
                          <button 
                            className="text-acc hover:scale-110 transition-transform bg-acc/10 p-2 rounded-xl border border-acc/20"
                            onClick={() => setReviewToDelete(rev.id)}
                            title="מחק ביקורת"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {activePage === 'admin' && isAdmin && (
            <motion.section
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-6"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="sec-title" style={{ color: 'var(--gold)', borderColor: 'var(--gold)', margin: 0 }}>
                  <Crown className="inline w-10 h-10 ml-4" /> ניהול הזמנות ושירות לקוחות
                </h2>
                {isOwner && (
                  <button 
                    onClick={() => update(ref(db, 'settings'), { isWarMode: !settings.isWarMode })}
                    className={`px-8 py-4 rounded-2xl font-black text-xl transition-all shadow-2xl ${settings.isWarMode ? 'bg-pri text-black' : 'bg-acc text-white'}`}
                  >
                    <ShieldAlert className="inline w-6 h-6 ml-2" />
                    {settings.isWarMode ? 'פתח אתר' : 'עצירת חירום'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-glass p-8 rounded-[40px] border border-white/10 text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-pri" />
                  <LayoutDashboard className="w-10 h-10 text-pri mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-display font-black text-white mb-2">{products.length}</div>
                  <div className="text-gray-500 font-black uppercase text-[10px] tracking-widest">מוצרים בקטלוג</div>
                </div>
                
                <div className="bg-glass p-8 rounded-[40px] border border-pri/30 text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-pri" />
                  <Box className="w-10 h-10 text-pri mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-display font-black text-white mb-2">{orders.length}</div>
                  <div className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-2">הזמנות במערכת</div>
                </div>

                <div className="bg-glass p-8 rounded-[40px] border border-gold/30 text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gold" />
                  <Zap className="w-10 h-10 text-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-display font-black text-gold mb-2">₪{orders.reduce((s,o)=>s+(o.total || 0),0).toLocaleString()}</div>
                  <div className="text-gray-500 font-black uppercase text-[10px] tracking-widest">הכנסות ברוטו</div>
                </div>

                <div className="bg-glass p-8 rounded-[40px] border border-green-500/30 text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                  <Trophy className="w-10 h-10 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-4xl font-display font-black text-green-500 mb-2">₪{totalNetProfit.toLocaleString()}</div>
                  <div className="text-gray-500 font-black uppercase text-[10px] tracking-widest">סה"כ הכנסות ברוטו</div>
                </div>
              </div>

              {isOwner && (
                    <div className="bg-glass p-10 rounded-[50px] border border-white/10 mb-12 shadow-2xl">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <Users className="w-10 h-10 text-pri" />
                          <div>
                            <h3 className="text-3xl font-display font-black text-white">ניהול לקוחות</h3>
                            <div className="text-gray-500 text-sm font-bold">חיפוש, חסימה ותמיכה טכנית</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowCustomerManagement(!showCustomerManagement)}
                          className="bg-pri text-black font-black py-3 px-8 rounded-2xl hover:scale-105 transition-all w-full md:w-auto"
                        >
                          {showCustomerManagement ? 'הסתר ניהול לקוחות' : 'פתיחת ניהול לקוחות'}
                        </button>
                      </div>
                      
                      {showCustomerManagement && (
                        <div className="mt-10 pt-10 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                          <div className="flex flex-col md:flex-row items-center gap-4 w-full mb-8">
                             <div className="relative w-full">
                              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                              <input 
                                placeholder="חפש לפי אימייל..."
                                className="w-full bg-black/60 border-white/10 pr-12 rounded-2xl"
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                              />
                            </div>
                            <div className="bg-pri/10 text-pri px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest border border-pri/20 whitespace-nowrap hidden md:block">
                              סה"כ רשומים: {allUsers.length}
                            </div>
                          </div>
                          
                          <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-right">
                              <thead>
                                <tr className="text-gray-500 border-b border-white/5 text-sm uppercase tracking-widest">
                                  <th className="pb-6 pr-4">לקוח</th>
                                  <th className="pb-6 pr-4">סיסמה</th>
                                  <th className="pb-6 pr-4">פעילות אחרונה</th>
                                  <th className="pb-6 pr-4 text-left">פעולות</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {allUsers
                                  .filter(u => (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()))
                                  .sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0))
                                  .map((u, idx) => {
                                    const mailKey = u.emailKey;
                                    return (
                                      <tr key={idx} className={`hover:bg-white/[0.02] transition-colors group ${u.isBanned ? 'opacity-50 grayscale' : ''}`}>
                                        <td className="py-6 pr-4">
                                          <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${u.isBanned ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                                            <div>
                                              <div className="font-bold text-white flex items-center gap-2">
                                                {u.email}
                                                {u.isBanned && <ShieldAlert className="w-4 h-4 text-red-500" />}
                                              </div>
                                              <div className="text-xs text-gray-500">{u.emailKey?.replace(/,/g, '.')}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-6 pr-4">
                                          <div className="flex items-center gap-2">
                                            <div className="font-mono text-[10px] bg-black/40 px-2 py-1 rounded-lg border border-white/5 min-w-[80px] text-center text-white">
                                              {visiblePasswords[u.emailKey] ? (u.password || 'N/A') : '••••••••'}
                                            </div>
                                            <button 
                                              onClick={() => setVisiblePasswords(prev => ({...prev, [u.emailKey]: !prev[u.emailKey]}))}
                                              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
                                            >
                                              {visiblePasswords[u.emailKey] ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                                            </button>
                                          </div>
                                        </td>
                                        <td className="py-6 pr-4">
                                          <div className="text-xs text-gray-400">
                                            {u.lastActive ? new Date(u.lastActive).toLocaleString('he-IL') : 'לא ידוע'}
                                          </div>
                                        </td>
                                        <td className="py-6 pr-4 text-left">
                                          <div className="flex items-center justify-end gap-3">
                                            <button 
                                              onClick={() => handleBanUser(mailKey, !u.isBanned)}
                                              className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${u.isBanned ? 'bg-green-600/10 text-green-500 hover:bg-green-600/20' : 'bg-red-600/10 text-red-500 hover:bg-red-600/20'}`}
                                            >
                                              {u.isBanned ? 'בטל חסימה' : 'חסימה'}
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
              )}

              {isOwner && (
                <div className="bg-glass p-10 rounded-[50px] border border-white/10 mb-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px] rounded-full" />
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <MessageSquare className="w-10 h-10 text-green-500" />
                      <div>
                        <div className="flex items-center gap-3">
                           <h3 className="text-3xl font-display font-black text-white">צאט לייב עם לקוחות</h3>
                           {chatSessions.filter(s => s.unreadByAdmin).length > 0 && (
                             <span className="bg-red-500 text-white font-black text-xs px-2 py-1 rounded-full animate-pulse">{chatSessions.filter(s => s.unreadByAdmin).length} הודעות חדשות</span>
                           )}
                        </div>
                        <div className="text-gray-500 text-sm font-bold">מענה ישיר ללקוחות מתוך האתר</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowMessages(!showMessages)}
                      className="bg-green-500 text-black font-black py-3 px-8 rounded-2xl hover:scale-105 transition-all w-full md:w-auto"
                    >
                      {showMessages ? 'הסתר צאט' : 'ניהול צאטים'}
                    </button>
                  </div>

                  {showMessages && (
                    <div className="mt-10 pt-10 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500 min-h-[600px]">
                      {!selectedChatUser ? (
                        <div className="space-y-6">
                          <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                             <div className="relative flex-grow">
                              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                              <input 
                                placeholder="חפש לקוח בצאט..."
                                className="w-full bg-black/60 border-white/10 pr-12 rounded-2xl py-4"
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                              />
                            </div>
                            <div className="bg-green-500/10 text-green-500 px-6 py-4 rounded-2xl font-black text-sm border border-green-500/20">
                              {chatSessions.length} שיחות פעילות
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {chatSessions.length === 0 && chatSessions.filter(s => (s.email || '').toLowerCase().includes(userSearchQuery.toLowerCase())).length === 0 && (
                               <div className="col-span-full text-center py-20 bg-black/20 rounded-[40px] border border-dashed border-white/10">
                                 <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-20" />
                                 <p className="text-gray-500 font-bold">אין הודעות חדשות מלקוחות</p>
                               </div>
                            )}
                            {chatSessions
                              .filter(session => (session.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()))
                              .map(session => (
                              <button
                                key={session.userKey}
                                onClick={() => {
                                  setSelectedChatUser(session.userKey);
                                  if (session.unreadByAdmin) {
                                    update(ref(db, `chats/${session.userKey}`), { unreadByAdmin: false });
                                  }
                                }}
                                className={`group relative w-full text-right p-6 rounded-[35px] border-2 transition-all flex flex-col gap-3 ${session.unreadByAdmin ? 'bg-pri/10 border-pri/50 shadow-[0_0_30px_rgba(0,240,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                              >
                                {session.unreadByAdmin && (
                                  <div className="absolute top-4 left-4 flex items-center gap-2">
                                    <span className="text-[10px] font-black text-pri uppercase tracking-widest">הודעה חדשה</span>
                                    <div className="w-3 h-3 bg-pri rounded-full animate-pulse shadow-[0_0_10px_#00f0ff]" />
                                  </div>
                                )}
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-black/40 border ${session.unreadByAdmin ? 'border-pri/40' : 'border-white/10'}`}>
                                    <User className={`w-6 h-6 ${session.unreadByAdmin ? 'text-pri' : 'text-gray-500'}`} />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <div className="font-black text-white text-lg truncate mb-0.5">{session.email}</div>
                                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                                      <Clock className="w-3 h-3" />
                                      {new Date(session.lastUpdate).toLocaleString('he-IL')}
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-black/60 p-3 rounded-2xl text-sm text-gray-400 line-clamp-2 italic text-right w-full border border-white/5">
                                   {(Object.values(session.messages || {}) as any[]).sort((a, b) => b.timestamp - a.timestamp)[0]?.text || 'קובץ תמונה...'}
                                </div>
                                <div className="text-pri text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 self-end mt-2">
                                  פתח צאט <ChevronLeft className="w-4 h-4" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (() => {
                        const activeSession = chatSessions.find(s => s.userKey === selectedChatUser);
                        if (!activeSession) return (
                          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <p>שיחה לא נמצאה או נמחקה</p>
                            <button onClick={() => setSelectedChatUser(null)} className="mt-4 text-pri font-bold">חזרה לרשימה</button>
                          </div>
                        );
                        
                        const msgs = Object.values(activeSession.messages || {}).map(m => m as ChatMessage).sort((a,b) => a.timestamp - b.timestamp);
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-black/40 rounded-[50px] border border-white/10 overflow-hidden flex flex-col h-[700px] shadow-3xl"
                          >
                             {/* Chat Header */}
                             <div className="bg-white/5 p-6 md:p-8 flex items-center justify-between border-b border-white/10">
                                <div className="flex items-center gap-4">
                                  <button 
                                    onClick={() => setSelectedChatUser(null)} 
                                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all flex items-center gap-2 font-bold"
                                  >
                                    <ArrowRight className="w-6 h-6" /> <span className="hidden sm:inline">חזרה לרשימה (יציאה)</span>
                                  </button>
                                  <div className="h-10 w-[1px] bg-white/10 mx-2" />
                                  <div>
                                    <div className="font-black text-xl md:text-2xl text-white flex items-center gap-3">
                                      {activeSession.email}
                                      {activeSession.unreadByAdmin && <div className="w-3 h-3 bg-pri rounded-full shadow-[0_0_10px_#00f0ff]" />}
                                    </div>
                                  </div>
                                </div>
                                <button onClick={() => {
                                   if(confirm('למחוק את כל היסטוריית השיחה?')) {
                                     set(ref(db, `chats/${selectedChatUser}`), null);
                                     setSelectedChatUser(null);
                                   }
                                }} className="p-4 rounded-2xl bg-acc/10 text-acc hover:bg-acc hover:text-white transition-all">
                                   <Trash2 className="w-6 h-6" />
                                </button>
                             </div>

                             {/* Messages Area */}
                             <div className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-6 flex flex-col">
                                {msgs.length === 0 ? (
                                  <div className="m-auto text-gray-500 font-bold flex flex-col items-center opacity-30">
                                    <MessageSquare className="w-16 h-16 mb-4" />
                                    אין הודעות...
                                  </div>
                                ) : (
                                  msgs.map(msg => (
                                     <div key={msg.id} className={`max-w-[85%] md:max-w-[70%] p-6 rounded-[35px] shadow-xl ${msg.sender === 'admin' ? 'bg-pri/20 text-white self-start rounded-tr-sm border border-pri/30' : 'bg-white/5 text-white self-end rounded-tl-sm border border-white/10'}`}>
                                       <div className="flex items-center justify-between gap-4 mb-2 opacity-50">
                                         <span className="text-[10px] font-black uppercase tracking-widest">{msg.sender === 'admin' ? 'אני' : 'לקוח'}</span>
                                         <span className="text-[10px] font-bold">{new Date(msg.timestamp).toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</span>
                                       </div>
                                       {msg.img && (
                                          <div className="mb-4 rounded-3xl overflow-hidden border border-white/10 group cursor-pointer" onClick={() => window.open(msg.img, '_blank')}>
                                            <img src={msg.img} alt="attachment" className="w-full max-h-96 object-cover group-hover:scale-105 transition-transform" />
                                          </div>
                                       )}
                                       {msg.text && <div className="font-bold text-lg leading-relaxed whitespace-pre-wrap text-right" dir="rtl">{msg.text}</div>}
                                     </div>
                                  ))
                                )}
                                <div ref={chatScrollRef} />
                             </div>

                             {/* Input Area */}
                             <div className="p-6 md:p-8 bg-white/5 border-t border-white/10">
                                <div className="flex gap-4 items-end max-w-5xl mx-auto">
                                  <label className="cursor-pointer bg-white/5 hover:bg-pri hover:text-black p-5 rounded-3xl border border-white/10 transition-all text-gray-400 shrink-0 shadow-lg">
                                    <ImageIcon className="w-8 h-8" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, (url) => {
                                        const msgId = Date.now().toString();
                                        const newMsg: ChatMessage = { id: msgId, sender: 'admin', text: '', img: url, timestamp: Date.now() };
                                        const chatRef = ref(db, `chats/${selectedChatUser}`);
                                        update(chatRef, { lastUpdate: Date.now(), unreadByUser: true });
                                        set(ref(db, `chats/${selectedChatUser}/messages/${msgId}`), newMsg);
                                    })} />
                                  </label>
                                  <textarea 
                                    placeholder="הקלד הודעה ללקוח..." 
                                    className="flex-grow bg-black/60 border-2 border-white/10 rounded-[35px] p-6 text-white text-xl h-18 resize-none outline-none focus:border-pri/50 shadow-inner px-6 pr-6 py-6"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (!chatInput.trim()) return;
                                        const msgId = Date.now().toString();
                                        const newMsg: ChatMessage = { id: msgId, sender: 'admin', text: chatInput.trim(), timestamp: Date.now() };
                                        const chatRef = ref(db, `chats/${selectedChatUser}`);
                                        update(chatRef, { lastUpdate: Date.now(), unreadByUser: true });
                                        set(ref(db, `chats/${selectedChatUser}/messages/${msgId}`), newMsg);
                                        setChatInput('');
                                      }
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      if (!chatInput.trim()) return;
                                      const msgId = Date.now().toString();
                                      const newMsg: ChatMessage = { id: msgId, sender: 'admin', text: chatInput.trim(), timestamp: Date.now() };
                                      const chatRef = ref(db, `chats/${selectedChatUser}`);
                                      update(chatRef, { lastUpdate: Date.now(), unreadByUser: true });
                                      set(ref(db, `chats/${selectedChatUser}/messages/${msgId}`), newMsg);
                                      setChatInput('');
                                    }}
                                    className="bg-pri hover:scale-105 active:scale-95 text-black p-6 rounded-3xl transition-all shadow-[0_10px_30px_rgba(0,240,255,0.3)] shrink-0 flex items-center justify-center font-black"
                                  >
                                    <Send className="w-8 h-8" />
                                  </button>
                                </div>
                             </div>
                          </motion.div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-black/40 p-8 rounded-[40px] border border-white/10 mb-12 shadow-inner">
                <div className="flex justify-between mb-6 font-display text-2xl font-black">
                  <span className="text-gold">יעד הכנסות: ₪10,000</span>
                  <span className="text-white">{Math.min(100, Math.round(orders.reduce((s,o)=>s+(o.total || 0),0)/10000*100))}%</span>
                </div>
                <div className="h-6 bg-black rounded-full overflow-hidden border border-white/5 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (orders.reduce((s,o)=>s+(o.total || 0),0)/10000*100))}%` }}
                    className="h-full bg-linear-to-r from-acc to-gold rounded-full shadow-[0_0_20px_rgba(252,238,10,0.5)]" 
                  />
                </div>
              </div>

              {isOwner && (
                <>
                  <div className="bg-glass p-8 rounded-[40px] border border-purple-500/30 mb-12 shadow-2xl">
                    <h3 className="text-purple-400 font-display text-3xl mb-8 flex items-center gap-4">
                      <UserCheck className="w-8 h-8" /> צוות הנהלה (מנכ"ל)
                    </h3>
                    <div className="flex gap-4 mb-8">
                      <input 
                        type="email"
                        placeholder="הכנס אימייל למנהל חדש..."
                        className="flex-grow bg-black/60 border-purple-500/20 py-4 px-6 rounded-2xl"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                      />
                      <button 
                        className="bg-purple-600 text-white px-10 rounded-2xl font-black text-xl hover:bg-purple-500 transition-colors"
                        onClick={handleAddAdmin}
                      >
                        הוסף
                      </button>
                    </div>
                    <div className="space-y-4">
                      {Object.keys(admins).map(key => (
                        <div key={key} className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-4">
                            {key.replace(/,/g, '.') === 'omrifad32@gmail.com' ? <Crown className="text-gold w-6 h-6" /> : <User className="text-purple-400 w-6 h-6" />}
                            <span className="text-xl font-bold">{key.replace(/,/g, '.')}</span>
                          </div>
                          {key.replace(/,/g, '.') !== 'omrifad32@gmail.com' && (
                            <button onClick={() => handleRemoveAdmin(key)} className="text-acc hover:scale-110 transition-transform">
                              <Trash2 className="w-6 h-6" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-glass p-8 rounded-[40px] border border-white/10 mb-12 shadow-2xl">
                    <h3 className="text-white font-display text-3xl mb-8 flex items-center gap-4">
                      <ImageIcon className="w-8 h-8" /> ניהול תמונות קטגוריות
                    </h3>
                    <p className="text-gray-400 mb-6 font-bold">הוסף קישור לתמונה עבור כל קטגוריה שקיימת במערכת. במידה ולא תוזן תמונה, תופיע תמונת ברירת מחדל.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {categories.map((cat, idx) => (
                        <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                            <label className="text-white font-bold block">{cat}:</label>
                            <button 
                              onClick={() => handleDeleteCategory(idx)}
                              className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-2 w-full">
                            <label className="cursor-pointer bg-pri text-black px-4 py-3 rounded-xl flex items-center justify-center shrink-0 hover:bg-pri/80 transition-colors" title="העלה תמונת קטגוריה">
                              <ImageIcon className="w-5 h-5" />
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, (url) => {
                                const updated = { ...(settings.categoryImages || {}) };
                                updated[cat] = url;
                                setSettings({...settings, categoryImages: updated});
                              })} />
                            </label>
                            <input 
                              className="bg-black/80 border-white/10 py-3 flex-1 text-sm rounded-xl px-4"
                              placeholder="URL של תמונה לקטגוריה"
                              value={settings.categoryImages?.[cat] || ''}
                              onChange={(e) => {
                                const updated = { ...(settings.categoryImages || {}) };
                                updated[cat] = e.target.value;
                                setSettings({...settings, categoryImages: updated});
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      className="btn-main py-4 px-8 text-xl"
                      onClick={() => {
                        update(ref(db, 'settings'), settings);
                        setAlertMessage('תמונות הקטגוריות עודכנו בהצלחה!');
                      }}
                    >
                      שמור תמונות קטגוריות <CheckCircle2 className="w-6 h-6 ml-2 inline" />
                    </button>
                  </div>

                  <div className="bg-glass p-8 rounded-[40px] border border-white/10 mb-12 shadow-2xl">
                    <h3 className="text-white font-display text-3xl mb-8 flex items-center gap-4">
                      <Settings className="w-8 h-8" /> הגדרות מותג ראשיות
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <label className="text-gray-500 font-bold block mb-3">שם המותג:</label>
                        <input 
                          className="bg-black/60 border-white/10 py-4"
                          value={settings.title}
                          onChange={(e) => setSettings({...settings, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-bold block mb-3">מידע קופה (legacy):</label>
                        <input 
                          className="bg-black/60 border-white/10 py-4"
                          value={settings.pb}
                          onChange={(e) => setSettings({...settings, pb: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5 mt-4">
                        <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                           <label className="text-[#00457C] font-black block mb-3 text-lg flex items-center gap-2">
                             <Wallet className="w-5 h-5" /> קישור PayPal:
                           </label>
                           <input 
                             placeholder="הכנס URL של פייפאל"
                             className="bg-black/60 border-white/10 py-4 w-full"
                             value={settings.paypalLink || ''}
                             onChange={(e) => setSettings({...settings, paypalLink: e.target.value})}
                           />
                        </div>
                        <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                           <label className="text-[#003087] font-black block mb-3 text-lg flex items-center gap-2">
                             <CreditCard className="w-5 h-5" /> קישור Bit:
                           </label>
                           <input 
                             placeholder="הכנס URL של ביט"
                             className="bg-black/60 border-white/10 py-4 w-full"
                             value={settings.bitLink || ''}
                             onChange={(e) => setSettings({...settings, bitLink: e.target.value})}
                           />
                        </div>
                        <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                           <label className="text-[#1ED2C8] font-black block mb-3 text-lg flex items-center gap-2">
                             <Wallet className="w-5 h-5" /> קישור PayBox:
                           </label>
                           <input 
                             placeholder="הכנס URL של פייבוקס"
                             className="bg-black/60 border-white/10 py-4 w-full"
                             value={settings.payboxLink || ''}
                             onChange={(e) => setSettings({...settings, payboxLink: e.target.value})}
                           />
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500 font-bold block mb-3">ערכת נושא (Theme):</label>
                        <select 
                          className="bg-black/60 border-white/10 py-4 rounded-2xl px-6 font-bold"
                          value={settings.theme || 'dark'}
                          onChange={(e) => setSettings({...settings, theme: e.target.value as 'dark' | 'light'})}
                        >
                          <option value="dark">🌑 שחור (Dark)</option>
                          <option value="light">☀️ לבן (Light)</option>
                        </select>
                      </div>
                    </div>
                    <label className="text-gray-500 font-bold block mb-3">עריכת תקנון האתר:</label>
                    <textarea 
                      className="bg-black/60 border-white/10 h-60 mb-8"
                      value={settings.terms}
                      onChange={(e) => setSettings({...settings, terms: e.target.value})}
                    />
                    <button 
                      className="btn-main py-5 text-xl"
                      onClick={() => update(ref(db, 'settings'), settings)}
                    >
                      עדכן נתונים בשרת <CheckCircle2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="bg-glass p-8 rounded-[40px] border border-pri/30 mb-12 shadow-2xl">
                    <h3 className="text-pri font-display text-3xl mb-8 flex items-center gap-4">
                      <Truck className="w-8 h-8" /> הגדרות משלוח ושעות עבודה
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <label className="text-gray-500 font-bold block mb-3">מחיר משלוח (₪):</label>
                        <input 
                          type="number"
                          className="bg-black/60 border-white/10 py-4"
                          value={settings.shippingCost}
                          onChange={(e) => setSettings({...settings, shippingCost: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-bold block mb-3">שעות פעילות:</label>
                        <input 
                          className="bg-black/60 border-white/10 py-4"
                          value={settings.officeHours}
                          onChange={(e) => setSettings({...settings, officeHours: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 font-bold block mb-3">משלוח חינם מעל (₪):</label>
                        <input 
                          type="number"
                          className="bg-black/60 border-white/10 py-4"
                          value={settings.freeShippingThreshold || 0}
                          onChange={(e) => setSettings({...settings, freeShippingThreshold: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <button 
                      className="btn-main py-4 text-lg bg-linear-to-r from-pri to-blue-600 shadow-[0_5px_20px_rgba(0,240,255,0.3)] w-full"
                      onClick={() => {
                        update(ref(db, 'settings'), settings);
                        setAlertMessage('הגדרות משלוח עודכנו בהצלחה!');
                      }}
                    >
                      <Truck className="w-6 h-6 ml-2" /> שמור הגדרות משלוח
                    </button>
                  </div>

                  <div className="bg-glass p-8 rounded-[40px] border border-acc/30 mb-12 shadow-2xl">
                    <h3 className="text-acc font-display text-3xl mb-8 flex items-center gap-4">
                      <Zap className="w-8 h-8" /> מצב מוצר יחיד (Single Product Mode)
                    </h3>
                    <div className="bg-black/40 p-6 rounded-3xl mb-8 border border-white/5">
                      <p className="text-gray-400 mb-6 font-bold leading-relaxed">
                        הפעלת מצב זה תהפוך את כל האתר לדף נחיתה ממוקד עבור מוצר אחד בלבד (ועד 4 מוצרים נלווים).
                        העיצוב ישתנה לאדום-שחור יוקרתי.
                      </p>
                      <button 
                        onClick={() => setSettings({...settings, singleProductMode: !settings.singleProductMode})}
                        className={`w-full py-5 rounded-2xl font-black text-xl transition-all ${settings.singleProductMode ? 'bg-acc text-white shadow-[0_0_20px_rgba(255,0,85,0.5)]' : 'bg-white/10 text-white'}`}
                      >
                        {settings.singleProductMode ? 'ביטול מצב מוצר יחיד' : 'הפעל מצב מוצר יחיד'}
                      </button>
                    </div>
                    {settings.singleProductMode && (
                      <div className="space-y-6">
                        <div>
                          <label className="text-gray-500 font-bold block mb-3">מזהה מוצר ראשי (ID):</label>
                          <select 
                            className="bg-black/60 border-white/10 py-4 rounded-2xl px-6 font-bold w-full"
                            value={settings.featuredProductId}
                            onChange={(e) => setSettings({...settings, featuredProductId: e.target.value})}
                          >
                            <option value="">בחר מוצר...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-gray-500 font-bold block mb-3 text-sm">בחירת מוצרים נלווים (עד 4):</label>
                          <div className="grid grid-cols-2 gap-3">
                            {products.filter(p => p.id !== settings.featuredProductId).map(p => {
                              const isSelected = settings.relatedProductIds?.includes(p.id);
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    const current = settings.relatedProductIds || [];
                                    if (isSelected) {
                                      setSettings({...settings, relatedProductIds: current.filter(id => id !== p.id)});
                                    } else if (current.length < 4) {
                                      setSettings({...settings, relatedProductIds: [...current, p.id]});
                                    }
                                  }}
                                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-right ${isSelected ? 'bg-pri/20 border-pri text-pri' : 'bg-black/40 border-white/5 text-gray-500'}`}
                                >
                                  {p.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-glass p-8 rounded-[40px] border border-gold/30 mb-12 shadow-2xl text-right">
                    <h3 className="text-gold font-display text-3xl mb-8 flex items-center gap-4">
                      <BadgePercent className="w-8 h-8" /> אירועים מיוחדים והנחות
                    </h3>
                    <div className="grid grid-cols-1 gap-8 mb-8 text-right">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="text-gray-500 font-bold block mb-3 text-right">שם האירוע (למשל: בלאק פריידי):</label>
                          <input 
                            className="bg-black/60 border-white/10 py-4 text-right w-full"
                            value={settings.specialDayName}
                            onChange={(e) => setSettings({...settings, specialDayName: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-bold block mb-3 text-right">אחוז הנחה (שתכלס מקזז במחיר העגלה, 0-100):</label>
                          <input 
                            type="number"
                            className="bg-black/60 border-white/10 py-4 text-right w-full"
                            value={settings.globalDiscountPercent}
                            onChange={(e) => setSettings({...settings, globalDiscountPercent: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-500 font-bold block mb-3 text-right">על מה ההנחה (למשל: על כל החנות מ1000 שח, במקום תיאורי סתם):</label>
                        <input 
                          className="bg-black/60 border-white/10 py-4 text-right w-full"
                          value={settings.specialDayDescription || ''}
                          onChange={(e) => setSettings({...settings, specialDayDescription: e.target.value})}
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, specialDayEnabled: !settings.specialDayEnabled})}
                      className={`w-full py-5 rounded-2xl font-black text-xl transition-all ${settings.specialDayEnabled ? 'bg-gold text-black' : 'bg-white/10 text-white'}`}
                    >
                      {settings.specialDayEnabled ? 'בטל אירוע מיוחד' : 'הפעל אירוע מיוחד'}
                    </button>
                  </div>

                  <div className="bg-glass p-8 rounded-[40px] border border-blue-500/30 mb-12 shadow-2xl text-right">
                    <h3 className="text-blue-400 font-display text-3xl mb-8 flex items-center gap-4">
                      <CreditCard className="w-8 h-8" /> הגדרות תשלום (Bit / PayPal / PayBox)
                    </h3>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input placeholder="Bit Label" className="bg-black/60 border-white/10" value={settings.bitLabel} onChange={(e) => setSettings({...settings, bitLabel: e.target.value})} />
                        <input placeholder="Bit Link" className="bg-black/60 border-white/10" value={settings.bitLink} onChange={(e) => setSettings({...settings, bitLink: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input placeholder="PayPal Label" className="bg-black/60 border-white/10" value={settings.paypalLabel} onChange={(e) => setSettings({...settings, paypalLabel: e.target.value})} />
                        <input placeholder="PayPal Link" className="bg-black/60 border-white/10" value={settings.paypalLink} onChange={(e) => setSettings({...settings, paypalLink: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input placeholder="PayBox Label" className="bg-black/60 border-white/10" value={settings.payboxLabel} onChange={(e) => setSettings({...settings, payboxLabel: e.target.value})} />
                        <input placeholder="PayBox Link" className="bg-black/60 border-white/10" value={settings.payboxLink} onChange={(e) => setSettings({...settings, payboxLink: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <label className="text-white font-bold text-lg flex items-center justify-between w-full cursor-pointer">
                          <span>פייפאל עסקי (תשלום יחיד)</span>
                          <input 
                            type="checkbox" 
                            className="w-6 h-6 accent-pri cursor-pointer"
                            checked={!!settings.paypalOnlyMode}
                            onChange={(e) => setSettings({...settings, paypalOnlyMode: e.target.checked})}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-glass p-8 rounded-[40px] border border-white/10 mb-12 shadow-2xl text-right">
                    <h3 className="text-white font-display text-3xl mb-8 flex items-center gap-4">
                      <Info className="w-8 h-8" /> הסיפור שלנו
                    </h3>
                    <p className="text-gray-400 font-bold mb-4">
                      ניתן לשלב את התמונות בתוך הטקסט! פשוט רשום היכן שתרצה: <code>[תמונה 1]</code>, <code>[תמונה 2]</code> וכו', והתמונה תופיע בדיוק שם במקום בנפרד למעלה או למטה.
                    </p>
                    <textarea 
                      placeholder="כתוב כאן את סיפור החברה..."
                      className="bg-black/60 border-white/10 h-60 mb-8 text-right p-4 rounded-xl w-full"
                      value={settings.ourStory}
                      onChange={(e) => setSettings({...settings, ourStory: e.target.value})}
                    />

                    <h4 className="text-white font-bold mb-4">תמונות אווירה לסיפור שלנו:</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 mb-8">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="relative group w-32 h-32 flex-shrink-0 bg-black/40 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-2 hover:border-white/20 transition-all">
                          {settings.aboutImages?.[i] ? (
                            <>
                              <img src={settings.aboutImages[i]} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                              <button className="absolute -top-2 -right-2 bg-acc p-1 rounded-full shadow-lg" onClick={() => {
                                const list = [...(settings.aboutImages || [])];
                                list.splice(i, 1);
                                setSettings({...settings, aboutImages: list});
                              }}><X className="w-3 h-3" /></button>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-600 mb-1" />
                              <span className="text-[10px] font-bold uppercase">תמונה {i+1}</span>
                              <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => {
                                const list = [...(settings.aboutImages || [])];
                                list[i] = url;
                                setSettings({...settings, aboutImages: list});
                              })} />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mb-8">
                       <label className="text-white font-bold mb-4 block">מיקום התמונות ביחס לטקסט הסיפור:</label>
                       <select 
                         value={settings.aboutImagesPosition || 'bottom'}
                         onChange={(e) => setSettings({...settings, aboutImagesPosition: e.target.value as any})}
                         className="bg-black/60 border border-white/10 rounded-2xl py-4 px-6 text-xl font-bold w-full"
                       >
                         <option value="bottom">מוצגות מתחת לטקסט</option>
                         <option value="top">מוצגות מעל הטקסט</option>
                       </select>
                    </div>

                    <button 
                      className="btn-main py-5 text-xl"
                      onClick={() => update(ref(db, 'settings'), settings)}
                    >
                      שמור את כל ההגדרות <CheckCircle2 className="w-6 h-6" />
                    </button>
                  </div>
                </>
              )}

              <div className="bg-glass p-8 rounded-[40px] border border-pri/30 shadow-2xl">
                <h3 className="text-pri font-display text-3xl mb-8 flex items-center gap-4">
                  <Package className="w-8 h-8" /> מחסן ומוצרים
                </h3>
                <div className="space-y-6">
                  {products.map((p, i) => (
                    <div key={p.id} className="bg-black/60 p-6 rounded-[30px] border border-white/5 space-y-6">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div className="flex items-center gap-4">
                          <img src={p.img} className="w-16 h-16 rounded-xl object-contain bg-black" />
                          <b className="text-2xl">{p.name}</b>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingProdIndex(i);
                              setEditProdData({...p});
                              setShowEditProdModal(true);
                            }}
                            className="bg-pri/20 text-pri p-3 rounded-xl hover:bg-pri/40 transition-colors"
                          >
                            <Edit className="w-6 h-6" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-acc p-3 rounded-xl hover:bg-acc/10 transition-colors">
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input 
                          placeholder="שם מוצר"
                          value={p.name}
                          onChange={(e) => handleUpdateProduct(p.id, { name: e.target.value })}
                          className="bg-black/40 border-white/5"
                        />
                        <select 
                          className="bg-black/40 border-white/5 rounded-2xl px-4 h-16 font-bold"
                          value={p.category}
                          onChange={(e) => handleUpdateProduct(p.id, { category: e.target.value })}
                        >
                          {Array.from(new Set(categories)).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <textarea 
                        placeholder="מפרט טכני..."
                        value={p.desc}
                        onChange={(e) => handleUpdateProduct(p.id, { desc: e.target.value })}
                        className="bg-black/40 border-white/5 h-32"
                      />
                      <div className="grid grid-cols-2 gap-6">
                        <input 
                          type="number"
                          placeholder="מחיר"
                          value={p.price}
                          onChange={(e) => handleUpdateProduct(p.id, { price: Number(e.target.value) })}
                          className="bg-black/40 border-white/5"
                        />
                        <input 
                          type="number"
                          placeholder="מחיר ישן"
                          value={p.oldPrice}
                          onChange={(e) => handleUpdateProduct(p.id, { oldPrice: Number(e.target.value) })}
                          className="bg-black/40 border-white/5"
                        />
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <select 
                          className="flex-grow bg-black/40 border-white/5 rounded-2xl px-4 h-14 font-bold"
                          value={String(p.inS)}
                          onChange={(e) => handleUpdateProduct(p.id, { inS: e.target.value })}
                        >
                          <option value="true">✅ זמין במלאי</option>
                          <option value="false">❌ אזל מהמלאי</option>
                        </select>
                        <button 
                          className="bg-pri/10 text-pri border border-pri/20 px-4 py-4 rounded-2xl font-bold cursor-pointer hover:bg-pri/20 transition-colors whitespace-nowrap"
                          onClick={() => {
                            setEditingProdIndex(i);
                            setEditProdData({...p});
                            setShowEditProdModal(true);
                          }}
                        >
                          אפשרויות / וריאציות ({(Array.isArray(p.variants) ? p.variants : Object.values(p.variants || [])).length})
                        </button>
                        <label className="bg-pri/10 text-pri border border-pri/20 px-6 py-4 rounded-2xl font-bold cursor-pointer hover:bg-pri/20 transition-colors text-center whitespace-nowrap">
                          החלף תמונה
                          <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => handleUpdateProduct(p.id, { img: url }))} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                <div className="bg-glass p-8 rounded-[40px] border border-pri/30 shadow-2xl mt-12">
                  <h3 className="text-pri font-display text-3xl mb-8 flex items-center gap-4">
                    <Box className="w-8 h-8" /> ניהול הזמנות מערכת
                  </h3>
                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 font-bold">אין הזמנות במערכת</div>
                  ) : (
                    orders.map(order => {
                      const isExpanded = expandedOrders[order.id];
                      return (
                        <div key={order.id} className="bg-black/60 rounded-[30px] border border-white/5 overflow-hidden">
                          <div 
                            className="p-6 cursor-pointer hover:bg-white/5 transition-colors flex justify-between items-center"
                            onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                          >
                            <div className="flex items-center gap-4">
                              <ChevronDown className={`w-6 h-6 text-pri transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              <div>
                                <div className="text-pri font-display text-xl mb-1">#{order.id.replace('SC-', '')}</div>
                                <div className="text-white font-bold text-lg">{order.name}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="px-4 py-2 bg-pri/10 text-pri rounded-xl text-xs font-bold border border-pri/20">
                                {order.status}
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOrderToEdit(order);
                                }}
                                className="text-pri p-3 bg-pri/10 rounded-xl border border-pri/20 hover:bg-pri/20 transition-all"
                              >
                                <Settings className="w-6 h-6" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOrderToDelete(order.id);
                                }}
                                className="text-acc p-3 bg-acc/10 rounded-xl border border-acc/20 hover:bg-acc/20 transition-all"
                              >
                                <Trash2 className="w-6 h-6" />
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 border-t border-white/5 bg-black/20">
                                  <div className="text-gray-500 text-sm mb-4">{new Date(order.time).toLocaleString('he-IL')}</div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                      <Phone className="w-4 h-4 text-pri" /> {order.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                      <MapPin className="w-4 h-4 text-pri" /> {order.address}
                                    </div>
                                    {order.email && (
                                      <div className="flex items-center gap-2 text-gray-300">
                                        <ImageIcon className="w-4 h-4 text-pri" /> {order.email}
                                      </div>
                                    )}
                                  </div>
                                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="text-xs text-gray-500 mb-2 uppercase tracking-widest font-black">פירוט הזמנה:</div>
                                    {order.itemsRaw ? (
                                      <div className="space-y-3">
                                        {order.itemsRaw.map((item: any, idx: number) => (
                                          <div key={idx} className="bg-black/40 p-3 rounded-xl flex flex-col gap-1 text-right">
                                            <div className="text-white font-bold text-sm">{item.name} <span className="text-pri">x{item.qty}</span></div>
                                            {item.selectedVariant && <div className="text-xs text-gray-400">{settings.variantLabel || 'דגם'}: {item.selectedVariant.name}</div>}
                                            {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                                              <div key={k} className="text-xs text-gray-400">{k}: {v as string}</div>
                                            ))}
                                            {/* Do NOT show sourceLink to the user */}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-white font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: (order.items || '').toString().replace(/, /g, '<br>') }} />
                                    )}
                                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                                      <span className="text-gray-400">סה"כ לתשלום:</span>
                                      <span className="text-gold font-display text-xl">₪{order.total}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
                </div>
                
                {/* Coupons Section */}
                <div className="bg-glass p-8 rounded-[40px] border border-green-500/30 shadow-2xl mt-12">
                  <h3 className="text-green-400 font-display text-3xl mb-8 flex items-center gap-4">
                    <Percent className="w-8 h-8" /> ניהול קופונים
                  </h3>
                  <div className="flex flex-col gap-4 mb-8">
                     <div className="flex flex-wrap gap-4">
                        <input type="text" id="newCouponCode" placeholder="קוד קופון (ללקוח - אנגלית/מספרים)" className="flex-1 min-w-[200px] bg-black/40 border border-white/10 rounded-xl px-4 uppercase text-left text-white" dir="ltr" />
                        <input type="text" id="newCouponName" placeholder="שם הקופון (למשל: סייל קיץ)" className="flex-1 min-w-[200px] bg-black/40 border border-white/10 rounded-xl px-4 text-white" />
                        <input type="number" id="newCouponValue" placeholder="ערך" className="w-24 bg-black/40 border border-white/10 rounded-xl px-4 text-white" />
                        <select id="newCouponType" className="bg-black/40 border border-white/10 rounded-xl px-4 text-white">
                           <option value="percent">אחוזים (%)</option>
                           <option value="fixed">שקלים (₪)</option>
                        </select>
                        <input type="number" id="newCouponMinAmount" placeholder="מינימום קנייה (אופציונלי)" className="w-48 bg-black/40 border border-white/10 rounded-xl px-4 text-white" />
                        <button className="bg-green-500 text-black font-bold px-6 py-2 rounded-xl shrink-0" onClick={() => {
                           let code = (document.getElementById('newCouponCode') as HTMLInputElement).value.trim().toUpperCase();
                           code = code.replace(/[\.#\$\[\]]/g, ''); // Firebase path safety
                           const name = (document.getElementById('newCouponName') as HTMLInputElement).value.trim();
                           const value = Number((document.getElementById('newCouponValue') as HTMLInputElement).value);
                           const type = (document.getElementById('newCouponType') as HTMLSelectElement).value as 'percent' | 'fixed';
                           const minAmount = Number((document.getElementById('newCouponMinAmount') as HTMLInputElement).value);
                           
                           if (!code) {
                             alert('חובה להזין קוד קופון חוקי!');
                             return;
                           }
                           if (!value) {
                             alert('חובה להזין ערך הנחה!');
                             return;
                           }

                           handleAddCoupon(code, name, type, value, minAmount);
                           (document.getElementById('newCouponCode') as HTMLInputElement).value = '';
                           (document.getElementById('newCouponName') as HTMLInputElement).value = '';
                           (document.getElementById('newCouponValue') as HTMLInputElement).value = '';
                           (document.getElementById('newCouponMinAmount') as HTMLInputElement).value = '';
                        }}>הוסף קופון</button>
                     </div>
                  </div>
                  <div className="space-y-4">
                     {Object.entries(coupons).map(([code, coupon]: [string, any]) => (
                        <div key={code} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                           <div className="flex items-center gap-4">
                              <span className="text-white font-bold text-xl uppercase select-all cursor-text">{code}</span>
                              {coupon.name && <span className="text-pri font-bold">{coupon.name}</span>}
                              <span className="text-gray-400">
                                 {coupon.type === 'percent' ? `${coupon.value}% הנחה` : `₪${coupon.value} הנחה`}
                                 {coupon.minAmount ? ` (בקנייה מעל ₪${coupon.minAmount})` : ''}
                              </span>
                           </div>
                           <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" className="w-5 h-5 accent-green-500" checked={coupon.active} onChange={(e) => handleToggleCoupon(code, e.target.checked)} />
                                 <span className="text-sm font-bold text-gray-300">פעיל</span>
                              </label>
                              <button className="text-acc hover:scale-110 transition-transform" onClick={() => handleDeleteCoupon(code)}><X className="w-6 h-6"/></button>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>

                {/* Trash Section */}
                <div className="bg-glass p-8 rounded-[40px] border border-gray-600/30 shadow-2xl mt-12">
                  <h3 className="text-gray-400 font-display text-3xl mb-8 flex items-center gap-4">
                    <Trash2 className="w-8 h-8" /> סל מחזור (Recycle Bin)
                  </h3>
                  <div className="space-y-6">
                    <div className="text-xl font-bold text-white mb-2">מוצרים שהוסרו</div>
                    {trashedProducts.length === 0 ? <p className="text-gray-500 text-sm">אין מוצרים במחזור</p> : trashedProducts.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                           {p.img && <img src={p.img} className="w-10 h-10 rounded-md object-cover" />}
                           <span className="text-white font-bold">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button className="bg-pri/20 text-pri px-4 py-2 rounded-xl text-sm font-bold hover:bg-pri hover:text-black transition-colors" onClick={() => {
                             const list = [...products, p];
                             set(ref(db, 'products'), cleanPayload(list));
                             remove(ref(db, `trash/products/${p.id}`));
                           }}>שחזר</button>
                           <button className="bg-acc/20 text-acc p-2 rounded-xl text-sm font-bold hover:bg-acc hover:text-white transition-colors" title="מחק לצמיתות" onClick={() => remove(ref(db, `trash/products/${p.id}`))}>
                             <X className="w-5 h-5"/>
                           </button>
                        </div>
                      </div>
                    ))}

                    <div className="text-xl font-bold text-white mt-8 mb-2">הזמנות שהוסרו</div>
                    {trashedOrders.length === 0 ? <p className="text-gray-500 text-sm">אין הזמנות במחזור</p> : trashedOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                           <span className="text-white font-bold">{o.name} - #{o.id.replace('SC-', '')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="bg-pri/20 text-pri px-4 py-2 rounded-xl text-sm font-bold hover:bg-pri hover:text-black transition-colors" onClick={() => {
                            set(ref(db, `orders/${o.id}`), o);
                            remove(ref(db, `trash/orders/${o.id}`));
                          }}>שחזר</button>
                          <button className="bg-acc/20 text-acc p-2 rounded-xl text-sm font-bold hover:bg-acc hover:text-white transition-colors" title="מחק לצמיתות" onClick={() => remove(ref(db, `trash/orders/${o.id}`))}>
                             <X className="w-5 h-5"/>
                           </button>
                        </div>
                      </div>
                    ))}

                    <div className="text-xl font-bold text-white mt-8 mb-2">ביקורות שהוסרו</div>
                    {trashedReviews.length === 0 ? <p className="text-gray-500 text-sm">אין ביקורות במחזור</p> : trashedReviews.map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                           <span className="text-white font-bold">{r.n}</span>
                           <span className="text-gray-400 text-xs truncate max-w-[200px]">{r.t}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button className="bg-pri/20 text-pri px-4 py-2 rounded-xl text-sm font-bold hover:bg-pri hover:text-black transition-colors" onClick={() => {
                             set(ref(db, `reviews/${r.id}`), r);
                             remove(ref(db, `trash/reviews/${r.id}`));
                           }}>שחזר</button>
                           <button className="bg-acc/20 text-acc p-2 rounded-xl text-sm font-bold hover:bg-acc hover:text-white transition-colors" title="מחק לצמיתות" onClick={() => remove(ref(db, `trash/reviews/${r.id}`))}>
                             <X className="w-5 h-5"/>
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <nav className="nav-bar">
        {[
          { id: 'home', label: 'בית', icon: Home },
          { id: 'catalog', label: 'חנות', icon: Zap },
          { id: 'reviews', label: 'ביקורות', icon: Star },
          { id: 'cart', label: 'עגלה', icon: ShoppingBag },
          { id: 'orders', label: 'הזמנות', icon: Box },
          { id: 'support', label: 'שירות', icon: MessageCircle },
        ].filter(i => !(i as any).hidden).map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={(item as any).onClick ? (item as any).onClick : () => setActivePage(item.id as any)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-pri -translate-y-2' : 'text-gray-600'
              }`}
            >
              <Icon className={`w-7 h-7 ${isActive ? 'drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
        {isAdmin && (
          <button
            onClick={() => setActivePage('admin')}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activePage === 'admin' ? 'text-gold -translate-y-2' : 'text-gray-600'
            }`}
          >
            <Crown className={`w-7 h-7 ${activePage === 'admin' ? 'drop-shadow-[0_0_10px_rgba(252,238,10,0.5)]' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">ניהול</span>
          </button>
        )}
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {/* DONATIONS MODAL */}
        {showDonationsModal && (
          <div className="modal show items-center p-4 z-[99]" onClick={() => setShowDonationsModal(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mod-content max-w-sm w-full rounded-[40px] border-2 border-pink-500/30 p-8 shadow-[0_0_100px_rgba(236,72,153,0.1)] bg-gradient-to-b from-black/90 to-black/95 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-mod transition-transform active:scale-95" onClick={() => setShowDonationsModal(false)}><X /></button>
              
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/20">
                  <Heart className="text-pink-500 w-10 h-10 fill-current" />
                </div>
                <h3 className="text-3xl font-display font-black mb-2 tracking-tight">תרומות ופרגונים</h3>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-pink-500 font-black text-xl italic underline decoration-wavy">תרומה מכל הלב 💖</p>
                  <p className="text-gray-500 text-sm px-4">מעריכים מאוד את הרצון לתמוך! כל תרומה עוזרת לנו להמשיך ולהשתפר.</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[50px] -mr-16 -mt-16" />
                <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">
                  סכום תרומה לבחירתכם:
                </div>
                <div className="text-white font-display text-5xl font-black">
                  ₪??
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    if (settings.payboxLink) window.open(settings.payboxLink, '_blank');
                    else setAlertMessage('קישור ה-PayBox עדיין לא הוגדר על ידי המנהל.');
                  }}
                  className="flex items-center justify-between gap-4 p-5 rounded-3xl border-2 border-white/10 bg-pink-500/10 hover:bg-pink-500/30 hover:border-pink-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-pink-500 p-3 rounded-xl group-hover:rotate-12 transition-transform shadow-lg"><Heart className="w-6 h-6 text-white" /></div>
                    <span className="text-white font-black text-lg">תרומה דרך פייבוקס</span>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:translate-x-[-4px] transition-transform" />
                </button>
                <button 
                  onClick={() => {
                    if (settings.bitLink) window.open(settings.bitLink, '_blank');
                    else setAlertMessage('קישור ה-Bit עדיין לא הוגדר על ידי המנהל.');
                  }}
                  className="flex items-center justify-between gap-4 p-5 rounded-3xl border-2 border-white/10 bg-pri/10 hover:bg-pri/30 hover:border-pri transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-pri p-3 rounded-xl group-hover:rotate-12 transition-transform shadow-lg"><Heart className="w-6 h-6 text-white" /></div>
                    <span className="text-white font-black text-lg">תרומה דרך ביט</span>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:translate-x-[-4px] transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showAuthModal && (
          <div className="modal show items-center overflow-auto p-4 flex" onClick={() => setShowAuthModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-[450px] m-auto rounded-3xl p-8 md:p-10 shadow-xl ${localTheme === 'light' ? 'bg-white border border-gray-200' : 'bg-[#202124] border border-[#3c4043]'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${localTheme === 'light' ? 'text-gray-500 hover:bg-gray-100' : 'text-[#9aa0a6] hover:bg-[#3c4043]'}`} 
                onClick={() => { setShowAuthModal(false); setAuthNote(null); setAuthMode('login'); }}
              >
                <X className="w-5 h-5" />
              </button>
              
              {!user ? (
                <div className="flex flex-col h-full mt-2">
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                      {/* Colorful generic icon to emulate Google style but rounder */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${localTheme === 'light' ? 'bg-[#e8f0fe]' : 'bg-blue-100'}`}>
                        <ShieldCheck className={`w-7 h-7 ${localTheme === 'light' ? 'text-[#1a73e8]' : 'text-[#8ab4f8]'}`} />
                      </div>
                    </div>
                    <h2 className={`text-[26px] font-normal leading-tight mb-2 ${localTheme === 'light' ? 'text-[#202124]' : 'text-[#e8eaed]'}`} style={{ fontFamily: 'sans-serif' }}>
                      {authMode === 'login' ? 'התחברות' : authMode === 'reg' ? 'יצירת חשבון' : 'שחזור סיסמה'}
                    </h2>
                    <p className={`text-[16px] font-normal ${localTheme === 'light' ? 'text-[#202124]' : 'text-[#e8eaed]'}`} style={{ fontFamily: 'sans-serif' }}>
                       {authMode === 'forgot' ? 'הזן את האימייל לשחזור' : 'המשך לאתר ' + settings.title}
                    </p>
                    {authNote && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 text-[#d93025] flex items-center justify-center gap-2 text-[14px] font-medium bg-[#fce8e6] px-4 py-2 rounded-2xl"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-right">{authNote}</span>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="space-y-4 mb-4">
                    {authMode !== 'verify' && (
                      <div className={`relative border rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-[#1a73e8] focus-within:border-[#1a73e8] overflow-hidden transition-all ${localTheme === 'light' ? 'border-[#dadce0] bg-transparent' : 'border-[#5f6368] bg-[#202124] focus-within:ring-[#8ab4f8] focus-within:border-[#8ab4f8]'}`}>
                        <label className={`block text-[13px] font-medium mb-1 ${localTheme === 'light' ? 'text-[#5f6368]' : 'text-[#9aa0a6]'}`}>אימייל</label>
                        <input 
                          type="email" 
                          className={`w-full bg-transparent border-none p-0 focus:ring-0 text-[16px] outline-none ${localTheme === 'light' ? 'text-[#202124]' : 'text-[#e8eaed]'}`}
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          dir="ltr"
                          placeholder="name@example.com"
                        />
                      </div>
                    )}
                    
                    {(authMode === 'login' || authMode === 'reg') && (
                      <div className={`relative border rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-[#1a73e8] focus-within:border-[#1a73e8] overflow-hidden transition-all ${localTheme === 'light' ? 'border-[#dadce0] bg-transparent' : 'border-[#5f6368] bg-[#202124] focus-within:ring-[#8ab4f8] focus-within:border-[#8ab4f8]'}`}>
                        <label className={`block text-[13px] font-medium mb-1 ${localTheme === 'light' ? 'text-[#5f6368]' : 'text-[#9aa0a6]'}`}>
                          סיסמה {authMode === 'reg' && '(מומלץ 6+ תווים)'}
                        </label>
                        <input 
                          type="password" 
                          className={`w-full bg-transparent border-none p-0 focus:ring-0 text-[16px] outline-none tracking-widest ${localTheme === 'light' ? 'text-[#202124]' : 'text-[#e8eaed]'}`}
                          value={authPass}
                          onChange={(e) => setAuthPass(e.target.value)}
                          dir="ltr"
                          placeholder="••••••••"
                        />
                      </div>
                    )}
                  </div>

                  {authMode === 'login' && (
                    <div className="mb-6 flex justify-start">
                      <button 
                        onClick={() => { setAuthMode('forgot'); setAuthNote(null); }} 
                        className={`text-[14px] font-medium hover:bg-[#e8f0fe] px-4 py-1.5 rounded-full transition-colors ${localTheme === 'light' ? 'text-[#1a73e8]' : 'text-[#8ab4f8]'}`}
                      >
                        שכחת את הסיסמה?
                      </button>
                    </div>
                  )}

                  {authMode !== 'login' && (
                    <div className="mb-6 flex justify-start">
                      <button 
                        onClick={() => { setAuthMode('login'); setAuthNote(null); }} 
                        className={`text-[14px] font-medium hover:bg-[#e8f0fe] px-4 py-1.5 rounded-full transition-colors ${localTheme === 'light' ? 'text-[#1a73e8]' : 'text-[#8ab4f8]'}`}
                      >
                        חזרה להתחברות
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto">
                    <button 
                      className={`text-[14px] font-medium px-4 py-2.5 rounded-full hover:bg-[#e8f0fe] transition-colors ${localTheme === 'light' ? 'text-[#1a73e8]' : 'text-[#8ab4f8]'}`}
                      onClick={() => { setAuthMode(authMode === 'login' ? 'reg' : 'login'); setAuthNote(null); }}
                    >
                      {authMode === 'login' ? 'יצירת חשבון' : (authMode === 'reg' ? 'כניסה לחשבון' : '')}
                    </button>
                    <button 
                      className={`text-[14px] font-medium px-8 py-2.5 rounded-full transition-colors ${localTheme === 'light' ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white' : 'bg-[#8ab4f8] hover:bg-[#93bcf8] text-[#202124]'}`}
                      onClick={handleAuth}
                      disabled={
                        (authMode === 'login' && (!authEmail || authPass.length < 6)) || 
                        (authMode === 'reg' && (!authEmail || authPass.length < 6)) ||
                        (authMode === 'forgot' && !authEmail)
                      }
                      style={{ 
                        opacity: (
                          (authMode === 'login' && (!authEmail || authPass.length < 6)) || 
                          (authMode === 'reg' && (!authEmail || authPass.length < 6)) ||
                          (authMode === 'forgot' && !authEmail)
                        ) ? 0.6 : 1 
                      }}
                    >
                      הבא
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${localTheme === 'light' ? 'bg-[#e8f0fe]' : 'bg-blue-100'}`}>
                    <UserCheck className={`w-10 h-10 ${localTheme === 'light' ? 'text-[#1a73e8]' : 'text-[#1a73e8]'}`} />
                  </div>
                  <h3 className={`text-2xl font-normal mb-2 ${localTheme === 'light' ? 'text-[#202124]' : 'text-[#e8eaed]'}`} style={{ fontFamily: 'sans-serif' }}>מחובר למערכת</h3>
                  <div className={`px-4 py-1.5 rounded-full border mb-8 text-sm flex items-center gap-2 ${localTheme === 'light' ? 'border-[#dadce0] bg-[#f8f9fa] text-[#3c4043]' : 'border-[#5f6368] text-[#e8eaed]'}`}>
                    <User className="w-3.5 h-3.5" />
                    <span translate="no">{user}</span>
                  </div>
                  <div className="w-full flex flex-col gap-3">
                    <button 
                      className={`w-full py-2.5 rounded-[4px] font-medium transition-colors ${localTheme === 'light' ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white' : 'bg-[#8ab4f8] hover:bg-[#93bcf8] text-[#202124]'}`}
                      onClick={() => { setShowAuthModal(false); setActivePage('orders'); }}
                    >
                      ההזמנות שלי
                    </button>
                    <button 
                      className={`w-full py-2.5 px-4 rounded-[4px] border font-medium transition-colors flex items-center justify-center gap-2 ${localTheme === 'light' ? 'border-[#dadce0] text-[#1a73e8] hover:bg-[#f8f9fa]' : 'border-[#5f6368] text-[#8ab4f8] hover:bg-[#303134]'}`} 
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" /> יציאה מהחשבון
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {selectedProduct && (
          <div className="modal show items-center p-4" onClick={() => setSelectedProduct(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mod-content max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-[40px] border-2 border-pri p-0 shadow-[0_0_100px_rgba(0,240,255,0.2)] scrollbar-thin scrollbar-thumb-pri scrollbar-track-transparent my-10"
              onClick={(e) => e.stopPropagation()}
            >
        <div className="sticky top-0 w-full flex justify-between items-center z-50 p-6 bg-linear-to-b from-black/80 to-transparent backdrop-blur-md rounded-t-[40px]">
          {isAdmin ? (
            <button 
              className="w-12 h-12 rounded-full bg-gold text-black flex items-center justify-center hover:scale-110 transition-all shadow-lg"
              onClick={() => {
                const idx = products.findIndex(p => p.id === selectedProduct.id);
                if (idx !== -1) startEditing(selectedProduct);
              }}
            >
              <Settings className="w-6 h-6" />
            </button>
          ) : <div />}
          <button 
            className="w-14 h-14 rounded-full bg-red-500/20 text-red-500 border-2 border-red-500/50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
            onClick={() => setSelectedProduct(null)}
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start px-4 md:px-12 pb-12 pt-4">
          <div className="flex flex-col gap-4">
            <div className="relative group flex items-center justify-center bg-black/40 rounded-[30px] p-4 border border-white/5 min-h-[250px] md:min-h-[400px] overflow-hidden">
              {(selectedProduct.stock === 0 || selectedProduct.inS === 'false') && <div className="oos-overlay rounded-[30px]"><div className="oos-text">אזל</div></div>}
              {isAdmin && (
                <label className="absolute top-4 left-4 bg-pri text-black p-3 rounded-full hover:bg-white transition-all cursor-pointer shadow-xl z-20 group-hover:scale-110" title="החלף תמונה זו">
                  <ImageIcon className="w-6 h-6" />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleUploadImage(e, (url) => {
                       const hasVariantImg = !!(selectedVariant?.img && ![selectedProduct.img, ...(selectedProduct.extraImages || [])].includes(selectedVariant.img));
                       if (hasVariantImg && editingImgIdx === 0) {
                           // Replacing variant image
                           const pTemp = {...selectedProduct};
                           const vArr = Array.isArray(pTemp.variants) ? pTemp.variants : Object.values(pTemp.variants || []);
                           const vIdx = vArr.findIndex((v: any) => v.id === selectedVariant.id);
                           if (vIdx !== -1) {
                               vArr[vIdx].img = url;
                               pTemp.variants = vArr;
                               handleUpdateProduct(pTemp.id, pTemp);
                               setSelectedProduct(pTemp);
                               setSelectedVariant({...selectedVariant, img: url});
                           }
                       } else {
                           const baseIdx = hasVariantImg ? editingImgIdx - 1 : editingImgIdx;
                           if (baseIdx === 0) {
                               // Replacing main image
                               const pTemp = { ...selectedProduct, img: url };
                               handleUpdateProduct(pTemp.id, { img: url });
                               setSelectedProduct(pTemp);
                           } else {
                               // Replacing extra image
                               const extras = [...(selectedProduct.extraImages || [])];
                               extras[baseIdx - 1] = url;
                               const pTemp = { ...selectedProduct, extraImages: extras };
                               handleUpdateProduct(pTemp.id, { extraImages: extras });
                               setSelectedProduct(pTemp);
                           }
                       }
                    })}
                  />
                </label>
              )}
              <AnimatePresence mode="wait">
                <motion.img 
                  key={editingImgIdx + (selectedVariant?.img || '')}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  src={currentDisplayImg} 
                  className="w-full h-full max-h-[300px] md:max-h-[400px] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
                  referrerPolicy="no-referrer" 
                />
              </AnimatePresence>
              
              {(productImages.length > 1 || isAdmin) && (
                <>
                  {productImages.length > 1 && (
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-pri hover:text-black transition-all z-10"
                      onClick={() => setEditingImgIdx(prev => (prev === 0 ? productImages.length - 1 : prev - 1))}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                  {productImages.length > 1 && (
                    <button 
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-pri hover:text-black transition-all z-10"
                      onClick={() => setEditingImgIdx(prev => (prev === productImages.length - 1 ? 0 : prev + 1))}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                </>
              )}
            </div>
            
            {(productImages.length > 1 || isAdmin) && (
              <div className="flex justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
                 {productImages.map((url, i) => (
                   <div key={i} className="relative group">
                     <button 
                       onClick={() => setEditingImgIdx(i)}
                       className={`w-16 h-16 rounded-xl border-2 transition-all overflow-hidden bg-black/40 flex-shrink-0 ${editingImgIdx === i ? 'border-pri scale-110 shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                     >
                       <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </button>
                     {isAdmin && i !== 0 && (
                       <button 
                         className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                         onClick={(e) => {
                            e.stopPropagation();
                            const hasVariantImg = !!(selectedVariant?.img && ![selectedProduct.img, ...(selectedProduct.extraImages || [])].includes(selectedVariant.img));
                            const baseIdx = hasVariantImg ? i - 1 : i;
                            if (baseIdx > 0) {
                               const extras = [...(selectedProduct.extraImages || [])];
                               extras.splice(baseIdx - 1, 1);
                               const pTemp = { ...selectedProduct, extraImages: extras };
                               handleUpdateProduct(pTemp.id, { extraImages: extras });
                               setSelectedProduct(pTemp);
                               if (editingImgIdx >= i) setEditingImgIdx(Math.max(0, editingImgIdx - 1));
                            }
                         }}
                       >
                         <X className="w-3 h-3" />
                       </button>
                     )}
                   </div>
                 ))}
                 {isAdmin && (
                   <label className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-pri hover:text-pri text-white/50 transition-all flex-shrink-0">
                     <Plus className="w-6 h-6" />
                     <input 
                       type="file" 
                       className="hidden" 
                       onChange={(e) => handleUploadImage(e, (url) => {
                          const extras = [...(selectedProduct.extraImages || []), url];
                          const pTemp = { ...selectedProduct, extraImages: extras };
                          handleUpdateProduct(pTemp.id, { extraImages: extras });
                          setSelectedProduct(pTemp);
                          setEditingImgIdx(productImages.length);
                       })}
                     />
                   </label>
                 )}
              </div>
            )}
          </div>
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-pri/10 text-pri px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-pri/20">
                      {selectedProduct.category}
                    </span>
                    {isAdmin && selectedProduct.sourceLink && (
                       <a href={selectedProduct.sourceLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-1 z-50 relative pointer-events-auto">
                          <ExternalLink className="w-3 h-3" /> קישור לספק (מוסתר)
                       </a>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-display font-black mb-2 leading-tight">{selectedProduct.name}</h2>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
                    </div>
                    <span className="text-gray-500 text-sm font-bold">(4.9/5 | 128 הזמנות)</span>
                  </div>
                  
                  {selectedProduct.stock !== undefined && selectedProduct.stock > 0 && (
                    <div className="flex items-center gap-2 text-acc font-bold mb-4 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>נשארו רק {selectedProduct.stock} יחידות אחרונות במלאי!</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-gold font-display text-3xl md:text-5xl font-black">
                      ₪{Number(selectedVariant?.price ?? selectedProduct.price).toLocaleString()}
                    </span>
                    {((selectedVariant?.price || selectedProduct.price) !== (selectedVariant?.price ?? selectedProduct.oldPrice)) && (
                      <div className="flex flex-col items-start">
                        <span className="text-gray-600 line-through text-lg md:text-2xl font-bold">
                          ₪{Number(selectedVariant?.price ? (Number(selectedVariant.price) * 1.2) : selectedProduct.oldPrice).toLocaleString()}
                        </span>
                        <span className="bg-acc text-white text-[10px] font-black px-2 py-1 rounded-lg mt-1">
                          {Math.round((1 - (Number(selectedVariant?.price ?? selectedProduct.price) / (selectedVariant?.price ? Number(selectedVariant.price) * 1.2 : Number(selectedProduct.oldPrice || 1)))) * 100)}% הנחה!
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedProduct.desc && (
                    <div className="bg-white/5 p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-white/10 mb-6 md:mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-pri rounded-full"></div>
                        <h4 className="text-white font-display text-lg md:text-2xl">מפרט ותכונות</h4>
                      </div>
                      <div className="space-y-4">
                        {selectedProduct.desc.split('\n').filter(l => l.trim()).map((line, i) => {
                          const parts = line.split(':');
                          if (parts.length > 1) {
                            return (
                              <div key={i} className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-gray-500 font-bold">{parts[0].trim()}</span>
                                <span className="text-white font-black">{parts.slice(1).join(':').trim()}</span>
                              </div>
                            );
                          }
                          return <p key={i} className="text-gray-400 text-base md:text-xl leading-relaxed">{line}</p>;
                        })}
                      </div>
                    </div>
                  )}

                  {selectedProduct.variants && Object.keys(selectedProduct.variants).length > 0 && (
                    <div className="mb-8 p-6 bg-white/5 rounded-[30px] border border-white/10 ring-2 ring-pri/10 relative">
                      {isAdmin && (
                        <button 
                          className="absolute top-4 left-4 bg-pri/20 text-pri hover:bg-pri hover:text-black p-2 rounded-xl transition-colors shadow-lg flex items-center justify-center"
                          title="ערוך מוצר זה"
                          onClick={() => {
                            const pIndex = products.findIndex((p) => p.id === selectedProduct.id);
                            if (pIndex !== -1) {
                              setEditingProdIndex(pIndex);
                              setEditProdData(products[pIndex]);
                              setShowEditProdModal(true);
                            }
                          }}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      <div className="flex flex-col gap-4">
                        <label className="text-white font-black text-lg flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-pri text-black flex items-center justify-center text-sm">1</span>
                          {selectedProduct.variantLabel || 'בחר דגם / סוג'}:
                        </label>
                        <select 
                          className="w-full bg-black/60 border border-white/20 rounded-2xl p-4 text-white font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-pri transition-all"
                          value={selectedVariant?.id || ''}
                          onChange={(e) => {
                            const vars = Array.isArray(selectedProduct.variants) ? selectedProduct.variants : Object.values(selectedProduct.variants || []);
                            const v = vars.find((x: any) => x.id === e.target.value);
                            if (v) {
                              setSelectedVariant(v);
                              if (v.img) {
                                const allImgs = [selectedProduct.img, ...(selectedProduct.extraImages || [])];
                                const imgIdx = allImgs.indexOf(v.img);
                                if (imgIdx !== -1) setEditingImgIdx(imgIdx);
                              }
                            }
                          }}
                        >
                          <option value="" disabled>-- לחץ כאן לבחירה --</option>
                          {(Array.isArray(selectedProduct.variants) ? selectedProduct.variants : Object.values(selectedProduct.variants || [])).map((v: any, i: number) => (
                            <option key={v.id || i} value={v.id}>
                              {v.name} {v.price ? `(₪${v.price})` : ''}
                            </option>
                          ))}
                        </select>
                        {selectedVariant && (
                          <div className="text-pri font-bold text-sm">
                            נבחר: {selectedVariant.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* custom options edit handle logic below */}
                  {selectedProduct.customOptions && selectedProduct.customOptions.length > 0 && (
                    <div className="mb-8 space-y-4 relative">
                      {isAdmin && !(selectedProduct.variants && Object.keys(selectedProduct.variants).length > 0) && (
                        <button 
                          className="absolute top-4 left-4 bg-pri/20 text-pri hover:bg-pri hover:text-black p-2 rounded-xl transition-colors shadow-lg flex items-center justify-center z-10"
                          title="ערוך מוצר זה"
                          onClick={() => {
                            const pIndex = products.findIndex((p) => p.id === selectedProduct.id);
                            if (pIndex !== -1) {
                              setEditingProdIndex(pIndex);
                              setEditProdData(products[pIndex]);
                              setShowEditProdModal(true);
                            }
                          }}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      )}
                      {selectedProduct.customOptions.map((opt, i) => (
                        <div key={i} className="p-6 bg-white/5 rounded-[30px] border border-white/10 ring-2 ring-pri/10">
                          <label className="text-white font-black text-lg flex items-center gap-2 mb-4">
                            <span className="w-8 h-8 rounded-full bg-pri text-black flex items-center justify-center text-sm">{i + (selectedProduct.variants && Object.keys(selectedProduct.variants).length > 0 ? 2 : 1)}</span>
                            {opt.title}:
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {opt.choices.map((choice: any, j: number) => {
                               const choiceName = typeof choice === 'string' ? choice : choice.name;
                               const choiceImg = choice.img;
                               const isSelected = selectedCustomOptions[opt.title] === choiceName;
                               return (
                                 <button
                                   key={j}
                                   className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${isSelected ? 'border-pri bg-pri/10 scale-105' : 'border-white/10 bg-black/40 hover:border-white/30'}`}
                                   onClick={() => setSelectedCustomOptions({...selectedCustomOptions, [opt.title]: choiceName})}
                                 >
                                   {choiceImg && <img src={choiceImg} className="w-12 h-12 object-cover rounded-xl" />}
                                   <span className={`text-sm font-bold ${isSelected ? 'text-pri' : 'text-gray-300'}`}>{choiceName}</span>
                                 </button>
                               );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shipping Info - AliExpress Style */}
                  <div className="mb-8 p-6 bg-white/5 rounded-[30px] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                           <Truck className="w-5 h-5 text-green-500" />
                         </div>
                         <span className="text-white font-bold">משלוח חינם</span>
                       </div>
                       <span className="text-gray-500 text-xs">מעל ₪299</span>
                    </div>
                  </div>

                  {selectedProduct.stock === 0 || selectedProduct.inS === 'false' ? (
                    <div className="bg-acc/10 border-2 border-acc/30 p-10 rounded-[40px] text-center mb-8">
                      <AlertTriangle className="w-16 h-16 text-acc mx-auto mb-4" />
                      <h3 className="text-4xl font-display font-black text-acc mb-2">אזל מהמלאי</h3>
                      <p className="text-gray-400 text-lg">מוצר זה אינו זמין כרגע לרכישה. נסה שוב מאוחר יותר.</p>
                    </div>
                  ) : selectedProduct.hideAddToCart ? (
                    <div className="bg-white/5 border-2 border-white/10 p-10 rounded-[40px] text-center mb-8">
                      <h3 className="text-4xl font-display font-black text-white/50 mb-2">תצוגה בלבד</h3>
                      <p className="text-gray-400 text-lg">מוצר זה אינו זמין לרכישה.</p>
                    </div>
                  ) : (
                    <>
                      <div className="qty-selector flex items-center justify-between bg-black/60 p-4 rounded-3xl border border-white/10 mb-8">
                        <span className="text-gray-500 font-black text-xl mr-4">כמות:</span>
                        <div className="flex items-center gap-6">
                          <button onClick={() => setTempQty(Math.max(1, tempQty - 1))} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl font-black hover:bg-white/10">-</button>
                          <span className="text-5xl font-display font-black w-16 text-center">{tempQty}</span>
                          <button onClick={() => setTempQty(tempQty + 1)} className="w-14 h-14 rounded-2xl bg-pri/20 text-pri flex items-center justify-center text-3xl font-black hover:bg-pri/30">+</button>
                        </div>
                      </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-6 md:py-8 text-2xl md:text-3xl rounded-[30px] font-black transition-all shadow-[0_20px_50px_rgba(249,115,22,0.3)] flex items-center justify-center gap-4"
                          onClick={() => {
                            addToCart(selectedProduct, tempQty);
                            setActivePage('cart');
                          }}
                        >
                          קנה עכשיו <ArrowLeft className="w-8 h-8" />
                        </button>
                        <button 
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-6 md:py-8 text-2xl md:text-3xl rounded-[30px] font-black transition-all border border-white/10 flex items-center justify-center gap-4"
                          onClick={() => addToCart(selectedProduct, tempQty)}
                        >
                          הוסף לסל <ShoppingBag className="w-8 h-8" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {editingRev && (
          <div className="modal show items-center p-4" onClick={() => setEditingRev(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mod-content max-w-md w-full p-8 rounded-[40px] border-2 border-pri"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-white mb-6 text-center">עריכת ביקורת</h3>
              <div className="space-y-4">
                <select 
                  className="w-full bg-black/60 border-white/10 rounded-2xl py-4 px-6 text-xl font-bold"
                  value={editingRev.s}
                  onChange={(e) => setEditingRev({...editingRev, s: Number(e.target.value)})}
                >
                  <option value="5">⭐⭐⭐⭐⭐ מדהים!</option>
                  <option value="4">⭐⭐⭐⭐ טוב מאוד</option>
                  <option value="3">⭐⭐⭐ בסדר</option>
                  <option value="2">⭐⭐ טעון שיפור</option>
                  <option value="1">⭐ אכזבה</option>
                </select>
                <textarea 
                  className="w-full bg-black/60 border-white/10 rounded-2xl py-5 px-6 text-lg h-40 resize-none"
                  value={editingRev.t}
                  onChange={(e) => setEditingRev({...editingRev, t: e.target.value})}
                />
                <div className="flex gap-3 pt-4">
                  <button 
                    className="flex-1 btn-main py-4"
                    onClick={() => {
                      handlePostReview(editingRev.t, editingRev.s, editingRev.id, editingRev.img);
                      setEditingRev(null);
                    }}
                  >
                    עדכן ביקורת
                  </button>
                  <button 
                    className="flex-1 bg-white/10 text-white rounded-2xl font-black hover:bg-white/20 transition-all"
                    onClick={() => setEditingRev(null)}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {reviewToDelete && (
          <div className="modal show items-center p-4" onClick={() => setReviewToDelete(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mod-content max-w-md w-full text-center p-10 rounded-[40px] border-2 border-acc"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle className="w-20 h-20 text-acc mx-auto mb-6" />
              <h3 className="text-3xl font-black text-white mb-4">מחיקת ביקורת</h3>
              <p className="text-gray-400 text-lg mb-10 font-bold">האם אתה בטוח שברצונך להעביר את הביקורת לסל המחזור?</p>
              <div className="flex gap-4">
                <button 
                  className="flex-1 py-4 bg-acc text-white rounded-2xl font-black hover:bg-acc/80 transition-all"
                  onClick={() => {
                    const r = reviews.find(rev => rev.id === reviewToDelete);
                    if (r) {
                      set(ref(db, `trash/reviews/${reviewToDelete}`), r);
                    }
                    remove(ref(db, `reviews/${reviewToDelete}`));
                    setReviewToDelete(null);
                  }}
                >
                  כן, מחק
                </button>
                <button 
                  className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black hover:bg-white/20 transition-all"
                  onClick={() => setReviewToDelete(null)}
                >
                  ביטול
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {orderToEdit && (
          <div className="modal show items-center p-4" onClick={() => setOrderToEdit(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mod-content max-w-md w-full p-8 rounded-[40px] border-2 border-pri"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-white mb-6 text-center">עריכת פרטי הזמנה #{orderToEdit.id.replace('SC-', '')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold mb-1 block">שם לקוח:</label>
                  <input 
                    className="bg-black/60 border-white/10"
                    value={orderToEdit.name}
                    onChange={(e) => setOrderToEdit({...orderToEdit, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold mb-1 block">טלפון:</label>
                  <input 
                    className="bg-black/60 border-white/10"
                    value={orderToEdit.phone}
                    onChange={(e) => setOrderToEdit({...orderToEdit, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold mb-1 block">כתובת:</label>
                  <input 
                    className="bg-black/60 border-white/10"
                    value={orderToEdit.address}
                    onChange={(e) => setOrderToEdit({...orderToEdit, address: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    className="flex-1 btn-main py-4"
                    onClick={() => {
                      update(ref(db, `orders/${orderToEdit.id}`), {
                        name: orderToEdit.name,
                        phone: orderToEdit.phone,
                        address: orderToEdit.address
                      });
                      setOrderToEdit(null);
                    }}
                  >
                    שמור שינויים
                  </button>
                  <button 
                    className="flex-1 bg-white/10 text-white rounded-2xl font-black hover:bg-white/20 transition-all"
                    onClick={() => setOrderToEdit(null)}
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {orderToDelete && (
          <div className="modal show items-center p-4" onClick={() => setOrderToDelete(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mod-content max-w-md w-full text-center p-10 rounded-[40px] border-2 border-acc"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertTriangle className="w-20 h-20 text-acc mx-auto mb-6" />
              <h3 className="text-3xl font-black text-white mb-4">מחיקת הזמנה</h3>
              <p className="text-gray-400 text-lg mb-10 font-bold">האם אתה בטוח שברצונך להעביר את ההזמנה לסל המחזור?</p>
              <div className="flex gap-4">
                <button 
                  className="flex-1 py-4 bg-acc text-white rounded-2xl font-black hover:bg-acc/80 transition-all"
                  onClick={() => {
                    const o = orders.find(ord => ord.id === orderToDelete);
                    if (o) {
                      set(ref(db, `trash/orders/${orderToDelete}`), o);
                    }
                    remove(ref(db, `orders/${orderToDelete}`));
                    setOrderToDelete(null);
                  }}
                >
                  כן, העבר לסל מחזור
                </button>
                <button 
                  className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black hover:bg-white/20 transition-all"
                  onClick={() => setOrderToDelete(null)}
                >
                  ביטול
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showCheckoutModal && (
          <div className="modal show items-center p-4" onClick={() => { setShowCheckoutModal(false); setCheckoutStep('form'); }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mod-content max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-mod" onClick={() => { setShowCheckoutModal(false); setCheckoutStep('form'); }}><X /></button>
              <h3 className="text-4xl font-display font-black text-center mb-10 flex items-center justify-center gap-4">
                <Lock className="text-pri w-10 h-10" /> קופה מאובטחת
              </h3>

              {checkoutError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl text-red-500 font-bold text-center text-sm mb-6"
                >
                  {checkoutError}
                </motion.div>
              )}

              {checkoutStep === 'form' ? (
                <>
                  <div className="bg-pri/5 border-r-8 border-pri p-8 rounded-3xl flex justify-between items-center mb-10">
                    <div className="text-right">
                      <div className="text-gray-400 text-sm font-bold">סה"כ לתשלום (כולל משלוח):</div>
                      <div className="text-pri font-display text-6xl font-black">₪{cartTotal + (settings.shippingCost || 0)}</div>
                    </div>
                    <div className="text-left py-2 px-4 bg-pri text-black rounded-xl font-black text-xs">קנייה בטוחה</div>
                  </div>

                  <div className="mb-10 max-h-40 overflow-y-auto space-y-3 bg-white/5 p-4 rounded-3xl border border-white/10 scrollbar-thin scrollbar-thumb-pri text-right" dir="rtl">
                    {cart.map(item => {
                      const cartId = getCartId(item);
                      const displayImg = item.selectedVariant?.img || item.img;
                      return (
                        <div key={cartId} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            <img src={displayImg} className="w-10 h-10 object-cover rounded-lg border border-white/10" referrerPolicy="no-referrer" />
                            <div className="flex flex-col">
                              <span className="text-white font-bold">{item.name} <span className="text-gray-500 font-normal">x{item.qty}</span></span>
                              {item.selectedVariant && <span className="text-pri text-[10px] font-black">{item.selectedVariant.name}</span>}
                              {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                <span className="text-gray-400 text-[10px]">
                                  {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-pri font-black">₪{(Number(item.selectedVariant?.price ?? item.price)) * item.qty}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-6">
                    <input 
                      placeholder="שם ושם משפחה מלא (עבור ההזמנה)"
                      className="bg-black/60 border-white/10 py-5 text-right"
                      dir="rtl"
                      value={checkoutData.name}
                      onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})}
                    />
                    <input 
                      type="tel"
                      placeholder="מספר נייד ליצירת קשר"
                      className="bg-black/60 border-white/10 py-5 text-right"
                      dir="rtl"
                      value={checkoutData.phone}
                      onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value})}
                    />
                    <div className="flex gap-6">
                      <input 
                        placeholder="עיר"
                        className="bg-black/60 border-white/10 py-5 flex-1 text-right"
                        dir="rtl"
                        value={checkoutData.city}
                        onChange={(e) => setCheckoutData({...checkoutData, city: e.target.value})}
                      />
                      <input 
                        placeholder="רחוב ומספר בית"
                        className="bg-black/60 border-white/10 py-5 flex-[2] text-right"
                        dir="rtl"
                        value={checkoutData.street}
                        onChange={(e) => setCheckoutData({...checkoutData, street: e.target.value})}
                      />
                    </div>
                    <label className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-8 h-8 accent-pri"
                        checked={checkoutData.terms}
                        onChange={(e) => setCheckoutData({...checkoutData, terms: e.target.checked})}
                      />
                      <span className="text-lg text-gray-300">אני מסכים/ה ל<button onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-pri underline">תקנון האתר</button></span>
                    </label>

                    <button 
                      className="btn-main py-8 text-3xl mt-6 shadow-[0_0_50px_rgba(0,240,255,0.4)]"
                      onClick={() => {
                        setCheckoutError(null);
                        const nameStr = checkoutData.name ? checkoutData.name.trim() : '';
                        const phoneClean = checkoutData.phone ? checkoutData.phone.replace(/[\s-]/g, '') : '';
                        if (nameStr.length < 2) {
                          setCheckoutError('אנא הזן שם מלא תקין (לפחות 2 אותיות)');
                          return;
                        }
                        if (phoneClean.length < 9 || phoneClean.length > 15 || !/^\d+$/.test(phoneClean)) {
                          setCheckoutError('אנא הזן מספר טלפון תקין (רק ספרות, לפחות 9)');
                          return;
                        }
                        if (!checkoutData.city.trim() || !checkoutData.street.trim()) {
                          setCheckoutError('אנא מלא כתובת מלאה (עיר ורחוב)');
                          return;
                        }
                        if (!checkoutData.terms) {
                          setCheckoutError('עליך לאשר את תקנון האתר');
                          return;
                        }
                        setCheckoutStep('payment');
                      }}
                    >
                      המשך לבחירת תשלום <ArrowLeft className="w-8 h-8" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center">
                    <h4 className="text-2xl font-black text-white mb-2">בחר אמצעי תשלום</h4>
                    <p className="text-gray-400">ההזמנה תישלח לאחר בחירת התשלום</p>
                  </div>

                  <div className="bg-pri/5 border-r-8 border-pri p-8 rounded-3xl flex justify-between items-center mb-6">
                    <div className="text-right">
                      <div className="text-gray-400 text-sm font-bold">סה"כ לתשלום:</div>
                      <div className="text-pri font-display text-5xl font-black">₪{cartTotal + (settings.shippingCost || 0)}</div>
                    </div>
                    <div className="text-left">
                      <p className="text-[12px] text-acc font-black uppercase tracking-widest leading-tight">חובה לציין מספר הזמנה!<br/>אחרת הכסף לא יוחזר</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {!settings.paypalOnlyMode && (
                      <>
                        <button 
                          onClick={() => { setSelectedPaymentMethod('פייבוקס'); setConfirmPlacement(true); }}
                          className={`flex items-center justify-between gap-4 p-6 rounded-3xl border-2 transition-all ${selectedPaymentMethod === 'פייבוקס' ? 'bg-[#1ED2C8]/20 border-[#1ED2C8] scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-[#1ED2C8] p-3 rounded-xl shadow-lg"><Wallet className="w-6 h-6 text-white" /></div>
                            <span className="text-white font-black text-xl">בשביל פייבוקס לחצו כאן</span>
                          </div>
                          {selectedPaymentMethod === 'פייבוקס' && <CheckCircle className="text-[#1ED2C8] w-8 h-8" />}
                        </button>
                        <button 
                          onClick={() => { setSelectedPaymentMethod('Bit'); setConfirmPlacement(true); }}
                          className={`flex items-center justify-between gap-4 p-6 rounded-3xl border-2 transition-all ${selectedPaymentMethod === 'Bit' ? 'bg-[#003087]/20 border-[#003087] scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-[#003087] p-3 rounded-xl shadow-lg"><CreditCard className="w-6 h-6 text-white" /></div>
                            <span className="text-white font-black text-xl">בשביל ביט לחצו כאן</span>
                          </div>
                          {selectedPaymentMethod === 'Bit' && <CheckCircle className="text-[#003087] w-8 h-8" />}
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => { setSelectedPaymentMethod('PayPal'); setConfirmPlacement(true); }}
                      className={`flex items-center justify-between gap-4 p-6 rounded-3xl border-2 transition-all ${selectedPaymentMethod === 'PayPal' ? 'bg-[#00457C]/20 border-[#00457C] scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-[#00457C] p-3 rounded-xl shadow-lg"><Wallet className="w-6 h-6 text-white" /></div>
                        <span className="text-white font-black text-xl">בשביל פייפאל לחצו כאן</span>
                      </div>
                      {selectedPaymentMethod === 'PayPal' && <CheckCircle className="text-[#00457C] w-8 h-8" />}
                    </button>
                  </div>

                  {confirmPlacement && (
                    <motion.button 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`btn-main py-8 text-4xl mt-12 shadow-[0_0_50px_rgba(0,240,255,0.4)] relative overflow-hidden group ${isPlacingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-pri via-white/40 to-pri opacity-0 group-hover:opacity-20 transition-opacity translate-x-[-100%] group-hover:translate-x-[100%] duration-1000" />
                      {isPlacingOrder ? 'מבצע הזמנה...' : <>בצע הזמנה ושלם <ShieldCheck className="w-10 h-10" /></>}
                    </motion.button>
                  )}

                  <button 
                    onClick={() => setCheckoutStep('form')}
                    className="w-full py-4 text-gray-500 font-bold hover:text-white transition-colors"
                  >
                    חזור לפרטי משלוח
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {showSuccessModal && (
          <div className="modal show items-center p-0 md:p-4" onClick={() => setShowSuccessModal(false)}>
            <motion.div 
              initial={{ scale: 1, y: '100%' }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 1, y: '100%' }}
              className="mod-content max-w-lg text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-mod z-50 transition-transform active:scale-95" onClick={() => setShowSuccessModal(false)}><X /></button>
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black mb-2">ההזמנה נשלחה!</h2>
              <p className="text-gold font-black text-xl mb-6">ההזמנה שלך #{lastOrderId.replace('SC-', '')} נקלטה ושמורה במערכת! ✅</p>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed px-4">לחץ מטה כדי לבצע תשלום מיידי, או שתשלם מאוחר יותר דרך דף "ההזמנות שלי".</p>
              
              <div className="bg-black/80 p-8 md:p-10 border-2 border-pri/30 rounded-[50px] mb-8 relative group shadow-2xl">
                {lastOrderTotal > 0 && (
                  <div className="text-6xl md:text-8xl font-display font-black text-white mb-8 flex items-center justify-center gap-4">
                    <span className="text-pri/50">₪</span>{lastOrderTotal}
                  </div>
                )}
                
                {!showPaymentOptions ? (
                  <button 
                    onClick={() => setShowPaymentOptions(true)}
                    className="btn-main py-6 text-2xl font-black shadow-[0_0_30px_rgba(0,240,255,0.4)]"
                  >
                    מעבר לתשלום <ArrowRight className="w-8 h-8" />
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 gap-6"
                  >
                    <div className="bg-acc/20 border-2 border-acc p-6 rounded-[30px] mb-6 text-white text-center shadow-[0_0_30px_rgba(255,0,85,0.2)]">
                      <AlertTriangle className="w-12 h-12 text-acc mx-auto mb-4 animate-bounce" />
                      <div className="text-xl font-black mb-2">אזהרה חשובה!</div>
                      <div className="text-3xl font-black text-acc mb-2 flex items-center justify-center gap-3">
                        חובה לציין מספר הזמנה: 
                        <span 
                          className="text-white underline decoration-wavy cursor-pointer hover:text-pri transition-colors bg-white/10 px-3 py-1 rounded-xl border border-white/20 select-all"
                          onClick={(e) => {
                            navigator.clipboard.writeText(lastOrderId.replace('SC-', ''));
                            const target = e.currentTarget;
                            const originalText = lastOrderId.replace('SC-', '');
                            target.innerText = 'הועתק! ✅';
                            setTimeout(() => target.innerText = originalText, 2000);
                          }}
                          title="לחץ להעתקה"
                        >
                          {lastOrderId.replace('SC-', '')}
                        </span>
                      </div>
                      <div className="text-xl font-bold mb-4">בפרטי התשלום (תיאור ההעברה הבנקאית)</div>
                      <p className="text-lg font-bold leading-relaxed text-gray-200 bg-black/40 p-4 rounded-2xl border border-acc/30">
                        לקוח יקר, ללא ציון מספר הזמנה בתיאור ההעברה (בביט/פייבוקס/פייפאל) <br/>
                        <span className="text-acc underline font-black">לא נוכל לשייך את התשלום ולא נחזיר את הכסף!</span>
                      </p>
                    </div>

                    <div className="bg-pri/10 border-2 border-pri/30 p-6 rounded-[30px] mb-4 text-white">
                      <div className="text-sm font-bold text-gray-400 mb-1">סה"כ לתשלום:</div>
                      <div className="text-4xl font-black text-pri">₪{lastOrderTotal}</div>
                    </div>

                    <h4 className="text-xl font-black text-white mb-2">
                       {lastOrderPaymentMethod === 'כללי' || !lastOrderPaymentMethod ? 'אפשרויות לתשלום' : 'השלם תשלום לחץ כאן:'}
                    </h4>
                    
                    {/* PayBox Button */}
                    {(lastOrderPaymentMethod === 'פייבוקס' || lastOrderPaymentMethod === 'כללי' || !lastOrderPaymentMethod) && (
                    <button 
                      onClick={() => {
                        if (settings.payboxLink) window.open(settings.payboxLink, '_blank');
                        else setAlertMessage('קישור ה-PayBox עדיין לא הוגדר על ידי המנהל.');
                      }} 
                      className="flex items-center justify-between gap-4 bg-linear-to-r from-blue-600 to-blue-800 p-6 rounded-[30px] text-xl font-black border-2 border-blue-400/50 hover:scale-105 transition-all shadow-xl group/btn w-full"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-xl"><Wallet className="w-6 h-6 text-white" /></div>
                        <span className="text-white">להשלמת קנייה פייבוקס לחצו כאן</span>
                      </div>
                      <ArrowLeft className="w-6 h-6 text-white group-hover/btn:translate-x-[-5px] transition-transform" />
                    </button>
                    )}

                    {/* Bit Button */}
                    {(lastOrderPaymentMethod === 'Bit' || lastOrderPaymentMethod === 'כללי' || !lastOrderPaymentMethod) && (
                    <button 
                      onClick={() => {
                        if (settings.bitLink) window.open(settings.bitLink, '_blank');
                        else setAlertMessage('קישור ה-Bit עדיין לא הוגדר על ידי המנהל.');
                      }} 
                      className="flex items-center justify-between gap-4 bg-linear-to-r from-blue-400 to-blue-600 p-6 rounded-[30px] text-xl font-black border-2 border-blue-200/50 hover:scale-105 transition-all shadow-xl text-white group/btn w-full"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-xl"><CreditCard className="w-6 h-6 text-white" /></div>
                        <span>להשלמת קנייה ביט לחצו כאן</span>
                      </div>
                      <ArrowLeft className="w-6 h-6 text-white group-hover/btn:translate-x-[-5px] transition-transform" />
                    </button>
                    )}

                    {/* PayPal Button */}
                    {(lastOrderPaymentMethod === 'PayPal' || lastOrderPaymentMethod === 'כללי' || !lastOrderPaymentMethod) && (
                    <button 
                      onClick={() => {
                        if (settings.paypalLink) window.open(settings.paypalLink, '_blank');
                        else setAlertMessage('קישור ה-PayPal עדיין לא הוגדר על ידי המנהל.');
                      }} 
                      className="flex items-center justify-between gap-4 bg-linear-to-r from-[#003087] to-[#0070ba] p-6 rounded-[30px] text-xl font-black border-2 border-[#009cde]/50 hover:scale-105 transition-all shadow-xl text-white group/btn w-full mt-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-xl"><img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" className="h-6" /></div>
                        <span>להשלמת קנייה פייפאל לחצו כאן</span>
                      </div>
                      <ArrowLeft className="w-6 h-6 text-white group-hover/btn:translate-x-[-5px] transition-transform" />
                    </button>
                    )}
                  </motion.div>
                )}
              </div>
              <button 
                className="bg-white/10 hover:bg-white/20 border-2 border-white/20 w-full py-5 rounded-[30px] font-black text-xl transition-all text-white flex items-center justify-center gap-3 shadow-lg"
                onClick={() => { 
                  setShowSuccessModal(false); 
                  setActivePage('orders'); 
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                סיום ומעבר להזמנות שלי <Box className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}

        {showAddProdModal && (
          <div className="modal show items-center p-4" onClick={() => setShowAddProdModal(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mod-content max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-mod" onClick={() => setShowAddProdModal(false)}><X /></button>
              <h3 className="text-4xl font-display font-black text-pri mb-10 flex items-center gap-4">
                <Package className="w-10 h-10" /> הקמת מוצר לקטלוג
              </h3>
              <div className="space-y-6">
                <input 
                  placeholder="שם המוצר"
                  className="bg-black/60 border-white/10 py-4"
                  value={newProdData.name}
                  onChange={(e) => setNewProdData({...newProdData, name: e.target.value})}
                />
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-2 block">מלאי (1- למלאי אינסופי)</label>
                    <input 
                      type="number"
                      placeholder="כמות במלאי"
                      className="bg-black/60 border-white/10 py-4"
                      value={newProdData.stock}
                      onChange={(e) => setNewProdData({...newProdData, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-2 block">מוצר לתצוגה בלבד (הסתר הוספה לסל)</label>
                    <label className="flex items-center gap-2 bg-black/60 border-white/10 py-4 px-4 rounded-2xl cursor-pointer">
                      <input 
                        type="checkbox"
                        className="w-5 h-5 accent-pri"
                        checked={newProdData.hideAddToCart || false}
                        onChange={(e) => setNewProdData({...newProdData, hideAddToCart: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-white">תצוגה בלבד</span>
                    </label>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-2 block">קטגוריה</label>
                    <select 
                      className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-6 text-xl font-bold h-full max-h-[62px]"
                      value={newProdData.category}
                      onChange={(e) => setNewProdData({...newProdData, category: e.target.value})}
                    >
                      <option value="">בחר קטגוריה</option>
                      {Array.from(new Set(categories)).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <textarea 
                    placeholder="מפרט טכני..."
                    className="bg-black/60 border-white/10 h-40 w-full rounded-2xl p-4 text-white resize-none"
                    value={newProdData.desc}
                    onChange={(e) => setNewProdData({...newProdData, desc: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); generateDescription(newProdData.name, newProdData.desc || '', (desc) => setNewProdData({...newProdData, desc})); }}
                    disabled={isGeneratingDesc || !newProdData.name}
                    className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2 z-10"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isGeneratingDesc ? 'מייצר...' : 'ייצר מפרט מקצועי עם AI'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                   <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">מחיר מכירה לקוח ₪</label>
                    <input 
                      type="number"
                      placeholder="₪"
                      className="bg-black/60 border-pri/30 py-4"
                      value={newProdData.price}
                      onChange={(e) => setNewProdData({...newProdData, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">מחיר קנייה (נטו - רק אתה רואה) ₪</label>
                    <input 
                      type="number"
                      placeholder="₪"
                      className="bg-black/60 border-gold/30 py-4"
                      value={newProdData.costPrice}
                      onChange={(e) => setNewProdData({...newProdData, costPrice: Number(e.target.value)})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-2 block">קישור לאתר הספק (לדרופשיפינג - רק אתה רואה)</label>
                    <input 
                      type="url"
                      placeholder="https://..."
                      className="bg-black/60 border-white/10 py-4"
                      value={newProdData.sourceLink}
                      onChange={(e) => setNewProdData({...newProdData, sourceLink: e.target.value})}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">מחיר לפני הנחה ₪</label>
                    <input 
                      type="number"
                      placeholder="₪"
                      className="bg-black/60 border-white/10 py-4"
                      value={newProdData.oldPrice}
                      onChange={(e) => setNewProdData({...newProdData, oldPrice: e.target.value})}
                    />
                  </div>
                   <div>
                    <label className="text-xs font-bold text-gray-500 mb-2 block">עלות משלוח למוצר ₪</label>
                    <input 
                      type="number"
                      placeholder="₪"
                      className="bg-black/60 border-white/10 py-4"
                      value={newProdData.shippingCost}
                      onChange={(e) => setNewProdData({...newProdData, shippingCost: Number(e.target.value)})}
                    />
                  </div>
                </div>
                {/* Image Section in Add Modal */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-white">תמונות המוצר (לחיצה להוספה)</label>
                    <span className="text-[10px] text-gray-500 font-bold">תמונה ראשונה תוצג בקטלוג</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="relative group w-32 h-32 flex-shrink-0 bg-black/40 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-2 hover:border-pri/40 transition-all">
                      {newProdData.img ? (
                        <>
                          <img src={newProdData.img} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          <button className="absolute -top-2 -right-2 bg-acc p-1 rounded-full shadow-lg" onClick={() => setNewProdData({...newProdData, img: ''})}><X className="w-3 h-3" /></button>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                          <Plus className="w-8 h-8 text-pri mb-1" />
                          <span className="text-[10px] font-bold uppercase">ראשי</span>
                          <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => setNewProdData({...newProdData, img: url}))} />
                        </label>
                      )}
                    </div>
                    {[0,1,2,3].map(i => (
                      <div key={i} className="relative group w-32 h-32 flex-shrink-0 bg-black/40 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-2 hover:border-white/20 transition-all">
                        {newProdData.extraImages?.[i] ? (
                          <>
                            <img src={newProdData.extraImages[i]} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            <button className="absolute -top-2 -right-2 bg-acc p-1 rounded-full shadow-lg" onClick={() => {
                              const list = [...(newProdData.extraImages || [])];
                              list.splice(i, 1);
                              setNewProdData({...newProdData, extraImages: list});
                            }}><X className="w-3 h-3" /></button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-600 mb-1" />
                            <span className="text-[10px] font-bold uppercase">נוספת {i+1}</span>
                            <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => {
                              const list = [...(newProdData.extraImages || [])];
                              list[i] = url;
                              setNewProdData({...newProdData, extraImages: list});
                            })} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-black text-white">וריאציות (דגמים/צבעים)</label>
                    <input 
                      placeholder="תווית (למשל: בחר דגם)"
                      className="bg-black/40 border-white/10 py-1 px-3 text-xs w-40"
                      value={newProdData.variantLabel}
                      onChange={(e) => setNewProdData({...newProdData, variantLabel: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3 mb-4">
                    <input 
                      id="var-name-add"
                      placeholder="שם האופציה (למשל: iPhone 15)"
                      className="bg-black/60 border-white/10 py-3 text-sm w-full"
                    />
                    <div className="flex gap-2">
                      <input 
                        id="var-price-add"
                        type="number"
                        placeholder="מחיר (אופציונלי)"
                        className="bg-black/60 border-white/10 py-3 text-sm flex-1"
                      />
                      <input 
                        id="var-img-add"
                        placeholder="URL תמונה (אופציונלי)"
                        className="bg-black/60 border-white/10 py-3 text-sm flex-1"
                      />
                    </div>
                    <button 
                      className="w-full bg-pri text-black py-3 rounded-2xl font-black transition-all active:scale-95"
                      onClick={() => {
                        const nameEl = document.getElementById('var-name-add') as HTMLInputElement;
                        const priceEl = document.getElementById('var-price-add') as HTMLInputElement;
                        const imgEl = document.getElementById('var-img-add') as HTMLInputElement;
                        if (!nameEl.value) { setAlertMessage('אנא הכנס שם אופציה'); return; }
                        const v: ProductVariant = { 
                          id: Math.random().toString(36).substr(2, 9), 
                          name: nameEl.value
                        };
                        if (priceEl.value) v.price = Number(priceEl.value);
                        if (imgEl.value) v.img = imgEl.value;
                        setNewProdData({...newProdData, variants: [...(Array.isArray(newProdData.variants) ? newProdData.variants : Object.values(newProdData.variants || [])), v]});
                        nameEl.value = '';
                        priceEl.value = '';
                        imgEl.value = '';
                      }}
                    >
                      הוסף וריאציה
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Array.isArray(newProdData.variants) ? newProdData.variants : Object.values(newProdData.variants || [])).map((v: any, i: number) => {
                      const updateVariant = (key: string, value: any) => {
                        const list = [...(Array.isArray(newProdData.variants) ? newProdData.variants : Object.values(newProdData.variants || []))];
                        list[i] = { ...list[i], [key]: value };
                        setNewProdData({...newProdData, variants: list});
                      };
                      return (
                        <div key={v.id || i} className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col gap-3 relative group">
                          <div className="flex items-center gap-2">
                             <div className="shrink-0 flex items-center gap-1">
                               <label className="cursor-pointer relative block" title="העלה תמונה למכשיר">
                                 <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                                   {v.img ? <img src={v.img} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                                 </div>
                                 <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => updateVariant('img', url))} />
                               </label>
                               <button 
                                 type="button"
                                 title="בחר מהגלריה של המוצר"
                                 className="bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                 onClick={(e) => { e.preventDefault(); setGallerySelectorConfig({ active: true, availableImages: [newProdData.img, ...(newProdData.extraImages || [])].filter(Boolean) as string[], onSelect: (url) => updateVariant('img', url) }); }}
                               >
                                 <Images className="w-4 h-4 text-pri" />
                               </button>
                             </div>
                             <div className="flex flex-col gap-1 w-full">
                               <input 
                                 className="text-xs font-bold text-white bg-transparent border-b border-white/10 focus:border-pri outline-none w-full" 
                                 value={v.name} 
                                 placeholder="שם וריאציה"
                                 onChange={(e) => updateVariant('name', e.target.value)}
                               />
                               <div className="flex items-center text-[10px] text-gold w-full gap-1">
                                 ₪
                                 <input 
                                   className="bg-transparent border-b border-white/10 focus:border-pri outline-none w-full text-gold" 
                                   value={v.price || ''} 
                                   placeholder="מחיר (אופציונלי)"
                                   type="number"
                                   onChange={(e) => updateVariant('price', e.target.value ? Number(e.target.value) : undefined)}
                                 />
                               </div>
                             </div>
                          </div>
                          <button 
                            className="absolute top-1 left-1 p-1 bg-red-500/20 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              const prev = Array.isArray(newProdData.variants) ? newProdData.variants : Object.values(newProdData.variants || []);
                              const list = prev.filter((x: any) => x.id !== v.id);
                              setNewProdData({...newProdData, variants: list});
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-black text-white">אפשרויות בחירה נוספות (צבע, חומר וכד')</label>
                  </div>
                  <div className="space-y-3 mb-4 bg-white/5 p-4 rounded-2xl">
                    <input 
                      id="opt-title-add"
                      placeholder="שם האופציה (למשל: צבע או חומר)"
                      className="bg-black/60 border-white/10 py-3 text-sm w-full"
                    />
                    <input 
                      id="opt-choices-add"
                      placeholder="אפשרויות מופרדות בפסיק (למשל: אדום, כחול, ירוק)"
                      className="bg-black/60 border-white/10 py-3 text-sm w-full"
                    />
                    <button 
                      className="w-full bg-white/10 hover:bg-pri text-white hover:text-black py-3 rounded-2xl font-black transition-all active:scale-95"
                      onClick={() => {
                        const titleEl = document.getElementById('opt-title-add') as HTMLInputElement;
                        const choicesEl = document.getElementById('opt-choices-add') as HTMLInputElement;
                        if (!titleEl.value || !choicesEl.value) return;
                        const choices = choicesEl.value.split(',').map(s => ({ name: s.trim() })).filter(c => Boolean(c.name));
                        if (choices.length === 0) return;
                        setNewProdData({
                          ...newProdData, 
                          customOptions: [...(newProdData.customOptions || []), { title: titleEl.value, choices }]
                        });
                        titleEl.value = '';
                        choicesEl.value = '';
                      }}
                    >
                      הוסף אפשרויות בחירה
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(newProdData.customOptions || []).map((opt, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                           <input 
                             className="text-sm font-bold text-white bg-transparent border-b border-white/20 focus:border-pri outline-none pb-1"
                             value={opt.title}
                             onChange={(e) => {
                               const list = [...(newProdData.customOptions || [])];
                               list[i].title = e.target.value;
                               setNewProdData({...newProdData, customOptions: list});
                             }}
                           />
                           <button 
                             className="p-2 bg-red-500/20 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all"
                             onClick={() => {
                               const list = [...(newProdData.customOptions || [])];
                               list.splice(i, 1);
                               setNewProdData({...newProdData, customOptions: list});
                             }}
                           >
                             <X className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {opt.choices.map((c, j) => {
                              const choiceName = typeof c === 'string' ? c : c.name;
                              const choiceImg = c.img;
                              return (
                                <div key={j} className="flex items-center gap-2 bg-black/40 border border-white/10 p-2 rounded-lg">
                                  {choiceImg && <img src={choiceImg} className="w-6 h-6 object-cover rounded-md" referrerPolicy="no-referrer" />}
                                  <input 
                                    className="bg-transparent text-xs text-white outline-none w-20 px-1"
                                    value={choiceName}
                                    placeholder="שם (כחול)"
                                    onChange={(e) => {
                                       const list = [...(newProdData.customOptions || [])];
                                       const oldChoices = [...list[i].choices];
                                       const oldChoice = oldChoices[j];
                                       oldChoices[j] = typeof oldChoice === 'string' ? { name: e.target.value } : { ...oldChoice, name: e.target.value };
                                       list[i].choices = oldChoices;
                                       setNewProdData({...newProdData, customOptions: list});
                                    }}
                                  />
                                  <label className="cursor-pointer text-gray-400 hover:text-white" title="העלה תמונה">
                                    <ImageIcon className="w-4 h-4" />
                                    <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => {
                                       const list = [...(newProdData.customOptions || [])];
                                       const oldChoices = [...list[i].choices];
                                       const oldChoice = oldChoices[j];
                                       oldChoices[j] = typeof oldChoice === 'string' ? { name: oldChoice, img: url } : { ...oldChoice, img: url };
                                       list[i].choices = oldChoices;
                                       setNewProdData({...newProdData, customOptions: list});
                                    })} />
                                  </label>
                                  <button type="button" title="בחר מהגלריה של המוצר" className="text-gray-400 hover:text-white" onClick={(e) => { e.preventDefault(); setGallerySelectorConfig({
                                    active: true, 
                                    availableImages: [newProdData.img, ...(newProdData.extraImages || [])].filter(Boolean) as string[],
                                    onSelect: (url) => {
                                       const list = [...(newProdData.customOptions || [])];
                                       const oldChoices = [...list[i].choices];
                                       const oldChoice = oldChoices[j];
                                       oldChoices[j] = typeof oldChoice === 'string' ? { name: oldChoice, img: url } : { ...oldChoice, img: url };
                                       list[i].choices = oldChoices;
                                       setNewProdData({...newProdData, customOptions: list});
                                    }
                                  }); }}>
                                    <Images className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => {
                                       const list = [...(newProdData.customOptions || [])];
                                       const oldChoices = [...list[i].choices];
                                       oldChoices.splice(j, 1);
                                       list[i].choices = oldChoices;
                                       setNewProdData({...newProdData, customOptions: list});
                                  }} className="text-red-500 hover:text-white"><X className="w-3 h-3" /></button>
                                </div>
                              );
                           })}
                        </div>
                        <button onClick={() => {
                           const list = [...(newProdData.customOptions || [])];
                           list[i].choices = [...list[i].choices, { name: 'אופציה אישית' }];
                           setNewProdData({...newProdData, customOptions: list});
                        }} className="text-xs text-pri mt-1 text-right w-fit">+ הוסף בחירה פנימית</button>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn-main py-6 text-2xl mt-6" onClick={handleAddProduct}>
                  שגר לחנות <Rocket className="w-8 h-8" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showEditProdModal && editProdData && (
          <div className="modal show items-center p-0 md:p-4" onClick={() => setShowEditProdModal(false)}>
            <motion.div 
               initial={{ scale: 1, y: '100%' }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 1, y: '100%' }}
              className="mod-content max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-mod transition-transform active:scale-95" onClick={() => setShowEditProdModal(false)}><X /></button>
              <h3 className="text-2xl md:text-3xl font-display font-black text-white mb-6 md:mb-10 text-right pr-4 border-r-4 border-pri">עריכת מוצר: {editProdData.name}</h3>
              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                <input 
                  placeholder="שם המוצר"
                  className="bg-black/60 border-white/10 py-4"
                  value={editProdData.name}
                  onChange={(e) => setEditProdData({...editProdData, name: e.target.value})}
                />
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">מלאי (1- לאינסוף)</label>
                    <input 
                      type="number"
                      className="bg-black/60 border-white/10"
                      value={editProdData.stock}
                      onChange={(e) => setEditProdData({...editProdData, stock: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">תצוגה בלבד</label>
                    <label className="flex items-center gap-2 bg-black/60 border-white/10 py-4 px-4 rounded-xl cursor-pointer">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 accent-pri"
                        checked={editProdData.hideAddToCart || false}
                        onChange={(e) => setEditProdData({...editProdData, hideAddToCart: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-white">הסתר הוספה לסל</span>
                    </label>
                  </div>
                   <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">קטגוריה</label>
                    <select 
                      className="bg-black/60 border-white/10 h-[58px]"
                      value={editProdData.category}
                      onChange={(e) => setEditProdData({...editProdData, category: e.target.value})}
                    >
                      {Array.from(new Set(categories)).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <textarea 
                    placeholder="מפרט..."
                    className="bg-black/60 border-white/10 h-32 w-full rounded-2xl p-4 text-white resize-none"
                    value={editProdData.desc}
                    onChange={(e) => setEditProdData({...editProdData, desc: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); generateDescription(editProdData.name, editProdData.desc || '', (desc) => setEditProdData({...editProdData, desc})); }}
                    disabled={isGeneratingDesc || !editProdData.name}
                    className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2 z-10"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isGeneratingDesc ? 'מייצר...' : 'ייצר מפרט מקצועי עם AI'}
                  </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-black text-white">וריאציות (דגמים/צבעים)</label>
                    <input 
                      placeholder="תווית (למשל: בחר דגם)"
                      className="bg-black/40 border-white/10 py-1 px-3 text-xs w-40"
                      value={editProdData.variantLabel || 'בחר דגם'}
                      onChange={(e) => setEditProdData({...editProdData, variantLabel: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3 mb-4">
                    <input 
                      id="var-name-edit"
                      placeholder="שם האופציה (למשל: iPhone 15)"
                      className="bg-black/60 border-white/10 py-3 text-sm w-full"
                    />
                    <div className="flex gap-2">
                      <input 
                        id="var-price-edit"
                        type="number"
                        placeholder="מחיר (אופציונלי)"
                        className="bg-black/60 border-white/10 py-3 text-sm flex-1"
                      />
                      <input 
                        id="var-img-edit"
                        placeholder="URL תמונה (אופציונלי)"
                        className="bg-black/60 border-white/10 py-3 text-sm flex-1"
                      />
                    </div>
                    <button 
                      className="w-full bg-pri text-black py-3 rounded-2xl font-black transition-all active:scale-95"
                      onClick={() => {
                        const nameEl = document.getElementById('var-name-edit') as HTMLInputElement;
                        const priceEl = document.getElementById('var-price-edit') as HTMLInputElement;
                        const imgEl = document.getElementById('var-img-edit') as HTMLInputElement;
                        if (!nameEl.value) return;
                        const v: ProductVariant = { 
                          id: Math.random().toString(36).substr(2, 9), 
                          name: nameEl.value
                        };
                        if (priceEl.value) v.price = Number(priceEl.value);
                        if (imgEl.value) v.img = imgEl.value;
                        setEditProdData({...editProdData, variants: [...(Array.isArray(editProdData.variants) ? editProdData.variants : Object.values(editProdData.variants || [])), v]});
                        nameEl.value = '';
                        priceEl.value = '';
                        imgEl.value = '';
                      }}
                    >
                      הוסף וריאציה
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Array.isArray(editProdData.variants) ? editProdData.variants : Object.values(editProdData.variants || [])).map((v: any, i: number) => {
                      const updateVariant = (key: string, value: any) => {
                        const list = [...(Array.isArray(editProdData.variants) ? editProdData.variants : Object.values(editProdData.variants || []))];
                        list[i] = { ...list[i], [key]: value };
                        setEditProdData({...editProdData, variants: list});
                      };
                      return (
                        <div key={v.id || i} className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col gap-3 relative group">
                          <div className="flex items-center gap-2">
                             <div className="shrink-0 flex items-center gap-1">
                               <label className="cursor-pointer relative block" title="העלה תמונה למכשיר">
                                 <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                                   {v.img ? <img src={v.img} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                                 </div>
                                 <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => updateVariant('img', url))} />
                               </label>
                               <button 
                                 type="button"
                                 title="בחר מהגלריה של המוצר"
                                 className="bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                 onClick={(e) => { e.preventDefault(); setGallerySelectorConfig({ active: true, availableImages: [editProdData.img, ...(editProdData.extraImages || [])].filter(Boolean) as string[], onSelect: (url) => updateVariant('img', url) }); }}
                               >
                                 <Images className="w-4 h-4 text-pri" />
                               </button>
                             </div>
                             <div className="flex flex-col gap-1 w-full">
                               <input 
                                 className="text-xs font-bold text-white bg-transparent border-b border-white/10 focus:border-pri outline-none w-full" 
                                 value={v.name} 
                                 placeholder="שם וריאציה"
                                 onChange={(e) => updateVariant('name', e.target.value)}
                               />
                               <div className="flex items-center text-[10px] text-gold w-full gap-1">
                                 ₪
                                 <input 
                                   className="bg-transparent border-b border-white/10 focus:border-pri outline-none w-full text-gold" 
                                   value={v.price || ''} 
                                   placeholder="מחיר (אופציונלי)"
                                   type="number"
                                   onChange={(e) => updateVariant('price', e.target.value ? Number(e.target.value) : undefined)}
                                 />
                               </div>
                             </div>
                          </div>
                          <button 
                            className="absolute top-1 left-1 p-1 bg-red-500/20 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              const prev = Array.isArray(editProdData.variants) ? editProdData.variants : Object.values(editProdData.variants || []);
                              const list = prev.filter((x: any) => x.id !== v.id);
                              setEditProdData({...editProdData, variants: list});
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-black text-white">אפשרויות בחירה נוספות (צבע, חומר וכד')</label>
                  </div>
                  <div className="space-y-3 mb-4 bg-white/5 p-4 rounded-2xl">
                    <input 
                      id="opt-title-edit"
                      placeholder="שם האופציה (למשל: צבע או חומר)"
                      className="bg-black/60 border-white/10 py-3 text-sm w-full"
                    />
                    <input 
                      id="opt-choices-edit"
                      placeholder="אפשרויות מופרדות בפסיק (למשל: אדום, כחול, ירוק)"
                      className="bg-black/60 border-white/10 py-3 text-sm w-full"
                    />
                    <button 
                      className="w-full bg-white/10 hover:bg-pri text-white hover:text-black py-3 rounded-2xl font-black transition-all active:scale-95"
                      onClick={() => {
                        const titleEl = document.getElementById('opt-title-edit') as HTMLInputElement;
                        const choicesEl = document.getElementById('opt-choices-edit') as HTMLInputElement;
                        if (!titleEl.value || !choicesEl.value) return;
                        const choices = choicesEl.value.split(',').map(s => ({ name: s.trim() })).filter(c => Boolean(c.name));
                        if (choices.length === 0) return;
                        setEditProdData({
                          ...editProdData, 
                          customOptions: [...(editProdData.customOptions || []), { title: titleEl.value, choices }]
                        });
                        titleEl.value = '';
                        choicesEl.value = '';
                      }}
                    >
                      הוסף אפשרויות בחירה
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(editProdData.customOptions || []).map((opt, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                           <input 
                             className="text-sm font-bold text-white bg-transparent border-b border-white/20 focus:border-pri outline-none pb-1"
                             value={opt.title}
                             onChange={(e) => {
                               const list = [...(editProdData.customOptions || [])];
                               list[i].title = e.target.value;
                               setEditProdData({...editProdData, customOptions: list});
                             }}
                           />
                           <button 
                             className="p-2 bg-red-500/20 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all"
                             onClick={() => {
                               const list = [...(editProdData.customOptions || [])];
                               list.splice(i, 1);
                               setEditProdData({...editProdData, customOptions: list});
                             }}
                           >
                             <X className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {opt.choices.map((c, j) => {
                              const choiceName = typeof c === 'string' ? c : c.name;
                              const choiceImg = c.img;
                              return (
                                <div key={j} className="flex items-center gap-2 bg-black/40 border border-white/10 p-2 rounded-lg">
                                  {choiceImg && <img src={choiceImg} className="w-6 h-6 object-cover rounded-md" referrerPolicy="no-referrer" />}
                                  <input 
                                    className="bg-transparent text-xs text-white outline-none w-20 px-1"
                                    value={choiceName}
                                    placeholder="שם (כחול)"
                                    onChange={(e) => {
                                       const list = [...(editProdData.customOptions || [])];
                                       const oldChoices = [...list[i].choices];
                                       const oldChoice = oldChoices[j];
                                       oldChoices[j] = typeof oldChoice === 'string' ? { name: e.target.value } : { ...oldChoice, name: e.target.value };
                                       list[i].choices = oldChoices;
                                       setEditProdData({...editProdData, customOptions: list});
                                    }}
                                  />
                                  <label className="cursor-pointer text-gray-400 hover:text-white" title="העלה תמונה">
                                    <ImageIcon className="w-4 h-4" />
                                    <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => {
                                       const list = [...(editProdData.customOptions || [])];
                                       const oldChoices = [...list[i].choices];
                                       const oldChoice = oldChoices[j];
                                       oldChoices[j] = typeof oldChoice === 'string' ? { name: oldChoice, img: url } : { ...oldChoice, img: url };
                                       list[i].choices = oldChoices;
                                       setEditProdData({...editProdData, customOptions: list});
                                    })} />
                                  </label>
                                  <button type="button" title="בחר מהגלריה של המוצר" className="text-gray-400 hover:text-white" onClick={(e) => { e.preventDefault(); setGallerySelectorConfig({
                                    active: true, 
                                    availableImages: [editProdData.img, ...(editProdData.extraImages || [])].filter(Boolean) as string[],
                                    onSelect: (url) => {
                                       const list = [...(editProdData.customOptions || [])];
                                       const oldChoices = [...list[i].choices];
                                       const oldChoice = oldChoices[j];
                                       oldChoices[j] = typeof oldChoice === 'string' ? { name: oldChoice, img: url } : { ...oldChoice, img: url };
                                       list[i].choices = oldChoices;
                                       setEditProdData({...editProdData, customOptions: list});
                                    }
                                  }); }}>
                                    <Images className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => {
                                       const list = [...(editProdData.customOptions || [])];
                                       const oldChoices = [...list[i].choices];
                                       oldChoices.splice(j, 1);
                                       list[i].choices = oldChoices;
                                       setEditProdData({...editProdData, customOptions: list});
                                  }} className="text-red-500 hover:text-white"><X className="w-3 h-3" /></button>
                                </div>
                              );
                           })}
                        </div>
                        <button onClick={() => {
                           const list = [...(editProdData.customOptions || [])];
                           list[i].choices = [...list[i].choices, { name: 'אופציה אישית' }];
                           setEditProdData({...editProdData, customOptions: list});
                        }} className="text-xs text-pri mt-1 text-right w-fit">+ הוסף בחירה פנימית</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">מחיר מכירה ₪</label>
                    <input 
                      type="number"
                      className="bg-black/60 border-pri/30"
                      value={editProdData.price}
                      onChange={(e) => setEditProdData({...editProdData, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">מחיר קנייה (נטו) ₪</label>
                    <input 
                      type="number"
                      className="bg-black/60 border-gold/30"
                      value={editProdData.costPrice}
                      onChange={(e) => setEditProdData({...editProdData, costPrice: Number(e.target.value)})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">קישור לאתר הספק (לדרופשיפינג - רק אתה רואה)</label>
                    <input 
                      type="url"
                      placeholder="https://..."
                      className="bg-black/60 border-white/10"
                      value={editProdData.sourceLink || ''}
                      onChange={(e) => setEditProdData({...editProdData, sourceLink: e.target.value})}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">מחיר קודם ₪</label>
                    <input 
                      type="number"
                      className="bg-black/60 border-white/10"
                      value={editProdData.oldPrice}
                      onChange={(e) => setEditProdData({...editProdData, oldPrice: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">משלוח פריט ₪</label>
                    <input 
                      type="number"
                      className="bg-black/60 border-white/10"
                      value={editProdData.shippingCost}
                      onChange={(e) => setEditProdData({...editProdData, shippingCost: Number(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Image Section in Edit Modal */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                  <label className="text-sm font-black text-white block mb-4">ניהול גלריית תמונות</label>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="relative group w-32 h-32 flex-shrink-0 bg-black/40 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-2 hover:border-pri/40 transition-all">
                      {editProdData.img ? (
                        <>
                          <img src={editProdData.img} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          <button className="absolute -top-2 -right-2 bg-acc p-1 rounded-full shadow-lg" onClick={() => setEditProdData({...editProdData, img: ''})}><X className="w-3 h-3" /></button>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center text-center">
                          <Plus className="w-8 h-8 text-pri mb-1" />
                          <span className="text-[8px] font-black uppercase">ראשי</span>
                          <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => setEditProdData({...editProdData, img: url}))} />
                        </label>
                      )}
                    </div>
                    {[0,1,2,3].map(i => (
                      <div key={i} className="relative group w-32 h-32 flex-shrink-0 bg-black/40 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-2 hover:border-white/20 transition-all">
                        {editProdData.extraImages?.[i] ? (
                          <>
                            <img src={editProdData.extraImages[i]} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            <button className="absolute -top-2 -right-2 bg-acc p-1 rounded-full shadow-lg" onClick={() => {
                              const list = [...(editProdData.extraImages || [])];
                              list.splice(i, 1);
                              setEditProdData({...editProdData, extraImages: list});
                            }}><X className="w-3 h-3" /></button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center text-center">
                            <ImageIcon className="w-8 h-8 text-gray-600 mb-1" />
                            <span className="text-[8px] font-black uppercase">נוספת {i+1}</span>
                            <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, (url) => {
                              const list = [...(editProdData.extraImages || [])];
                              list[i] = url;
                              setEditProdData({...editProdData, extraImages: list});
                            })} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button className="flex-1 btn-main py-5" onClick={() => editProdData?.id && handleUpdateProduct(editProdData.id, editProdData)}>שמור שינויים</button>
                  <button className="bg-white/5 hover:bg-white/10 px-8 rounded-2xl font-bold transition-all h-[58px]" onClick={() => setShowEditProdModal(false)}>ביטול</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showTermsModal && (
          <div className="modal show items-center p-4" onClick={() => setShowTermsModal(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mod-content max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-mod" onClick={() => setShowTermsModal(false)}><X /></button>
              <h2 className="text-4xl font-display font-black text-pri mb-8 border-b border-white/10 pb-6">תקנון ומדיניות האתר</h2>
              <div className="bg-black/60 p-8 rounded-[35px] border border-white/10 text-gray-300 text-lg leading-relaxed whitespace-pre-wrap h-[60vh] overflow-y-auto">
                {settings.terms}
              </div>
            </motion.div>
          </div>
        )}

        {showCookieBanner && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-32 left-6 right-6 md:bottom-6 md:left-auto md:right-12 md:max-w-md z-[9999999] bg-black/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[35px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-start gap-5 text-right">
              <div className="bg-pri/20 p-3 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-pri" />
              </div>
              <div className="flex-1">
                <h4 className="text-white text-xl font-black mb-2">אנחנו משתמשים בעוגיות</h4>
                <p className="text-gray-400 text-sm font-bold leading-relaxed mb-6">
                  האתר משתמש בעוגיות כדי להבטיח לך את החוויה הטובה ביותר, לשמור את סל הקניות שלך ולסנכרן את ההגדרות שלך בין מכשירים.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      safeSetItem('sc_cookies_accepted', 'true');
                      setShowCookieBanner(false);
                    }}
                    className="flex-1 bg-pri text-black font-black py-3 rounded-xl hover:scale-105 transition-all text-sm"
                  >
                    אני מאשר
                  </button>
                  <button 
                    onClick={() => setShowCookieBanner(false)}
                    className="px-6 bg-white/5 text-gray-400 font-bold py-3 rounded-xl hover:bg-white/10 transition-all text-sm"
                  >
                    סגור
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {alertMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-glass border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
              <h3 className="text-xl font-bold text-white mb-6 whitespace-pre-wrap">{alertMessage}</h3>
              <button 
                onClick={() => setAlertMessage(null)}
                className="w-full bg-pri text-black font-bold py-3 rounded-xl hover:bg-pri/80 transition-colors"
              >
                סגור
              </button>
            </div>
          </motion.div>
        )}

        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-glass border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
              <h3 className="text-xl font-bold text-white mb-6 whitespace-pre-wrap">{confirmAction.message}</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    confirmAction.onConfirm();
                    setConfirmAction(null);
                  }}
                  className="flex-1 bg-pri text-black font-bold py-3 rounded-xl hover:bg-pri/80 transition-colors"
                >
                  אישור
                </button>
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gallerySelectorConfig && gallerySelectorConfig.active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-glass border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white text-center">בחר תמונה מהגלריה</h2>
              
              {gallerySelectorConfig.availableImages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">אין תמונות זמינות לבחירה.</div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                  {gallerySelectorConfig.availableImages.map((imgUrl, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-square bg-black/40 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-pri transition-all border border-white/10"
                      onClick={() => {
                        gallerySelectorConfig.onSelect(imgUrl);
                        setGallerySelectorConfig(null);
                      }}
                    >
                      <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-center mt-2">
                <button 
                  onClick={() => setGallerySelectorConfig(null)}
                  className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold transition-all text-white"
                >
                  ביטול
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}