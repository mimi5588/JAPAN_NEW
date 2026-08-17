import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Clock, ExternalLink, MapPin, Ticket, Train, WalletCards } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  { day:1, date:'4.5', city:'טיסה', area:'ישראל → יפן', stay:'לילה בטיסה', summary:'יום מעבר רגוע: מתארגנים, מוודאים שכל ההזמנות שמורות בטלפון ומתחילים להיכנס למוד יפן.', items:['✈️ המראה 19:45 בערב', '🎟️ להכין הזמנות אופליין: גיבלי, פוקימון, שיבויה סקיי, מלונות', '🧳 לוודא מטען נייד, מתאם חשמל וכרטיסי תחבורה/אינטרנט'] },
  { day:2, date:'5.5', city:'טוקיו', area:'נחיתה והתאקלמות', stay:'טוקיו · לילה 1 מתוך 5', summary:'יום קליל בלי עומס: להגיע למלון, להכיר את האזור, ולאכול משהו ראשון בשינג׳וקו בלי לרוץ יותר מדי.', items:['🚆 נחיתה ומעבר למלון בשינג׳וקו', '🍜 ארוחת ערב קלה באזור המלון', '🍢 אומואידה יוקוצ׳ו / גולדן גאי אם נשאר כוח', '🛒 קונביני ראשון: 7‑Eleven / FamilyMart / Lawson ליד המלון'] },
  { day:3, date:'6.5', city:'טוקיו', area:'אסאקוסה וסומידה', stay:'טוקיו', summary:'יום טוקיו קלאסי: מקדש מסורתי, רחוב אוכל ומזכרות, ואז תצפית מודרנית מסקייטרי לקראת ערב.', items:['⛩️ מקדש סנסו־ג׳י ורובע אסאקוסה', '🛍️ רחוב נאקמיסה למזכרות וחטיפים', '🌿 פארק סומידה ושיטוט ליד הנהר', '🗼 טוקיו סקייטרי + סולמאצ׳י', '✨ תאורה/מופעים בערב באזור סקייטרי'] },
  { day:4, date:'7.5', city:'טוקיו', area:'הרג׳וקו ושיבויה', stay:'טוקיו', summary:'יום של טבע עירוני, אופנה וקצב צעיר — מסתיים בשקיעה הכי יפה מעל שיבויה.', items:['⛩️ מקדש מייג׳י', '🌿 פארק יויוגי', '🛍️ הרג׳וקו: טקשיטה + אומוטסנדו', '📍 מעבר החצייה בשיבויה והאצ׳יקו', '🗼 שיבויה סקיי בשקיעה — להזמין מראש', '🛒 MEGA Don Quijote Shibuya לקניות ערב'] },
  { day:5, date:'8.5', city:'טוקיו', area:'מרכז העיר', stay:'טוקיו', summary:'יום עירוני עם אוכל, קניות, פוקימון ואקיהברה — הרבה נקודות קרובות יחסית ונוחות לתחבורה.', items:['🍣 שוק צוקיג׳י בבוקר', '🛍️ גינזה ותחנת טוקיו/ניהונבאשי', '🍽️ פוקימון קפה טוקיו — להזמין מראש', '🎮 אקיהברה לאנימה וגיימינג', '🍢 סמטת הזיכרונות בערב אם לא עשיתם ביום הנחיתה'] },
  { day:6, date:'9.5', city:'טוקיו', area:'אודייבה ומינאטו', stay:'טוקיו', summary:'יום של אמנות דיגיטלית, מגדל טוקיו וקו המים של העיר. טוב לצילומים ולערב יפה.', items:['🎨 טימלאב בורדרלס באזאבודאי הילס', '⛩️ מקדש זוג׳וג׳י ליד מגדל טוקיו', '🗼 מגדל טוקיו לקראת ערב', '🌉 אודייבה: טיילת, גאנדאם, גשר ריינבו', '☕ קפה/קינוח באזאבודאי או אודייבה'] },
  { day:7, date:'10.5', city:'האקונה', area:'טיול יום מטוקיו', stay:'טוקיו', summary:'יום טבע מחוץ לעיר: אמנות פתוחה, אגם, מקדש ואולי תצפית לפוג׳י אם מזג האוויר משתף פעולה.', items:['🚆 נסיעה מוקדמת להאקונה', '🎨 המוזיאון הפתוח', '🌿 אגם אשי', '⛩️ מקדש האקונה', '🚆 חזרה לטוקיו בערב'] },
  { day:8, date:'11.5', city:'קיוטו', area:'מזרח קיוטו', stay:'קיוטו · לילה 1 מתוך 4', summary:'נכנסים לאווירת קיוטו: רחובות אבן, מקדשים, גיון ופונטוצ׳ו בערב.', items:['🚄 שינקנסן מטוקיו לקיוטו', '⛩️ קיומיזו־דרה', '🛍️ סאננזקה/ניננזקה לחנויות ומזכרות', '⛩️ מקדש יאסאקה', '🏮 גיון ופונטוצ׳ו בערב'] },
  { day:9, date:'12.5', city:'קיוטו', area:'אראשיאמה', stay:'קיוטו', summary:'יום ירוק ופוטוגני: יער הבמבוק, נהר קאטסורה, גשרים וקצת שיטוט רגוע במערב קיוטו.', items:['🌿 יער הבמבוק מוקדם', '🎎 יער הקימונו בתחנת ראנדן אראשיאמה', '🌊 נהר קאטסורה וגשר טוגצוקיו', '⛩️ אופציה: טנריו־ג׳י', '🐒 אופציה: פארק הקופים'] },
  { day:10, date:'13.5', city:'קיוטו + נארה', area:'פושימי ונארה', stay:'קיוטו', summary:'יום מלא אבל שווה: שערי הטוריאי של פושימי בבוקר ואז נארה עם האיילים והמקדש הענק.', items:['⛩️ פושימי אינארי מוקדם', '🚆 רכבת לנארה', '🦌 פארק נארה', '⛩️ מקדש טודאי־ג׳י', '🚆 חזרה לקיוטו'] },
  { day:11, date:'14.5', city:'קיוטו', area:'צפון קיוטו', stay:'קיוטו', summary:'יום היסטורי ויפה: מקדש הזהב, גן זן, טירה, ואז אוכל ונשנושים בשוק נישיקי.', items:['⛩️ מקדש הזהב קינקאקו־ג׳י', '🌿 ריוואן־ג׳י וגן הזן', '🏯 טירת ניג׳ו', '🛒 שוק נישיקי לקראת ערב', '☕ אופציה: קפה/קינוח באזור קוואראמאצ׳י'] },
  { day:12, date:'15.5', city:'אוסקה', area:'שינסקאי ונאמבה', stay:'אוסקה · לילה 1', summary:'יום מעבר לקצב של אוסקה: רטרו, שווקים, קניות ואוכל רחוב בדוטונבורי.', items:['🚆 מעבר מקיוטו לאוסקה', '🗼 מגדל צוטנקאקו ושינסקאי', '🍣 שוק קורומון', '🛍️ שינסהיבאשי ונאמבה', '🛒 דון קיחוטה דוטונבורי', '🍜 דוטונבורי בערב'] },
  { day:13, date:'16.5', city:'אוסקה → טוקיו → נריטה', area:'בוקר אוסקה וחזרה', stay:'טיסה', summary:'יום אחרון: לא להעמיס יותר מדי. לבחור אטרקציה אחת קצרה, לחזור לטוקיו ולהשאיר מרווח לנריטה.', items:['⛩️ אם יש זמן קצר: שיטנו־ג׳י', '🏯 או טירת אוסקה בלבד', '🐠 חלופה אם נשארים עוד יום: קאיוקאן + אומדה סקיי', '🚄 שינקנסן לטוקיו ומשם Narita Express', '✈️ להגיע לנריטה סביב 16:55 לטיסה ב־19:55'] }
];

