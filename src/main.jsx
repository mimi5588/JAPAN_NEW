import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Clock, ExternalLink, MapPin, Ticket, Train, WalletCards } from 'lucide-react';
import './styles.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

const cityNames = {
  Tokyo: 'טוקיו',
  Kyoto: 'קיוטו',
  Osaka: 'אוסקה',
  Hakone: 'האקונה',
  Nara: 'נארה',
  Himeji: 'הימג׳י'
};

const places = [
  { id:'sensoji', city:'Tokyo', name:'מקדש סנסו־ג׳י ורובע אסאקוסה', lat:35.7148, lng:139.7967, price:'חינם', booking:'לא צריך', time:'1.5–2.5 שעות', note:'לשלב עם רחוב נאקמיסה, פארק סומידה ושיטוט לכיוון הנהר.' },
  { id:'skytree', city:'Tokyo', name:'טוקיו סקייטרי + סולמאצ׳י', lat:35.7101, lng:139.8107, price:'בערך ¥2,100–¥3,400+ לפי קומבינציה/שעה', booking:'מומלץ להזמין מראש, במיוחד ערב/סופ״ש', time:'2–3 שעות', note:'בערב יש תאורה יפה; ליד: מרכז הקניות סולמאצ׳י ואקווריום סומידה.' },
  { id:'meiji', city:'Tokyo', name:'מקדש מייג׳י', lat:35.6764, lng:139.6993, price:'חינם', booking:'לא צריך', time:'1–1.5 שעות', note:'לשלב עם פארק יויוגי, רחוב טקשיטה ואומוטסנדו.' },
  { id:'harajuku', city:'Tokyo', name:'הרג׳וקו ואומוטסנדו', lat:35.6717, lng:139.7064, price:'חינם', booking:'לא צריך', time:'2–3 שעות', note:'אזור שלם לקניות, קרפים, בתי קפה וחנויות עיצוב.' },
  { id:'shibuya', city:'Tokyo', name:'מעבר שיבויה + האצ׳יקו', lat:35.6595, lng:139.7005, price:'חינם', booking:'לא צריך', time:'1 שעה', note:'שווה להגיע לפני שיבויה סקיי ולתת זמן לשוטט.' },
  { id:'shibuyasky', city:'Tokyo', name:'שיבויה סקיי בשקיעה', lat:35.6585, lng:139.7020, price:'מבוגר אונליין: כ־¥2,700 עד 14:59 / כ־¥3,400 מ־15:00', booking:'כן — להזמין מראש; שקיעה נחטפת מהר', time:'1.5–2 שעות', note:'לכוון כניסה 60–90 דקות לפני השקיעה.' },
  { id:'tsukiji', city:'Tokyo', name:'שוק צוקיג׳י החיצוני', lat:35.6655, lng:139.7707, price:'חינם; אוכל בתשלום', booking:'לא צריך', time:'1.5–2 שעות', note:'הכי טוב בבוקר. ליד: גני האמאריקיו.' },
  { id:'ginza', city:'Tokyo', name:'גינזה', lat:35.6719, lng:139.7650, price:'חינם', booking:'לא צריך', time:'1.5–2.5 שעות', note:'קניות, איטויה, יוניקלו ענק ובתי קפה.' },
  { id:'pokemon', city:'Tokyo', name:'פוקימון קפה טוקיו', lat:35.6811, lng:139.7740, price:'אין דמי כניסה; משלמים על אוכל/מרצ׳', booking:'חובה להזמין אונליין; זמינות משתנה לפי הודעות האתר', time:'1.5 שעות', note:'נמצא בניהונבאשי טקאשימאיה, קרוב לתחנת טוקיו.' },
  { id:'akihabara', city:'Tokyo', name:'אקיהברה', lat:35.6984, lng:139.7730, price:'חינם', booking:'לא צריך', time:'2–3 שעות', note:'אנימה, גיימינג ואלקטרוניקה. ליד: מקדש קאנדה מיוג׳ין.' },
  { id:'memorylane', city:'Tokyo', name:'אומואידה יוקוצ׳ו – סמטת הזיכרונות', lat:35.6938, lng:139.6990, price:'חינם; אוכל בתשלום', booking:'לא צריך', time:'1–1.5 שעות', note:'ערב בשינג׳וקו. קרוב גם לגולדן גאי.' },
  { id:'teamlab', city:'Tokyo', name:'טימלאב בורדרלס – אזאבודאי הילס', lat:35.6602, lng:139.7409, price:'מבוגר החל מכ־¥3,600–¥3,800; מחיר דינמי', booking:'כן — מומלץ אונליין לשעה מוגדרת', time:'2–3 שעות', note:'ליד: אזאבודאי הילס, מקדש זוג׳וג׳י ומגדל טוקיו.' },
  { id:'odaiba', city:'Tokyo', name:'אודייבה', lat:35.6266, lng:139.7755, price:'חינם; אטרקציות בתשלום', booking:'לאזור לא צריך', time:'2–4 שעות', note:'גשר ריינבו, פסל הגאנדאם וטיילת מפרץ טוקיו.' },
  { id:'tokyotower', city:'Tokyo', name:'מגדל טוקיו + מקדש זוג׳וג׳י', lat:35.6586, lng:139.7454, price:'Main Deck לרוב סביב ¥1,500+', booking:'מומלץ מראש אם רוצים שעה מדויקת', time:'1.5–2 שעות', note:'זוג׳וג׳י חינמי ונמצא ממש ליד — שילוב מצוין לצילום ערב.' },
  { id:'ghibli', city:'Tokyo', name:'מוזיאון גיבלי, מיטקה', lat:35.6962, lng:139.5704, price:'מבוגר ¥1,000', booking:'חובה מראש בלבד; אין מכירה במקום', time:'2–3 שעות', note:'לשלב עם פארק אינוקאשירה וקיצ׳יג׳וג׳י.' },
  { id:'nezu', city:'Tokyo', name:'מקדש נזו + יאנאקה', lat:35.7202, lng:139.7609, price:'המקדש חינם; גן האזליות בפסטיבל סביב ¥500', booking:'לא צריך בדרך כלל', time:'2–3 שעות', note:'פסטיבל האזליות לרוב באפריל; בנסיעה במאי כנראה אחרי השיא. לשלב עם יאנאקה גינזה.' },
  { id:'gotokuji', city:'Tokyo', name:'מקדש גוטוקוג׳י, סטגאיה', lat:35.6470, lng:139.6470, price:'חינם', booking:'לא צריך', time:'1–1.5 שעות', note:'מקדש חתולי המזל. ליד: סטגאיה האצ׳ימאנגו ושימוקיטזאווה בהמשך.' },
  { id:'donki-shibuya', city:'Tokyo', name:'MEGA דון קיחוטה שיבויה', lat:35.6607, lng:139.6978, price:'כניסה חינם; קניות בתשלום', booking:'לא צריך', time:'1–2 שעות', note:'כלבו ענק לקוסמטיקה, חטיפים, מזכרות ודברים יפניים מוזרים וטובים. הכי נוח לשלב ביום שיבויה אחרי שיבויה סקיי או לפני.' },
  { id:'tokyo-shopping', city:'Tokyo', name:'מרכזי קניות בטוקיו: שיבויה/גינזה/איקבוקורו', lat:35.6712, lng:139.7649, price:'חינם; קניות בתשלום', booking:'לא צריך', time:'2–4 שעות', note:'גינזה סיקס, טוקיו מידטאון, שיבויה פארקו, שיבויה 109, לאבינה/לומינה בתחנות הגדולות.' },
  { id:'hakoneashi', city:'Hakone', name:'אגם אשי + מקדש האקונה', lat:35.2048, lng:139.0255, price:'המקדש חינם; שייט/רכבלים בתשלום', booking:'מומלץ כרטיס תחבורה Hakone Freepass', time:'3–4 שעות', note:'אם מזג האוויר טוב אולי תראו את פוג׳י.' },
  { id:'hakoneopen', city:'Hakone', name:'המוזיאון הפתוח בהאקונה', lat:35.2447, lng:139.0508, price:'מבוגר סביב ¥2,000; אונליין לעיתים ¥1,800', booking:'מומלץ אונליין לחיסכון זמן/כסף', time:'1.5–3 שעות', note:'פתוח לרוב 9:00–17:00, כניסה אחרונה 16:30.' },
  { id:'kiyomizu', city:'Kyoto', name:'קיומיזו־דרה + סאננזקה', lat:34.9949, lng:135.7850, price:'קיומיזו־דרה סביב ¥500', booking:'לא צריך', time:'3–4 שעות', note:'לשלב עם ניננזקה, סאננזקה ופגודת יאסאקה.' },
  { id:'yasaka', city:'Kyoto', name:'מקדש יאסאקה, גיון ופונטוצ׳ו', lat:35.0036, lng:135.7786, price:'חינם', booking:'לא צריך', time:'3–4 שעות', note:'אזור הערב הכי יפה בקיוטו.' },
  { id:'arashiyama', city:'Kyoto', name:'יער הבמבוק, יער הקימונו ונהר קאטסורה', lat:35.0172, lng:135.6720, price:'רוב האזור חינם; מקדשים בתשלום', booking:'לא צריך', time:'4–6 שעות', note:'להגיע מוקדם. ליד: טנריו־ג׳י, גשר טוגצוקיו וקפה % ערביקה.' },
  { id:'fushimi', city:'Kyoto', name:'פושימי אינארי', lat:34.9671, lng:135.7727, price:'חינם', booking:'לא צריך', time:'2–3 שעות', note:'עדיף מוקדם בבוקר לפני נארה.' },
  { id:'nara', city:'Nara', name:'פארק נארה ומקדש טודאי־ג׳י', lat:34.6889, lng:135.8398, price:'פארק חינם; טודאי־ג׳י סביב ¥800', booking:'לא צריך', time:'4–5 שעות', note:'איילים, פסל הבודהה הגדול וקאסוגה טאישה אם נשאר זמן.' },
  { id:'kinkakuji', city:'Kyoto', name:'מקדש הזהב – קינקאקו־ג׳י', lat:35.0394, lng:135.7292, price:'סביב ¥500', booking:'לא צריך', time:'1–1.5 שעות', note:'לפתוח איתו את יום צפון קיוטו.' },
  { id:'ryoanji', city:'Kyoto', name:'ריוואן־ג׳י', lat:35.0345, lng:135.7183, price:'סביב ¥600', booking:'לא צריך', time:'1 שעה', note:'גן הזן המפורסם, קרוב למקדש הזהב.' },
  { id:'nijo', city:'Kyoto', name:'טירת ניג׳ו', lat:35.0142, lng:135.7480, price:'סביב ¥1,300', booking:'מומלץ לבדוק שעות; לא חובה לרוב', time:'1.5–2 שעות', note:'אחד המקומות ההיסטוריים החשובים בקיוטו.' },
  { id:'nishiki', city:'Kyoto', name:'שוק נישיקי', lat:35.0050, lng:135.7647, price:'חינם; אוכל בתשלום', booking:'לא צריך', time:'1.5–2 שעות', note:'מעולה לסיום יום צפון קיוטו.' },
  { id:'kyoto-station', city:'Kyoto', name:'תחנת קיוטו + Porta / Isetan', lat:34.9858, lng:135.7588, price:'חינם; קניות בתשלום', booking:'לא צריך', time:'1–2 שעות', note:'מרכז קניות נוח ליום מעבר: איסטן, פורטה, קיוטו טאוור וחנויות מזכרות.' },
  { id:'tsutenkaku', city:'Osaka', name:'מגדל צוטנקאקו ושינסקאי', lat:34.6525, lng:135.5063, price:'תצפית סביב ¥1,000+', booking:'לא חובה', time:'2 שעות', note:'אזור רטרו, קושיקאצו וסמטת ג׳אנג׳אן יוקוצ׳ו.' },
  { id:'kuromon', city:'Osaka', name:'שוק קורומון', lat:34.6646, lng:135.5063, price:'חינם; אוכל בתשלום', booking:'לא צריך', time:'1.5–2 שעות', note:'לשלב עם נאמבה ודוטונבורי.' },
  { id:'dotonbori', city:'Osaka', name:'שינסהיבאשי ודוטונבורי', lat:34.6687, lng:135.5010, price:'חינם', booking:'לא צריך', time:'3–4 שעות', note:'שלט גליקו, אוכל רחוב וסמטת הוזנג׳י יוקוצ׳ו.' },
  { id:'donki-dotonbori', city:'Osaka', name:'דון קיחוטה דוטונבורי', lat:34.6691, lng:135.5031, price:'כניסה חינם; קניות בתשלום', booking:'לא צריך', time:'1–2 שעות', note:'אחד הסניפים הכי מפורסמים, ממש ליד התעלה. לשלב בערב אוסקה עם דוטונבורי.' },
  { id:'namba-parks', city:'Osaka', name:'נאמבה פארקס / שינסהיבאשי סוז׳י', lat:34.6617, lng:135.5016, price:'חינם; קניות בתשלום', booking:'לא צריך', time:'2–3 שעות', note:'מרכזי קניות גדולים ונוחים סביב נאמבה, כולל רחוב קניות מקורה ארוך.' },
  { id:'shitennoji', city:'Osaka', name:'מקדש שיטנו־ג׳י', lat:34.6539, lng:135.5169, price:'חלקים חינם; גנים/אולמות סביב ¥300–¥500', booking:'לא צריך', time:'1–1.5 שעות', note:'אחד המקדשים העתיקים ביפן.' },
  { id:'osakacastle', city:'Osaka', name:'טירת אוסקה', lat:34.6873, lng:135.5262, price:'מוזיאון הטירה סביב ¥600', booking:'לא חובה', time:'2–3 שעות', note:'לשלב עם פארק הטירה.' },
  { id:'kaiyukan', city:'Osaka', name:'אקווריום קאיוקאן', lat:34.6545, lng:135.4289, price:'מבוגר סביב ¥2,700; בימים עמוסים ייתכן ¥3,200–¥3,500', booking:'מומלץ להזמין מראש', time:'2–3 שעות', note:'ליד: טמפוזאן מרקטפלייס וגלגל ענק.' },
  { id:'umeda', city:'Osaka', name:'אומדה סקיי בילדינג', lat:34.7053, lng:135.4906, price:'Floating Garden סביב ¥2,000', booking:'מומלץ בערב/שקיעה', time:'1.5–2 שעות', note:'סיום ערב יפה מעל העיר.' },
  { id:'himeji', city:'Himeji', name:'טירת הימג׳י', lat:34.8394, lng:134.6939, price:'טירה ¥1,000; טירה+קוקואן ¥1,050', booking:'לא חובה', time:'2–3 שעות', note:'אחת הטירות המרשימות והשמורות ביפן.' },
  { id:'kokoen', city:'Himeji', name:'גני קוקואן', lat:34.8391, lng:134.6898, price:'¥310 לבד או קומבו עם הטירה', booking:'לא צריך', time:'1 שעה', note:'ממש ליד הטירה — לא לדלג אם כבר שם.' }
];

