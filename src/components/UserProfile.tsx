import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineXMark, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

interface UserProfileProps {
  onClose: () => void;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

export const UserProfile = ({ onClose }: UserProfileProps) => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  // Profile form state
  const [clientName, setClientName] = useState(profile?.client_name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update client name when profile changes
  useEffect(() => {
    if (profile?.client_name !== undefined) {
      setClientName(profile?.client_name || '');
    }
  }, [profile]);

  // Password requirements validation
  const passwordRequirements: PasswordRequirement[] = [
    { text: 'At least 8 characters long', met: newPassword.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(newPassword) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(newPassword) },
    { text: 'Contains number', met: /\d/.test(newPassword) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
    { text: 'Passwords match', met: newPassword === confirmPassword && newPassword.length > 0 }
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);

const handleProfileUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsUpdatingProfile(true);

  try {
    await updateProfile({ client_name: clientName });
  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    setIsUpdatingProfile(false);
  }
};

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allRequirementsMet) {
      toast({
        title: "Password requirements not met",
        description: "Please ensure all password requirements are satisfied.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "There was an error updating your password.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-main relative overflow-hidden">
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-music-text hover:bg-music-text/10"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-music-text">Profile & Settings</h1>
        </div>
      </div>

      <div className="pt-20 px-4 pb-20 h-full overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Information */}
          <Card className="bg-card/95 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-music-text">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
</div>
<div className="space-y-2">
  <Label htmlFor="client-name">Client/Artist Name</Label>
  <Input
    id="client-name"
    type="text"
    value={clientName}
    onChange={(e) => setClientName(e.target.value)}
    placeholder="Enter your display name"
    disabled={isUpdatingProfile}
  />
</div>
<Button 
  type="submit" 
  className="w-full"
  disabled={isUpdatingProfile || clientName === profile?.client_name}
>
  {isUpdatingProfile ? "Updating..." : "Update Profile"}
</Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-card/95 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-music-text">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={isUpdatingPassword}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={isUpdatingPassword}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Password Requirements */}
                {newPassword && (
                  <div className="space-y-2">
                    <Label className="text-sm text-music-text/70">Password Requirements:</Label>
                    <div className="space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {req.met ? (
                            <HiOutlineCheck className="w-3 h-3 text-green-500" />
                          ) : (
                            <HiOutlineXMark className="w-3 h-3 text-red-500" />
                          )}
                          <span className={req.met ? "text-green-500" : "text-red-500"}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={isUpdatingPassword}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isUpdatingPassword || !allRequirementsMet}
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="bg-card/95 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-music-text">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-music-text/70">Account Created:</span>
                <span className="text-sm text-music-text">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-music-text/70">Last Sign In:</span>
                <span className="text-sm text-music-text">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-music-text/70">Email Verified:</span>
                <span className={`text-sm ${user?.email_confirmed_at ? 'text-green-500' : 'text-red-500'}`}>
                  {user?.email_confirmed_at ? 'Yes' : 'No'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};