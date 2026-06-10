'use client';

// Demo local storage utility - stores announcements, threads, replies, and polls in localStorage
// This allows the site to work without Supabase during demo/preview mode

interface StoredAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'guidance' | 'update' | 'training' | 'policy';
  is_pinned: boolean;
  created_at: string;
}

interface StoredReply {
  id: string;
  thread_id: string;
  author: string;
  content: string;
  parent_reply_id: string | null;
  created_at: string;
}

interface StoredThread {
  id: string;
  title: string;
  content: string;
  author: string;
  clusterName: string | null;
  is_resolved: boolean;
  created_at: string;
}

interface StoredPollOption {
  id: string;
  text: string;
  sort_order: number;
  vote_count: number;
}

interface StoredPoll {
  id: string;
  question: string;
  description: string;
  author: string;
  clusterName: string | null;
  is_active: boolean;
  ends_at: string | null;
  created_at: string;
  options: StoredPollOption[];
}

interface StoredVote {
  poll_id: string;
  option_id: string;
}

const ANNOUNCEMENTS_KEY = 'hhc-demo-announcements';
const THREADS_KEY = 'hhc-demo-threads';
const REPLIES_KEY = 'hhc-demo-replies';
const POLLS_KEY = 'hhc-demo-polls';
const VOTES_KEY = 'hhc-demo-votes';
const SEEDED_KEY = 'hhc-demo-seeded';

function generateId(): string {
  return 'demo-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
}

