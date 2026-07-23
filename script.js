/* ==========================================================================
   COMPLETE SCRIPT - NOOR AL-WASAT MEDICAL LABORATORY
   Designed & Developed by Programmer Mohammed Wael
   Canvas Image Ticket | Three.js DNA BG | Leaflet Maps | Booking Flow
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCalm3DCanvas();
    initCustomCursor();
    initMaps();
    renderTestsGrid();
    initMobileNav();
    setDefaultBookingDate();
    initScrollEffects();
});

/* ==========================================
   1. THREE.JS 3D BACKGROUND (DNA + SPHERES)
   ========================================== */
let scene, camera, renderer, dnaMesh, spheresGroup;
let mouseX = 0, mouseY = 0;

function initCalm3DCanvas() {
    const canvas = document.getElementById('canvas3d');
    if (!canvas || typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // DNA Helix
    const dnaCount = 75;
    const dnaGeo = new THREE.BufferGeometry();
    const dnaPos = new Float32Array(dnaCount * 3);
    for (let i = 0; i < dnaCount; i++) {
        const t = (i / dnaCount) * Math.PI * 6;
        dnaPos[i * 3]     = Math.sin(t) * 5 + 15;
        dnaPos[i * 3 + 1] = (i - dnaCount / 2) * 0.7;
        dnaPos[i * 3 + 2] = Math.cos(t) * 5;
    }
    dnaGeo.setAttribute('position', new THREE.BufferAttribute(dnaPos, 3));
    dnaMesh = new THREE.Points(dnaGeo, new THREE.PointsMaterial({ size: 0.85, color: 0x0d9488, transparent: true, opacity: 0.7 }));
    scene.add(dnaMesh);

    // Second helix (offset)
    const dna2Geo = new THREE.BufferGeometry();
    const dna2Pos = new Float32Array(dnaCount * 3);
    for (let i = 0; i < dnaCount; i++) {
        const t = (i / dnaCount) * Math.PI * 6 + Math.PI;
        dna2Pos[i * 3]     = Math.sin(t) * 5 + 15;
        dna2Pos[i * 3 + 1] = (i - dnaCount / 2) * 0.7;
        dna2Pos[i * 3 + 2] = Math.cos(t) * 5;
    }
    dna2Geo.setAttribute('position', new THREE.BufferAttribute(dna2Pos, 3));
    scene.add(new THREE.Points(dna2Geo, new THREE.PointsMaterial({ size: 0.6, color: 0x0284c7, transparent: true, opacity: 0.5 })));

    // Floating Wireframe Spheres
    spheresGroup = new THREE.Group();
    const sGeo = new THREE.SphereGeometry(0.7, 12, 12);
    for (let i = 0; i < 22; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x0d9488 : 0x0284c7, wireframe: true, transparent: true, opacity: 0.3 });
        const s = new THREE.Mesh(sGeo, mat);
        s.position.set((Math.random() - 0.5) * 55, (Math.random() - 0.5) * 55, (Math.random() - 0.5) * 30);
        s.scale.setScalar(Math.random() * 0.8 + 0.4);
        spheresGroup.add(s);
    }
    scene.add(spheresGroup);

    (function animate() {
        requestAnimationFrame(animate);
        dnaMesh.rotation.y += 0.003;
        spheresGroup.rotation.y += 0.0015;
        spheresGroup.rotation.x += 0.0008;
        camera.position.x += (mouseX * 0.007 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.007 - camera.position.y) * 0.04;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    })();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX - window.innerWidth / 2;
        mouseY = e.clientY - window.innerHeight / 2;
    });
}

/* ==========================================
   2. CUSTOM CURSOR GLOW
   ========================================== */
function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const glow = document.getElementById('cursorGlow');
    if (!dot || !glow) return;

    let posX = 0, posY = 0, glowX = 0, glowY = 0;

    document.addEventListener('mousemove', e => {
        posX = e.clientX; posY = e.clientY;
        dot.style.left = posX + 'px';
        dot.style.top = posY + 'px';
    });

    (function renderCursor() {
        glowX += (posX - glowX) * 0.15;
        glowY += (posY - glowY) * 0.15;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(renderCursor);
    })();
}

