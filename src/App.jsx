import { useState, useCallback } from "react";

// ─── STORAGE HELPERS ───────────────────────────────────────────────────────────
const STORAGE_KEY = "budget_app_v1";
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
};
const save = (state) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

const INITIAL_STATE = {
  user: null,
  budget: null,
  transactions: [],
};

const CATEGORIES = {
  expense: [
    "Food",
    "Transport",
    "Housing",
    "Health",
    "Entertainment",
    "Shopping",
    "Education",
    "Other",
  ],
  income: ["Salary", "Freelance", "Gift", "Investment", "Other"],
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    plus: "M12 5v14M5 12h14",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    settings:
      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
    trash:
      "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    warn: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
    check: "M20 6L9 17l-5-5",
    filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    budget: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]
        ?.split("M")
        .filter(Boolean)
        .map((d, i) => (
          <path key={i} d={"M" + d} />
        ))}
    </svg>
  );
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toFixed(2)}`;
const today = () => new Date().toISOString().split("T")[0];
const daysBetween = (a, b) =>
  Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000));

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Input = ({ label, error, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#8b9bb4",
          marginBottom: 6,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
    )}
    <input
      {...props}
      style={{
        width: "100%",
        padding: "10px 14px",
        background: "#111827",
        border: `1.5px solid ${error ? "#ef4444" : "#1f2d44"}`,
        borderRadius: 10,
        color: "#e2e8f0",
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
        transition: "border-color 0.2s",
        ...props.style,
      }}
      onFocus={(e) =>
        (e.target.style.borderColor = error ? "#ef4444" : "#3b82f6")
      }
      onBlur={(e) =>
        (e.target.style.borderColor = error ? "#ef4444" : "#1f2d44")
      }
    />
    {error && (
      <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
        {error}
      </div>
    )}
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#8b9bb4",
          marginBottom: 6,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
    )}
    <select
      {...props}
      style={{
        width: "100%",
        padding: "10px 14px",
        background: "#111827",
        border: "1.5px solid #1f2d44",
        borderRadius: 10,
        color: "#e2e8f0",
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      {children}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", small, style: s, ...props }) => {
  const styles = {
    primary: {
      background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
      color: "#fff",
      border: "none",
    },
    danger: {
      background: "linear-gradient(135deg,#ef4444,#b91c1c)",
      color: "#fff",
      border: "none",
    },
    ghost: {
      background: "transparent",
      color: "#8b9bb4",
      border: "1.5px solid #1f2d44",
    },
    success: {
      background: "linear-gradient(135deg,#10b981,#059669)",
      color: "#fff",
      border: "none",
    },
  };
  return (
    <button
      {...props}
      style={{
        padding: small ? "6px 14px" : "11px 20px",
        borderRadius: 10,
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "opacity 0.15s, transform 0.1s",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        ...styles[variant],
        ...s,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
};

const Card = ({ children, style: s, warning }) => (
  <div
    style={{
      background: warning ? "rgba(251,191,36,0.08)" : "#0f172a",
      border: `1.5px solid ${warning ? "#f59e0b" : "#1f2d44"}`,
      borderRadius: 16,
      padding: 20,
      ...s,
    }}
  >
    {children}
  </div>
);

// ─── SCREEN 1 · AUTH ─────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Name required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 4) e.password = "Min 4 characters";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = () => {
    if (!validate()) return;
    const stored = load() || {};
    if (mode === "signup") {
      if (stored.user?.email === form.email) {
        setErrors({ email: "Email already registered" });
        return;
      }
      const user = {
        name: form.name,
        email: form.email,
        password: form.password,
      };
      const state = { ...INITIAL_STATE, user };
      save(state);
      onLogin(state);
    } else {
      if (
        !stored.user ||
        stored.user.email !== form.email ||
        stored.user.password !== form.password
      ) {
        setErrors({ email: "Invalid credentials" });
        return;
      }
      onLogin(stored);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060c17",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💰</div>
          <h1
            style={{
              color: "#e2e8f0",
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            BudgetPilot
          </h1>
          <p style={{ color: "#475569", fontSize: 14, marginTop: 6 }}>
            Your personal finance companion
          </p>
        </div>

        <Card>
          <div
            style={{
              display: "flex",
              background: "#111827",
              borderRadius: 10,
              padding: 4,
              marginBottom: 24,
            }}
          >
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErrors({});
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "none",
                  borderRadius: 8,
                  background: mode === m ? "#1d4ed8" : "transparent",
                  color: mode === m ? "#fff" : "#64748b",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <Input
              label="Full Name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            error={errors.password}
          />

          <Btn
            onClick={submit}
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
          >
            {mode === "login" ? "Log In" : "Create Account"}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ─── SCREEN 2 · SETUP BUDGET CYCLE ───────────────────────────────────────────
function BudgetSetupScreen({ onSave }) {
  const [form, setForm] = useState({
    amount: "",
    start: today(),
    end: "",
    cycle: "monthly",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const presets = { monthly: 30, weekly: 7, biweekly: 14 };
  const applyPreset = (c) => {
    const s = today();
    const e = new Date(Date.now() + presets[c] * 86400000)
      .toISOString()
      .split("T")[0];
    setForm((f) => ({ ...f, cycle: c, start: s, end: e }));
  };

  const submit = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0)
      e.amount = "Enter a valid budget amount";
    if (!form.end || form.end <= form.start)
      e.end = "End date must be after start";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ ...form, amount: +form.amount, spent: 0, id: Date.now() });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060c17",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
          <h2
            style={{
              color: "#e2e8f0",
              fontSize: 22,
              fontWeight: 800,
              margin: 0,
            }}
          >
            Create Budget Cycle
          </h2>
          <p style={{ color: "#475569", fontSize: 14, marginTop: 6 }}>
            Set up your spending plan
          </p>
        </div>

        <Card>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {["weekly", "biweekly", "monthly"].map((c) => (
              <button
                key={c}
                onClick={() => applyPreset(c)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  border: `1.5px solid ${form.cycle === c ? "#3b82f6" : "#1f2d44"}`,
                  borderRadius: 8,
                  background:
                    form.cycle === c ? "rgba(59,130,246,0.15)" : "transparent",
                  color: form.cycle === c ? "#60a5fa" : "#64748b",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          <Input
            label="Budget Amount ($)"
            type="number"
            placeholder="e.g. 2000"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            error={errors.amount}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Input
              label="Start Date"
              type="date"
              value={form.start}
              onChange={(e) => set("start", e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={form.end}
              onChange={(e) => set("end", e.target.value)}
              error={errors.end}
            />
          </div>

          <Btn
            onClick={submit}
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
          >
            <Icon name="check" size={16} /> Create Budget
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ─── SCREEN 3 · DASHBOARD ────────────────────────────────────────────────────
function Dashboard({ budget, transactions, onNav }) {
  const spent = transactions
    .filter(
      (t) =>
        t.type === "expense" && t.date >= budget.start && t.date <= budget.end,
    )
    .reduce((s, t) => s + t.amount, 0);
  // const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const remaining = budget.amount - spent;
  const pct = Math.min(100, (spent / budget.amount) * 100);
  const daysLeft = Math.max(0, daysBetween(today(), budget.end));
  const dailyLimit = daysLeft > 0 ? remaining / daysLeft : 0;
  const warn = pct >= 80;

  const recent = [...transactions].sort((a, b) => b.id - a.id).slice(0, 4);

  return (
    <div>
      {warn && (
        <div
          style={{
            background: "rgba(245,158,11,0.12)",
            border: "1.5px solid #f59e0b",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Icon name="warn" size={20} />
          <div>
            <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14 }}>
              ⚠ Budget Warning
            </div>
            <div style={{ color: "#92400e", fontSize: 13 }}>
              You've used {pct.toFixed(0)}% of your budget. Spend carefully!
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {[
          { label: "Budget", val: fmt(budget.amount), color: "#60a5fa" },
          { label: "Spent", val: fmt(spent), color: "#f87171" },
          {
            label: "Remaining",
            val: fmt(remaining),
            color: remaining >= 0 ? "#34d399" : "#f87171",
          },
          { label: "Daily Limit", val: fmt(dailyLimit), color: "#a78bfa" },
        ].map(({ label, val, color }) => (
          <Card key={label} style={{ padding: 16 }}>
            <div
              style={{
                color: "#475569",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </div>
            <div style={{ color, fontSize: 22, fontWeight: 800, marginTop: 4 }}>
              {val}
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span style={{ color: "#8b9bb4", fontSize: 13, fontWeight: 600 }}>
            Budget Progress
          </span>
          <span
            style={{
              color: warn ? "#fbbf24" : "#60a5fa",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {pct.toFixed(0)}%
          </span>
        </div>
        <div style={{ height: 10, background: "#1f2d44", borderRadius: 99 }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background:
                pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#3b82f6",
              borderRadius: 99,
              transition: "width 0.4s",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            color: "#475569",
            fontSize: 12,
          }}
        >
          <span>{budget.start}</span>
          <span>{daysLeft} days left</span>
          <span>{budget.end}</span>
        </div>
      </Card>

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <span style={{ color: "#8b9bb4", fontWeight: 700, fontSize: 13 }}>
            Recent Transactions
          </span>
          <Btn variant="ghost" small onClick={() => onNav("transactions")}>
            <Icon name="list" size={14} /> See All
          </Btn>
        </div>
        {recent.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#334155",
              padding: "24px 0",
              fontSize: 14,
            }}
          >
            No transactions yet
          </div>
        ) : (
          recent.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #111827",
              }}
            >
              <div>
                <div
                  style={{ color: "#cbd5e1", fontSize: 14, fontWeight: 600 }}
                >
                  {t.description}
                </div>
                <div style={{ color: "#475569", fontSize: 12 }}>
                  {t.category} · {t.date}
                </div>
              </div>
              <div
                style={{
                  color: t.type === "income" ? "#34d399" : "#f87171",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {t.type === "income" ? "+" : "-"}
                {fmt(t.amount)}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

// ─── SCREEN 4 · ADD/EDIT TRANSACTION ─────────────────────────────────────────
function AddTransactionScreen({ editTx, onSave, onCancel }) {
  const [form, setForm] = useState(
    editTx
      ? { ...editTx }
      : {
          type: "expense",
          amount: "",
          category: CATEGORIES.expense[0],
          description: "",
          date: today(),
        },
  );
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "type") next.category = CATEGORIES[v][0];
      return next;
    });
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0)
      e.amount = "Enter valid amount";
    if (!form.description.trim()) e.description = "Description required";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({ ...form, amount: +form.amount, id: editTx?.id || Date.now() });
  };

  return (
    <div>
      <h2
        style={{
          color: "#e2e8f0",
          fontSize: 20,
          fontWeight: 800,
          margin: "0 0 24px",
        }}
      >
        {editTx ? "Edit Transaction" : "Add Transaction"}
      </h2>

      <Card>
        <div
          style={{
            display: "flex",
            background: "#111827",
            borderRadius: 10,
            padding: 4,
            marginBottom: 20,
          }}
        >
          {["expense", "income"].map((t) => (
            <button
              key={t}
              onClick={() => set("type", t)}
              style={{
                flex: 1,
                padding: "9px",
                border: "none",
                borderRadius: 8,
                background:
                  form.type === t
                    ? t === "expense"
                      ? "#991b1b"
                      : "#065f46"
                    : "transparent",
                color: form.type === t ? "#fff" : "#64748b",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {t === "expense" ? "💸 Expense" : "💰 Income"}
            </button>
          ))}
        </div>

        <Input
          label="Amount ($)"
          type="number"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          error={errors.amount}
        />
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
        >
          {CATEGORIES[form.type].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Input
          label="Description"
          placeholder="What was this for?"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          error={errors.description}
        />
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Btn
            onClick={submit}
            style={{ flex: 1, justifyContent: "center" }}
            variant={form.type === "income" ? "success" : "primary"}
          >
            <Icon name="check" size={16} />{" "}
            {editTx ? "Save Changes" : "Add Transaction"}
          </Btn>
          <Btn variant="ghost" onClick={onCancel}>
            Cancel
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── SCREEN 5 · TRANSACTIONS LIST ────────────────────────────────────────────
function TransactionsScreen({ transactions, onEdit, onDelete }) {
  const [filter, setFilter] = useState({
    type: "all",
    category: "all",
    search: "",
  });
  const [confirm, setConfirm] = useState(null);

  const allCats = [...new Set(transactions.map((t) => t.category))].sort();

  const visible = transactions
    .filter((t) => {
      if (filter.type !== "all" && t.type !== filter.type) return false;
      if (filter.category !== "all" && t.category !== filter.category)
        return false;
      if (
        filter.search &&
        !t.description.toLowerCase().includes(filter.search.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => b.id - a.id);

  return (
    <div>
      <h2
        style={{
          color: "#e2e8f0",
          fontSize: 20,
          fontWeight: 800,
          margin: "0 0 20px",
        }}
      >
        Transaction History
      </h2>

      <Card style={{ marginBottom: 16, padding: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Icon name="filter" size={16} />
          <span style={{ color: "#8b9bb4", fontSize: 13, fontWeight: 600 }}>
            Filters
          </span>
        </div>
        <Input
          placeholder="Search description…"
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          style={{ marginBottom: 0 }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 10,
          }}
        >
          <Select
            value={filter.type}
            onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="all">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Select
            value={filter.category}
            onChange={(e) =>
              setFilter((f) => ({ ...f, category: e.target.value }))
            }
          >
            <option value="all">All Categories</option>
            {allCats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
      </Card>

      <div style={{ color: "#475569", fontSize: 12, marginBottom: 10 }}>
        {visible.length} transaction{visible.length !== 1 ? "s" : ""}
      </div>

      {visible.length === 0 ? (
        <Card>
          <div
            style={{ textAlign: "center", color: "#334155", padding: "32px 0" }}
          >
            No transactions match your filters
          </div>
        </Card>
      ) : (
        visible.map((t) => (
          <Card key={t.id} style={{ marginBottom: 10, padding: "14px 16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}
                >
                  {t.description}
                </div>
                <div style={{ color: "#475569", fontSize: 12, marginTop: 3 }}>
                  <span
                    style={{
                      background:
                        t.type === "income"
                          ? "rgba(16,185,129,0.12)"
                          : "rgba(239,68,68,0.12)",
                      color: t.type === "income" ? "#34d399" : "#f87171",
                      padding: "1px 8px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {t.type}
                  </span>
                  {" · "}
                  {t.category}
                  {" · "}
                  {t.date}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    color: t.type === "income" ? "#34d399" : "#f87171",
                    fontWeight: 800,
                    fontSize: 16,
                    marginRight: 6,
                  }}
                >
                  {t.type === "income" ? "+" : "-"}
                  {fmt(t.amount)}
                </div>
                <Btn
                  variant="ghost"
                  small
                  onClick={() => onEdit(t)}
                  style={{ padding: "5px 8px" }}
                >
                  <Icon name="edit" size={14} />
                </Btn>
                {confirm === t.id ? (
                  <Btn
                    variant="danger"
                    small
                    onClick={() => {
                      onDelete(t.id);
                      setConfirm(null);
                    }}
                    style={{ padding: "5px 10px" }}
                  >
                    Confirm
                  </Btn>
                ) : (
                  <Btn
                    variant="ghost"
                    small
                    onClick={() => setConfirm(t.id)}
                    style={{
                      padding: "5px 8px",
                      color: "#ef4444",
                      borderColor: "#450a0a",
                    }}
                  >
                    <Icon name="trash" size={14} />
                  </Btn>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

// ─── SETTINGS SCREEN ─────────────────────────────────────────────────────────
function SettingsScreen({
  user,
  budget,
  transactions,
  onReset,
  onLogout,
  onEditBudget,
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div>
      <h2
        style={{
          color: "#e2e8f0",
          fontSize: 20,
          fontWeight: 800,
          margin: "0 0 24px",
        }}
      >
        Settings
      </h2>

      <Card style={{ marginBottom: 14 }}>
        <div
          style={{
            color: "#8b9bb4",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Account
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "#e2e8f0", fontWeight: 700 }}>{user.name}</div>
            <div style={{ color: "#475569", fontSize: 13 }}>{user.email}</div>
          </div>
          <Btn variant="ghost" small onClick={onLogout}>
            <Icon name="logout" size={14} /> Log Out
          </Btn>
        </div>
      </Card>

      {budget && (
        <Card style={{ marginBottom: 14 }}>
          <div
            style={{
              color: "#8b9bb4",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            Current Budget Cycle
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 14, marginBottom: 4 }}>
            <b>Amount:</b> {fmt(budget.amount)}
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 14, marginBottom: 4 }}>
            <b>Period:</b> {budget.start} → {budget.end}
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 14, marginBottom: 14 }}>
            <b>Transactions:</b> {transactions.length}
          </div>
          <Btn variant="ghost" small onClick={onEditBudget}>
            <Icon name="edit" size={14} /> Edit Budget
          </Btn>
        </Card>
      )}

      <Card>
        <div
          style={{
            color: "#8b9bb4",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Danger Zone
        </div>
        {confirmReset ? (
          <div>
            <p style={{ color: "#fca5a5", fontSize: 14, marginBottom: 14 }}>
              This will delete ALL transactions and reset your budget. This
              cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn
                variant="danger"
                small
                onClick={() => {
                  onReset();
                  setConfirmReset(false);
                }}
              >
                Yes, Reset Everything
              </Btn>
              <Btn variant="ghost" small onClick={() => setConfirmReset(false)}>
                Cancel
              </Btn>
            </div>
          </div>
        ) : (
          <Btn variant="danger" small onClick={() => setConfirmReset(true)}>
            <Icon name="trash" size={14} /> Reset App Data
          </Btn>
        )}
      </Card>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(() => load() || INITIAL_STATE);
  const [screen, setScreen] = useState("home");
  const [editTx, setEditTx] = useState(null);

  const persist = useCallback((next) => {
    setState(next);
    save(next);
  }, []);

  const { user, budget, transactions } = state;

  // Auth
  if (!user)
    return (
      <AuthScreen
        onLogin={(s) => {
          persist(s);
          setScreen("home");
        }}
      />
    );

  // Budget setup
  if (!budget)
    return (
      <BudgetSetupScreen onSave={(b) => persist({ ...state, budget: b })} />
    );

  // Edit budget
  if (screen === "editBudget")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#060c17",
          padding: 20,
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <BudgetSetupScreen
          onSave={(b) => {
            persist({ ...state, budget: b });
            setScreen("settings");
          }}
        />
      </div>
    );

  const saveTx = (tx) => {
    const exists = transactions.find((t) => t.id === tx.id);
    const next = exists
      ? transactions.map((t) => (t.id === tx.id ? tx : t))
      : [...transactions, tx];
    persist({ ...state, transactions: next });
    setEditTx(null);
    setScreen("transactions");
  };

  const deleteTx = (id) =>
    persist({
      ...state,
      transactions: transactions.filter((t) => t.id !== id),
    });

  const navItems = [
    { id: "home", icon: "home", label: "Home" },
    { id: "add", icon: "plus", label: "Add" },
    { id: "transactions", icon: "list", label: "History" },
    { id: "settings", icon: "settings", label: "Settings" },
  ];

  const renderScreen = () => {
    if (screen === "add" || (screen === "transactions" && editTx)) {
      return (
        <AddTransactionScreen
          editTx={editTx}
          onSave={saveTx}
          onCancel={() => {
            setEditTx(null);
            setScreen(editTx ? "transactions" : "home");
          }}
        />
      );
    }
    if (screen === "transactions")
      return (
        <TransactionsScreen
          transactions={transactions}
          onEdit={(t) => {
            setEditTx(t);
          }}
          onDelete={deleteTx}
        />
      );
    if (screen === "settings")
      return (
        <SettingsScreen
          user={user}
          budget={budget}
          transactions={transactions}
          onReset={() => persist({ user, budget: null, transactions: [] })}
          onLogout={() => persist({ ...INITIAL_STATE })}
          onEditBudget={() => setScreen("editBudget")}
        />
      );
    return (
      <Dashboard
        budget={budget}
        transactions={transactions}
        onNav={setScreen}
      />
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060c17",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(6,12,23,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1f2d44",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>💰</span>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#e2e8f0" }}>
            BudgetPilot
          </span>
        </div>
        <div style={{ color: "#475569", fontSize: 13 }}>
          Hi, {user.name.split(" ")[0]} 👋
        </div>
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: 540, margin: "0 auto", padding: "24px 16px 100px" }}
      >
        {renderScreen()}
      </div>

      {/* Bottom Nav */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(6,12,23,0.96)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid #1f2d44",
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0 16px",
          zIndex: 100,
        }}
      >
        {navItems.map(({ id, icon, label }) => {
          const active = screen === id || (id === "add" && screen === "add");
          return (
            <button
              key={id}
              onClick={() => {
                setEditTx(null);
                setScreen(id);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: active ? "#60a5fa" : "#334155",
                fontFamily: "inherit",
                transition: "color 0.2s",
                padding: "4px 16px",
              }}
            >
              {id === "add" ? (
                <div
                  style={{
                    background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                    borderRadius: 14,
                    padding: "10px",
                    display: "flex",
                    boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
                    transform: active ? "scale(1.05)" : "scale(1)",
                    transition: "transform 0.2s",
                  }}
                >
                  <Icon name={icon} size={20} />
                </div>
              ) : (
                <Icon name={icon} size={22} />
              )}
              <span
                style={{ fontSize: 11, fontWeight: id === "add" ? 700 : 600 }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