function seedData() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEEDED_KEY)) return;

  const baseTime = Date.now();

  // Seed announcements
  const announcements: StoredAnnouncement[] = [
    {
      id: 'seed-ann-1',
      title: 'Q3 Costing Standards Update — Mandatory Review Required',
      content: 'All cluster costing leads must review the updated clinical costing standards for Q3. Key changes include revised DRG weighting methodologies and updated pharmaceutical cost allocation models. A mandatory training session will be held on June 25th. Please ensure your cluster\'s data is aligned with the new standards by July 15th.\n\nChanges summary:\n- DRG weight recalibration based on 2025 national data\n- New pharmaceutical cost allocation for high-cost drugs\n- Updated indirect cost distribution formulas\n- Revised outpatient visit cost benchmarks',
      author: 'Dr. Abdullah Al-Rashid (HHC Admin)',
      category: 'policy' as const,
      is_pinned: true,
      created_at: new Date(baseTime - 86400000 * 2).toISOString(),
    },
    {
      id: 'seed-ann-2',
      title: 'New Clinical Costing Dashboard Features Released',
      content: 'We are pleased to announce the release of new dashboard features for the clinical costing platform. The updates include enhanced data visualization tools, real-time benchmarking across clusters, and improved export capabilities for Ministry of Health reporting.\n\nNew features:\n- Cluster benchmarking heatmaps\n- Cost variance alerts\n- Automated MOH report generation\n- Interactive cost driver analysis',
      author: 'Fatima Al-Zahrani (HHC Admin)',
      category: 'update' as const,
      is_pinned: false,
      created_at: new Date(baseTime - 86400000 * 5).toISOString(),
    },
    {
      id: 'seed-ann-3',
      title: 'Training: Advanced Activity-Based Costing Workshop',
      content: 'A two-day advanced workshop on Activity-Based Costing for clinical services will be held in Riyadh on July 10-11. This workshop is designed for experienced costing professionals who want to deepen their understanding of ABC methodology in a clinical context.\n\nTopics covered:\n- Time-driven ABC for emergency departments\n- Cost tracing for multi-disciplinary care pathways\n- Integrating clinical quality metrics with cost data\n- Hands-on case studies from leading clusters',
      author: 'Dr. Abdullah Al-Rashid (HHC Admin)',
      category: 'training' as const,
      is_pinned: false,
      created_at: new Date(baseTime - 86400000 * 8).toISOString(),
    },
    {
      id: 'seed-ann-4',
      title: 'Guidance: Standardizing ICU Cost Allocation Across Clusters',
      content: 'Following the recent benchmarking review, HHC is issuing updated guidance on ICU cost allocation. This guidance aims to standardize how intensive care costs are attributed across different specialties and patient groups.\n\nKey recommendations:\n- Use patient-level costing where feasible\n- Apply consistent nurse-to-patient ratio weightings\n- Standardize equipment cost amortization periods\n- Include pharmacy costs at the patient level',
      author: 'Fatima Al-Zahrani (HHC Admin)',
      category: 'guidance' as const,
      is_pinned: true,
      created_at: new Date(baseTime - 86400000 * 12).toISOString(),
    },
  ];

  // Seed threads
  const threads: StoredThread[] = [
    {
      id: 'seed-thread-1',
      title: 'How are you handling pharmaceutical cost allocation in outpatient clinics?',
      content: 'Our cluster (Riyadh First) is currently reviewing our methodology for allocating pharmaceutical costs to outpatient visits. We\'ve been using a simple average cost per prescription approach, but I\'m wondering if other clusters are using more sophisticated methods like ATC-level allocation or patient-level costing.\n\nSpecifically interested in:\n- How do you handle high-cost biologics administered in outpatient settings?\n- Do you separate drug costs by therapeutic area?\n- What cost driver do you use for pharmacy overhead?\n\nWould love to hear from other clusters!',
      author: 'Mohammed Al-Qahtani',
      clusterName: 'Riyadh First',
      is_resolved: false,
      created_at: new Date(baseTime - 86400000 * 3).toISOString(),
    },
    {
      id: 'seed-thread-2',
      title: 'Best practices for costing telemedicine consultations?',
      content: 'With the rapid expansion of telemedicine services across all clusters, we need to establish consistent costing methodologies. Our current approach at Jeddah First treats telemedicine as a flat-rate consultation, but this doesn\'t capture the variation in complexity.\n\nQuestions:\n- How do you differentiate between follow-up and new patient teleconsultations?\n- Are you including IT infrastructure costs in the consultation cost?\n- How do you handle multi-disciplinary virtual clinics?',
      author: 'Noura Al-Harbi',
      clusterName: 'Jeddah First',
      is_resolved: true,
      created_at: new Date(baseTime - 86400000 * 6).toISOString(),
    },
    {
      id: 'seed-thread-3',
      title: 'Emergency Department cost per visit benchmarking',
      content: 'We\'ve been tracking our ED cost per visit at Makkah Al-Mukarramah and would like to compare with other clusters. Our current average is SAR 850 per visit, but this varies significantly between triage categories.\n\nWould anyone be willing to share their ED cost benchmarks (anonymized)? Also interested in methodology differences for:\n- Physician cost allocation (dedicated ED physicians vs rotating specialists)\n- Trauma team activation costs\n- Observation unit costs',
      author: 'Dr. Khalid Al-Otaibi',
      clusterName: 'Makkah Al-Mukarramah',
      is_resolved: false,
      created_at: new Date(baseTime - 86400000 * 9).toISOString(),
    },
    {
      id: 'seed-thread-4',
      title: 'Integrating clinical coding accuracy into costing models',
      content: 'One challenge we face is the relationship between clinical coding quality and cost accuracy. Poor coding leads to incorrect DRG assignments and skewed cost data. How are other clusters addressing this?\n\nAt Eastern Cluster, we\'ve started a joint initiative between the coding and costing teams to:\n- Regular coding audits with cost impact analysis\n- Feedback loops from cost anomalies to coding review\n- Training programs linking coding accuracy to financial outcomes\n\nHas anyone else tried similar approaches? What results have you seen?',
      author: 'Aisha Al-Mutairi',
      clusterName: 'Eastern',
      is_resolved: false,
      created_at: new Date(baseTime - 86400000 * 14).toISOString(),
    },
    {
      id: 'seed-thread-5',
      title: 'Costing Radiology Services — MRI and CT cost drivers',
      content: 'We\'re reviewing our radiology costing methodology at Aseer cluster and would appreciate insights from others. Our current approach uses machine hours as the primary cost driver, but we\'re finding that staff costs (radiologists + technicians) are a much larger proportion than initially assumed.\n\nQuestions for the community:\n- What cost drivers do you use for MRI vs CT vs X-ray?\n- How do you allocate radiologist time across different modalities?\n- Do you include contrast media as a direct cost?\n- How do you handle emergency vs elective imaging cost differentials?',
      author: 'Faisal Al-Ghamdi',
      clusterName: 'Aseer',
      is_resolved: false,
      created_at: new Date(baseTime - 86400000 * 18).toISOString(),
    },
  ];

  // Seed replies
  const replies: StoredReply[] = [
    {
      id: 'seed-reply-1',
      thread_id: 'seed-thread-1',
      author: 'Dr. Sarah Al-Shammari',
      content: 'At Jeddah Second, we moved to ATC-level allocation about 6 months ago and it\'s been a significant improvement. For high-cost biologics, we do patient-level costing — it\'s more work but the accuracy gain is worth it. Our pharmacy overhead is allocated based on number of prescriptions dispensed, weighted by complexity (compounded vs ready-to-dispense).',
      parent_reply_id: null,
      created_at: new Date(baseTime - 86400000 * 2.5).toISOString(),
    },
    {
      id: 'seed-reply-2',
      thread_id: 'seed-thread-1',
      author: 'Mohammed Al-Qahtani',
      content: 'Thank you Dr. Sarah! This is very helpful. For the patient-level biologic costing, are you using actual acquisition cost or a weighted average? Also curious if you\'re including administration costs (nursing time, infusion chairs) in the drug cost or separately?',
      parent_reply_id: null,
      created_at: new Date(baseTime - 86400000 * 2).toISOString(),
    },
    {
      id: 'seed-reply-3',
      thread_id: 'seed-thread-1',
      author: 'Dr. Sarah Al-Shammari',
      content: 'We use actual acquisition cost via our pharmacy information system integration. Administration costs (nursing, consumables, chair time) are tracked separately through our day-care unit costing module. This lets us separate the drug cost from the service cost for better analysis.',
      parent_reply_id: 'seed-reply-2',
      created_at: new Date(baseTime - 86400000 * 1.5).toISOString(),
    },
    {
      id: 'seed-reply-4',
      thread_id: 'seed-thread-2',
      author: 'Dr. Tariq Al-Hassan',
      content: 'Excellent topic! At Qassim cluster, we differentiate telemedicine visits by: New patient (45 min avg), Follow-up (20 min avg), and Multi-disciplinary (60 min avg). We include a share of the telemedicine platform licensing cost per consult, and depreciation on the devices used. For multi-disciplinary virtual clinics, we cost each specialist\'s time separately and combine.',
      parent_reply_id: null,
      created_at: new Date(baseTime - 86400000 * 5).toISOString(),
    },
    {
      id: 'seed-reply-5',
      thread_id: 'seed-thread-2',
      author: 'Noura Al-Harbi',
      content: 'Dr. Tariq, this is exactly what I was looking for. The time-based differentiation makes a lot of sense. Are you also factoring in the cost of failed connections or technical support time? We\'ve noticed about 5-8% of our teleconsultations have technical issues that require IT support.',
      parent_reply_id: 'seed-reply-4',
      created_at: new Date(baseTime - 86400000 * 4.5).toISOString(),
    },
    {
      id: 'seed-reply-6',
      thread_id: 'seed-thread-3',
      author: 'Omar Al-Zahrani',
      content: 'At Tabuk, our ED cost per visit averages SAR 790. We use a triage-weighted model: Category 1 (critical) costs are ~SAR 2,400; Category 5 (non-urgent) are ~SAR 350. We include dedicated ED physician costs but rotating specialists are costed to their home department. Happy to share more details offline.',
      parent_reply_id: null,
      created_at: new Date(baseTime - 86400000 * 8).toISOString(),
    },
    {
      id: 'seed-reply-7',
      thread_id: 'seed-thread-3',
      author: 'Dr. Khalid Al-Otaibi',
      content: 'This is very helpful for context, Omar. Our triage 1 costs are similar (~SAR 2,600) but our triage 5 costs are higher at ~SAR 480. I think the difference might be in how we allocate initial nursing assessment time. Would you be open to a more detailed comparison?',
      parent_reply_id: 'seed-reply-6',
      created_at: new Date(baseTime - 86400000 * 7.5).toISOString(),
    },
    {
      id: 'seed-reply-8',
      thread_id: 'seed-thread-4',
      author: 'Layla Al-Anazi',
      content: 'This is a critical topic! At Riyadh Second, we implemented a similar approach and saw a 15% improvement in cost allocation accuracy within the first quarter. We also added a monthly "coding-costing reconciliation" meeting where the top 10 cost anomalies are reviewed jointly. This has been transformative — it catches coding errors AND costing methodology issues at the same time.',
      parent_reply_id: null,
      created_at: new Date(baseTime - 86400000 * 13).toISOString(),
    },
    {
      id: 'seed-reply-9',
      thread_id: 'seed-thread-4',
      author: 'Aisha Al-Mutairi',
      content: 'Layla, the monthly reconciliation meeting is a brilliant idea — I\'m going to propose this at our next team meeting. What format do you use for presenting the anomalies? Do you have a standardized template you\'d be willing to share?',
      parent_reply_id: 'seed-reply-8',
      created_at: new Date(baseTime - 86400000 * 12.5).toISOString(),
    },
    {
      id: 'seed-reply-10',
      thread_id: 'seed-thread-5',
      author: 'Hassan Al-Balawi',
      content: 'At Jazan, we use a combination of machine hours and RVU (Relative Value Units) for radiologist time allocation. For MRI, we assign 2.5 RVUs per scan, for CT 1.5 RVUs. Contrast media is treated as a direct consumable cost. For emergency vs elective, we apply a 20% uplift to account for the 24/7 standby costs. This has given us much better cost visibility than machine hours alone.',
      parent_reply_id: null,
      created_at: new Date(baseTime - 86400000 * 17).toISOString(),
    },
  ];

  // Seed polls
  const polls: StoredPoll[] = [
    {
      id: 'seed-poll-1',
      question: 'Which costing methodology does your cluster primarily use?',
      description: 'Help us understand the current state of costing methodology adoption across the 20 clusters.',
      author: 'Dr. Abdullah Al-Rashid (HHC Admin)',
      clusterName: null,
      is_active: true,
      ends_at: new Date(baseTime + 86400000 * 14).toISOString(),
      created_at: new Date(baseTime - 86400000 * 7).toISOString(),
      options: [
        { id: 'seed-poll-1-opt-1', text: 'Activity-Based Costing (ABC)', sort_order: 1, vote_count: 8 },
        { id: 'seed-poll-1-opt-2', text: 'Time-Driven ABC (TDABC)', sort_order: 2, vote_count: 4 },
        { id: 'seed-poll-1-opt-3', text: 'Traditional Cost-to-Charge Ratio', sort_order: 3, vote_count: 3 },
        { id: 'seed-poll-1-opt-4', text: 'Hybrid approach', sort_order: 4, vote_count: 5 },
      ],
    },
    {
      id: 'seed-poll-2',
      question: 'What is your biggest challenge in clinical costing?',
      description: 'Identifying common pain points to help HHC prioritize support and resources.',
      author: 'Fatima Al-Zahrani (HHC Admin)',
      clusterName: null,
      is_active: true,
      ends_at: new Date(baseTime + 86400000 * 21).toISOString(),
      created_at: new Date(baseTime - 86400000 * 4).toISOString(),
      options: [
        { id: 'seed-poll-2-opt-1', text: 'Data quality and completeness', sort_order: 1, vote_count: 9 },
        { id: 'seed-poll-2-opt-2', text: 'Clinical coding accuracy', sort_order: 2, vote_count: 5 },
        { id: 'seed-poll-2-opt-3', text: 'IT system integration', sort_order: 3, vote_count: 4 },
        { id: 'seed-poll-2-opt-4', text: 'Staff training and capacity', sort_order: 4, vote_count: 3 },
      ],
    },
    {
      id: 'seed-poll-3',
      question: 'Should we establish a national clinical costing benchmarking group?',
      description: 'Proposal to create a formal benchmarking group that meets quarterly to share best practices and compare methodologies.',
      author: 'Mohammed Al-Qahtani',
      clusterName: 'Riyadh First',
      is_active: true,
      ends_at: new Date(baseTime + 86400000 * 30).toISOString(),
      created_at: new Date(baseTime - 86400000 * 10).toISOString(),
      options: [
        { id: 'seed-poll-3-opt-1', text: 'Yes — and I want to participate', sort_order: 1, vote_count: 14 },
        { id: 'seed-poll-3-opt-2', text: 'Yes — but only for methodology sharing (no data)', sort_order: 2, vote_count: 4 },
        { id: 'seed-poll-3-opt-3', text: 'Need more information before deciding', sort_order: 3, vote_count: 2 },
        { id: 'seed-poll-3-opt-4', text: 'Not interested at this time', sort_order: 4, vote_count: 1 },
      ],
    },
  ];

  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  localStorage.setItem(VOTES_KEY, JSON.stringify([]));
  localStorage.setItem(SEEDED_KEY, 'true');
}

