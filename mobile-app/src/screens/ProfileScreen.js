import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Dialog, Portal, IconButton, Avatar, Divider } from 'react-native-paper';
import CustomHeader from '../components/CustomHeader';
import { AuthContext } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { colors, spacing } from '../config/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.get();
      const data = response.data.data;
      setProfile(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setPhone(data.phone);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await profileAPI.update({
        firstName,
        lastName,
        phone,
      });
      setEditing(false);
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      return;
    }

    setLoading(true);
    try {
      await profileAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Profile" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <IconButton icon={icon} size={24} iconColor={colors.dark.primary} style={{ margin: 0 }} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <IconButton icon="chevron-right" size={24} iconColor={colors.dark.textSecondary} style={{ margin: 0 }} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Profile" 
        onBack={() => navigation.goBack()}
        rightIcon={editing ? "check" : "pencil"}
        onRightPress={() => {
          if (editing) {
            handleUpdateProfile();
          } else {
            setEditing(true);
          }
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={profile.firstName?.charAt(0) || 'U'} 
            style={styles.avatar}
            color={colors.dark.primary}
            labelStyle={styles.avatarLabel}
          />
          <Text style={styles.email}>{profile.email}</Text>
          <View style={styles.statusBadge}>
            <IconButton 
              icon={profile.isLocked ? "lock" : "check-circle"} 
              size={16} 
              iconColor={profile.isLocked ? colors.dark.error : colors.dark.success}
              style={{ margin: 0 }}
            />
            <Text style={[styles.statusText, { color: profile.isLocked ? colors.dark.error : colors.dark.success }]}>
              {profile.isLocked ? 'Locked' : 'Active'}
            </Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              mode="flat"
              disabled={!editing}
              style={styles.input}
              textColor={colors.dark.text}
              theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
            <Divider style={styles.divider} />
            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              mode="flat"
              disabled={!editing}
              style={styles.input}
              textColor={colors.dark.text}
              theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
            <Divider style={styles.divider} />
            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              mode="flat"
              disabled={!editing}
              keyboardType="phone-pad"
              style={styles.input}
              textColor={colors.dark.text}
              theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>UPI PIN</Text>
              <Text style={[styles.detailValue, { color: profile.hasUpiPin ? colors.dark.success : colors.dark.warning }]}>
                {profile.hasUpiPin ? 'Set' : 'Not Set'}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailValue}>
                {new Date(profile.createdAt).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <MenuItem 
              icon="lock-reset" 
              title="Change Password" 
              subtitle="Update your login password"
              onPress={() => setShowPasswordDialog(true)}
            />
            <Divider style={styles.divider} />
            <MenuItem 
              icon="lock" 
              title="UPI PIN" 
              subtitle={profile.hasUpiPin ? "Change your UPI PIN" : "Set your UPI PIN"}
              onPress={() => navigation.navigate('UPIPin')}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <IconButton icon="logout" size={24} iconColor={colors.dark.error} style={{ margin: 0 }} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Change Password Dialog */}
      <Portal>
        <Dialog 
          visible={showPasswordDialog} 
          onDismiss={() => setShowPasswordDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              secureTextEntry
              style={styles.dialogInput}
              outlineColor={colors.dark.border}
              activeOutlineColor={colors.dark.primary}
              textColor={colors.dark.text}
              theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
            />

            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry
              style={styles.dialogInput}
              outlineColor={colors.dark.border}
              activeOutlineColor={colors.dark.primary}
              textColor={colors.dark.text}
              theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
            />

            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.dialogInput}
              outlineColor={colors.dark.border}
              activeOutlineColor={colors.dark.primary}
              textColor={colors.dark.text}
              theme={{ colors: { onSurfaceVariant: colors.dark.textSecondary } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPasswordDialog(false)} textColor={colors.dark.textSecondary}>
              Cancel
            </Button>
            <Button 
              onPress={handleChangePassword} 
              loading={loading}
              mode="contained"
              buttonColor={colors.dark.primary}
            >
              Change
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.dark.textSecondary,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  avatar: {
    backgroundColor: colors.dark.cardElevated,
    marginBottom: spacing.md,
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: '700',
  },
  email: {
    fontSize: 16,
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.cardElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: -4,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  input: {
    backgroundColor: colors.dark.surface,
    paddingHorizontal: spacing.md,
  },
  divider: {
    backgroundColor: colors.dark.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.dark.text,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.dark.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark.error,
    marginLeft: -4,
  },
  dialog: {
    backgroundColor: colors.dark.surface,
    borderRadius: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.dark.text,
  },
  dialogInput: {
    marginBottom: spacing.md,
    backgroundColor: colors.dark.surface,
  },
});
