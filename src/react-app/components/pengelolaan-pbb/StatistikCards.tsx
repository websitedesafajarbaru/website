import { BarChart3, ChevronUp, ChevronDown, CheckCircle, Target, FileText, Square, Triangle } from "lucide-react"

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
  showStatistics: boolean
  onToggle: () => void
}

export function StatistikCards({ data, showStatistics, onToggle }: StatistikCardsProps) {
  return (
    <div className="card mb-4">
      <div className="card-header" style={{ cursor: "pointer" }} onClick={onToggle}>
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <BarChart3 className="me-2" />
            Statistik PBB
          </h6>
          {showStatistics ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>
      {showStatistics && (
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card border-primary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Total Pajak Terhutang</div>
                      <div className="h4 mb-0 text-primary">Rp {data.totalPajakTerhutang.toLocaleString("id-ID")}</div>
                    </div>
                    <BarChart3 style={{ fontSize: "2.5rem", opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-success h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Total Pajak Terbayar</div>
                      <div className="h4 mb-0 text-success">Rp {data.totalPajakDibayar.toLocaleString("id-ID")}</div>
                    </div>
                    <CheckCircle style={{ fontSize: "2.5rem", opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-info h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Persentase Pembayaran</div>
                      <div className="h4 mb-0 text-info">{data.persentasePembayaran.toFixed(1)}%</div>
                    </div>
                    <Target style={{ fontSize: "2.5rem", opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-secondary h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Total Surat</div>
                      <div className="h4 mb-0 text-secondary">{data.totalSurat}</div>
                    </div>
                    <FileText style={{ fontSize: "2.5rem", opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-success h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Surat Sudah Dibayar</div>
                      <div className="h4 mb-0 text-success">{data.totalSuratDibayar}</div>
                    </div>
                    <Square style={{ fontSize: "2.5rem", opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-warning h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Surat Belum Dibayar</div>
                      <div className="h4 mb-0 text-warning">{data.totalSuratBelumBayar}</div>
                    </div>
                    <Triangle style={{ fontSize: "2.5rem", opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
