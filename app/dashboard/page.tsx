"use client";

import { useState } from "react";
import { Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const [form, setForm] = useState({
    full_name: "Demo User",
    phone: "01700000000",
    email: "demo@aristo.com.bd",
  });
  const [saved, setSaved] = useState(false);
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      <div className="bg-background border border-border rounded-xl p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="relative">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent text-2xl font-bold">
              {form.full_name.slice(0, 2).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center">
              <Camera size={12} />
            </button>
          </div>
          <div>
            <p className="font-bold text-foreground">{form.full_name}</p>
            <p className="text-muted-foreground text-sm">{form.email}</p>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              Full Name
            </label>
            <input
              value={form.full_name}
              onChange={set("full_name")}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={set("phone")}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              className="input-field"
              required
            />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-foreground/90 active:scale-95 transition-all"
            >
              <Save size={15} /> Save Changes
            </button>
            {saved && (
              <span className="flex items-center text-emerald-600 text-sm font-medium">
                Profile updated!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
