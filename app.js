/* ===================================
   LUNA — PERIOD WELLNESS APP
   Complete App Logic
   =================================== */

'use strict';

// ============================================================
// SUPABASE — replace with your project values
// ============================================================

const sb = window.lunaSupabase;
// ============================================================
// AUTH HELPERS
// ============================================================

function showAuthPanel(panel) {
    document.getElementById('auth-panel-signup').classList.toggle('hidden', panel !== 'signup');
    document.getElementById('auth-panel-login').classList.toggle('hidden',  panel !== 'login');
    clearAuthBanners();
}

function clearAuthBanners() {
    ['auth-error','auth-success'].forEach(id => {
        const el = document.getElementById(id);
        el.textContent = '';
        el.classList.add('hidden');
    });
}

function showAuthBanner(id, msg) {
    clearAuthBanners();
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.remove('hidden');
}

function setAuthLoading(btnId, loading) {
    const btn  = document.getElementById(btnId);
    const text = btn.querySelector('.auth-btn-text');
    const spin = btn.querySelector('.auth-spinner');
    btn.disabled = loading;
    text.classList.toggle('hidden', loading);
    spin.classList.toggle('hidden', !loading);
}

async function handleSignup() {
    const name     = document.getElementById('auth-signup-name').value.trim();
    const email    = document.getElementById('auth-signup-email').value.trim();
    const password = document.getElementById('auth-signup-password').value;
    const role     = document.querySelector('input[name="auth-role"]:checked').value;

    if (!name)            return showAuthBanner('auth-error', 'Please enter your name.');
    if (!email)           return showAuthBanner('auth-error', 'Please enter your email.');
    if (password.length < 6) return showAuthBanner('auth-error', 'Password must be at least 6 characters.');

    setAuthLoading('btn-signup', true);
    try {
        const { data: authData, error: authError } = await sb.auth.signUp({ email, password });
        if (authError) throw authError;

        const userId = authData.user?.id;
        if (userId) {
            const { error: profileError } = await sb.from('profiles').insert({
                id:         userId,
                name,
                email,
                role,
                created_at: new Date().toISOString()
            });
            if (profileError) console.warn('Profile save failed:', profileError.message);

            // Pre-fill setup with the name from signup
console.log("ROLE SELECTED:", role);

state.tempSetup.name = name;
state.tempSetup.role = role;

console.log("TEMPSETUP AFTER SAVE:", state.tempSetup);

saveState();
           console.log("ROLE SAVED:", state.tempSetup);
        }

        const { data: { session } } = await sb.auth.getSession();
        if (session) {
            enterApp();
        } else {
            showAuthBanner('auth-success', '✓ Account created! Check your email to confirm, then sign in.');
            showAuthPanel('login');
        }
    } catch (err) {
        showAuthBanner('auth-error', err.message || 'Something went wrong. Please try again.');
    } finally {
        setAuthLoading('btn-signup', false);
    }
}

async function handleLogin() {
    const email    = document.getElementById('auth-login-email').value.trim();
    const password = document.getElementById('auth-login-password').value;

    if (!email)    return showAuthBanner('auth-error', 'Please enter your email.');
    if (!password) return showAuthBanner('auth-error', 'Please enter your password.');

    setAuthLoading('btn-login', true);
    try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        enterApp();
    } catch (err) {
        showAuthBanner('auth-error', err.message || 'Sign-in failed. Check your credentials.');
    } finally {
        setAuthLoading('btn-login', false);
    }
}

function enterApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    init(); // run existing Luna init
}

// Keyboard submit support for auth
document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const authScreen = document.getElementById('auth-screen');
    if (!authScreen || authScreen.classList.contains('hidden')) return;
    const loginVisible = !document.getElementById('auth-panel-login').classList.contains('hidden');
    loginVisible ? handleLogin() : handleSignup();
});

// ============================================================
// CONTENT DATABASE
// ============================================================

const SYMPTOMS_LIST = [
    '😣 Cramps', '😮‍💨 Bloating', '🤕 Headache', '😴 Fatigue',
    '🤢 Nausea', '💔 Back Pain', '🌡️ Breast Tenderness', '😤 Mood Swings',
    '🥵 Hot Flashes', '😰 Anxiety', '🌧️ Low Mood', '😡 Irritability',
    '🍫 Cravings', '💤 Insomnia', '💆 Dizziness', '🤧 Acne'
];

const MEDS_LIST = [
    '💊 Ibuprofen', '💊 Paracetamol', '🌿 Iron Supplement',
    '🫐 Vitamin D', '🌿 Magnesium', '💊 Omega-3',
    '🌱 Ginger Capsule', '🍋 Vitamin C'
];

const AFFIRMATIONS = [
    "You are stronger than any cramp. 💪",
    "Your body is doing something incredible — be gentle with it. 🌸",
    "Rest is not laziness. Rest is radical self-care. 💕",
    "You don't have to be okay today. That's okay. 🌙",
    "Your feelings are valid, always. ✨",
    "Be as kind to yourself as you are to others. 💝",
    "This too shall pass. You've got through it before. 🌊",
    "Your body is wise. Trust it. 🌿",
    "You deserve warmth, comfort, and chocolate. 🍫",
    "You are not a burden. You are a gift. 💫",
    "Slow down. The world can wait for you today. 🌸",
    "Every cycle is a reminder of your incredible strength. 🔥",
    "You are beautifully, powerfully human. 🌺",
    "Give yourself permission to just be. That's enough. 🌙",
    "Your sensitivity is your superpower. 💜"
];