const dayPlans = {
  1: [
    ['17:00', '✈️ הגעה לשדה בישראל', 'להגיע רגוע, לעשות צ׳ק אין, לקנות מים/נשנושים לטיסה.'],
    ['19:45', '✈️ המראה', 'לשמור בטלפון את כל ההזמנות וקבצי אופליין.']
  ],
  2: [
    ['09:00', '🚆 נחיתה/מעבר לטוקיו', 'נסיעה מנריטה/האנדה למלון. מנריטה לשינג׳וקו: כ־75–90 דק׳.'],
    ['13:00', '🏨 צ׳ק אין או שמירת מזוודות', 'אם החדר לא מוכן — להשאיר מזוודות ולצאת לאזור.'],
    ['15:00', '🛒 סיבוב ראשון בשינג׳וקו', 'קונביני, בית מרקחת, סים/אינטרנט אם צריך. הליכה קצרה.'],
    ['18:30', '🍜 ארוחת ערב בשינג׳וקו', 'ראמן/איזקאיה באזור המלון.'],
    ['20:00–22:00', '🍢 אומואידה יוקוצ׳ו / גולדן גאי', 'הליכה/רכבת קצרה בתוך שינג׳וקו, לפי מיקום המלון.']
  ],
  3: [
    ['09:00', '🚆 שינג׳וקו → אסאקוסה', 'כ־35–45 דק׳ ברכבת.'],
    ['10:00', '⛩️ סנסו־ג׳י ונאקמיסה', 'מקדש, שער קמינרימון, חנויות מזכרות וחטיפים.'],
    ['12:30', '🍜 צהריים באסאקוסה', 'סובה/טמפורה/אוכל רחוב באזור.'],
    ['14:00', '🌿 פארק סומידה והנהר', 'הליכה רגועה לכיוון סקייטרי.'],
    ['15:30', '🚶 אסאקוסה → סקייטרי', 'הליכה כ־20–25 דק׳ או רכבת קצרה.'],
    ['16:00–19:00', '🗼 סקייטרי + סולמאצ׳י', 'תצפית, קניות, קפה.'],
    ['19:30–22:00', '✨ ערב באזור סקייטרי/חזרה לשינג׳וקו', 'חזרה לשינג׳וקו כ־40–50 דק׳.']
  ],
  4: [
    ['09:00', '🚆 שינג׳וקו → הרג׳וקו', 'כ־5–10 דק׳ ברכבת JR.'],
    ['09:30', '⛩️ מקדש מייג׳י ופארק יויוגי', 'בוקר ירוק ושקט יחסית.'],
    ['11:30', '🛍️ טקשיטה ואומוטסנדו', 'חנויות, קרפים, קפה.'],
    ['14:00', '🚶 הרג׳וקו → שיבויה', 'הליכה כ־20–30 דק׳ דרך אומוטסנדו/קאטים או רכבת 3 דק׳.'],
    ['15:00', '📍 מעבר שיבויה והאצ׳יקו', 'זמן לשוטט, קניות ושיבויה 109/פארקו.'],
    ['17:00–19:00', '🗼 שיבויה סקיי בשקיעה', 'להגיע 60–90 דק׳ לפני שקיעה. חובה הזמנה.'],
    ['19:30–22:00', '🛒 דון קיחוטה שיבויה + ערב באזור', 'קניות, אוכל קל, חזרה לשינג׳וקו כ־7 דק׳ ברכבת.']
  ],
  5: [
    ['09:00', '🚆 שינג׳וקו → צוקיג׳י', 'כ־25–35 דק׳ ברכבת.'],
    ['09:45', '🍣 שוק צוקיג׳י', 'ארוחת בוקר/טעימות.'],
    ['11:30', '🚶 צוקיג׳י → גינזה', 'הליכה כ־15 דק׳.'],
    ['12:00', '🛍️ גינזה', 'Itoya, Ginza Six, יוניקלו ענק.'],
    ['14:00', '🚆 גינזה → ניהונבאשי', 'כ־10–15 דק׳.'],
    ['14:30', '🍽️ פוקימון קפה', 'לפי שעת ההזמנה; להשאיר מרווח.'],
    ['16:30', '🚆 ניהונבאשי → אקיהברה', 'כ־10–15 דק׳.'],
    ['17:00–19:30', '🎮 אקיהברה', 'אנימה, גיימינג, אלקטרוניקה.'],
    ['20:00–22:00', '🍢 שינג׳וקו / סמטת הזיכרונות', 'אקיהברה לשינג׳וקו כ־20–25 דק׳.']
  ],
  6: [
    ['09:00', '🚆 שינג׳וקו → אזאבודאי הילס', 'כ־25–35 דק׳.'],
    ['10:00–12:30', '🎨 teamLab Borderless', 'להגיע לפי שעת הכרטיס.'],
    ['12:30', '🍽️ צהריים באזאבודאי', 'מסעדות וקפה באזור.'],
    ['14:00', '🚶 אזאבודאי → זוג׳וג׳י/מגדל טוקיו', 'הליכה כ־15–20 דק׳.'],
    ['14:30', '⛩️ מקדש זוג׳וג׳י', 'צילום יפה עם מגדל טוקיו ברקע.'],
    ['16:00', '🗼 מגדל טוקיו', 'תצפית/צילום לקראת ערב.'],
    ['18:00', '🚆 מגדל טוקיו → אודייבה', 'כ־35–45 דק׳.'],
    ['19:00–22:00', '🌉 אודייבה', 'טיילת, גאנדאם, גשר ריינבו, חזרה למלון כ־45–60 דק׳.']
  ],
  7: [
    ['08:00–09:00', '🚆 יציאה מוקדמת להאקונה', 'שינג׳וקו → האקונה: כ־85–120 דק׳. עדיף להתחיל לפני 09:00.'],
    ['10:30', '🎨 המוזיאון הפתוח', 'ביקור של 1.5–2.5 שעות.'],
    ['13:00', '🍽️ צהריים בהאקונה', 'באזור המוזיאון/תחנות.'],
    ['14:00', '🚆/🚌 מעבר לאגם אשי', 'כ־45–70 דק׳, תלוי מסלול תחבורה.'],
    ['15:30', '🌿 אגם אשי + ⛩️ מקדש האקונה', 'שייט/תצפית/שער טוריאי.'],
    ['18:00', '🚆 חזרה לטוקיו', 'כ־90–120 דק׳.'],
    ['20:30–22:00', '🍜 ערב קל ליד המלון', 'לא להעמיס אחרי יום ארוך.']
  ],
  8: [
    ['09:00', '🚄 טוקיו → קיוטו', 'שינקנסן כ־2:15–2:40 שעות.'],
    ['12:00', '🏨 הגעה למלון/שמירת מזוודות', 'תחנת קיוטו או גיון לפי המלון.'],
    ['13:30', '🚆/🚌 מעבר לקיומיזו־דרה', 'כ־20–35 דק׳.'],
    ['14:00', '⛩️ קיומיזו־דרה', 'מקדש ותצפית על קיוטו.'],
    ['16:00', '🛍️ סאננזקה/ניננזקה', 'חנויות, תה, מזכרות.'],
    ['18:00', '⛩️ יאסאקה + גיון', 'הליכה רגלית מהאזור.'],
    ['19:30–22:00', '🏮 פונטוצ׳ו וגיון בערב', 'ארוחת ערב ושיטוט.']
  ],
  9: [
    ['09:00', '🚆 קיוטו → אראשיאמה', 'כ־20–35 דק׳ לפי תחנת יציאה.'],
    ['09:45', '🌿 יער הבמבוק', 'להגיע מוקדם יחסית כדי לצמצם עומס.'],
    ['11:00', '⛩️ טנריו־ג׳י / יער הקימונו', 'הליכה קצרה באזור.'],
    ['12:30', '🍽️ צהריים באראשיאמה', 'מסעדות וקפה ליד התחנה/הנהר.'],
    ['14:00', '🌊 נהר קאטסורה וגשר טוגצוקיו', 'שיטוט וצילומים.'],
    ['16:00', '🚆 חזרה למרכז קיוטו', 'כ־20–35 דק׳.'],
    ['18:00–22:00', '🛍️ קוואראמאצ׳י / גיון', 'ערב חופשי, קניות וקינוח.']
  ],
  10: [
    ['09:00', '🚆 קיוטו → פושימי אינארי', 'כ־5–15 דק׳ מתחנת קיוטו.'],
    ['09:30', '⛩️ פושימי אינארי', 'שערי הטוריאי; אפשר לעשות מסלול קצר/בינוני.'],
    ['11:30', '🚆 פושימי → נארה', 'כ־45–60 דק׳.'],
    ['12:30', '🍽️ צהריים בנארה', 'באזור התחנה/הפארק.'],
    ['13:30', '🦌 פארק נארה', 'איילים ושיטוט בפארק.'],
    ['15:00', '⛩️ טודאי־ג׳י', 'המקדש והבודהה הגדול.'],
    ['17:30', '🚆 חזרה לקיוטו', 'כ־45–60 דק׳.'],
    ['19:00–22:00', '🍜 ערב בקיוטו', 'נישיקי/קוואראמאצ׳י/גיון לפי כוח.']
  ],
  11: [
    ['09:00', '🚌 יציאה לצפון קיוטו', 'ממרכז קיוטו לקינקאקו־ג׳י כ־30–45 דק׳.'],
    ['10:00', '⛩️ מקדש הזהב', 'ביקור של כשעה.'],
    ['11:15', '🚶/🚌 מעבר לריוואן־ג׳י', 'כ־10–20 דק׳.'],
    ['11:45', '🌿 ריוואן־ג׳י', 'גן זן וביקור רגוע.'],
    ['13:00', '🍽️ צהריים', 'באזור או בדרך לניג׳ו.'],
    ['14:30', '🏯 טירת ניג׳ו', 'נסיעה כ־25–35 דק׳ מצפון קיוטו.'],
    ['17:00', '🛒 שוק נישיקי', 'ניג׳ו → נישיקי כ־15–25 דק׳.'],
    ['19:00–22:00', '☕ קוואראמאצ׳י / פונטוצ׳ו', 'ערב אחרון בקיוטו.']
  ],
  12: [
    ['09:00', '🚆 קיוטו → אוסקה', 'כ־15–45 דק׳ לפי תחנות.'],
    ['10:30', '🏨 שמירת מזוודות במלון בנאמבה', 'עד הצ׳ק אין.'],
    ['11:00', '🗼 שינסקאי וצוטנקאקו', 'נאמבה → שינסקאי כ־10–20 דק׳.'],
    ['13:00', '🍽️ קושיקאצו / צהריים באזור', 'אוכל רחוב של אוסקה.'],
    ['14:30', '🚆 מעבר לקורומון', 'כ־10–15 דק׳.'],
    ['15:00', '🍣 שוק קורומון', 'טעימות, פירות ים, קינוחים.'],
    ['17:00', '🛍️ שינסהיבאשי ונאמבה', 'רחובות קניות גדולים.'],
    ['19:00–22:00', '🛒 דון קיחוטה + 🍜 דוטונבורי', 'אוכל רחוב, גליקו, קניות ערב.']
  ],
  13: [
    ['09:00', '🏯 אטרקציה קצרה באוסקה', 'לבחור: טירת אוסקה או שיטנו־ג׳י. לא שתיהן אם לחוצים.'],
    ['11:30', '🚆 חזרה למלון/איסוף מזוודות', 'להשאיר מרווח ולא להיתקע.'],
    ['12:30', '🚄 אוסקה → טוקיו', 'שינקנסן כ־2:30–3:00 שעות.'],
    ['15:30', '🚆 טוקיו → נריטה', 'Narita Express / Keisei: כ־45–75 דק׳.'],
    ['16:55', '✈️ הגעה לנריטה', 'צ׳ק אין, ביטחון, אוכל/קניות אחרונות.'],
    ['19:55', '✈️ המראה מטוקיו', 'סיום הטיול הגדול ביפן.']
  ]
};

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

