#!/usr/bin/env node
/**
 * Generate walkthrough videos for the How to Use page
 * Uses edge-tts for TTS and ffmpeg to compose MP4 videos
 *
 * Usage: node scripts/generate-walkthrough-videos.mjs
 */

import { execSync, spawnSync } from 'child_process';
import { mkdirSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'videos');
const tmpDir = join(__dirname, '..', 'public', 'videos', '.tmp');
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

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
      script: `مرحباً بك في مجتمع التسعير السريري التابع لصحة القابضة. دعني أريك المنصة. عند دخولك للمنصة لأول مرة، ستظهر لك لوحة التحكم. ستجد هنا المؤشرات الرئيسية بنظرة سريعة: إجمالي مواضيع النقاش والردود النشطة واستطلاعات الرأي والإعلانات. لوحة التحكم هي مركزك الرئيسي. يمكنك تصفح أحدث المناقشات والتصويت في استطلاعات الرأي مباشرة من هذه الصفحة.`,
    },
  },
  {
    id: 'announcements',
    en: {
      title: 'Announcements',
      script: `The announcements section is where Sehha Al-Qabidah publishes official communications. You'll find policy updates, training opportunities, and guidance documents here. Pinned items always appear at the top. Click any announcement to read the full details. Each one shows the category, author, and publication date.`,
    },
    ar: {
      title: 'الإعلانات والتوجيهات',
      script: `قسم الإعلانات هو المكان الذي تنشر فيه صحة القابضة الاتصالات الرسمية. ستجد هنا تحديثات السياسات والفرص التدريبية ووثائق التوجيه. تظهر العناصر المثبتة دائماً في الأعلى. انقر على أي إعلان لقراءة التفاصيل الكاملة. كل إعلان يعرض الفئة والمؤلف وتاريخ النشر.`,
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
      script: `Community polls let you share your insights and see what others think. You can view active polls on the dashboard. Simply click on an option to cast your vote. You'll see results update in real time with percentage bars. You can change your vote if you change your mind. Polls help the Health Holding Company understand the needs and preferences of clusters across the Kingdom.`,
    },
    ar: {
      title: 'استطلاعات الرأي',
      script: `تتيح لك استطلاعات الرأي مشاركة رؤاك ومعرفة آراء الآخرين. يمكنك عرض الاستطلاعات النشطة على لوحة التحكم. ما عليك سوى النقر على خيار للإدلاء بصوتك. ستشاهد النتائج تحدث في الوقت الفعلي مع أشرطة النسبة المئوية. يمكنك تغيير صوتك إذا غيرت رأيك. تساعد الاستطلاعات صحة القابضة في فهم احتياجات وتفضيلات التجمعات في جميع أنحاء المملكة.`,
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
  // Write text to temp file to avoid shell escaping issues
  const textFile = join(tmpDir, 'tts-input.txt');
  writeFileSync(textFile, text, 'utf-8');

  const voice = lang === 'ar' ? 'ar-SA-HamedNeural' : 'en-US-JennyNeural';
  // Use --file to read text from file instead of command line
  const result = spawnSync(
    'edge-tts',
    ['--voice', voice, '--file', textFile, '--write-media', outputFile],
    { stdio: 'pipe', timeout: 60000 }
  );

  unlinkSync(textFile);

  if (result.error || result.status !== 0) {
    throw new Error(`TTS failed: ${result.stderr?.toString() || result.error?.message}`);
  }
}

// ============================================
// CREATE SLIDE VIDEO WITH ffmpeg (using textfile for drawtext)
// ============================================

function createSlideVideo(titleEn, titleAr, subtitle, duration, outputFile) {
  // Write drawtext content to a file to avoid shell escaping issues
  const drawTextFile = join(tmpDir, 'drawtext.txt');
  const fullText = `${titleEn}\n${subtitle}`;
  writeFileSync(drawTextFile, fullText, 'utf-8');

  // Use ffmpeg with drawtext reading from file
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=0x1E3A5F:s=1280x720:d=${duration}`,
    '-vf',
    `drawtext=textfile='${drawTextFile}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:line_spacing=10`,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
    outputFile,
  ];

  const result = spawnSync('ffmpeg', args, { stdio: 'pipe', timeout: 30000 });
  unlinkSync(drawTextFile);

  if (result.error || result.status !== 0) {
    const err = result.stderr?.toString() || result.error?.message || '';
    // Fallback: just create blank video
    if (err.includes('drawtext') || err.includes('fonts')) {
      console.log(`     (drawtext not supported, using blank background)`);
      execSync(
        `ffmpeg -y -f lavfi -i "color=c=0x1E3A5F:s=1280x720:d=${duration}" -c:v libx264 -preset ultrafast -pix_fmt yuv420p "${outputFile}"`,
        { stdio: 'pipe' }
      );
      return;
    }
    throw new Error(err.slice(0, 200));
  }
}

// ============================================
// MAIN PIPELINE
// ============================================

async function main() {
  console.log('🎬 HHC Walkthrough Video Generator\n');

  for (const section of sections) {
    for (const lang of ['en', 'ar']) {
      const data = section[lang];
      const otherData = section[lang === 'en' ? 'ar' : 'en'];
      const langLabel = lang === 'en' ? 'English' : 'Arabic';

      console.log(`📹 Section: ${section.id} — ${langLabel}`);

      const audioFile = join(tmpDir, `${section.id}-${lang}.mp3`);
      const slideFile = join(tmpDir, `${section.id}-${lang}-slide.mp4`);
      const outputFile = join(outDir, `${section.id}-${lang}.mp4`);

      // Step 1: Generate TTS
      try {
        await generateTTS(data.script, audioFile, lang === 'ar' ? 'ar' : 'en');
        console.log(`  ✅ Audio generated`);
      } catch (err) {
        console.log(`  ❌ TTS failed: ${err.message}`);
        continue;
      }

      // Step 2: Get audio duration
      let duration = 30;
      try {
        const probe = execSync(
          `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`,
          { encoding: 'utf-8' }
        );
        duration = Math.ceil(parseFloat(probe.trim())) + 2;
      } catch {
        console.log(`  ⚠️  Could not probe duration, using 30s`);
      }

      // Step 3: Create slide video with text overlay
      try {
        createSlideVideo(
          data.title,
          otherData.title,
          lang === 'en' ? 'Health Holding Company | صحة القابضة' : 'صحة القابضة | Health Holding Company',
          duration,
          slideFile
        );
        console.log(`  ✅ Slide video created (${duration}s)`);
      } catch (err) {
        console.log(`  ⚠️  Slide failed: ${err.message?.slice(0, 80)}`);
        execSync(
          `ffmpeg -y -f lavfi -i "color=c=0x1E3A5F:s=1280x720:d=${duration}" -c:v libx264 -preset ultrafast -pix_fmt yuv420p "${slideFile}"`,
          { stdio: 'pipe' }
        );
      }

      // Step 4: Combine video + audio
      try {
        execSync(
          `ffmpeg -y -i "${slideFile}" -i "${audioFile}" -c:v copy -c:a aac -shortest -movflags +faststart "${outputFile}"`,
          { stdio: 'pipe' }
        );
        console.log(`  ✅ Final video: ${outputFile}`);
      } catch (err) {
        console.log(`  ❌ Combine failed: ${err.message?.slice(0, 100)}`);
      }

      // Cleanup temp files
      try { unlinkSync(audioFile); } catch {}
      try { unlinkSync(slideFile); } catch {}
    }
  }

  console.log('\n✅ All videos generated!');
  console.log(`Output directory: ${outDir}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});