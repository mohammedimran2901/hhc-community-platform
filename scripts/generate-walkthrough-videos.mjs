#!/usr/bin/env node
/**
 * Generate walkthrough videos for the How to Use page
 * Uses edge-tts for TTS and ffmpeg to compose MP4 videos
 *
 * Usage: node scripts/generate-walkthrough-videos.mjs
 */

import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'videos');
mkdirSync(outDir, { recursive: true });

// ============================================
// SECTION DEFINITIONS
// ============================================

const sections = [
  {
    id: 'dashboard',
    en: {
      title: 'Dashboard Overview',
      script: `Welcome to the HHC Clinical Costing Community. Let me show you around. When you first enter the platform, you'll see the dashboard. Here you'll find key metrics at a glance: total discussion threads, active replies, community polls, and announcements. The dashboard is your central hub. You can browse recent discussions and vote in community polls right from this page.`,
    },
    ar: {
      title: 'نظرة عامة على لوحة التحكم',
      script: `مرحباً بك في مجتمع التسعير السريري التابع لهيئة الصحة. دعني أريك المنصة. عند دخولك للمنصة لأول مرة، ستظهر لك لوحة التحكم. ستجد هنا المؤشرات الرئيسية بنظرة سريعة: إجمالي مواضيع النقاش والردود النشطة واستطلاعات الرأي والإعلانات. لوحة التحكم هي مركزك الرئيسي. يمكنك تصفح أحدث المناقشات والتصويت في استطلاعات الرأي مباشرة من هذه الصفحة.`,
    },
  },
  {
    id: 'announcements',
    en: {
      title: 'Announcements',
      script: `The announcements section is where the Health Holding Company publishes official communications. You'll find policy updates, training opportunities, and guidance documents here. Pinned items always appear at the top. Click any announcement to read the full details. Each one shows the category, author, and publication date.`,
    },
    ar: {
      title: 'الإعلانات والتوجيهات',
      script: `قسم الإعلانات هو المكان الذي تنشر فيه هيئة الصحة الاتصالات الرسمية. ستجد هنا تحديثات السياسات والفرص التدريبية ووثائق التوجيه. تظهر العناصر المثبتة دائماً في الأعلى. انقر على أي إعلان لقراءة التفاصيل الكاملة. كل إعلان يعرض الفئة والمؤلف وتاريخ النشر.`,
    },
  },
  {
    id: 'forum',
    en: {
      title: 'Community Forum',
      script: `The forum is where you can ask questions, share knowledge, and collaborate with colleagues across all twenty health clusters. Start a new thread by clicking the New Thread button, give it a title, write your content, and select your cluster. You can reply to existing threads, filter by cluster, and mark discussions as resolved when your question is answered.`,
    },
    ar: {
      title: 'منتدى المجتمع',
      script: `المنتدى هو مكان لطرح الأسئلة وتبادل المعرفة والتعاون مع الزملاء عبر جميع التجمعات الصحية العشرين. ابدأ موضوعاً جديداً بالنقر على زر موضوع جديد، وأعطه عنواناً واكتب محتواك واختر تجمعك الصحي. يمكنك الرد على المواضيع الحالية وتصفيتها حسب التجمع وتحديد المناقشات كمكتملة عند الإجابة على سؤالك.`,
    },
  },
  {
    id: 'polls',
    en: {
      title: 'Community Polls',
      script: `Community polls let you share your insights and see what others think. You can view active polls on the dashboard. Simply click on an option to cast your vote. You'll see results update in real time with percentage bars. You can change your vote if you change your mind. Polls help HHC understand the needs and preferences of clusters across the Kingdom.`,
    },
    ar: {
      title: 'استطلاعات الرأي',
      script: `تتيح لك استطلاعات الرأي مشاركة رؤاك ومعرفة آراء الآخرين. يمكنك عرض الاستطلاعات النشطة على لوحة التحكم. ما عليك سوى النقر على خيار للإدلاء بصوتك. ستشاهد النتائج تحدث في الوقت الفعلي مع أشرطة النسبة المئوية. يمكنك تغيير صوتك إذا غيرت رأيك. تساعد الاستطلاعات هيئة الصحة في فهم احتياجات وتفضيلات التجمعات في جميع أنحاء المملكة.`,
    },
  },
  {
    id: 'clusters',
    en: {
      title: 'Clusters Directory',
      script: `Browse the directory of all twenty health clusters in Saudi Arabia. Each cluster has its own profile with key contacts. You can filter by region and connect with costing leads from other clusters. This directory helps you find colleagues, collaborate on shared initiatives, and learn from peers across the Kingdom.`,
    },
    ar: {
      title: 'دليل التجمعات الصحية',
      script: `تصفح دليل جميع التجمعات الصحية العشرين في المملكة العربية السعودية. لكل تجمع ملفه الخاص مع جهات الاتصال الرئيسية. يمكنك التصفية حسب المنطقة والتواصل مع مسؤولي التسعير من التجمعات الأخرى. يساعدك هذا الدليل في العثور على الزملاء والتعاون في المبادرات المشتركة والتعلم من الزملاء في جميع أنحاء المملكة.`,
    },
  },
  {
    id: 'admin',
    en: {
      title: 'Admin Panel',
      script: `The admin panel is where platform administrators manage the community. You can add new users with their email, password, cluster assignment and role. Edit user roles inline, or delete users when needed. Admins can also create and pin announcements, manage community polls, and view platform statistics. Only users with the admin role can access this area.`,
    },
    ar: {
      title: 'لوحة الإدارة',
      script: `لوحة الإدارة هي المكان الذي يدير فيه مسؤولو المنصة المجتمع. يمكنك إضافة مستخدمين جدد باستخدام بريدهم الإلكتروني وكلمة المرور وتعيين التجمع الصحي والدور. تعديل أدوار المستخدمين مباشرة أو حذف المستخدمين عند الحاجة. يمكن للمسؤولين أيضاً إنشاء الإعلانات وتثبيتها وإدارة استطلاعات الرأي وعرض إحصائيات المنصة. فقط المستخدمون الذين لديهم دور المسؤول يمكنهم الوصول إلى هذه المنطقة.`,
    },
  },
];