const hotels = [
  {
    dates:'5–9.5',
    city:'טוקיו · 4 לילות',
    area:'Shinjuku',
    pick:'The Knot Tokyo Shinjuku',
    link:'https://hotel-the-knot.jp/tokyoshinjuku/',
    why:'הבחירה הכי מאוזנת: מודרני, נעים ובדרך כלל במחירים יחסית טובים לטוקיו. בסיס מעולה לשיבויה, הרג׳וקו, מרכז טוקיו ויציאה לטיול יום לפוג׳י/האקונה.',
    alternatives:['Shinjuku Prince Hotel — מיקום מרכזי מאוד באזור הפעיל של שינג׳וקו', 'Shinjuku Washington Hotel — לרוב זול יותר ועדיין באזור טוב', 'All Day Place Shibuya / Shibuya Excel Hotel Tokyu — אם מעדיפים ממש שיבויה']
  },
  {
    dates:'9–12.5',
    city:'קיוטו · 3 לילות',
    area:'Gion או Kyoto Station',
    pick:'Granbell Hotel Kyoto',
    link:'https://www.granbellhotel.jp/kyoto/',
    why:'הבחירה החווייתית יותר: אזור גיון, נעים לערבים, קרוב לשיטוטים בגיון ופונטוצ׳ו. אם נוחות תחבורה חשובה יותר — Miyako City Kintetsu Kyoto Station עדיף.',
    alternatives:['Miyako City Kintetsu Kyoto Station — הכי נוח לתחבורה ולמזוודות', 'Hotel Granvia Kyoto — ממש בתוך/צמוד לתחנת קיוטו', 'Rinn Kyoto Station — קטן יותר, דירוג גבוה ומחיר נוח יחסית', 'The Celestine Hotel Gion — אם התקציב מאפשר ורוצים פינוק']
  },
  {
    dates:'12–15.5',
    city:'אוסקה · 3 לילות',
    area:'Namba / Dotonbori',
    pick:'Vessel Inn Namba',
    link:'https://www.vessel-hotel.jp/inn/namba/',
    why:'האזור הכי נכון לאוסקה בערב. חוזרים מיום ארוך ונמצאים ישר ליד דוטונבורי, אוכל, קניות ותחנת נאמבה.',
    alternatives:['Namba Oriental Hotel — מיקום מעולה באזור Sennichimae/Namba', 'Il Cuore Hotel Namba — אופציה זולה וקרובה לתחנת Namba', 'Onyado Nono Nanba — יותר חוויה יפנית ומפנקת']
  },
  {
    dates:'15–16.5',
    city:'טוקיו · לילה אחרון',
    area:'Shibuya או Tokyo Station/Ueno',
    pick:'All Day Place Shibuya',
    link:'https://www.uds-hotels.com/all-day-place/shibuya/',
    why:'לילה אחרון כיפי בטוקיו עם קניות ואווירה. אם רוצים נוחות מקסימלית לנריטה, לשקול Tokyo Station או Ueno במקום שיבויה.',
    alternatives:['Shibuya Stream Hotel — מיקום נהדר ודירוג גבוה, יקר יותר', 'Tokyo Station/Ueno — עדיף אם המיקוד הוא יציאה נוחה לנריטה']
  }
];

