import { Aduan } from "../../../types"
import { Box, Clock, CheckCircle } from "lucide-react"

interface StatsCardsProps {
  aduan: Aduan[]
}

export function StatsCards({ aduan }: StatsCardsProps) {
  return (
    <div className="row g-3 mb-3">
      <div className="col-md-3">
        <div className="card">
          <div className="card-body p-3">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="text-muted small">Total Aduan</div>
                <div className="h4 mb-0">{aduan.length}</div>
              </div>
              <Box size={32} className="text-muted" />
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card">
          <div className="card-body p-3">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="text-muted small">Baru</div>
                <div className="h4 mb-0 text-secondary">{aduan.filter((a) => a.status === "menunggu").length}</div>
              </div>
              <Box size={32} className="text-secondary" />
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card">
          <div className="card-body p-3">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="text-muted small">Diproses</div>
                <div className="h4 mb-0 text-warning">{aduan.filter((a) => a.status === "diproses").length}</div>
              </div>
              <Clock size={32} className="text-warning" />
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card">
          <div className="card-body p-3">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <div className="text-muted small">Selesai</div>
                <div className="h4 mb-0 text-success">{aduan.filter((a) => a.status === "selesai").length}</div>
              </div>
              <CheckCircle size={32} className="text-success" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
