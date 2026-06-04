import React from 'react';
import { MessageCircle, Mail } from 'lucide-react';

interface FooterProps {
  onTermsClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onTermsClick }) => {
  return (
    <footer className="bg-black/60 border-t border-white/10 pt-16 pb-32 md:pb-16 mt-20 relative z-10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-right" dir="rtl">
        <div>
           <h4 className="text-white font-black text-2xl mb-6">יצירת קשר</h4>
           <div className="space-y-4 text-gray-300 font-medium">
             <a href="https://wa.me/972512327818" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-3 hover:text-pri transition-colors">
               <MessageCircle className="w-5 h-5 text-green-500" />
               וואטסאפ: <span dir="ltr">051-232-7818</span>
             </a>
             <div className="pt-4 border-t border-white/5">
                <p className="text-sm text-gray-500 mb-2">במקרה שירות לקוחות לא עובד:</p>
                <a href="mailto:swiftcrat@gmail.com" className="flex items-center justify-center md:justify-start gap-3 hover:text-pri transition-colors">
                  <Mail className="w-5 h-5 text-pri" />
                  אימייל: <span dir="ltr">swiftcrat@gmail.com</span>
                </a>
             </div>
           </div>
        </div>
        <div>
           <h4 className="text-white font-black text-2xl mb-6">מידע חשוב</h4>
           <div className="space-y-4 text-gray-300 font-bold">
              <button onClick={onTermsClick} className="hover:text-pri transition-colors">תקנון ומדיניות האתר</button>
           </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-gray-400 text-sm font-bold">
        © {new Date().getFullYear()} כול הזכויות שמורות ל SwiftCart
      </div>
    </footer>
  );
};

export default Footer;