const nearbyGuide = [
  {
    area:'שינג׳וקו',
    bestFor:'לילות ראשונים, אוכל וקניות עד מאוחר',
    restaurants:['Omoide Yokocho — יקיטורי ואווירת סמטאות', 'Ichiran Ramen Shinjuku — ראמן מוכר ונוח', 'Gyukatsu Motomura — גיוקאטסו פופולרי'],
    sushi:['Kura Sushi Shinjuku', 'Sushiro Shinjuku', 'Uobei / סושי מהיר בסגנון הזמנה במסך'],
    coffee:['Starbucks Shinjuku Southern Terrace', 'Blue Bottle Shinjuku', 'Tully’s Coffee ליד התחנות'],
    markets:['7‑Eleven / FamilyMart / Lawson כמעט בכל רחוב', 'Don Quijote Shinjuku Kabukicho', 'Lumine / NEWoMan / Takashimaya Times Square']
  },
  {
    area:'שיבויה והרג׳וקו',
    bestFor:'שיבויה סקיי, קניות, דון קיחוטה וערב צעיר',
    restaurants:['Uobei Shibuya Dogenzaka — סושי מסוע/מסך מעולה לקבוצה', 'Ichiran Shibuya', 'Gyukatsu Motomura Shibuya'],
    sushi:['Uobei Shibuya Dogenzaka', 'Sushiro Shibuya', 'Kura Sushi באזור שיבויה/הרג׳וקו'],
    coffee:['Starbucks Shibuya Tsutaya / אזור מעבר החצייה', 'Streamer Coffee Company', 'Blue Bottle Shibuya'],
    markets:['MEGA Don Quijote Shibuya', 'Shibuya 109', 'Shibuya PARCO', 'Nintendo Tokyo / Pokémon Center Shibuya']
  },
  {
    area:'אסאקוסה וסקייטרי',
    bestFor:'מקדשים, אוכל רחוב ומתנות',
    restaurants:['רחוב Nakamise — חטיפים ומתוקים יפניים', 'Asakusa Gyukatsu', 'Tempura / Soba מסביב לסנסו־ג׳י'],
    sushi:['Kura Sushi Asakusa ROX', 'Sushiro / סניפים באזור Ueno-Asakusa', 'מסעדות סושי קטנות ליד התחנה'],
    coffee:['Starbucks Asakusa Kaminarimon', 'קפה סביב Sumida Park', 'קפה בתוך Tokyo Solamachi'],
    markets:['Tokyo Solamachi — קניון ענק ליד Skytree', 'Don Quijote Asakusa', 'חנויות מזכרות ב־Nakamise-dori']
  },
  {
    area:'גינזה / תחנת טוקיו / ניהונבאשי',
    bestFor:'פוקימון קפה, קניות יפות ואוכל מסודר',
    restaurants:['Tokyo Station Ramen Street', 'Depachika — קומות אוכל בכלבו', 'מסעדות סביב Nihonbashi Takashimaya'],
    sushi:['Sushiro Yurakucho/Ginza area', 'Kura Sushi Ginza area', 'סושי בעמידה באזור Yurakucho'],
    coffee:['Starbucks Reserve / Ginza area', 'Blue Bottle Ginza', 'קפה בתחנת טוקיו'],
    markets:['Ginza Six', 'Itoya Ginza', 'Nihonbashi Takashimaya', 'Tokyo Character Street']
  },
  {
    area:'קיוטו — גיון / קוואראמאצ׳י / שוק נישיקי',
    bestFor:'ערבים יפים, אוכל ושופינג נעים',
    restaurants:['Pontocho Alley — מסעדות ערב לאורך הסמטה', 'Nishiki Market — טעימות ואוכל רחוב', 'Gion area — סובה/אודון/קינוחים'],
    sushi:['Kura Sushi Kyoto', 'Sushiro Kyoto Kawaramachi', 'Musashi Sushi Kyoto Station אם אתן ליד התחנה'],
    coffee:['Starbucks Kyoto Ninenzaka Yasaka Chaya — סניף יפה בבית מסורתי', 'Arabica Kyoto Higashiyama', 'Blue Bottle Kyoto'],
    markets:['Nishiki Market', 'Kawaramachi OPA / Mina Kyoto', 'Kyoto Station Porta / Isetan', 'חנויות מזכרות בגיון וסאננזקה']
  },
  {
    area:'אוסקה — נאמבה / דוטונבורי',
    bestFor:'אוכל רחוב, קניות ודון קיחוטה',
    restaurants:['Dotonbori — טאקויאקי, אוקונומיאקי וקושיקאצו', 'Hozenji Yokocho — סמטה יפה לאוכל', 'Ichiran Dotonbori'],
    sushi:['Kura Sushi Dotonbori', 'Sushiro Namba', 'Daiki Suisan / סושי מסוע פופולרי'],
    coffee:['Starbucks Tsutaya Ebisu-bashi / Dotonbori', 'Streamer Coffee Namba', 'בתי קפה ב־Namba Parks'],
    markets:['Don Quijote Dotonbori', 'Kuromon Market', 'Shinsaibashi-suji Shopping Street', 'Namba Parks / Takashimaya Osaka']
  },
  {
    area:'האקונה',
    bestFor:'יום טבע, מוזיאון פתוח ואגם אשי',
    restaurants:['מסעדות סביב Hakone-Yumoto Station', 'בתי תה ומסעדות ליד אגם אשי', 'קפה/מסעדה במוזיאון הפתוח'],
    sushi:['לא אזור קלאסי לסושי מסוע — עדיף לאכול פשוט סביב התחנות', 'אם רוצים סושי, להשאיר לטוקיו/אוסקה'],
    coffee:['Starbucks / רשתות באזור Odawara בדרך', 'בתי קפה מקומיים סביב Hakone-Yumoto', 'קפה ליד המוזיאון הפתוח'],
    markets:['7‑Eleven / Lawson סביב תחנות מרכזיות', 'חנויות מזכרות ב־Hakone-Yumoto', 'חנויות מקומיות ליד אגם אשי']
  }
];