// ============================================
// GENERATE TTS AUDIO
// ============================================

async function generateTTS(text, outputFile, lang = 'en') {
  const voice = lang === 'ar' ? 'ar-SA-HamedNeural' : 'en-US-JennyNeural';
  console.log(`  🎤 Generating TTS (${lang})...`);
  execSync(
    `edge-tts --voice "${voice}" --text "${text.replace(/"/g, '\\"')}" --write-media "${outputFile}"`,
    { stdio: 'pipe' }
  );
}

// ============================================
// CREATE SLIDE IMAGE (using ffmpeg drawtext)
// ============================================

function createSlideVideo(title, subtitle, duration, outputFile) {
  // Escape single quotes for ffmpeg
  const safeTitle = title.replace(/'/g, "'\\\\\\\\\\\\''");
  const safeSubtitle = subtitle.replace(/'/g, "'\\\\\\\\\\\\''");

  const cmd = [
    'ffmpeg', '-y',
    '-f', 'lavfi',
    '-i', `color=c=0x1E3A5F:s=1280x720:d=${duration}`,
    '-vf',
    `drawtext=text='${safeTitle}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40:fontsize=40,` +
    `drawtext=text='${safeSubtitle}':fontsize=24:fontcolor=0x94A3B8:x=(w-text_w)/2:y=(h-text_h)/2+30:fontsize=22,` +
    `drawtext=text='HHC Clinical Costing Community':fontsize=18:fontcolor=0x60A5FA:x=(w-text_w)/2:y=h-60:fontsize=16`,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
    outputFile,
  ];

  execSync(cmd.join(' '), { stdio: 'pipe' });
}

// ============================================
// MAIN PIPELINE
// ============================================

async function main() {
  console.log('🎬 HHC Walkthrough Video Generator\n');

  for (const section of sections) {
    for (const lang of ['en', 'ar']) {
      const data = section[lang];
      const langLabel = lang === 'en' ? 'English' : 'Arabic';
      const voiceLang = lang === 'en' ? 'en' : 'ar';
      const voiceLabel = lang === 'en' ? 'JennyNeural' : 'HamedNeural';

      console.log(`📹 Section: ${section.id} — ${langLabel}`);

      const audioFile = join(outDir, `${section.id}-${lang}.mp3`);
      const slideFile = join(outDir, `${section.id}-${lang}-slide.mp4`);
      const outputFile = join(outDir, `${section.id}-${lang}.mp4`);

      // Step 1: Generate TTS
      try {
        await generateTTS(data.script, audioFile, voiceLang);
        console.log(`  ✅ Audio generated`);
      } catch (err) {
        console.log(`  ⚠️  TTS failed: ${err.message}. Skipping.`);
        continue;
      }

      // Step 2: Get audio duration
      let duration = 30; // fallback
      try {
        const probe = execSync(
          `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`,
          { encoding: 'utf-8' }
        );
        duration = Math.ceil(parseFloat(probe.trim())) + 2; // add 2 sec padding
      } catch {}

      // Step 3: Create slide background
      try {
        createSlideVideo(data.title, `HHC Clinical Costing Community`, duration, slideFile);
        console.log(`  ✅ Slide video created (${duration}s)`);
      } catch (err) {
        console.log(`  ⚠️  Slide creation failed: ${err.message}. Using blank.`);
        execSync(`ffmpeg -y -f lavfi -i "color=c=0x1E3A5F:s=1280x720:d=${duration}" -c:v libx264 -preset ultrafast -pix_fmt yuv420p "${slideFile}"`, { stdio: 'pipe' });
      }

      // Step 4: Combine video + audio
      try {
        execSync(
          `ffmpeg -y -i "${slideFile}" -i "${audioFile}" -c:v copy -c:a aac -shortest -movflags +faststart "${outputFile}"`,
          { stdio: 'pipe' }
        );
        console.log(`  ✅ Final video: ${outputFile}`);
      } catch (err) {
        console.log(`  ⚠️  Video combine failed: ${err.message}`);
      }

      // Cleanup temp files
      try { execSync(`rm "${audioFile}" "${slideFile}"`, { stdio: 'pipe' }); } catch {}
    }
  }

  console.log('\n✅ All videos generated!');
  console.log(`Output directory: ${outDir}`);
  console.log('\nFiles:');
  for (const section of sections) {
    for (const lang of ['en', 'ar']) {
      const file = join(outDir, `${section.id}-${lang}.mp4`);
      if (existsSync(file)) {
        console.log(`  ✅ ${section.id}-${lang}.mp4`);
      }
    }
  }
}

main().catch(console.error);