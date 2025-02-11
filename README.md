# Hediye Çarkı (Prize Wheel)

Basit ve etkileşimli bir hediye çarkı uygulaması. Kullanıcılar çarkı çevirerek rastgele ödüller kazanabilirler.

🔗 [Demo'ya Git](https://proje.alperenirtik.com/proje/whell/)

## Özellikler

- Özelleştirilebilir ödül ve olasılıklar
- Mobil uyumlu tasarım
- Çark dönüş animasyonu ve ses efektleri
- Konfeti efekti

## Teknolojiler

- HTML5, CSS3, JavaScript
- Tailwind CSS
- SweetAlert2 (Bildirimler için)
- Canvas Confetti (Efektler için)
- Ses Efektleri (spin.mp3, win.mp3)

## Çalışma Prensibi

Ödül seçimi, her ödülün olasılık değerine göre yapılır. Toplam olasılık havuzundan rastgele bir değer seçilir ve bu değerin hangi ödül aralığına denk geldiği hesaplanır. Çark, seçilen ödülün açısına göre döndürülür.

## Kurulum

1. Projeyi indirin
2. Bir web sunucusunda çalıştırın
3. `text.json` dosyasından ödülleri özelleştirin

## Özelleştirme

`text.json` dosyasından ödülleri, olasılıkları ve renkleri düzenleyebilirsiniz:

```json
{
    "prizes": [
        {
            "slot_text": "50₺ Çek",
            "color": "#494c62f0",
            "probability": 35
        }
    ]
}
```

Her dilimin kendine özel rengi `color` özelliği ile belirlenebilir (HEX renk kodu kullanılır).
`slot_text` özelliği ile dilimde görünecek ödül metni, `probability` özelliği ile de o ödülün kazanılma olasılığı belirlenir (1-100 arası).

## Geliştirici

- [Alperen İrtik](https://github.com/alperenirtik)
- [Kişisel Web Sitem](https://alperenirtik.com)
- [Firma Sitem](https://ankasoftyazilim.com)

## Lisans

MIT License 
