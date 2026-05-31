// ─── RANK MISSION DATA ──────────────────────────────────────────────────────
const RANK_MISSIONS = {
    default: {
        beginner: {
            task1: {
                name: '> Shadowboxing (3x3 min rounds)',
                blueprint: 'Shadowboxing',
                title: 'SHADOWBOXING SETUP',
                body: 'Stand in front of a mirror if possible. Work 1-2 combos and movement for 3 full rounds. Focus on: keeping your guard up between punches, staying on the balls of your feet, and throwing punches with intention — not just flailing. Rest 60 seconds between rounds.'
            },
            task2: {
                name: '> Heavy Bag Work (3x3 min rounds)',
                blueprint: 'Heavy Bag',
                title: 'HEAVY BAG PROTOCOL',
                body: 'Round 1: Jab only — find your range and rhythm. Round 2: 1-2 combinations — add the cross. Round 3: Full combos — 1-2-3 or 1-2-body shot. Rest 60 seconds between rounds. Focus on returning to guard after EVERY punch. The bag should move on contact — you\'re not pushing it.'
            },
            task3: {
                name: '> Footwork Drills (10 min)',
                blueprint: 'Footwork',
                title: 'FOOTWORK DRILL',
                body: 'Mark a small square on the floor with tape (~2ft x 2ft). Practice: step-drag forward, step-drag backward, lateral movement left, lateral movement right. Never cross your feet. Always move the closest foot first. Do this for 10 minutes. Your feet should be doing boxing even when your hands aren\'t.'
            }
        },
        intermediate: {
            task1: {
                name: '> Jab Precision Drill (4x3 min)',
                blueprint: 'Jab Drill',
                title: 'JAB PRECISION SETUP',
                body: 'Hang a small target (tennis ball on string, or tape an X on the bag) at head height. Land only jabs for 4 rounds. Goals: (1) hit the exact same spot every time, (2) return to guard in under 0.5 seconds, (3) move your feet between jabs — don\'t just stand flat. Count your clean jabs per round and try to beat your previous count.'
            },
            task2: {
                name: '> Cross Power Development (3x3 min)',
                blueprint: 'Cross Drill',
                title: 'CROSS POWER DRILL',
                body: 'Focus entirely on your rear-hand cross for 3 rounds. Each punch: (1) plant your rear foot firmly, (2) pivot the heel up and rotate the hip through, (3) extend fully and snap back. Throw 10 hard crosses, then 10 with maximum hip rotation, then 10 while moving. Power comes from your legs — if your shoulder is sore, you\'re arming it.'
            },
            task3: {
                name: '> Defense Timing Work (15 min)',
                blueprint: 'Defense Drill',
                title: 'DEFENSE DRILL',
                body: 'With a partner or using a slip bag: practice slipping jabs (head goes left off a jab to your head), rolling under hooks, and blocking crosses. If alone, shadow-drill the slip — have an imaginary jab come at you, slip outside, counter with 1-2. 15 minutes straight. Defense wins fights.'
            }
        },
        advanced: {
            task1: {
                name: '> Pad Work Combinations (4x3 min)',
                blueprint: 'Pad Work',
                title: 'PAD WORK SESSION',
                body: 'Work with your trainer or partner on combination pad work. Session structure: Round 1 — called combinations (trainer calls numbers). Round 2 — reaction combos (trainer moves pads unpredictably). Round 3 — speed focus (lighter, faster). Round 4 — power focus (full extension, hip drive). Return to guard after every combination — sloppy hands in pad work = sloppy hands in sparring.'
            },
            task2: {
                name: '> Sparring or Heavy Technical Work (3x3 min)',
                blueprint: 'Sparring',
                title: 'SPARRING PROTOCOL',
                body: 'Controlled sparring: communicate intensity with your partner before starting. Goals: (1) implement one specific technique you\'ve been drilling, (2) stay calm — breathing should be controlled even when things get fast, (3) after each round, identify one thing you did well and one adjustment. No ego sparring. Technical rounds only.'
            },
            task3: {
                name: '> Combination Strategy Work (15 min)',
                blueprint: 'Combination Work',
                title: 'COMBINATION STRATEGY',
                body: 'Pick 3 of your best combinations. Drill each one 50 times on the bag — slowly at first, then at full speed. Then drill them in sequence (combo A → reset → combo B → reset → combo C). Goal: each combination should flow naturally without thinking about the next punch. Muscle memory is built through repetition at full technical quality.'
            }
        }
    }
};

// Attach to state after state is initialized
function initMissions() {
    state.rankMissions = RANK_MISSIONS;
}
