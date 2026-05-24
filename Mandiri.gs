function catatMandiriFinal() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  
  // 1. Cek Existing data pada sheet
  var lastRow = sheet.getLastRow();
  var existingIds = [];
  if (lastRow > 1) {
    existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().map(String);
  }

  // 2. Get Query dari Gmail
  var query = '(subject:"Pembayaran Berhasil" OR subject:"Top-up e-money Berhasil" OR subject:"Transfer Berhasil" OR subject:"Transfer dengan BI Fast")';
  var threads = GmailApp.search(query);

  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      var msg = messages[j];
      var body = msg.getPlainBody();
      var date = msg.getDate();
      var subject = msg.getSubject().toLowerCase();
      
      var idTransaksi = "";
      var nominal = 0;
      var merchant = "";
      var deskripsi = "";
      var jenis = "Keluar";

  // 3. Mencari 'No. Referensi' atau 'No. Referensi BI Fast'
      var matchId = body.match(/(?:No\.|Nomor) Referensi(?:\s*BI\s*Fast)?\s*([A-Z0-9]+)/i);
      idTransaksi = matchId ? matchId[1] : "";

  // 4. CEK DUPLIKAT no referensi dan ID
      if (idTransaksi !== "" && existingIds.indexOf(idTransaksi) === -1) {
        
        // --- QRIS TAP (MRT) ---
        if (subject.includes("qris tap")) {
          // Khusus MRT, ambil "Biaya Perjalanan" bukan "Nominal Tertahan"
          var matchNominal = body.match(/Biaya Perjalanan\s*Rp\s*([\d\.,]+)/i);
          if (matchNominal) {
            nominal = parseFloat(matchNominal[1].replace(/\./g, "").replace(/,/g, "."));
          }
          merchant = "MRT Jakarta";
          deskripsi = "Mobilisasi MRT (QRIS Tap)";
        } 
        
        // --- TRANSFER ---
        else if (subject.includes("transfer")) {
          var matchNominal = body.match(/(?:Jumlah|Nominal) Transfer\s*Rp\s*([\d\.,]+)/i);
          if (matchNominal) nominal = parseFloat(matchNominal[1].replace(/\./g, "").replace(/,/g, "."));
          var matchPenerima = body.match(/Penerima\s*[\r\n]+\s*([^\r\n,]+)/i);
          merchant = matchPenerima ? matchPenerima[1].trim() : "Transfer Bank";
          deskripsi = "Transfer ke " + merchant;
        } 
        
        // --- TOP-UP E-MONEY ---
        else if (subject.includes("top-up e-money")) {
          var matchNominal = body.match(/Nominal Top-up\s*Rp\s*([\d\.,]+)/i);
          if (matchNominal) nominal = parseFloat(matchNominal[1].replace(/\./g, "").replace(/,/g, "."));
          merchant = "Mandiri e-money";
          deskripsi = "Top Up Saldo (Parkir & Transportasi)";
        } 
        
        // --- QRIS BIASA ---
        else if (subject.includes("pembayaran berhasil")) {
          var matchNominal = body.match(/Nominal Transaksi\s*Rp\s*([\d\.,]+)/i);
          if (matchNominal) nominal = parseFloat(matchNominal[1].replace(/\./g, "").replace(/,/g, "."));
          var matchPenerima = body.match(/Penerima\s*[\r\n]+\s*([^\r\n,]+)/i);
          merchant = matchPenerima ? matchPenerima[1].trim() : "Mandiri QRIS";
          deskripsi = "QRIS: " + merchant;
        }

  // 5. INPUT KE SHEET
        if (nominal > 0) {
          sheet.appendRow([idTransaksi, date, merchant, deskripsi, jenis, nominal]);
          existingIds.push(idTransaksi); 
          console.log("Berhasil Catat: " + idTransaksi + " | " + merchant);
        }
        
        msg.markRead(); 
      }
    }
  }
}
