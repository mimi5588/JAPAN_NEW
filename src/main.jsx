import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Clock, ExternalLink, MapPin, Ticket, Train, WalletCards } from 'lucide-react';
import './styles.css';

const places = [
  { id:'sensoji', city:'Tokyo', name:'מקדש סנסו־ג׳י ורובע אסאקוסה', lat:35.7148, lng:139.7967, price:'חינם', booking:'לא צריך', time:'1.5–2.5 ש׳', note:'לשלב עם Nakamise-dori, Sumida Park ושיטוט לכיוון הנהר.' },
  { id:'skytree', city:'Tokyo', name:'Tokyo Skytree + Solamachi', lat:35.7101, lng:139.8107, price:'בערך ¥2,100–¥3,400+ לפי קומבינציה/שעה', booking:'מומלץ להזמין מראש, במיוחד ערב/סופ״ש', time:'2–3 ש׳', note:'בערב יש תאורה יפה; ליד: Tokyo Solamachi, Sumida Aquarium.' },
  { id:'meiji', city:'Tokyo', name:'מקדש מייג׳י', lat:35.6764, lng:139.6993, price:'חינם', booking:'לא צריך', time:'1–1.5 ש׳', note:'לשלב עם Yoyogi Park, Takeshita Street, Omotesando.' },
  { id:'harajuku', city:'Tokyo', name:'הרג׳וקו ואומוטסנדו', lat:35.6717, lng:139.7064, price:'חינם', booking:'לא צריך', time:'2–3 ש׳', note:'אזור שלם לקניות, קרפים, בתי קפה וחנויות עיצוב.' },
  { id:'shibuya', city:'Tokyo', name:'מעבר שיבויה + Hachiko', lat:35.6595, lng:139.7005, price:'חינם', booking:'לא צריך', time:'1 ש׳', note:'שווה להגיע לפני Shibuya Sky ולתת זמן לשוטט.' },
  { id:'shibuyasky', city:'Tokyo', name:'Shibuya SKY בשקיעה', lat:35.6585, lng:139.7020, price:'מבוגר אונליין: כ־¥2,700 עד 14:59 / כ־¥3,400 מ־15:00', booking:'כן — להזמין מראש; שקיעה נחטפת מהר', time:'1.5–2 ש׳', note:'לכוון כניסה 60–90 דקות לפני שקיעה.' },
  { id:'tsukiji', city:'Tokyo', name:'שוק צוקיג׳י החיצוני', lat:35.6655, lng:139.7707, price:'חינם; אוכל בתשלום', booking:'לא צריך', time:'1.5–2 ש׳', note:'הכי טוב בבוקר. ליד: Hamarikyu Gardens.' },
  { id:'ginza', city:'Tokyo', name:'גינזה', lat:35.6719, lng:139.7650, price:'חינם', booking:'לא צריך', time:'1.5–2.5 ש׳', note:'קניות, Itoya, Uniqlo flagship, בתי קפה.' },
  { id:'pokemon', city:'Tokyo', name:'Pokémon Cafe Tokyo', lat:35.6811, lng:139.7740, price:'אין דמי כניסה; משלמים על אוכל/מרצ׳', booking:'חובה להזמין אונליין; זמינות משתנה לפי הודעות האתר', time:'1.5 ש׳', note:'נמצא ב־Nihombashi Takashimaya, קרוב ל־Tokyo Station.' },
  { id:'akihabara', city:'Tokyo', name:'אקיהברה', lat:35.6984, lng:139.7730, price:'חינם', booking:'לא צריך', time:'2–3 ש׳', note:'אנימה, גיימינג, אלקטרוניקה. ליד: Kanda Myojin Shrine.' },
  { id:'memorylane', city:'Tokyo', name:'Omoide Yokocho – סמטת הזיכרונות', lat:35.6938, lng:139.6990, price:'חינם; אוכל בתשלום', booking:'לא צריך', time:'1–1.5 ש׳', note:'ערב בשינג׳וקו. קרוב גם ל־Golden Gai.' },
  { id:'teamlab', city:'Tokyo', name:'teamLab Borderless – Azabudai Hills', lat:35.6602, lng:139.7409, price:'מבוגר החל מכ־¥3,600–¥3,800; מחיר דינמי', booking:'כן — מומלץ אונליין לשעה מוגדרת', time:'2–3 ש׳', note:'ליד: Azabudai Hills, מקדש Zojo-ji ומגדל טוקיו.' },
  { id:'odaiba', city:'Tokyo', name:'אודייבה', lat:35.6266, lng:139.7755, price:'חינם; אטרקציות בתשלום', booking:'לאזור לא צריך', time:'2–4 ש׳', note:'Rainbow Bridge, DiverCity Gundam, טיילת מפרץ טוקיו.' },
  { id:'tokyotower', city:'Tokyo', name:'מגדל טוקיו + מקדש Zojo-ji', lat:35.6586, lng:139.7454, price:'Main Deck לרוב סביב ¥1,500+', booking:'מומלץ מראש אם רוצים שעה מדויקת', time:'1.5–2 ש׳', note:'Zojo-ji חינמי ונמצא ממש ליד — שילוב מצוין לצילום ערב.' },
  { id:'ghibli', city:'Tokyo', name:'מוזיאון גיבלי, מיטקה', lat:35.6962, lng:139.5704, price:'מבוגר ¥1,000', booking:'חובה מראש בלבד; אין מכירה במקום', time:'2–3 ש׳', note:'לשלב עם Inokashira Park וקיצ׳יג׳וג׳י.' },
  { id:'nezu', city:'Tokyo', name:'מקדש נזו + Yanaka', lat:35.7202, lng:139.7609, price:'המקדש חינם; גן האזליות בפסטיבל סביב ¥500', booking:'לא צריך בדרך כלל', time:'2–3 ש׳', note:'פסטיבל האזליות לרוב באפריל; בנסיעה במאי כנראה אחרי השיא. לשלב עם Yanaka Ginza.' },
  { id:'gotokuji', city:'Tokyo', name:'מקדש גוטוקוג׳י, סטגאיה', lat:35.6470, lng:139.6470, price:'חינם', booking:'לא צריך', time:'1–1.5 ש׳', note:'מקדש חתולי המזל. ליד: Setagaya Hachimangu ו־Shimokitazawa בהמשך.' },
  { id:'hakoneashi', city:'Hakone', name:'אגם אשי + מקדש האקונה', lat:35.2048, lng:139.0255, price:'המקדש חינם; שייט/רכבלים בתשלום', booking:'מומלץ כרטיס תחבורה/Freepass', time:'3–4 ש׳', note:'אם מזג האוויר טוב אולי תראו את פוג׳י.' },
  { id:'hakoneopen', city:'Hakone', name:'המוזיאון הפתוח בהאקונה', lat:35.2447, lng:139.0508, price:'מבוגר סביב ¥2,000; אונליין לעיתים ¥1,800', booking:'מומלץ אונליין לחיסכון זמן/כסף', time:'1.5–3 ש׳', note:'פתוח לרוב 9:00–17:00, כניסה אחרונה 16:30.' },
  { id:'kiyomizu', city:'Kyoto', name:'קיומיזו־דרה + סאננזקה', lat:34.9949, lng:135.7850, price:'קיומיזו־דרה סביב ¥500', booking:'לא צריך', time:'3–4 ש׳', note:'לשלב עם Ninenzaka, Sannenzaka, Yasaka Pagoda.' },
  { id:'yasaka', city:'Kyoto', name:'מקדש יאסאקה, גיון ופונטוצ׳ו', lat:35.0036, lng:135.7786, price:'חינם', booking:'לא צריך', time:'3–4 ש׳', note:'אזור הערב הכי יפה בקיוטו.' },
  { id:'arashiyama', city:'Kyoto', name:'יער הבמבוק, יער הקימונו ונהר קאטסורה', lat:35.0172, lng:135.6720, price:'רוב האזור חינם; מקדשים בתשלום', booking:'לא צריך', time:'4–6 ש׳', note:'להגיע מוקדם. ליד: Tenryu-ji, Togetsukyo Bridge, % Arabica.' },
  { id:'fushimi', city:'Kyoto', name:'פושימי אינארי', lat:34.9671, lng:135.7727, price:'חינם', booking:'לא צריך', time:'2–3 ש׳', note:'עדיף מוקדם בבוקר לפני נארה.' },
  { id:'nara', city:'Nara', name:'פארק נארה ומקדש טודאי־ג׳י', lat:34.6889, lng:135.8398, price:'פארק חינם; Todai-ji סביב ¥800', booking:'לא צריך', time:'4–5 ש׳', note:'איילים, Daibutsu, Kasuga Taisha אם נשאר זמן.' },
  { id:'kinkakuji', city:'Kyoto', name:'מקדש הזהב – Kinkaku-ji', lat:35.0394, lng:135.7292, price:'סביב ¥500', booking:'לא צריך', time:'1–1.5 ש׳', note:'לפתוח איתו את יום צפון קיוטו.' },
  { id:'ryoanji', city:'Kyoto', name:'Ryoan-ji', lat:35.0345, lng:135.7183, price:'סביב ¥600', booking:'לא צריך', time:'1 ש׳', note:'גן הזן המפורסם, קרוב למקדש הזהב.' },
  { id:'nijo', city:'Kyoto', name:'טירת ניג׳ו', lat:35.0142, lng:135.7480, price:'סביב ¥1,300', booking:'מומלץ לבדוק שעות; לא חובה לרוב', time:'1.5–2 ש׳', note:'אחד המקומות ההיסטוריים החשובים בקיוטו.' },
  { id:'nishiki', city:'Kyoto', name:'שוק נישיקי', lat:35.0050, lng:135.7647, price:'חינם; אוכל בתשלום', booking:'לא צריך', time:'1.5–2 ש׳', note:'מעולה לסיום יום צפון קיוטו.' },
  { id:'tsutenkaku', city:'Osaka', name:'מגדל צוטנקאקו ושינסקאי', lat:34.6525, lng:135.5063, price:'תצפית סביב ¥1,000+', booking:'לא חובה', time:'2 ש׳', note:'אזור רטרו, Kushikatsu, Janjan Yokocho.' },
  { id:'kuromon', city:'Osaka', name:'שוק קורומון', lat:34.6646, lng:135.5063, price:'חינם; אוכל בתשלום', booking:'לא צריך', time:'1.5–2 ש׳', note:'לשלב עם Namba ו־Dotonbori.' },
  { id:'dotonbori', city:'Osaka', name:'שינסהיבאשי ודוטונבורי', lat:34.6687, lng:135.5010, price:'חינם', booking:'לא צריך', time:'3–4 ש׳', note:'Glico Man, אוכל רחוב, Hozenji Yokocho.' },
  { id:'shitennoji', city:'Osaka', name:'מקדש שיטנו־ג׳י', lat:34.6539, lng:135.5169, price:'חלקים חינם; גנים/אולמות סביב ¥300–¥500', booking:'לא צריך', time:'1–1.5 ש׳', note:'אחד המקדשים העתיקים ביפן.' },
  { id:'osakacastle', city:'Osaka', name:'טירת אוסקה', lat:34.6873, lng:135.5262, price:'מוזיאון הטירה סביב ¥600', booking:'לא חובה', time:'2–3 ש׳', note:'לשלב עם פארק הטירה.' },
  { id:'kaiyukan', city:'Osaka', name:'אקווריום קאיוקאן', lat:34.6545, lng:135.4289, price:'מבוגר סביב ¥2,700; בימים עמוסים יותר ייתכן ¥3,200–¥3,500', booking:'מומלץ להזמין מראש', time:'2–3 ש׳', note:'ליד: Tempozan Marketplace וגלגל ענק.' },
  { id:'umeda', city:'Osaka', name:'Umeda Sky Building', lat:34.7053, lng:135.4906, price:'Floating Garden סביב ¥2,000', booking:'מומלץ בערב/שקיעה', time:'1.5–2 ש׳', note:'סיום ערב יפה מעל העיר.' },
  { id:'himeji', city:'Himeji', name:'טירת הימג׳י', lat:34.8394, lng:134.6939, price:'טירה ¥1,000; טירה+קוקואן ¥1,050', booking:'לא חובה', time:'2–3 ש׳', note:'אחת הטירות המרשימות והשמורות ביפן.' },
  { id:'kokoen', city:'Himeji', name:'גני קוקואן', lat:34.8391, lng:134.6898, price:'¥310 לבד או קומבו עם הטירה', booking:'לא צריך', time:'1 ש׳', note:'ממש ליד הטירה — לא לדלג אם כבר שם.' }
];