/* ==========================================
   3. SCROLL EFFECTS (Navbar + Animate-in)
   ========================================== */
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(15,23,42,0.08)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
}

/* ==========================================
   4. LEAFLET MAPS
   ========================================== */
let mainMap, modalMap, modalMarker;
const muqdadiyaCoords = [33.9786, 44.9372];

function initMaps() {
    const el = document.getElementById('mainMap');
    if (!el) return;

    mainMap = L.map('mainMap').setView(muqdadiyaCoords, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mainMap);

    const icon = L.divIcon({
        className: '',
        html: `<div style="background:linear-gradient(135deg,#0d9488,#0284c7);color:#fff;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 0 18px rgba(13,148,136,0.6);border:3px solid #fff;">
                 <i class="fa-solid fa-microscope"></i>
               </div>`,
        iconSize: [42, 42], iconAnchor: [21, 21]
    });

    L.marker(muqdadiyaCoords, { icon }).addTo(mainMap).bindPopup(
        `<div dir="rtl" style="font-family:'Cairo',sans-serif;min-width:190px;">
           <strong style="color:#0d9488;font-size:1.05rem;">مختبر نور الوسط الطبي</strong><br>
           <span>إدارة: منتظر صالح</span><br>
           <span>📞 07706976225</span><br>
           <small style="color:#64748b;">قضاء المقدادية - محافظة ديالى</small>
         </div>`
    ).openPopup();
}

