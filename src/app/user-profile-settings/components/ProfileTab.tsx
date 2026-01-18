'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface ProfileTabProps {
  profileData: ProfileData;
  onSave: (data: ProfileData) => void;
}

const ProfileTab = ({ profileData, onSave }: ProfileTabProps) => {
  const [formData, setFormData] = useState<ProfileData>(profileData);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-semibold text-foreground">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
          >
            <Icon name="PencilIcon" size={18} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              First Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              } ${errors.firstName ? 'border-error' : ''}`}
            />
            {errors.firstName && (
              <p className="text-error text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Last Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              } ${errors.lastName ? 'border-error' : ''}`}
            />
            {errors.lastName && (
              <p className="text-error text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address <span className="text-error">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              } ${errors.email ? 'border-error' : ''}`}
            />
            {errors.email && (
              <p className="text-error text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              } ${errors.phone ? 'border-error' : ''}`}
            />
            {errors.phone && (
              <p className="text-error text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Business Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Business Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              } ${errors.businessName ? 'border-error' : ''}`}
            />
            {errors.businessName && (
              <p className="text-error text-xs mt-1">{errors.businessName}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Business Address
            </label>
            <input
              type="text"
              value={formData.businessAddress}
              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">ZIP Code</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-md transition-smooth ${
                isEditing
                  ? 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
                  : 'border-transparent bg-muted text-foreground cursor-not-allowed'
              }`}
            />
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-border rounded-md text-sm font-medium text-foreground transition-smooth hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;