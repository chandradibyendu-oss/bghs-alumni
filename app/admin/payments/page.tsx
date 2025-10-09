/**
 * Admin Payment Configuration Page
 * Allows admin to configure payment amounts, categories, and settings
 * Access at: /admin/payments
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CreditCard,
  ToggleLeft,
  ToggleRight,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PaymentConfig {
  id: string;
  category: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  is_active: boolean;
  is_mandatory: boolean;
  payment_gateway: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export default function AdminPaymentsPage() {
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PaymentConfig | null>(null);
  const [formData, setFormData] = useState({
    category: 'registration_fee',
    name: '',
    description: '',
    amount: '' as string | number, // Allow empty string for better UX
    currency: 'INR',
    is_active: true,
    is_mandatory: false,
    payment_gateway: 'razorpay',
  });
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
        router.push('/dashboard');
        return;
      }

      setIsAuthorized(true);
      await loadConfigs();
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadConfigs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payment_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading configs:', error);
      alert('Failed to load payment configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingConfig(null);
    setFormData({
      category: 'registration_fee',
      name: '',
      description: '',
      amount: '', // Empty string for clean input
      currency: 'INR',
      is_active: true,
      is_mandatory: false,
      payment_gateway: 'razorpay',
    });
    setShowForm(true);
  };

  const handleEdit = (config: PaymentConfig) => {
    setEditingConfig(config);
    setFormData({
      category: config.category,
      name: config.name,
      description: config.description || '',
      amount: config.amount,
      currency: config.currency,
      is_active: config.is_active,
      is_mandatory: config.is_mandatory,
      payment_gateway: config.payment_gateway,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const amountValue = typeof formData.amount === 'string' 
        ? parseFloat(formData.amount) 
        : formData.amount;
      
      if (!formData.name || isNaN(amountValue) || amountValue < 0) {
        alert('Please fill all required fields with valid amount');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        return;
      }

      if (editingConfig) {
        // Update existing
        const { error } = await supabase
          .from('payment_configurations')
          .update({
            category: formData.category,
            name: formData.name,
            description: formData.description || null,
            amount: amountValue, // Use converted amount
            currency: formData.currency,
            is_active: formData.is_active,
            is_mandatory: formData.is_mandatory,
            payment_gateway: formData.payment_gateway,
          })
          .eq('id', editingConfig.id);

        if (error) throw error;
        alert('Configuration updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('payment_configurations')
          .insert({
            category: formData.category,
            name: formData.name,
            description: formData.description || null,
            amount: amountValue, // Use converted amount
            currency: formData.currency,
            is_active: formData.is_active,
            is_mandatory: formData.is_mandatory,
            payment_gateway: formData.payment_gateway,
            created_by: session.user.id,
          });

        if (error) throw error;
        alert('Configuration created successfully!');
      }

      setShowForm(false);
      loadConfigs();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Failed to save: ${error.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('payment_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Configuration deleted successfully!');
      loadConfigs();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const toggleActive = async (config: PaymentConfig) => {
    try {
      const { error } = await supabase
        .from('payment_configurations')
        .update({ is_active: !config.is_active })
        .eq('id', config.id);

      if (error) throw error;
      loadConfigs();
    } catch (error: any) {
      console.error('Toggle error:', error);
      alert(`Failed to toggle: ${error.message}`);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      registration_fee: 'Registration Fee',
      event_fee: 'Event Fee',
      donation: 'Donation',
      membership_renewal: 'Membership Renewal',
      other: 'Other',
    };
    return labels[category] || category;
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment Configuration</h1>
                <p className="text-gray-600 mt-1">
                  Manage payment amounts, categories, and settings
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreate}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Configuration
            </button>
          </div>
        </div>

        {/* Configurations List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : configs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Payment Configurations
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first payment configuration to start accepting payments
            </p>
            <button onClick={handleCreate} className="btn-primary">
              <Plus className="w-5 h-5 inline mr-2" />
              Add Configuration
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {configs.map((config) => (
              <div
                key={config.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {config.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryLabel(config.category)}
                      </span>
                      {config.is_mandatory && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Mandatory
                        </span>
                      )}
                      <button
                        onClick={() => toggleActive(config)}
                        className="flex items-center gap-1"
                      >
                        {config.is_active ? (
                          <>
                            <ToggleRight className="w-6 h-6 text-green-600" />
                            <span className="text-xs text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </div>

                    {config.description && (
                      <p className="text-gray-600 mb-3">{config.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">
                          ₹{config.amount.toFixed(2)}
                        </span>
                        <span>{config.currency}</span>
                      </div>
                      <div>
                        Gateway: <span className="font-medium">{config.payment_gateway}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(config)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id, config.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingConfig ? 'Edit Configuration' : 'New Payment Configuration'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="registration_fee">Registration Fee</option>
                      <option value="event_fee">Event Fee</option>
                      <option value="donation">Donation</option>
                      <option value="membership_renewal">Membership Renewal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Configuration Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., New Member Registration Fee"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Brief description of this payment configuration"
                    />
                  </div>

                  {/* Amount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formData.amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty, numbers, and decimal point
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setFormData({ ...formData, amount: value });
                          }
                        }}
                        onBlur={(e) => {
                          // Format on blur if valid number
                          const value = e.target.value;
                          if (value && !isNaN(parseFloat(value))) {
                            setFormData({ ...formData, amount: parseFloat(value).toFixed(2) });
                          }
                        }}
                        className="input-field"
                        placeholder="Enter amount (e.g., 500.00)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.currency === 'INR' && '₹ RazorPay supports decimals (paise)'}
                        {formData.currency === 'USD' && '$ Decimals supported (cents)'}
                        {formData.currency === 'EUR' && '€ Decimals supported (cents)'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="input-field"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Gateway */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Gateway
                    </label>
                    <select
                      value={formData.payment_gateway}
                      onChange={(e) => setFormData({ ...formData, payment_gateway: e.target.value })}
                      className="input-field"
                    >
                      <option value="razorpay">RazorPay</option>
                      <option value="manual">Manual/Offline</option>
                    </select>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Active</span>
                        <p className="text-sm text-gray-600">
                          Enable this payment configuration
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_mandatory}
                        onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Mandatory</span>
                        <p className="text-sm text-gray-600">
                          Payment is required (cannot be skipped)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setShowForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingConfig ? 'Update' : 'Create'} Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