const itinerary = [
  { day:1, date:'4.5', city:'טיסה', area:'ישראל → יפן', stay:'לילה בטיסה', items:['המראה 19:45 בערב', 'להכין הזמנות מודפסות/אופליין: גיבלי, פוקימון, שיבויה SKY, מלונות'] },
  { day:2, date:'5.5', city:'טוקיו', area:'נחיתה והתאקלמות', stay:'טוקיו · לילה 1 מתוך 5', items:['נחיתה ומעבר למלון', 'ערב קל בשינג׳וקו: Omoide Yokocho / Golden Gai אם יש כוח'] },
  { day:3, date:'6.5', city:'טוקיו', area:'אסאקוסה וסומידה', stay:'טוקיו', items:['מקדש סנסו־ג׳י ורובע אסאקוסה', 'Nakamise-dori ו־Sumida Park', 'Tokyo Skytree + Solamachi', 'מופעים/תאורה בערב באזור Skytree Town'] },
  { day:4, date:'7.5', city:'טוקיו', area:'הרג׳וקו ושיבויה', stay:'טוקיו', items:['מקדש מייג׳י ו־Yoyogi Park', 'הרג׳וקו: Takeshita + Omotesando', 'מעבר החצייה בשיבויה ו־Hachiko', 'Shibuya SKY בשקיעה — להזמין מראש'] },
  { day:5, date:'8.5', city:'טוקיו', area:'מרכז העיר', stay:'טוקיו', items:['שוק צוקיג׳י בבוקר', 'גינזה ו־Tokyo Station/Nihonbashi', 'Pokémon Cafe Tokyo — להזמין מראש', 'אקיהברה', 'Omoide Yokocho בערב אם לא עשיתם ביום הנחיתה'] },
  { day:6, date:'9.5', city:'טוקיו', area:'אודייבה ומינאטו', stay:'טוקיו', items:['teamLab Borderless באזאבודאי הילס', 'מקדש Zojo-ji ליד מגדל טוקיו', 'מגדל טוקיו לקראת ערב', 'אודייבה: טיילת, Gundam, Rainbow Bridge'] },
  { day:7, date:'10.5', city:'האקונה', area:'טיול יום מטוקיו', stay:'טוקיו', items:['נסיעה מוקדמת להאקונה', 'המוזיאון הפתוח', 'אגם אשי ומקדש האקונה', 'חזרה לטוקיו בערב'] },
  { day:8, date:'11.5', city:'קיוטו', area:'מזרח קיוטו', stay:'קיוטו · לילה 1 מתוך 4', items:['שינקנסן מטוקיו לקיוטו', 'קיומיזו־דרה', 'סאננזקה/ניננזקה', 'מקדש יאסאקה, גיון ופונטוצ׳ו בערב'] },
  { day:9, date:'12.5', city:'קיוטו', area:'אראשיאמה', stay:'קיוטו', items:['יער הבמבוק מוקדם', 'יער הקימונו בתחנת Randen Arashiyama', 'נהר קאטסורה וגשר Togetsukyo', 'אופציה: Tenryu-ji / Monkey Park'] },
  { day:10, date:'13.5', city:'קיוטו + נארה', area:'פושימי ונארה', stay:'קיוטו', items:['פושימי אינארי מוקדם', 'רכבת לנארה', 'פארק נארה', 'מקדש Todai-ji', 'חזרה לקיוטו'] },
  { day:11, date:'14.5', city:'קיוטו', area:'צפון קיוטו', stay:'קיוטו', items:['מקדש הזהב Kinkaku-ji', 'Ryoan-ji', 'טירת ניג׳ו', 'שוק נישיקי לקראת ערב'] },
  { day:12, date:'15.5', city:'אוסקה', area:'שינסקאי ונאמבה', stay:'אוסקה · לילה 1', items:['מעבר מקיוטו לאוסקה', 'מגדל צוטנקאקו ושינסקאי', 'שוק קורומון', 'שינסהיבאשי ודוטונבורי בערב'] },
  { day:13, date:'16.5', city:'אוסקה → טוקיו → נריטה', area:'בוקר אוסקה וחזרה', stay:'טיסה', items:['אם יש זמן קצר: שיטנו־ג׳י או טירת אוסקה בלבד', 'חלופה אם נשארים עוד יום: קאיוקאן + Umeda Sky', 'שינקנסן לטוקיו ומשם Narita Express', 'להגיע לנריטה סביב 16:55 לטיסה ב־19:55'] }
];