const PHASE_DATA = {
    menstrual: {
        name: 'Menstrual',
        dayRange: 'Day 1–5',
        color: 'menstrual',
        emoji: '🌑',
        description: 'Your period is here. Your body is releasing the uterine lining. Rest, warmth, and gentle self-care are your best friends right now.',
        tip: 'Day {day}: Your body is working hard. Honor it with warmth — try a heating pad on your lower abdomen for 15 minutes to ease cramps.',
        foods: ['🥩 Iron-rich foods: red meat, lentils, spinach', '🫐 Antioxidant berries to reduce inflammation', '🍵 Ginger tea for nausea and cramps', '🥑 Healthy fats to support hormone balance', '🍫 Dark chocolate (yes, really!) for magnesium', '🥕 Warm soups and stews for comfort'],
        exercise: ['🚶 Gentle walks (10–15 mins)', '🧘 Yin yoga or restorative yoga', '🛀 Warm bath with Epsom salts', '💆 Self-massage with warm oil', '🛌 Rest — it\'s okay to do nothing'],
        remedies: ['🔥 Heating pad on lower abdomen or lower back', '🫖 Ginger + honey tea 2–3x a day', '🌿 Chamomile tea for cramping and anxiety', '💊 Ibuprofen with food if needed', '🛁 Warm baths with lavender essential oil', '🧦 Keep your feet warm — it helps!'],
        mind: ['📖 Journal your feelings without judgment', '🎵 Create a cozy playlist', '📺 Guilt-free Netflix time', '🌙 Sleep extra if your body asks', '🤗 Allow yourself to receive care'],
        guideItems: [
            { icon: '🩸', text: 'Track your flow (light/medium/heavy)', color: 'rgba(255,92,141,0.15)' },
            { icon: '💊', text: 'Take pain relief with food if needed', color: 'rgba(255,92,141,0.15)' },
            { icon: '💧', text: 'Drink more water — you need extra hydration', color: 'rgba(255,92,141,0.15)' },
        ]
    },
    follicular: {
        name: 'Follicular',
        dayRange: 'Day 6–13',
        color: 'follicular',
        emoji: '🌒',
        description: 'Your energy is rising! Estrogen is increasing, you may feel more social, creative, and motivated. A great time to start new projects.',
        tip: 'Day {day}: Your energy is building beautifully. This is a great time to tackle tasks, make plans, and try something creative.',
        foods: ['🥗 Light, fresh salads and lean proteins', '🐟 Omega-3 rich fish like salmon', '🥦 Fermented foods: yogurt, kefir, kimchi', '🫐 Antioxidant-rich fruits and vegetables', '🌾 Complex carbs for sustained energy', '🥜 Nuts and seeds for healthy fats'],
        exercise: ['🏃 Cardio is great now — running, cycling', '💪 Strength training — your body is strong!', '🕺 Try a new fitness class', '🚴 Outdoor activities and group sports', '🤸 HIIT workouts — you can handle intensity'],
        remedies: ['☕ Green tea for antioxidants', '🫗 Spearmint tea for hormone balance', '🌿 Maca root for energy support', '💆 Regular massage for circulation', '🌞 Get morning sunlight for serotonin'],
        mind: ['🎯 Set goals for the upcoming weeks', '🎨 Start a creative project', '👭 Plan social activities — you\'re glowing!', '📚 Learn something new', '✍️ Write down your dreams and intentions'],
        guideItems: [
            { icon: '⚡', text: 'Energy is rising — embrace it', color: 'rgba(255,157,92,0.15)' },
            { icon: '🎨', text: 'Great time for creative projects', color: 'rgba(255,157,92,0.15)' },
            { icon: '👭', text: 'Social energy is high — make plans', color: 'rgba(255,157,92,0.15)' },
        ]
    },
    ovulation: {
        name: 'Ovulation',
        dayRange: 'Day 14–16',
        color: 'ovulation',
        emoji: '🌕',
        description: 'Peak energy and confidence! Estrogen and testosterone are at their highest. You may feel more magnetic, communicative, and vibrant.',
        tip: 'Day {day}: You\'re at your peak! Your communication skills are sharpest now — great for important conversations and social events.',
        foods: ['🫐 Anti-inflammatory foods: blueberries, turmeric', '🥦 Cruciferous vegetables for estrogen balance', '🫗 Plenty of water and electrolytes', '🍋 Lemon water to support liver detox', '🥜 Zinc-rich pumpkin seeds', '🫐 High-fiber foods for gut health'],
        exercise: ['🏋️ High-intensity workouts — you\'re strong!', '🤸 Try challenging yoga flows', '🏊 Swimming for full-body movement', '🚵 Adventure sports and hiking', '💃 Dance classes — express yourself!'],
        remedies: ['🌿 Vitex (chaste tree) for hormone support', '🍵 Raspberry leaf tea', '🌊 Stay very well hydrated', '🧊 Cold therapy if you feel overheated', '☀️ Sunlight exposure for vitamin D'],
        mind: ['💬 Have important conversations now', '❤️ Quality time with loved ones', '🎤 Great time for presentations/interviews', '🌟 Set your highest intentions', '📸 Capture this confident energy'],
        guideItems: [
            { icon: '✨', text: 'Peak energy — you\'re glowing!', color: 'rgba(192,132,219,0.15)' },
            { icon: '💬', text: 'Communication is your superpower now', color: 'rgba(192,132,219,0.15)' },
            { icon: '❤️', text: 'Great time for connection and intimacy', color: 'rgba(192,132,219,0.15)' },
        ]
    },
    luteal: {
        name: 'Luteal',
        dayRange: 'Day 17–28',
        color: 'luteal',
        emoji: '🌗',
        description: 'Your body is preparing for your next period. Progesterone rises, then falls. You may notice PMS symptoms — this is normal and valid.',
        tip: 'Day {day}: Your body may need more care this week. Reduce stress, prioritize sleep, and don\'t be hard on yourself if your energy is lower.',
        foods: ['🍫 Dark chocolate for magnesium', '🥑 Avocado and healthy fats for hormones', '🍠 Complex carbs: sweet potato, oats, quinoa', '🌿 Calcium-rich foods: dairy, kale, almonds', '🫖 Herbal teas to reduce bloating', '🚫 Reduce salt, caffeine, and alcohol'],
        exercise: ['🚶 Gentle walks in nature', '🧘 Yin yoga and meditation', '🏊 Swimming — gentle on joints', '🚴 Light cycling', '💆 Prioritize rest over performance'],
        remedies: ['🌿 Evening primrose oil for PMS symptoms', '💊 Magnesium supplements (consult doctor)', '🫖 Raspberry leaf tea for uterine prep', '🔥 Heating pad for cramps that start early', '😴 Extra sleep — your body repairs itself'],
        mind: ['🧘 Meditation and deep breathing', '📓 Journal your emotions freely', '🛁 Indulgent self-care rituals', '🎵 Comfort music and cozy spaces', '🤗 Give yourself permission to slow down'],
        guideItems: [
            { icon: '🌙', text: 'Energy may dip — rest without guilt', color: 'rgba(123,158,255,0.15)' },
            { icon: '😮', text: 'PMS symptoms are normal and valid', color: 'rgba(123,158,255,0.15)' },
            { icon: '🍫', text: 'Cravings are real — honor them gently', color: 'rgba(123,158,255,0.15)' },
        ]
    }
};