function initModalMap() {
    const el = document.getElementById('modalMap');
    if (!el || modalMap) return;

    modalMap = L.map('modalMap').setView(muqdadiyaCoords, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(modalMap);

    const homeIcon = L.divIcon({
        className: '',
        html: `<div style="background:#0284c7;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;box-shadow:0 0 14px rgba(2,132,199,0.6);border:3px solid #fff;">
                 <i class="fa-solid fa-house-medical"></i>
               </div>`,
        iconSize: [36, 36], iconAnchor: [18, 18]
    });

    modalMarker = L.marker(muqdadiyaCoords, { draggable: true, icon: homeIcon }).addTo(modalMap);
    modalMarker.on('dragend', e => {
        const ll = e.target.getLatLng();
        document.getElementById('geoCoordinates').value = `${ll.lat.toFixed(4)}, ${ll.lng.toFixed(4)}`;
    });
    modalMap.on('click', e => {
        modalMarker.setLatLng(e.latlng);
        document.getElementById('geoCoordinates').value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
    });
}

function detectCurrentLocation() {
    if (!navigator.geolocation) { alert('متصفحك لا يدعم تحديد الموقع التلقائي.'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        if (modalMap && modalMarker) {
            modalMap.setView(c, 16);
            modalMarker.setLatLng(c);
            document.getElementById('geoCoordinates').value = `${c[0].toFixed(4)}, ${c[1].toFixed(4)}`;
            document.getElementById('addressText').value = 'موقعي الحالي عبر الـ GPS';
        }
    }, () => alert('تعذر تحديد الموقع. يرجى النقر على الخريطة مباشرة.'));
}

/* ==========================================
   5. BOOKING FLOW (3 STEPS - NO OTP)
   ========================================== */
function openBookingModal() {
    document.getElementById('bookingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    goToStep(1);
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
    document.body.style.overflow = '';
}

function selectPackageAndBook(pkgName, price) {
    const sel = document.getElementById('selectedPackage');
    if (sel) sel.value = `${pkgName} (${price})`;
    openBookingModal();
}

function goToStep(n) {
    if (n === 2) {
        const name = document.getElementById('patientName').value.trim();
        const phone = document.getElementById('phoneNumberInput').value.trim();
        if (!name) { alert('يرجى إدخال اسم المريض.'); return; }
        if (phone.length < 10) { alert('يرجى إدخال رقم هاتف عراقي صحيح.'); return; }
    }

    for (let i = 1; i <= 3; i++) {
        document.getElementById(`stepPane${i}`).classList.remove('active');
        document.getElementById(`stepInd${i}`).classList.remove('active');
    }
    document.getElementById(`stepPane${n}`).classList.add('active');
    document.getElementById(`stepInd${n}`).classList.add('active');

    if (n === 2) {
        setTimeout(() => { initModalMap(); if (modalMap) modalMap.invalidateSize(); }, 250);
    }
}

function submitFinalBooking() {
    const name    = document.getElementById('patientName').value.trim();
    const pkg     = document.getElementById('selectedPackage').value;
    const date    = document.getElementById('bookingDate').value;
    const time    = document.getElementById('bookingTime').value;
    const addr    = document.getElementById('addressText').value.trim() || 'قضاء المقدادية';
    const coords  = document.getElementById('geoCoordinates').value;
    const phone   = document.getElementById('phoneNumberInput').value.trim();
    const refCode = '#NOOR-' + Math.floor(1000 + Math.random() * 9000);
    const nowStr  = new Date().toLocaleString('ar-IQ');

    // Render Canvas Ticket
    renderCanvasTicket({ refCode, name, phone, pkg, date: `${date}`, time, addr, coords, nowStr });

    // WhatsApp Message
    const wa = encodeURIComponent(
        `🏥 *مختبر نور الوسط الطبي*\n` +
        `📍 قضاء المقدادية - محافظة ديالى\n` +
        `👨‍⚕️ إدارة: منتظر صالح\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📋 *بيانات حجز السحب المنزلي*\n` +
        `🔖 رمز الحجز: ${refCode}\n` +
        `👤 اسم المريض: ${name}\n` +
        `📞 رقم الهاتف: ${phone}\n` +
        `💉 الباقة: ${pkg}\n` +
        `📅 التاريخ: ${date}\n` +
        `⏰ الوقت: ${time}\n` +
        `📍 العنوان: ${addr}\n` +
        `🌐 الخريطة: https://maps.google.com/?q=${coords}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `✅ مرفق صورة بطاقة الحجز الرسمية`
    );
    document.getElementById('whatsappConfirmBtn').href = `https://wa.me/9647706976225?text=${wa}`;

    goToStep(3);
}

/* ==========================================
   6. CANVAS TICKET IMAGE GENERATOR (PREMIUM)
   ========================================== */
function renderCanvasTicket(d) {
    const canvas = document.getElementById('ticketCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;   // 600
    const H = canvas.height;  // 750

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Outer border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    // === HEADER GRADIENT ===
    const hGrad = ctx.createLinearGradient(0, 0, W, 145);
    hGrad.addColorStop(0,   '#0d9488');
    hGrad.addColorStop(1,   '#0284c7');
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, W, 145);

    // Decorative circles in header
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-20, -20, 100, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W + 30, 160, 110, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Lab Name
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.fillText('مختبر نور الوسط الطبي', W / 2, 48);

    ctx.font = '700 15px Cairo, sans-serif';
    ctx.globalAlpha = 0.9;
    ctx.fillText('محافظة ديالى - قضاء المقدادية  |  إدارة: منتظر صالح', W / 2, 80);

    ctx.font = '600 13px Cairo, sans-serif';
    ctx.globalAlpha = 0.75;
    ctx.fillText('أول مختبر يطلق خدمة السحب المنزلي المجاني في المقدادية', W / 2, 108);
    ctx.globalAlpha = 1;

    // === REFERENCE CODE PILL ===
    const pillY = 128;
    const pillW = 280; const pillH = 34;
    const pillX = (W - pillW) / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 17);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Cairo, sans-serif';
    ctx.fillText(`بطاقة حجز رسمية  ·  ${d.refCode}`, W / 2, pillY + 22);

    // === SECTION: DATA ROWS ===
    const rows = [
        { icon: '👤', label: 'اسم المريض',          val: d.name },
        { icon: '📞', label: 'رقم الهاتف',          val: d.phone },
        { icon: '💉', label: 'الباقة / التحليل',    val: d.pkg },
        { icon: '📅', label: 'تاريخ الزيارة',       val: d.date },
        { icon: '⏰', label: 'الوقت المفضل',         val: d.time },
        { icon: '📍', label: 'الموقع والعنوان',      val: d.addr }
    ];

    const startY = 175;
    const rowH   = 72;

    rows.forEach((r, i) => {
        const y = startY + i * rowH;

        // Row card background
        ctx.fillStyle = i % 2 === 0 ? '#f8fafc' : '#f0fdfa';
        ctx.beginPath();
        ctx.roundRect(24, y, W - 48, 60, 10);
        ctx.fill();

        // Left accent bar
        const barGrad = ctx.createLinearGradient(24, y, 24, y + 60);
        barGrad.addColorStop(0, '#0d9488');
        barGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(24, y, 5, 60, [3, 0, 0, 3]);
        ctx.fill();

        // Icon
        ctx.font = '22px serif';
        ctx.textAlign = 'right';
        ctx.fillText(r.icon, W - 42, y + 38);

        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 13px Cairo, sans-serif';
        ctx.fillText(r.label + ':', W - 70, y + 25);

        // Value
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 15px Cairo, sans-serif';
        const maxValW = W - 110;
        const valX = W - 70;

        // Truncate long values
        let val = r.val;
        if (ctx.measureText(val).width > maxValW) {
            while (ctx.measureText(val + '...').width > maxValW && val.length > 0) {
                val = val.slice(0, -1);
            }
            val += '...';
        }
        ctx.fillText(val, valX, y + 46);
    });

    // === DIVIDER ===
    const divY = startY + rows.length * rowH + 8;
    const divGrad = ctx.createLinearGradient(30, 0, W - 30, 0);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.3, '#0d9488');
    divGrad.addColorStop(0.7, '#0284c7');
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, divY); ctx.lineTo(W - 30, divY);
    ctx.stroke();

    // === FOOTER SECTION ===
    const fY = divY + 18;

    // Free Home Sampling badge
    ctx.fillStyle = '#f0fdfa';
    ctx.beginPath();
    ctx.roundRect(30, fY, W - 60, 44, 10);
    ctx.fill();
    ctx.strokeStyle = '#99f6e4';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0d9488';
    ctx.font = 'bold 14px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✅  خدمة السحب المنزلي مجانية بالكامل داخل قضاء المقدادية وضواحيها', W / 2, fY + 28);

    // Phone line
    ctx.fillStyle = '#0284c7';
    ctx.font = '700 14px Cairo, sans-serif';
    ctx.fillText('📞  هاتف وواتساب المختبر:  07706976225', W / 2, fY + 72);

    // Working hours
    ctx.fillStyle = '#64748b';
    ctx.font = '600 12.5px Cairo, sans-serif';
    ctx.fillText('⏱  أوقات العمل: يومياً من 8:00 صباحاً حتى 9:00 مساءً', W / 2, fY + 100);

    // Map link
    ctx.fillStyle = '#0d9488';
    ctx.font = '600 12px Cairo, sans-serif';
    ctx.fillText(`🗺  إحداثيات الموقع: ${d.coords}`, W / 2, fY + 124);

    // === BOTTOM BRAND BAR ===
    const botGrad = ctx.createLinearGradient(0, H - 48, W, H);
    botGrad.addColorStop(0, '#0f172a');
    botGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H - 48, W, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 12px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('تصميم وتطوير المبرمج  محمد وائل  |  مختبر نور الوسط الطبي © 2026', W / 2, H - 18);
}

