class WheelGame {
    constructor() {
        this.wheel = document.getElementById('wheel');
        this.spinButton = document.getElementById('spinButton');
        this.prizeTexts = document.getElementById('prizeTexts');
        this.isSpinning = false;
        this.prizes = [];

        this.spinButton.addEventListener('click', () => this.spin());
        this.loadData();
    }

    async loadData() {
        const response = await fetch('text.json');
        const data = await response.json();
        this.prizes = data.prizes;
        this.alertConfig = data.alert;
        document.title = data.title;
        this.createWheel();
    }

    createWheel() {
        const sliceAngle = 360 / this.prizes.length;
        const radius = 50;

        // Her ödül için sınırları hesapla (0'dan başlayarak)
        this.prizes = this.prizes.map((prize, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const centerAngle = startAngle + (sliceAngle / 2);

            return {
                ...prize,
                startAngle,
                endAngle,
                centerAngle,
                sliceAngle
            };
        });

        console.log('Açı Dağılımı:', {
            toplamÖdül: this.prizes.length,
            dilimAçısı: sliceAngle,
            ödüller: this.prizes.map(p => ({
                id: p.slot_id,
                text: p.slot_text,
                başlangıç: p.startAngle,
                bitiş: p.endAngle,
                merkez: p.centerAngle
            }))
        });

        // SVG dilimlerini ve metinleri oluştur
        const wheelElements = this.prizes.map(prize => {
            const startRad = ((prize.startAngle - 90) * Math.PI) / 180;
            const endRad = ((prize.endAngle - 90) * Math.PI) / 180;

            const x1 = radius + radius * Math.cos(startRad);
            const y1 = radius + radius * Math.sin(startRad);
            const x2 = radius + radius * Math.cos(endRad);
            const y2 = radius + radius * Math.sin(endRad);

            const largeArc = prize.sliceAngle > 180 ? 1 : 0;

            const d = [
                `M ${radius},${radius}`,
                `L ${x1},${y1}`,
                `A ${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}`,
                'Z'
            ].join(' ');

            const textRad = ((prize.centerAngle - 90) * Math.PI) / 180;
            const textRadius = radius * 0.55;
            const textX = radius + textRadius * Math.cos(textRad);
            const textY = radius + textRadius * Math.sin(textRad);

            // Metni her zaman dilimin ortasına doğru çapraz yerleştir
            let textRotation = prize.centerAngle + 90;
            if (textRotation > 180) {
                textRotation -= 180;
            }

            // Label boyutları (metin uzunluğuna göre)
            const fontSize = 3.8;
            const charWidth = fontSize * 0.65;
            const labelPadding = 4;
            const labelWidth = (prize.slot_text.length * charWidth) + labelPadding * 2;
            const labelHeight = 7;

            return `
                <path d="${d}" fill="${prize.color}" />
                <g transform="translate(${textX}, ${textY})">
                    <rect 
                        x="${-labelWidth/2}" 
                        y="${-labelHeight/2}" 
                        width="${labelWidth}" 
                        height="${labelHeight}" 
                        fill="rgba(50, 50, 50, 0.3)"
                        rx="3"
                        ry="3"
                        transform="rotate(${textRotation})"
                        class="prize-label"
                    />
                    <text 
                        x="0" 
                        y="0" 
                        fill="white"
                        font-size="${fontSize}"
                        font-weight="bold"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        transform="rotate(${textRotation})"
                        class="prize-text"
                    >${prize.slot_text}</text>
                </g>
            `;
        }).join('');

        const svg = `
            <svg viewBox="0 0 100 100" class="wheel-svg">
                <defs>
                    <filter id="textShadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="0.5" flood-opacity="0.3"/>
                    </filter>
                </defs>
                ${wheelElements}
            </svg>
        `;

        this.wheel.innerHTML = svg;

        document.getElementById('wheelStyles').innerHTML = `
            .wheel-svg {
                position: absolute;
                width: 100%;
                height: 100%;
                transform-origin: center;
            }
            .wheel-svg .prize-text {
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                paint-order: stroke;
                stroke: rgba(0,0,0,0.5);
                stroke-width: 0.5px;
                stroke-linecap: round;
                stroke-linejoin: round;
                letter-spacing: 0.3px;
            }
            .wheel-svg .prize-label {
                opacity: 0.8;
            }
        `;
    }

    spin() {
        if (this.isSpinning) return;

        // Çarkın başlangıç konumunda olup olmadığını kesin olarak kontrol et
        const currentRotation = getComputedStyle(this.wheel).transform;
        const currentDegrees = this.getRotationDegrees(currentRotation);

        if (currentDegrees !== 0) {
            console.log('Güvenlik kontrolü: Çark başlangıç konumunda değil, sıfırlanıyor...');
            // Animasyonsuz olarak anında sıfırla
            this.wheel.style.transition = 'none';
            this.wheel.style.transform = 'rotate(0deg)';

            // Diğer özellikleri de sıfırla
            this.isSpinning = false;
            this.spinButton.classList.remove('spinning');
            document.querySelector('.marker').classList.remove('swaying');
            document.querySelector('.start-icon').style.opacity = '1';
            document.querySelector('.gift-icon').style.opacity = '0';
            document.querySelector('.gift-icon').style.display = 'none';

            // Kısa bir süre bekleyip çarkı döndürmeye başla
            requestAnimationFrame(() => {
                this.startSpinning();
            });
            return;
        }

        this.startSpinning();
    }

