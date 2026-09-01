import { Calendar, HardHat, BarChart3, type LucideIcon } from 'lucide-react';

// Ported verbatim from the mobile app's practice-quiz question bank
// (layos-mobile/src/app/(student)/index.tsx: QUIZ_CATEGORIES) so both
// platforms offer the exact same general-knowledge quiz experience.

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface QuizCategory {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    questions: QuizQuestion[];
}

export const QUIZ_CATEGORIES: QuizCategory[] = [
    {
        id: 'cpm',
        title: 'CPM Scheduling',
        description: 'Master Critical Path Method, floats, logic relationships, and schedule calculations.',
        icon: Calendar,
        color: '#00BFB2',
        questions: [
            {
                question: 'What does a float value of zero on an activity imply?',
                options: [
                    'The activity is on the critical path and cannot be delayed without delaying the project.',
                    'The activity has unlimited flexibility and can be scheduled at any time.',
                    'The activity is already completed and needs no further attention.',
                    'The project is ahead of schedule.'
                ],
                correctAnswer: 0,
                explanation: 'A float of zero means that the activity has no scheduling flexibility; any delay will directly impact the project finish date. This activity is on the critical path.'
            },
            {
                question: 'Which relationship type is most commonly used in construction scheduling?',
                options: [
                    'Start-to-Start (SS)',
                    'Finish-to-Finish (FF)',
                    'Finish-to-Start (FS)',
                    'Start-to-Finish (SF)'
                ],
                correctAnswer: 2,
                explanation: 'Finish-to-Start (FS) is the logical link where the predecessor activity must complete before the successor activity can begin. It is the most common relationship in construction planning.'
            },
            {
                question: 'What is the primary purpose of a Forward Pass in CPM scheduling?',
                options: [
                    'To calculate the Late Start and Late Finish dates.',
                    'To determine the Early Start (ES) and Early Finish (EF) dates.',
                    'To identify resource constraints and allocate labor.',
                    'To optimize project budgets and cash flow.'
                ],
                correctAnswer: 1,
                explanation: 'The forward pass is performed from left to right through the network diagram to determine the early start (ES) and early finish (EF) dates for each activity.'
            },
            {
                question: 'What is Free Float?',
                options: [
                    'The amount of time an activity can be delayed without delaying the project finish date.',
                    'The amount of time an activity can be delayed without delaying its early start successor.',
                    'The time buffer between early start and late start.',
                    'The duration added to critical path activities.'
                ],
                correctAnswer: 1,
                explanation: 'Free Float is the duration an activity can be delayed without affecting the Early Start of any immediately succeeding activities.'
            },
            {
                question: 'What is a lag in a project network schedule?',
                options: [
                    'A constraint that prevents activities from starting early.',
                    'A waiting time inserted between a predecessor and successor activity.',
                    'The difference between Early Start and Late Start.',
                    'The duration required to complete concrete curing.'
                ],
                correctAnswer: 1,
                explanation: 'Lag is a directed delay between a predecessor and successor activity in a schedule relationship (e.g. FS with a 3-day lag).'
            },
            {
                question: 'What is the primary result of a Backward Pass in CPM?',
                options: [
                    'Early Start and Early Finish dates.',
                    'Late Start (LS) and Late Finish (LF) dates.',
                    'Optimized resource leveling distributions.',
                    'Total project direct costs.'
                ],
                correctAnswer: 1,
                explanation: 'The backward pass calculates late start and late finish dates by working backward from the project completion date.'
            },
            {
                question: 'If Total Float is negative, what does this indicate?',
                options: [
                    'The project is ahead of schedule.',
                    'The project is behind its target completion date.',
                    'The schedule has invalid circular logic.',
                    'The critical path has not been calculated.'
                ],
                correctAnswer: 1,
                explanation: 'Negative float occurs when the late finish date is earlier than the early finish date, indicating the project constraint date cannot be met without schedule compression.'
            },
            {
                question: 'Which scheduling technique focuses on resource limits first rather than logical sequence?',
                options: [
                    'Critical Path Method (CPM)',
                    'Critical Chain Project Management (CCPM)',
                    'Program Evaluation Review Technique (PERT)',
                    'Precedence Diagramming Method (PDM)'
                ],
                correctAnswer: 1,
                explanation: 'Critical Chain Project Management (CCPM) builds the schedule based on resource constraints and uses buffers instead of individual activity floats.'
            },
            {
                question: 'What is the Precedence Diagramming Method (PDM)?',
                options: [
                    'A method where activities are represented by arrows.',
                    'A method where activities are represented by nodes connected by logic links.',
                    'A manual graphing style using scale rulers.',
                    'A financial forecasting spreadsheet format.'
                ],
                correctAnswer: 1,
                explanation: 'PDM represents activities as nodes/boxes and connects them with lines representing FS, SS, FF, or SF relationships. It is the basis of modern P6 scheduling.'
            },
            {
                question: "What does the term 'Crashing' mean in schedule compression?",
                options: [
                    'Slicing logic relationships to overlap sequential activities.',
                    'Adding extra resources to critical path activities to shorten duration at the lowest cost.',
                    'Abandoning low priority project scope items.',
                    'Experiencing database corruption in the scheduling tool.'
                ],
                correctAnswer: 1,
                explanation: 'Crashing compresses the schedule by adding resources to critical path tasks, increasing cost to minimize duration.'
            },
            {
                question: 'What is the main difference between Total Float and Free Float?',
                options: [
                    'Total Float affects successor early starts; Free Float affects the project finish.',
                    'Total Float affects the project finish; Free Float affects successor early starts.',
                    'Total Float is always smaller than Free Float.',
                    'There is no functional difference.'
                ],
                correctAnswer: 1,
                explanation: "Total Float can delay the project finish. Free Float is more restrictive and only delays the immediate next activity's early start."
            },
            {
                question: 'Which relationship type specifies that the successor cannot finish until the predecessor has finished?',
                options: [
                    'Start-to-Start (SS)',
                    'Finish-to-Start (FS)',
                    'Finish-to-Finish (FF)',
                    'Start-to-Finish (SF)'
                ],
                correctAnswer: 2,
                explanation: 'In a Finish-to-Finish (FF) relationship, the completion of the successor activity is dependent upon the completion of the predecessor activity.'
            }
        ]
    },
    {
        id: 'p6',
        title: 'Primavera P6 Controls',
        description: 'Test your knowledge on WBS organization, schedule F9 runs, and software configurations.',
        icon: HardHat,
        color: '#6366f1',
        questions: [
            {
                question: 'What is the function of a Work Breakdown Structure (WBS) in Primavera P6?',
                options: [
                    'To assign physical GPS coordinates to a jobsite.',
                    'To define a hierarchical structure of work deliverables and organize project activities.',
                    'To record daily timesheets and payroll details.',
                    'To calculate concrete curing times based on temperature.'
                ],
                correctAnswer: 1,
                explanation: 'A WBS defines the logical hierarchy of the project scope, grouping activities under specific deliverables and phases for easier reporting and control.'
            },
            {
                question: 'In Primavera P6, what happens when you run the "Schedule" command (Shortcut F9)?',
                options: [
                    'All activity history logs are permanently deleted.',
                    'Dates, remaining durations, and float values are recalculated based on network logic constraints.',
                    'A backup PDF report is automatically emailed to the project sponsor.',
                    'Subcontractors are automatically issued progress payments.'
                ],
                correctAnswer: 2,
                explanation: 'Scheduling (F9) recalculates early/late dates, activity floats, and the critical path using current project progress and established network logic.'
            },
            {
                question: 'What is the default Activity Type in Primavera P6?',
                options: [
                    'Task Dependent',
                    'Resource Dependent',
                    'Start Milestone',
                    'Level of Effort'
                ],
                correctAnswer: 0,
                explanation: "Task Dependent is the default activity type, where the activity's duration is scheduled using the activity's calendar rather than resource calendars."
            },
            {
                question: "What is a 'Level of Effort' (LOE) activity in P6?",
                options: [
                    'An activity representing physical heavy labor.',
                    'An activity whose duration is dynamically driven by its predecessors and successors.',
                    'A milestones that marks the start of major phases.',
                    'A task with hard constraint dates.'
                ],
                correctAnswer: 1,
                explanation: 'Level of Effort (LOE) activities represent support work whose start and end dates are determined by the activities they support.'
            },
            {
                question: "What is the difference between a project's WBS and Activity Codes in P6?",
                options: [
                    'WBS is hierarchical; Activity Codes are flat attributes used for grouping/filtering.',
                    'WBS can be deleted easily; Activity codes cannot.',
                    'WBS is only used for cost tracking.',
                    'There is no difference.'
                ],
                correctAnswer: 0,
                explanation: 'WBS defines the static hierarchy of deliverables. Activity Codes are flexible labels assigned to activities to group, sort, and filter them across different criteria.'
            },
            {
                question: 'Which status setting should be checked to input actual start and finish dates for an activity in P6?',
                options: [
                    'Physical%',
                    'Status tab -> Started/Finished checkboxes',
                    'Notebook tab',
                    'User Preferences -> Actuals'
                ],
                correctAnswer: 1,
                explanation: 'To mark an activity as in-progress or completed, check the Started/Finished boxes and input the actual dates in the Status tab of the Activity Details.'
            },
            {
                question: "What does 'Resource Leveling' in P6 do?",
                options: [
                    'It automatically pays subcontractors based on progress.',
                    'It shifts non-critical activities to resolve resource over-allocations within limits.',
                    'It recalculates activity budgets based on actual hours.',
                    'It deletes logic links that cause scheduling conflicts.'
                ],
                correctAnswer: 1,
                explanation: 'Resource leveling resolves resource over-allocations by delaying tasks with positive float so that labor demands fit within available limits.'
            },
            {
                question: "Which type of duration type in P6 should be used if the resource rate is fixed and duration shouldn't change when resources are added?",
                options: [
                    'Fixed Duration and Units',
                    'Fixed Units/Time',
                    'Fixed Duration and Units/Time',
                    'Fixed Units'
                ],
                correctAnswer: 0,
                explanation: 'Fixed Duration and Units locks both duration and total work. Adding resources will adjust the units/time (allocation rate) rather than changing duration or total hours.'
            },
            {
                question: "What is a 'Must Finish By' constraint in Primavera P6?",
                options: [
                    'A warning message printed on Gantt charts.',
                    'A project-level constraint that overrides activity late dates and can create negative float.',
                    'A software license setting that expires after 12 months.',
                    'A contract clause that cannot be modeled in P6.'
                ],
                correctAnswer: 1,
                explanation: 'Must Finish By sets a hard target date for the entire project. If the calculated critical path finish date is later than this constraint, the project will display negative float.'
            },
            {
                question: "In P6, what is the 'Baseline' of a project?",
                options: [
                    'The ground level elevation of a jobsite.',
                    'A saved snapshot of the project schedule used for performance comparison and variance analysis.',
                    'The lowest budget limit set by the client.',
                    'The initial software installation configuration.'
                ],
                correctAnswer: 1,
                explanation: 'A baseline is a frozen copy of the schedule (e.g. at contract award) against which current progress is compared to track delays and cost shifts.'
            },
            {
                question: "What does 'Percent Complete Type' set to 'Physical' mean in P6?",
                options: [
                    'Percent complete is calculated based on remaining duration.',
                    'Percent complete is manually input based on physical work completed on site, independent of duration.',
                    'The activity is automatically marked complete when physical sensors trigger.',
                    'Cost and schedule are perfectly synchronized.'
                ],
                correctAnswer: 1,
                explanation: 'Physical percent complete allows the planner to manually specify the physical progress of an activity, decoupling it from units or duration progress.'
            },
            {
                question: 'Which calendar options can be assigned to an activity in Primavera P6?',
                options: [
                    'Global, Project, and Resource calendars.',
                    'Only Gregorian and Julian calendars.',
                    'System calendars only.',
                    'Weekly timesheet calendars only.'
                ],
                correctAnswer: 0,
                explanation: 'P6 allows assigning Global calendars (available to all projects), Project calendars (specific to one project), or Resource calendars (defined by resource working limits).'
            }
        ]
    },
    {
        id: 'evm',
        title: 'Earned Value Management',
        description: 'Evaluate Cost and Schedule variances, CPI, SPI, and forecast accuracy metrics.',
        icon: BarChart3,
        color: '#ec4899',
        questions: [
            {
                question: 'If the Cost Variance (CV) of a project is a negative value, what does it indicate?',
                options: [
                    'The project is under budget.',
                    'The project is over budget.',
                    'The project is ahead of schedule.',
                    'The project is behind schedule.'
                ],
                correctAnswer: 1,
                explanation: 'A negative Cost Variance (CV = EV - AC) indicates that the actual cost (AC) exceeds the earned value (EV), meaning the project is over budget.'
            },
            {
                question: 'How is the Schedule Variance (SV) calculated in Earned Value Management?',
                options: [
                    'SV = EV - PV',
                    'SV = EV - AC',
                    'SV = PV - AC',
                    'SV = BAC - EAC'
                ],
                correctAnswer: 0,
                explanation: 'Schedule Variance is computed by subtracting the Planned Value (PV) from the Earned Value (EV). A negative result indicates the project is behind schedule.'
            },
            {
                question: 'What does a Cost Performance Index (CPI) of 0.85 indicate?',
                options: [
                    'The project is running 15% ahead of schedule.',
                    'For every dollar spent, only 85 cents of planned work was accomplished (over budget).',
                    'The project is under budget by 15%.',
                    'The project is exactly on track.'
                ],
                correctAnswer: 1,
                explanation: 'CPI = EV / AC. A value less than 1.0 means the actual costs are higher than the value of work completed, meaning the project is over budget.'
            },
            {
                question: 'What is the formula for the Schedule Performance Index (SPI)?',
                options: [
                    'SPI = EV / PV',
                    'SPI = EV / AC',
                    'SPI = AC / PV',
                    'SPI = EV - PV'
                ],
                correctAnswer: 0,
                explanation: 'SPI measures schedule efficiency by dividing Earned Value (EV) by Planned Value (PV). SPI < 1.0 indicates behind schedule.'
            },
            {
                question: "What does 'AC' stand for in Earned Value Management?",
                options: [
                    'Approved Capital',
                    'Actual Cost',
                    'Allocated Cost',
                    'Activity Completion'
                ],
                correctAnswer: 1,
                explanation: 'AC (Actual Cost of Work Performed) represents the total direct and indirect costs incurred in accomplishing work during a given period.'
            },
            {
                question: "What is the 'Budget at Completion' (BAC)?",
                options: [
                    'The actual cost spent at the end of the project.',
                    'The total planned budget baseline for the project.',
                    'The estimated final cost of the project.',
                    "The client's budget reserve."
                ],
                correctAnswer: 1,
                explanation: 'BAC represents the sum of all budgets established for the work to be performed. It is the total planned value baseline.'
            },
            {
                question: 'If a project has an SPI of 1.15 and a CPI of 1.10, what is its status?',
                options: [
                    'Behind schedule and over budget.',
                    'Ahead of schedule and under budget.',
                    'Ahead of schedule and over budget.',
                    'Behind schedule and under budget.'
                ],
                correctAnswer: 1,
                explanation: 'An SPI > 1.0 means ahead of schedule, and a CPI > 1.0 means under budget. This project is in excellent health.'
            },
            {
                question: "What is 'Estimate to Complete' (ETC)?",
                options: [
                    'The expected cost needed to finish all remaining project work.',
                    'The forecasted total cost of the project at completion.',
                    'The difference between BAC and EV.',
                    'The contract price of the project.'
                ],
                correctAnswer: 0,
                explanation: 'ETC is the forecasted cost required to complete the remaining scope of work (ETC = EAC - AC).'
            },
            {
                question: "What is 'Estimate at Completion' (EAC)?",
                options: [
                    'The baseline budget set at the beginning.',
                    'The forecasted total cost of the project when all work is finished.',
                    'The cost variance at the end of the project.',
                    'The amount of money paid by the client so far.'
                ],
                correctAnswer: 1,
                explanation: 'EAC is the expected total cost of the project at completion, based on performance to date and remaining work forecasts.'
            },
            {
                question: 'How is Variance at Completion (VAC) calculated?',
                options: [
                    'VAC = BAC - EAC',
                    'VAC = EAC - AC',
                    'VAC = BAC - AC',
                    'VAC = EV - AC'
                ],
                correctAnswer: 0,
                explanation: 'VAC is the difference between the baseline budget (BAC) and the current forecast (EAC). A positive value indicates a projected surplus.'
            },
            {
                question: "What is the 'To Complete Performance Index' (TCPI)?",
                options: [
                    'The schedule efficiency needed to finish on time.',
                    'The cost performance efficiency required to complete the remaining work within a target budget.',
                    'The ratio of actual cost to planned budget.',
                    'A baseline progress benchmark.'
                ],
                correctAnswer: 1,
                explanation: 'TCPI measures the efficiency rate that must be achieved on remaining work to meet target budget objectives (like BAC or EAC).'
            },
            {
                question: 'Which EVM metric represents the value of work physically accomplished at a given point in time?',
                options: [
                    'Planned Value (PV)',
                    'Actual Cost (AC)',
                    'Earned Value (EV)',
                    'Budget at Completion (BAC)'
                ],
                correctAnswer: 2,
                explanation: 'Earned Value (EV), formerly known as BCWP (Budgeted Cost of Work Performed), measures the value of work actually completed in terms of the baseline budget.'
            }
        ]
    }
];

// Fisher-Yates shuffle — selects a random subset of questions per attempt (mirrors mobile's shuffleAndSlice)
export function shuffleAndSlice(questions: QuizQuestion[], count: number = 10): QuizQuestion[] {
    const copy = [...questions];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}

export const QUIZ_PASS_MARK = 70;