const japanFacts = [
  'ביפן נהוג לעמוד בצד שמאל במדרגות נעות בטוקיו, אבל באוסקה לרוב עומדים בצד ימין.',
  'ברוב הרכבות ביפן לא מדברים בקול בטלפון — שולחים הודעות ושומרים על שקט.',
  'קונביני כמו 7‑Eleven, Lawson ו־FamilyMart הם ממש תחנת הצלה: אוכל, קפה, שירותים, משיכת כסף ומטריות.',
  'במקדשים ושערי טוריאי מקובל לעבור בצדדים ולא ממש באמצע — האמצע נחשב דרך סמלית לאלים.',
  'פחי אשפה ברחוב נדירים יחסית. שומרים שקית קטנה בתיק וזורקים בקונביני/מלון.',
  'במסעדות רבות אין טיפ — שירות טוב הוא חלק מהתרבות ולא מוסיפים כסף.',
  'במעברי חציה גדולים כמו שיבויה כדאי לבחור נקודת מפגש ברורה מראש, כי קל להיפרד בקהל.'
];

const homeLearningCards = [
  { title:'רקע קצר על יפן', text:'יפן משלבת מסורת עתיקה עם עירוניות עתידנית: מקדשים, רכבות מדויקות, אוכל רחוב, תרבות פופ, טבע ואסתטיקה מוקפדת. בטיול הזה אתן נוגעות בכל העולמות האלה — טוקיו המהירה, קיוטו המסורתית, אוסקה הקולינרית והאקונה הירוקה.' },
  { title:'רקע היסטורי קצר', text:'קיוטו הייתה בירת יפן יותר מאלף שנה ולכן מרגישה כמו לב היסטורי: מקדשים, גנים, גיון וטקסיות. טוקיו, שנקראה בעבר אדו, הפכה למרכז השלטון בתקופת השוגונים ובהמשך לבירה מודרנית. אוסקה הייתה תמיד עיר מסחר ואוכל — ולכן היא מרגישה פתוחה, צבעונית וטעימה.' },
  { title:'תזכורות זהב לטיול', text:'לשמור דרכון/צילום דרכון, להזמין מראש גיבלי/פוקימון/שיבויה סקיי, לבדוק מזג אוויר ערב קודם, להחזיק מזומן קטן ביין, ולתכנן כל יום עם “עוגן” אחד חשוב כדי לא לרוץ מדי.' }
];

const pageEnhancements = {
  map: [
    { title:'טיפ למפה', text:'כשאתן באזור מסוים, סננו לפי עיר ואז לפי סוג מקום במקרא. ככה רואים רק מקדשים, קניות או אוכל בלי בלגן.' },
    { title:'שימוש חכם', text:'לחיצה על מקום פותחת כרטיס עם מחיר, זמן מומלץ וקישור לגוגל מפות. בטיול עצמו זה הכי נוח לניווט מהיר.' }
  ],
  route: [
    { title:'איך לעבוד עם המסלול', text:'המסלול הוא בסיס, לא כלא. אם יום מרגיש עמוס — מחקו תחנה אחת והשאירו זמן לשיטוט. ביפן דווקא הדברים הלא מתוכננים נהיים רגעים טובים.' },
    { title:'כלל 09:00–22:00', text:'הלו״ז בנוי מ־09:00 עד 22:00, אבל כדאי להשאיר לפחות שעה מרווח ביום לנסיעות, תורים, קפה או סתם “וואו תראו את זה”.' }
  ],
  hotels: [
    { title:'טיפ מלונות', text:'בטוקיו עדיף להיות ליד קו רכבת מרכזי יותר מאשר “במלון יפה אבל מנותק”. בקיוטו בחרי בין חוויית גיון לבין נוחות Kyoto Station.' },
    { title:'לפני שסוגרים', text:'לבדוק גודל חדר במ״ר, מרחק הליכה מהתחנה, מדיניות מזוודות וצ׳ק אין. ביפן חדרים יכולים להיות קטנים מאוד.' }
  ],
  transfers: [
    { title:'טיפ תחבורה', text:'לנסיעות בין ערים שמרו את שם התחנה באנגלית ויפנית. בתחנות גדולות כמו Tokyo / Shinjuku / Osaka קל להתבלבל ביציאות.' },
    { title:'מזוודות', text:'שווה לשקול שירות שליחת מזוודות בין מלונות — Yamato/TA-Q-BIN — במיוחד בין טוקיו, קיוטו ואוסקה.' }
  ],
  nearby: [
    { title:'איך לבחור אוכל', text:'אם עייפים, לכו על סושי מסוע/ראמן/קונביני — זה מהיר, זול וטעים. אם יש ערב פנוי, חפשו סמטאות כמו פונטוצ׳ו או דוטונבורי.' },
    { title:'קפה ומנוחה', text:'סטארבקס ביפן נוח להפסקה ושירותים, אבל שווה גם לנסות קפה מקומי קטן כשיש זמן.' }
  ],
  shopping: [
    { title:'קניות חכמות', text:'דון קיחוטה טוב לקניות גדולות ומשונות, אבל לפעמים בתי מרקחת כמו Matsumoto Kiyoshi / Welcia זולים יותר לקוסמטיקה ופארם.' },
    { title:'לפני קופה', text:'לבדוק Tax Free, לשמור דרכון, ולוודא שהמוצרים שאתן צריכות בטיול עצמו לא נארזים בשקית אטומה שאסור לפתוח עד היציאה מיפן.' }
  ]
};

const konbiniTips = [
  { title:'7‑Eleven', text:'מעולה לאוניגירי, כריכים, קפה זול, משיכת כסף בכספומט, קינוחים וארוחות מוכנות שמחממים במקום.' },
  { title:'Lawson', text:'חזקים בקינוחים, עוף מטוגן, שתייה מיוחדת ונשנושים. שווה להציץ במדף המתוקים.' },
  { title:'FamilyMart', text:'Famichiki הוא קלאסיקה. טוב גם לארוחות קלות, גרביים/מטענים קטנים וציוד חירום.' },
  { title:'חנויות פארם זולות', text:'Matsumoto Kiyoshi, Welcia, Sundrug ו־Daikoku Drug — לקוסמטיקה, מסכות פנים, פלסטרים, משככי כאבים ומוצרים יפניים מוכרים.' }
];