const PARTNER_DATA = {
    menstrual: {
        status: 'She\'s on her period. Her body is working incredibly hard right now. A little extra love goes a very long way today. 💕',
        feelings: [
            'Physical pain — cramps can range from mild discomfort to debilitating pain',
            'Fatigue and low energy — her body is using significant resources',
            'Emotional sensitivity — she may cry more easily or feel overwhelmed',
            'She may feel like a burden — she\'s not, ever',
            'Comfort-seeking — warmth, kindness, and gentleness help enormously',
            'She might feel anxious or irritable — it\'s hormonal, not personal'
        ],
        help: [
            'Bring a heating pad or warm water bottle without being asked',
            'Make (or order) her favorite comfort food',
            'Offer a gentle back or shoulder massage',
            'Handle chores or tasks she would normally do',
            'Sit with her quietly — presence matters more than words',
            'Ask "What do you need?" and be ready to just listen',
            'Put on a comfort show or movie she loves',
            'Let her sleep in and make it peaceful'
        ],
        avoid: [
            'Saying "Is it that bad?" or "You\'re overreacting"',
            'Mentioning productivity or what she "should" be doing',
            'Complaining about plans being cancelled',
            'Telling her to "just take a pill" and push through',
            'Making her feel guilty for resting or needing extra care',
            'Getting frustrated if she\'s emotional or quieter than usual'
        ],
        say: [
            'Can I get you anything? I\'m here for whatever you need.',
            'You don\'t have to explain yourself. Rest.',
            'I\'ve got everything handled today — just focus on you.',
            'You\'re not a burden. Taking care of you is what I want to do.',
            'I love you on your hardest days, especially.',
            'Tell me how I can help — I\'m listening.'
        ],
        treats: [
            { emoji: '🍫', name: 'Dark Chocolate' }, { emoji: '🍕', name: 'Her Favorite Comfort Food' },
            { emoji: '🫖', name: 'Ginger or Chamomile Tea' }, { emoji: '🍦', name: 'Ice Cream' },
            { emoji: '🥣', name: 'Warm Soup' }, { emoji: '🍪', name: 'Cookies' },
            { emoji: '🥤', name: 'Her Fav Drink' }, { emoji: '🍓', name: 'Fresh Berries' }
        ],
        kit: [
            { emoji: '🔥', text: 'Heating pad or hot water bottle' },
            { emoji: '💊', text: 'Ibuprofen or her preferred pain relief' },
            { emoji: '🛁', text: 'Bath salts or bubble bath' },
            { emoji: '🧸', text: 'Cozy blanket or plush pillow' },
            { emoji: '🍫', text: 'Dark chocolate & her favorite snacks' },
            { emoji: '🌸', text: 'Fresh flowers or a small thoughtful gift' },
            { emoji: '🧴', text: 'Gentle massage oil or lotion' },
            { emoji: '📱', text: 'Period essentials from her wishlist' }
        ],
        messages: [
            'Hey love 💕 I know today is rough. I\'ve got everything covered. Just rest and let me take care of you. You deserve it.',
            'Thinking of you today 🌸 Your strength amazes me every single month. I love you. What can I bring you?',
            'You\'re not alone in this. I\'m right here, whenever you need me — for a hug, a chat, or just quiet company. 💕'
        ]
    },
    follicular: {
        status: 'Her period is over and her energy is starting to return. She\'s likely feeling lighter, more social, and more herself! 🌱',
        feelings: [
            'Returning energy and lightness after her period',
            'More social and outgoing — she might want to make plans',
            'Creative and motivated — great ideas might be flowing',
            'Physically stronger — she may want to be active',
            'Optimistic and forward-thinking',
            'Open to new experiences and conversations'
        ],
        help: [
            'Make plans she\'ll enjoy — dinner, a walk, a trip somewhere fun',
            'Match her energy and engage in real conversations',
            'Support her goals and ideas — she\'s feeling motivated',
            'Suggest activities you can do together',
            'Be present and engaged — she\'s feeling more connected',
            'Celebrate her wins and ideas with genuine enthusiasm'
        ],
        avoid: [
            'Being dismissive of her new ideas or plans',
            'Being low-energy when she wants to connect',
            'Cancelling plans at the last minute',
            'Bringing up past frustrations from her period days'
        ],
        say: [
            'You seem amazing lately — what\'s your energy? I want some!',
            'I love watching you in this mode. What shall we do?',
            'Tell me about what you\'re excited about right now.',
            'You\'re glowing. Whatever you\'re doing, keep doing it.',
            'Let\'s make some plans — I want to do something fun with you.'
        ],
        treats: [
            { emoji: '🥗', name: 'A Fresh, Light Meal' }, { emoji: '☕', name: 'Her Favorite Coffee' },
            { emoji: '🌸', name: 'Fresh Flowers' }, { emoji: '🍓', name: 'Healthy Snacks' },
            { emoji: '🧃', name: 'Fresh Juice' }, { emoji: '🫐', name: 'Smoothie Bowl' },
            { emoji: '🥐', name: 'A Nice Brunch' }, { emoji: '🍰', name: 'A Light Dessert' }
        ],
        kit: [
            { emoji: '🌸', text: 'Fresh flowers — she\'ll love them!' },
            { emoji: '📅', text: 'Plan a date or fun activity together' },
            { emoji: '☕', text: 'Her favorite coffee or tea' },
            { emoji: '🎁', text: 'A small surprise gift or gesture' },
            { emoji: '🎬', text: 'Tickets to something she wants to see' },
            { emoji: '💌', text: 'A sweet handwritten note' }
        ],
        messages: [
            'You seem so amazing lately 🌸 I love your energy. Want to do something fun this weekend?',
            'Watching you thrive is my favorite thing 💕 Let\'s celebrate — you pick the plans!',
            'Your ideas lately have been incredible. I\'m your biggest fan. What\'s next? 🌟'
        ]
    },
    ovulation: {
        status: 'She\'s at her peak! Confidence, communication, and energy are all at their highest. Be her biggest fan right now. ✨',
        feelings: [
            'Confident, radiant, and magnetic — she\'s glowing!',
            'Highly social and communicative',
            'Strong desire for connection and intimacy',
            'Creative and expressive',
            'Physically energized and capable',
            'Emotionally warm and open'
        ],
        help: [
            'Plan something special — she\'s in her element',
            'Have meaningful, deep conversations',
            'Compliment her genuinely — she\'s radiating right now',
            'Be adventurous together — she\'s up for it',
            'Be fully present and attentive',
            'Express your love and appreciation clearly'
        ],
        avoid: [
            'Being distracted or inattentive during her peak week',
            'Shutting down conversations when she\'s feeling expressive',
            'Taking her confidence and energy for granted'
        ],
        say: [
            'You are absolutely stunning today. I love being with you.',
            'I want to hear everything on your mind. Tell me.',
            'Let\'s do something special — you deserve it.',
            'I am so in love with you. Every day.',
            'You\'re incredible. I hope you know that.'
        ],
        treats: [
            { emoji: '💐', name: 'A Beautiful Bouquet' }, { emoji: '🍷', name: 'Her Favorite Drink' },
            { emoji: '🥂', name: 'Something to Celebrate' }, { emoji: '🍣', name: 'A Nice Dinner' },
            { emoji: '🎁', name: 'A Thoughtful Gift' }, { emoji: '🎂', name: 'Her Favorite Cake' },
            { emoji: '🌹', name: 'Roses' }, { emoji: '🍫', name: 'Premium Chocolates' }
        ],
        kit: [
            { emoji: '💐', text: 'Beautiful flowers — she deserves them' },
            { emoji: '🍽️', text: 'Plan a special dinner date' },
            { emoji: '💌', text: 'Write her a heartfelt message' },
            { emoji: '✨', text: 'Do something she\'ll always remember' },
            { emoji: '📸', text: 'Take photos together — she\'s glowing' },
            { emoji: '🎁', text: 'Something she\'s been wanting' }
        ],
        messages: [
            'You are the most incredible person I know. I just wanted to tell you that today 💕 You\'re glowing.',
            'I see you. I love you. I\'m so lucky to have you 🌸 Want to do something special tonight?',
            'I could talk to you forever and never get tired of it. Let\'s plan something magical this week 💫'
        ]
    },
    luteal: {
        status: 'PMS may be setting in. Her hormones are shifting and she needs extra patience, gentleness, and understanding. Your calm is her anchor. 💜',
        feelings: [
            'Emotional intensity — things feel bigger than usual',
            'Irritability that may come out of nowhere',
            'Cravings that feel very urgent and real',
            'Fatigue, low motivation, and "heavy" feeling',
            'Anxiety or low mood without a clear reason',
            'Wanting comfort but also space — it\'s a balance',
            'Feeling like something is "wrong" when nothing is',
            'Extra sensitive to criticism or perceived neglect'
        ],
        help: [
            'Be extra patient — don\'t take mood personally',
            'Don\'t bring up problems or conflicts if possible',
            'Offer comfort food without judgment',
            'Give her space when she needs it, closeness when she asks',
            'Handle things quietly without making her feel like a burden',
            'Validate her feelings even if the trigger seems small',
            'Keep the environment peaceful and low-stress',
            'Check in gently: "How are you really doing?"'
        ],
        avoid: [
            'Saying "it\'s just PMS" or dismissing her feelings',
            'Starting difficult conversations or confrontations',
            'Getting frustrated when she\'s emotional',
            'Pointing out when she\'s being "irrational"',
            'Withdrawing or going quiet — she needs reassurance',
            'Commenting on what she\'s eating or how much she\'s resting'
        ],
        say: [
            'I see you\'re having a hard time. I\'m not going anywhere.',
            'Your feelings make complete sense. I hear you.',
            'What do you need from me right now? I\'ll do it.',
            'You don\'t need a reason to feel this way. I\'m here.',
            'You are loved on your hardest days. Especially then.',
            'Can I hold you? Or would you like some space? Either is okay.'
        ],
        treats: [
            { emoji: '🍫', name: 'Dark Chocolate' }, { emoji: '🍕', name: 'Her Comfort Food' },
            { emoji: '🧁', name: 'A Sweet Treat' }, { emoji: '🍟', name: 'Something Salty' },
            { emoji: '🛁', name: 'A Drawn Bath' }, { emoji: '☕', name: 'Her Comfort Drink' },
            { emoji: '🛋️', name: 'A Cozy Setup' }, { emoji: '🍦', name: 'Ice Cream' }
        ],
        kit: [
            { emoji: '🧸', text: 'Cozy blanket and comfort setup on the couch' },
            { emoji: '🍫', text: 'Chocolate and all her favorite snacks' },
            { emoji: '🔥', text: 'Heating pad ready (cramps may start)' },
            { emoji: '😌', text: 'Your patience and calm — the most important' },
            { emoji: '📺', text: 'Her favorite comfort shows queued up' },
            { emoji: '💊', text: 'Pain relief ready just in case' },
            { emoji: '🌿', text: 'Herbal teas for bloating and mood' },
            { emoji: '💌', text: 'A note reminding her she\'s loved' }
        ],
        messages: [
            'Hey 💕 I know this week can feel heavy. I love you. I\'m here. We don\'t have to do anything — just be together.',
            'I see you trying so hard even when you feel low. You\'re amazing. Tell me what you need and it\'s yours. 🌸',
            'No judgment, no expectations. Just me, loving you, for exactly who you are right now. That\'s it. 💜'
        ]
    }
};

