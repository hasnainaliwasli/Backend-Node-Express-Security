"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SecurityDashboard() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Security Learning Lab</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Interact with the components below to test security concepts like Rate Limiting, Helmet, and CSRF.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Rate Limiting Card */}
          <ConceptCard
            title="Rate Limiting"
            description="Test basic request limiting. Every click sends a request to the backend."
          >
            <RateLimitTester />
          </ConceptCard>

          {/* CSRF Card */}
          <ConceptCard
            title="CSRF Protection"
            description="Learn how to protect forms from Cross-Site Request Forgery."
          >
            <CsrfTester />
          </ConceptCard>

          {/* Helmet Card */}
          <ConceptCard
            title="Security Headers (Helmet)"
            description="Examine the HTTP response headers sent by the backend."
          >
            <HelmetTester />
          </ConceptCard>

          {/* Bcrypt Card */}
          <ConceptCard
            title="Password Security (Bcrypt)"
            description="See how passwords should be hashed before saving to a database."
          >
            <BcryptTester />
          </ConceptCard>

          {/* JWT Card */}
          <ConceptCard
            title="JWT Authentication"
            description="Log in to get a token and then use it to access protected routes."
          >
            <JwtTester />
          </ConceptCard>
        </div>
      </div>
    </div>
  );
}

function ConceptCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
        {description}
      </p>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function RateLimitTester() {
  const [count, setCount] = useState(0);
  const [lastMessage, setLastMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ping`);
      const data = await res.json();
      setCount((prev) => prev + 1);
      setLastMessage(data.message || `Status: ${res.status}`);
    } catch (err) {
      setLastMessage("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handlePing}
        disabled={loading}
        className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-2xl font-semibold transition-transform active:scale-95 disabled:opacity-50"
      >
        {loading ? "Pinging..." : "Ping Backend"}
      </button>
      <div className="flex justify-between items-center text-sm font-medium pt-2">
        <span className="text-zinc-500">Total Requests:</span>
        <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">{count}</span>
      </div>
      {lastMessage && (
        <p className="text-sm p-4 bg-zinc-50 dark:bg-blue-900/10 border border-zinc-100 dark:border-blue-900/20 rounded-xl">
          {lastMessage}
        </p>
      )}
    </div>
  );
}

function CsrfTester() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  const fetchToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/csrf-token`, { credentials: "include" });
      const data = await res.json();
      setCsrfToken(data.csrfToken);
    } catch (err) {
      console.error("Failed to fetch CSRF token");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If we don't have a token, try fetching it once
    let token = csrfToken;
    if (!token) {
      try {
        const res = await fetch(`${API_URL}/api/csrf-token`, { credentials: "include" });
        const data = await res.json();
        token = data.csrfToken;
        setCsrfToken(token);
      } catch (err) {
        setResult("Failed to get CSRF token");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/login/csrf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token
        },
        body: JSON.stringify({ username, password: "password123" }),
        credentials: "include"
      });

      if (res.status === 403) {
        setResult("Error: 403 Forbidden (CSRF Token missing or invalid)");
      } else {
        const data = await res.json();
        setResult(data.message || `Status: ${res.status}`);
      }
    } catch (err) {
      setResult("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Username</label>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full h-14 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-zinc-400 outline-none transition-all"
            required
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={fetchToken}
          className="px-4 h-14 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-medium transition-all active:scale-95 text-xs whitespace-nowrap"
        >
          {csrfToken ? "Token Active" : "Get Token"}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Secure Form"}
        </button>
      </div>

      {csrfToken && (
        <div className="text-[10px] p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg font-mono truncate">
          <span className="text-zinc-400">Token: </span>{csrfToken}
        </div>
      )}

      {result && (
        <p className={`text-sm p-4 border rounded-xl ${result.includes('Error') ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-600' : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20 text-green-600'}`}>
          {result}
        </p>
      )}
    </form>
  );
}

function HelmetTester() {
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchHeaders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/headers`);
      const data = await res.json();
      setHeaders(data.headers || {});
    } catch (err) {
      setHeaders({ error: "Failed to fetch headers" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={fetchHeaders}
        disabled={loading}
        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Inspect Security Headers"}
      </button>
      {Object.keys(headers).length > 0 && (
        <div className="text-xs p-4 bg-zinc-900 text-zinc-400 rounded-2xl overflow-auto max-h-48 font-mono">
          <pre>{JSON.stringify(headers, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function BcryptTester() {
  const [password, setPassword] = useState("");
  const [hashedPassword, setHashedPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleHash = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      setHashedPassword(data.hashedPassword || "");
    } catch (err) {
      console.error("Failed to hash password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Enter Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="e.g. secret123"
            className="w-full h-14 px-5 pr-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-zinc-400 outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-2"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
      </div>
      <button
        onClick={handleHash}
        disabled={loading || !password}
        className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? "Hashing..." : "Hash with Bcrypt"}
      </button>
      {hashedPassword && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Salted Hash Result:</p>
          <div className="text-xs p-4 bg-zinc-900 text-emerald-400 rounded-2xl font-mono break-all leading-relaxed border border-emerald-900/30">
            {hashedPassword}
          </div>
          <p className="text-[10px] text-zinc-500 italic">
            *Notice how it changes every time you click, even for the same password! That's the power of "salting".
          </p>
        </div>
      )}
    </div>
  );
}

function JwtTester() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [protectedData, setProtectedData] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login/jwt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      setToken(data.token || "");
      setProtectedData(""); // Clear old data
    } catch (err) {
      console.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchProtected = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/protected`, {
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });
      const data = await res.json();
      setProtectedData(JSON.stringify(data, null, 2));
    } catch (err) {
      setProtectedData("Error: Failed to fetch protected data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. Hasnain Ali"
          className="w-full h-14 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-zinc-400 outline-none transition-all"
        />
      </div>

      <button
        onClick={handleLogin}
        disabled={loading || !username}
        className="w-full h-14 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login & Get Token"}
      </button>

      {token && (
        <div className="space-y-3 pt-2">
          <div className="text-[10px] p-2 bg-zinc-900 text-zinc-500 rounded-lg font-mono truncate border border-zinc-800">
            <span className="text-zinc-600">Token: </span>{token}
          </div>

          <button
            onClick={fetchProtected}
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all active:scale-95"
          >
            Fetch Protected Data
          </button>
        </div>
      )}

      {protectedData && (
        <div className="text-xs p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl text-blue-800 dark:text-blue-300 font-mono overflow-x-auto">
          <pre>{protectedData}</pre>
        </div>
      )}
    </div>
  );
}
