const CONFIG = {
    XP_PER_LEVEL: 100,
    POINTS_PER_LEVEL: 3,
    GATEKEEPER_LEVELS: [5, 10],
    GATEKEEPER_XP_THRESHOLD: 90,
    STAT_BASE: 10,
    STAT_MAX: 100,
    TIMER_WORK_SECS: 180,
    TIMER_REST_SECS: 60,
    MAX_RANKS: 9,
    MAX_WEIGHT_HISTORY: 30,
    TASK_STAT_MAP: {
        'Shadowboxing': 'spd',
        'Heavy Bag':    'str',
        'Footwork':     'sta'
    },
    SAVE_KEY: "combatCore_v62_save"
};

let state = {
    username: "FIGHTER_01",
    level: 1,
    xp: 0,
    careerRank: 1,
    streak: 0,
    lastStreakDate: null,
    pointsBank: 0,
    activeTab: 'tasks',
    isExamGateActive: false,
    headerCollapsed: false,
    currentWeightDisplay: 180.0,
    weightHistory: [],
    lastResetDate: null,
    sessionLog: [],
    trainingLocked: false,
    stats: { str: 10, spd: 10, sta: 10, tac: 10 },
    baseStats: { str: 10, spd: 10, sta: 10, tac: 10 },
    timer: { workDuration: 180, restDuration: 60, timeLeft: 180, instance: null, isRunning: false, mode: 'WORK' },
    tasks: {
        'wrapper-task1': { completed: false, xp: 30, blueprint: 'Shadowboxing' },
        'wrapper-task2': { completed: false, xp: 40, blueprint: 'Heavy Bag' },
        'wrapper-task3': { completed: false, xp: 30, blueprint: 'Footwork' }
    },
    rankMissions: {
        beginner: {
            task1: { name: "> [Rank 1-3 Basics] Shadowbox: Simple 1-2 Drilling", title: "[RECRUIT] Shadowboxing Form Foundation", body: "&#8226; <b>Objective:</b> Practice throwing straight punches safely.<br>&#8226; <b>Execution:</b> 3 rounds of shadowboxing. Only throw your left straight punch (Jab) followed by your right straight punch (Cross). Every single time you punch with one hand, glue the other hand directly to your cheekbone to protect your face." },
            task2: { name: "> [Rank 1-3 Basics] Bagwork: Heavy Bag Balance", title: "[RECRUIT] Punch Impact Basics", body: "&#8226; <b>Objective:</b> Hit hard without losing your balance.<br>&#8226; <b>Execution:</b> 3 rounds on the heavy bag. Don't worry about throwing long, fast combinations. Throw hard, single punches. Make sure both of your feet are glued flat to the floor the exact second your punch hits the bag." },
            task3: { name: "> [Rank 1-3 Basics] Footwork: Guard Up & Don't Trip", title: "[RECRUIT] Basic Foot Movement", body: "&#8226; <b>Objective:</b> Keep your balance so you don't get knocked over easily.<br>&#8226; <b>Execution:</b> 15 minutes. Move around. Step forward, backward, left, and right. <b>The Golden Rule:</b> Never let your feet touch or cross each other." }
        },
        intermediate: {
            task1: { name: "> [Rank 4-6 Medium] Shadowbox: Head & Body Shifts", title: "[CONTENDER] Changing Target Levels", body: "&#8226; <b>Objective:</b> Learn to strike the head and body in sequence.<br>&#8226; <b>Execution:</b> 3 rounds. Throw a head jab to blind the opponent, bend your knees to lower your weight, and throw a straight power cross directly into their stomach." },
            task2: { name: "> [Rank 4-6 Medium] Bagwork: Change the Rhythm", title: "[CONTENDER] Setting Up Heavy Hits", body: "&#8226; <b>Objective:</b> Mix light punch setups with hard finishers.<br>&#8226; <b>Execution:</b> 4 rounds. Tap the heavy bag lightly with double jabs to measure your range, then step in hard to explode with a heavy hook or cross." },
            task3: { name: "> [Rank 4-6 Medium] Footwork: Step to the Angle", title: "[CONTENDER] Stepping Off Center", body: "&#8226; <b>Objective:</b> Step off to the side to avoid pressure coming right at you.<br>&#8226; <b>Execution:</b> 15 minutes. Throw a punch combination, immediately step your front foot wide to the side, and spin your back foot 90 degrees to face a completely new angle." }
        },
        advanced: {
            task1: { name: "> [Rank 7-9 Elite] Shadowbox: Fake and Counter", title: "[MASTER] Baiting & Timing Interceptions", body: "&#8226; <b>Objective:</b> Trick your opponent into throwing a punch so you can hit them back.<br>&#8226; <b>Execution:</b> 4 rounds. Throw a half-fake jab to pull their guard away, quickly slip your upper body out of the way, and throw a counter uppercut." },
            task2: { name: "> [Rank 7-9 Elite] Bagwork: Close-Range Pressure", title: "[MASTER] Fighting Inside the Pocket", body: "&#8226; <b>Objective:</b> Fight right next to the target while staying protected.<br>&#8226; <b>Execution:</b> 4-5 rounds. Keep your forehead close to the bag, tuck both elbows tight into your ribs, and loop short, heavy hooks into the body." },
            task3: { name: "> [Rank 7-9 Elite] Footwork: Spring In and Out", title: "[MASTER] Elastic Range Shifts", body: "&#8226; <b>Objective:</b> Bounce smoothly in and out of hitting range like a spring.<br>&#8226; <b>Execution:</b> 20 minutes of bouncing steps. Spring forward into range to land a punch combo, and instantly bounce backward clear out of danger." }
        }
    }
};
