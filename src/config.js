// XP scaling formula: xpToNextLevel(level) = XP_BASE * level^XP_EXPONENT
// Level 1->2: 100 XP  |  Level 5->6: 1118 XP  |  Level 10->11: 3648 XP
//
// Rank gate levels (level required to unlock next rank):
// Rank 1->2: Lv5  | Rank 2->3: Lv11 | Rank 3->4: Lv18 | Rank 4->5: Lv26
// Rank 5->6: Lv35 | Rank 6->7: Lv45 | Rank 7->8: Lv56 | Rank 8->9: Lv68
//
// Daily training rotates by day-of-week (0=Mon ... 6=Sun)
const CONFIG = {
    XP_BASE: 100,
    XP_EXPONENT: 1.5,
    POINTS_PER_LEVEL: 3,
    RANK_GATE_LEVELS: [5, 11, 18, 26, 35, 45, 56, 68],
    GATEKEEPER_XP_PERCENT: 0.90,
    STAT_BASE: 10,
    STAT_MAX: 100,
    TIMER_WORK_SECS: 180,
    TIMER_REST_SECS: 60,
    MAX_RANKS: 9,
    MAX_WEIGHT_HISTORY: 30,
    TASK_STAT_MAP: {
        'Shadowboxing': 'spd',
        'Heavy Bag':    'str',
        'Footwork':     'sta',
        'Conditioning': 'sta',
        'Combinations': 'tac',
        'Speed Work':   'spd',
        'Full Session': 'str',
        'Recovery':     'sta'
    },
    // Day themes by JS getDay() — 0=Sun,1=Mon,...,6=Sat
    DAY_THEMES: [
        'recovery',      // Sunday
        'technique',     // Monday
        'power',         // Tuesday
        'conditioning',  // Wednesday
        'combinations',  // Thursday
        'speed',         // Friday
        'full'           // Saturday
    ],
    DAY_LABELS: [
        'SUN — ACTIVE RECOVERY',
        'MON — TECHNIQUE DAY',
        'TUE — POWER DAY',
        'WED — CONDITIONING',
        'THU — COMBINATION WORK',
        'FRI — SPEED & REFLEX',
        'SAT — FULL GRIND'
    ],
    SAVE_KEY: "combatCore_v65_save"
};

function xpRequired(level) {
    return Math.floor(CONFIG.XP_BASE * Math.pow(level, CONFIG.XP_EXPONENT));
}

function nextRankGateLevel() {
    const gateIndex = state.careerRank - 1;
    if (gateIndex >= CONFIG.RANK_GATE_LEVELS.length) return null;
    return CONFIG.RANK_GATE_LEVELS[gateIndex];
}

