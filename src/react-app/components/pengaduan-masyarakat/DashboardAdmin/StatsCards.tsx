import { Aduan } from "../../../types"

interface StatsCardsProps {
  aduan: Aduan[]
}

export function StatsCards({ aduan }: StatsCardsProps) {
  return (
    <div className="row g-0 g-md-1 mb-0">
      <div className="col-md-3">
        <div className="card">
          <div className="card-body p-1 p-md-3">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="text-muted small">Total Aduan</div>
                <div className="h4 mb-0">{aduan.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card">
          <div className="card-body p-1 p-md-3">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="text-muted small">Baru</div>
                <div className="h4 mb-0">{aduan.filter((a) => a.status === "menunggu").length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card">
          <div className="card-body p-1 p-md-3">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="text-muted small">Diproses</div>
                <div className="h4 mb-0">{aduan.filter((a) => a.status === "diproses").length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card">
          <div className="card-body p-1 p-md-3">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="text-muted small">Selesai</div>
                <div className="h4 mb-0">{aduan.filter((a) => a.status === "selesai").length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