const itinerary = [
  { day:1, date:'4.5', city:'טיסה', area:'ישראל → יפן', stay:'לילה בטיסה', items:['המראה 19:45 בערב', 'להכין הזמנות מודפסות/אופליין: גיבלי, פוקימון, שיבויה סקיי, מלונות'] },
  { day:2, date:'5.5', city:'טוקיו', area:'נחיתה והתאקלמות', stay:'טוקיו · לילה 1 מתוך 5', items:['נחיתה ומעבר למלון', 'ערב קל בשינג׳וקו: אומואידה יוקוצ׳ו / גולדן גאי אם יש כוח'] },
  { day:3, date:'6.5', city:'טוקיו', area:'אסאקוסה וסומידה', stay:'טוקיו', items:['מקדש סנסו־ג׳י ורובע אסאקוסה', 'רחוב נאקמיסה ופארק סומידה', 'טוקיו סקייטרי + סולמאצ׳י', 'מופעים/תאורה בערב באזור סקייטרי'] },
  { day:4, date:'7.5', city:'טוקיו', area:'הרג׳וקו ושיבויה', stay:'טוקיו', items:['מקדש מייג׳י ופארק יויוגי', 'הרג׳וקו: טקשיטה + אומוטסנדו', 'מעבר החצייה בשיבויה והאצ׳יקו', 'שיבויה סקיי בשקיעה — להזמין מראש'] },
  { day:5, date:'8.5', city:'טוקיו', area:'מרכז העיר', stay:'טוקיו', items:['שוק צוקיג׳י בבוקר', 'גינזה ותחנת טוקיו/ניהונבאשי', 'פוקימון קפה טוקיו — להזמין מראש', 'אקיהברה', 'סמטת הזיכרונות בערב אם לא עשיתם ביום הנחיתה'] },
  { day:6, date:'9.5', city:'טוקיו', area:'אודייבה ומינאטו', stay:'טוקיו', items:['טימלאב בורדרלס באזאבודאי הילס', 'מקדש זוג׳וג׳י ליד מגדל טוקיו', 'מגדל טוקיו לקראת ערב', 'אודייבה: טיילת, גאנדאם, גשר ריינבו'] },
  { day:7, date:'10.5', city:'האקונה', area:'טיול יום מטוקיו', stay:'טוקיו', items:['נסיעה מוקדמת להאקונה', 'המוזיאון הפתוח', 'אגם אשי ומקדש האקונה', 'חזרה לטוקיו בערב'] },
  { day:8, date:'11.5', city:'קיוטו', area:'מזרח קיוטו', stay:'קיוטו · לילה 1 מתוך 4', items:['שינקנסן מטוקיו לקיוטו', 'קיומיזו־דרה', 'סאננזקה/ניננזקה', 'מקדש יאסאקה, גיון ופונטוצ׳ו בערב'] },
  { day:9, date:'12.5', city:'קיוטו', area:'אראשיאמה', stay:'קיוטו', items:['יער הבמבוק מוקדם', 'יער הקימונו בתחנת ראנדן אראשיאמה', 'נהר קאטסורה וגשר טוגצוקיו', 'אופציה: טנריו־ג׳י / פארק הקופים'] },
  { day:10, date:'13.5', city:'קיוטו + נארה', area:'פושימי ונארה', stay:'קיוטו', items:['פושימי אינארי מוקדם', 'רכבת לנארה', 'פארק נארה', 'מקדש טודאי־ג׳י', 'חזרה לקיוטו'] },
  { day:11, date:'14.5', city:'קיוטו', area:'צפון קיוטו', stay:'קיוטו', items:['מקדש הזהב קינקאקו־ג׳י', 'ריוואן־ג׳י', 'טירת ניג׳ו', 'שוק נישיקי לקראת ערב'] },
  { day:12, date:'15.5', city:'אוסקה', area:'שינסקאי ונאמבה', stay:'אוסקה · לילה 1', items:['מעבר מקיוטו לאוסקה', 'מגדל צוטנקאקו ושינסקאי', 'שוק קורומון', 'שינסהיבאשי ודוטונבורי בערב'] },
  { day:13, date:'16.5', city:'אוסקה → טוקיו → נריטה', area:'בוקר אוסקה וחזרה', stay:'טיסה', items:['אם יש זמן קצר: שיטנו־ג׳י או טירת אוסקה בלבד', 'חלופה אם נשארים עוד יום: קאיוקאן + אומדה סקיי', 'שינקנסן לטוקיו ומשם Narita Express', 'להגיע לנריטה סביב 16:55 לטיסה ב־19:55'] }
];