// ============================================================
// STATE & STORAGE
// ============================================================

const DEFAULT_SETTINGS = {
    name: '',
    partnerName: '',
    role: '',
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: null
};

let state = {
    settings: { ...DEFAULT_SETTINGS },
    logs: {},
    tempSetup: {
    role: '',
    cycleLength: 28,
    periodLength: 5
}
};

function saveState() {
    localStorage.setItem('luna_state', JSON.stringify(state));
}

function loadState() {
    try {
        const saved = localStorage.getItem('luna_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            state.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
            state.logs = parsed.logs || {};

state.tempSetup = {
    role: '',
    cycleLength: 28,
    periodLength: 5,
    ...parsed.tempSetup
};
            return true;
        }
    } catch (e) { console.error('Failed to load state:', e); }
    return false;
}

// ============================================================
// CYCLE CALCULATIONS
// ============================================================

function getToday() {
    const d = new Date();
    return dateToKey(d);
}

function dateToKey(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function keyToDate(key) {
    return new Date(key + 'T00:00:00');
}

function getCycleDay(dateStr) {
    if (!state.settings.lastPeriodStart) return 1;
    const start = keyToDate(state.settings.lastPeriodStart);
    const target = dateStr ? keyToDate(dateStr) : new Date();
    const diffMs = target - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const cycleLen = state.settings.cycleLength;
    if (diffDays < 0) return ((diffDays % cycleLen) + cycleLen) % cycleLen + 1;
    return (diffDays % cycleLen) + 1;
}

function getPhase(cycleDay) {
    const pd = state.settings.periodLength;
    const cl = state.settings.cycleLength;
    const ovDay = Math.round(cl / 2);
    if (cycleDay <= pd) return 'menstrual';
    if (cycleDay <= ovDay - 2) return 'follicular';
    if (cycleDay <= ovDay + 2) return 'ovulation';
    return 'luteal';
}

function getDaysUntilNextPeriod() {
    if (!state.settings.lastPeriodStart) return null;
    const today = new Date();
    const start = keyToDate(state.settings.lastPeriodStart);
    const cl = state.settings.cycleLength;
    let nextPeriod = new Date(start);
    nextPeriod.setDate(nextPeriod.getDate() + cl);
    while (nextPeriod <= today) {
        nextPeriod.setDate(nextPeriod.getDate() + cl);
    }
    const diff = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));
    return diff;
}

function isPeriodDay(dateStr) {
    if (!state.settings.lastPeriodStart) return false;
    const target = keyToDate(dateStr);
    const start = keyToDate(state.settings.lastPeriodStart);
    const cl = state.settings.cycleLength;
    const pd = state.settings.periodLength;

    let cycleStart = new Date(start);
    // go back far enough
    while (cycleStart > target) cycleStart.setDate(cycleStart.getDate() - cl);
    while (cycleStart <= target) {
        const cycleEnd = new Date(cycleStart);
        cycleEnd.setDate(cycleEnd.getDate() + pd - 1);
        if (target >= cycleStart && target <= cycleEnd) return true;
        cycleStart.setDate(cycleStart.getDate() + cl);
    }
    return false;
}

