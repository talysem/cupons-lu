function ViewModel() {
  var self = this;
  self.cupons = ko.observableArray([]);
  self.infos = ko.observable({
    titulo: '',
    bio: '',
    instagram: '',
    tiktok: '',
    mostrarInfosCargoEmpresa: false,
    nome: '',
    cargo: '',
    empresa: ''
  });

  const baseUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRzDrEFfTqlRK7wGUKDmRcH8zg2X7f4PJJvySkUdQKm-xFPvkygw-Z3dTF514d3rDhnaaSWTiWcB-X-/pub';

  self.carregando = ko.observable(true);

  Promise.all([
    fetch(`${baseUrl}?gid=0&single=true&output=csv`).then(res => res.text()),
    fetch(`${baseUrl}?gid=1352179578&single=true&output=csv`).then(res => res.text())
  ]).then(([csvCupons, csvInfos]) => {
    const parsedCupons = Papa.parse(csvCupons, { header: true, skipEmptyLines: true });
    self.cupons(parsedCupons.data.map(item => ({
      cupom: item.Cupom,
      marca: item.Marca,
      desconto: item.Desconto,
      freteGratis: item.Frete === 'Sim',
      regra: item.Regra,
      site: item.Site,
      imagem: item.Imagem
    })));

    const parsedInfos = Papa.parse(csvInfos, { header: true, skipEmptyLines: true });
    const item = parsedInfos.data[0] || {};
    self.infos({
      titulo: item.Título,
      bio: item.Bio,
      instagram: item.Instagram,
      tiktok: item.Tiktok,
      mostrarInfosCargoEmpresa: item.Mostrar_infos_cargo_empresa === 'Sim',
      nome: item.Nome,
      cargo: item.Cargo,
      empresa: item.Empresa
    });
  }).catch(err => {
    console.error('Erro ao carregar dados:', err);
  }).finally(() => {
    self.carregando(false);
  });






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


  self.filtroMarca = ko.observable('');
  self.filtroFrete = ko.observable(false);

  self.cuponsFiltrados = ko.computed(function () {
    return self.cupons().filter(function (item) {
      const passaMarca = !self.filtroMarca() || item.marca === self.filtroMarca();
      const passaFrete = !self.filtroFrete() || item.freteGratis;
      return passaMarca && passaFrete;
    });
  });

  self.marcasDisponiveis = ko.computed(function () {
    const marcas = self.cupons().map(item => item.marca);
    return [...new Set(marcas)].sort();
  });

  self.semResultados = ko.computed(function () {
    return self.cuponsFiltrados().length === 0;
  });




  self.compartilhar = compartilhar;
  self.compartilharPagina = compartilharPagina;

  async function getShareFile() {
    try {
      const response = await fetch('share_image.jpg');
      const blob = await response.blob();
      return new File([blob], 'share_image.jpg', { type: blob.type });
    } catch (err) {
      console.log('Não foi possível carregar imagem de compartilhamento:', err);
      return null;
    }
  }

  async function compartilharPagina() {
    const infosAtual = self.infos();

    const shareData = {
      title: infosAtual.titulo,
      text: infosAtual.bio,
      url: window.location.href
    };

    const file = await getShareFile();
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      shareData.files = [file];
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Compartilhamento cancelado ou falhou:', err);
      }
    }
  }

  async function compartilhar(item) {
    const infosAtual = self.infos();

    const shareData = {
      title: infosAtual.titulo,
      text: `Cupom ${item.cupom} - ${item.desconto} na ${item.marca}!`,
      url: item.site
    };

    const file = await getShareFile();
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      shareData.files = [file];
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Compartilhamento cancelado ou falhou:', err);
      }
    }
  }



}

document.addEventListener('DOMContentLoaded', () => {
  ko.applyBindings(new ViewModel());
});

const botaoTopo = document.getElementById('voltarTopo');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    botaoTopo.classList.add('show');
  } else {
    botaoTopo.classList.remove('show');
  }
});

botaoTopo.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