const extras = [
  { city:'טוקיו', title:'יום בונוס/החלפה', text:'מוזיאון גיבלי + Inokashira Park + Kichijoji, מקדש נזו + Yanaka Ginza, גוטוקוג׳י + Shimokitazawa. אלו לא נכנסים בנוחות אם מתעקשים גם על האקונה בתוך 5 ימי טוקיו, אז שמתי אותם במפה כנקודות להחלפה.' },
  { city:'אוסקה', title:'אם מוסיפים עוד יום מלא', text:'שיטנו־ג׳י → טירת אוסקה → Kaiyukan/Tempozan → Umeda Sky בערב. יום הימג׳י: טירת הימג׳י + גני קוקואן, ועדיף לא לשלב בו את סנסו־ג׳י כי הוא בטוקיו.' },
  { city:'קיוטו', title:'קצב מומלץ', text:'4 ימים בקיוטו זה מצוין. פושימי+נארה באותו יום עובד, אבל להתחיל מוקדם כדי לא להיתקע בעומס.' }
];

function googleMapsUrl(place){ return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`; }
function osmEmbed(place){ return `https://www.openstreetmap.org/export/embed.html?bbox=${place.lng-0.018}%2C${place.lat-0.012}%2C${place.lng+0.018}%2C${place.lat+0.012}&layer=mapnik&marker=${place.lat}%2C${place.lng}`; }

function App(){
  const [selectedId, setSelectedId] = useState('shibuyasky');
  const [filter, setFilter] = useState('הכל');
  const selected = places.find(p => p.id === selectedId) ?? places[0];
  const filtered = useMemo(() => filter === 'הכל' ? places : places.filter(p => p.city === filter), [filter]);
  const cities = ['הכל', ...Array.from(new Set(places.map(p => p.city)))];

  return <main>
    <section className="hero">
      <div>
        <p className="eyebrow">יפן · 4.5–16.5 · 12 ימים</p>
        <h1>מסלול יפן אינטראקטיבי עם מפה, מחירים והזמנות מראש</h1>
        <p className="lead">טוקיו, האקונה, קיוטו, נארה ואוסקה — עם כל המקומות שביקשת, כולל שכונות ומקומות קרובים ששווה להוסיף כשכבר נמצאים באזור.</p>
      </div>
      <div className="heroCard">
        <span><CalendarDays size={18}/> 5 לילות טוקיו</span>
        <span><Train size={18}/> 4 לילות קיוטו</span>
        <span><MapPin size={18}/> אוסקה קצרה + חלופות</span>
      </div>
    </section>

    <section className="notice">
      <b>הערת תכנון חשובה:</b> כדי להכניס 5 ימי טוקיו + 4 ימי קיוטו + אוסקה בתוך חלון הטיסות, אוסקה יוצאת צפופה. לכן הוספתי באתר גם “חלופות/אם מוסיפים יום” עבור קאיוקאן, Umeda Sky והימג׳י.
    </section>

    <section className="layout">
      <aside className="itinerary">
        <h2>המסלול לפי ימים</h2>
        {itinerary.map(day => <article className="day" key={day.day}>
          <div className="dayTop"><span>יום {day.day}</span><strong>{day.date}</strong></div>
          <h3>{day.city}</h3>
          <p>{day.area} · {day.stay}</p>
          <ul>{day.items.map((item,i)=><li key={i}>{item}</li>)}</ul>
        </article>)}
      </aside>

      <section className="mapPanel">
        <div className="toolbar">
          <h2>מפת המקומות</h2>
          <select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="סינון עיר">
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <iframe className="map" title={`מפה: ${selected.name}`} src={osmEmbed(selected)} loading="lazy"></iframe>
        <div className="selectedCard">
          <p className="city">{selected.city}</p>
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
          {filtered.map(place => <button key={place.id} onClick={()=>setSelectedId(place.id)} className={place.id===selected.id ? 'active' : ''}>
            <span>{place.city}</span>{place.name}
          </button>)}
        </div>
      </section>
    </section>

    <section className="extras">
      <h2>תוספות חכמות ליד המקומות שביקשת</h2>
      <div className="extraGrid">
        {extras.map(e => <article key={e.title}><p>{e.city}</p><h3>{e.title}</h3><span>{e.text}</span></article>)}
      </div>
    </section>

    <footer>
      המחירים באתר הם מחירי תכנון עדכניים/מקובלים ביין ונועדו לבניית תקציב. לפני רכישה בפועל כדאי לאמת באתר הרשמי, במיוחד באטרקציות עם מחיר דינמי או הזמנה מוגבלת.
    </footer>
  </main>
}

createRoot(document.getElementById('root')).render(<App />);
