document.addEventListener("DOMContentLoaded", () => {
  const salesData = [
    { name: "Andi (0812***)", item: "86 Diamonds Mobile Legends", time: "Baru saja" },
    { name: "Rian (0857***)", item: "140 Diamond Free Fire", time: "1 menit lalu" },
    { name: "Budi (0821***)", item: "300 Genesis Crystals Genshin", time: "2 menit lalu" },
    { name: "Dika (0896***)", item: "Weekly Diamond Pass MLBB", time: "4 menit lalu" },
    { name: "Fajar (0813***)", item: "Valorant Points 1000", time: "5 menit lalu" }
  ];

  const toast = document.getElementById("liveSalesToast");
  const userText = document.getElementById("liveSalesUser");
  const itemText = document.getElementById("liveSalesItem");
  const timeText = document.getElementById("liveSalesTime");

  if (!toast) return;

  let index = 0;

  function triggerPopup() {
    const sale = salesData[index];
    userText.innerText = sale.name;
    itemText.innerText = sale.item;
    timeText.innerText = sale.time;

    toast.classList.add("show");

    // Sembunyikan setelah 4 detik
    setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);

    index = (index + 1) % salesData.length;
  }

  // Tampilkan pertama kali setelah 3 detik web dibuka
  setTimeout(() => {
    triggerPopup();
    // Muncul berulang tiap 10 detik
    setInterval(triggerPopup, 10000);
  }, 3000);
});