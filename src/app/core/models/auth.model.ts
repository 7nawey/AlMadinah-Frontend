export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address: string;
  isActive: boolean;
  isBlocked: boolean;
  isFlagged: boolean;
  createdAt: string;
  role: string;
  returnCount: number;
}

export interface RegisterUserDto {
  fullName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber?: string;
}

export interface LoginUserDto {
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface UpdateUserDto {
  id: string;
  fullName: string;
  email: string;
  address: string;
  phoneNumber?: string;
  isActive: boolean;
}

export interface SendOtpDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

// Backend register/login return { token: string } only
export interface TokenOnlyResponse {
  token: string;
}

// Backend verify-otp and google-login return full auth response
export interface AuthResponseDto {
  token: string;
  user: UserDto;
}