function googleMapsUrl(place){ return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`; }
function googleMapsSearchUrl(query){ return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`; }
function iconForPlace(place) {
  const text = `${place.id} ${place.name} ${place.note}`.toLowerCase();
  if (text.includes('מקדש') || text.includes('shrine') || text.includes('ji') || text.includes('inari') || text.includes('dera')) return '⛩️';
  if (text.includes('טירה') || text.includes('castle')) return '🏯';
  if (text.includes('מוזיאון') || text.includes('teamlab') || text.includes('גיבלי')) return '🎨';
  if (text.includes('אקווריום')) return '🐠';
  if (text.includes('שוק') || text.includes('קניות') || text.includes('don') || text.includes('דון') || text.includes('parco') || text.includes('station') || text.includes('ginza') || text.includes('namba')) return '🛒';
  if (text.includes('קפה') || text.includes('פוקימון') || text.includes('מסעד')) return '🍽️';
  if (text.includes('מגדל') || text.includes('sky') || text.includes('skytree') || text.includes('תצפית')) return '🗼';
  if (text.includes('יער') || text.includes('פארק') || text.includes('אגם') || text.includes('נהר') || text.includes('hakone')) return '🌿';
  if (text.includes('גני') || text.includes('גן')) return '🌸';
  if (text.includes('מעבר') || text.includes('רובע') || text.includes('אודייבה') || text.includes('דוטונבורי')) return '📍';
  return '⭐';
}

const categories = [
  { id:'all', label:'הכול', icon:'⭐' },
  { id:'temple', label:'מקדשים', icon:'⛩️' },
  { id:'castle', label:'טירות', icon:'🏯' },
  { id:'tower', label:'תצפיות', icon:'🗼' },
  { id:'shopping', label:'קניות/סופר', icon:'🛒' },
  { id:'food', label:'אוכל/קפה', icon:'🍽️' },
  { id:'museum', label:'מוזיאונים', icon:'🎨' },
  { id:'nature', label:'טבע', icon:'🌿' },
  { id:'aquarium', label:'אקווריום', icon:'🐠' }
];

function categoryForPlace(place) {
  const text = `${place.id} ${place.name} ${place.note}`.toLowerCase();
  if (text.includes('מקדש') || text.includes('shrine') || text.includes('ji') || text.includes('inari') || text.includes('dera')) return 'temple';
  if (text.includes('טירה') || text.includes('castle')) return 'castle';
  if (text.includes('מוזיאון') || text.includes('teamlab') || text.includes('גיבלי')) return 'museum';
  if (text.includes('אקווריום')) return 'aquarium';
  if (text.includes('שוק') || text.includes('קניות') || text.includes('don') || text.includes('דון') || text.includes('parco') || text.includes('station') || text.includes('ginza') || text.includes('namba')) return 'shopping';
  if (text.includes('קפה') || text.includes('פוקימון') || text.includes('מסעד')) return 'food';
  if (text.includes('מגדל') || text.includes('sky') || text.includes('skytree') || text.includes('תצפית')) return 'tower';
  if (text.includes('יער') || text.includes('פארק') || text.includes('אגם') || text.includes('נהר') || text.includes('hakone') || text.includes('גן') || text.includes('גני')) return 'nature';
  return 'other';
}

function getMarkerLatLng(place, visiblePlaces) {
  const closePlaces = visiblePlaces.filter(other => {
    const latDistance = Math.abs(other.lat - place.lat);
    const lngDistance = Math.abs(other.lng - place.lng);
    return latDistance < 0.012 && lngDistance < 0.012;
  });
  if (closePlaces.length < 2) return [place.lat, place.lng];

  const sorted = [...closePlaces].sort((a, b) => a.id.localeCompare(b.id));
  const groupIndex = sorted.findIndex(item => item.id === place.id);
  const angle = (Math.PI * 2 * groupIndex) / closePlaces.length;
  const offset = Math.min(0.008, 0.003 + closePlaces.length * 0.00055);
  return [place.lat + Math.sin(angle) * offset, place.lng + Math.cos(angle) * offset];
}

function TripMap({ places: visiblePlaces, selectedId, onSelect }) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;
    mapRef.current = L.map(mapNodeRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      tap: true
    }).setView([35.68, 139.76], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = [];
    visiblePlaces.forEach(place => {
      const markerPosition = getMarkerLatLng(place, visiblePlaces);
      const marker = L.marker(markerPosition, {
        icon: L.divIcon({
          className: `tripMarker ${place.id === selectedId ? 'selectedTripMarker' : ''}`,
          html: `<span>${iconForPlace(place)}</span>`,
          iconSize: [42, 42],
          iconAnchor: [21, 21]
        }),
        title: place.name
      }).addTo(map);
      marker.on('click', () => onSelect(place.id));
      marker.bindTooltip(place.name, { direction: 'top', offset: [0, -18] });
      markersRef.current.push(marker);
      bounds.push(markerPosition);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
    }
  }, [visiblePlaces, selectedId, onSelect]);

  return <div ref={mapNodeRef} className="map liveMap" aria-label="מפה אינטראקטיבית עם נקודות" />;
}

const currencyLabels = {
  JPY: 'יין יפני ¥',
  ILS: 'שקל ₪',
  USD: 'דולר $',
  EUR: 'יורו €'
};

const fallbackRates = {
  JPY: 1,
  USD: 0.0067,
  EUR: 0.0061,
  ILS: 0.024
};

