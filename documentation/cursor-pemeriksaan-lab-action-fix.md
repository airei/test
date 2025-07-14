# Perbaikan Aksi Tombol Mulai Pemeriksaan Lab

## Ringkasan Masalah

Ketika tombol "Mulai Pemeriksaan" diklik pada halaman pemeriksaan lab, sistem hanya mengubah status dari "belum diperiksa" menjadi "sedang diperiksa" tetapi tidak langsung mengarahkan user ke halaman detail pemeriksaan. User harus mengklik tombol "Lanjutkan Pemeriksaan" untuk masuk ke halaman detail.

## Perubahan yang Dilakukan

### 1. Fungsi `handleStatusUpdate`

#### **Sebelum**
```tsx
const handleStatusUpdate = (queueId: string, newStatus: string) => {
  router.patch(route('pelayanan.pemeriksaan-lab.update-status', queueId), {
    status: newStatus
  }, {
    onSuccess: () => {
      router.visit(window.location.href);
    },
  });
};
```

#### **Sesudah**
```tsx
const handleStatusUpdate = (queueId: string, newStatus: string, redirectTo?: string) => {
  router.patch(route('pelayanan.pemeriksaan-lab.update-status', queueId), {
    status: newStatus
  }, {
    onSuccess: () => {
      if (redirectTo) {
        router.visit(redirectTo);
      } else {
        router.visit(window.location.href);
      }
    },
  });
};
```

### 2. Tombol "Mulai Pemeriksaan"

#### **Sebelum**
```tsx
<Button 
  size="icon" 
  variant="ghost" 
  title="Mulai Pemeriksaan" 
  onClick={() => handleStatusUpdate(row.id, 'sedang diperiksa')}
>
  <Stethoscope className="w-5 h-5" />
</Button>
```

#### **Sesudah**
```tsx
<Button 
  size="icon" 
  variant="ghost" 
  title="Mulai Pemeriksaan" 
  onClick={() => handleStatusUpdate(row.id, 'sedang diperiksa', route('lab.show', row.id))}
>
  <Stethoscope className="w-5 h-5" />
</Button>
```

## Flow Pemeriksaan Lab

### **Flow Sebelum Perbaikan**
1. User melihat antrian dengan status "belum diperiksa"
2. User klik tombol "Mulai Pemeriksaan"
3. Status berubah menjadi "sedang diperiksa"
4. Halaman refresh, user masih di halaman antrian
5. User harus klik tombol "Lanjutkan Pemeriksaan" untuk masuk ke detail
6. User masuk ke halaman detail pemeriksaan

### **Flow Sesudah Perbaikan**
1. User melihat antrian dengan status "belum diperiksa"
2. User klik tombol "Mulai Pemeriksaan"
3. Status berubah menjadi "sedang diperiksa"
4. User langsung diarahkan ke halaman detail pemeriksaan
5. User bisa langsung mulai mengisi data pemeriksaan

## Benefits

### 1. User Experience
- **Efisiensi**: Mengurangi satu langkah klik
- **Intuitif**: Tombol "Mulai" langsung mengarahkan ke halaman pemeriksaan
- **Konsisten**: Behavior yang sama dengan halaman rawat jalan

### 2. Workflow Optimization
- **Streamlined Process**: Proses pemeriksaan lebih lancar
- **Reduced Friction**: Mengurangi hambatan dalam workflow
- **Better UX**: User tidak perlu mencari tombol lanjutan

### 3. Consistency
- **Similar to Rawat Jalan**: Behavior yang sama dengan halaman konsultasi
- **Expected Behavior**: Sesuai dengan ekspektasi user
- **Standard Pattern**: Mengikuti pola yang sudah ada

## Testing

### Test Cases

1. **✅ Status Update**
   - Klik tombol "Mulai Pemeriksaan"
   - Status berubah dari "belum diperiksa" ke "sedang diperiksa"
   - Data tersimpan di database

2. **✅ Direct Navigation**
   - Setelah klik "Mulai Pemeriksaan"
   - User langsung diarahkan ke halaman detail
   - URL berubah ke route `lab.show`

3. **✅ Cancel Action**
   - Klik tombol "Batalkan"
   - Status berubah ke "batal"
   - User tetap di halaman antrian

4. **✅ Continue Action**
   - Untuk status "sedang diperiksa"
   - Klik tombol "Lanjutkan Pemeriksaan"
   - User diarahkan ke halaman detail

5. **✅ Print Action**
   - Untuk status "selesai"
   - Klik tombol "Print"
   - User diarahkan ke halaman print

## Implementation Details

### 1. Parameter `redirectTo`
- **Type**: `string | undefined`
- **Purpose**: URL untuk redirect setelah update status
- **Default**: `undefined` (refresh halaman saat ini)

### 2. Conditional Redirect
```tsx
onSuccess: () => {
  if (redirectTo) {
    router.visit(redirectTo);  // Redirect ke URL tertentu
  } else {
    router.visit(window.location.href);  // Refresh halaman saat ini
  }
}
```

### 3. Route Usage
```tsx
route('lab.show', row.id)  // Generate URL untuk halaman detail lab
```

## Comparison with Rawat Jalan

### **Rawat Jalan (Konsultasi)**
```tsx
// Mulai Konsultasi
<Button onClick={() => router.visit(route('konsultasi.show', row.id))}>
  <Stethoscope className="w-5 h-5" />
</Button>
```

### **Pemeriksaan Lab (Sesudah Perbaikan)**
```tsx
// Mulai Pemeriksaan
<Button onClick={() => handleStatusUpdate(row.id, 'sedang diperiksa', route('lab.show', row.id))}>
  <Stethoscope className="w-5 h-5" />
</Button>
```

**Perbedaan**: Pemeriksaan lab perlu update status terlebih dahulu, sedangkan konsultasi langsung ke halaman detail.

## Catatan

- Perubahan ini tidak mempengaruhi fungsionalitas lain
- Tombol "Batalkan" tetap menggunakan behavior lama (refresh halaman)
- Tombol "Lanjutkan" dan "Print" tetap berfungsi seperti sebelumnya
- Backward compatibility terjaga 