function ViewModel() {
  var self = this;
  self.cupons = ko.observableArray([]);
  self.infos = ko.observable({
    foto: '',
    titulo: '',
    bio: '',
    instagram: '',
    tiktok: ''
  });

  const baseUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRzDrEFfTqlRK7wGUKDmRcH8zg2X7f4PJJvySkUdQKm-xFPvkygw-Z3dTF514d3rDhnaaSWTiWcB-X-/pub';

  // Aba Cupons (gid=0)
  fetch(`${baseUrl}?gid=0&single=true&output=csv`)
    .then(res => res.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
      const data = parsed.data.map(item => ({
        cupom: item.Cupom,
        marca: item.Marca,
        desconto: item.Desconto,
        freteGratis: item.Frete === 'Sim',
        regra: item.Regra,
        site: item.Site,
        imagem: item.Imagem
      }));
      self.cupons(data);
    })
    .catch(err => console.error('Erro ao buscar aba Cupons:', err));


  // Aba Infos (gid=1352179578)
  fetch(`${baseUrl}?gid=1352179578&single=true&output=csv`)
    .then(res => res.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
      const item = parsed.data[0] || {};
      self.infos({
        foto: item.Foto,
        titulo: item.Título,
        bio: item.Bio,
        instagram: item.Instagram,
        tiktok: item.Tiktok
      });
    })
    .catch(err => console.error('Erro ao buscar aba Infos:', err));

  self.copiarCupom = function (item) {
    navigator.clipboard.writeText(item.cupom)
      .then(() => {
        console.log('Cupom copiado:', item.cupom);
      })
      .catch(err => {
        console.error('Erro ao copiar cupom:', err);
      });
  };


  self.toastVisible = ko.observable(false);
  self.toastMessage = ko.observable('');

  self.copiarCupom = function (item) {
    navigator.clipboard.writeText(item.cupom)
      .then(() => {
        self.toastMessage(`Cupom "${item.cupom}" copiado!`);
        self.toastVisible(true);

        setTimeout(() => {
          self.toastVisible(false);
        }, 3000);
      })
      .catch(err => console.error('Erro ao copiar cupom:', err));
  };
}

document.addEventListener('DOMContentLoaded', () => {
  ko.applyBindings(new ViewModel());
});