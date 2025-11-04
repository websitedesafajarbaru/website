import React from 'react';

interface CreditPerson {
  name: string;
  nim: string;
  photo: string;
  instagram: string;
  github: string;
}

const creditsData: CreditPerson[] = [
  {
    name: 'Andika Pratama',
    nim: '12345678',
    photo: 'https://placehold.co/150x150',
    instagram: 'https://instagram.com/andika_pratama',
    github: 'https://github.com/andika-pratama'
  },
  {
    name: 'Budi Santoso',
    nim: '12345679',
    photo: 'https://placehold.co/150x150',
    instagram: 'https://instagram.com/budi_santoso',
    github: 'https://github.com/budi-santoso'
  },
  {
    name: 'Citra Dewi',
    nim: '12345680',
    photo: 'https://placehold.co/150x150',
    instagram: 'https://instagram.com/citra_dewi',
    github: 'https://github.com/citra-dewi'
  },
  {
    name: 'Dedi Kurniawan',
    nim: '12345681',
    photo: 'https://placehold.co/150x150',
    instagram: 'https://instagram.com/dedi_kurniawan',
    github: 'https://github.com/dedi-kurniawan'
  },
  {
    name: 'Eka Sari',
    nim: '12345682',
    photo: 'https://placehold.co/150x150',
    instagram: 'https://instagram.com/eka_sari',
    github: 'https://github.com/eka-sari'
  },
  {
    name: 'Fajar Nugroho',
    nim: '12345683',
    photo: 'https://placehold.co/150x150',
    instagram: 'https://instagram.com/fajar_nugroho',
    github: 'https://github.com/fajar-nugroho'
  },
  {
    name: 'Gita Permata',
    nim: '12345684',
    photo: 'https://placehold.co/150x150',
    instagram: 'https://instagram.com/gita_permata',
    github: 'https://github.com/gita-permata'
  },
  {
    name: 'Hadi Wijaya',
    nim: '12345685',
    photo: 'https://placehold.co/150x150',
    instagram: 'https://instagram.com/hadi_wijaya',
    github: 'https://github.com/hadi-wijaya'
  }
];

export function Credits() {
  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">Credits</h1>
      <div className="row g-4">
        {creditsData.map((person, index) => (
          <div key={index} className="col-lg-3 col-md-4 col-sm-6">
            <div className="card h-100 shadow-sm">
              <img src={person.photo} className="card-img-top" alt={person.name} />
              <div className="card-body text-center">
                <h5 className="card-title">{person.name}</h5>
                <p className="card-text text-muted mb-3">NIM: {person.nim}</p>
                <div className="d-flex justify-content-center gap-3">
                  <a href={person.instagram} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    <i className="bi bi-instagram" style={{ fontSize: '1.5rem', color: '#E4405F' }}></i>
                  </a>
                  <a href={person.github} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                    <i className="bi bi-github" style={{ fontSize: '1.5rem', color: '#333' }}></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}