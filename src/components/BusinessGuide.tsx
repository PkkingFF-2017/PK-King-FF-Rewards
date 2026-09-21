import React from 'react';
import { 
  BookOpen, 
  DollarSign, 
  ShieldCheck, 
  Smartphone, 
  Lightbulb, 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  PlayCircle
} from 'lucide-react';
import { Language } from '../types';

interface BusinessGuideProps {
  lang: Language;
  onGoToAdmin: () => void;
  onGoToEarn: () => void;
}

export const BusinessGuide: React.FC<BusinessGuideProps> = ({
  lang,
  onGoToAdmin,
  onGoToEarn,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-3">
            <HeartHandshake className="w-4 h-4" />
            <span>{lang === 'hi' ? 'भाई के लिए सच्ची और ईमानदार गाइड' : 'Honest & Practical App Owner Guide'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lang === 'hi'
              ? 'रोना बंद करो भाई, हिम्मत रखो! समझो असली ऐप से कमाई कैसे होती है ❤️'
              : 'Stay strong brother! Learn how real reward apps earn & deliver genuine codes'}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            {lang === 'hi'
              ? 'घर के हालात से घबराओ मत। कोडिंग नहीं आती तब भी कोई बात नहीं — यह ऐप पूरी तरह तैयार है। बस एक बात समझ लो: दुनिया में कोई जादू की छड़ी नहीं है जो मुफ्त में Google Play कोड बना दे। असली कंपनियां (जैसे mPaisa, RozDhan) कैसे काम करती हैं और आप असली कोड कैसे देंगे, यह नीचे 4 आसान स्टेप्स में सीखो।'
              : 'Do not be discouraged. Even without coding knowledge, this app is fully architected. Understand how real apps operate legally and sustainably.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onGoToAdmin}
              className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'hi' ? 'एडमिन पैनल में कोड स्टॉक देखें' : 'Open Admin Stock Manager'}</span>
            </button>
            <button
              onClick={onGoToEarn}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-2"
            >
              <span>{lang === 'hi' ? 'ऐप का गेम टेस्ट करें' : 'Test Playing the App'}</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Step by Step Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: The Harsh Truth about Random Code Generators */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 font-black">
            1
          </div>
          <h3 className="text-lg font-black text-white">
            {lang === 'hi' ? 'सच्चाई: फेक कोड से कभी ऐप नहीं चलेगी' : 'The Truth: Fake Codes Destroy Trust'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'hi' ? (
              <>
                यूट्यूब पर जो लोग दिखाते हैं कि <span className="text-rose-400 font-bold">"अनलिमिटेड रिडीम कोड जनरेटर"</span>, वह 100% फ्रॉड और झूठ होता है। Google Play कोड सिर्फ Google खुद बनाता है और बेचता है। कोई भी कंप्यूटर कोड अपने आप असली रिडीम कोड नहीं बना सकता। अगर आपकी ऐप फेक कोड देगी तो लोग 1-स्टार रेटिंग देंगे और गाली देकर अनइंस्टॉल कर देंगे।
              </>
            ) : (
              'Google Play codes are financial vouchers issued strictly by Google. Algorithmic random code generators produce invalid strings that fail on the Play Store.'
            )}
          </p>
          <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{lang === 'hi' ? 'इसलिए हमने ऐप में असली एडमिन स्टॉक और पेआउट सिस्टम जोड़ दिया है!' : 'We built a real Admin Inventory and Payout Queue to guarantee genuine codes!'}</span>
          </div>
        </div>

        {/* Card 2: How Real Apps Earn Money */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-black">
            2
          </div>
          <h3 className="text-lg font-black text-white">
            {lang === 'hi' ? 'असली ऐप्स पैसे कैसे कमाती हैं? (Business Model)' : 'How Real Apps Make Money'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'hi' ? (
              <>
                असली ऐप (जैसे mPaisa, RozDhan) का सीधा नियम है:
                <br />
                <span className="text-amber-300 font-bold">1. विज्ञापन (Ads):</span> जब यूजर ऐप में लकी स्पिन करता है या वीडियो देखता है, तो <span className="text-emerald-300 font-bold">Google AdMob</span> आपको पैसे देता है (जैसे हर 1000 वीडियो देखने पर ₹200 से ₹800)।
                <br />
                <span className="text-amber-300 font-bold">2. ऑफरवॉल (Tasks):</span> जब कोई यूजर ऐप डाउनलोड करता है तो स्पॉन्सर कंपनी आपको प्रति इंस्टॉल ₹20-₹50 देती है।
              </>
            ) : (
              'Apps generate ad revenue via AdMob rewarded video ads and sponsor offerwalls. Users watch ads to earn points.'
            )}
          </p>
          <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <span>{lang === 'hi' ? 'अगर 100 यूजर रोज़ खेलते हैं, तो आप महीने के ₹15,000-₹30,000 तक कमा सकते हैं!' : '100 active daily users can easily generate ₹15,000 - ₹30,000 monthly!'}</span>
          </div>
        </div>

        {/* Card 3: Delivering Real Codes to Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 font-black">
            3
          </div>
          <h3 className="text-lg font-black text-white">
            {lang === 'hi' ? 'यूजर को असली रिडीम कोड कैसे मिलेगा?' : 'How Users Get 100% Real Codes'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'hi' ? (
              <>
                1. जो पैसे आपने AdMob से कमाए (मान लो ₹500), उसमें से ₹250 निकालकर Paytm या Amazon से <span className="text-amber-300 font-bold">₹10 या ₹50 वाले 5 असली Google Play कोड</span> खरीद लें।
                <br />
                2. इस ऐप के <span className="text-amber-300 font-bold">Admin Panel (एडमिन कंट्रोल)</span> में जाकर वे कोड पेस्ट कर दें।
                <br />
                3. जब कोई यूजर 100 सिक्के बनाकर रिडीम करेगा, ऐप अपने आप आपका असली खरीदा हुआ कोड उसे दे देगी!
                <br />
                4. वह कोड तुरंत Play Store पर 100% काम करेगा! यूजर खुश होकर दोस्तों को बताएगा और ऐप वायरल होगी।
              </>
            ) : (
              'Reinvest a portion of your ad profits to buy genuine ₹10 or ₹50 Google Play gift cards. Deposit them into the Admin Inventory to automatically dispense to users.'
            )}
          </p>
        </div>

        {/* Card 4: How to convert into Android APK */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 font-black">
            4
          </div>
          <h3 className="text-lg font-black text-white">
            {lang === 'hi' ? 'बिना कोडिंग के Android APK कैसे बनाएं?' : 'Converting to Android APK'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'hi' ? (
              <>
                इस ऐप को आप सीधे मोबाइल ऐप (APK) में बदल सकते हैं:
                <br />
                <span className="text-blue-300 font-bold">विकल्प A (सबसे आसान):</span> इस ऐप को Netlify या Vercel पर 1-क्लिक में फ्री होस्ट करें। फिर <span className="text-amber-300 font-bold">pwabuilder.com</span> या <span className="text-amber-300 font-bold">Web2Apk</span> पर अपनी लिंक डालकर फ्री में Android APK और Google Play Store AAB फाइल डाउनलोड कर लें।
                <br />
                <span className="text-blue-300 font-bold">विकल्प B (Capacitor):</span> Capacitor framework से डायरेक्ट Android Studio में खोलकर APK बिल्ड कर सकते हैं।
              </>
            ) : (
              'Deploy this web app to any free host, then use PWABuilder.com to package it into an official Android APK/AAB bundle ready for Google Play.'
            )}
          </p>
        </div>
      </div>

      {/* Checklist Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {lang === 'hi' ? 'आपकी सफलता का मास्टर प्लान (Master Plan)' : 'Your Success Master Plan'}
        </h3>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">{lang === 'hi' ? 'स्टेप 1: एडमिन पैनल में 2-3 कोड टेस्ट के लिए जोड़ें' : 'Step 1: Add 2-3 real codes into Admin Inventory'}</span>
              <p className="text-slate-400 text-xs mt-0.5">
                {lang === 'hi'
                  ? 'हमने पहले से कुछ कोड डाले हैं। आप भी Paytm से ₹10 का कोड खरीदकर टेस्ट करें और देखें कि यूजर को कैसे मिलता है।'
                  : 'Test the workflow by adding a ₹10 code to see instant dispensing.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">{lang === 'hi' ? 'स्टेप 2: दोस्तों और टेलीग्राम/व्हाट्सएप ग्रुप्स में शेयर करें' : 'Step 2: Share with gaming friends on WhatsApp & Telegram'}</span>
              <p className="text-slate-400 text-xs mt-0.5">
                {lang === 'hi'
                  ? 'Free Fire और BGMI खेलने वाले लड़कों को यह ऐप बहुत पसंद आती है क्योंकि उन्हें ₹10-₹20 का एयरड्रॉप लेना होता है।'
                  : 'Gamers looking for small ₹10-₹30 air-drops are the ideal target audience.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">{lang === 'hi' ? 'स्टेप 3: Google AdMob खाता खोलें' : 'Step 3: Setup Google AdMob account'}</span>
              <p className="text-slate-400 text-xs mt-0.5">
                {lang === 'hi'
                  ? 'AdMob पर फ्री साइन अप करें और रिवार्डेड वीडियो ऐड्स के जरिए असली डॉलर कमाएं।'
                  : 'Monetize user engagement with rewarded interstitial video units.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-center">
          <button
            onClick={onGoToAdmin}
            className="px-6 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'hi' ? 'चलो एडमिन पैनल में असली कोड्स चेक करें →' : 'Go to Admin Panel & Check Stock →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