function downloadTicketImage() {
    const canvas = document.getElementById('ticketCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `بطاقة-حجز-نور-الوسط-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/* ==========================================
   7. TEST DIRECTORY WITH 17 FULL TESTS
   ========================================== */
const allTestsData = [
    // ---- الباقة الصحية الشاملة (13 فحصاً) ----
    {
        name: 'صورة الدم الكاملة',
        abbr: 'CBC',
        package: 'الباقة الشاملة + الفيتامينات',
        desc: 'تقييم كريات الدم الحمراء والبيضاء والصفائح — الكشف عن الأنيميا والالتهابات والعدوى',
        category: 'دم'
    },
    {
        name: 'سكر الدم الصائم',
        abbr: 'FBS',
        package: 'الباقة الصحية الشاملة',
        desc: 'تشخيص مرض السكري ومتابعته — يُقاس بعد 8 ساعات صيام كامل',
        category: 'السكري'
    },
    {
        name: 'الكوليسترول الكلي',
        abbr: 'Cholesterol',
        package: 'الباقة الصحية الشاملة',
        desc: 'قياس نسبة الكوليسترول للحد من أمراض القلب والشرايين التاجية',
        category: 'قلب'
    },
    {
        name: 'الدهون الثلاثية',
        abbr: 'TRIG',
        package: 'الباقة الصحية الشاملة',
        desc: 'تقييم مستوى الدهون الثلاثية المرتبطة بأمراض القلب والسمنة',
        category: 'قلب'
    },
    {
        name: 'الدهون النافعة والضارة',
        abbr: 'HDL / LDL / VLDL',
        package: 'الباقة الصحية الشاملة',
        desc: 'فحص شامل للكوليسترول الجيد (HDL) والضار (LDL) وتقييم صحة الشرايين الدقيقة',
        category: 'قلب'
    },
    {
        name: 'حمض اليوريك',
        abbr: 'Uric Acid',
        package: 'الباقة الصحية الشاملة',
        desc: 'الكشف عن داء النقرس وارتفاع حمض اليوريك المؤلم في المفاصل',
        category: 'مفاصل'
    },
    {
        name: 'وظائف الكلى',
        abbr: 'BU / Creatinine',
        package: 'الباقة الصحية الشاملة',
        desc: 'تقييم كفاءة الكليتين في تصفية الفضلات — البولة والكرياتينين',
        category: 'كلى'
    },
    {
        name: 'الكالسيوم الكلي',
        abbr: 'Ca',
        package: 'الباقة الشاملة + الفيتامينات',
        desc: 'تقييم صحة العظام والأسنان وعمل الأعصاب والعضلات',
        category: 'عظام'
    },
    {
        name: 'البيليروبين الكلي (أبو صفار)',
        abbr: 'TSB',
        package: 'الباقة الصحية الشاملة',
        desc: 'تقييم وظائف الكبد والكشف عن اليرقان وانسداد القنوات الصفراوية',
        category: 'كبد'
    },
    {
        name: 'سرعة ترسيب الدم',
        abbr: 'ESR',
        package: 'الباقة الصحية الشاملة',
        desc: 'مؤشر عام لرصد الالتهابات المزمنة والحادة وأمراض المناعة الذاتية',
        category: 'التهاب'
    },
    {
        name: 'جرثومة المعدة',
        abbr: 'H. pylori',
        package: 'الباقة الصحية الشاملة',
        desc: 'الكشف عن البكتيريا الحلزونية المسببة لقرحة وآلام المعدة المزمنة',
        category: 'معدة'
    },
    {
        name: 'تحليل البول الشامل',
        abbr: 'GUE',
        package: 'الباقة الصحية الشاملة',
        desc: 'كشف التهابات المسالك البولية، الأملاح، الزلال، والسكر في البول',
        category: 'بول'
    },
    {
        name: 'تحليل البراز الشامل',
        abbr: 'GSE',
        package: 'الباقة الصحية الشاملة',
        desc: 'الكشف عن الطفيليات والبكتيريا والاضطرابات الهضمية والنزيف الخفي',
        category: 'هضم'
    },

    // ---- باقة الفيتامينات والعناصر (6 فحوصات) ----
    {
        name: 'فيتامين B12',
        abbr: 'Vit B12',
        package: 'باقة الفيتامينات والعناصر',
        desc: 'مهم لتكوين كريات الدم الحمراء وصحة الأعصاب والتركيز والذاكرة والطاقة اليومية',
        category: 'فيتامينات'
    },
    {
        name: 'فيتامين D3 (فيتامين الشمس)',
        abbr: 'Vit D3',
        package: 'باقة الفيتامينات والعناصر',
        desc: 'يدعم العظام والمناعة ويحسن امتصاص الكالسيوم — نقصه شائع في العراق',
        category: 'فيتامينات'
    },
    {
        name: 'مخزون الحديد',
        abbr: 'Ferritin',
        package: 'باقة الفيتامينات والعناصر',
        desc: 'يكشف عن احتياطي الحديد الحقيقي بالجسم ويميز أنواع فقر الدم المختلفة بدقة',
        category: 'دم'
    },
    {
        name: 'عنصر الزنك',
        abbr: 'Zinc (Zn)',
        package: 'باقة الفيتامينات والعناصر',
        desc: 'يعزز جهاز المناعة ويساعد في التئام الجروح ويحسن صحة الشعر والجلد',
        category: 'معادن'
    }
];

function renderTestsGrid(filterText = '') {
    const grid = document.getElementById('testsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = allTestsData.filter(t =>
        t.name.includes(filterText) ||
        t.abbr.toLowerCase().includes(filterText.toLowerCase()) ||
        t.desc.includes(filterText) ||
        t.category.includes(filterText)
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px;color:var(--text-muted);">
            <i class="fa-solid fa-magnifying-glass" style="font-size:2.5rem;opacity:0.3;display:block;margin-bottom:12px;"></i>
            لم يتم العثور على تحليل مطابق. جرب كلمة أخرى.
        </div>`;
        return;
    }

    // Category colors
    const catColors = {
        'دم': '#e11d48', 'السكري': '#d97706', 'قلب': '#ef4444',
        'مفاصل': '#7c3aed', 'كلى': '#0284c7', 'عظام': '#059669',
        'كبد': '#b45309', 'التهاب': '#dc2626', 'معدة': '#0d9488',
        'بول': '#0369a1', 'هضم': '#16a34a', 'فيتامينات': '#6d28d9',
        'معادن': '#92400e'
    };

    filtered.forEach(t => {
        const card = document.createElement('div');
        card.className = 'test-grid-card';
        const catColor = catColors[t.category] || '#0d9488';
        card.innerHTML = `
            <div class="test-card-header">
                <h4>${t.name}</h4>
                <span class="test-card-pkg-tag" style="font-family:sans-serif;">${t.abbr}</span>
            </div>
            <p class="test-card-desc">${t.desc}</p>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
                <span style="font-size:0.78rem;color:var(--primary);font-weight:700;">
                    <i class="fa-solid fa-layer-group"></i> ${t.package}
                </span>
                <span style="font-size:0.75rem;font-weight:800;padding:2px 8px;border-radius:99px;background:${catColor}18;color:${catColor};">
                    ${t.category}
                </span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterTests() {
    const val = document.getElementById('testSearchInput').value;
    const btn = document.getElementById('clearSearch');
    if (btn) btn.style.display = val.length > 0 ? 'block' : 'none';
    renderTestsGrid(val);
}

function clearTestSearch() {
    document.getElementById('testSearchInput').value = '';
    const btn = document.getElementById('clearSearch');
    if (btn) btn.style.display = 'none';
    renderTestsGrid('');
}

/* ==========================================
   8. MOBILE NAV + DEFAULT DATE
   ========================================== */
function initMobileNav() {
    const toggle = document.getElementById('mobileToggle');
    const nav    = document.getElementById('navLinks');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => nav.classList.toggle('active'));

    // Close nav on link click
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => nav.classList.remove('active'));
    });

    // Close on outside click
    document.addEventListener('click', e => {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('active');
        }
    });
}

function setDefaultBookingDate() {
    const el = document.getElementById('bookingDate');
    if (el) {
        const today = new Date().toISOString().split('T')[0];
        el.value = today;
        el.min   = today;
    }
}