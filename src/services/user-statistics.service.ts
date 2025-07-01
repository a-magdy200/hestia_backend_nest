import { User } from '../database/entities/user.entity';
import { UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';

export function calculateBasicStatistics(
  users: User[],
  totalUsers: number,
): {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  suspendedUsers: number;
  lockedUsers: number;
  pendingVerificationUsers: number;
} {
  const activeUsers = users.filter(u => u.status === UserStatus.ACTIVE).length;
  const inactiveUsers = users.filter(u => u.status === UserStatus.INACTIVE).length;
  const suspendedUsers = users.filter(u => u.status === UserStatus.SUSPENDED).length;
  const lockedUsers = users.filter(u => u.status === UserStatus.LOCKED).length;
  const pendingVerificationUsers = users.filter(
    u => u.status === UserStatus.PENDING_VERIFICATION,
  ).length;

  const verifiedUsers = users.filter(
    u => u.emailVerificationStatus === UserVerificationStatus.VERIFIED,
  ).length;
  const unverifiedUsers = users.filter(
    u => u.emailVerificationStatus === UserVerificationStatus.UNVERIFIED,
  ).length;

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    verifiedUsers,
    unverifiedUsers,
    suspendedUsers,
    lockedUsers,
    pendingVerificationUsers,
  };
}

export function calculateTimeBasedStatistics(users: User[]): {
  recentRegistrations: number;
  activeUsersLast30Days: number;
  activeUsersLast7Days: number;
  activeUsersLast24Hours: number;
  averageLoginFrequency: number;
} {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentRegistrations = users.filter(u => u.createdAt >= thirtyDaysAgo).length;
  const activeUsersLast30Days = users.filter(
    u => u.lastLoginAt && u.lastLoginAt >= thirtyDaysAgo,
  ).length;
  const activeUsersLast7Days = users.filter(
    u => u.lastLoginAt && u.lastLoginAt >= sevenDaysAgo,
  ).length;
  const activeUsersLast24Hours = users.filter(
    u => u.lastLoginAt && u.lastLoginAt >= oneDayAgo,
  ).length;

  const usersWithRecentLogin = users.filter(u => u.lastLoginAt && u.lastLoginAt >= thirtyDaysAgo);
  const averageLoginFrequency =
    usersWithRecentLogin.length > 0 ? usersWithRecentLogin.length / users.length : 0;

  return {
    recentRegistrations,
    activeUsersLast30Days,
    activeUsersLast7Days,
    activeUsersLast24Hours,
    averageLoginFrequency,
  };
}

export function calculateSecurityStatistics(users: User[]): {
  usersWithFailedAttempts: number;
  usersWithHighFailedAttempts: number;
} {
  const usersWithFailedAttempts = users.filter(u => u.failedLoginAttempts > 0).length;
  const usersWithHighFailedAttempts = users.filter(u => u.failedLoginAttempts >= 5).length;

  return {
    usersWithFailedAttempts,
    usersWithHighFailedAttempts,
  };
}

export function countUsersByRole(users: User[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const user of users) {
    counts[user.role] = (counts[user.role] || 0) + 1;
  }
  return counts;
}

export function countUsersByStatus(users: User[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const user of users) {
    counts[user.status] = (counts[user.status] || 0) + 1;
  }
  return counts;
}