function isPredictedFuturePeriodDay(dateStr) {
    if (!state.settings.lastPeriodStart) return false;
    const target = keyToDate(dateStr);
    const today = new Date();
    if (target <= today) return false;
    const start = keyToDate(state.settings.lastPeriodStart);
    const cl = state.settings.cycleLength;
    const pd = state.settings.periodLength;
    let nextStart = new Date(start);
    while (nextStart <= today) nextStart.setDate(nextStart.getDate() + cl);
    // Check next 3 cycles
    for (let i = 0; i < 3; i++) {
        const periodEnd = new Date(nextStart);
        periodEnd.setDate(periodEnd.getDate() + pd - 1);
        if (target >= nextStart && target <= periodEnd) return true;
        nextStart.setDate(nextStart.getDate() + cl);
    }
    return false;
}

function isOvulationDay(dateStr) {
    if (!state.settings.lastPeriodStart) return false;
    const cd = getCycleDay(dateStr);
    const cl = state.settings.cycleLength;
    const ovDay = Math.round(cl / 2);
    return cd >= ovDay - 1 && cd <= ovDay + 1;
}

// ============================================================
// NAVIGATION
// ============================================================

let currentPage = 'home';
let charts = {};

function navigateTo(page) {
    // Hide current page
    const oldPage = document.getElementById('page-' + currentPage);
    if (oldPage) oldPage.classList.remove('active');
    const oldNav = document.getElementById('nav-' + currentPage);
    if (oldNav) oldNav.classList.remove('active');

    currentPage = page;

    // Show new page
    const newPage = document.getElementById('page-' + page);
    if (newPage) newPage.classList.add('active');
    const newNav = document.getElementById('nav-' + page);
    if (newNav) newNav.classList.add('active');

    // Render page content
    switch (page) {
        case 'home': renderHome(); break;
        case 'calendar': renderCalendar(); break;
        case 'log': renderLog(); break;
        case 'insights': renderInsights(); break;
        case 'care': renderCare(); break;
        case 'partner': renderPartner(); break;
    }
}

// ============================================================
// SETUP FLOW
// ============================================================

let setupStep = 1;

function nextStep(step) {
    // Validate current step
    if (setupStep === 1) {
    const name = document.getElementById('setup-name').value.trim();

    if (!name) {
        shakeElement('setup-name');
        return;
    }

    state.tempSetup.name = name;

    // Skip period setup for partners
    if (state.tempSetup.role === 'partner') {
        completeSetup();
        return;
    }
}
    if (setupStep === 2) {
        const date = document.getElementById('setup-last-period').value;
        if (!date) {
            shakeElement('setup-last-period');
            return;
        }
        state.tempSetup.lastPeriodStart = date;
    }

    // Hide current step
    document.getElementById('step-' + setupStep).classList.remove('active');
    document.getElementById('dot-' + setupStep).classList.remove('active');

    // Show next step
    setupStep = step;
    document.getElementById('step-' + setupStep).classList.add('active');
    document.getElementById('dot-' + setupStep).classList.add('active');

    // Update picker displays
    document.getElementById('setup-cycle-val').textContent = state.tempSetup.cycleLength;
    document.getElementById('setup-period-val').textContent = state.tempSetup.periodLength;
}

function adjustSetupVal(key, delta, elId, min, max) {
    state.tempSetup[key] = Math.min(max, Math.max(min, (state.tempSetup[key] || 28) + delta));
    document.getElementById(elId).textContent = state.tempSetup[key];
}

function completeSetup() {
   console.log("COMPLETE SETUP RUNNING");
    state.settings.name = state.tempSetup.name || '';
   state.settings.role = state.tempSetup.role || '';
    state.settings.partnerName = document.getElementById('setup-partner-name').value.trim();
    state.settings.cycleLength = state.tempSetup.cycleLength || 28;
    state.settings.periodLength = state.tempSetup.periodLength || 5;
    state.settings.lastPeriodStart = state.tempSetup.lastPeriodStart || getToday();
   if (state.settings.role !== 'partner') {
      console.log("GENERATING CODE");
    state.settings.inviteCode =
        Math.random().toString(36).substring(2, 8).toUpperCase();
      console.log("INVITE CODE:", state.settings.inviteCode);
}

    saveState();
    showMainApp();
}

function showMainApp() {
    document.getElementById('setup-modal').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    renderHome();
}

function shakeElement(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = 'none';
    el.style.border = '1px solid var(--rose)';
    setTimeout(() => { el.style.border = ''; }, 1000);
}

// ============================================================
// HOME PAGE
// ============================================================