const extras = [
  { city:'טוקיו', title:'יום בונוס/החלפה', text:'מוזיאון גיבלי + פארק אינוקאשירה + קיצ׳יג׳וג׳י, מקדש נזו + יאנאקה גינזה, גוטוקוג׳י + שימוקיטזאווה. אלו לא נכנסים בנוחות אם מתעקשים גם על האקונה בתוך 5 ימי טוקיו, אז שמתי אותם במפה כנקודות להחלפה.' },
  { city:'אוסקה', title:'אם מוסיפים עוד יום מלא', text:'שיטנו־ג׳י → טירת אוסקה → קאיוקאן/טמפוזאן → אומדה סקיי בערב. יום הימג׳י: טירת הימג׳י + גני קוקואן, ועדיף לא לשלב בו את סנסו־ג׳י כי הוא בטוקיו.' },
  { city:'קיוטו', title:'קצב מומלץ', text:'4 ימים בקיוטו זה מצוין. פושימי+נארה באותו יום עובד, אבל להתחיל מוקדם כדי לא להיתקע בעומס.' }
];

const transfers = [
  { from:'נריטה', to:'מרכז טוקיו', route:'Narita Express או Keisei Skyliner', time:'כ־50–75 דקות', note:'ביום הנחיתה לבחור לפי אזור המלון: Ueno/Asakusa נוח עם Keisei; Shinjuku/Shibuya/Tokyo Station נוח עם Narita Express.' },
  { from:'טוקיו', to:'האקונה', route:'רכבת Odakyu Romancecar משינג׳וקו או שינקנסן לאודווארה + רכבת מקומית', time:'כ־85–120 דקות לכל כיוון', note:'לטיול יום כדאי לצאת מוקדם ולשקול Hakone Freepass.' },
  { from:'טוקיו', to:'קיוטו', route:'שינקנסן Tokaido', time:'כ־2:15–2:40 שעות', note:'להזמין מקומות מראש סביב Golden Week/סופי שבוע; לשבת בצד ימין מטוקיו לקיוטו אם רוצים סיכוי לפוג׳י.' },
  { from:'קיוטו', to:'נארה', route:'JR Nara Line או Kintetsu', time:'כ־35–55 דקות', note:'Kintetsu קרובה יותר לפארק נארה; JR נוחה אם יש פאס מתאים.' },
  { from:'קיוטו', to:'אוסקה', route:'JR / Hankyu / Keihan לפי אזור הלינה', time:'כ־15–45 דקות', note:'ל־Namba לרוב נוח להגיע דרך Osaka/Umeda או ברכבות פרטיות, תלוי במלון.' },
  { from:'אוסקה', to:'הימג׳י', route:'שינקנסן מ־Shin-Osaka או JR Special Rapid', time:'כ־30 דקות בשינקנסן / כ־60 דקות ב־JR', note:'הטירה במרחק הליכה/אוטובוס קצר מתחנת Himeji.' },
  { from:'אוסקה', to:'טוקיו', route:'שינקנסן Tokaido', time:'כ־2:30–3:00 שעות', note:'ביום הטיסה להשאיר מרווח גדול ולהגיע לנריטה סביב 16:55 לטיסה ב־19:55.' },
  { from:'טוקיו', to:'נריטה', route:'Narita Express / Keisei Skyliner', time:'כ־40–75 דקות', note:'לבדוק טרמינל ולצאת מהעיר סביב 15:30–16:00 ביום החזרה.' }
];