// --- Announcements ---

export function getStoredAnnouncements(): StoredAnnouncement[] {
  if (typeof window === 'undefined') return [];
  seedData();
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveAnnouncement(data: {
  title: string;
  content: string;
  category: 'guidance' | 'update' | 'training' | 'policy';
  author: string;
}): StoredAnnouncement {
  const announcements = getStoredAnnouncements();
  const newAnnouncement: StoredAnnouncement = {
    id: generateId(),
    title: data.title,
    content: data.content,
    category: data.category,
    author: data.author,
    is_pinned: false,
    created_at: new Date().toISOString(),
  };
  announcements.unshift(newAnnouncement);
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  return newAnnouncement;
}

export function deleteAnnouncement(id: string): boolean {
  const announcements = getStoredAnnouncements();
  const filtered = announcements.filter(a => a.id !== id);
  if (filtered.length === announcements.length) return false;
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(filtered));
  return true;
}

export function togglePinAnnouncement(id: string): StoredAnnouncement | null {
  const announcements = getStoredAnnouncements();
  const idx = announcements.findIndex(a => a.id === id);
  if (idx === -1) return null;
  announcements[idx].is_pinned = !announcements[idx].is_pinned;
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  return announcements[idx];
}

// --- Threads ---

export function getStoredThreads(): StoredThread[] {
  if (typeof window === 'undefined') return [];
  seedData();
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveThread(data: {
  title: string;
  content: string;
  author: string;
  clusterName: string | null;
}): StoredThread {
  const threads = getStoredThreads();
  const newThread: StoredThread = {
    id: generateId(),
    title: data.title,
    content: data.content,
    author: data.author,
    clusterName: data.clusterName,
    is_resolved: false,
    created_at: new Date().toISOString(),
  };
  threads.unshift(newThread);
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  return newThread;
}

export function toggleResolvedThread(id: string): StoredThread | null {
  const threads = getStoredThreads();
  const idx = threads.findIndex(t => t.id === id);
  if (idx === -1) return null;
  threads[idx].is_resolved = !threads[idx].is_resolved;
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  return threads[idx];
}

export function deleteThread(id: string): boolean {
  const threads = getStoredThreads();
  const filtered = threads.filter(t => t.id !== id);
  if (filtered.length === threads.length) return false;
  localStorage.setItem(THREADS_KEY, JSON.stringify(filtered));
  // Also delete replies
  const replies = getStoredReplies();
  localStorage.setItem(REPLIES_KEY, JSON.stringify(replies.filter(r => r.thread_id !== id)));
  return true;
}

// --- Replies ---

export function getStoredReplies(threadId?: string): StoredReply[] {
  if (typeof window === 'undefined') return [];
  seedData();
  try {
    const raw = localStorage.getItem(REPLIES_KEY);
    const all: StoredReply[] = raw ? JSON.parse(raw) : [];
    return threadId ? all.filter(r => r.thread_id === threadId) : all;
  } catch { return []; }
}

export function saveReply(data: {
  thread_id: string;
  author: string;
  content: string;
  parent_reply_id?: string | null;
}): StoredReply {
  const replies = getStoredReplies();
  const newReply: StoredReply = {
    id: generateId(),
    thread_id: data.thread_id,
    author: data.author,
    content: data.content,
    parent_reply_id: data.parent_reply_id || null,
    created_at: new Date().toISOString(),
  };
  replies.push(newReply);
  localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));
  return newReply;
}

