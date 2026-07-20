export interface PaymentInfo {
    isFullyPaid: boolean;
    hasCohort: boolean;
    hasStarted: boolean;
    isExpired: boolean;
    paymentPlan: 'full' | '50_percent';
    amountPaid: number;
    totalAmount: number;
    remainingBalance: number;
    courseType: 'foundation' | 'professional';
    courseTitle: string;
    cohortName: string;
    startDate: Date | null;
    deadlineDate: Date | null;
    durationDays: number;
    daysRemaining: number;
    hoursRemaining: number;
    minutesRemaining: number;
    secondsRemaining: number;
    bannerLevel: 'none' | 'yellow' | 'orange' | 'red' | 'expired';
}

export function getPaymentInfo(user: any, cohort: any): PaymentInfo {
    // 1. Determine Payment Plan
    const rawPlan = (user?.payment_plan || cohort?.pivot?.payment_plan || '').toString().toLowerCase();

    const isFiftyPercent = (
        rawPlan === 'installment' || 
        rawPlan === '50_percent' || 
        rawPlan === '50%' || 
        rawPlan === 'partial' || 
        rawPlan === 'half'
    );

    // The payment tracking banner/lock should ONLY show when the instructor explicitly makes it active or student chose 50% plan
    const isExplicitlyActivated = 
        user?.payment_tracking_enabled === true || 
        user?.payment_tracking_enabled === 1 || 
        user?.payment_tracking_enabled === '1' ||
        cohort?.payment_tracking_enabled === true || 
        cohort?.payment_tracking_enabled === 1 || 
        cohort?.payment_tracking_enabled === '1' ||
        cohort?.pivot?.payment_tracking_enabled === true || 
        cohort?.pivot?.payment_tracking_enabled === 1 ||
        isFiftyPercent;

    // Course Title & Type Resolution
    const courseTitle = cohort?.course?.title || cohort?.name || user?.course_name || 'Foundation Academy';
    const titleLower = courseTitle.toLowerCase();
    const isPro = titleLower.includes('professional') || titleLower.includes('master');
    const courseType: 'foundation' | 'professional' = isPro ? 'professional' : 'foundation';
    const durationDays = isPro ? 14 : 7;

    // Prices: Foundation = $999 total ($500 paid, $499 remaining), Professional = $1,499 total ($750 paid, $749 remaining)
    const totalAmount = isPro ? 1499 : 999;
    const remainingBalance = isFiftyPercent ? (isPro ? 749 : 499) : 0;
    const amountPaid = isFiftyPercent ? (isPro ? 750 : 500) : totalAmount;

    // If NOT explicitly activated by instructor AND not 50% plan, treat as fully paid with no banner or lock
    if (!isExplicitlyActivated) {
        return {
            isFullyPaid: true,
            hasCohort: !!cohort,
            hasStarted: false,
            isExpired: false,
            paymentPlan: 'full',
            amountPaid: totalAmount,
            totalAmount: totalAmount,
            remainingBalance: 0,
            courseType,
            courseTitle,
            cohortName: cohort?.name || 'Assigned Cohort',
            startDate: cohort?.start_date ? new Date(cohort.start_date) : null,
            deadlineDate: null,
            durationDays,
            daysRemaining: 0,
            hoursRemaining: 0,
            minutesRemaining: 0,
            secondsRemaining: 0,
            bannerLevel: 'none'
        };
    }

    const isFullyPaid = !isFiftyPercent && (rawPlan === 'full' || rawPlan === 'fully_paid' || rawPlan === '100%' || rawPlan === 'completed' || user?.payment_status === 'approved');

    // 3. Cohort Start Date
    const hasCohort = !!cohort;
    const rawStartDate = cohort?.start_date || cohort?.pivot?.created_at;
    let startDate: Date | null = null;
    let deadlineDate: Date | null = null;

    if (rawStartDate) {
        startDate = new Date(rawStartDate);
        if (isNaN(startDate.getTime())) {
            startDate = new Date();
        }
        deadlineDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    }

    const now = new Date();
    const hasStarted = startDate ? now >= startDate : false;

    let isExpired = false;
    let daysRemaining = 0;
    let hoursRemaining = 0;
    let minutesRemaining = 0;
    let secondsRemaining = 0;
    let bannerLevel: 'none' | 'yellow' | 'orange' | 'red' | 'expired' = 'none';

    if (isFullyPaid) {
        bannerLevel = 'none';
    } else if (!hasCohort || !startDate || !hasStarted) {
        bannerLevel = 'none';
    } else if (deadlineDate) {
        const diffMs = deadlineDate.getTime() - now.getTime();

        if (diffMs <= 0) {
            isExpired = true;
            bannerLevel = 'expired';
        } else {
            const totalSecs = Math.floor(diffMs / 1000);
            daysRemaining = Math.floor(totalSecs / (3600 * 24));
            hoursRemaining = Math.floor((totalSecs % (3600 * 24)) / 3600);
            minutesRemaining = Math.floor((totalSecs % 3600) / 60);
            secondsRemaining = totalSecs % 60;

            const totalHoursLeft = diffMs / (1000 * 60 * 60);

            if (totalHoursLeft <= 48) {
                bannerLevel = 'red';
            } else if (totalHoursLeft <= 96) {
                bannerLevel = 'orange';
            } else {
                bannerLevel = 'yellow';
            }
        }
    }

    return {
        isFullyPaid,
        hasCohort,
        hasStarted,
        isExpired,
        paymentPlan: isFiftyPercent ? '50_percent' : 'full',
        amountPaid,
        totalAmount,
        remainingBalance: isFullyPaid ? 0 : remainingBalance,
        courseType,
        courseTitle,
        cohortName: cohort?.name || 'Assigned Cohort',
        startDate,
        deadlineDate,
        durationDays,
        daysRemaining,
        hoursRemaining,
        minutesRemaining,
        secondsRemaining,
        bannerLevel,
    };
}