function MoneyCalculator() {
  const [amount, setAmount] = useState(1000);
  const [from, setFrom] = useState('JPY');
  const [to, setTo] = useState('ILS');
  const [rates, setRates] = useState(fallbackRates);
  const [rateStatus, setRateStatus] = useState('שערי ברירת מחדל — אפשר להשתמש גם בלי אינטרנט');

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/JPY')
      .then(response => response.json())
      .then(data => {
        if (!data?.rates) return;
        setRates({
          JPY: 1,
          USD: data.rates.USD ?? fallbackRates.USD,
          EUR: data.rates.EUR ?? fallbackRates.EUR,
          ILS: data.rates.ILS ?? fallbackRates.ILS
        });
        setRateStatus(`שערים עודכנו אונליין: ${new Date().toLocaleDateString('he-IL')}`);
      })
      .catch(() => setRateStatus('אין חיבור לשערים חיים — משתמשים בשערי ברירת מחדל'));
  }, []);

  const total = Number(amount || 0);
  const totalInJpy = from === 'JPY' ? total : total / rates[from];
  const converted = to === 'JPY' ? totalInJpy : totalInJpy * rates[to];
  const oneUnit = from === 'JPY' ? rates[to] : (1 / rates[from]) * rates[to];

  return (
    <section className="calculator" id="calculator">
      <div className="sectionHeader">
        <p className="areaTag">כסף בזמן אמת</p>
        <h2>מחשבון המרת מטבע</h2>
      </div>
      <div className="calculatorGrid">
        <article className="calculatorCard">
          <label>סכום</label>
          <input type="number" min="0" value={amount} onChange={event => setAmount(event.target.value)} />
          <div className="currencyRow">
            <div>
              <label>ממטבע</label>
              <select value={from} onChange={event => setFrom(event.target.value)}>
                {Object.entries(currencyLabels).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
            </div>
            <div>
              <label>למטבע</label>
              <select value={to} onChange={event => setTo(event.target.value)}>
                {Object.entries(currencyLabels).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
            </div>
          </div>
        </article>
        <article className="resultCard">
          <span>סה״כ לחישוב</span>
          <strong>{total.toLocaleString('he-IL')} {currencyLabels[from]}</strong>
          <span>שווה בערך</span>
          <strong className="converted">{converted.toLocaleString('he-IL', { maximumFractionDigits: to === 'JPY' ? 0 : 2 })} {currencyLabels[to]}</strong>
          <small>שער 1 {currencyLabels[from]} ≈ {oneUnit.toLocaleString('he-IL', { maximumFractionDigits: 4 })} {currencyLabels[to]}</small>
          <small>{rateStatus}</small>
        </article>
      </div>
      <div className="konbiniGrid">
        {konbiniTips.map(tip => (
          <article key={tip.title}>
            <h3>{tip.title}</h3>
            <p>{tip.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoCards({ items }) {
  return (
    <div className="infoGrid">
      {items.map(item => (
        <article key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function DidYouKnowTicker() {
  return (
    <div className="ticker" aria-label="הידעת">
      <div className="tickerTrack">
        {[...japanFacts, ...japanFacts].map((fact, index) => (
          <span key={`${fact}-${index}`}>💡 הידעת? {fact}</span>
        ))}
      </div>
    </div>
  );
}

function App(){
  const initialPage = window.location.hash?.replace('#', '') || 'home';
  const [activePage, setActivePage] = useState(initialPage);
  const [selectedId, setSelectedId] = useState('shibuyasky');
  const [filter, setFilter] = useState('הכל');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const defaultTripDays = useMemo(() => itinerary.map(day => ({
    ...day,
    schedule: (dayPlans[day.day] ?? []).map(([time, title, detail]) => ({ time, title, detail }))
  })), []);
  const [tripDays, setTripDays] = useState(() => {
    try {
      const saved = localStorage.getItem('japan-custom-trip-days-v1');
      return saved ? JSON.parse(saved) : defaultTripDays;
    } catch {
      return defaultTripDays;
    }
  });
  useEffect(() => {
    localStorage.setItem('japan-custom-trip-days-v1', JSON.stringify(tripDays));
  }, [tripDays]);
  const selected = places.find(p => p.id === selectedId) ?? places[0];
  const filtered = useMemo(() => {
    return places.filter(p => {
      const cityMatch = filter === 'הכל' || p.city === filter;
      const categoryMatch = categoryFilter === 'all' || categoryForPlace(p) === categoryFilter;
      return cityMatch && categoryMatch;
    });
  }, [filter, categoryFilter]);
  const cities = ['הכל', ...Array.from(new Set(places.map(p => p.city)))];
  const goToPage = (page) => {
    setActivePage(page);
    window.history.replaceState(null, '', `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const navItems = [
    ['home', 'בית'],
    ['map', 'מפה'],
    ['route', 'מסלול'],
    ['calculator', 'מחשבון'],
    ['hotels', 'מלונות'],
    ['transfers', 'הגעה'],
    ['nearby', 'בסביבה'],
    ['shopping', 'קניות']
  ];
  const updateDay = (dayNumber, field, value) => {
    setTripDays(days => days.map(day => day.day === dayNumber ? { ...day, [field]: value } : day));
  };
  const updateScheduleItem = (dayNumber, index, field, value) => {
    setTripDays(days => days.map(day => {
      if (day.day !== dayNumber) return day;
      const schedule = [...day.schedule];
      schedule[index] = { ...schedule[index], [field]: value };
      return { ...day, schedule };
    }));
  };
  const addScheduleItem = (dayNumber) => {
    setTripDays(days => days.map(day => day.day === dayNumber ? {
      ...day,
      schedule: [...day.schedule, { time: '09:00', title: '📍 מיקום חדש', detail: 'להוסיף כאן דרך הגעה, זמן נסיעה ומה עושים במקום.' }]
    } : day));
  };
  const removeScheduleItem = (dayNumber, index) => {
    setTripDays(days => days.map(day => day.day === dayNumber ? {
      ...day,
      schedule: day.schedule.filter((_, itemIndex) => itemIndex !== index)
    } : day));
  };
  const resetPlan = () => {
    setTripDays(defaultTripDays);
    localStorage.removeItem('japan-custom-trip-days-v1');
  };

  return <main>
    <nav className="topbar" aria-label="ניווט מהיר">
      {navItems.map(([page, label]) => (
        <button key={page} onClick={() => goToPage(page)} className={activePage === page ? 'activeNav' : ''}>{label}</button>
      ))}
    </nav>

    <section className={`pageSection ${activePage === 'home' ? 'activePage' : ''}`}>
    <section className="hero">
      <div>
        <p className="eyebrow">קוניצ׳יווה, יפן מחכה לכן</p>
        <h1>יפן - הטיול הגדול התחלנו !</h1>
        <p className="lead">טוקיו, האקונה, קיוטו, נארה ואוסקה — עם כל המקומות שביקשת, כולל שכונות ומקומות קרובים ששווה להוסיף כשכבר נמצאים באזור.</p>
        <div className="heroActions">
          <button className="primaryAction" onClick={() => goToPage('map')}>לפתוח את המפה</button>
          <button className="secondaryAction" onClick={() => goToPage('route')}>לראות את הימים</button>
          <button className="secondaryAction moneyAction" onClick={() => goToPage('calculator')}>מחשבון המרה</button>
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
    <DidYouKnowTicker />
    <InfoCards items={homeLearningCards} />
    </section>

    <section className="layout">
      <aside className={`itinerary pageSection ${activePage === 'route' ? 'activePage' : ''}`} id="route">
        <h2>המסלול לפי ימים</h2>
        <InfoCards items={pageEnhancements.route} />
        <div className="editToolbar">
          <button onClick={() => setEditMode(mode => !mode)} className={`mainEditButton ${editMode ? 'activeEdit' : ''}`}>
            {editMode ? '✅ סיום עריכה ושמירה' : '✏️ עריכת מסלול'}
          </button>
          {editMode && <button onClick={() => addScheduleItem(selectedDay)}>➕ הוספת מיקום ליום הנבחר</button>}
          {editMode && <button onClick={resetPlan}>↩️ איפוס לברירת מחדל</button>}
        </div>
        <p className="editHint">{editMode ? 'מצב עריכה פעיל: אפשר לשנות אזור, לינה, תיאור, שעות, מיקומים ודרכי הגעה. השינויים נשמרים אוטומטית.' : 'כדי לשנות את התכנון לחצי על “עריכת מסלול”.'}</p>
        <div className="dayPicker" aria-label="בחירת יום במסלול">
          {tripDays.map(day => <button key={day.day} onClick={() => setSelectedDay(day.day)} className={selectedDay === day.day ? 'selectedDay' : ''}>
            יום {day.day}
          </button>)}
        </div>
        {tripDays.map(day => <article className={`day ${selectedDay === day.day ? 'visibleDay' : ''}`} key={day.day}>
          <div className="dayTop"><span>יום {day.day}</span><strong>{day.date}</strong></div>
          {editMode ? (
            <div className="dayEditor">
              <label>עיר / כותרת היום<input value={day.city} onChange={event => updateDay(day.day, 'city', event.target.value)} /></label>
              <label>אזור ביום<input value={day.area} onChange={event => updateDay(day.day, 'area', event.target.value)} /></label>
              <label>לינה / הערה<input value={day.stay} onChange={event => updateDay(day.day, 'stay', event.target.value)} /></label>
              <label>מה צפוי ביום<textarea value={day.summary} onChange={event => updateDay(day.day, 'summary', event.target.value)} /></label>
            </div>
          ) : (
            <>
              <h3>{day.city}</h3>
              <p>{day.area} · {day.stay}</p>
              <p className="daySummary">{day.summary}</p>
            </>
          )}
          <div className="daySchedule">
            {(day.schedule ?? []).map((item, index) => (
              <div className={`scheduleItem ${editMode ? 'editingScheduleItem' : ''}`} key={`${day.day}-${index}`}>
                {editMode ? (
                  <>
                    <input aria-label="שעה" value={item.time} onChange={event => updateScheduleItem(day.day, index, 'time', event.target.value)} />
                    <input aria-label="מיקום או פעילות" value={item.title} onChange={event => updateScheduleItem(day.day, index, 'title', event.target.value)} />
                    <textarea aria-label="דרך הגעה ופרטים" value={item.detail} onChange={event => updateScheduleItem(day.day, index, 'detail', event.target.value)} />
                    <button onClick={() => removeScheduleItem(day.day, index)}>מחיקה</button>
                  </>
                ) : (
                  <>
                    <strong>{item.time}</strong>
                    <span>{item.title}</span>
                    <small>{item.detail}</small>
                  </>
                )}
              </div>
            ))}
          </div>
          {editMode && (
            <button className="addInsideDay" onClick={() => addScheduleItem(day.day)}>
              ➕ הוספת אטרקציה / מיקום / פעילות ליום {day.day}
            </button>
          )}
          {!editMode && <ul>{day.items.map((item,i)=><li key={i}>{item}</li>)}</ul>}
        </article>)}
      </aside>

      <section className={`mapPanel pageSection ${activePage === 'map' ? 'activePage' : ''}`} id="map">
        <div className="toolbar">
          <h2>מפה</h2>
          <select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="סינון עיר">
            {cities.map(c => <option key={c} value={c}>{c === 'הכל' ? c : cityNames[c]}</option>)}
          </select>
        </div>

        <div className="mapWrap">
          <TripMap places={filtered} selectedId={selected.id} onSelect={setSelectedId} />
        </div>
        <div className="mapLegend" aria-label="מקרא אייקונים">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setCategoryFilter(category.id)}
              className={categoryFilter === category.id ? 'activeLegend' : ''}
              type="button"
            >
              {category.icon} {category.label}
            </button>
          ))}
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
        <InfoCards items={pageEnhancements.map} />
      </section>
    </section>

    <section className={`extras pageSection ${activePage === 'shopping' ? 'activePage' : ''}`} id="shopping">
      <h2>תוספות חכמות ליד המקומות שביקשת</h2>
      <InfoCards items={pageEnhancements.shopping} />
      <div className="extraGrid">
        {extras.map(e => <article key={e.title}><p>{e.city}</p><h3>{e.title}</h3><span>{e.text}</span></article>)}
      </div>
    </section>

    <section className={`hotels pageSection ${activePage === 'hotels' ? 'activePage' : ''}`} id="hotels">
      <h2>מלונות מומלצים לפי לילות</h2>
      <InfoCards items={pageEnhancements.hotels} />
      <div className="hotelGrid">
        {hotels.map(hotel => <article key={hotel.dates}>
          <p className="hotelDates">{hotel.dates}</p>
          <h3>{hotel.city}</h3>
          <span className="hotelArea">אזור מומלץ: {hotel.area}</span>
          <div className="hotelPick">הבחירה שלי: {hotel.pick}</div>
          <p>{hotel.why}</p>
          <ul>{hotel.alternatives.map(a => <li key={a}>{a}</li>)}</ul>
          <div className="hotelLinks">
            <a href={hotel.link} target="_blank" rel="noreferrer">קישור למלון <ExternalLink size={14}/></a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.pick)}`} target="_blank" rel="noreferrer">לפתוח במפות <ExternalLink size={14}/></a>
          </div>
        </article>)}
      </div>
    </section>

    <section className={`nearby pageSection ${activePage === 'nearby' ? 'activePage' : ''}`} id="nearby">
      <h2>מה יש ליד: אוכל, קפה, סושי וקניות</h2>
      <InfoCards items={pageEnhancements.nearby} />
      <div className="nearbyGrid">
        {nearbyGuide.map(area => <article key={area.area}>
          <p className="areaTag">{area.bestFor}</p>
          <h3>{area.area}</h3>
          <div className="nearbyColumns">
            <div><b>מסעדות</b>{area.restaurants.map(item => <a key={item} href={googleMapsSearchUrl(`${item} ${area.area} Japan`)} target="_blank" rel="noreferrer">{item} <ExternalLink size={12}/></a>)}</div>
            <div><b>סושי מסוע</b>{area.sushi.map(item => <a key={item} href={googleMapsSearchUrl(`${item} ${area.area} Japan`)} target="_blank" rel="noreferrer">{item} <ExternalLink size={12}/></a>)}</div>
            <div><b>סטארבקס / קפה</b>{area.coffee.map(item => <a key={item} href={googleMapsSearchUrl(`${item} ${area.area} Japan`)} target="_blank" rel="noreferrer">{item} <ExternalLink size={12}/></a>)}</div>
            <div><b>מרכולים וחנויות</b>{area.markets.map(item => <a key={item} href={googleMapsSearchUrl(`${item} ${area.area} Japan`)} target="_blank" rel="noreferrer">{item} <ExternalLink size={12}/></a>)}</div>
          </div>
        </article>)}
      </div>
    </section>

    <section className={`transfers pageSection ${activePage === 'transfers' ? 'activePage' : ''}`} id="transfers">
      <h2>דרכי הגעה וזמני נסיעה בין האזורים</h2>
      <InfoCards items={pageEnhancements.transfers} />
      <div className="transferGrid">
        {transfers.map((t, i) => <article key={i}>
          <div className="routeTitle"><strong>{t.from}</strong><span>←</span><strong>{t.to}</strong></div>
          <p>{t.route}</p>
          <b>{t.time}</b>
          <small>{t.note}</small>
        </article>)}
      </div>
    </section>

    <div className={`pageSection ${activePage === 'calculator' ? 'activePage' : ''}`}>
      <MoneyCalculator />
    </div>

    <footer>
      המחירים באתר הם מחירי תכנון עדכניים/מקובלים ביין ונועדו לבניית תקציב. לפני רכישה בפועל כדאי לאמת באתר הרשמי, במיוחד באטרקציות עם מחיר דינמי או הזמנה מוגבלת.
    </footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App />);