// --- Polls ---

export function getStoredPolls(): StoredPoll[] {
  if (typeof window === 'undefined') return [];
  seedData();
  try {
    const raw = localStorage.getItem(POLLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function getStoredPoll(id: string): StoredPoll | null {
  return getStoredPolls().find(p => p.id === id) || null;
}

export function savePoll(data: {
  question: string;
  description: string;
  author: string;
  clusterName: string | null;
  options: string[];
  ends_at: string | null;
}): StoredPoll {
  const polls = getStoredPolls();
  const newPoll: StoredPoll = {
    id: generateId(),
    question: data.question,
    description: data.description,
    author: data.author,
    clusterName: data.clusterName,
    is_active: true,
    ends_at: data.ends_at,
    created_at: new Date().toISOString(),
    options: data.options.map((text, i) => ({
      id: generateId() + '-opt-' + i,
      text,
      sort_order: i + 1,
      vote_count: 0,
    })),
  };
  polls.unshift(newPoll);
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  return newPoll;
}

export function getStoredVotes(): StoredVote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function castVote(pollId: string, optionId: string): { success: boolean; message: string } {
  const votes = getStoredVotes();
  const existing = votes.find(v => v.poll_id === pollId);
  if (existing) {
    // Change vote
    existing.option_id = optionId;
  } else {
    votes.push({ poll_id: pollId, option_id: optionId });
  }
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));

  // Update poll option count
  const polls = getStoredPolls();
  const poll = polls.find(p => p.id === pollId);
  if (poll) {
    const option = poll.options.find(o => o.id === optionId);
    if (option) {
      option.vote_count += 1;
      localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
    }
  }
  return { success: true, message: existing ? 'Vote updated!' : 'Vote cast!' };
}

export function getUserVoteOptionId(pollId: string): string | null {
  const votes = getStoredVotes();
  const vote = votes.find(v => v.poll_id === pollId);
  return vote ? vote.option_id : null;
}

export function togglePollActive(id: string): StoredPoll | null {
  const polls = getStoredPolls();
  const idx = polls.findIndex(p => p.id === id);
  if (idx === -1) return null;
  polls[idx].is_active = !polls[idx].is_active;
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
  return polls[idx];
}

export function deletePoll(id: string): boolean {
  const polls = getStoredPolls();
  const filtered = polls.filter(p => p.id !== id);
  if (filtered.length === polls.length) return false;
  localStorage.setItem(POLLS_KEY, JSON.stringify(filtered));
  const votes = getStoredVotes().filter(v => v.poll_id !== id);
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  return true;
}

// --- Stats ---

export function getCommunityStats() {
  const threads = getStoredThreads();
  const replies = getStoredReplies();
  const polls = getStoredPolls();
  const announcements = getStoredAnnouncements();

  return {
    total_threads: threads.length,
    total_replies: replies.length,
    total_polls: polls.length,
    total_announcements: announcements.length,
    active_users: 24, // simulated
    clusters_active: 18, // simulated
  };
}