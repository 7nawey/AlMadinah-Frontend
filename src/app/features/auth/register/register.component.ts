import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { getUserFromToken } from '../../../core/utils/jwt.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  tab: 'password' | 'otp' | 'google' = 'password';

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  passwordStrengthPercent = 0;
  hasUpperCase = false;
  hasLowerCase = false;
  hasDigit = false;
  hasSpecialChar = false;
  hasMinLength = false;

  otpEmail = '';
  otp = '';
  step: 'email' | 'otp' | 'success' = 'email';
  otpError = false;
  resendTimer = 0;
  private resendInterval: any;

  googleLoading = false;
  private googleInitialized = false;
  private googleInitTimer: any = null;

  loading = false;
  errorMessage: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initGoogle();
  }

  ngOnDestroy(): void {
    if (this.googleInitTimer) {
      clearTimeout(this.googleInitTimer);
      this.googleInitTimer = null;
    }
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
  }

  initGoogle(): void {
    const w = window as any;

    // The GSI script loads asynchronously — on slow/mobile networks it may not be
    // ready when the component initializes. Wait for it instead of giving up,
    // otherwise the account picker behaves inconsistently between attempts.
    if (!w.google?.accounts?.id) {
      if (!this.googleInitTimer) {
        this.googleInitTimer = setTimeout(() => {
          this.googleInitTimer = null;
          this.initGoogle();
        }, 300);
      }
      return;
    }

    if (w.__googleInitialized) {
      this.googleInitialized = true;
      return;
    }
    w.__googleInitialized = true;

    // No fedcm override: let the library pick the appropriate account-selection
    // flow for the current browser/platform (forcing 'prompt' causes the
    // inconsistent popup behavior on mobile).
    w.google.accounts.id.initialize({
      client_id: '1084661784051-pl1p462bd2fdejs632c04a66cu0lklkd.apps.googleusercontent.com',
      callback: (res: any) => this.handleGoogleCredential(res),
      auto_select: false
    });

    this.googleInitialized = true;
  }

  loginWithGoogle(): void {
    this.errorMessage = null;
    const w = window as any;
    if (!w.google?.accounts?.id) {
      // Not loaded yet — start waiting and ask the user to click again shortly.
      this.initGoogle();
      this.errorMessage = this.i18n.lang === 'ar' ? 'جاري تحميل Google، حاول مرة أخرى خلال لحظات.' : 'Google is still loading, please try again in a moment.';
      return;
    }
    this.googleLoading = true;
    this.initGoogle();
    w.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Google suppressed the prompt (e.g. after a recent dismissal) or it
        // could not be shown — reset the button instead of leaving it stuck.
        this.googleLoading = false;
        this.errorMessage = this.i18n.lang === 'ar'
          ? 'تعذر عرض نافذة Google. أغلقها إن كانت مفتوحة وحاول مرة أخرى.'
          : 'The Google prompt could not be shown. Close it if open and try again.';
      }
    });
  }

  handleGoogleCredential(response: any): void {
    // Clean up Google's prompt UI before navigating away. On mobile, the GSI
    // one-tap flow injects fixed-position containers; if they are left behind
    // they keep the viewport zoomed/pannable on the next page (this is what
    // broke the layout after Google login, but not after password/OTP login).
    try {
      const w = window as any;
      w.google?.accounts?.id?.cancel?.();
      document.getElementById('credential_picker_container')?.remove();
      (document.activeElement as HTMLElement | null)?.blur?.();
    } catch { /* cleanup best-effort only */ }

    this.api.googleLogin(response.credential).subscribe({
      next: (res) => {
        this.googleLoading = false;
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        this.router.navigate(['/']);
      },
      error: () => {
        this.googleLoading = false;
        this.errorMessage = this.i18n.lang === 'ar' ? 'فشل تسجيل الدخول بـ Google' : 'Google login failed';
      }
    });
  }

  registerWithPassword(): void {
    this.errorMessage = null;
    if (!this.name.trim() || !this.email.trim() || !this.password) {
      this.errorMessage = this.i18n.lang === 'ar' ? 'أدخل جميع البيانات المطلوبة.' : 'Fill all required fields.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = this.i18n.lang === 'ar' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.';
      return;
    }
    if (this.passwordStrength === 'weak') {
      this.errorMessage = this.i18n.lang === 'ar' ? 'كلمة المرور ضعيفة، يرجى اختيار كلمة أقوى.' : 'Password is weak, please choose a stronger one.';
      return;
    }

    this.loading = true;
    this.api.register({
      fullName: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      phoneNumber: this.phone.trim(),
      address: ''
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.data?.token) {
          const token = res.data.token;
          localStorage.setItem('token', token);
          const userInfo = getUserFromToken(token);
          if (userInfo) {
            localStorage.setItem('user', JSON.stringify(userInfo));
          }
        }
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = this.i18n.lang === 'ar' ? 'فشل إنشاء الحساب. البريد قد يكون مستخدماً.' : 'Registration failed. Email may be in use.';
        this.loading = false;
      }
    });
  }

  checkPasswordStrength(): void {
    const pwd = this.password;
    this.hasUpperCase = /[A-Z]/.test(pwd);
    this.hasLowerCase = /[a-z]/.test(pwd);
    this.hasDigit = /\d/.test(pwd);
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    this.hasMinLength = pwd.length >= 8;

    const score = [this.hasUpperCase, this.hasLowerCase, this.hasDigit, this.hasSpecialChar, this.hasMinLength]
      .filter(Boolean).length;

    if (pwd.length === 0) {
      this.passwordStrength = 'weak';
      this.passwordStrengthPercent = 0;
    } else if (score <= 2) {
      this.passwordStrength = 'weak';
      this.passwordStrengthPercent = 33;
    } else if (score === 3 || score === 4) {
      this.passwordStrength = 'medium';
      this.passwordStrengthPercent = 66;
    } else {
      this.passwordStrength = 'strong';
      this.passwordStrengthPercent = 100;
    }
  }

  get passwordStrengthMessage(): string {
    const msgs = {
      weak: this.i18n.lang === 'ar' ? 'ضعيفة' : 'Weak',
      medium: this.i18n.lang === 'ar' ? 'متوسطة' : 'Medium',
      strong: this.i18n.lang === 'ar' ? 'قوية' : 'Strong'
    };
    return msgs[this.passwordStrength];
  }

  sendOtp(): void {
    this.errorMessage = null;
    const email = this.otpEmail.trim();
    if (!email || !this.isValidEmail(email)) {
      this.errorMessage = this.i18n.lang === 'ar' ? 'أدخل بريد إلكتروني صحيح.' : 'Enter a valid email.';
      return;
    }
    this.loading = true;
    this.api.sendOtp(email).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'otp';
        this.resetOtpFields();
        this.startResendTimer();
      },
      error: (err: any) => {
        if (err.status === 200 && !err.ok) {
          this.step = 'otp';
          this.resetOtpFields();
          this.startResendTimer();
          this.loading = false;
          return;
        }
        if (err.status === 400 || err.status === 409) {
          this.errorMessage = this.i18n.lang === 'ar'
            ? 'تم إرسال رمز التحقق، يرجى مراجعة بريدك الإلكتروني.'
            : 'OTP sent, please check your email.';
          this.step = 'otp';
          this.resetOtpFields();
          this.startResendTimer();
          this.loading = false;
        } else {
          this.errorMessage = this.i18n.lang === 'ar' ? 'فشل إرسال OTP.' : 'Failed to send OTP.';
          this.loading = false;
        }
      }
    });
  }

  resendOtp(): void {
    if (this.resendTimer > 0) return;
    this.sendOtp();
  }

  verifyAndRegister(): void {
    const otp = this.otp.trim();
    if (otp.length < 6) {
      this.otpError = true;
      return;
    }
    this.otpError = false;
    this.loading = true;

    this.api.verifyOtp({ email: this.otpEmail, otp }).subscribe({
      next: (res) => {
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        this.loading = false;
        this.step = 'success';
        setTimeout(() => this.router.navigate(['/']), 1200);
      },
      error: () => {
        this.loading = false;
        this.otpError = true;
        this.resetOtpFields();
      }
    });
  }

  backToEmail(): void {
    this.step = 'email';
    this.otpError = false;
    this.clearResendTimer();
    this.resetOtpFields();
  }

  onOtpInput(): void {
    this.otp = this.otp.replace(/\D/g, '');
  }

  private resetOtpFields(): void {
    this.otp = '';
    this.otpError = false;
  }

  private startResendTimer(): void {
    this.resendTimer = 60;
    if (this.resendInterval) clearInterval(this.resendInterval);
    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer === 0) {
        clearInterval(this.resendInterval);
      }
    }, 1000);
  }

  private clearResendTimer(): void {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
    this.resendTimer = 0;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
