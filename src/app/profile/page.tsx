"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { User, Mail, Phone, Calendar, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    phone: profile?.phone || '',
  });

  // Redirect if not authenticated
  if (!loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Prístup zamietnutý</h1>
          <p className="text-gray-600">Pre zobrazenie tejto stránky sa musíte prihlásiť.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EE4C7C]"></div>
      </div>
    );
  }

  return (
    <main className="px-4 sm:px-6 lg:px-20 py-10 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-black flex items-center gap-3">
              <User className="h-8 w-8 text-[#EE4C7C]" />
              Môj profil
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#EE4C7C] hover:bg-[#9A1750] text-white font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
              >
                Upraviť profil
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#EE4C7C]" />
                    Meno
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] disabled:opacity-50"
                    placeholder="Vaše meno"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#EE4C7C]" />
                    Priezvisko
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] disabled:opacity-50"
                    placeholder="Vaše priezvisko"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#EE4C7C]" />
                  Email
                </span>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                  placeholder="Váš email"
                />
                <p className="text-xs text-gray-500">Email sa nedá zmeniť</p>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#EE4C7C]" />
                  Telefón
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EE4C7C] disabled:opacity-50"
                  placeholder="+421 900 123 456"
                />
              </label>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#EE4C7C] hover:bg-[#9A1750] text-white font-semibold py-3 px-6 rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {saving ? 'Ukladá sa...' : 'Uložiť zmeny'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: profile?.first_name || '',
                      lastName: profile?.last_name || '',
                      phone: profile?.phone || '',
                    });
                  }}
                  disabled={saving}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  Zrušiť
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#EE4C7C]" />
                    Meno
                  </span>
                  <p className="text-lg text-gray-900">{profile?.firstName || 'Nie je zadané'}</p>
                  <p className="text-lg text-gray-900">{profile?.first_name || 'Nie je zadané'}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#EE4C7C]" />
                    Priezvisko
                  </span>
                  <p className="text-lg text-gray-900">{profile?.lastName || 'Nie je zadané'}</p>
                  <p className="text-lg text-gray-900">{profile?.last_name || 'Nie je zadané'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#EE4C7C]" />
                  Email
                </span>
                <p className="text-lg text-gray-900">{user?.email}</p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#EE4C7C]" />
                  Telefón
                </span>
                <p className="text-lg text-gray-900">{profile?.phone || 'Nie je zadané'}</p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#EE4C7C]" />
                  Registrovaný od
                </span>
                <p className="text-lg text-gray-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('sk-SK') : 'Neznáme'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}