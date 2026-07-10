'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';
import { useSettings } from '@/lib/hooks/useSettings';
import { uploadFile } from '@/lib/cloudinary';

interface ProfileData {
 firstName: string;
 lastName: string;
 email: string;
 phone: string;
 avatarUrl?: string;
 businessName: string;
 businessAddress: string;
 city: string;
 state: string;
 zipCode: string;
 country: string;
}

interface ProfileTabProps {
 profileData?: ProfileData;
 onSave?: (data: ProfileData) => void;
}

const ProfileTab = ({ profileData: initialData, onSave }: ProfileTabProps) => {
 const { profile, loading, updateProfile } = useSettings();
 const [formData, setFormData] = useState<ProfileData>({
 firstName: '',
 lastName: '',
 email: '',
 phone: '',
 avatarUrl: undefined,
 businessName: '',
 businessAddress: '',
 city: '',
 state: '',
 zipCode: '',
 country: '',
 });
 const [isEditing, setIsEditing] = useState(false);
 const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});
 const [isUploading, setIsUploading] = useState(false);

 useEffect(() => {
 if (profile) {
 setFormData({
 firstName: profile.first_name || '',
 lastName: profile.last_name || '',
 email: profile.email || '',
 phone: profile.phone || '',
 avatarUrl: profile.avatar_url,
 businessName: profile.business_name || '',
 businessAddress: profile.business_address || '',
 city: profile.city || '',
 state: profile.state || '',
 zipCode: profile.zip_code || '',
 country: profile.country || '',
 });
 }
 }, [profile]);

 const validateForm = (): boolean => {
 const newErrors: Partial<Record<keyof ProfileData, string>> = {};

 if (!formData.firstName.trim()) {
 newErrors.firstName = 'First name is required';
 }
 if (!formData.lastName.trim()) {
 newErrors.lastName = 'Last name is required';
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

 const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 if (file.size > 2 * 1024 * 1024) {
 toast.error('File size must be less than 2MB');
 return;
 }
 
 setIsUploading(true);
 try {
 const url = await uploadFile(file, 'invoiceflow_avatars');
 handleInputChange('avatarUrl', url);
 toast.success('Profile picture uploaded successfully');
 } catch (error) {
 console.error('Avatar upload error:', error);
 toast.error('Failed to upload profile picture');
 } finally {
 setIsUploading(false);
 }
 }
 };

 const handleSave = async () => {
 if (isUploading) {
 toast.warning('Please wait for the image upload to finish.');
 return;
 }
 if (validateForm()) {
 try {
 await updateProfile({
 first_name: formData.firstName,
 last_name: formData.lastName,
 phone: formData.phone,
 business_name: formData.businessName,
 business_address: formData.businessAddress,
 city: formData.city,
 state: formData.state,
 zip_code: formData.zipCode,
 country: formData.country,
 avatar_url: formData.avatarUrl,
 });

 toast.success('Profile updated successfully');
 setIsEditing(false);
 } catch (error) {
 console.error('Error saving profile:', error);
 toast.error('Failed to update profile');
 }
 }
 };

 const handleCancel = () => {
 setErrors({});
 setIsEditing(false);
 };

 if (loading.profile) {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
 </div>
 <div className="bg-card rounded-lg shadow-elevation-1 p-6">
 <div className="animate-pulse space-y-4">
 <div className="flex items-center gap-4">
 <div className="w-20 h-20 bg-muted rounded-full"></div>
 <div className="w-32 h-8 bg-muted rounded"></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="h-10 bg-muted rounded"></div>
 <div className="h-10 bg-muted rounded"></div>
 <div className="h-10 bg-muted rounded"></div>
 <div className="h-10 bg-muted rounded"></div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h2 className="text-2xl font-semibold text-foreground">Personal Information</h2>
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
 <div className="mb-6 flex items-center gap-4">
 <div className="relative w-20 h-20 rounded-full border border-border overflow-hidden bg-muted">
 {formData.avatarUrl ? (
 <AppImage
 src={formData.avatarUrl}
 alt={`${formData.firstName} ${formData.lastName}`}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
 <span className="text-2xl font-bold">
 {formData.firstName?.[0]}{formData.lastName?.[0]}
 </span>
 </div>
 )}
 </div>
 {isEditing && (
 <div>
 <input
 type="file"
 accept="image/*"
 onChange={handleAvatarUpload}
 className="hidden"
 id="avatar-upload"
 disabled={isUploading}
 />
 <label
 htmlFor="avatar-upload"
 className={`inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium cursor-pointer transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
 >
 <Icon name="CameraIcon" size={18} />
 <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
 </label>
 <p className="text-xs text-muted-foreground mt-2">
 PNG, JPG up to 2MB
 </p>
 </div>
 )}
 </div>

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
 readOnly
 className="w-full px-4 py-2 border border-transparent bg-muted text-foreground cursor-not-allowed rounded-md transition-smooth"
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
 <h3 className="text-lg font-semibold text-foreground mb-4">Business Details</h3>
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
 disabled={isUploading}
 className={`px-6 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
 >
 {isUploading ? 'Uploading...' : 'Save Changes'}
 </button>
 </div>
 )}
 </div>
 );
};

export default ProfileTab;
