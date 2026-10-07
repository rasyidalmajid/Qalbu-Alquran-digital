document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    fetchJadwalShalat();
    fetchSurahPopuler();
    checkTerakhirDibaca();
});

// --- 1. Dark Mode Toggle ---
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Cek preferensi sistem atau local storage
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    toggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        if (html.classList.contains('dark')) {
            localStorage.theme = 'dark';
        } else {
            localStorage.theme = 'light';
        }
    });
}

// --- 2. Fetch Jadwal Shalat (Menggunakan MyQuran API) ---
async function fetchJadwalShalat() {
    const grid = document.getElementById('jadwal-grid');
    // ID 1301 adalah Jakarta (Anda bisa membuat fitur deteksi lokasi nanti)
    const kotaId = 1301; 
    
    // Dapatkan tanggal hari ini dalam format YYYY/MM/DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const tanggalHariIni = new Date().getDate();
    try {
        const request1 = new Request("https://equran.id/api/v2/shalat",
            {
                method: "POST",
                body: JSON.stringify({
                    provinsi: "jawa tengah",
                    kabkota: "kota salatiga",
                    bulan: month,
                    tahun: year
                })
            }
        )
        const response = await fetch(request1);
        const data = await response.json();
        console.log(data)

        if (data.code == 200) {
            const jadwal = data.data.jadwal.find((item) => item.tanggal === tanggalHariIni);
            const waktuShalat = [
                { nama: 'Imsak', waktu: jadwal.imsak, icon: 'ph-moon-stars' },
                { nama: 'Subuh', waktu: jadwal.subuh, icon: 'ph-cloud-sun' },
                { nama: 'Dzuhur', waktu: jadwal.dzuhur, icon: 'ph-sun' },
                { nama: 'Ashar', waktu: jadwal.ashar, icon: 'ph-cloud' },
                { nama: 'Maghrib', waktu: jadwal.maghrib, icon: 'ph-sun-horizon' },
                { nama: 'Isya', waktu: jadwal.isya, icon: 'ph-moon' }
            ];

            grid.innerHTML = ''; // Kosongkan state loading
            
            waktuShalat.forEach(waktu => {
                grid.innerHTML += `
                    <div class="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-center card-hover-fx">
                        <i class="ph ${waktu.icon} text-2xl text-slate-400 dark:text-slate-500 mb-2"></i>
                        <p class="text-sm text-slate-500 font-medium mb-1">${waktu.nama}</p>
                        <p class="text-xl font-bold tracking-tight">${waktu.waktu}</p>
                    </div>
                `;
            });
        }
    } catch (error) {
        grid.innerHTML = `<div class="col-span-2 md:col-span-6 text-center py-4 text-red-500">Gagal memuat jadwal shalat.</div>`;
        console.error('Error fetching jadwal:', error);
    }
}

// --- 3. Fetch Surah Populer (Menggunakan API EQuran.id v2) ---
async function fetchSurahPopuler() {
    const grid = document.getElementById('surah-grid');
    // ID surah yang sering dibaca: Al-Fatihah(1), Al-Kahfi(18), Yasin(36), Ar-Rahman(55), Al-Waqi'ah(56), Al-Mulk(67)
    const targetSurah = [1, 18, 36, 55, 56, 67]; 
    
    try {
        const response = await fetch('https://equran.id/api/v2/surat');
        const data = await response.json();

        if (data.code === 200) {
            grid.innerHTML = '';
            
            // Filter hanya surah yang ada di targetSurah
            const filteredSurah = data.data.filter(surat => targetSurah.includes(surat.nomor));

            filteredSurah.forEach(surat => {
                grid.innerHTML += `
                    <a href="/al-quran/detail-surah.html?nomor=${surat.nomor}" class="group bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between card-hover-fx hover:border-brand-500 dark:hover:border-brand-500 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500">
                                ${surat.nomor}
                            </div>
                            <div>
                                <h3 class="font-bold text-lg group-hover:text-brand-600 dark:group-hover:text-brand-500 transition-colors">${surat.namaLatin}</h3>
                                <p class="text-xs text-slate-500 mt-1 uppercase tracking-wider">${surat.tempatTurun} • ${surat.jumlahAyat} Ayat</p>
                            </div>
                        </div>
                        <div class="font-arabic text-2xl text-brand-600 dark:text-brand-500 text-right">
                            ${surat.nama}
                        </div>
                    </a>
                `;
            });
        }
    } catch (error) {
        grid.innerHTML = `<div class="col-span-1 md:col-span-3 text-center py-4 text-red-500">Gagal memuat data surah.</div>`;
        console.error('Error fetching surah:', error);
    }
}

// --- 4. Cek Fitur "Terakhir Dibaca" (Simulasi Local Storage) ---
function checkTerakhirDibaca() {
    const container = document.getElementById('terakhir-dibaca-container');

    // Coba baca dari local storage (contoh key: 'qalbu_last_read')
    const lastReadData = localStorage.getItem('qalbu_last_read');

    if (lastReadData) {
        const parsedData = JSON.parse(lastReadData);
        const surahName = parsedData.surahName;
        const surahNumber = parsedData.surahNumber;
        const ayat = `Ayat ${parsedData.ayatNumber}`;
        container.classList.remove('hidden');

        container.innerHTML = `
        <div class="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-950 dark:to-slate-900 rounded-2xl p-6 border border-brand-200 dark:border-brand-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <span class="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-500">Terakhir Dibaca</span>
                <h3 id="last-read-title" class="text-xl font-bold mt-1">${surahName}</h3>
                <p id="last-read-ayat" class="text-slate-600 dark:text-slate-400 text-sm">${ayat}</p>
            </div>
            <a href="/al-quran/detail-surah.html?nomor=${surahNumber}" class="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Lanjutkan
            </a>
        </div>`
    }
}

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const iconOpen = document.getElementById('menu-icon-open');
const iconClose = document.getElementById('menu-icon-close');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

// Toggle menu saat tombol diklik
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    iconOpen.classList.toggle('hidden');
    iconClose.classList.toggle('hidden');
});

// Otomatis tutup menu saat salah satu link diklik
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
    });
});