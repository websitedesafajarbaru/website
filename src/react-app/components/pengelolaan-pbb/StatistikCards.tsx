interface StatistikData {
  totalPajakTerhutang: number
  totalPajakDibayar: number
  totalSurat: number
  totalSuratDibayar: number
  totalSuratBelumBayar: number
  persentasePembayaran: number
}

interface StatistikCardsProps {
  data: StatistikData
}

export function StatistikCards({ data }: StatistikCardsProps) {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="bi bi-bar-chart me-2"></i>
            Statistik PBB
          </h6>
        </div>
      </div>
      <div className="card-body">
        <div className="row g-1 g-md-2">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body p-1 p-md-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-muted small mb-1">Total Pajak Terhutang</div>
                    <div className="h4 mb-0">Rp {data.totalPajakTerhutang.toLocaleString("id-ID")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body p-1 p-md-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-muted small mb-1">Total Pajak Terbayar</div>
                    <div className="h4 mb-0">Rp {data.totalPajakDibayar.toLocaleString("id-ID")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body p-1 p-md-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-muted small mb-1">Persentase Pembayaran</div>
                    <div className="h4 mb-0">{data.persentasePembayaran.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body p-1 p-md-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-muted small mb-1">Total Surat</div>
                    <div className="h4 mb-0">{data.totalSurat}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body p-1 p-md-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-muted small mb-1">Surat Sudah Dibayar</div>
                    <div className="h4 mb-0">{data.totalSuratDibayar}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body p-0 p-md-2">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-muted small mb-1">Surat Belum Dibayar</div>
                    <div className="h4 mb-0">{data.totalSuratBelumBayar}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