// Returns the current day theme key based on today's date
function todayTheme() {
    return CONFIG.DAY_THEMES[new Date().getDay()];
}

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

    // ============================================================
    //  DAILY TRAINING MISSIONS
    //  Structure: rankMissions[theme][tier][task1/2/3]
    //  theme: technique | power | conditioning | combinations | speed | full | recovery
    //  tier:  beginner (ranks 1-3) | intermediate (ranks 4-6) | advanced (ranks 7-9)
    // ============================================================
    rankMissions: {

        // ----------------------------------------------------------
        //  MONDAY — TECHNIQUE DAY
        //  Focus: form, guard, punching mechanics, footwork basics
        // ----------------------------------------------------------
        technique: {
            beginner: {
                task1: {
                    name: "> [MON] Shadowbox: Jab-Cross Form Drilling",
                    title: "[RECRUIT] Straight Punch Mechanics",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Ingrain clean jab and cross mechanics from stance.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. Throw only jab-cross combinations. After every punch, snap the hand BACK to your cheek before throwing the next one. Chin down, eyes forward. Pause between combos — quality over speed."
                },
                task2: {
                    name: "> [MON] Bag Work: Single Power Shots",
                    title: "[RECRUIT] Impact Without Losing Balance",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Learn to generate power without falling forward.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. Throw ONE punch at a time — hard jab, hard cross, hard hook — then reset stance before the next. Both feet flat on contact. No rushing."
                },
                task3: {
                    name: "> [MON] Footwork: Step & Guard Check",
                    title: "[RECRUIT] Guard Up While Moving",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> Keep your hands up while you move — most beginners drop guard when stepping.<br>&#8226; <b>Do:</b> 15 minutes. Step forward-back and side-to-side in your stance. Every 4 steps, freeze and check: both fists at cheekbones, elbows tucked, chin down. Fix and repeat."
                }
            },
            intermediate: {
                task1: {
                    name: "> [MON] Shadowbox: Peek-a-Boo Defense Drilling",
                    title: "[CONTENDER] Tight Guard & Counter Setup",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Develop a tight defensive guard with sharp counters off it.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Use a high peek-a-boo guard (gloves at eye level, elbows covering ribs). Every 8 seconds: slip left, fire a right cross. Slip right, fire a left hook. Keep shoulders active — no stiff arms."
                },
                task2: {
                    name: "> [MON] Bag Work: Jab as a Setup Tool",
                    title: "[CONTENDER] Jab to Open the Guard",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Use the jab to create openings, not just as a lead.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Throw 2 quick jabs to push the bag, then step in immediately with a hard cross or hook to the body. Every combination starts with the double jab. Jab with your legs — step into it."
                },
                task3: {
                    name: "> [MON] Footwork: Angle Exit After Punching",
                    title: "[CONTENDER] Hit & Disappear",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> Never stand still after throwing punches.<br>&#8226; <b>Do:</b> 15 minutes. Throw a 2-3 punch combo on the bag, then immediately pivot 45° to your outside angle and step away. Alternate: pivot left exit, pivot right exit. Every combo ends with a direction change."
                }
            },
            advanced: {
                task1: {
                    name: "> [MON] Shadowbox: Feint-Counter Systems",
                    title: "[MASTER] Bait, Read & Punish",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Build feint-counter chains that feel automatic.<br>&#8226; <b>Do:</b> 5 rounds x 3 min. Drill three systems: (1) Fake jab → rear uppercut, (2) Shoulder feint → lead hook to body → straight right, (3) Pat-down feint → slip outside → right cross. Drill each for a full round then mix."
                },
                task2: {
                    name: "> [MON] Bag Work: Catch & Return Timing",
                    title: "[MASTER] Counter Punching Accuracy",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Train to parry-and-counter with precise placement.<br>&#8226; <b>Do:</b> 5 rounds x 3 min. Push the bag away with both palms (simulating a parry), then immediately fire a sharp 3-punch combo before it swings back. The bag WILL swing back — that's your timing target. Land the combo clean or start over."
                },
                task3: {
                    name: "> [MON] Footwork: In-Out Rhythm Patterns",
                    title: "[MASTER] Range Control & Distance Boxing",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> Control the fight from the outside by managing range precisely.<br>&#8226; <b>Do:</b> 20 minutes. Use two cones or markers 6 ft apart. Practice: (1) bounce in range → throw jab → bounce out, (2) circle the perimeter → cut angle → enter with cross → exit. Never stop moving. If you stop, you’re a target."
                }
            }
        },

        // ----------------------------------------------------------
        //  TUESDAY — POWER DAY
        //  Focus: heavy bag power, calisthenics, strength base
        // ----------------------------------------------------------
        power: {
            beginner: {
                task1: {
                    name: "> [TUE] Bag Work: Hard Singles & Reset",
                    title: "[RECRUIT] Hitting Hard Without Lunging",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Generate real punching power without losing your base.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. Throw ONE hard punch every 5 seconds — rotate: jab, cross, hook, repeat. After each punch, freeze in stance for 2 full seconds before the next. Feel your legs load before each shot."
                },
                task2: {
                    name: "> [TUE] Calisthenics: Push-Up & Squat Circuit",
                    title: "[RECRUIT] Foundation Strength",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Build the arm, chest, and leg strength that powers punches.<br>&#8226; <b>Do:</b> 3 sets: 10 push-ups → 15 squats → 10 push-ups → 15 squats. Rest 90 seconds between sets. Push-ups: chest to floor, elbows at 45°. Squats: drive through heels, chest tall. No rushing."
                },
                task3: {
                    name: "> [TUE] Shadowbox: Heavy Hands Emphasis",
                    title: "[RECRUIT] Slow & Heavy Technique",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Drill punching with full shoulder rotation to build power habits.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. Throw every punch at HALF speed but with FULL hip and shoulder rotation. Feel your whole body twist into each punch. This is about muscle memory, not speed."
                }
            },
            intermediate: {
                task1: {
                    name: "> [TUE] Bag Work: Power Combo Bursts",
                    title: "[CONTENDER] Explosive Combination Output",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Throw explosive 3-punch combos with full power on each shot.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Work in 20-second bursts: throw jab-cross-hook as hard as possible, reset, repeat. Between bursts, slow-step around the bag. Drill: (1) jab-cross-hook, (2) jab-body cross-head hook, (3) double jab-cross. One combo per burst."
                },
                task2: {
                    name: "> [TUE] Calisthenics: Boxing Power Circuit",
                    title: "[CONTENDER] Explosive Pushing Strength",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Train the explosive hip-to-shoulder chain that powers hard punches.<br>&#8226; <b>Do:</b> 3 sets: 15 push-ups → 10 explosive squat jumps → 10 medicine ball slams (or dumbbell swings) → 20 lunges. Rest 60 seconds. Push-ups: max speed on the push, slow on the way down (2 counts)."
                },
                task3: {
                    name: "> [TUE] Shadowbox: Weighted Punch Endurance",
                    title: "[CONTENDER] Heavy Hand Conditioning",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Build punching endurance and shoulder strength simultaneously.<br>&#8226; <b>Do:</b> 3 rounds x 3 min with 1-2 lb dumbbells (or water bottles). Throw 100 punches per round: 40 straight punches, 30 hooks, 30 uppercuts. Drop weights and shadowbox for the final 60 seconds of each round."
                }
            },
            advanced: {
                task1: {
                    name: "> [TUE] Bag Work: Max Output Rounds",
                    title: "[MASTER] Championship-Level Power Output",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Sustain maximum power output for a full 3-minute round — no coasting.<br>&#8226; <b>Do:</b> 5 rounds x 3 min. Every 30 seconds: 10-second all-out power burst (hardest punches possible), 20 seconds of controlled movement. Track yourself — your round 5 bursts should match round 1 in intensity."
                },
                task2: {
                    name: "> [TUE] Calisthenics: Explosive Plyometric Set",
                    title: "[MASTER] Athletic Power Base",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Develop the explosive leg and hip power that generates knockout force.<br>&#8226; <b>Do:</b> 4 sets: 8 plyometric push-ups (clap or just leave floor) → 10 depth squat jumps → 8 single-leg bounds each side → 10 medicine ball rotational slams each side. Rest 90 seconds. Full power every rep."
                },
                task3: {
                    name: "> [TUE] Shadowbox: Power Visualization Rounds",
                    title: "[MASTER] Mental + Physical Integration",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Shadow a specific opponent in your mind and drill the power shots that beat them.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Pick a real fighter or imagined opponent with a defined style. Drill the exact counters and setups that beat their tendencies. Visualize every punch landing clean. This is fight-IQ training."
                }
            }
        },

        // ----------------------------------------------------------
        //  WEDNESDAY — CONDITIONING
        //  Focus: cardio, jump rope, aerobic endurance, core
        // ----------------------------------------------------------
        conditioning: {
            beginner: {
                task1: {
                    name: "> [WED] Jump Rope: Basic Rhythm",
                    title: "[RECRUIT] Footwork Timing & Cardio Base",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Build jumping coordination and boxing-specific cardio.<br>&#8226; <b>Do:</b> 3 rounds x 3 min of jump rope (1-min rest between rounds). If you can't yet jump rope, do 3 x 3 min of jumping jacks in boxing stance — stay light on your toes the entire time. Never flat-foot."
                },
                task2: {
                    name: "> [WED] Core Work: Plank & Knee Raises",
                    title: "[RECRUIT] Punching Core Foundation",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Build the core stability that keeps you upright after absorbing shots.<br>&#8226; <b>Do:</b> 3 sets: 30-second plank → 15 standing knee raises each side → 10 slow sit-ups. Rest 60 seconds between sets. Plank: back flat, brace abs like someone's about to hit you."
                },
                task3: {
                    name: "> [WED] Shadowbox: Non-Stop Cardio Round",
                    title: "[RECRUIT] Continuous Movement Practice",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Keep moving for a full 3-minute round without stopping — build boxing endurance.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. You CANNOT stop moving — always stepping, always circling, always punching or rolling. If you feel gassed, slow WAY down but never stop. This trains your aerobic floor."
                }
            },
            intermediate: {
                task1: {
                    name: "> [WED] Jump Rope: Footwork Patterns",
                    title: "[CONTENDER] Rope as Footwork Tool",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Use the rope to drill boxing-specific foot patterns.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Rotate every minute: (1) boxer shuffle side-to-side, (2) alternating feet (like running), (3) double-unders or high-knee jumps. Rest 45 seconds. Stay light, stay rhythmic — rope is footwork training."
                },
                task2: {
                    name: "> [WED] Core Circuit: Anti-Rotation & Power",
                    title: "[CONTENDER] Rotational Core Strength",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Build the rotational core power that drives hard hooks and body shots.<br>&#8226; <b>Do:</b> 3 sets: 45-second plank → 20 Russian twists → 15 leg raises → 10 V-sits. Rest 60 seconds. Russian twists: rotate your whole torso, not just your arms. Feel your obliques."
                },
                task3: {
                    name: "> [WED] Run/Roadwork: Interval Sprint Session",
                    title: "[CONTENDER] Anaerobic Conditioning",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Build the burst-recovery capacity that gets you through hard rounds.<br>&#8226; <b>Do:</b> 20-minute session. Warm up 3 min jog. Then: 30-second sprint → 90-second jog → repeat 8 times. Cool down 2 min walk. Can sub: assault bike, row machine, or heavy bag tabata (30 on/90 off)."
                }
            },
            advanced: {
                task1: {
                    name: "> [WED] Jump Rope: Speed & Endurance Block",
                    title: "[MASTER] Elite Footwork Conditioning",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Develop elite-level jump rope endurance and explosive foot transitions.<br>&#8226; <b>Do:</b> 5 rounds x 3 min. Round 1-2: boxer shuffle. Round 3: double-unders. Round 4-5: alternate 30s max-speed singles / 30s double-unders. Rest 30 seconds between rounds. If you miss, restart that 30-second window."
                },
                task2: {
                    name: "> [WED] Core: Boxing Plank Flow Series",
                    title: "[MASTER] Isometric & Dynamic Core Integration",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Develop a rock-solid core that doesn't break down in late rounds.<br>&#8226; <b>Do:</b> 4 sets: 60-second plank → 15 hanging leg raises (or lying straight-leg raises) → 20 oblique bicycle crunches each side → 10 hollow body rocks. Rest 45 seconds. Squeeze everything tight. No sagging."
                },
                task3: {
                    name: "> [WED] Roadwork: Fighter's Tempo Run",
                    title: "[MASTER] Aerobic Power Base",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Develop the deep aerobic base that powers 10+ round championship fights.<br>&#8226; <b>Do:</b> 30-40 min run at a pace you can hold a conversation at (zone 2). Final 5 minutes: sprint the straightaways, jog the corners (fartlek). This builds your recovery rate between hard exchanges."
                }
            }
        },

        // ----------------------------------------------------------
        //  THURSDAY — COMBINATION WORK
        //  Focus: multi-punch chains, bag combos, tactical setups
        // ----------------------------------------------------------
        combinations: {
            beginner: {
                task1: {
                    name: "> [THU] Bag Work: 1-2 Combination Drilling",
                    title: "[RECRUIT] Your First Combo: Jab-Cross",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Make the jab-cross feel automatic — the foundation of all boxing combinations.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. Throw ONLY jab-cross, nothing else. Count every combo out loud or mentally — target 20 combos per round. Jab extends, cross rotates from the hip. Reset guard between each."
                },
                task2: {
                    name: "> [THU] Shadowbox: Adding the Hook",
                    title: "[RECRUIT] Building the 1-2-3",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Add the lead hook to your jab-cross to build your first 3-punch chain.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. First round: only jab-cross. Second round: jab-cross-hook slowly. Third round: jab-cross-hook at normal speed. Hook: rotate shoulder, elbow at 90°, snap to target."
                },
                task3: {
                    name: "> [THU] Footwork: Circling While Punching",
                    title: "[RECRUIT] Move After Every Combo",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> Learn to never stand still after throwing punches.<br>&#8226; <b>Do:</b> 15 minutes. Throw jab-cross, then immediately circle left 3 steps. Throw jab-cross, circle right 3 steps. Never throw and stay planted. This simple habit protects you from counters."
                }
            },
            intermediate: {
                task1: {
                    name: "> [THU] Bag Work: Head-Body-Head Chains",
                    title: "[CONTENDER] Changing Levels in Combinations",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Force your opponent to defend two levels at once.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Drill two combos only: (1) Jab head → cross body → hook head, (2) Double jab head → right cross body → left uppercut. Bend your knees to change levels — don't just tilt your arms. Full bend, full rotation."
                },
                task2: {
                    name: "> [THU] Shadowbox: Pressure & Cut-Off Lines",
                    title: "[CONTENDER] Trapping an Opponent on the Ropes",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Learn to cut off the ring and trap opponents with forward pressure.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Imagine your opponent circling away. Step to cut off their angle, feint with a jab, then unleash a 3-punch combo as you walk them into a corner. Stay between them and the escape route — use the whole room."
                },
                task3: {
                    name: "> [THU] Footwork: Lateral Cut-Off Drills",
                    title: "[CONTENDER] Controlling the Ring",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> Learn to cut angles instead of chasing opponents in circles.<br>&#8226; <b>Do:</b> 15 minutes. Set up two points on the floor (chairs, cones, tape). Practice: opponent 'circles' from point A to B — you step diagonally to beat them there, not chase them. This is how you control range without running."
                }
            },
            advanced: {
                task1: {
                    name: "> [THU] Bag Work: 5-6 Punch Pro Chains",
                    title: "[MASTER] Pro-Level Volume Combinations",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Execute long, fast, accurate multi-punch chains like a professional.<br>&#8226; <b>Do:</b> 5 rounds x 3 min. Drill: (1) Jab-cross-hook-cross-body hook-cross, (2) Double jab-cross-uppercut-hook-cross, (3) Jab-slip-right cross-left hook-right uppercut-right cross. 10 reps of each per round. Speed AND precision — not one or the other."
                },
                task2: {
                    name: "> [THU] Shadowbox: Counter-Punching Chains",
                    title: "[MASTER] Defensive Combos Off Slips & Rolls",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Build automatic counter-combination responses to incoming attacks.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Drill from defensive moves: (1) Slip outside jab → right cross → left hook → right cross, (2) Roll under hook → right uppercut → left hook → right cross, (3) Catch cross on glove → return jab-cross-left uppercut. One defensive trigger → full counter chain."
                },
                task3: {
                    name: "> [THU] Footwork: Pivot & Punch Integration",
                    title: "[MASTER] Pivoting as an Offensive Weapon",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> Use pivots offensively to land from unexpected angles.<br>&#8226; <b>Do:</b> 20 minutes. Drill: step to the outside of the bag → pivot so the bag is now to your side → deliver a 3-punch combo from the new angle. Practice both sides. A pivot isn't just escape — it's an angle to attack from. Perfect this and you always have a shot."
                }
            }
        },

        // ----------------------------------------------------------
        //  FRIDAY — SPEED & REFLEX
        //  Focus: hand speed, snap, reaction timing, light sharp work
        // ----------------------------------------------------------
        speed: {
            beginner: {
                task1: {
                    name: "> [FRI] Shadowbox: Fast Jab Volume",
                    title: "[RECRUIT] Snap & Retract",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Develop a fast, snapping jab by training the retraction as hard as the extension.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. Throw ONLY jabs as fast as possible. Focus: the hand must come BACK faster than it went out. Keep the other hand glued to your cheek. Count your jabs — target 50+ per round."
                },
                task2: {
                    name: "> [FRI] Bag Work: Light & Fast Combos",
                    title: "[RECRUIT] Speed Over Power Today",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Train punching speed by removing the intention to hurt — just touch the bag fast.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. Throw at 50% power but maximum speed. Jab-cross-hook-cross, rapid fire. You should hear a fast rhythm — tap-tap-tap-tap — not BOOM...boom. Speed builds when you relax your shoulders."
                },
                task3: {
                    name: "> [FRI] Footwork: Quick-Step Reactivity",
                    title: "[RECRUIT] Fast Feet Foundation",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> Develop fast foot responses to keep you in and out of range quickly.<br>&#8226; <b>Do:</b> 15 minutes. Practice rapid in-out: 2 quick steps forward → 2 quick steps back → repeat. Add lateral: 2 quick left → 2 quick right. Keep it light on toes. Challenge: do it faster each minute. Feet should barely leave the floor."
                }
            },
            intermediate: {
                task1: {
                    name: "> [FRI] Shadowbox: Rapid-Fire Combination Speed",
                    title: "[CONTENDER] High-Volume Fast Output",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Throw 5-6 punches in under 2 seconds — the speed burst that shocks opponents.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Alternate: 10 seconds of rapid-fire jabs (max speed), then 10 seconds of full combo bursts (5-6 punches, flat out). Rest 10 seconds, repeat for the round. Relax your jaw, relax your shoulders — tension kills speed."
                },
                task2: {
                    name: "> [FRI] Bag Work: Snap Combos with Exit",
                    title: "[CONTENDER] Fast In-Out Exchanges",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Throw a fast combo and immediately escape before the bag swings back.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Throw a sharp 3-punch combo at 80% speed, and immediately sidestep before the bag swings back toward you. If the bag touches you after your combo, you were too slow to exit. The bag is your sparring partner."
                },
                task3: {
                    name: "> [FRI] Footwork: Reactive Defense Patterns",
                    title: "[CONTENDER] Slip & Roll Conditioning",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> Ingrain slip-and-roll patterns until they happen without thinking.<br>&#8226; <b>Do:</b> 15 minutes. Alternate every 30 seconds: (1) Rapid U-slips — slip left, slip right continuously for 30 seconds, (2) Bob & weave — smooth rolling under imagined hooks, staying low but feet light. Head movement is footwork for your upper body."
                }
            },
            advanced: {
                task1: {
                    name: "> [FRI] Shadowbox: Max Velocity Rounds",
                    title: "[MASTER] Elite Hand Speed",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Develop the hand speed of a competitive fighter — fast, sharp, and invisible.<br>&#8226; <b>Do:</b> 5 rounds x 3 min. Every round: first 90 seconds at max speed (everything you have), final 90 seconds at 70% speed but with perfect form. This contrast trains both your ceiling speed and your controlled fast output. No sloppy fast punches — each one must land clean."
                },
                task2: {
                    name: "> [FRI] Bag Work: Blitz Drill",
                    title: "[MASTER] Overwhelm & Storm Patterns",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Practice the overwhelming blitz — the sudden burst of max-volume shots that forces opponents to shell up.<br>&#8226; <b>Do:</b> 5 rounds x 3 min. Work 30 seconds normal pace, then explode into a 5-second blitz (everything you have, max speed, max volume). Stop, reset, repeat every 30 seconds. The blitz only works if the setup looks normal. Sell the transition."
                },
                task3: {
                    name: "> [FRI] Footwork: Explosive Direction Changes",
                    title: "[MASTER] Reactive Agility",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> React and change direction explosively — the difference between being hit and making them miss.<br>&#8226; <b>Do:</b> 20 minutes. Set up 4 spots in a square. Sprint (in stance) to each corner on a random pattern — have a partner call it or use a phone timer to beep every 3-5 seconds. Change direction on each beep. Stay in boxing stance the entire time. No crossing your feet."
                }
            }
        },

        // ----------------------------------------------------------
        //  SATURDAY — FULL GRIND
        //  Hardest day: long rounds, mixed everything, fight simulation
        // ----------------------------------------------------------
        full: {
            beginner: {
                task1: {
                    name: "> [SAT] Bag Work: Full 3-Round Session",
                    title: "[RECRUIT] Your First Full Fight Simulation",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Experience what 3 real rounds feels like without stopping.<br>&#8226; <b>Do:</b> 3 rounds x 3 min (1-min rest). Round 1: jab-cross only. Round 2: add hooks and body shots. Round 3: everything you know. You WILL gas out in round 3 — that's the point. Slow down but don't stop. This round builds your engine."
                },
                task2: {
                    name: "> [SAT] Shadowbox: Mirror Everything",
                    title: "[RECRUIT] Combining All Week's Skills",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Bring together technique, power, and movement into one session.<br>&#8226; <b>Do:</b> 3 rounds x 3 min. Round 1: technique focus (clean form, slow). Round 2: power focus (full rotation). Round 3: speed focus (fast, snap). You're reviewing the full week in one workout."
                },
                task3: {
                    name: "> [SAT] Conditioning: Bodyweight Finisher",
                    title: "[RECRUIT] Saturday Burn-Out",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Finish the week by burning out your legs and lungs.<br>&#8226; <b>Do:</b> Complete as many rounds as possible in 10 minutes: 10 push-ups → 10 squats → 10 jumping jacks → 10 sit-ups. Rest only if you absolutely must. Count your rounds — try to beat your score next Saturday."
                }
            },
            intermediate: {
                task1: {
                    name: "> [SAT] Bag Work: 5-Round Championship Sim",
                    title: "[CONTENDER] Simulate a 5-Round Fight",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Fight a simulated 5-round bout — different game plan each round.<br>&#8226; <b>Do:</b> 5 rounds x 3 min (1-min rest). R1: jab-and-move only (outbox). R2: body attack. R3: pressure and combinations. R4: counter-punching (push bag, let it swing back, counter it). R5: max output — everything you have. Treat each round as a real round."
                },
                task2: {
                    name: "> [SAT] Shadowbox: Opponent Visualization",
                    title: "[CONTENDER] Full Fight IQ Session",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Shadow a real opponent — make tactical decisions, not just throw punches.<br>&#8226; <b>Do:</b> 4 rounds x 3 min. Imagine a specific opponent style: R1 vs aggressive brawler, R2 vs slick out-boxer, R3 vs counter-puncher, R4 vs body attack specialist. Adapt your game plan each round. Your brain is a weapon."
                },
                task3: {
                    name: "> [SAT] Conditioning: Tabata Burnout",
                    title: "[CONTENDER] Anaerobic Capacity Test",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Push your anaerobic ceiling — the hardest 4 minutes in fitness.<br>&#8226; <b>Do:</b> Tabata protocol x 2 rounds (8 min total): 20 seconds max-effort burpees → 10 second rest → repeat 8 times. Rest 2 minutes. Second Tabata: 20 seconds max-speed shadowboxing → 10 second rest → repeat 8 times. Track how many burpees per interval — maintain count in later rounds."
                }
            },
            advanced: {
                task1: {
                    name: "> [SAT] Bag Work: 8-Round Pro Session",
                    title: "[MASTER] Professional Fight Conditioning",
                    blueprint: 'Heavy Bag',
                    body: "&#8226; <b>Goal:</b> Complete a professional-level training session — 8 rounds with a distinct purpose in each.<br>&#8226; <b>Do:</b> 8 rounds x 3 min (1-min rest). R1: jab-and-move. R2: body shots only. R3: hooks and uppercuts. R4: max power combos. R5: speed and volume. R6: counter-punch simulation. R7: pressure and cut-offs. R8: everything — championship round, no gas left."
                },
                task2: {
                    name: "> [SAT] Shadowbox: Championship Mentality",
                    title: "[MASTER] Elite Visualization & Conditioning",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Shadow a full 6-round fight from start to finish with full tactical intent.<br>&#8226; <b>Do:</b> 6 rounds x 3 min. Each round: different opponent, different game plan, different emotional state. Round 6 must be your hardest round — championship fighters save something for the last round. What do you have left?"
                },
                task3: {
                    name: "> [SAT] Conditioning: Fighter's Full Circuit",
                    title: "[MASTER] The Complete Fighter's Workout",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Complete a full-body circuit that covers everything a fighter needs.<br>&#8226; <b>Do:</b> 3 circuits, 60 seconds each station, 30 seconds rest between: (1) Burpees, (2) Jump rope or jumping jacks, (3) Push-ups, (4) Squat jumps, (5) Mountain climbers, (6) V-ups. Rest 2 min between full circuits. 3 circuits = 18 minutes of pure conditioning."
                }
            }
        },

        // ----------------------------------------------------------
        //  SUNDAY — ACTIVE RECOVERY
        //  Easy movement, stretching, mental reset
        // ----------------------------------------------------------
        recovery: {
            beginner: {
                task1: {
                    name: "> [SUN] Light Shadowbox: Form Review",
                    title: "[RECRUIT] Slow & Clean Technique Review",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Reinforce good form with zero fatigue — recovery shadowboxing is active learning.<br>&#8226; <b>Do:</b> 2 rounds x 3 min at 30% effort. Only clean, slow punches. Fix anything that felt off this week — check your guard in a mirror if you have one. This is not cardio. This is calibration."
                },
                task2: {
                    name: "> [SUN] Stretch: Full Body Cooldown",
                    title: "[RECRUIT] Fighter's Flexibility Baseline",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Reduce soreness and maintain the mobility needed for boxing.<br>&#8226; <b>Do:</b> 15 minutes. Hold each stretch 30+ seconds: hip flexors (lunge stretch), hamstrings (forward fold), shoulder cross-body, chest doorframe stretch, neck side tilt. No bouncing — slow, breathing, relaxed. Your body recovers in rest."
                },
                task3: {
                    name: "> [SUN] Walk: 20 Minutes Easy",
                    title: "[RECRUIT] Active Recovery Walk",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Keep blood moving without stressing muscles that need recovery.<br>&#8226; <b>Do:</b> Walk at a comfortable pace for 20 minutes. No boxing. No jogging. Just move. Use this time to mentally review your week: What improved? What still needs work? What's your focus next week? Recovery is where adaptation happens."
                }
            },
            intermediate: {
                task1: {
                    name: "> [SUN] Light Shadowbox: Slow Technique Polish",
                    title: "[CONTENDER] Active Recovery & Form Audit",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Use active recovery to audit and fix technical weaknesses.<br>&#8226; <b>Do:</b> 3 rounds x 3 min at 40% effort. Pick one technical flaw to focus on per round (guard position, head movement, pivot after combos). Drill it in slow motion. Active recovery means your brain is still working even when your body rests."
                },
                task2: {
                    name: "> [SUN] Mobility: Boxing-Specific Flexibility",
                    title: "[CONTENDER] Shoulder & Hip Mobility Work",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Maintain the shoulder and hip mobility required for full-rotation punching.<br>&#8226; <b>Do:</b> 20 minutes. Dynamic warm-up: arm circles, hip circles, trunk rotations. Static holds: shoulder cross-body 45s each, pigeon pose 45s each, thoracic spine rotation 30s each side. Finish with 5 deep squat holds (10 seconds each)."
                },
                task3: {
                    name: "> [SUN] Footwork Review: Slow Drill Patterns",
                    title: "[CONTENDER] Movement Pattern Consolidation",
                    blueprint: 'Footwork',
                    body: "&#8226; <b>Goal:</b> Consolidate the week's footwork patterns into muscle memory.<br>&#8226; <b>Do:</b> 15 minutes. Walk through every footwork pattern you practiced this week at 50% speed: step-and-pivot, angle exit, cut-off lines. Do them correctly and smoothly before you do them fast. Slow practice is where patterns solidify."
                }
            },
            advanced: {
                task1: {
                    name: "> [SUN] Light Shadowbox: Visualization Session",
                    title: "[MASTER] Mental Rehearsal & Technical Audit",
                    blueprint: 'Shadowboxing',
                    body: "&#8226; <b>Goal:</b> Use light shadowboxing as a vehicle for deep mental rehearsal.<br>&#8226; <b>Do:</b> 4 rounds x 3 min at 40% effort. Each round: visualize a full round against a specific opponent style. Execute every feint, slip, and counter as if it's real — just at low intensity. Champions train mentally as much as physically. Sunday is your mental edge day."
                },
                task2: {
                    name: "> [SUN] Mobility & Recovery Protocol",
                    title: "[MASTER] Professional Recovery Routine",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Maintain elite-level mobility and accelerate recovery with a structured protocol.<br>&#8226; <b>Do:</b> 25-minute session. Foam roll: quads, IT band, upper back (90 seconds each). Dynamic: arm swings, hip CARs, ankle circles (2 min each). PNF stretch: hamstrings and hip flexors (3 sets, 6s contract / 30s relax). Finish: 5 minutes of deep breathing, lying flat."
                },
                task3: {
                    name: "> [SUN] Review: Plan Next Week's Training",
                    title: "[MASTER] Fighter's Strategic Planning",
                    blueprint: 'Conditioning',
                    body: "&#8226; <b>Goal:</b> Champions don't just train hard — they train smart. Review and plan.<br>&#8226; <b>Do:</b> 15-20 minutes sitting down. (1) Review this week: which sessions felt weak? (2) Identify one technical area to focus on next week. (3) Check your stats: which attribute needs investment? (4) Set a concrete weekly goal. Write it down. Intention converts effort into progress."
                }
            }
        }
    }
};
