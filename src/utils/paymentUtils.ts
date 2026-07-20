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
    // 1. Determine Payment Plan & Active Tracking
    const rawPlan = (user?.payment_plan || cohort?.pivot?.payment_plan || user?.payment_status || '').toString().toLowerCase();

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
        rawPlan === 'installment' || 
        rawPlan === '50_percent' || 
        rawPlan === '50%' || 
        rawPlan === 'partial' || 
        rawPlan === 'half';

    // If NOT explicitly activated by instructor, treat existing cohort/course as fully active with no banner or lock
    if (!isExplicitlyActivated) {
        return {
            isFullyPaid: true,
            hasCohort: !!cohort,
            hasStarted: false,
            isExpired: false,
            paymentPlan: 'full',
            amountPaid: 1000,
            totalAmount: 1000,
            remainingBalance: 0,
            courseType: 'foundation',
            courseTitle: cohort?.course?.title || cohort?.name || 'Course',
            cohortName: cohort?.name || 'Assigned Cohort',
            startDate: cohort?.start_date ? new Date(cohort.start_date) : null,
            deadlineDate: null,
            durationDays: 7,
            daysRemaining: 0,
            hoursRemaining: 0,
            minutesRemaining: 0,
            secondsRemaining: 0,
            bannerLevel: 'none'
        };
    }

    const isFullyPaid = rawPlan === 'full' || rawPlan === 'fully_paid' || rawPlan === 'approved' || rawPlan === '100%' || rawPlan === 'completed' || (user?.payment_status === 'approved' && user?.payment_plan !== 'installment' && user?.payment_plan !== '50_percent');
    
    // Check if 50% plan is explicitly set
    const isFiftyPercent = !isFullyPaid && (
        rawPlan === 'installment' || 
        rawPlan === '50_percent' || 
        rawPlan === '50%' || 
        rawPlan === 'partial' || 
        rawPlan === 'half'
    );

    // 2. Determine Course Type (Foundation = 7 days, Professional = 14 days)
    const courseTitle = cohort?.course?.title || cohort?.name || 'Course';
    const titleLower = courseTitle.toLowerCase();
    const isFoundation = titleLower.includes('foundation') || titleLower.includes('academy');
    const courseType: 'foundation' | 'professional' = isFoundation ? 'foundation' : 'professional';
    const durationDays = isFoundation ? 7 : 14;

    // Prices (Foundation = $999 total / $500 bal, Professional = $1,499 or $2,000 total / $1,000 bal)
    const isPro = courseType === 'professional';
    const totalAmount = isPro ? 2000 : 1000;
    const remainingBalance = isFullyPaid ? 0 : (isPro ? 1000 : 500);
    const amountPaid = totalAmount - remainingBalance;

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
        // Deadline = Start Date + durationDays
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
        isFullyPaid: isFullyPaid || !isFiftyPercent && user?.payment_status === 'approved',
        hasCohort,
        hasStarted,
        isExpired,
        paymentPlan: isFiftyPercent ? '50_percent' : 'full',
        amountPaid,
        totalAmount,
        remainingBalance,
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