    // Mevcut rotasyon açısını hassas şekilde hesapla
    getRotationDegrees(matrix) {
        if (!matrix || matrix === 'none') return 0;

        try {
            const values = matrix.split('(')[1].split(')')[0].split(',');
            const a = parseFloat(values[0]);
            const b = parseFloat(values[1]);
            const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            return angle < 0 ? angle + 360 : angle;
        } catch (error) {
            console.log('Rotasyon hesaplama hatası, çark sıfırlanıyor...');
            return 1; // 0 dışında bir değer döndür ki sıfırlama tetiklensin
        }
    }

    startSpinning() {
        this.isSpinning = true;

        // Ses efektini çal
        const spinSound = document.getElementById('spinSound');
        spinSound.currentTime = 0;
        spinSound.play();

        // Start ikonunu gizle ve gift ikonunu göster
        document.querySelector('.start-icon').style.opacity = '0';
        const giftIcon = document.querySelector('.gift-icon');
        giftIcon.style.display = 'block';
        setTimeout(() => giftIcon.style.opacity = '1', 50);

        // Spinning class'ını ekle
        this.spinButton.classList.add('spinning');

        // Olasılık hesaplaması
        const totalProbability = this.prizes.reduce((sum, prize) => sum + prize.probability, 0);
        const random = Math.random() * totalProbability;
        let currentSum = 0;

        // Olasılığa göre ödül seç
        const prize = this.prizes.find(prize => {
            currentSum += prize.probability;
            return random <= currentSum;
        });

        const spins = 5 * 360; // 5 tam tur

        // Hedef açıyı hesapla
        const halfSlice = prize.sliceAngle / 2;
        const targetAngle = prize.startAngle + halfSlice;
        const finalRotation = spins + (360 - targetAngle);

        console.log('Spin Detayları:', {
            seçilenÖdül: prize.slot_text,
            olasılık: prize.probability,
            başlangıçAçısı: prize.startAngle,
            hedefAçı: targetAngle,
            sonDönüş: finalRotation
        });

        this.wheel.style.transition = 'transform 4s ease-out';
        this.wheel.style.transform = `rotate(${finalRotation}deg)`;
        document.querySelector('.marker').classList.add('swaying');

        setTimeout(() => {
            this.isSpinning = false;
            document.querySelector('.marker').classList.remove('swaying');

            // Gift ikonunu gizle ve start ikonunu göster
            const giftIcon = document.querySelector('.gift-icon');
            giftIcon.style.opacity = '0';
            setTimeout(() => {
                giftIcon.style.display = 'none';
                document.querySelector('.start-icon').style.opacity = '1';
                // Spinning class'ını kaldır
                this.spinButton.classList.remove('spinning');
            }, 300);

            // Kazanma sesini çal
            const winSound = document.getElementById('winSound');
            winSound.currentTime = 0;
            winSound.play();

            // Konfeti efektini başlat
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                gravity: 0.8,
                scalar: 1.2
            });

            // Sayfanın kaydırılmasını engelle
            document.body.style.overflow = 'hidden';

            // 2 saniye bekle ve sonra modeli göster
            setTimeout(() => {
                Swal.fire({
                    title: this.alertConfig.title,
                    html: `${this.alertConfig.prizeText}<br>${prize.slot_text}`,
                    icon: 'success',
                    confirmButtonText: this.alertConfig.confirmButton,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    scrollbarPadding: false,
                    allowTouchMove: false,
                    heightAuto: false,
                    customClass: {
                        popup: 'custom-popup-class'
                    },
                    didOpen: () => {
                        // Mobil için özel stil ekle
                        const style = document.createElement('style');
                        style.textContent = `
                            @media (max-width: 480px) {
                                .custom-popup-class {
                                    width: 280px !important;
                                    max-width: 280px !important;
                                    padding: 15px !important;
                                    margin: 0 auto !important;
                                    font-size: 14px !important;
                                }
                                .custom-popup-class .swal2-title {
                                    font-size: 18px !important;
                                    padding: 0 !important;
                                }
                                .custom-popup-class .swal2-html-container {
                                    font-size: 14px !important;
                                    line-height: 1.5 !important;
                                    padding: 0 !important;
                                }
                                .custom-popup-class .swal2-confirm {
                                    font-size: 14px !important;
                                    padding: 8px 20px !important;
                                }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }).then(() => {
                    // Sayfanın kaydırılmasını tekrar etkinleştir
                    document.body.style.overflow = 'auto';

                    // Sweet Alert kapandıktan sonra çarkı sıfırla
                    this.wheel.style.transition = 'none';
                    this.wheel.style.transform = 'rotate(0deg)';
                });
            }, 2000);
        }, 4000);
    }
}

new WheelGame();