function googleMapsUrl(place){ return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`; }
function osmEmbed(place){ return `https://www.openstreetmap.org/export/embed.html?bbox=${place.lng-0.018}%2C${place.lat-0.012}%2C${place.lng+0.018}%2C${place.lat+0.012}&layer=mapnik&marker=${place.lat}%2C${place.lng}`; }

function getMapPosition(place, visiblePlaces) {
  const lats = visiblePlaces.map(p => p.lat);
  const lngs = visiblePlaces.map(p => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const x = maxLng === minLng ? 50 : ((place.lng - minLng) / (maxLng - minLng)) * 82 + 9;
  const y = maxLat === minLat ? 50 : ((maxLat - place.lat) / (maxLat - minLat)) * 74 + 13;
  return { left: `${x}%`, top: `${y}%` };
}

function App(){
  const [selectedId, setSelectedId] = useState('shibuyasky');
  const [filter, setFilter] = useState('הכל');
  const selected = places.find(p => p.id === selectedId) ?? places[0];
  const filtered = useMemo(() => filter === 'הכל' ? places : places.filter(p => p.city === filter), [filter]);
  const cities = ['הכל', ...Array.from(new Set(places.map(p => p.city)))];

  return <main>
    <nav className="topbar" aria-label="ניווט מהיר">
      <a href="#map">מפה</a>
      <a href="#route">מסלול</a>
      <a href="#transfers">הגעה</a>
      <a href="#shopping">קניות</a>
    </nav>

    <section className="hero">
      <div>
        <p className="eyebrow">קוניצ׳יווה, יפן מחכה לכן</p>
        <h1>מסלול יפן אינטראקטיבי עם מפה, מחירים והזמנות מראש</h1>
        <p className="lead">טוקיו, האקונה, קיוטו, נארה ואוסקה — עם כל המקומות שביקשת, כולל שכונות ומקומות קרובים ששווה להוסיף כשכבר נמצאים באזור.</p>
        <div className="heroActions">
          <a className="primaryAction" href="#map">לפתוח את המפה</a>
          <a className="secondaryAction" href="#route">לראות את הימים</a>
        </div>
      </div>
      <div className="heroCard">
        <strong>4.5–16.5 · 12 ימים</strong>
        <span><CalendarDays size={18}/> 5 לילות טוקיו</span>
        <span><Train size={18}/> 4 לילות קיוטו</span>
        <span><MapPin size={18}/> אוסקה קצרה + חלופות</span>
      </div>
    </section>

    <section className="notice">
      <b>הערת תכנון חשובה:</b> כדי להכניס 5 ימי טוקיו + 4 ימי קיוטו + אוסקה בתוך חלון הטיסות, אוסקה יוצאת צפופה. לכן הוספתי באתר גם “חלופות/אם מוסיפים יום” עבור קאיוקאן, אומדה סקיי והימג׳י.
    </section>

    <section className="layout">
      <aside className="itinerary" id="route">
        <h2>המסלול לפי ימים</h2>
        {itinerary.map(day => <article className="day" key={day.day}>
          <div className="dayTop"><span>יום {day.day}</span><strong>{day.date}</strong></div>
          <h3>{day.city}</h3>
          <p>{day.area} · {day.stay}</p>
          <ul>{day.items.map((item,i)=><li key={i}>{item}</li>)}</ul>
        </article>)}
      </aside>

      <section className="mapPanel" id="map">
        <div className="toolbar">
          <h2>מפת המקומות</h2>
          <select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="סינון עיר">
            {cities.map(c => <option key={c} value={c}>{c === 'הכל' ? c : cityNames[c]}</option>)}
          </select>
        </div>

        <div className="mapWrap">
          <iframe className="map" title={`מפה: ${selected.name}`} src={osmEmbed(selected)} loading="lazy"></iframe>
          <div className="pinLayer" aria-label="נקודות לחיצות על המפה">
            {filtered.map((place, index) => (
              <button
                key={place.id}
                className={`pin ${place.id === selected.id ? 'activePin' : ''}`}
                style={getMapPosition(place, filtered)}
                onClick={() => setSelectedId(place.id)}
                title={place.name}
                aria-label={`פתיחת ${place.name}`}
              >
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="selectedCard">
          <p className="city">{cityNames[selected.city]}</p>
          <h3>{selected.name}</h3>
          <div className="facts">
            <span><WalletCards size={16}/> {selected.price}</span>
            <span><Ticket size={16}/> {selected.booking}</span>
            <span><Clock size={16}/> {selected.time}</span>
          </div>
          <p>{selected.note}</p>
          <a href={googleMapsUrl(selected)} target="_blank" rel="noreferrer">פתיחה בגוגל מפות <ExternalLink size={14}/></a>
        </div>
        <div className="places">
          {filtered.map((place, index) => <button key={place.id} onClick={()=>setSelectedId(place.id)} className={place.id===selected.id ? 'active' : ''}>
            <span>{index + 1} · {cityNames[place.city]}</span>{place.name}
          </button>)}
        </div>
      </section>
    </section>

    <section className="extras" id="shopping">
      <h2>תוספות חכמות ליד המקומות שביקשת</h2>
      <div className="extraGrid">
        {extras.map(e => <article key={e.title}><p>{e.city}</p><h3>{e.title}</h3><span>{e.text}</span></article>)}
      </div>
    </section>

    <section className="transfers" id="transfers">
      <h2>דרכי הגעה וזמני נסיעה בין האזורים</h2>
      <div className="transferGrid">
        {transfers.map((t, i) => <article key={i}>
          <div className="routeTitle"><strong>{t.from}</strong><span>←</span><strong>{t.to}</strong></div>
          <p>{t.route}</p>
          <b>{t.time}</b>
          <small>{t.note}</small>
        </article>)}
      </div>
    </section>

    <footer>
      המחירים באתר הם מחירי תכנון עדכניים/מקובלים ביין ונועדו לבניית תקציב. לפני רכישה בפועל כדאי לאמת באתר הרשמי, במיוחד באטרקציות עם מחיר דינמי או הזמנה מוגבלת.
    </footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App />);