function renderHome() {
   alert("Partner Code: " + state.settings.inviteCode);
    const now = new Date();
    const hours = now.getHours();
    let greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
    const name = state.settings.name;
   if (state.settings.role === 'partner') {
    document.getElementById('greeting-text').textContent = greeting + ' 🌸';
    document.getElementById('greeting-name').textContent =
        name ? `Hey, ${name}!` : 'Welcome back';

    document.getElementById('cycle-day-num').textContent = '❤';

    const phaseBadge = document.getElementById('phase-badge');
    phaseBadge.textContent = 'PARTNER';

    document.getElementById('phase-description').textContent =
        'You are connected as a supportive partner.';

    return;
}

    document.getElementById('greeting-text').textContent = greeting + ' 🌸';
    document.getElementById('greeting-name').textContent = name ? `Hey, ${name}!` : 'Welcome back';

    const cycleDay = getCycleDay();
    const phase = getPhase(cycleDay);
    const phaseInfo = PHASE_DATA[phase];
    const daysUntilNext = getDaysUntilNextPeriod();
    const cl = state.settings.cycleLength;
    const progress = Math.min(100, (cycleDay / cl) * 100);

    // Update cycle display
    document.getElementById('cycle-day-num').textContent = cycleDay;

    const phaseBadge = document.getElementById('phase-badge');
    phaseBadge.textContent = phaseInfo.emoji + ' ' + phaseInfo.name;
    phaseBadge.className = 'phase-badge ' + phase;

    document.getElementById('phase-description').textContent = phaseInfo.description;

    if (daysUntilNext !== null) {
        if (phase === 'menstrual') {
            const pd = state.settings.periodLength;
            const daysLeft = pd - cycleDay + 1;
            document.getElementById('next-period-text').textContent = daysLeft > 0
                ? `🩸 Period ends in ~${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                : '📅 Almost there!';
        } else {
            document.getElementById('next-period-text').textContent =
                daysUntilNext === 1 ? '📅 Period expected tomorrow' :
                daysUntilNext === 0 ? '📅 Period expected today' :
                `📅 Next period in ${daysUntilNext} days`;
        }
    }

    // Progress bar
    document.getElementById('cycle-progress-fill').style.width = progress + '%';

    // Phase dots
    const phaseDots = document.getElementById('cycle-phase-dots');
    const phases = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    phaseDots.innerHTML = phases.map(p => `
        <div class="phase-dot ${p}-dot ${p === phase ? 'active' : ''}"></div>
    `).join('');

    // Today's stats from log
    const todayLog = state.logs[getToday()] || {};
    document.getElementById('stat-water').textContent = todayLog.water || 0;
    document.getElementById('stat-mood').textContent = todayLog.mood || '—';
    document.getElementById('stat-flow').textContent = todayLog.flow
        ? todayLog.flow.charAt(0).toUpperCase() + todayLog.flow.slice(1)
        : '—';

    // Today's tip
    const tip = phaseInfo.tip.replace('{day}', cycleDay);
    document.getElementById('todays-tip').textContent = tip;

    // Phase guide
    document.getElementById('phase-guide-title').textContent = phaseInfo.emoji + ' ' + phaseInfo.name + ' Phase Guide';
    const guideContent = document.getElementById('phase-guide-content');
    guideContent.innerHTML = phaseInfo.guideItems.map(item => `
        <div class="phase-guide-item">
            <div class="phase-guide-icon" style="background: ${item.color}">${item.icon}</div>
            <div class="phase-guide-text">
                <span>${item.text}</span>
            </div>
        </div>
    `).join('');
}

// ============================================================
// CALENDAR PAGE
// ============================================================

let calendarMonth = new Date();

function renderCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const monthNames = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
    document.getElementById('cal-month-label').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = getToday();

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cell = document.createElement('div');
        cell.textContent = d;
        cell.dataset.date = dateStr;

        let classes = ['cal-day'];
        if (dateStr === today) classes.push('today');
        if (isPeriodDay(dateStr) && keyToDate(dateStr) <= new Date()) classes.push('period-day');
        else if (isPredictedFuturePeriodDay(dateStr)) classes.push('predicted-day');
        if (isOvulationDay(dateStr)) classes.push('ovulation-day');
        if (state.logs[dateStr]) classes.push('logged-day');

        cell.className = classes.join(' ');
        cell.addEventListener('click', () => selectDay(dateStr));
        grid.appendChild(cell);
    }
}

function changeMonth(delta) {
    calendarMonth.setMonth(calendarMonth.getMonth() + delta);
    renderCalendar();
}

function selectDay(dateStr) {
    // Remove previous selection
    document.querySelectorAll('.cal-day.selected-day').forEach(el => el.classList.remove('selected-day'));
    const cell = document.querySelector(`.cal-day[data-date="${dateStr}"]`);
    if (cell) cell.classList.add('selected-day');

    const card = document.getElementById('selected-day-card');
    const title = document.getElementById('selected-day-title');
    const content = document.getElementById('selected-day-content');

    const d = keyToDate(dateStr);
    const dateDisplay = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const cd = getCycleDay(dateStr);
    const phase = getPhase(cd);
    const log = state.logs[dateStr];

    title.textContent = dateDisplay;

    let html = `<div class="day-log-detail">
        <div class="day-log-row">
            <span>📅 Cycle Day ${cd}</span>
            <span style="color: var(--${phase === 'menstrual' ? 'rose' : phase === 'follicular' ? 'peach' : phase === 'ovulation' ? 'lavender' : 'luteal'})">${PHASE_DATA[phase].name} Phase</span>
        </div>`;

    if (log) {
        if (log.flow && log.flow !== 'none') html += `<div class="day-log-row">🩸 Flow: ${log.flow}</div>`;
        if (log.mood) html += `<div class="day-log-row">${log.mood} Mood logged</div>`;
        if (log.water) html += `<div class="day-log-row">💧 ${log.water} glasses of water</div>`;
        if (log.symptoms && log.symptoms.length) html += `<div class="day-log-row">🤒 ${log.symptoms.length} symptom${log.symptoms.length !== 1 ? 's' : ''} logged</div>`;
        if (log.notes) html += `<div class="day-log-row">📓 "${log.notes.substring(0, 60)}${log.notes.length > 60 ? '...' : ''}"</div>`;
    } else {
        html += `<div class="day-log-row" style="color: var(--text-muted)">No log for this day</div>`;
    }

    html += '</div>';
    content.innerHTML = html;
    card.classList.remove('hidden');
}

// ============================================================
// LOG PAGE
// ============================================================

let currentLogData = {
    flow: null,
    symptoms: [],
    mood: null,
    water: 0,
    sleep: 8,
    meds: [],
    notes: ''
};

function renderLog() {
    // Set date picker to today
    const dateInput = document.getElementById('log-date');
    if (!dateInput.value) {
        dateInput.value = getToday();
    }
    loadLogForDate();

    // Render symptoms
    const sympGrid = document.getElementById('symptoms-grid');
    sympGrid.innerHTML = SYMPTOMS_LIST.map(s => `
        <button class="symptom-tag" data-symptom="${s}" onclick="toggleSymptom(this)" id="sym-${btoa(s).replace(/=/g,'')}">${s}</button>
    `).join('');

    // Render meds
    const medsGrid = document.getElementById('meds-grid');
    medsGrid.innerHTML = MEDS_LIST.map(m => `
        <button class="med-tag" data-med="${m}" onclick="toggleMed(this)" id="med-${btoa(m).replace(/=/g,'')}">${m}</button>
    `).join('');
}

function loadLogForDate() {
    const dateStr = document.getElementById('log-date').value || getToday();
    const log = state.logs[dateStr] || {};

    currentLogData = {
        flow: log.flow || null,
        symptoms: log.symptoms ? [...log.symptoms] : [],
        mood: log.mood || null,
        water: log.water || 0,
        sleep: log.sleep !== undefined ? log.sleep : 8,
        meds: log.meds ? [...log.meds] : [],
        notes: log.notes || ''
    };

    updateLogUI();
}

function updateLogUI() {
    // Flow
    document.querySelectorAll('.flow-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.flow === currentLogData.flow);
    });

    // Symptoms
    document.querySelectorAll('.symptom-tag').forEach(tag => {
        tag.classList.toggle('selected', currentLogData.symptoms.includes(tag.dataset.symptom));
    });

    // Mood
    document.querySelectorAll('.mood-btn').forEach(btn => {
        const moodEmoji = btn.getAttribute('onclick').match(/'(.+)'/)?.[1];
        btn.classList.toggle('selected', moodEmoji === currentLogData.mood);
    });

    // Water
    document.getElementById('water-count').textContent = currentLogData.water;
    updateWaterGlasses(currentLogData.water);

    // Sleep
    document.getElementById('sleep-count').textContent = currentLogData.sleep;

    // Meds
    document.querySelectorAll('.med-tag').forEach(tag => {
        tag.classList.toggle('selected', currentLogData.meds.includes(tag.dataset.med));
    });

    // Notes
    document.getElementById('log-notes').value = currentLogData.notes;
}

function selectFlow(flow) {
    currentLogData.flow = flow;
    document.querySelectorAll('.flow-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.flow === flow);
    });
}

function toggleSymptom(btn) {
    const s = btn.dataset.symptom;
    const idx = currentLogData.symptoms.indexOf(s);
    if (idx === -1) currentLogData.symptoms.push(s);
    else currentLogData.symptoms.splice(idx, 1);
    btn.classList.toggle('selected', idx === -1);
}

function selectMood(mood) {
    currentLogData.mood = mood;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        const m = btn.getAttribute('onclick').match(/'(.+)'/)?.[1];
        btn.classList.toggle('selected', m === mood);
    });
}

function adjustWater(delta) {
    currentLogData.water = Math.max(0, Math.min(16, currentLogData.water + delta));
    document.getElementById('water-count').textContent = currentLogData.water;
    updateWaterGlasses(currentLogData.water);
}

function updateWaterGlasses(count) {
    const container = document.getElementById('water-glasses');
    const total = 8;
    container.innerHTML = Array.from({ length: total }, (_, i) => `
        <span class="water-glass ${i < count ? 'filled' : 'empty'}">💧</span>
    `).join('');
}

function adjustSleep(delta) {
    currentLogData.sleep = Math.max(0, Math.min(12, currentLogData.sleep + delta));
    document.getElementById('sleep-count').textContent = currentLogData.sleep;
}

function toggleMed(btn) {
    const m = btn.dataset.med;
    const idx = currentLogData.meds.indexOf(m);
    if (idx === -1) currentLogData.meds.push(m);
    else currentLogData.meds.splice(idx, 1);
    btn.classList.toggle('selected', idx === -1);
}

function saveLog() {
    const dateStr = document.getElementById('log-date').value || getToday();
    currentLogData.notes = document.getElementById('log-notes').value;

    state.logs[dateStr] = { ...currentLogData };
    saveState();

    const success = document.getElementById('save-success');
    success.classList.remove('hidden');
    setTimeout(() => success.classList.add('hidden'), 3000);

    // Update home stats if saving today
    if (dateStr === getToday() && currentPage === 'log') {
        // Will update when navigating home
    }
}

// ============================================================
// INSIGHTS PAGE
// ============================================================

function renderInsights() {
    const logKeys = Object.keys(state.logs).sort();
    const totalLogs = logKeys.length;

    document.getElementById('avg-cycle-val').textContent = state.settings.cycleLength + 'd';
    document.getElementById('avg-period-val').textContent = state.settings.periodLength + 'd';
    document.getElementById('total-logs-val').textContent = totalLogs;

    if (totalLogs === 0) {
        document.getElementById('no-data-msg').classList.remove('hidden');
        return;
    }
    document.getElementById('no-data-msg').classList.add('hidden');

    // Get this month's logs
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${year}-${month}`;

    const monthLogs = logKeys.filter(k => k.startsWith(monthPrefix));
    const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

    // Destroy old charts
    Object.values(charts).forEach(c => { try { c.destroy(); } catch(e) {} });
    charts = {};

    // Mood Chart
    const moodValues = { '😄': 5, '😊': 4, '😐': 3, '🥰': 4.5, '😔': 2, '😢': 1.5, '😠': 2, '😰': 2 };
    const moodLabels = [];
    const moodData = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${monthPrefix}-${String(d).padStart(2,'0')}`;
        const log = state.logs[key];
        if (log && log.mood) {
            moodLabels.push(d);
            moodData.push(moodValues[log.mood] || 3);
        }
    }

    const chartDefaults = {
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#C4899A' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#C4899A' } }
        }
    };

    if (moodData.length > 0) {
        const moodCtx = document.getElementById('mood-chart').getContext('2d');
        charts.mood = new Chart(moodCtx, {
            type: 'line',
            data: {
                labels: moodLabels,
                datasets: [{
                    data: moodData,
                    borderColor: '#FF6B9D',
                    backgroundColor: 'rgba(255,107,157,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FF6B9D',
                    pointRadius: 4
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    ...chartDefaults.scales,
                    y: { ...chartDefaults.scales.y, min: 1, max: 5, ticks: { color: '#C4899A', stepSize: 1 } }
                }
            }
        });
    }

    // Symptoms Chart
    const symCount = {};
    logKeys.forEach(k => {
        const log = state.logs[k];
        if (log && log.symptoms) {
            log.symptoms.forEach(s => {
                // Shorten the symptom label
                const label = s.replace(/^[^\s]+ /, '');
                symCount[label] = (symCount[label] || 0) + 1;
            });
        }
    });

    const sortedSyms = Object.entries(symCount).sort((a,b) => b[1]-a[1]).slice(0, 6);
    if (sortedSyms.length > 0) {
        const symCtx = document.getElementById('symptoms-chart').getContext('2d');
        charts.symptoms = new Chart(symCtx, {
            type: 'bar',
            data: {
                labels: sortedSyms.map(s => s[0]),
                datasets: [{
                    data: sortedSyms.map(s => s[1]),
                    backgroundColor: [
                        'rgba(255,107,157,0.7)','rgba(192,132,219,0.7)',
                        'rgba(255,157,92,0.7)','rgba(126,207,160,0.7)',
                        'rgba(123,158,255,0.7)','rgba(255,173,133,0.7)'
                    ],
                    borderRadius: 6
                }]
            },
            options: chartDefaults
        });
    }

    // Water Chart
    const waterLabels = [];
    const waterData = [];
    for (let d = 1; d <= Math.min(now.getDate(), daysInMonth); d++) {
        const key = `${monthPrefix}-${String(d).padStart(2,'0')}`;
        const log = state.logs[key];
        waterLabels.push(d);
        waterData.push(log ? (log.water || 0) : 0);
    }

    if (waterLabels.length > 0) {
        const waterCtx = document.getElementById('water-chart').getContext('2d');
        charts.water = new Chart(waterCtx, {
            type: 'bar',
            data: {
                labels: waterLabels,
                datasets: [{
                    data: waterData,
                    backgroundColor: 'rgba(100,180,255,0.6)',
                    borderRadius: 6
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    ...chartDefaults.scales,
                    y: { ...chartDefaults.scales.y, min: 0, max: 10 }
                }
            }
        });
    }
}

// ============================================================
// SELF-CARE PAGE
// ============================================================

let affirmationIndex = Math.floor(Math.random() * AFFIRMATIONS.length);

function renderCare() {
    const cycleDay = getCycleDay();
    const phase = getPhase(cycleDay);
    const data = PHASE_DATA[phase];

    document.getElementById('care-subtitle').textContent = `Day ${cycleDay} — ${data.name} Phase ${data.emoji}`;

    // Phase banner
    const banner = document.getElementById('care-phase-banner');
    const bannerColors = {
        menstrual: 'rgba(255,92,141,0.15)',
        follicular: 'rgba(255,157,92,0.15)',
        ovulation: 'rgba(192,132,219,0.15)',
        luteal: 'rgba(123,158,255,0.15)'
    };
    const bannerTextColors = {
        menstrual: '#FF5C8D', follicular: '#FF9D5C',
        ovulation: '#C084DB', luteal: '#7B9EFF'
    };
    banner.style.background = bannerColors[phase];
    banner.style.border = `1px solid ${bannerTextColors[phase]}40`;
    banner.style.color = bannerTextColors[phase];
    banner.innerHTML = `${data.emoji} You're in your <strong>${data.name}</strong> phase — here's your tailored self-care guide`;

    // Fill lists
    fillCareList('food-recs', data.foods);
    fillCareList('exercise-recs', data.exercise);
    fillCareList('remedy-recs', data.remedies);
    fillCareList('mind-recs', data.mind);

    // Affirmation
    document.getElementById('affirmation-text').textContent = `"${AFFIRMATIONS[affirmationIndex]}"`;
}

function fillCareList(id, items) {
    const el = document.getElementById(id);
    el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

function refreshAffirmation() {
    affirmationIndex = (affirmationIndex + 1) % AFFIRMATIONS.length;
    const el = document.getElementById('affirmation-text');
    el.style.opacity = '0';
    setTimeout(() => {
        el.textContent = `"${AFFIRMATIONS[affirmationIndex]}"`;
        el.style.opacity = '1';
        el.style.transition = 'opacity 0.3s';
    }, 200);
}

// ============================================================
// PARTNER VIEW PAGE
// ============================================================

function renderPartner() {
    const cycleDay = getCycleDay();
    const phase = getPhase(cycleDay);
    const data = PARTNER_DATA[phase];
    const phaseInfo = PHASE_DATA[phase];
    const partnerName = state.settings.partnerName;
    const userName = state.settings.name || 'her';

    // Update subtitle
    document.getElementById('partner-hero-sub').textContent =
        partnerName ? `A gentle guide to supporting ${userName} 🌸` : `A gentle guide to supporting her 🌸`;

    // Status
    document.getElementById('partner-day-badge').textContent = `Day ${cycleDay}`;
    document.getElementById('partner-phase-badge').textContent = phaseInfo.emoji + ' ' + phaseInfo.name + ' Phase';
    document.getElementById('partner-status-desc').textContent = data.status;

    // Feelings
    const feelingsList = document.getElementById('partner-feelings-list');
    feelingsList.innerHTML = data.feelings.map(f => `<li>${f}</li>`).join('');

    // Help
    const helpList = document.getElementById('partner-help-list');
    helpList.innerHTML = data.help.map(h => `<li>${h}</li>`).join('');

    // Avoid
    const avoidList = document.getElementById('partner-avoid-list');
    avoidList.innerHTML = data.avoid.map(a => `<li>${a}</li>`).join('');

    // Say
    const sayList = document.getElementById('partner-say-list');
    const name = state.settings.name;
    sayList.innerHTML = data.say.map(s => {
        const quote = name ? s.replace(/\bher\b/g, name).replace(/\bshe\b/g, name) : s;
        return `<div class="say-quote">${quote}</div>`;
    }).join('');

    // Treats
    const treatsList = document.getElementById('partner-treats-list');
    treatsList.innerHTML = data.treats.map(t => `
        <div class="treat-item">
            <span class="treat-emoji">${t.emoji}</span>
            <span>${t.name}</span>
        </div>
    `).join('');

    // Kit
    const kitList = document.getElementById('partner-kit-list');
    kitList.innerHTML = data.kit.map((item, i) => `
        <div class="kit-item" onclick="toggleKitItem(this)" id="kit-${i}">
            <div class="kit-checkbox"></div>
            <span class="kit-item-emoji">${item.emoji}</span>
            <span class="kit-item-text">${item.text}</span>
        </div>
    `).join('');
}

function toggleKitItem(el) {
    el.classList.toggle('checked');
}

function sendLove() {
    const cycleDay = getCycleDay();
    const phase = getPhase(cycleDay);
    const messages = PARTNER_DATA[phase].messages;
    const message = messages[Math.floor(Math.random() * messages.length)];
    const name = state.settings.name;
    const finalMsg = name ? message.replace(/\bhoney\b/gi, name) : message;

    navigator.clipboard.writeText(finalMsg).then(() => {
        const copied = document.getElementById('love-copied');
        copied.classList.remove('hidden');
        setTimeout(() => copied.classList.add('hidden'), 4000);
    }).catch(() => {
        // Fallback
        const el = document.getElementById('love-copied');
        el.textContent = `💌 "${finalMsg}"`;
        el.classList.remove('hidden');
        setTimeout(() => { el.classList.add('hidden'); el.textContent = '✅ Copied! Send it to her 💕'; }, 5000);
    });
}

// ============================================================
// SETTINGS
// ============================================================

function showSettings() {
    const s = state.settings;
    document.getElementById('settings-name').value = s.name || '';
    document.getElementById('settings-partner').value = s.partnerName || '';
    document.getElementById('sl-cycle').textContent = s.cycleLength;
    document.getElementById('sl-period').textContent = s.periodLength;
    document.getElementById('settings-last-period').value = s.lastPeriodStart || '';
    document.getElementById('settings-modal').classList.remove('hidden');
}

function hideSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
}

function adjustSettingLive(key, delta, elId, min, max) {
    state.settings[key] = Math.min(max, Math.max(min, state.settings[key] + delta));
    document.getElementById(elId).textContent = state.settings[key];
}

function saveSettings() {
    state.settings.name = document.getElementById('settings-name').value.trim();
    state.settings.partnerName = document.getElementById('settings-partner').value.trim();
    const lastPeriod = document.getElementById('settings-last-period').value;
    if (lastPeriod) state.settings.lastPeriodStart = lastPeriod;
    saveState();
    hideSettings();
    renderHome();
}

function resetApp() {
    if (confirm('Are you sure? This will delete all your data and start over.')) {
        localStorage.removeItem('luna_state');
        sb.auth.signOut().finally(() => location.reload());
    }
}

// ============================================================
// INIT
// ============================================================

async function initWithAuth() {
    // Check for existing Supabase session first
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        // Already logged in — skip auth screen and go straight to Luna
        document.getElementById('auth-screen').classList.add('hidden');
        init();
    } else {
        // Show auth screen; keep setup-modal hidden until after login
        document.getElementById('auth-screen').classList.remove('hidden');
    }
}

function init() {
    const hasData = loadState();

    // Skip setup for partners
    if (state.tempSetup.role === 'partner') {
        showMainApp();
        return;
    }

    if (hasData && state.settings.name && state.settings.lastPeriodStart) {
        showMainApp();
    } else {
        // Pre-fill name if we captured it during signup
        if (state.tempSetup.name) {
            document.getElementById('setup-name').value = state.tempSetup.name;
        }

        // Set default date for setup
        const today = getToday();
        document.getElementById('setup-last-period').value = today;

        // Show setup
        document.getElementById('setup-modal').classList.remove('hidden');
    }


    // Initialize log date
    document.getElementById('log-date').value = getToday();
}

document.addEventListener('DOMContentLoaded', initWithAuth);

// Close settings modal on backdrop click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('settings-modal');
    if (e.target === modal) hideSettings();
});
