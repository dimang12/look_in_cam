import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface SettingsSection {
  title: string;
  icon: string;
  settings: Setting[];
}

interface Setting {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'input' | 'select';
  value: any;
  options?: { value: any; label: string }[];
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  settingsForm!: FormGroup;
  currentDate = new Date();
  
  settingsSections: SettingsSection[] = [
    {
      title: 'General Settings',
      icon: 'settings',
      settings: [
        {
          key: 'siteName',
          label: 'Site Name',
          description: 'The name of your application',
          type: 'input',
          value: 'Wholly City Admin'
        },
        {
          key: 'siteDescription',
          label: 'Site Description',
          description: 'Brief description of your application',
          type: 'input',
          value: 'Administrative portal for content management'
        },
        {
          key: 'maintenanceMode',
          label: 'Maintenance Mode',
          description: 'Enable maintenance mode to restrict access',
          type: 'toggle',
          value: false
        }
      ]
    },
    {
      title: 'Content Settings',
      icon: 'article',
      settings: [
        {
          key: 'autoPublish',
          label: 'Auto Publish',
          description: 'Automatically publish content after creation',
          type: 'toggle',
          value: false
        },
        {
          key: 'defaultContentType',
          label: 'Default Content Type',
          description: 'Default type for new content',
          type: 'select',
          value: 'news',
          options: [
            { value: 'news', label: 'News' },
            { value: 'article', label: 'Article' },
            { value: 'announcement', label: 'Announcement' }
          ]
        },
        {
          key: 'contentModeration',
          label: 'Content Moderation',
          description: 'Require approval before publishing',
          type: 'toggle',
          value: true
        }
      ]
    },
    {
      title: 'User Settings',
      icon: 'people',
      settings: [
        {
          key: 'allowUserRegistration',
          label: 'Allow User Registration',
          description: 'Allow new users to register accounts',
          type: 'toggle',
          value: true
        },
        {
          key: 'defaultUserRole',
          label: 'Default User Role',
          description: 'Default role assigned to new users',
          type: 'select',
          value: 'user',
          options: [
            { value: 'user', label: 'User' },
            { value: 'moderator', label: 'Moderator' }
          ]
        },
        {
          key: 'requireEmailVerification',
          label: 'Email Verification',
          description: 'Require email verification for new accounts',
          type: 'toggle',
          value: true
        }
      ]
    },
    {
      title: 'Security Settings',
      icon: 'security',
      settings: [
        {
          key: 'sessionTimeout',
          label: 'Session Timeout (hours)',
          description: 'Time before admin sessions expire',
          type: 'input',
          value: 24
        },
        {
          key: 'twoFactorAuth',
          label: 'Two-Factor Authentication',
          description: 'Enable 2FA for admin accounts',
          type: 'toggle',
          value: false
        },
        {
          key: 'logLoginAttempts',
          label: 'Log Login Attempts',
          description: 'Track and log all login attempts',
          type: 'toggle',
          value: true
        }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    const formControls: any = {};
    
    this.settingsSections.forEach(section => {
      section.settings.forEach(setting => {
        formControls[setting.key] = [setting.value];
      });
    });
    
    this.settingsForm = this.fb.group(formControls);
  }

  onSaveSettings(): void {
    if (this.settingsForm.valid) {
      // Here you would typically save to your backend
      console.log('Settings saved:', this.settingsForm.value);
      
      this.snackBar.open('Settings saved successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  onResetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      this.initializeForm();
      this.snackBar.open('Settings reset to defaults', 'Close', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
    }
  }

  getSettingValue(key: string): any {
    return this.settingsForm.get(key)?.value;
  }

  updateSetting(key: string, value: any): void {
    this.settingsForm.patchValue({ [key]: value });
  }
}