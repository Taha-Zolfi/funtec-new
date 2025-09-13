'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import './Login.css';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const [step, setStep] = useState(1);
  const [locale, setLocale] = useState('fa');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [debugCode, setDebugCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestCode = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/request-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'request-failed');
  setDebugCode(data.code || null);
  setStep(2);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'verify-failed');
      // redirect to localized services using the computed locale state
      router.push(`/${locale || (params?.locale || 'fa')}/services`);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Compute locale on the client to avoid synchronous access to params during SSR
  useEffect(() => {
    try {
      const pLocale = params?.locale;
      if (pLocale) setLocale(pLocale);
      else if (typeof window !== 'undefined') {
        const parts = window.location.pathname.split('/').filter(Boolean);
        if (parts && parts.length > 0) setLocale(parts[0]);
      }
    } catch (e) {
      setLocale('fa');
    }
  }, [params]);

  const isRTL = locale === 'fa' || locale === 'ar';

  return (
    <div className={`login-page-wrapper lang-${locale}`}>
      <div className="login-container">
        <div className="login-card">
          {/* Back Button */}
          <a href={`/${locale}`} className="back-button" aria-label="بازگشت">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </a>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'completed' : ''}`}></div>
          </div>

          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">
              {step === 1 ? 'ورود با شماره تلفن' : 'تایید کد ارسالی'}
            </h1>
            <p className="login-subtitle">
              {step === 1 
                ? 'شماره تلفن همراه خود را وارد کنید تا کد تایید برای شما ارسال شود'
                : 'کد ۴ رقمی ارسال شده به شماره شما را وارد کنید'
              }
            </p>
          </div>

          {/* Forms */}
          {step === 1 && (
            <form onSubmit={requestCode} className="login-form">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">شماره تلفن همراه</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="09123456789"
                  className="form-input"
                  required
                  dir="ltr"
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                type="submit" 
                disabled={loading}
                className={`login-button ${loading ? 'loading' : ''}`}
              >
                {loading ? 'در حال ارسال...' : 'دریافت کد تایید'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyCode} className="login-form">
              <div className="form-group">
                <label htmlFor="code" className="form-label">کد تایید</label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="1234"
                  className="form-input"
                  required
                  dir="ltr"
                  maxLength="4"
                />
              </div>
              
              {debugCode && (
                <div className="debug-code">
                  کد تست: <strong>{debugCode}</strong>
                </div>
              )}
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                type="submit" 
                disabled={loading}
                className={`login-button ${loading ? 'loading' : ''}`}
              >
                {loading ? 'در حال بررسی...' : 'تایید و ورود'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
