
import React, { useState, useEffect, useRef } from 'react';
import { Language, Service, PricingItem, ChatMessage } from './types';
import { askAssistant, generateLogoConcepts } from './services/geminiService';

// --- KONFIGURACE OBSAHU ---
const SITE_CONTENT = {
  cz: {
    companyName: 'PRENAS INVERSIONES S.L.',
    heroTitle: 'Váš partner pro reality ve Španělsku',
    heroSub: 'Pomohu vám zorientovat se v procesu nákupu ve Španělsku, pohlídám průběh a propojím vás s prověřenými místními partnery.',
    roleTitle: 'Moje role',
    roleIntro: 'Vystupuji jako nezávislý průvodce a asistenční podpora českého klienta při koupi nemovitosti ve Španělsku.',
    roleDisclaimer: 'Nejsem realitní agent, právník, notář ani daňový poradce. Neposkytuji právní, daňové ani technické poradenství a nenahrazuji práci odborníků.',
    roleTasks: [
      'Vysvětlovat proces koupě a místní zvyklosti',
      'Pomáhat s orientací v dokumentech a postupech',
      'Upozorňovat na typická rizika a časté chyby',
      'Koordinovat komunikaci s realitní kanceláří a odborníky',
      'Doprovázet Vás při jednáních a schůzkách'
    ],
    roleFooter: 'Veškerá konečná rozhodnutí činíte vždy Vy jako klient.',
    aboutTitle: 'Naše činnost',
    aboutText: 'Specializujeme se na asistenci českým klientům, kteří hledají bezpečné investice nebo druhý domov ve Španělsku. Rozumíme místnímu trhu, byrokracii i specifikům španělského bankovního sektoru.',
    servicesTitle: 'Služby a poradenství',
    pricingTitle: 'Ceník asistenčních služeb',
    pricingSub: 'Veškeré služby jsou hrazeny výhradně klientem, bez provizí a skrytých odměn.',
    maintenanceTitle: 'Pravidelná kontrola nemovitosti',
    maintenanceSub: 'Služba je určena pro klienty, kteří nemovitost nevyužívají celoročně.',
    faqTitle: 'Často kladené dotazy',
    faqSub: 'Transparentní odpovědi na vaše nejčastější otázky.',
    logoStudioTitle: 'Design Brandu',
    logoStudioSub: 'Prozkoumejte koncepty loga pro PRENAS INVERSIONES vygenerované naší AI.',
    generateBtn: 'Generovat koncepty loga',
    contactTitle: 'Kontaktujte nás',
    ctaConsult: 'Bezplatná konzultace',
    send: 'Odeslat dotaz',
  },
  es: {
    companyName: 'PRENAS INVERSIONES S.L.',
    heroTitle: 'Su socio inmobiliario en España',
    heroSub: 'Le ayudaré a orientarse en el proceso de compra en España, supervisaré el progreso y le conectaré con socios locales verificados.',
    roleTitle: 'Mi función',
    roleIntro: 'Actúo como guía independiente y apoyo de asistencia para el cliente checo al comprar una propiedad en España.',
    roleDisclaimer: 'No soy agente inmobiliario, abogado, notario ni asesor fiscal. No proporciono asesoramiento legal, fiscal o técnico y no sustituyo el trabajo de expertos.',
    roleTasks: [
      'Explicar el proceso de compra y las costumbres locales',
      'Ayudar con la orientación en documentos y procedimientos',
      'Advertir sobre riesgos típicos y errores frecuentes',
      'Coordinar la comunicación con la inmobiliaria y los expertos',
      'Acompañarle en negociaciones y reuniones'
    ],
    roleFooter: 'Todas las decisiones finales las toma siempre usted como cliente.',
    aboutTitle: 'Nuestra actividad',
    aboutText: 'Nos especializamos en asistir a clientes checos que buscan inversiones seguras o una segunda residencia en España. Entendemos el mercado local, la burocracia y las especificidades del sector bancario español.',
    servicesTitle: 'Servicios y consultoría',
    pricingTitle: 'Tarifas de servicios de asistencia',
    pricingSub: 'Todos los servicios son pagados exclusivamente por el cliente, sin comisiones ni recompensas ocultas.',
    maintenanceTitle: 'Control periódico de la propiedad',
    maintenanceSub: 'El servicio está destinado a clientes que no utilizan la propiedad durante todo el año.',
    faqTitle: 'Preguntas frecuentes',
    faqSub: 'Respuestas transparentes a sus preguntas más comunes.',
    logoStudioTitle: 'Estudio de Marca',
    logoStudioSub: 'Explore conceptos de logo para PRENAS INVERSIONES generados por nuestra IA.',
    generateBtn: 'Generar conceptos de logo',
    contactTitle: 'Contáctenos',
    ctaConsult: 'Consulta gratuita',
    send: 'Enviar consulta',
  }
};