export function calculateAccountAgeStatistics(users: User[]): {
  averageAge: number;
  oldestAccount: number;
  newestAccount: number;
  accountsByAge: Record<string, number>;
} {
  const now = new Date();
  const accountAges = users.map(user => {
    const ageInDays = Math.floor(
      (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    return ageInDays;
  });

  const averageAge =
    accountAges.length > 0
      ? accountAges.reduce((sum, age) => sum + age, 0) / accountAges.length
      : 0;

  const oldestAccount = Math.max(...accountAges, 0);
  const newestAccount = Math.min(...accountAges, 0);

  // Group accounts by age ranges
  const accountsByAge: Record<string, number> = {
    '0-7 days': accountAges.filter(age => age <= 7).length,
    '8-30 days': accountAges.filter(age => age > 7 && age <= 30).length,
    '31-90 days': accountAges.filter(age => age > 30 && age <= 90).length,
    '91-365 days': accountAges.filter(age => age > 90 && age <= 365).length,
    '1+ years': accountAges.filter(age => age > 365).length,
  };

  return {
    averageAge: Math.round(averageAge),
    oldestAccount,
    newestAccount,
    accountsByAge,
  };
}

export function calculateLastLoginStatistics(users: User[]): {
  usersWithLoginHistory: number;
  usersNeverLoggedIn: number;
  averageDaysSinceLastLogin: number;
  loginActivityByPeriod: Record<string, number>;
} {
  const now = new Date();
  const usersWithLoginHistory = users.filter(u => u.lastLoginAt).length;
  const usersNeverLoggedIn = users.filter(u => !u.lastLoginAt).length;

  const daysSinceLastLogin = users
    .filter(u => u.lastLoginAt)
    .map(u => {
      const lastLoginAt = u.lastLoginAt;
      if (!lastLoginAt) return 0;
      return Math.floor((now.getTime() - lastLoginAt.getTime()) / (1000 * 60 * 60 * 24));
    });

  const averageDaysSinceLastLogin =
    daysSinceLastLogin.length > 0
      ? daysSinceLastLogin.reduce((sum, days) => sum + days, 0) / daysSinceLastLogin.length
      : 0;

  // Group login activity by time periods
  const loginActivityByPeriod: Record<string, number> = {
    'Last 24 hours': users.filter(
      u => u.lastLoginAt && now.getTime() - u.lastLoginAt.getTime() <= 24 * 60 * 60 * 1000,
    ).length,
    'Last 7 days': users.filter(
      u => u.lastLoginAt && now.getTime() - u.lastLoginAt.getTime() <= 7 * 24 * 60 * 60 * 1000,
    ).length,
    'Last 30 days': users.filter(
      u => u.lastLoginAt && now.getTime() - u.lastLoginAt.getTime() <= 30 * 24 * 60 * 60 * 1000,
    ).length,
    'Last 90 days': users.filter(
      u => u.lastLoginAt && now.getTime() - u.lastLoginAt.getTime() <= 90 * 24 * 60 * 60 * 1000,
    ).length,
    'More than 90 days': users.filter(
      u => u.lastLoginAt && now.getTime() - u.lastLoginAt.getTime() > 90 * 24 * 60 * 60 * 1000,
    ).length,
  };

  return {
    usersWithLoginHistory,
    usersNeverLoggedIn,
    averageDaysSinceLastLogin: Math.round(averageDaysSinceLastLogin),
    loginActivityByPeriod,
  };
}

export function calculateTenantStatistics(users: User[]): {
  totalTenants: number;
  usersByTenant: Record<string, number>;
  averageUsersPerTenant: number;
} {
  const tenantUserCounts: Record<string, number> = {};

  users.forEach(user => {
    const tenantId = user.tenantId || 'default';
    tenantUserCounts[tenantId] = (tenantUserCounts[tenantId] || 0) + 1;
  });

  const totalTenants = Object.keys(tenantUserCounts).length;
  const totalUsers = users.length;
  const averageUsersPerTenant = totalTenants > 0 ? totalUsers / totalTenants : 0;

  return {
    totalTenants,
    usersByTenant: tenantUserCounts,
    averageUsersPerTenant: Math.round(averageUsersPerTenant * 100) / 100,
  };
}

export function calculateDetailedStatistics(users: User[]): {
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
  accountAgeStats: {
    averageAge: number;
    oldestAccount: number;
    newestAccount: number;
    accountsByAge: Record<string, number>;
  };
  lastLoginStats: {
    usersWithLoginHistory: number;
    usersNeverLoggedIn: number;
    averageDaysSinceLastLogin: number;
    loginActivityByPeriod: Record<string, number>;
  };
  tenantStats: {
    totalTenants: number;
    usersByTenant: Record<string, number>;
    averageUsersPerTenant: number;
  };
} {
  const usersByRole = countUsersByRole(users);
  const usersByStatus = countUsersByStatus(users);
  const accountAgeStats = calculateAccountAgeStatistics(users);
  const lastLoginStats = calculateLastLoginStatistics(users);
  const tenantStats = calculateTenantStatistics(users);

  return {
    usersByRole,
    usersByStatus,
    accountAgeStats,
    lastLoginStats,
    tenantStats,
  };
}
