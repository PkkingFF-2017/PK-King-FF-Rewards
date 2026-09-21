import React, { useState } from 'react';
import { Heart, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface GuideBannerProps {
  lang: Language;
}

export const GuideBanner: React.FC<GuideBannerProps> = ({ lang }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
            <Heart className="w-6 h-6 text-rose-400 fill-rose-400/30" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-base sm:text-lg">
                {lang === 'hi' ? 'भाई, हाथ मत जोड़ो, सच्चाई समझो ❤️' : 'Important Truth About Play Store Codes ❤️'}
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {lang === 'hi' ? '100% सच' : 'Honest Truth'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {lang === 'hi'
                ? 'गूगल प्ले का असली कोड सिर्फ Google कंपनी बेचती है। कोई भी AI या ऐप जादू से मुफ्त असली कोड नहीं बना सकती। पहले जो कोड दिखा था वह डेमो (नमूना) था। सच में असली बैलेंस कैसे पाएं, नीचे देखें:'
                : 'Google Play codes are actual currency sold exclusively by Google. No software can magically fabricate valid financial vouchers. Learn how genuine rewards work below:'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1 flex-shrink-0 transition-all"
        >
          <span>{expanded ? (lang === 'hi' ? 'छुपाएं' : 'Hide') : (lang === 'hi' ? 'सच्चाई गाइड' : 'Show Truth')}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Box 1: Why random generator codes fail */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-black text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{lang === 'hi' ? 'प्ले स्टोर पर कोड क्यों नहीं चला?' : 'Why did the code fail on Play Store?'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {lang === 'hi' ? (
                <>
                  Google Play कोड असल में <span className="text-amber-300 font-bold">रुपया (पैसा)</span> होता है। जैसे 500 रुपये का नोट सिर्फ बैंक छाप सकता है, वैसे ही Google Play का कोड सिर्फ Google बेचता है। यूट्यूब पर जो बोलते हैं "फ्री कोड जनरेटर", वो सब झूठ होता है।
                </>
              ) : (
                'Google Play gift codes are monetary instruments. Only Google generates authorized codes when purchased with money.'
              )}
            </p>
          </div>

          {/* Box 2: Real App Earning Process */}
          <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 font-black text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{lang === 'hi' ? 'इस ऐप से 100% असली कोड कैसे मिलेगा?' : 'How to get 100% Real Code from this App:'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {lang === 'hi' ? (
                <>
                  1. <span className="text-emerald-300 font-bold">यूट्यूब वीडियो देखें</span> और जितनी बार चाहें <span className="text-amber-300 font-bold">10 सिक्के कलेक्ट</span> करें!<br />
                  2. 100,000 (100K) सिक्के पूरे होने पर <span className="text-emerald-300 font-bold">₹10 रिडीम</span> बटन दबाएं।<br />
                  3. ऐप मालिक आपके लिए PhonePe/Paytm से खरीदा हुआ <span className="text-amber-300 font-bold">100% असली Google Play कोड</span> पेआउट करेंगे!
                </>
              ) : (
                '1. Watch YouTube videos and collect 10 coins as many times as you like! 2. Once you reach 100,000 coins (100K), submit a ₹10 payout request. 3. The app owner dispenses a 100% genuine purchased Google Play code directly to your history!'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