const FAQ_DATA = [
  {
    cz: { q: 'Jste realitní agent?', a: 'Ne. Nezprostředkovávám prodej ani nepřijímám provize od prodejců. Moje loajalita patří výhradně vám.' },
    es: { q: '¿Es usted agente inmobiliario?', a: 'No. No intermedio en ventas ni acepto comisiones de los vendedores. Mi lealtad le pertenece exclusivamente a usted.' }
  },
  {
    cz: { q: 'Ručíte za právní stav nemovitosti?', a: 'Ne. Právní kontrolu provádí výhradně právník klienta. Já pomáhám s koordinací a orientací v dokumentech.' },
    es: { q: '¿Garantiza el estado legal de la propiedad?', a: 'No. La revisión legal la realiza exclusivamente el abogado del cliente. Yo ayudo con la coordinación y orientación en los documentos.' }
  },
  {
    cz: { q: 'Můžete mi potvrdit, že je nemovitost „v pořádku“?', a: 'Ne. Mohu upozornit na běžná rizika na základě zkušeností, nikoli však nahradit odborný technický posudek.' },
    es: { q: '¿Puede confirmarme que la propiedad está "en orden"?', a: 'No. Puedo advertir sobre riesgos comunes basados en mi experiencia, pero no sustituir una peritación técnica profesional.' }
  },
  {
    cz: { q: 'Pomůžete mi vyjednat cenu?', a: 'Mohu pomoci s orientací v místních zvyklostech a argumentací, nikoli však jednat přímo vaším jménem nebo garantovat výsledek.' },
    es: { q: '¿Me ayudará a negociar el precio?', a: 'Puedo orientarle sobre las costumbres locales y la argumentación, pero no negociar directamente en su nombre ni garantizar un resultado.' }
  },
  {
    cz: { q: 'Proč potřebuji právníka, když je u prodeje notář?', a: 'Notář ve Španělsku neprovádí hloubkovou kontrolu a nechrání jednostranně kupujícího. Právník je pro bezpečnost nezbytný.' },
    es: { q: '¿Por qué necesito un abogado si hay un notario en la venta?', a: 'El notario en España no realiza una revisión exhaustiva ni protege unilateralmente al comprador. El abogado es esencial para la seguridad.' }
  },
  {
    cz: { q: 'Je turistický pronájem legální?', a: 'Pouze s platnou licencí, kterou vydává příslušný úřad. Bez ní hrozí velmi vysoké pokuty a restrikce.' },
    es: { q: '¿Es legal el alquiler turístico?', a: 'Solo con una licencia válida emitida por la autoridad competente. Sin ella, existen riesgos de multas muy altas y restricciones.' }
  },
  {
    cz: { q: 'Co když se obchod nakonec neuskuteční?', a: 'Moje odměna je účtována za poskytnutou asistenci a čas věnovaný procesu, nikoli za samotné dokončení nákupu.' },
    es: { q: '¿Qué pasa si la transacción finalmente no se realiza?', a: 'Mi remuneración se cobra por la asistencia brindada y el tiempo dedicado al proceso, no por la finalización de la compra en sí.' }
  }
];

const LogoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 20H80V80H20V20Z" fill="white" fillOpacity="0.05"/>
    <path d="M50 10L90 40V85H10V40L50 10Z" stroke="#c5a059" strokeWidth="4"/>
    <path d="M40 85V55H60V85" stroke="#c5a059" strokeWidth="4"/>
    <text x="50" y="42" fill="#c5a059" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="Arial">P</text>
    <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="1" strokeOpacity="0.1"/>
  </svg>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('cz');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [generatedLogos, setGeneratedLogos] = useState<string[]>([]);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = SITE_CONTENT[lang];

  const services: Service[] = [
    { 
      title: lang === 'cz' ? 'Poradenství' : 'Consultoría', 
      description: lang === 'cz' 
        ? 'Poradenství při koupi nemovitosti ve Španělsku - od prvního zájmu až k zápisu do listu vlastnictví.' 
        : 'Asesoramiento en la compra de propiedades en España, desde el interés inicial hasta la inscripción en el registro de la propiedad.', 
      icon: 'fa-comments-dollar' 
    },
    { 
      title: lang === 'cz' ? 'Pravidelný dohled' : 'Supervisión periódica', 
      description: lang === 'cz' 
        ? 'Pravidelný fyzický dohled nad nemovitosti v době vaší nepřítomnosti. Například kontrola po prudkém dešti nebo nepřízni počasí.' 
        : 'Supervisión física periódica de la propiedad durante su ausencia. Por ejemplo, inspección tras fuertes lluvias o inclemencias del tiempo.', 
      icon: 'fa-shield-heart' 
    },
    { 
      title: lang === 'cz' ? 'Kde působím' : 'Dónde opero', 
      description: lang === 'cz' 
        ? 'Dlouhodobě působím v oblasti Dénia, Costa Blanca, ve spolupráci s regionálními poskytovateli služeb.' 
        : 'Opero a largo plazo en la zona de Dénia, Costa Blanca, en colaboración con proveedores de servicios regionales.', 
      icon: 'fa-map-location-dot' 
    },
  ];

  const acquisitionPricing: PricingItem[] = [
    { 
      name: lang === 'cz' ? 'Konzultace a orientace' : 'Consulta y orientación', 
      price: '90 € / hod', 
      features: lang === 'cz' 
        ? ['Pomoc s orientací v procesu', 'Vysvětlení místních zvyklostí', 'Analýza dokumentů'] 
        : ['Ayuda con la orientación del proceso', 'Explicación de costumbres locales', 'Análisis de documentos'] 
    },
    { 
      name: lang === 'cz' ? 'Doprovod a jednání' : 'Acompañamiento', 
      price: '90 € / 350 €+', 
      features: lang === 'cz' 
        ? ['90 € / hodina', '350 – 600 € / den', 'Doprovod při jednáních', 'Kontrola na místě'] 
        : ['90 € / hora', '350 – 600 € / día', 'Acompañamiento en reuniones', 'Control in situ'] 
    },
    { 
      name: lang === 'cz' ? 'Paušální asistence' : 'Asistencia global', 
      price: '800 – 1.500 €', 
      features: lang === 'cz' 
        ? ['Komplexní koordinace nákupu', 'Upozornění na rizika', 'Bez právních/tech. služeb', 'Prověřování nemovitosti'] 
        : ['Coordinación integral de compra', 'Advertencia sobre riesgos', 'Sin servicios legales/técnicos', 'Verificación de propiedad'] 
    },
  ];

  const maintenancePricing: PricingItem[] = [
    { 
      name: lang === 'cz' ? 'ZÁKLAD' : 'BÁSICO', 
      price: '60 € / měs', 
      features: lang === 'cz' 
        ? ['1× měsíčně návštěva', 'Vyvětrání objektu', 'Vizuální kontrola stavu', 'Kontrola vody a el.', 'Stručný report'] 
        : ['1 visita al mes', 'Ventilación del objeto', 'Control visual del estado', 'Control de agua y luz', 'Informe breve'] 
    },
    { 
      name: lang === 'cz' ? 'STANDARD' : 'ESTÁNDAR', 
      price: '110 € / měs', 
      features: lang === 'cz' 
        ? ['2× měsíčně návštěva', 'Vše ze ZÁKLADU', 'Kontrola po nepřízni počasí', 'Komunikace s domovní správou'] 
        : ['2 visitas al mes', 'Todo lo del BÁSICO', 'Control tras mal tiempo', 'Comunicación con la administración'] 
    },
    { 
      name: lang === 'cz' ? 'PREMIUM' : 'PREMIUM', 
      price: '190 € / měs', 
      features: lang === 'cz' 
        ? ['1× týdně návštěva', 'Pravidelné fyzické kontroly', 'Prioritní výjezd po bouřce', 'Koordinace techniků'] 
        : ['1 visita por semana', 'Controles físicos regulares', 'Salida prioritaria tras tormenta', 'Coordinación de técnicos'] 
    },
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const result = await askAssistant(userMsg, history, lang);
      setMessages(prev => [...prev, { role: 'model', text: result.text, sources: result.sources }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Chyba spojení. / Error de conexión.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateLogo = async () => {
    setIsGeneratingLogo(true);
    try {
      const logoUrl = await generateLogoConcepts(t.companyName);
      setGeneratedLogos(prev => [logoUrl, ...prev].slice(0, 4));
    } catch (error) {
      console.error("Logo generation failed", error);
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  return (
    <div className="bg-[#020617] text-slate-200 min-h-screen font-sans">
      {/* HEADER */}
      <nav className="fixed w-full z-50 glass-panel border-b border-white/5 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="#hero" className="flex items-center gap-4 group cursor-pointer">
            <div className="h-12 w-12 flex items-center justify-center transition-transform group-hover:scale-110">
               <LogoIcon className="w-full h-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tighter text-xl leading-none text-white">PRENAS</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#c5a059] font-bold">Inversiones S.L.</span>
            </div>
          </a>
          
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <a href="#role" className="hover:text-[#c5a059] transition-colors">{t.roleTitle}</a>
            <a href="#services" className="hover:text-[#c5a059] transition-colors">{t.servicesTitle}</a>
            <a href="#pricing" className="hover:text-[#c5a059] transition-colors">{t.pricingTitle}</a>
            <a href="#faq" className="hover:text-[#c5a059] transition-colors">{t.faqTitle}</a>
            <a href="#branding" className="hover:text-[#c5a059] transition-colors">{t.logoStudioTitle}</a>
            <a href="#contact" className="hover:text-[#c5a059] transition-colors">{t.contactTitle}</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
              <button onClick={() => setLang('cz')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'cz' ? 'bg-[#c5a059] text-black' : 'text-slate-500 hover:text-slate-300'}`}>CZ</button>
              <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'es' ? 'bg-[#c5a059] text-black' : 'text-slate-500 hover:text-slate-300'}`}>ES</button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-48 pb-32 px-6">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1543059152-4293eef687ca?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#020617]/80 via-[#020617] to-[#020617]"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-1 mb-6 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-bold uppercase tracking-widest">
            Expertíza v oblasti Dénia & Costa Blanca
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 text-white leading-none">
            {t.heroTitle}
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            {t.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="px-10 py-5 bg-[#c5a059] text-black rounded-full font-black hover:bg-[#d4b47a] transition-all shadow-xl shadow-[#c5a059]/10 text-center uppercase text-xs tracking-widest">
              {t.ctaConsult}
            </a>
            <a href="#pricing" className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all text-center uppercase text-xs tracking-widest">
              {t.pricingTitle}
            </a>
          </div>
        </div>
      </section>

      {/* MOJE ROLE SECTION */}
      <section id="role" className="py-24 px-6 border-y border-white/5 bg-[#030816]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="flex-1">
              <h2 className="text-[#c5a059] text-xs font-bold uppercase tracking-[0.3em] mb-4">{t.roleTitle}</h2>
              <h3 className="text-4xl font-black mb-8 text-white tracking-tight leading-tight">{t.roleIntro}</h3>
              <div className="p-8 bg-white/5 rounded-3xl border border-[#c5a059]/20 mb-8 italic text-slate-400 text-sm leading-relaxed">
                <i className="fas fa-info-circle text-[#c5a059] mr-2"></i> {t.roleDisclaimer}
              </div>
              <p className="text-slate-300 font-bold mb-6">{lang === 'cz' ? 'Mou úlohou je:' : 'Mi función es:'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {t.roleTasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-slate-400">
                    <i className="fas fa-check-circle text-[#c5a059] opacity-70"></i> {task}
                  </div>
                ))}
              </div>
              <p className="mt-10 pt-6 border-t border-white/5 text-[#c5a059] font-black text-xs uppercase tracking-widest">{t.roleFooter}</p>
            </div>
            <div className="lg:w-1/3 w-full">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-br from-[#c5a059]/40 to-transparent rounded-[2.5rem] blur-xl opacity-50"></div>
                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border border-white/10">
                  <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" alt="Consultation" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[#c5a059] text-xs font-bold uppercase tracking-[0.3em] mb-4">{t.servicesTitle}</h2>
            <h3 className="text-5xl font-black text-white tracking-tighter">{lang === 'cz' ? 'Profesionální péče' : 'Cuidado profesional'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((s, idx) => (
              <div key={idx} className="bg-white/[0.02] p-12 rounded-[2.5rem] border border-white/5 hover:border-[#c5a059]/40 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-bl-full translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-black transition-all">
                  <i className={`fas ${s.icon} text-3xl`}></i>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-light">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING - ASISTENCE */}
      <section id="pricing" className="py-24 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[#c5a059] text-xs font-bold uppercase tracking-[0.3em] mb-4">{t.pricingTitle}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto mt-4 font-medium italic">{t.pricingSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
            {acquisitionPricing.map((p, idx) => (
              <div key={idx} className={`relative p-px rounded-[3rem] ${idx === 2 ? 'bg-gradient-to-br from-[#c5a059] to-[#8a6d3b]' : 'bg-white/10'}`}>
                <div className="bg-[#020617] rounded-[2.9rem] p-10 h-full flex flex-col">
                  <h4 className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.3em] mb-4">{p.name}</h4>
                  <div className="text-3xl font-black text-white mb-8 tracking-tighter">{p.price}</div>
                  <div className="h-px bg-white/5 mb-8 w-full"></div>
                  <ul className="space-y-4 mb-10 flex-1">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-400 text-xs font-medium">
                        <i className="fas fa-check text-[#c5a059] mt-1 shrink-0"></i> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className={`w-full py-4 rounded-2xl font-bold transition-all uppercase text-[10px] text-center tracking-widest ${idx === 2 ? 'bg-[#c5a059] text-black hover:bg-white' : 'border border-white/10 text-white hover:bg-white/5'}`}>
                    {lang === 'cz' ? 'Poptat službu' : 'Solicitar'}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* PRICING - KONTROLA NEMOVITOSTI */}
          <div className="text-center mb-20">
            <h2 className="text-[#c5a059] text-xs font-bold uppercase tracking-[0.3em] mb-4">{t.maintenanceTitle}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto mt-4 font-medium italic">{t.maintenanceSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {maintenancePricing.map((p, idx) => (
              <div key={idx} className={`relative p-px rounded-[3rem] ${idx === 1 ? 'bg-gradient-to-br from-[#c5a059] to-[#8a6d3b]' : 'bg-white/10'}`}>
                <div className="bg-[#020617] rounded-[2.9rem] p-10 h-full flex flex-col">
                  <h4 className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.3em] mb-4">{p.name}</h4>
                  <div className="text-3xl font-black text-white mb-8 tracking-tighter">{p.price}</div>
                  <div className="h-px bg-white/5 mb-8 w-full"></div>
                  <ul className="space-y-4 mb-10 flex-1">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-400 text-xs font-medium">
                        <i className="fas fa-check text-[#c5a059] mt-1 shrink-0"></i> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#contact" className={`w-full py-4 rounded-2xl font-bold transition-all uppercase text-[10px] text-center tracking-widest ${idx === 1 ? 'bg-[#c5a059] text-black hover:bg-white' : 'border border-white/10 text-white hover:bg-white/5'}`}>
                    {lang === 'cz' ? 'Mám zájem' : 'Me interesa'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 bg-[#030816]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[#c5a059] text-xs font-bold uppercase tracking-[0.3em] mb-4">{t.faqTitle}</h2>
            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">{t.faqSub}</h3>
          </div>
          <div className="space-y-4">
            {FAQ_DATA.map((item, idx) => (
              <div key={idx} className="border border-white/5 bg-white/[0.02] rounded-3xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-lg font-bold text-slate-200">{item[lang].q}</span>
                  <i className={`fas fa-chevron-down text-[#c5a059] transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}></i>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === idx ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-8 pb-8 text-slate-400 leading-relaxed font-light">
                    {item[lang].a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOGO STUDIO SECTION */}
      <section id="branding" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c5a059]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[#c5a059] text-xs font-bold uppercase tracking-[0.3em] mb-4">{t.logoStudioTitle}</h2>
            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">{t.logoStudioSub}</h3>
          </div>
          
          <div className="flex flex-col items-center">
            <button 
              onClick={handleGenerateLogo}
              disabled={isGeneratingLogo}
              className={`px-12 py-5 bg-[#c5a059] text-black rounded-full font-black shadow-2xl hover:bg-white transition-all uppercase text-xs tracking-widest flex items-center gap-3 ${isGeneratingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGeneratingLogo ? (
                <><i className="fas fa-circle-notch animate-spin"></i> Navrhuji...</>
              ) : (
                <><i className="fas fa-magic"></i> {t.generateBtn}</>
              )}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 w-full">
              {generatedLogos.map((url, i) => (
                <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden group relative shadow-2xl">
                   <img src={url} alt={`Logo Concept ${i}`} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={url} download={`prenas-logo-${i}.png`} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <i className="fas fa-download"></i>
                      </a>
                   </div>
                </div>
              ))}
              {!isGeneratingLogo && generatedLogos.length === 0 && Array.from({length: 4}).map((_, i) => (
                <div key={i} className="aspect-square border border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-slate-700 bg-white/[0.01]">
                   <i className="fas fa-image text-3xl mb-4 opacity-10"></i>
                   <span className="text-[10px] uppercase font-bold tracking-widest opacity-10">Concept {i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-[#c5a059] rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row gap-16 items-start text-black relative overflow-hidden shadow-2xl shadow-[#c5a059]/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="flex-1 relative z-10 w-full">
            <h2 className="text-5xl font-black mb-6 leading-none tracking-tight">{t.contactTitle}</h2>
            <p className="text-black/70 font-medium mb-10">
              {lang === 'cz' ? 'Zanechte nám vzkaz a my se vám ozveme zpět do 24 hodin.' : 'Déjenos un mensaje y le responderemos en 24 horas.'}
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <div className="font-black text-xs uppercase tracking-widest mb-1">Sídlo společnosti</div>
                  <div className="text-sm font-bold opacity-80 leading-relaxed">
                    PRENAS INVERSIONES S.L.<br />
                    Calle Deimos 1<br />
                    03700 Dénia, Spain
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fas fa-phone"></i>
                </div>
                <div>
                  <div className="font-black text-xs uppercase tracking-widest mb-1">Telefon</div>
                  <a href="tel:+34642447942" className="text-sm font-bold opacity-80 hover:opacity-100 transition-opacity">+34 642 447 942</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <div className="font-black text-xs uppercase tracking-widest mb-1">E-mail</div>
                  <a href="mailto:info@prenasinversiones.com" className="text-sm font-bold opacity-80 hover:opacity-100 transition-opacity">info@prenasinversiones.com</a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full space-y-4 relative z-10 bg-black/5 p-8 rounded-[2rem] border border-black/10">
            <input type="text" placeholder={lang === 'cz' ? 'Vaše jméno' : 'Su nombre'} className="w-full bg-white/10 border border-black/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-black placeholder:text-black/30 font-bold" />
            <input type="email" placeholder="Email" className="w-full bg-white/10 border border-black/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-black placeholder:text-black/30 font-bold" />
            <textarea placeholder={lang === 'cz' ? 'Vaše zpráva...' : 'Su mensaje...'} className="w-full bg-white/10 border border-black/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-black placeholder:text-black/30 font-bold h-32 resize-none"></textarea>
            <button className="w-full py-5 bg-black text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl uppercase text-xs tracking-[0.2em]">
              {t.send}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-6">
           <a href="#hero" className="h-16 w-16 transition-transform hover:scale-110 cursor-pointer">
               <LogoIcon className="w-full h-full" />
           </a>
           <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">© 2025 {SITE_CONTENT[lang].companyName}</p>
           <div className="flex gap-8 text-slate-600 text-sm font-bold uppercase tracking-widest">
             <span>Dénia</span>
             <span>Costa Blanca</span>
             <span>Prague</span>
           </div>
           <a href="#hero" className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] hover:text-white transition-colors cursor-pointer">
              <i className="fas fa-arrow-up mr-2"></i> Zpět nahoru
           </a>
        </div>
      </footer>

      {/* CHAT AI */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {!isChatOpen ? (
          <button onClick={() => setIsChatOpen(true)} className="w-16 h-16 bg-[#c5a059] text-black rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-all border-4 border-[#020617]">
            <i className="fas fa-comment-dots"></i>
          </button>
        ) : (
          <div className="w-[380px] h-[580px] bg-[#0d1117] border border-white/10 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6">
            <div className="p-6 bg-[#c5a059] flex justify-between items-center text-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center"><i className="fas fa-robot text-lg"></i></div>
                <div>
                  <div className="font-black text-xs uppercase tracking-widest leading-none">PRENAS AI</div>
                  <div className="text-[10px] opacity-70 font-bold">Investiční asistent</div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-black hover:opacity-50"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide bg-[#0b0e14]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium shadow-sm ${m.role === 'user' ? 'bg-[#c5a059] text-black rounded-tr-none' : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'}`}>
                    {m.text}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="text-[9px] uppercase font-black tracking-widest mb-2 opacity-50">Zdroje dat:</div>
                        {m.sources.map((s: any, si: number) => s.web && (
                          <a key={si} href={s.web.uri} target="_blank" rel="noreferrer" className="block text-[#c5a059] truncate hover:underline mb-1 font-bold">
                             <i className="fas fa-link mr-1 opacity-50"></i> {s.web.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[#c5a059] animate-pulse text-[10px] font-black uppercase tracking-widest ml-1">Analyzuji data...</div>}
              <div ref={chatEndRef}></div>
            </div>
            <div className="p-5 bg-[#0d1117] border-t border-white/5">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={lang === 'cz' ? 'Napište dotaz...' : 'Escriba su duda...'}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#c5a059] transition-all text-white placeholder:text-slate-600 font-medium"
                />
                <button onClick={handleSendMessage} className="w-14 h-14 bg-[#c5a059] text-black rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"><i className="fas fa-arrow-up"></i></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
